//schedules updates for animations, based on frame-updates from the matrix.
import {IntervalControlled} from "./IntervalControlled.js";
import {IntervalStatic} from "./IntervalStatic.js";
import {Interval} from "./Interval.js";
import {ValueInterface} from "./ValueInterface.js";
import {IntervalOnce} from "./IntervalOnce.js";


export class Scheduler {

    frameNr: number;
    intervals: Array<Interval>

    constructor() {
        this.frameNr = 0;
        this.intervals=[]

    }

    clear() {
        for (const interval of this.intervals) {
            interval.resolve(false)
        }
        this.intervals=[]
    }

    /**
     * Create a new interval
     * @param frames Interval length, specified as the number of frames. Use 1 to get called for each frame.
     * @param callback Return false to end the interval. Return a number to change the interval.
     * @param offset Offset the interval by this number of frames
     */
    interval(frames: number, callback: (frameNr: number) => number | void | boolean, offset = 0): Promise<any> {

        const interval = new IntervalStatic(frames, this.frameNr + offset, callback);
        this.intervals.push(interval);
        return (interval.promise())
    }


    /**
     * Create a new controlled interval.
     * @param value The controller that sets/modifies the interval.
     * @param callback Return false to end the interval.
     * @param offset Offset the interval by this number of frames
     */
    intervalControlled(value: ValueInterface, callback: (frameNr: number) => number | void | boolean, offset = 0): Promise<any> {
        const interval = new IntervalControlled(value, this.frameNr + offset, callback);
        this.intervals.push(interval);
        return (interval.promise())
    }

    delay(frames): Promise<any> {
        const interval = new IntervalOnce(frames, this.frameNr);
        this.intervals.push(interval);
        return (interval.promise())
    }

    //called by matrix on every frame.
    update() {
        this.frameNr++;

        let i = 0;
        while (i < this.intervals.length) {
            try {
                if (!this.intervals[i].check(this.frameNr)) {

                    this.intervals[i].resolve(true)
                    this.intervals.splice(i, 1);
                } else
                    i++;
            } catch (e) {
                console.error("Exception during animation interval:", e)
                //remove this interval since its broken
                this.intervals[i].resolve(false)
                this.intervals.splice(i, 1);
            }
        }
    }

    status() {
        console.log("Scheduler intervals: ", this.intervals.length);
    }
}
