import {Matrix} from "./Matrix.js";
import {PixelInterface} from "./PixelInterface.js";
import {ColorInterface} from "./ColorInterface.js";
import BboxInterface from "./BboxInterface.js";


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
    limit(bbox:BboxInterface)
    {
        if (this.x<bbox.xMin)
            this.x=bbox.xMin
        else if (this.x>bbox.xMax)
            this.x=bbox.xMax

        if (this.y<bbox.yMin)
            this.y=bbox.yMin
        else if (this.y>bbox.yMax)
            this.y=bbox.yMax
    }

    //keep pixel inside this box by wrapping (inclusive)
    wrap(bbox:BboxInterface)
    {
        if (this.x<bbox.xMin)
            this.x+=(bbox.xMax-bbox.xMin)
        else if (this.x>bbox.xMax)
            this.x-=(bbox.xMax-bbox.xMin)

        if (this.y<bbox.yMin)
            this.y+=(bbox.yMax-bbox.yMin)
        else if (this.y>bbox.yMax)
            this.y-=(bbox.yMax-bbox.yMin)

    }

    //remove pixels that are outside this box (inclusive)
    crop(matrix:Matrix, bbox:BboxInterface)
    {
        if ((this.x<bbox.xMin) ||(this.x>bbox.xMax) || (this.y<bbox.yMin) || (this.y>bbox.yMax))
            this.destroy(matrix)

    }

}

