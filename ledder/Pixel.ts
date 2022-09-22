import {PixelInterface} from "./PixelInterface.js"
import {ColorInterface} from "./ColorInterface.js"
import BboxInterface from "./BboxInterface.js"


//basic pixel.
export class Pixel implements PixelInterface {
    x: number
    y: number

    color: ColorInterface
    data?: any

    // keep: boolean;

    /**
     * Renders one pixel.
     * @param display Display display
     * @param x X coord
     * @param y Y coord
     * @param color Color object
     */
    constructor(x: number, y: number, color: ColorInterface) {
        this.x = x
        this.y = y

        this.color = color

    }

    copy(copyColor = false) {
        if (copyColor)
            return new Pixel(this.x, this.y, this.color.copy())
        else
            return new Pixel(this.x, this.y, this.color)
    }

    //relatively move pixel by this amount
    move(x: number, y: number, round = false) {
        if (round) {
            this.x = Math.round(this.x + x)
            this.y = Math.round(this.y + y)
        } else {
            this.x += x
            this.y += y

        }
        return (this)
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
            this.x += (bbox.xMax - bbox.xMin + 1)
        else if (this.x > bbox.xMax)
            this.x -= (bbox.xMax - bbox.xMin + 1)

        if (this.y < bbox.yMin)
            this.y += (bbox.yMax - bbox.yMin + 1)
        else if (this.y > bbox.yMax)
            this.y -= (bbox.yMax - bbox.yMin + 1)

    }

    //pixel outside this box? (inclusive)
    isOutside(bbox: BboxInterface) {
        return ((this.x < bbox.xMin) || (this.x > bbox.xMax) || (this.y < bbox.yMin) || (this.y > bbox.yMax))

    }
}

