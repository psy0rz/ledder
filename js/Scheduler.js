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
}
//# sourceMappingURL=Scheduler.js.map