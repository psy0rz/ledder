class Interval {
    constructor(interval, time, repeat, callback) {
        this.interval = interval;
        this.repeat = repeat;
        this.nextTime = time + interval;
        this.callback = callback;
    }
    check(time) {
        if (time >= this.nextTime) {
            //note: this also allows for non-interger interval times:
            this.nextTime = this.nextTime + this.interval;
            if (this.repeat) {
                this.repeat = this.repeat - 1;
                this.callback(time);
                if (!this.repeat)
                    return false; //removes interval-instance
            }
            else {
                this.callback(time);
            }
            return true;
        }
    }
}
export class Scheduler {
    constructor() {
        this.frameNr = 0;
        this.intervals = [];
    }
    interval(frames, callback) {
        const interval = new Interval(frames, this.frameNr, 0, callback);
        this.intervals.push(interval);
        return (interval);
    }
    stop(interval) {
    }
    //called by matrix on every frame.
    update() {
        this.frameNr++;
        for (let i = 0, n = this.intervals.length; i < n; ++i) {
            this.intervals[i].check(this.frameNr);
        }
    }
}
//# sourceMappingURL=Scheduler.js.map