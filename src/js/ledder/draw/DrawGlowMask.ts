import Draw from "../Draw.js"
import {Pixel} from "../Pixel.js"
import {Color} from "../Color.js"

//draw an alpha mask that creates a "glowing" effect (used in counter)
//(middel is full birghtness, and fades out to top and bottom)
export default class DrawGlowMask extends Draw {
    constructor(x: number, y: number, width: number, height: number) {
        super()
        const middle=(y+~~(height/2))

        for (let thisY = y; thisY < y + height; thisY++) {


            let alpha

            if (thisY<middle)
                alpha=1-((thisY-y)/~~(height/2))
            else
                alpha=(thisY-middle)/~~(height/2)

            console.log("ALPHA",  thisY,alpha)

                let color = new Color(0, 0, 0, alpha)
            // else

            for (let thisX = x; thisX < x + width; thisX++) {
                this.add(new Pixel(thisX, thisY, color))
            }
        }
    }
}


