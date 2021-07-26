import {Animation} from "./Animation.js";
import {Matrix} from "./Matrix.js";
import {ColorInterface} from "./ColorInterface.js";
import {ValueInterface} from "./ValueInterface.js";
import {Color} from "./Color.js";

export class AnimationFade extends Animation {

  stepR: number
  stepG: number
  stepB: number
  frameNr: number
  promise: Promise<unknown>

  /**
   * A plain linear fade that fades color to colorEnd within specified number of frames
   * Note that this directly manipulates the specified color-object. No need to add pixels.
   * @param matrix
   * @param color
   * @param colorEnd
   * @param frames
   */
  constructor(matrix: Matrix, color: ColorInterface, colorEnd: ColorInterface, frames: ValueInterface) {
    super(matrix);

    this.frameNr = frames.value;

    this.stepR=(colorEnd.r-color.r)/frames.value;
    this.stepG=(colorEnd.g-color.g)/frames.value;
    this.stepB=(colorEnd.b-color.b)/frames.value;

    this.promise=matrix.scheduler.interval(1, () => {

      this.frameNr--;

      //make sure last step is exact on colorEnd
      if (this.frameNr <= 0) {
          Object.assign(color, colorEnd);
          return false
      }

      //since all the pixels use this color-object, we can manipulate it directly:
      color.r+=this.stepR;
      color.g+=this.stepG;
      color.b+=this.stepB;

      if (!this.keep)
        return false;

    })

  }
}
