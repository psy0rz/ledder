//Parses the schedule.json export pretalx (and other Frab/c3voc-compatible schedule
//tools) produce at "<event>/schedule/export/schedule.json". Only the fields needed
//to show what's on are read; tracks, speakers, links etc. are ignored.

export interface PretalxEvent {
    summary: string
    location: string
    start: Date
    end: Date
}

interface PretalxScheduleRoomEvent {
    title: string
    room: string
    date: string
    end: string
}

interface PretalxScheduleJson {
    schedule: {
        conference: {
            days: Array<{
                rooms: Record<string, PretalxScheduleRoomEvent[]>
            }>
        }
    }
}

//pretalx titles/room names routinely contain unicode punctuation (smart quotes, en/em dashes,
//ellipsis, nbsp, ...) and accented letters that the pixel fonts (mostly plain ASCII bitmaps)
//can't render as anything but a blank glyph.
const UNICODE_PUNCTUATION_TO_ASCII: Record<string, string> = {
    "‘": "'", "’": "'", "‚": "'", "‛": "'",     //single quotes
    "“": "\"", "”": "\"", "„": "\"", "‟": "\"", //double quotes
    "–": "-", "—": "-", "−": "-",                   //en dash, em dash, minus
    "…": "...",                                               //ellipsis
    " ": " ",                                                 //non-breaking space
    "•": "*",                                                 //bullet
}

function toAsciiText(text: string): string {
    let result = text
    for (const [unicodeChar, asciiChar] of Object.entries(UNICODE_PUNCTUATION_TO_ASCII))
        result = result.split(unicodeChar).join(asciiChar)

    //decomposes accented letters so the diacritic can be stripped, e.g. "café" -> "cafe"
    result = result.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")

    //anything still outside printable ASCII (emoji, CJK, ...) has no glyph in the pixel fonts, remove it. (they use lots of emoticons)
    return result.replace(/[^\x20-\x7e]/g, "")
    // return result
}

export function parsePretalxSchedule(json: string): PretalxEvent[] {
    const data = JSON.parse(json) as PretalxScheduleJson
    const events: PretalxEvent[] = []

    for (const day of data.schedule.conference.days) {
        for (const roomEvents of Object.values(day.rooms)) {
            for (const event of roomEvents) {
                events.push({
                    summary: toAsciiText(event.title),
                    location: toAsciiText(event.room),
                    start: new Date(event.date),
                    end: new Date(event.end),
                })
            }
        }
    }

    return events
}
