import Display from "../Display.js"
import Color from "../Color.js"
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


//Quite Ok Image Streamer, based on https://qoiformat.org/
//Subclass from this if you need stream the pixels somewhere that supports decoding QOIS.
export abstract class DisplayQOIS extends Display {
    protected pixelCount: number

    private pixelsPerChannel: number

    //Per-display-pixel accumulators that setPixel() blends into. Allocated once and reset in place
    //by encode(), so the render loop never allocates: see the comment in encode()'s pass 1.
    private pixels: Array<Color>

    //Gamma-mapped RGB of the current and the previous frame, as flat r,g,b triples (the stream is
    //opaque, so no alpha is kept). These are swapped by reference at the end of every frame instead
    //of copying the current frame into the previous one, and pass 2 reads its pixels straight out of
    //currRGB rather than from an array of Color objects.
    private currRGB: Uint8Array
    private prevRGB: Uint8Array

    //1 for every pixel that is byte-identical to the previous frame, driving QOIS_OP_PREVFRAME
    private unchangedPixel: Uint8Array

    //the 64-color index, same flat r,g,b layout
    private indexRGB: Uint8Array

    //false until a full frame has been encoded against the current decoder state, so the frame right
    //after resetEncoderState() encodes every pixel explicitly instead of trusting prevRGB
    private prevFrameValid: boolean

    private statsBytes: number
    private mapper: OffsetMapper

    constructor(mapper: OffsetMapper, pixelsPerChannel) {
        super(mapper.width, mapper.height)

        this.pixelsPerChannel = pixelsPerChannel

        this.pixelCount = mapper.width * mapper.height
        this.mapper = mapper

        //preallocated so that every index encode() reads actually exists, and setPixel() never has to
        //create one
        this.pixels = new Array(this.pixelCount)
        for (let i = 0; i < this.pixelCount; i++)
            this.pixels[i] = new Color(0, 0, 0, 1)

        this.currRGB = new Uint8Array(this.pixelCount * 3)
        this.prevRGB = new Uint8Array(this.pixelCount * 3)
        this.unchangedPixel = new Uint8Array(this.pixelCount)
        this.indexRGB = new Uint8Array(64 * 3)

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
        //the decoder starts with an all-black index and an untrusted framebuffer
        this.indexRGB.fill(0)
        this.prevFrameValid = false
    }

    //encodes current pixels by adding bytes to bytes array.
    encode(bytes: Array<number>, displayTimeMS): boolean {
        //the previous pixel resets to black at the start of every frame, kept as loose channels so
        //no Color object has to be allocated or dereferenced per pixel
        let prevR = 0
        let prevG = 0
        let prevB = 0
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
        const pixelCount = this.pixelCount
        const pixels = this.pixels
        const curr = this.currRGB
        const prev = this.prevRGB
        const unchangedPixel = this.unchangedPixel
        const gammaMapper = this.gammaMapper
        const prevValid = this.prevFrameValid
        for (let i = 0; i < pixelCount; i++) {
            const c = pixels[i]
            const o = i * 3

            const r = gammaMapper[Math.round(c.r)]
            const g = gammaMapper[Math.round(c.g)]
            const b = gammaMapper[Math.round(c.b)]

            //reset the accumulator to opaque black in place, ready for next frame's setPixel()
            //calls to blend into -- avoids reallocating it the way resetting the whole array would
            c.r = 0
            c.g = 0
            c.b = 0
            c.a = 1

            //right after a decoder reset nothing may be assumed to still be on screen
            const same = prevValid && prev[o] === r && prev[o + 1] === g && prev[o + 2] === b
            unchangedPixel[i] = same ? 1 : 0
            if (!same)
                changed = true

            curr[o] = r
            curr[o + 1] = g
            curr[o + 2] = b
        }

        //pass 2: encode
        const indexRGB = this.indexRGB
        let i = 0
        while (i < pixelCount) {
            const o = i * 3
            const r = curr[o]
            const g = curr[o + 1]
            const b = curr[o + 2]

            //try a previous-frame run (only when no spatial run is active)
            if (run == 0 && unchangedPixel[i]) {
                let tRun = 1
                while (i + tRun < pixelCount && unchangedPixel[i + tRun] && tRun < 0xffff)
                    tRun++

                //length of the solid-color prefix of the span
                let solid = 1
                while (solid < tRun) {
                    const so = (i + solid) * 3
                    if (curr[so] !== r || curr[so + 1] !== g || curr[so + 2] !== b)
                        break
                    solid++
                }

                //a temporal run costs 3 bytes. If the whole span is one solid color,
                //spatial encoding is hard to beat: 1 byte for the first pixel (0 if it
                //just continues prevPixel) plus 1 RUN byte per 62 pixels. For spans with
                //detail in them 3 bytes almost always wins.
                let worthIt
                if (solid == tRun)
                    worthIt = ((r === prevR && g === prevG && b === prevB) ? Math.ceil(tRun / 62) : 1 + Math.ceil((tRun - 1) / 62)) > 3
                else
                    worthIt = true

                if (tRun >= 4 && worthIt) {
                    bytes.push(QOIS_OP_PREVFRAME)
                    bytes.push(tRun & 0xff)
                    bytes.push((tRun >> 8) & 0xff)
                    i += tRun
                    const lo = (i - 1) * 3
                    prevR = curr[lo]
                    prevG = curr[lo + 1]
                    prevB = curr[lo + 2]
                    continue
                }
            }

            if (r === prevR && g === prevG && b === prevB) {
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
                //the QOI color hash. Alpha is always opaque in this stream, so its term is constant.
                const index_pos = (r * 3 + g * 5 + b * 7 + (255 * 11)) % 64
                const io = index_pos * 3

                // //its in index?
                if (indexRGB[io] === r && indexRGB[io + 1] === g && indexRGB[io + 2] === b) {
                    // if(false) {
                    bytes.push(QOI_OP_INDEX | index_pos)

                } else {
                    indexRGB[io] = r
                    indexRGB[io + 1] = g
                    indexRGB[io + 2] = b

                    //deltas use 8-bit wraparound like stock QOI (e.g. 255->0 is +1),
                    //decoders reconstruct with wrapping uint8 additions
                    const vr = ((r - prevR + 128) & 0xff) - 128
                    const vg = ((g - prevG + 128) & 0xff) - 128
                    const vb = ((b - prevB + 128) & 0xff) - 128

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
                        bytes.push(r)
                        bytes.push(g)
                        bytes.push(b)
                    }
                }
            }

            prevR = r
            prevG = g
            prevB = b
            i++
        }
        //flush pending run at end of frame
        if (run > 0)
            bytes.push(QOI_OP_RUN | (run - 1))

        //this frame becomes the previous one by swapping the two buffers, instead of copying it over.
        //Pass 1 already reset every accumulator to opaque black in place, so pixels not drawn next
        //frame correctly come out black again without reallocating anything.
        this.currRGB = prev
        this.prevRGB = curr
        this.prevFrameValid = true

        this.statsBytes += bytes.length
        // console.log(skips)

        // //update frame byte length
        bytes[0] = bytes.length & 0xff
        bytes[1] = (bytes.length >> 8) & 0xff

        return (changed)


    }

}
