import {Interval} from "./Interval.js";

export class IntervalStatic extends Interval {
    interval: number;
    nextTime: number;
    callback: (frameNr: number) => number | undefined | boolean;

    constructor(interval, time, callback) {
        super();
        this.interval = interval;
        this.nextTime = time + interval;
        this.callback = callback;
    }

    //returns false if interval should be destroyed
    check(time) {
        if (time >= this.nextTime) {
            const newInterval = this.callback(time);

            //end interval?
            if (newInterval === false)
                return false;

            //change interval?
            if (newInterval !== undefined && newInterval !== true) {
                this.interval = newInterval;
            }

            //note: we add to nextTime, instead of time, to allow non-integer intervals
            this.nextTime = this.nextTime + this.interval;
        }
        return true;
    }
}
