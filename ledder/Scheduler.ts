//schedules updates for animations, based on frame-updates from the display.

import IntervalControlled from "./IntervalControlled.js"
import IntervalStatic from "./IntervalStatic.js"
import Interval from "./Interval.js"
import ValueInterface from "./ValueInterface.js"
import IntervalOnce from "./IntervalOnce.js"

export default class Scheduler {

    private frameNr: number
    private intervals: Set<Interval>
    private frameTimeMicros: number
    private defaultFrameTimeMicros: number
    private onCleanupCallbacks: any[]
    private childScheduler: Scheduler


    constructor() {

        this.childScheduler = undefined
        this.intervals = new Set()
        this.onCleanupCallbacks = []
        this.clear()

    }

    //Create independent child scheduler. Every scheduler can have one child. (which in turn can have another one)
    //A clear() detaches the child.
    //Functions that get call from "higher up", will be pushed down to the child. (things like step() and setFps())
    //Functions that get called from "below" (this user/anmations), operate only on this scheduler.
    child() {
        if (this.childScheduler !== undefined)
            throw ("Scheduler already has child")

        this.childScheduler = new Scheduler()
        this.childScheduler.setDefaultFrameTime(this.defaultFrameTimeMicros)
        this.childScheduler.setFrameTimeuS(this.frameTimeMicros)
        return(this.childScheduler)
    }


    //clear all intervals
    public clear() {

        for (const callback of this.onCleanupCallbacks) {
            try {
                callback()

            } catch (e) {
                console.error("onCleanup error:", e)
            }
        }
        this.onCleanupCallbacks = []



        this.frameNr = 0
        this.setFrameTimeuS(this.defaultFrameTimeMicros)
        this.intervals.clear()

        if (this.childScheduler)
            this.childScheduler.clear()
        this.childScheduler = undefined

    }


    /* Never call this directly. Set by renderer
     * Default frametime thats set after a clear().
     */
    public setDefaultFrameTime(frameTimeMicros) {

        this.defaultFrameTimeMicros = frameTimeMicros
        this.setFrameTimeuS(frameTimeMicros)

        if (this.childScheduler)
            this.childScheduler.setDefaultFrameTime(frameTimeMicros)
    }

    //called by renderloop on every frame.
    //Dont call this directly!
    //Returns time in uS until next frame should be rendered.
    public step() {

        this.frameNr++

        for (const interval of this.intervals) {
            try {
                if (!interval.check(this.frameNr)) {

                    interval.resolve(true)
                    this.intervals.delete(interval)
                }
            } catch (e) {
                console.error("Exception during animation interval:", e)
                //remove this interval since its broken
                this.intervals.delete(interval)
            }
        }

        //child fps takes precedence
        if (this.childScheduler)
            return this.childScheduler.step()
        else
            return this.frameTimeMicros

    }

    public getStats() {
        let ret = `Scheduler: ${this.intervals.size}`

        if (this.childScheduler)
            ret = ret + '\n' + this.childScheduler.getStats()

        return (ret)
    }


    /*******************************************************
     * Stuff thats called by the user/animation starts here:
     *******************************************************/

    /*
     * Sets FPS, by specifying the frametime in whole uS.
     * The actual FPS depends on the display driver. Some use rounding, and most have maximum limits.
     * Set to 0 to use default FPS of display driver
     */
    public setFrameTimeuS(frameTimeMicros) {
        this.frameTimeMicros = ~~frameTimeMicros

    }
    /*
     * Same as above but in fps
     */
    public setFps(fps) {
        this.setFrameTimeuS(1000000 / fps)
    }


    //Use this to do cleanup stuff in your animation. (like closing connections or other external stuff)
    onCleanup(callback) {

        this.onCleanupCallbacks.push(callback)
    }

    /**
     * Create a new interval
     * The promise is resolved when callback() returns false, ending the interval loop
     * @param frames Interval length, specified as the number of frames. Use 1 to get called for each frame.
     * @param callback Return false to end the interval. Return a number to change the interval.
     * @param offset Offset the interval by this number of frames
     */
    public interval(frames: number, callback: (frameNr: number) => number | void | boolean, offset = 0): Promise<any> {

        const interval = new IntervalStatic(frames, this.frameNr + offset, callback)
        this.intervals.add(interval)
        return (interval.createPromise())
    }


    /**
     * Create a new controlled interval.
     * The promise is resolved when callback() returns false, ending the interval loop
     * @param value The controller that sets/modifies the interval.
     * @param callback Return false to end the interval.
     * @param offset Offset the interval by this number of frames
     */
    public intervalControlled(value: ValueInterface, callback: (frameNr: number) => number | void | boolean, offset = 0): Promise<any> {
        const interval = new IntervalControlled(value, this.frameNr + offset, callback)
        this.intervals.add(interval)
        return (interval.createPromise())
    }

    /**
     * Delay by returning a promise you should await for.
     * @param frames Delay length, specified as the number of frames.
     */
    public delay(frames): Promise<any> {
        if (frames == 0)
            return

        const interval = new IntervalOnce(frames, this.frameNr)
        this.intervals.add(interval)
        return (interval.createPromise())
    }


}
