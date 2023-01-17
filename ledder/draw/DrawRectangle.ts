import Draw from "../Draw.js"
import Pixel from "../Pixel.js"
import ColorInterface from "../ColorInterface.js"

//draw a simple hollow box. x,y are top left coordinates
export default class DrawRectangle extends Draw {
    constructor(x: number, y: number, width: number, height: number, color: ColorInterface) {
        super()

        for (let thisX = x; thisX < x + width; thisX++) {
            this.add(new Pixel(thisX, y, color))
            this.add(new Pixel(thisX, y + height-1, color))
        }
        for (let thisY = y+1; thisY < y + height-1; thisY++) {
            this.add(new Pixel(x, thisY, color))
            this.add(new Pixel(x + width-1, thisY, color))

        }
    }
}


