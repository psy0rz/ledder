//schedules updates for animations, based on frame-updates from the matrix.
import {Animation} from "./Animation.js";

class Interval
{
  interval: number;
  nextTime: number;
  repeat: number;
  callback:  (frameNr: number) => void;

  constructor(interval, time, repeat, callback) {
    this.interval=interval;
    this.repeat=repeat;
    this.nextTime=time+interval;
    this.callback=callback;
  }

  check(time)
  {
    if (time>=this.nextTime) {
      this.nextTime=time+this.interval;
      if (this.repeat)
      {
        this.repeat=this.repeat-1;
        this.callback(time);
        if (!this.repeat)
          return false; //removes interval-instance
      }
      else
      {
        this.callback(time);
      }
      return true;

    }
  }
}

export class Scheduler {

    frameNr: number;
    intervals: Array<Interval>;

    constructor() {
        this.frameNr = 0;
        this.intervals=[];

    }

    interval(frames, callback) {
      const interval=new Interval(frames, this.frameNr, 0, callback);
      this.intervals.push(interval);
      return(interval);
    }

    stop(interval:Interval)
    {

    }

    //called by matrix on every frame.
    update() {
        this.frameNr++;

        for (let i = 0, n = this.intervals.length; i < n; ++i) {
            this.intervals[i].check(this.frameNr);
        }
    }
}
