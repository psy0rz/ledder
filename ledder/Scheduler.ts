//schedules updates for animations, based on frame-updates from the display.
import IntervalControlled from "./IntervalControlled.js"
import IntervalStatic from "./IntervalStatic.js"
import Interval from "./Interval.js"
import ValueInterface from "./ValueInterface.js"
import IntervalOnce from "./IntervalOnce.js"


export default class Scheduler {

    private frameNr: number
    private intervals: Set<Interval>

    // private resolve: (value: boolean) => void
    // private reject: (reason?: any) => void
    // public finished: Promise<any>


    constructor() {


        this.clear()

    }


    public clear() {

        this.intervals = new Set()
        this.frameNr = 0

        // if (this.resolve !== undefined)
        //     this.resolve(true)
        //
        // this.finished = new Promise((resolve, reject) => {
        //     this.resolve = resolve
        //     this.reject = reject
        // })

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


    //called by renderloop on every frame.
    //Dont call this directly!
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

    }

    public status() {
        console.log("Scheduler intervals: ", this.intervals.size)
    }
}
