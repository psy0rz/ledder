import Pixel from "../Pixel.js"
import sharp from "sharp"
import PixelList from "../PixelList.js"
import ColorCache from "../ColorCache.js"


//convert raw image data from the sharp library to pixel list
//doesnt add pixels which have alpha 0
export default async function drawImage(xOffset: number, yOffset: number, image: sharp.Sharp): Promise<PixelList> {

    const ret = new PixelList()

    const {data, info} = await image.raw().toBuffer({resolveWithObject: true})

    const colorCache=new ColorCache()

    for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
            const offset = (x * info.channels) + (y * info.width * info.channels)
            const a = data[offset + 3]
            //ignore alpha 0
            if (a > 0) {
                const c = colorCache.get(data[offset], data[offset + 1], data[offset + 2], data[offset + 3] / 255)
                ret.add(new Pixel(x + xOffset, y + yOffset, c))
            }
        }
    }

    return ret

}



