import Display from "../Display.js"
import Color from "../Color.js"
import {colorBlack} from "../Colors.js"
import OffsetMapper from "./drivers/OffsetMapper.js"


const QOI_OP_INDEX = 0x00 /* 00xxxxxx */
const QOI_OP_DIFF = 0x40 /* 01xxxxxx */
const QOI_OP_LUMA = 0x80 /* 10xxxxxx */
const QOI_OP_RUN = 0xc0 /* 11xxxxxx */
const QOI_OP_RGB = 0xfe /* 11111110 */
const QOI_OP_RGBA = 0xff /* 11111111 */ //never emitted, the stream is opaque RGB

//QOIS extension, reuses the unused QOI_OP_RGBA byte:
//keep the next N pixels from the previous frame. Followed by 2 bytes little-endian N.
const QOIS_OP_PREVFRAME = 0xff

/* DECODER CONTRACT (differs from stock QOI, the ledstream decoder must match this):
 *  - the framebuffer and the 64-color index persist across frames within a connection;
 *    both start zeroed/black at the start of a connection (see resetEncoderState()).
 *  - the previous-pixel state resets to black at the start of every frame.
 *  - the color-index is updated ONLY by DIFF/LUMA/RGB ops (index[hash(px)] = px after
 *    decoding the pixel). RUN, INDEX and PREVFRAME ops must NOT touch the index --
 *    stock QOI updates it after every op, which desyncs from this encoder now that
 *    the index persists across frames.
 *  - QOIS_OP_PREVFRAME: leave the next N framebuffer pixels untouched; the
 *    previous-pixel state becomes the last kept pixel.
 */

const QOI_MASK_2 = 0xc0 /* 11000000 */

function QOI_COLOR_HASH(C: Color) {
    return (C.r * 3 + C.g * 5 + C.b * 7 + (255 * 11)) //NOTE: we dont use alpha this way, so make it always 255
}


//Quite Ok Image Streamer, based on https://qoiformat.org/
//Subclass from this if you need stream the pixels somewhere that supports decoding QOIS.
export abstract class DisplayQOIS extends Display {
    protected pixelCount: number

    private pixelsPerChannel: number

    private pixels: Array<Color>
    private prevPixels: Array<Color>
    private index: Array<Color>
    private statsBytes: number
    private mapper: OffsetMapper

    constructor(mapper: OffsetMapper, pixelsPerChannel) {
        super(mapper.width, mapper.height)

        this.pixelsPerChannel = pixelsPerChannel

        this.pixelCount = mapper.width * mapper.height
        this.mapper = mapper

        this.pixels = []
        this.prevPixels = []
        this.resetEncoderState()


        this.statsBytes = 0

        // setInterval(() => {
        //     const raw = this.pixelCount * 3 * this.fps
        //     // console.log(`"QOIS stats: ${this.statsBytes} of ${raw} bytes/s. compression=${100 - ~~(this.statsBytes * 100 / raw)})`)
        //     this.statsBytes = 0
        // }, 1000)

    }

    setPixel(x, y, color) {
        const floor_y = ~~y
        const floor_x = ~~x

        if (floor_x < 0 || floor_y < 0 || floor_x >= this.width || floor_y >= this.height)
            return


        const offset = this.mapper[floor_x][floor_y]
        // const offset =floor_x + floor_y * this.width;
        if (this.pixels[offset] === undefined)
            this.pixels[offset] = new Color(0, 0, 0, 1)

        this.pixels[offset].blend(color)


    }

    //reset the encoder state that persists across frames (64-color index and
    //previous-frame pixels, both mirrored by the decoder).
    //Call this whenever the decoder starts from scratch, i.e. when a new streaming
    //client connects, so encoder and decoder start from the same empty state.
    resetEncoderState() {
        this.index = []
        for (let i = 0; i < 64; i++) {
            this.index.push(colorBlack)
        }
        this.prevPixels = []
    }

