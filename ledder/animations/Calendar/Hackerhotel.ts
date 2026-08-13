import Animator from "../../Animator.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelBox from "../../PixelBox.js"
import DrawText from "../../draw/DrawText.js"
import {fonts, fontSelect} from "../../fonts.js"
import type ColorInterface from "../../ColorInterface.js"
import {parsePretalxSchedule, type PretalxEvent} from "../../../util/pretalx.js"
import {colorGreen, colorRed, colorWhite} from "../../Colors.js";
import AnimationManager from "../../server/AnimationManager.js";
import FxFlameout from "../../fx/FxFlameout.js";
import {FxFadeOut} from "../../fx/FxFadeOut.js";
import {NodeFetchCache, FileSystemCache, cacheStrategies} from "node-fetch-cache"

const DEFAULT_SCHEDULE_URL = "https://pretalx.hackerhotel.nl/2025/schedule/export/schedule.json"

//the schedule is polled once per showAll loop, so cache it on disk briefly to avoid hammering
//pretalx while still picking up changes within a reasonable time
const fetchSchedule = NodeFetchCache.create({
    cache: new FileSystemCache({cacheDirectory: ".cache/hackerhotel-schedule", ttl: 60000}),

    //never cache error responses, they would stay in the cache for the whole ttl
    shouldCacheResponse: cacheStrategies.cacheOkayOnly
})

export default class Hackerhotel extends Animator {
    static category = "Calendar"
    static title = "Hackerhotel Schedule"
    static description = "Shows events currently going on at Hackerhotel, and what's coming up next, from the live pretalx schedule."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const settingsGroup = controls.group("Settings")
        const scheduleUrl = settingsGroup.input("Schedule URL", DEFAULT_SCHEDULE_URL, true)
        const maxOngoingMinutes = settingsGroup.value("Max ongoing (min)", 30, 1, 240, 1)
        const maxUpcomingMinutes = settingsGroup.value("Max upcoming (min)", 120, 1, 1440, 1)

        //testing aid: replays real events against a past/future conference day. Real time keeps
        //ticking (so countdowns and scrolling behave normally), it just wraps every 24h so the
        //fake day loops forever; the offset shifts which moment of that day "now" starts at.
        const timeSimGroup = controls.group("Time simulation", false, false, true, false)
        const fakeDate = timeSimGroup.input("Fake date (YYYY-MM-DD)", "2025-02-14", true)
        const fakeOffsetMinutes = timeSimGroup.value("Offset from now (min)", 0, -1440, 1440, 1, true)

        const DAY_MS = 24 * 60 * 60000

        function now(): number {
            if (!timeSimGroup.enabled)
                return Date.now()
            const fakeDayStart = new Date(fakeDate.text + "T00:00:00").getTime()
            const wallClockMs = Date.now() + fakeOffsetMinutes.value * 60000
            return fakeDayStart + ((wallClockMs % DAY_MS) + DAY_MS) % DAY_MS
        }

        let events: PretalxEvent[] = []
        let ongoing: PretalxEvent[] = []
        let upcoming: PretalxEvent[] = []

        const fxFlameout=new FxFlameout(scheduler, controls)
        const fxFadeout=new FxFadeOut(scheduler, controls,20)

        // const animationBox=new PixelBox(box)
        // box.add(animationBox)
        const animationManager=new AnimationManager(box, scheduler, controls.group("Sub animations"))


        //keeps only the first (earliest) event per location, preserving order
        function firstPerLocation(list: PretalxEvent[]): PretalxEvent[] {
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
                console.log("Fetching events...")
                const response = await fetchSchedule(scheduleUrl.text)
                if (!response.ok) {
                    console.error("Hackerhotel: HTTP error", response.status, response.statusText)
                    return
                }
                events = parsePretalxSchedule(await response.text())

                const nowMs = now()

                ongoing = firstPerLocation(events
                    .filter(e => e.start.getTime() <= nowMs && e.end.getTime() > nowMs && nowMs - e.start.getTime() < maxOngoingMinutes.value * 60000)
                    .sort((a, b) => a.start.getTime() - b.start.getTime()))

                upcoming = firstPerLocation(events
                    .filter(e => e.start.getTime() > nowMs && e.start.getTime() - nowMs < maxUpcomingMinutes.value * 60000)
                    .sort((a, b) => a.start.getTime() - b.start.getTime()))

            } catch (error) {
                console.error("Hackerhotel: fetch/parse error:", error)
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

        async function show(event: PretalxEvent, ongoing: boolean)
        {
            const nowMs = now()

            const titleColor=colorWhite.copy()
            const titlePixels=new DrawText(0,0, fontSelect(controls), ongoing ? "Now at:" : "Next:", titleColor)
            box.add(titlePixels)

            //what??
            const summaryPixels=new DrawText(box.width(), 16, fontSelect(controls), event.summary, colorWhite)
            box.add(summaryPixels)

            //when??
            let timeTxt=formatCountdown(ongoing ? nowMs - event.start.getTime() : event.start.getTime() - nowMs)
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
                    await animationManager.select("Logos/ledder/default", false)
                    await scheduler.delayTime(6)
                    break
                case 1:
                    await animationManager.select("RemotePictures/rickroll", false)
                    await scheduler.delay(40)
                    break
                case 2:
                    await animationManager.select("Text/Marquee/ledder", false)
                    await scheduler.delay(160)
                    break
            }

            animationManager.stop(true)
            currentAnimations = (currentAnimations + 1) % 3
        }

            fetchEvents()

        while(1)
        {
            //async in background
            fetchEvents()

           // await showRandomstuff()

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
