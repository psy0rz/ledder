import PixelList from "./PixelList.js"
import type ColorInterface from "./ColorInterface.js"
import Pixel from "./Pixel.js"
import Color from "./Color.js"
import GammaMapper from "./server/drivers/GammaMapper.js"
import ControlGroup from "./ControlGroup.js";
import type ControlInput from "./ControlInput.js";

//A contribution below this weight can never change an 8-bit channel value, so it's dropped. This
//also swallows the tiny float drift that pixels pick up from being moved by fractions repeatedly.
const minVisibleWeight = 1 / 512

//Every display pixel keeps one accumulator per direction a contribution can arrive from: from the
//pixel itself, plus from each of the 8 pixels around it. See renderFiltered().
const BUCKETS_PER_PIXEL = 9
const FLOATS_PER_BUCKET = 4 //red, green, blue, coverage
const FLOATS_PER_PIXEL = BUCKETS_PER_PIXEL * FLOATS_PER_BUCKET

//direction towards the source pixels home (-1, 0 or 1 per axis) -> accumulator index
function bucketIndex(dx: number, dy: number) {
    return (dy + 1) * 3 + (dx + 1)
}

/**
 * The display renders a pixelcontainer to an actual display.
 * The subclasses are actual implementations for different display types.
 * Usually you only need to implement setPixel() to set a pixel and frame() to send the frame and clear the buffer.
 */
export default abstract class Display {

    /*
     * information for the renderer:
     */
    //maximum fps this driver supports
    minFrameTimeMicros=~~(1000000/120)

    //default fps
    defaultFrameTimeMicros=~~(1000000/60)

    //frame rounding.
    //Use this to force the framerate to be a multiple of this
    frameRoundingMicros=1




    width: number
    height: number

    //to make it compatioble with Boxinterface
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    // private colors: Set<ColorInterface>;


    id: string

    //Date.now() of the last moment isOnline() was true, or undefined when the display was never seen
    //online since the server started. Updated by the status poller in server.ts.
    lastSeenTimestampMs: number = undefined

    public descriptionControl: ControlInput
    public settingsControl: ControlGroup
    protected gammaMapper: GammaMapper

    //Accumulation buffers for subpixel filtering, see renderFiltered(). bucketData holds the 9
    //accumulators of every display pixel, each with premultiplied color (color * coverage) and the
    //coverage itself. The touched-list keeps the per-frame clearing proportional to the number of lit
    //pixels instead of the display size; it can never hold more than one entry per display pixel, so
    //it is preallocated at that size and used up to its own counter instead of being grown and
    //truncated every frame.
    //Allocated on first use and whenever the display changes size (the preview resizes to whatever
    //the browser asks for), so they always match the current width and height.
    //The accumulators of one display pixel are interleaved rather than kept in separate arrays, so
    //emitting a pixel walks one stretch of memory instead of nine. Most pixels only ever get
    //contributions from one or two directions, so touchedBuckets holds a bit per accumulator and
    //emitting skips the ones that were never written, which keeps it off the untouched cache lines.
    private filterBufferPixelCount: number
    private bucketData: Float32Array
    private touchedPixels: Int32Array
    private touchedPixelCount: number
    private touchedBuckets: Uint16Array
    private emitColor: Color

    protected constructor(width, height) {

        this.width = width
        this.height = height

        this.xMin = 0
        this.yMin = 0
        this.xMax = width - 1
        this.yMax = height - 1

        this.id="unknown"

        this.settingsControl = new ControlGroup('Display settings')
        this.descriptionControl = this.settingsControl.input('Description', 'Display')
        this.gammaMapper = new GammaMapper(this.settingsControl)

        this.filterBufferPixelCount = 0
        this.emitColor = new Color(0, 0, 0, 1)

    }

    //(re)allocates the subpixel filtering buffers when they don't match the display size
    private allocateFilterBuffers() {
        const pixelCount = this.width * this.height
        if (pixelCount === this.filterBufferPixelCount)
            return

        this.filterBufferPixelCount = pixelCount
        this.bucketData = new Float32Array(pixelCount * FLOATS_PER_PIXEL)
        this.touchedPixels = new Int32Array(pixelCount)
        this.touchedPixelCount = 0
        this.touchedBuckets = new Uint16Array(pixelCount)
    }

    //bbox of a display is the whole screen
    bbox() {
        return {
            xMin: 0,
            yMin: 0,
            xMax: this.width - 1,
            yMax: this.height - 1
        }
    }

    //recursively renders all pixels in this pixeltree.
    //Subpixel filtering is enabled by the animation, via Scheduler.setSubpixelFiltering()
    render(container: PixelList, subpixelFiltering: boolean) {
        if (subpixelFiltering)
            this.renderFiltered(container)
        else
            this.renderDirect(container)
    }

