import {Matrix} from "./Matrix.js";
import {PixelInterface} from "./PixelInterface.js";
import {ColorInterface} from "./ColorInterface.js";

//basic pixel. Will add itself to the display matrix.
export class Pixel implements PixelInterface {
    x: number;
    y: number;

    color: ColorInterface;

    keep: boolean;

  /**
   * Renders one pixel.
   * @param matrix Display matrix
   * @param x X coord
   * @param y Y coord
   * @param color Color object
   * @param bg Make true to add to background
   */
  constructor(matrix, x: number, y: number, color:ColorInterface, bg=false) {
        this.x = x;
        this.y = y;

        this.color=color;

        this.keep=true;

        if (bg)
          matrix.addPixelBG(this);
        else
          matrix.addPixel(this);
    }

    destroy(matrix)
    {
      matrix.removePixel(this);
      this.keep=false
    }

    render(matrix: Matrix) {
        matrix.setPixel(this.x, this.y, this.color);
    }

    //limit pixel location to this box (inclusive)
    limit(xMin, yMin, xMax, yMax)
    {
        if (this.x<xMin)
            this.x=xMin
        else if (this.x>xMax)
            this.x=xMax

        if (this.y<yMin)
            this.y=yMin
        else if (this.y>yMax)
            this.y=yMax
    }

    //keep pixel inside this box by wrapping
    wrap(xMin, yMin, xMax, yMax)
    {
        if (this.x<xMin)
            this.x+=(xMax-xMin)
        else if (this.x>xMax)
            this.x-=(xMax-xMin)

        if (this.y<yMin)
            this.y+=(yMax-yMin)
        else if (this.y>yMax)
            this.y-=(yMax-yMin)

    }
}

