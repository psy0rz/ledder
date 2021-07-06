//blink led by using the alpha value.
import {Animation} from "./Animation.js";
import {Matrix} from "./Matrix.js";

export class AnimationBlink extends Animation {
  onInterval: number;
  offInterval: number;
  alpha: number;

  //use offset to "offset" the first time, so that the animation isnt in sync with other animations.
  constructor(matrix: Matrix, onInterval: number, offInterval: number, offset = 0) {
    super(matrix);

    this.onInterval = onInterval;
    this.offInterval = offInterval;
    this.alpha = 1;

    matrix.scheduler.interval(onInterval+offset, () => {
      for (let i = 0, n = this.pixels.length; i < n; ++i) {
        const p = this.pixels[i];
        p.a = this.alpha;
      }

      if (!this.keep)
        return false;

      if (this.alpha) {
        this.alpha = 0;
        return(this.onInterval);
      } else {
        this.alpha = 1;
        return(this.offInterval);
      }

    })

  }
}
