import {Matrix} from "./Matrix.js";
import {PixelInterface} from "./PixelInterface.js";
import {ColorInterface} from "./ColorInterface.js";
import BboxInterface from "./BboxInterface.js";
import {Color} from "./Color.js";


//basic pixel.
export class Pixel implements PixelInterface {
    x: number;
    y: number;

    color: ColorInterface;

    // keep: boolean;

    /**
     * Renders one pixel.
     * @param matrix Display matrix
     * @param x X coord
     * @param y Y coord
     * @param color Color object
     */
    constructor(x: number, y: number, color: ColorInterface) {
        this.x = x;
        this.y = y;

        this.color = color;

    }

    copy(copyColor=false)
    {
        if (copyColor)
            return new Pixel(this.x, this.y, this.color.copy())
        else
            return new Pixel(this.x, this.y, this.color)
    }

    //relatively move pixel by this amount
    move(x: number ,y:number)
    {
        this.x+=x
        this.y+=y
    }


    //limit pixel location to this box (inclusive)
    limit(bbox: BboxInterface) {
        if (this.x < bbox.xMin)
            this.x = bbox.xMin
        else if (this.x > bbox.xMax)
            this.x = bbox.xMax

        if (this.y < bbox.yMin)
            this.y = bbox.yMin
        else if (this.y > bbox.yMax)
            this.y = bbox.yMax
    }

    // //keep pixel inside this box by wrapping (inclusive)
    wrap(bbox: BboxInterface) {
        if (this.x < bbox.xMin)
            this.x += (bbox.xMax - bbox.xMin)
        else if (this.x > bbox.xMax)
            this.x -= (bbox.xMax - bbox.xMin)

        if (this.y < bbox.yMin)
            this.y += (bbox.yMax - bbox.yMin)
        else if (this.y > bbox.yMax)
            this.y -= (bbox.yMax - bbox.yMin)

    }

    //pixel outside this box? (inclusive)
    isOutside(bbox: BboxInterface) {
        return ((this.x < bbox.xMin) || (this.x > bbox.xMax) || (this.y < bbox.yMin) || (this.y > bbox.yMax))

    }
}

