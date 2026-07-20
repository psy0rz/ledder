import Animator from "../../Animator.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelBox from "../../PixelBox.js"
import DrawText from "../../draw/DrawText.js"
import {fonts, fontSelect} from "../../fonts.js"
import type ColorInterface from "../../ColorInterface.js"
import {parseICS, type IcsEvent} from "../../../util/ics.js"
import {colorGreen, colorRed, colorWhite} from "../../Colors.js";
import AnimationManager from "../../server/AnimationManager.js";
import FxFlameout from "../../fx/FxFlameout.js";
import {FxFadeOut} from "../../fx/FxFadeOut.js";

const DEFAULT_ICS_URL = "https://bornhack.dk/bornhack-2026/program/ics/"

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

        const fxFlameout=new FxFlameout(scheduler, controls)
        const fxFadeout=new FxFadeOut(scheduler, controls,20)

        // const animationBox=new PixelBox(box)
        // box.add(animationBox)
        const animationManager=new AnimationManager(box, scheduler, controls.group("Sub animations"))


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
                console.error("BornhackSchedule: fetch/parse error:", error)
            }
            finally {
                scheduler.resume()
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

            const titleColor=colorWhite.copy()
            const titlePixels=new DrawText(0,0, fontSelect(controls), ongoing ? "Now at:" : "Next:", titleColor)
            box.add(titlePixels)

            //what??
            const summaryPixels=new DrawText(box.width(), 16, fontSelect(controls), event.summary, colorWhite)
            box.add(summaryPixels)

            //when??
            let timeTxt=formatCountdown(ongoing ? now - event.start.getTime() : event.start.getTime() - now)
            if (timeTxt!="now")
                timeTxt=ongoing ? timeTxt+" past" : "in "+timeTxt
            const whenColor=(ongoing ? colorRed : colorGreen).copy()
            const whenPixels=new DrawText(0, 24, fontSelect(controls),timeTxt , whenColor)
            box.add(whenPixels)

            //where??
            const locationPixels=new DrawText(box.width(),8, fontSelect(controls), event.location, colorGreen)
            box.add(locationPixels)

            //slide in
            let scrollNeeded= box.width()
            await scheduler.interval(1, ()=>{
                const amount=4
                locationPixels.move(-amount,0)
                scrollNeeded=scrollNeeded-amount
                return (scrollNeeded>0)
            })

            // scroll until end
            scrollNeeded=summaryPixels.bbox().xMax+1
            await scheduler.interval(1, ()=>{

                summaryPixels.move(-1,0)
                scrollNeeded=scrollNeeded-1
                return (scrollNeeded!=0)

            }).then( ()=> box.delete(summaryPixels))

            fxFlameout.run(locationPixels,false).then (()=> box.delete(locationPixels))
            fxFadeout.run(titleColor).then(()=> box.delete(titlePixels))
            fxFadeout.run(whenColor).then(()=> box.delete(whenPixels))


        }

        async function showAll()
        {
            if (ongoing.length || upcoming.length) {
                for (const event of ongoing) {
                    await show(event, true)
                }

                for (const event of upcoming) {
                    await show(event, false)
                }

            }
            else
            {
                box.add(new DrawText(0, 0, fontSelect(controls), "No events", colorRed))
                await scheduler.delayTime(2)
                box.clear()
            }
        }


        let currentAnimations=0

        async function showRandomstuff() {

            switch (currentAnimations) {
                case 0:
                    await animationManager.select("RemotePictures/rickroll", false)
                    await scheduler.delay(40)
                    // await scheduler.delayTime(1)
                    break
                case 1:
                    await animationManager.select("Text/Marquee/ledder", false)
                    await scheduler.delay(160)
                    break
            }

            animationManager.stop(true)
            currentAnimations = (currentAnimations + 1) % 2
        }

            fetchEvents()

        while(1)
        {
            //async in background
            fetchEvents()

           await showRandomstuff()

            //loop showall for a while
            const lastUpdate=Date.now()
            while (Date.now()-lastUpdate<60000) {
                await showAll()
            }

            //give fx time to playout
            await scheduler.delayTime(1)

        }
    }
}
