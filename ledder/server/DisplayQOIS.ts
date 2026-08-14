import Display from "../Display.js"
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


//the frame header carries the frame length in 2 bytes, so a frame can never be longer than this
const maxFrameBytes = 0xffff

//header: frame byte-length (2), pixels-per-channel (2), display timestamp (2)
const headerBytes = 6

//Quite Ok Image Streamer, based on https://qoiformat.org/
//Subclass from this if you need stream the pixels somewhere that supports decoding QOIS.
export abstract class DisplayQOIS extends Display {
    protected pixelCount: number

    private pixelsPerChannel: number

    //Encoded frame, written by encode() and valid until the next encode() call. Preallocated at the
    //worst case the encoder can produce, so encoding never allocates and never has to grow: pushing
    //bytes into a normal Array and converting that to a Uint8Array afterwards costs more than the
    //whole rest of the encoder on busy frames.
    //Subclasses must copy out of it before handing the bytes to something asynchronous (a socket
    //write keeps the buffer alive past the call), which is why it is exposed as a scratch buffer
    //rather than as something to pass on directly.
    protected frameBuffer: Uint8Array

    //whether the frame encode() just wrote differs from the previous frame
    protected frameChanged: boolean

    //Per-display-pixel accumulators that setPixel() blends into, as flat r,g,b triples. Allocated
    //once and zeroed again by encode(), so the render loop never allocates.
    //Flat instead of an array of Color objects because this is read once per channel per pixel by
    //the encoder: a typed array walks one stretch of memory, while Color objects mean a pointer
    //chase per pixel plus three boxed doubles, and clearing them means three stores per pixel
    //instead of one memset. No alpha is kept -- blending uses the alpha of the incoming color only,
    //and the stream is opaque.
    protected pixelsRGB: Float64Array

    //x,y -> offset in pixels, flattened from the OffsetMapper (a nested Array of Arrays) so
    //setPixel() does one typed-array load instead of chasing two generic element loads. The mapper
    //is fully built by displayconf before it reaches us and never changes afterwards.
    private mapperLut: Uint32Array

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

