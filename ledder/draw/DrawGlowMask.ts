import Draw from "../Draw.js"
import Pixel from "../Pixel.js"
import Color from "../Color.js"

//draw an alpha mask that creates a "glowing" effect (used in counter)
//(middel is full birghtness, and fades out to top and bottom)
export default class DrawGlowMask extends Draw {
    constructor(x: number, y: number, width: number, height: number, startAlpha = 0.8, middlePercentage = 0.5) {
        super()
        const middle = (y + ~~(height * middlePercentage))

        for (let thisY = y; thisY < y + height; thisY++) {

            let alpha=0

            if (thisY < middle) {
                let percentage = (thisY - y) / (middle - y)
                alpha = (1 - percentage) * startAlpha
            } else if (thisY>middle) {
                let percentage = (thisY - middle) / (y+height-middle)
                alpha = percentage * startAlpha
            }
            // console.log("ALPHA", thisY, alpha)

            let color = new Color(0, 0, 0, alpha)

            for (let thisX = x; thisX < x + width; thisX++) {
                this.add(new Pixel(thisX, thisY, color))
            }
        }
    }
}