    //encodes current pixels by adding bytes to bytes array.
    encode(bytes: Array<number>, displayTimeMS): boolean {
        let prevPixel = colorBlack
        let run = 0
        let changed = false

        // //frame byte length
        bytes.push(0) //0
        bytes.push(0) //1

        //pixels per channel
        bytes.push(this.pixelsPerChannel & 0xff)
        bytes.push((this.pixelsPerChannel >> 8) & 0xff)

        //time when to display frame
        bytes.push(displayTimeMS & 0xff)
        bytes.push((displayTimeMS >> 8) & 0xff)


        this.statsBytes -= bytes.length //substract header overhead

        //pass 1: gamma/brightness mapping and compare against the previous frame
        const mapped: Array<Color> = new Array(this.pixelCount)
        const unchangedPixel: Array<boolean> = new Array(this.pixelCount)
        for (let i = 0; i < this.pixelCount; i++) {
            const c = this.pixels[i]
            let pixel = new Color(0, 0, 0, 1)
            if (c !== undefined) {
                pixel.r = this.gammaMapper[Math.round(c.r)]
                pixel.g = this.gammaMapper[Math.round(c.g)]
                pixel.b = this.gammaMapper[Math.round(c.b)]
            }
            mapped[i] = pixel
            unchangedPixel[i] = this.prevPixels[i] !== undefined && this.prevPixels[i].equal(pixel)
            if (!unchangedPixel[i])
                changed = true
            this.prevPixels[i] = pixel
        }

        //pass 2: encode
        let i = 0
        while (i < this.pixelCount) {
            const pixel = mapped[i]

            //try a previous-frame run (only when no spatial run is active)
            if (run == 0 && unchangedPixel[i]) {
                let tRun = 1
                while (i + tRun < this.pixelCount && unchangedPixel[i + tRun] && tRun < 0xffff)
                    tRun++

                //length of the solid-color prefix of the span
                let solid = 1
                while (solid < tRun && mapped[i + solid].equal(mapped[i]))
                    solid++

                //a temporal run costs 3 bytes. If the whole span is one solid color,
                //spatial encoding is hard to beat: 1 byte for the first pixel (0 if it
                //just continues prevPixel) plus 1 RUN byte per 62 pixels. For spans with
                //detail in them 3 bytes almost always wins.
                let worthIt
                if (solid == tRun)
                    worthIt = (pixel.equal(prevPixel) ? Math.ceil(tRun / 62) : 1 + Math.ceil((tRun - 1) / 62)) > 3
                else
                    worthIt = true

                if (tRun >= 4 && worthIt) {
                    bytes.push(QOIS_OP_PREVFRAME)
                    bytes.push(tRun & 0xff)
                    bytes.push((tRun >> 8) & 0xff)
                    i += tRun
                    prevPixel = mapped[i - 1]
                    continue
                }
            }

            if (pixel.equal(prevPixel)) {
                run++
                if (run == 62) {
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
                if (this.index[index_pos].equal(pixel)) {
                    // if(false) {
                    bytes.push(QOI_OP_INDEX | index_pos)

                } else {
                    this.index[index_pos] = pixel

                    //deltas use 8-bit wraparound like stock QOI (e.g. 255->0 is +1),
                    //decoders reconstruct with wrapping uint8 additions
                    const vr = ((pixel.r - prevPixel.r + 128) & 0xff) - 128
                    const vg = ((pixel.g - prevPixel.g + 128) & 0xff) - 128
                    const vb = ((pixel.b - prevPixel.b + 128) & 0xff) - 128

                    const vg_r = ((vr - vg + 128) & 0xff) - 128
                    const vg_b = ((vb - vg + 128) & 0xff) - 128

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

            prevPixel = pixel
            i++
        }
        //flush pending run at end of frame
        if (run > 0)
            bytes.push(QOI_OP_RUN | (run - 1))

        //prepare for next frame
        this.pixels = []

        this.statsBytes += bytes.length
        // console.log(skips)

        // //update frame byte length
        bytes[0] = bytes.length & 0xff
        bytes[1] = (bytes.length >> 8) & 0xff

        return (changed)


    }

}