    constructor(mapper: OffsetMapper, pixelsPerChannel) {
        super(mapper.width, mapper.height)

        this.pixelsPerChannel = pixelsPerChannel

        this.pixelCount = mapper.width * mapper.height

        //flatten the mapper, and find the highest offset it can hand to setPixel()
        this.mapperLut = new Uint32Array(mapper.width * mapper.height)
        let maxOffset = this.pixelCount - 1
        for (let x = 0; x < mapper.width; x++) {
            for (let y = 0; y < mapper.height; y++) {
                const offset = mapper[x][y]
                this.mapperLut[x * mapper.height + y] = offset
                if (offset > maxOffset)
                    maxOffset = offset
            }
        }

        //Sized so that every offset setPixel() can be handed lands inside it: a misconfigured
        //multi-panel mapper can point past the end of the display. encode() only ever looks at the
        //first pixelCount entries, the rest is written and cleared but never sent.
        this.pixelsRGB = new Float64Array((maxOffset + 1) * 3)

        //worst case is QOI_OP_RGB (4 bytes) for every pixel, plus the header and a trailing run byte
        this.frameBuffer = new Uint8Array(this.pixelCount * 4 + headerBytes + 1)
        this.frameChanged = false
        if (this.frameBuffer.length > maxFrameBytes)
            console.warn(`DisplayQOIS: ${mapper.width}x${mapper.height} is large enough that a fully detailed frame can exceed the ${maxFrameBytes} byte frame limit; such frames will be dropped.`)

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

        const a = color.a
        if (a === 0)
            return

        //every offset the mapper can produce has an accumulator, see the constructor
        const o = this.mapperLut[floor_x * this.height + floor_y] * 3
        const acc = this.pixelsRGB

        //Color.blend(), inlined onto the flat accumulator: the alpha of the incoming color decides,
        //ours is meaningless (the accumulator is what is already on screen).
        if (a === 1) {
            acc[o] = color.r
            acc[o + 1] = color.g
            acc[o + 2] = color.b
        } else {
            const ourA = 1 - a
            acc[o] = acc[o] * ourA + color.r * a
            acc[o + 1] = acc[o + 1] * ourA + color.g * a
            acc[o + 2] = acc[o + 2] * ourA + color.b * a
        }
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

    //Encodes the pixels rendered so far into this.frameBuffer and clears them again.
    //Returns the number of bytes written, or 0 if the frame did not fit in a QOIS frame.
    //Sets this.frameChanged to whether anything changed compared to the previous frame.
    encode(displayTimeMS): number {
        //the previous pixel resets to black at the start of every frame, kept as loose channels so
        //no Color object has to be allocated or dereferenced per pixel
        let prevR = 0
        let prevG = 0
        let prevB = 0
        let run = 0
        let changed = false

        const bytes = this.frameBuffer

        // //frame byte length
        bytes[0] = 0
        bytes[1] = 0

        //pixels per channel
        bytes[2] = this.pixelsPerChannel & 0xff
        bytes[3] = (this.pixelsPerChannel >> 8) & 0xff

        //time when to display frame
        bytes[4] = displayTimeMS & 0xff
        bytes[5] = (displayTimeMS >> 8) & 0xff

        //write position in bytes, past the header
        let p = headerBytes

        this.statsBytes -= headerBytes //substract header overhead

        //pass 1: gamma/brightness mapping and compare against the previous frame
        const pixelCount = this.pixelCount
        const acc = this.pixelsRGB
        const curr = this.currRGB
        const prev = this.prevRGB
        const unchangedPixel = this.unchangedPixel
        const gammaTable = this.gammaMapper.table
        const prevValid = this.prevFrameValid
        for (let i = 0; i < pixelCount; i++) {
            const o = i * 3

            //Rounding via (x + 0.5) | 0 instead of Math.round(): identical for the 0-255 range a
            //color lives in, but it yields an int32 straight away, which keeps both the rounding and
            //the table lookup on V8's integer fast path. Math.round() hands back a double that then
            //has to be turned into an array index again, which made this loop several times slower.
            //This is the hottest loop of the encoder (it runs over every pixel, however little
            //changed), so it is worth the ugliness.
            //Colors outside 0-255 are clamped rather than left to fall off the end of the table,
            //which would make an over-bright pixel come out black.
            let ri = (acc[o] + 0.5) | 0
            if (ri < 0) ri = 0; else if (ri > 255) ri = 255
            let gi = (acc[o + 1] + 0.5) | 0
            if (gi < 0) gi = 0; else if (gi > 255) gi = 255
            let bi = (acc[o + 2] + 0.5) | 0
            if (bi < 0) bi = 0; else if (bi > 255) bi = 255

            const r = gammaTable[ri]
            const g = gammaTable[gi]
            const b = gammaTable[bi]

            //right after a decoder reset nothing may be assumed to still be on screen
            const same = prevValid && prev[o] === r && prev[o + 1] === g && prev[o + 2] === b
            unchangedPixel[i] = same ? 1 : 0
            if (!same)
                changed = true

            curr[o] = r
            curr[o + 1] = g
            curr[o + 2] = b
        }

        //black again, ready for the next frame's setPixel() calls to blend into. One memset instead
        //of reallocating anything or storing per channel in the loop above.
        acc.fill(0)

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
                    bytes[p++] = QOIS_OP_PREVFRAME
                    bytes[p++] = tRun & 0xff
                    bytes[p++] = (tRun >> 8) & 0xff
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
                    bytes[p++] = QOI_OP_RUN | (run - 1)
                    run = 0
                }

            } else {
                if (run > 0) {
                    bytes[p++] = QOI_OP_RUN | (run - 1)
                    run = 0
                }
                //the QOI color hash. Alpha is always opaque in this stream, so its term is constant.
                const index_pos = (r * 3 + g * 5 + b * 7 + (255 * 11)) % 64
                const io = index_pos * 3

                // //its in index?
                if (indexRGB[io] === r && indexRGB[io + 1] === g && indexRGB[io + 2] === b) {
                    // if(false) {
                    bytes[p++] = QOI_OP_INDEX | index_pos

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
                        bytes[p++] = QOI_OP_DIFF | (vr + 2) << 4 | (vg + 2) << 2 | (vb + 2)
                    } else if (
                        vg_r > -9 && vg_r < 8 &&
                        vg > -33 && vg < 32 &&
                        vg_b > -9 && vg_b < 8
                    ) {
                        bytes[p++] = QOI_OP_LUMA | (vg + 32)
                        bytes[p++] = (vg_r + 8) << 4 | (vg_b + 8)
                    } else {
                        bytes[p++] = QOI_OP_RGB
                        bytes[p++] = r
                        bytes[p++] = g
                        bytes[p++] = b
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
            bytes[p++] = QOI_OP_RUN | (run - 1)

        //this frame becomes the previous one by swapping the two buffers, instead of copying it over.
        //Pass 1 already reset every accumulator to opaque black in place, so pixels not drawn next
        //frame correctly come out black again without reallocating anything.
        this.currRGB = prev
        this.prevRGB = curr
        this.prevFrameValid = true

        this.frameChanged = changed

        //The length has to fit in the 2-byte header field. Only a display with more than ~16k pixels
        //can get here, and only on a frame the encoder could not compress at all; writing it anyway
        //would truncate the length and garble the rest of the connection.
        //Dropping it leaves the decoder a frame behind us, and the persistent color-index and
        //previous-frame reference make that unrecoverable within the stream, so the caller is
        //expected to reconnect the client (which runs resetEncoderState()) on a 0 here.
        if (p > maxFrameBytes) {
            console.error(`DisplayQOIS: frame of ${p} bytes exceeds the ${maxFrameBytes} byte limit, dropping frame.`)
            return 0
        }

        this.statsBytes += p
        // console.log(skips)

        // //update frame byte length
        bytes[0] = p & 0xff
        bytes[1] = (p >> 8) & 0xff

        return p
    }

}
