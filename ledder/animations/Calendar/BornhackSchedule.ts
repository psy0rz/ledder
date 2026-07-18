import Animator from "../../Animator.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelBox from "../../PixelBox.js"
import DrawText from "../../draw/DrawText.js"
import {fontSelect} from "../../fonts.js"
import type ColorInterface from "../../ColorInterface.js"
import {parseICS, type IcsEvent} from "../../../util/ics.js"

const DEFAULT_ICS_URL = "https://bornhack.dk/bornhack-2026/program/ics/"

interface Segment {
    text: string
    color: ColorInterface
}

export default class BornhackSchedule extends Animator {
    static category = "Calendar"
    static title = "BornHack Schedule"
    static description = "Shows events currently going on at BornHack, and what's coming up next, from the live BornHack ICS feed."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const settingsGroup = controls.group("Settings")
        const icsUrl = settingsGroup.input("ICS URL", DEFAULT_ICS_URL, true)
        const refreshInterval = settingsGroup.value("Refresh interval (min)", 1, 1, 60, 1)
        const maxUpcoming = settingsGroup.value("Max upcoming events", 3, 1, 10, 1)
        const showLocation = settingsGroup.switch("Show location", true)

        const visualGroup = controls.group("Visual")
        const scrollSpeed = visualGroup.value("Scroll speed", 2, 1, 10, 0.5)
        const labelColor = visualGroup.color("Label color", 128, 128, 128)
        const nowColor = visualGroup.color("Now color", 0, 255, 0)
        const nextColor = visualGroup.color("Next color", 255, 255, 255)
        const separatorColor = visualGroup.color("Separator color", 80, 80, 80)

        const width = box.width()
        const height = box.height()

        let events: IcsEvent[] = []
        let lastFetch = 0
        let scrollOffset = 0

        async function fetchEvents() {
            try {
                const response = await fetch(icsUrl.text)
                if (!response.ok) {
                    console.error("BornhackSchedule: HTTP error", response.status, response.statusText)
                    return
                }
                events = parseICS(await response.text())
            } catch (error) {
                console.error("BornhackSchedule: fetch/parse error:", error)
            }
        }

        function formatCountdown(ms: number): string {
            const totalMinutes = Math.max(0, Math.round(ms / 60000))
            if (totalMinutes < 1)
                return "now"
            if (totalMinutes < 60)
                return `${totalMinutes}m`
            return `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m`
        }

        function eventLabel(event: IcsEvent): string {
            if (showLocation.enabled && event.location)
                return `${event.summary} (${event.location})`
            return event.summary
        }

        //picks currently running and next upcoming events out of the full feed, relative to "now"
        function buildSegments(): Segment[] {
            const now = Date.now()

            const ongoing = events
                .filter(e => e.start.getTime() <= now && e.end.getTime() > now)
                .sort((a, b) => a.start.getTime() - b.start.getTime())

            const upcoming = events
                .filter(e => e.start.getTime() > now)
                .sort((a, b) => a.start.getTime() - b.start.getTime())
                .slice(0, maxUpcoming.value)

            if (ongoing.length === 0 && upcoming.length === 0) {
                const text = events.length === 0 ? "Loading BornHack schedule..." : "No events found"
                return [{text, color: labelColor}]
            }

            const segments: Segment[] = []

            if (ongoing.length > 0) {
                segments.push({text: "NOW: ", color: labelColor})
                ongoing.forEach((event, i) => {
                    segments.push({text: eventLabel(event), color: nowColor})
                    if (i < ongoing.length - 1)
                        segments.push({text: "  &  ", color: separatorColor})
                })
            }

            if (upcoming.length > 0) {
                if (segments.length > 0)
                    segments.push({text: "   |   ", color: separatorColor})
                segments.push({text: "NEXT: ", color: labelColor})
                upcoming.forEach((event, i) => {
                    const countdown = formatCountdown(event.start.getTime() - now)
                    segments.push({text: `${eventLabel(event)} in ${countdown}`, color: nextColor})
                    if (i < upcoming.length - 1)
                        segments.push({text: "   |   ", color: separatorColor})
                })
            }

            return segments
        }

        await fetchEvents()
        lastFetch = Date.now()

        const font = fontSelect(controls)
        await font.load()

        scheduler.intervalControlled(scrollSpeed, () => {

            const now = Date.now()
            if (now - lastFetch > refreshInterval.value * 60 * 1000) {
                lastFetch = now
                //fire and forget: don't stall the render loop on the network fetch
                fetchEvents()
            }

            box.clear()

            const segments = buildSegments()
            const totalWidth = segments.reduce((sum, s) => sum + s.text.length * font.width, 0)

            const yPos = Math.floor((height - font.height) / 2)
            let x = width - scrollOffset
            for (const segment of segments) {
                box.add(new DrawText(x, yPos, font, segment.text, segment.color))
                x += segment.text.length * font.width
            }

            scrollOffset += 1
            if (scrollOffset > totalWidth + width)
                scrollOffset = 0

            return true
        })
    }
}
