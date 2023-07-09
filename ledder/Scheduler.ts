//schedules updates for animations, based on frame-updates from the display.

import IntervalControlled from "./IntervalControlled.js"
import IntervalStatic from "./IntervalStatic.js"
import Interval from "./Interval.js"
import ValueInterface from "./ValueInterface.js"
import IntervalOnce from "./IntervalOnce.js"
import PublicPromise from "./PublicPromise.js"
import {clearTimeout} from "timers"




export default class Scheduler {

    private frameNr: number
    private intervals: Set<Interval>
    private frameTimeMicros: number
    private defaultFrameTimeMicros: number
    private onCleanupCallbacks: any[]
    private childScheduler: Scheduler

    private stopCount: number
    public __resumePromise: PublicPromise<boolean>

    constructor() {

        this.childScheduler = undefined
        this.intervals = new Set()
        this.onCleanupCallbacks = []
        this.stopCount=0
        this.__resumePromise=new PublicPromise<boolean>()
        this.__clear()

    }



    //clear all intervals and detach childs
    public __clear() {
        this.__resumePromise.resolve(false)
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
            this.childScheduler.__clear()
        this.childScheduler = undefined

        this.stopCount=0


    }


    /* Never call this directly. Set by renderer
     * Default frametime thats set after a clear().
     * Note that this is also the maximum fps that can be set by an animation.
     */
    public __setDefaultFrameTime(frameTimeMicros) {
        this.defaultFrameTimeMicros = frameTimeMicros
        this.setFrameTimeuS(frameTimeMicros)

        if (this.childScheduler)
            this.childScheduler.__setDefaultFrameTime(frameTimeMicros)
    }

    //called by renderloop on every frame.
    //Dont call this directly!
    //Returns time in uS until next frame should be rendered.
    public async __step(realtime:boolean) {

        if (!realtime && this.stopCount!==0) {
            let timeout=setTimeout( ()=>{
                console.warn("Warning: scheduler is paused for a long time, did you forget to call scheduler.resume() ?")
            },1000)
            await this.__resumePromise.promise
            clearTimeout(timeout)
        }

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
            return await this.childScheduler.__step(realtime)
        else
            return this.frameTimeMicros

    }

    public __getStats() {
        let ret = `Scheduler: ${this.intervals.size}`

        if (this.childScheduler)
            ret = ret + '\n' + this.childScheduler.__getStats()

        return (ret)
    }


    // //returns true if this and child are empty
    // public isEmpty()
    // {
    //     if (this.intervals.size!==0)
    //         return false
    //
    //     if (this.childScheduler)
    //         return this.childScheduler.isEmpty()
    //
    //     return true
    // }



    /*******************************************************
     * Stuff thats called by the user/animation starts here:
     *******************************************************/

    /*
     * Sets FPS, by specifying the frametime in whole uS.
     * The actual FPS depends on the display driver. Some use rounding, and most have maximum limits.
     * Set to 0 to use default FPS of display driver
     */
    public setFrameTimeuS(frameTimeMicros) {
        if (frameTimeMicros < this.defaultFrameTimeMicros)
            this.frameTimeMicros = this.defaultFrameTimeMicros
        else
            this.frameTimeMicros = ~~frameTimeMicros

    }

    /*
     * Same as above but in fps
     * The actual FPS depends on the display driver. Some use rounding, and most have maximum limits.
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

    /** Temporary stop the scheduler. Use when you do external async stuff. (like loading a file)
     * Can be called multiple times. Resume has to called the same amount of times.
     */
    public stop()
    {
        //start with fresh promise
        if (this.stopCount===0)
            this.__resumePromise=new PublicPromise<boolean>()

        this.stopCount++
        // console.log("STOP", this.stopCount)
    }

    /** Resume the scheduler
     *
     */
    public resume()
    {
        if (this.stopCount>0) {
            this.stopCount--
        // console.log("RESUME", this.stopCount)
            if (this.stopCount===0)
                this.__resumePromise.resolve(true)
        }
        else
        {
            console.warn("Called Scheduler.resume() too many times!")
        }
    }

    //Create independent child scheduler. Every scheduler can have one child. (which in turn can have another one)
    //A clear() detaches the child.
    //Functions that get call from "higher up", will be pushed down to the child. (things like step() and setFps())
    //Functions that get called from "below" (this user/anmations), operate only on this scheduler.
    //Use this if you created a new AnimationManager. Pass the child scheduler to it.
    child() {
        if (this.childScheduler !== undefined)
            throw ("Scheduler already has child")

        this.childScheduler = new Scheduler()
        this.childScheduler.__setDefaultFrameTime(this.defaultFrameTimeMicros)
        this.childScheduler.setFrameTimeuS(this.frameTimeMicros)
        return (this.childScheduler)
    }


}
