//blink led by using the alpha value.
import {Animation} from "./Animation.js";
import {Matrix} from "./Matrix.js";


export class AnimationBlink extends Animation {
  // onInterval: number;
  // offInterval: number;
  alpha: number;

  /**
   * Blink pixel via alpha-channel
   * @param matrix
   * @param onInterval Time to stay on
   * @param offInterval Time to stay off
   * @param offset Offset the first onInterval by this amount.
   */
  constructor(matrix: Matrix, onInterval: number, offInterval: number, offset = 0) {
    super(matrix);

    // this.onInterval = onInterval;
    // this.offInterval = offInterval;
    this.alpha = 1;

    matrix.scheduler.interval(onInterval+offset, () => {
      for (let i = 0, n = this.pixels.length; i < n; ++i) {
        const p = this.pixels[i];
        p.color.a = this.alpha;
      }

      if (!this.keep)
        return false;

      if (this.alpha) {
        this.alpha = 0;
        return(onInterval);
      } else {
        this.alpha = 1;
        return(offInterval);
      }

    })

  }
}
