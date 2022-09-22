import Interval from "./Interval.js";

export default class IntervalOnce extends Interval {
    endTime: number;

    constructor(frames:number, time: number) {
        super();
        this.endTime = time + frames
    }

    check(time) {

        return (time < this.endTime)
    }

}
