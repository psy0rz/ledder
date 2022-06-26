//schedules updates for animations, based on frame-updates from the matrix.
import {IntervalControlled} from "./IntervalControlled.js";
import {IntervalStatic} from "./IntervalStatic.js";
import {Interval} from "./Interval.js";
import {ValueInterface} from "./ValueInterface.js";
import {IntervalOnce} from "./IntervalOnce.js";
import {ControlGroup} from "./ControlGroup.js";


export class Scheduler {

    frameNr: number;
    intervals: Set<Interval>
    // private controls: PresetControl

    constructor() {
        this.frameNr = 0;
        this.intervals = new Set()
        // this.controls=controls

    }

    //abort handler for exceptions
    // abortHandler(e) {
    //
    //     if (e != 'abort')
    //         console.error("Interval: Promise was rejected: ", e)
    //     else {
    //
    //         console.log("aborted")
    //     }
    // }


    clear() {
        //install exception handlers on all promises first. (in case they dont have one yet)
        // for (const interval of this.intervals) {
        //     //interval.promise.catch(this.abortHandler)
        // }

        //now abort them all. this causes loops etc to be aborted as well. (since await will raise an error)
        // for (const interval of this.intervals)
        // {
            //console.log("ABORTING", interval)
               // interval.reject("abort")
        // }

        this.intervals = new Set()
        this.frameNr=0
    }

    /**
     * Create a new interval
     * @param frames Interval length, specified as the number of frames. Use 1 to get called for each frame.
     * @param callback Return false to end the interval. Return a number to change the interval.
     * @param offset Offset the interval by this number of frames
     */
    interval(frames: number, callback: (frameNr: number) => number | void | boolean, offset = 0): Promise<any> {

        const interval = new IntervalStatic(frames, this.frameNr + offset, callback);
        this.intervals.add(interval);
        return (interval.createPromise())
    }


    /**
     * Create a new controlled interval.
     * @param value The controller that sets/modifies the interval.
     * @param callback Return false to end the interval.
     * @param offset Offset the interval by this number of frames
     */
    intervalControlled(value: ValueInterface, callback: (frameNr: number) => number | void | boolean, offset = 0): Promise<any> {
        const interval = new IntervalControlled(value, this.frameNr + offset, callback);
        this.intervals.add(interval);
        return (interval.createPromise())
    }

    delay(frames): Promise<any> {
        if (frames==0)
            return

        const interval = new IntervalOnce(frames, this.frameNr);
        this.intervals.add(interval);
        return (interval.createPromise())
    }


    //called by renderloop on every frame.
    step() {
        this.frameNr++;

        let i = 0;
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

    status() {
        console.log("Scheduler intervals: ", this.intervals.size);
    }
}