    //recursively hands all pixels straight to the driver, which floors the coordinates
    private renderDirect(container: PixelList) {
        for (const p of container) {
            if (p instanceof Pixel) {
                if (p.color.a !== 0) {
                    this.setPixel(p.x, p.y, p.color)
                    // this.colors.add(p.color)
                }
            } else if (p instanceof PixelList) {
                this.renderDirect(p)
            }
        }
    }

    /**
     * Renders the pixeltree with fractional coordinates spread over the pixels they overlap, so
     * slowly moving content moves smoothly instead of jumping a whole pixel at a time.
     *
     * A pixel at x=10.3 lands for 70% on pixel 10 and for 30% on pixel 11. Those contributions have
     * to be *added*, not alphablended over each other: two neighbouring source pixels both land
     * partly on the same display pixel, and blending them would leave the inside of a solid shape
     * dimmer than it is (down to 75% at half a pixel offset), so it would pulse while scrolling.
     *
     * Adding is only correct for content that lies next to each other though, otherwise content stops
     * covering what is behind it. Both cases look the same once you only count *how much* of a
     * display pixel is covered, so we also keep track of *where* inside it each contribution lands.
     *
     * A source pixel is rounded to a home display pixel, which leaves it at most half a pixel off, so
     * it can only ever spill into the 8 pixels directly around that home. Every display pixel
     * therefore has 9 accumulators, one per direction a contribution can arrive from, and that
     * direction tells us which part of the pixel gets covered: a contribution arriving from the left
     * covers the left edge, one from the home pixel itself covers the middle, and so on.
     * Contributions landing in the same accumulator cover the same part, so they overlap and are
     * alphablended in draw order, letting the last one win. Contributions in different accumulators
     * lie next to each other and are added. Draw order is therefore respected at every depth of the
     * tree, exactly like renderDirect() does, and sublists need no special treatment.
     *
     * Two shapes with a *different* subpixel offset can still overlap while landing in different
     * accumulators. Their coverage then adds up to more than the whole pixel and emitPixels() scales
     * it back, which averages them instead of letting the front one occlude. All pixels of one shape
     * share the same offset, so this only shows up where independently positioned content overlaps.
     */
    private renderFiltered(container: PixelList) {
        this.allocateFilterBuffers()
        this.accumulateList(container)
        this.emitPixels()
    }

    //recursively accumulates the whole pixeltree, in draw order
    private accumulateList(container: PixelList) {
        for (const p of container) {
            if (p instanceof Pixel)
                this.accumulatePixel(p)
            else if (p instanceof PixelList)
                this.accumulateList(p)
        }
    }


    //spreads one pixel over the (up to four) display pixels it overlaps
    private accumulatePixel(p: Pixel) {
        if (p.color.a === 0)
            return

        //rounding to a home pixel keeps the offset within half a pixel, so a pixel never spills
        //further than its direct neighbours
        const homeX = Math.round(p.x)
        const homeY = Math.round(p.y)
        const offsetX = p.x - homeX
        const offsetY = p.y - homeY

        const spillX = Math.sign(offsetX)
        const spillY = Math.sign(offsetY)
        const spillPartX = Math.abs(offsetX)
        const spillPartY = Math.abs(offsetY)
        const homePartX = 1 - spillPartX
        const homePartY = 1 - spillPartY

        //the direction is seen from the display pixel, so it points back at the home pixel
        this.accumulateContribution(homeX, homeY, bucketIndex(0, 0), p.color, homePartX * homePartY)

        if (spillPartX)
            this.accumulateContribution(homeX + spillX, homeY, bucketIndex(-spillX, 0), p.color, spillPartX * homePartY)

        if (spillPartY) {
            this.accumulateContribution(homeX, homeY + spillY, bucketIndex(0, -spillY), p.color, homePartX * spillPartY)
            if (spillPartX)
                this.accumulateContribution(homeX + spillX, homeY + spillY, bucketIndex(-spillX, -spillY), p.color, spillPartX * spillPartY)
        }
    }

