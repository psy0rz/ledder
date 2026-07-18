import Animator from "../../Animator.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelBox from "../../PixelBox.js"
import DrawText from "../../draw/DrawText.js"
import {fonts, fontSelect} from "../../fonts.js"
import type ColorInterface from "../../ColorInterface.js"
import {parseICS, type IcsEvent} from "../../../util/ics.js"
import Marquee from "../Text/Marquee.js";
import {colorGreen, colorRed, colorWhite, colorYellow} from "../../Colors.js";

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
        // scheduler.setFps(30)
        const settingsGroup = controls.group("Settings")
        const icsUrl = settingsGroup.input("ICS URL", DEFAULT_ICS_URL, true)
        const maxOngoingMinutes = settingsGroup.value("Max ongoing (min)", 30, 1, 240, 1)
        const maxUpcomingMinutes = settingsGroup.value("Max upcoming (min)", 120, 1, 1440, 1)

            const fpsControl = controls.value("FPS", 60, 1, 120, 1)
            fpsControl.onChange(() => {
                scheduler.setFps(fpsControl.value)
            })


        let events: IcsEvent[] = []
        let ongoing: IcsEvent[] = []
        let upcoming: IcsEvent[] = []

        //keeps only the first (earliest) event per location, preserving order
        function firstPerLocation(list: IcsEvent[]): IcsEvent[] {
            const seen = new Set<string>()
            return list.filter(e => {
                if (seen.has(e.location))
                    return false
                seen.add(e.location)
                return true
            })
        }

        async function fetchEvents() {
            try {
                scheduler.stop()
                const response = await fetch(icsUrl.text)
                scheduler.resume()
                if (!response.ok) {
                    console.error("BornhackSchedule: HTTP error", response.status, response.statusText)
                    return
                }
                events = parseICS(await response.text())

                const now = Date.now()

                ongoing = firstPerLocation(events
                    .filter(e => e.start.getTime() <= now && e.end.getTime() > now && now - e.start.getTime() < maxOngoingMinutes.value * 60000)
                    .sort((a, b) => a.start.getTime() - b.start.getTime()))

                upcoming = firstPerLocation(events
                    .filter(e => e.start.getTime() > now && e.start.getTime() - now < maxUpcomingMinutes.value * 60000)
                    .sort((a, b) => a.start.getTime() - b.start.getTime()))

            } catch (error) {
                scheduler.resume()
                console.error("BornhackSchedule: fetch/parse error:", error)
            }
        }

        function formatCountdown(ms: number): string {
            const totalMinutes = Math.max(0, Math.round(ms / 60000))
            if (totalMinutes < 1)
                return "now"
            if (totalMinutes < 60)
                return `${totalMinutes}m`
            return `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}`
        }

        async function show(event:IcsEvent, ongoing:boolean)
        {
            const now = Date.now()

            box.clear()

            if (ongoing)
                box.add(new DrawText(0,0, fontSelect(controls), `Now at:`, colorWhite))
            else
                box.add(new DrawText(0,0, fontSelect(controls), `Next:`, colorWhite))

            //what??
            const summaryPixels=new DrawText(64, 16, fontSelect(controls), event.summary, colorWhite)
            box.add(summaryPixels)


            //location
            box.add(new DrawText(0,8, fontSelect(controls), event.location, colorGreen))

            //time
            if (ongoing) {
                const timeTxt=`${formatCountdown(now - event.start.getTime())} past`
                box.add(new DrawText(0, 24, fontSelect(controls),timeTxt , colorRed))
            }
            else
            {
                const timeTxt=`in ${formatCountdown(event.start.getTime() - now )}`
                box.add(new DrawText(0, 24, fontSelect(controls),timeTxt , colorGreen))

            }

            // await scheduler.delayTime(2)
            //scroll until end
            let scrollNeeded=summaryPixels.bbox().xMax+1
            await scheduler.interval(1, ()=>{

                summaryPixels.move(-1,0)
                scrollNeeded=scrollNeeded-1
                return (scrollNeeded!=0)

            })



        }

        async function showAll()
        {

            for (const event of ongoing)
            {
                await show(event, true)
            }

            for (const event of upcoming)
            {
                await show(event, false)
            }


        }

        let lastUpdate=Date.now()
        while(1)
        {
            lastUpdate=Date.now()
            await fetchEvents()
            while (Date.now()-lastUpdate<60000) {
                await showAll()
                await scheduler.delayTime(1)
            }

        }
    }
}
