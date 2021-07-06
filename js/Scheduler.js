class Interval {
    constructor(interval, time, callback) {
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
export class Scheduler {
    constructor() {
        this.frameNr = 0;
        this.intervals = [];
    }
    /**
     * Create a new interval
     * @param frames Interval length, specified as the number of frames. Use 1 to get called for each frame.
     * @param callback Return false to end the interval. Return a number to change the interval. (Otherwise return true or undefined to keep running.)
     */
    interval(frames, callback) {
        const interval = new Interval(frames, this.frameNr, callback);
        this.intervals.push(interval);
        return (interval);
    }
    stop(interval) {
    }
    //called by matrix on every frame.
    update() {
        this.frameNr++;
        let i = 0;
        while (i < this.intervals.length) {
            if (!this.intervals[i].check(this.frameNr)) {
                this.intervals.splice(i, 1);
            }
            else
                i++;
        }
    }
    status() {
        console.log("Scheduler intervals: ", this.intervals.length);
    }
}
//# sourceMappingURL=Scheduler.js.map