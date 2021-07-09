//moves animations x and y coordiantes in a certain direction with a certain speed
import {Animation} from "./Animation.js";

export class AnimationMove extends Animation {

  /**
   * Move pixels in specified direction
   * @param matrix
   * @param delay Delay between each step
   * @param xStep Step size of X (can be negative as well)
   * @param yStep Step size of Y (can be negative as well)
   */
  constructor(matrix, delay: number, xStep: number, yStep: number) {
        super(matrix);

    matrix.scheduler.interval(delay, (frameNr) => {

            for (let i = 0, n = this.pixels.length; i < n; ++i) {
                const p = this.pixels[i];
                p.x = p.x + xStep;
                p.y = p.y + yStep;
            }

            return (this.keep);
        })
    }
}
