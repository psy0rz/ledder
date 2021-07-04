//schedules updates for animations, based on frame-updates from the matrix.
import {Animation} from "./Animation.js";

class Interval {
  interval: number;
  nextTime: number;
  repeat: number;
  callback: (frameNr: number) => any;

  constructor(interval, time, callback) {
    this.interval = interval;
    // this.repeat=repeat;
    this.nextTime = time + interval;
    this.callback = callback;
  }

  check(time) {
    if (time >= this.nextTime) {
      const newInterval = this.callback(time);

      if (newInterval !== undefined) {
        this.interval = newInterval;
      }

      //note: add to nextTime, instead of time, to allow non-integer intervals
      this.nextTime = this.nextTime + this.interval;
    }
  }
}

export class Scheduler {

  frameNr: number;
  intervals: Array<Interval>;

  constructor() {
    this.frameNr = 0;
    this.intervals = [];

  }

  interval(frames, callback) {
    const interval = new Interval(frames, this.frameNr, callback);
    this.intervals.push(interval);
    return (interval);
  }

  stop(interval: Interval) {

  }

  //called by matrix on every frame.
  update() {
    this.frameNr++;

    for (let i = 0, n = this.intervals.length; i < n; ++i) {
      this.intervals[i].check(this.frameNr);
    }
  }
}
