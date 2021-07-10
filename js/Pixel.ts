import {Matrix} from "./Matrix.js";
import {PixelInterface} from "./PixelInterface.js";
import {ColorInterface} from "./ColorInterface.js";

export class Pixel implements PixelInterface {
    x: number;
    y: number;

    color: ColorInterface;

    keep: boolean;

  /**
   * Renders one pixel.
   * @param matrix Display matrix
   * @param x
   * @param y
   * @param color
   */
  constructor(matrix, x: number, y: number, color:ColorInterface) {
        this.x = x;
        this.y = y;

        this.color=color;

        this.keep=true;

        matrix.addPixel(this);
    }

    destroy(matrix)
    {
      matrix.removePixel(this);
    }

    render(matrix: Matrix) {
        matrix.setPixel(this.x, this.y, this.color);
    }
}

