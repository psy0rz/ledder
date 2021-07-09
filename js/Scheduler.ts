//schedules updates for animations, based on frame-updates from the matrix.
import {Control} from "./Control.js";
import {ControlValue} from "./ControlValue.js";
import {IntervalControlled} from "./IntervalControlled.js";
import {IntervalStatic} from "./IntervalStatic.js";
import {Interval} from "./Interval.js";


export class Scheduler {

  frameNr: number;
  intervals: Array<Interval>;

  constructor() {
    this.frameNr = 0;
    this.clear();

  }

  clear()
  {
    this.intervals = [];

  }

  /**
   * Create a new interval
   * @param frames Interval length, specified as the number of frames. Use 1 to get called for each frame.
   * @param callback Return false to end the interval. Return a number to change the interval. Return false to end the interval.
   */
  interval(frames: number, callback) {
    const interval = new IntervalStatic(frames, this.frameNr, callback);
    this.intervals.push(interval);
    return (interval);
  }

  /**
   * Create a new controlled interval.
   * @param control The controller that sets/modifies the interval.
   * @param callback Return false to end the interval. Return false to end the interval.
   */
  intervalControlled(control: ControlValue, callback) {
    const interval = new IntervalControlled(control, this.frameNr, callback);
    this.intervals.push(interval);
    return (interval);
  }

  stop(interval: Interval) {

  }

  //called by matrix on every frame.
  update() {
    this.frameNr++;

    let i=0;
    while(i<this.intervals.length)
    {
      if (!this.intervals[i].check(this.frameNr)) {
        this.intervals.splice(i, 1);
      }
      else
        i++;
    }
  }

  status()
  {
    console.log("Scheduler intervals: ",this.intervals.length);
  }
}
