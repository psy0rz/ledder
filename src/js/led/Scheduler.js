import { IntervalControlled } from "./IntervalControlled.js";
import { IntervalStatic } from "./IntervalStatic.js";
export class Scheduler {
    constructor() {
        this.frameNr = 0;
        this.clear();
    }
    clear() {
        this.intervals = [];
    }
    /**
     * Create a new interval
     * @param frames Interval length, specified as the number of frames. Use 1 to get called for each frame.
     * @param callback Return false to end the interval. Return a number to change the interval. Return false to end the interval.
     * @param offset Offset the interval by this number of frames
     */
    interval(frames, callback, offset = 0) {
        return new Promise((resolve, reject) => {
            const interval = new IntervalStatic(frames, this.frameNr + offset, callback);
            interval.resolve = resolve;
            this.intervals.push(interval);
        });
    }
    /**
     * Create a new controlled interval.
     * @param value The controller that sets/modifies the interval.
     * @param callback Return false to end the interval. Return false to end the interval.
     * @param offset Offset the interval by this number of frames
     */
    intervalControlled(value, callback, offset = 0) {
        return new Promise((resolve, reject) => {
            const interval = new IntervalControlled(value, this.frameNr + offset, callback);
            interval.resolve = resolve;
            this.intervals.push(interval);
        });
    }
    // stop(interval: Interval) {
    //
    // }
    //called by matrix on every frame.
    update() {
        this.frameNr++;
        let i = 0;
        while (i < this.intervals.length) {
            try {
                if (!this.intervals[i].check(this.frameNr)) {
                    this.intervals[i].resolve(true);
                    this.intervals.splice(i, 1);
                }
                else
                    i++;
            }
            catch (e) {
                console.error("Exception during animation interval:", e);
                //remove this interval since its broken
                this.intervals.splice(i, 1);
            }
        }
    }
    status() {
        console.log("Scheduler intervals: ", this.intervals.length);
    }
}
//# sourceMappingURL=Scheduler.js.map