import {Matrix} from "./Matrix.js";
import {PixelContainer} from "./PixelContainer.js";

export class Animation extends PixelContainer {

  matrix: Matrix;
  keep: boolean;

  constructor(matrix) {
    super();
    this.matrix = matrix;
    this.keep=true;
  }

  //unschedules animation, removes pixels.
  //Also removes pixels from matrix if fromMatrix=true.
  destroy(destroyPixels = true) {
    if (destroyPixels) {
      for (let i = 0, n = this.pixels.length; i < n; ++i) {
        this.pixels[i].destroy(this.matrix);
      }
    }
    this.pixels = [];
    this.keep = false;
  }

}
