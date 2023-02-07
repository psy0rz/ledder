import Draw from "../Draw.js"

import Color from "../Color.js"
import Pixel from "../Pixel.js"
import sharp from "sharp"


//convert raw image data from the sharp library to pixel list
//doesnt add pixels which have alpha 0
export default class DrawImage extends Draw {

    async addImage(xOffset: number, yOffset: number, image:sharp.Sharp):Promise<DrawImage> {
        const { data,info }=await image.raw().toBuffer({resolveWithObject: true})

        for (let y = 0; y < info.height; y++) {
            for (let x = 0; x < info.width; x++) {
                const offset = (x * info.channels) + (y * info.width * info.channels)
                const a=data[offset+3]
                //ignore alpha 0
                if (a>0) {
                    const c = new Color(data[offset], data[offset + 1], data[offset + 2], data[offset + 3] / 255)
                    this.add(new Pixel(x + xOffset, y + yOffset, c))
                }

            }
        }

        return this

    }
}


