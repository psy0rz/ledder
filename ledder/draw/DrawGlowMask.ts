import Draw from "../Draw.js"
import Pixel from "../Pixel.js"
import Color from "../Color.js"
import {start} from "repl"

//draw an alpha mask that creates a "glowing" effect (used in counter)
//(middel is full birghtness, and fades out to top and bottom)
export default class DrawGlowMask extends Draw {
    constructor(x: number, y: number, width: number, height: number, startAlpha = 0.5, steps=4) {
        super()

        for (let step=0;step<steps; step++) {

            let alpha=startAlpha*((steps-step)/steps)

            let color = new Color(0, 0, 0, alpha)

            for (let thisX = x; thisX < x + width; thisX++) {
                this.add(new Pixel(thisX, y+step, color))
                this.add(new Pixel(thisX, y+height-2-step, color))
            }
        }
    }
}


