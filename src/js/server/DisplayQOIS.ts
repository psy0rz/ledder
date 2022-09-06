import {Display} from "../ledder/Display.js"
import {Color} from "../ledder/Color.js"
import {colorBlack} from "../ledder/Colors.js"
import OffsetMapper from "./drivers/OffsetMapper"
import GammaMapper from "./drivers/GammaMapper"


const QOI_OP_INDEX = 0x00 /* 00xxxxxx */
const QOI_OP_DIFF = 0x40 /* 01xxxxxx */
const QOI_OP_LUMA = 0x80 /* 10xxxxxx */
const QOI_OP_RUN = 0xc0 /* 11xxxxxx */
const QOI_OP_RGB = 0xfe /* 11111110 */
const QOI_OP_RGBA = 0xff /* 11111111 */

const QOI_MASK_2 = 0xc0 /* 11000000 */

function QOI_COLOR_HASH(C: Color) {
    return (C.r * 3 + C.g * 5 + C.b * 7)
}


//Quite Ok Image Streamer, based on https://qoiformat.org/
//Subclass from this if you need stream the pixels somewhere that supports decoding QOIS.
export abstract class DisplayQOIS extends Display {
    protected pixelCount: number


    private pixels: Array<Color>
    private prevPixels: Array<Color>
    private index: Array<Color>
    private statsBytes: number
    private mapper: OffsetMapper
    private gamma: GammaMapper

    constructor(width: number, height: number, mapper: OffsetMapper, gamma: GammaMapper) {
        super(width, height)

        this.pixelCount = width * height
        this.mapper = mapper
        this.gamma=gamma
        this.clear()


        this.statsBytes = 0

        setInterval(() => {
            const raw = this.pixelCount * 3 * this.fps
            // console.log(`"QOIS stats: ${this.statsBytes} of ${raw} bytes/s. compression=${100 - ~~(this.statsBytes * 100 / raw)})`)
            this.statsBytes = 0
        }, 1000)

    }

    clear() {
        super.clear()
        this.pixels = []
        this.prevPixels = []
        this.index = []

        for (let i = 0; i < 64; i++) {
            this.index.push(colorBlack)
        }
    }

    setPixel(x, y, color) {
        const floor_y = ~~y
        const floor_x = ~~x

        if (floor_x<0 || floor_y<0 || floor_x>=this.width || floor_y>=this.height)
            return



        const offset = this.mapper[floor_x][floor_y]
        // const offset =floor_x + floor_y * this.width;
        if (this.pixels[offset] === undefined)
            this.pixels[offset] = new Color(0, 0, 0, 1)

        this.pixels[offset].blend(color)


    }

    //encodes current pixels by adding bytes to bytes array.
    encode(bytes: Array<number>) {
        let prevPixel = colorBlack
        let run = 0
        let pixelCount = 1


        this.statsBytes -= bytes.length //substract header overhead
        for (let i = 0; i < this.pixelCount; i++) {

            //gamma/brightness mapping
            const c = this.pixels[i]
            let pixel = new Color(0,0,0,1)
            if (c !== undefined) {
                pixel.r = this.gamma[Math.round(c.r)]
                pixel.g = this.gamma[Math.round(c.g)]
                pixel.b = this.gamma[Math.round(c.b)]
                pixel.a=c.a
            }
            
            if (pixel.equal(prevPixel)) {
                run++
                if (run == 62 || pixelCount == this.pixelCount) {
                    bytes.push(QOI_OP_RUN | (run - 1))
                    run = 0
                }

            } else {
                if (run > 0) {
                    bytes.push(QOI_OP_RUN | (run - 1))
                    run = 0
                }
                const index_pos = QOI_COLOR_HASH(pixel) % 64

                // //its in index?
                // if (this.index[index_pos].equal(pixel)) {
                if(false) {
                    bytes.push(QOI_OP_INDEX | index_pos)

                } else {
                    this.index[index_pos] = pixel

                    const vr = pixel.r - prevPixel.r
                    const vg = pixel.g - prevPixel.g
                    const vb = pixel.b - prevPixel.b

                    const vg_r = vr - vg
                    const vg_b = vb - vg

                    if (
                        vr > -3 && vr < 2 &&
                        vg > -3 && vg < 2 &&
                        vb > -3 && vb < 2
                    ) {
                        bytes.push(QOI_OP_DIFF | (vr + 2) << 4 | (vg + 2) << 2 | (vb + 2))
                    } else if (
                        vg_r > -9 && vg_r < 8 &&
                        vg > -33 && vg < 32 &&
                        vg_b > -9 && vg_b < 8
                    ) {
                        bytes.push(QOI_OP_LUMA | (vg + 32))
                        bytes.push((vg_r + 8) << 4 | (vg_b + 8))
                    } else {
                        bytes.push(QOI_OP_RGB)
                        bytes.push(pixel.r)
                        bytes.push(pixel.g)
                        bytes.push(pixel.b)
                    }
                }
            }

            pixelCount++
            prevPixel = pixel

        }

        //prepare for next frame
        this.prevPixels = this.pixels
        this.pixels = []

        this.statsBytes += bytes.length
        // console.log(skips)

        //FIXME: keep
        this.index = []
        for (let i = 0; i < 64; i++) {
            this.index.push(colorBlack)
        }


    }

}