    private accumulateContribution(x: number, y: number, bucket: number, color: ColorInterface, overlap: number) {
        //how much of the display pixel this contribution covers opaquely
        const coverage = overlap * color.a
        if (coverage < minVisibleWeight)
            return

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return

        const pixelOffset = x + y * this.width
        const wasTouched = this.touchedBuckets[pixelOffset]
        if (wasTouched === 0)
            this.touchedPixels[this.touchedPixelCount++] = pixelOffset
        this.touchedBuckets[pixelOffset] = wasTouched | (1 << bucket)

        //the same accumulator means the same part of the display pixel, so this contribution covers
        //whatever was drawn there before it
        const slot = pixelOffset * FLOATS_PER_PIXEL + bucket * FLOATS_PER_BUCKET
        const bucketData = this.bucketData
        const behind = 1 - coverage

        bucketData[slot] = bucketData[slot] * behind + color.r * coverage
        bucketData[slot + 1] = bucketData[slot + 1] * behind + color.g * coverage
        bucketData[slot + 2] = bucketData[slot + 2] * behind + color.b * coverage
        bucketData[slot + 3] = bucketData[slot + 3] * behind + coverage
    }

    //hands the accumulated pixels to the driver, one opaque pixel per lit display pixel, and clears
    //the accumulators again
    private emitPixels() {
        const bucketData = this.bucketData
        this.emitColor.a = 1

        for (let entry = 0; entry < this.touchedPixelCount; entry++) {
            const pixelOffset = this.touchedPixels[entry]
            const firstSlot = pixelOffset * FLOATS_PER_PIXEL

            //the accumulators hold different parts of the display pixel, so they add up
            let red = 0
            let green = 0
            let blue = 0
            let coverage = 0
            for (let remainingBuckets = this.touchedBuckets[pixelOffset]; remainingBuckets !== 0;) {
                //take the lowest bucket thats still set, and clear it from the mask
                const lowestBucket = remainingBuckets & -remainingBuckets
                remainingBuckets = remainingBuckets ^ lowestBucket

                const slot = firstSlot + (31 - Math.clz32(lowestBucket)) * FLOATS_PER_BUCKET
                red += bucketData[slot]
                green += bucketData[slot + 1]
                blue += bucketData[slot + 2]
                coverage += bucketData[slot + 3]

                bucketData[slot] = 0
                bucketData[slot + 1] = 0
                bucketData[slot + 2] = 0
                bucketData[slot + 3] = 0
            }

            //More than fully covered means content with different subpixel offsets overlaps here.
            //Scaling back to full coverage averages their colors, instead of summing them towards white.
            if (coverage > 1) {
                red = red / coverage
                green = green / coverage
                blue = blue / coverage
            }

            this.emitColor.r = red
            this.emitColor.g = green
            this.emitColor.b = blue

            const y = ~~(pixelOffset / this.width)
            this.setPixel(pixelOffset - y * this.width, y, this.emitColor)

            this.touchedBuckets[pixelOffset] = 0
        }

        this.touchedPixelCount = 0
    }

    status() {
        // console.log("Matrix pixels: ", this.size);
    }

    /*
     * Connection state, answered by the driver.
     *
     * The two look similar but answer different questions, on different timescales:
     *
     * isOnline() - "is there a display out there at all?"
     *   Slow, coarse, and meant for the *user*: the web GUI shows it as online/offline plus a
     *   "last seen" time. It changes when hardware connects, disconnects or disappears, so it is
     *   polled once per second (see server.ts) and it is fine for it to be a bit conservative.
     *
     * isReady() - "may I hand it the next frame right now?"
     *   Fast, per-frame flow control, and meant for the *renderer*: RenderRealtime does not step the
     *   animation at all while the primary display is not ready, so this is what keeps a buffering
     *   display from being flooded and what pauses the animation when nobody can show it.
     *   It is asked every frame and must stay cheap.
     *
     * A display that is offline is never ready (the default below encodes that), but an online
     * display is regularly not ready: its socket buffer is full, or it is playing from its own flash.
     * Drivers that just fire frames off (UDP, files, websockets) need neither and inherit both.
     */

    //Drivers that can lose their connection override this. Drivers that are always available stay online.
    isOnline(): boolean {
        return true
    }

    //Drivers that need flow control (backpressure, an ack, a buffer that has to drain) override this.
    isReady(): boolean {
        return this.isOnline()
    }

    //Called by the status poller in server.ts, so drivers can drop a connection that looks open but
    //is not carrying data anymore. Doing this from a poll instead of from frame() is what makes it
    //work at all: a display that stops draining stops being ready, and then it gets no more frames.
    disconnectIfDead() {
    }



    //implemed in driver subclass:

    //set a pixel with specified color, called for all pixels by render()
    abstract setPixel(x: number, y: number, color: ColorInterface);

    //should send the current rendered frame buffer and clear the buffer
    //Parameter is absolute time in uS when the frame should be rendered.
    //For pre-rendeers this starts counting at 0, for live renders this is the systemtime.
    //Should return the number of bytes processed (for stats)
    abstract frame(displayTimeMicros: number):number

}

