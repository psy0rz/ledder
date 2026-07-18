//Minimal RFC5545 (iCalendar) parser: extracts VEVENT SUMMARY/LOCATION/DTSTART/DTEND.
//Not a full implementation: no RRULE/recurrence expansion, no VALARM, no timezone VTIMEZONE
//block parsing (TZID is resolved via the environment's IANA timezone database instead).

export interface IcsEvent {
    summary: string
    location?: string
    start: Date
    end: Date
}

function unescapeText(s: string): string {
    return s
        .replace(/\\n/gi, "\n")
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .replace(/\\\\/g, "\\")
}

//joins RFC5545 folded lines (continuation lines start with a space or tab)
function unfoldLines(ics: string): string[] {
    const rawLines = ics.split(/\r\n|\n|\r/)
    const lines: string[] = []
    for (const line of rawLines) {
        if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0)
            lines[lines.length - 1] += line.slice(1)
        else
            lines.push(line)
    }
    return lines
}

//offset (in minutes) of an IANA timezone at a given instant, e.g. accounting for DST
function getTzOffsetMinutes(tz: string, date: Date): number {
    const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hourCycle: "h23",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
    })
    const map: Record<string, string> = {}
    for (const part of dtf.formatToParts(date))
        map[part.type] = part.value

    const asUtc = Date.UTC(+map.year, +map.month - 1, +map.day, +map.hour, +map.minute, +map.second)
    return (asUtc - date.getTime()) / 60000
}

//converts a wall-clock time in a given IANA timezone to a UTC Date
function zonedTimeToUtc(y: number, mo: number, d: number, h: number, mi: number, s: number, tz: string): Date {
    let utc = Date.UTC(y, mo - 1, d, h, mi, s)
    //two passes is enough to converge, since the offset only changes across a DST transition
    for (let i = 0; i < 2; i++) {
        const offset = getTzOffsetMinutes(tz, new Date(utc))
        utc = Date.UTC(y, mo - 1, d, h, mi, s) - offset * 60000
    }
    return new Date(utc)
}

//parses DTSTART/DTEND-style values, e.g. "20260715T120000Z" or "20260715T120000" with TZID param
function parseIcsDate(value: string, params: Record<string, string>): Date | undefined {
    const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/)
    if (!m)
        return undefined

    const [, y, mo, d, h = "0", mi = "0", s = "0", z] = m
    if (z || !params.TZID)
        return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s))

    return zonedTimeToUtc(+y, +mo, +d, +h, +mi, +s, params.TZID)
}

//parses a single "NAME;PARAM=VAL:VALUE" content line into {name, params, value}
function parseLine(line: string): { name: string, params: Record<string, string>, value: string } | undefined {
    const colonIndex = line.indexOf(":")
    if (colonIndex === -1)
        return undefined

    const head = line.slice(0, colonIndex)
    const value = line.slice(colonIndex + 1)
    const parts = head.split(";")
    const name = parts[0].toUpperCase()

    const params: Record<string, string> = {}
    for (let i = 1; i < parts.length; i++) {
        const eq = parts[i].indexOf("=")
        if (eq !== -1)
            params[parts[i].slice(0, eq).toUpperCase()] = parts[i].slice(eq + 1)
    }

    return {name, params, value}
}

export function parseICS(ics: string): IcsEvent[] {
    const events: IcsEvent[] = []
    let current: Partial<IcsEvent> | undefined

    for (const line of unfoldLines(ics)) {
        const parsed = parseLine(line)
        if (!parsed)
            continue

        if (parsed.name === "BEGIN" && parsed.value === "VEVENT") {
            current = {}
        } else if (parsed.name === "END" && parsed.value === "VEVENT") {
            if (current && current.summary && current.start && current.end)
                events.push(current as IcsEvent)
            current = undefined
        } else if (current) {
            switch (parsed.name) {
                case "SUMMARY":
                    current.summary = unescapeText(parsed.value)
                    break
                case "LOCATION":
                    current.location = unescapeText(parsed.value)
                    break
                case "DTSTART":
                    current.start = parseIcsDate(parsed.value, parsed.params)
                    break
                case "DTEND":
                    current.end = parseIcsDate(parsed.value, parsed.params)
                    break
            }
        }
    }

    return events
}
