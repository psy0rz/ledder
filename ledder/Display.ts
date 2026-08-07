import PixelList from "./PixelList.js"
import type ColorInterface from "./ColorInterface.js"
import Pixel from "./Pixel.js"
import Color from "./Color.js"
import GammaMapper from "./server/drivers/GammaMapper.js"
import ControlGroup from "./ControlGroup.js";
import type ControlInput from "./ControlInput.js";
import type ControlSwitch from "./ControlSwitch.js";

//A contribution below this weight can never change an 8-bit channel value, so it's dropped. This
//also swallows the tiny float drift that pixels pick up from being moved by fractions repeatedly.
const minVisibleWeight = 1 / 512

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


    //indicdates the display is ready for the next frame.
    //The renderer will pause until its ready. (only for primary displays)
    ready: boolean

    id: string

    public descriptionControl: ControlInput
    public settingsControl: ControlGroup
    public subpixelFilteringControl: ControlSwitch
    protected gammaMapper: GammaMapper

    //Accumulation buffers for subpixel filtering, see renderFiltered(). The layer buffers hold
    //premultiplied color (color * weight) and the summed coverage of the layer being accumulated;
    //the frame buffers hold the layers composited over each other so far. The touched-lists keep
    //the per-frame clearing proportional to the number of lit pixels instead of the display size;
    //they can never hold more than one entry per display pixel, so they are preallocated at that
    //size and used up to their own counter instead of being grown and truncated every frame.
    //Allocated on first use and whenever the display changes size (the preview resizes to whatever
    //the browser asks for), so they always match the current width and height.
    //Red, green, blue and coverage are interleaved per display pixel rather than kept in four
    //separate arrays, so accumulating one pixel touches one cache line instead of four.
    private filterBufferPixelCount: number
    private layerData: Float32Array
    private layerTouched: Int32Array
    private layerTouchedCount: number
    private frameData: Float32Array
    private frameTouched: Int32Array
    private frameTouchedCount: number
    private frameIsTouched: Uint8Array
    private emitColor: Color

    protected constructor(width, height) {

        this.width = width
        this.height = height

        this.xMin = 0
        this.yMin = 0
        this.xMax = width - 1
        this.yMax = height - 1

        this.ready=true

        this.id="unknown"

        this.settingsControl = new ControlGroup('Display settings')
        this.descriptionControl = this.settingsControl.input('Description', 'Display')
        this.gammaMapper = new GammaMapper(this.settingsControl)
        this.subpixelFilteringControl = this.settingsControl.switch('Subpixel filtering', false, false)

        this.filterBufferPixelCount = 0
        this.emitColor = new Color(0, 0, 0, 1)

    }

    //(re)allocates the subpixel filtering buffers when they don't match the display size
    private allocateFilterBuffers() {
        const pixelCount = this.width * this.height
        if (pixelCount === this.filterBufferPixelCount)
            return

        this.filterBufferPixelCount = pixelCount
        this.layerData = new Float32Array(pixelCount * 4)
        this.layerTouched = new Int32Array(pixelCount)
        this.layerTouchedCount = 0
        this.frameData = new Float32Array(pixelCount * 4)
        this.frameTouched = new Int32Array(pixelCount)
        this.frameTouchedCount = 0
        this.frameIsTouched = new Uint8Array(pixelCount)
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

    //recursively renders all pixels in this pixeltree
    render(container: PixelList) {
        if (this.subpixelFilteringControl.enabled)
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
     * Adding is only correct within one layer though, otherwise content stops covering what is
     * behind it. So every sublist directly under the rendered container is a layer of its own: it is
     * accumulated on its own and then alphablended over the result of the previous layers, which
     * keeps the existing behaviour between layers. Loose pixels directly under the container share
     * one layer with the loose pixels next to them.
     */
    private renderFiltered(container: PixelList) {
        this.allocateFilterBuffers()

        //A layer is only composited once the *next* one starts, so that a container holding a single
        //layer (by far the common case) never touches the frame buffer at all and can be handed to
        //the driver straight from the layer buffer, saving a whole pass over the lit pixels.
        let pendingLayerIsSublist = false

        for (const child of container) {
            if (child instanceof Pixel) {
                //loose pixels are a layer above the sublist before them, not part of it
                if (pendingLayerIsSublist) {
                    this.compositeLayer()
                    pendingLayerIsSublist = false
                }
                this.accumulatePixel(child)
            } else if (child instanceof PixelList) {
                this.compositeLayer()
                this.accumulateList(child)
                pendingLayerIsSublist = true
            }
        }

        if (this.frameTouchedCount === 0)
            this.emitLayer()
        else {
            this.compositeLayer()
            this.emitFrame()
        }
    }

    //recursively accumulates a whole layer
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

        //floor instead of truncate, so a pixel just off the left or top edge stays off it
        const left = Math.floor(p.x)
        const top = Math.floor(p.y)
        const rightPart = p.x - left
        const bottomPart = p.y - top
        const leftPart = 1 - rightPart
        const topPart = 1 - bottomPart

        this.accumulateContribution(left, top, p.color, leftPart * topPart)
        if (rightPart)
            this.accumulateContribution(left + 1, top, p.color, rightPart * topPart)
        if (bottomPart) {
            this.accumulateContribution(left, top + 1, p.color, leftPart * bottomPart)
            if (rightPart)
                this.accumulateContribution(left + 1, top + 1, p.color, rightPart * bottomPart)
        }
    }

    private accumulateContribution(x: number, y: number, color: ColorInterface, overlap: number) {
        const weight = overlap * color.a
        if (weight < minVisibleWeight)
            return

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return

        const offset = x + y * this.width
        const slot = offset * 4
        const layerData = this.layerData

        if (layerData[slot + 3] === 0)
            this.layerTouched[this.layerTouchedCount++] = offset

        layerData[slot] += color.r * weight
        layerData[slot + 1] += color.g * weight
        layerData[slot + 2] += color.b * weight
        layerData[slot + 3] += weight
    }

    //alphablends the accumulated layer over the frame so far, and clears the layer
    private compositeLayer() {
        const layerData = this.layerData
        const frameData = this.frameData

        for (let entry = 0; entry < this.layerTouchedCount; entry++) {
            const offset = this.layerTouched[entry]
            const slot = offset * 4

            let coverage = layerData[slot + 3]
            let red = layerData[slot]
            let green = layerData[slot + 1]
            let blue = layerData[slot + 2]

            //More than fully covered means opaque pixels of the same layer overlap here. Scaling
            //back to full coverage averages their colors, instead of summing them towards white.
            if (coverage > 1) {
                red = red / coverage
                green = green / coverage
                blue = blue / coverage
                coverage = 1
            }

            const behind = 1 - coverage
            if (!this.frameIsTouched[offset]) {
                this.frameIsTouched[offset] = 1
                this.frameTouched[this.frameTouchedCount++] = offset
            }

            frameData[slot] = frameData[slot] * behind + red
            frameData[slot + 1] = frameData[slot + 1] * behind + green
            frameData[slot + 2] = frameData[slot + 2] * behind + blue

            layerData[slot] = 0
            layerData[slot + 1] = 0
            layerData[slot + 2] = 0
            layerData[slot + 3] = 0
        }

        this.layerTouchedCount = 0
    }

    //hands a single accumulated layer straight to the driver, skipping the frame buffer
    private emitLayer() {
        const layerData = this.layerData
        this.emitColor.a = 1

        for (let entry = 0; entry < this.layerTouchedCount; entry++) {
            const offset = this.layerTouched[entry]
            const slot = offset * 4

            const coverage = layerData[slot + 3]
            //see compositeLayer(): overlapping opaque pixels are averaged, not summed
            const scale = coverage > 1 ? 1 / coverage : 1

            this.emitColor.r = layerData[slot] * scale
            this.emitColor.g = layerData[slot + 1] * scale
            this.emitColor.b = layerData[slot + 2] * scale

            const y = ~~(offset / this.width)
            this.setPixel(offset - y * this.width, y, this.emitColor)

            layerData[slot] = 0
            layerData[slot + 1] = 0
            layerData[slot + 2] = 0
            layerData[slot + 3] = 0
        }

        this.layerTouchedCount = 0
    }

    //hands the composited frame to the driver, one opaque pixel per lit display pixel
    private emitFrame() {
        this.emitColor.a = 1

        const frameData = this.frameData

        for (let entry = 0; entry < this.frameTouchedCount; entry++) {
            const offset = this.frameTouched[entry]
            const slot = offset * 4

            this.emitColor.r = frameData[slot]
            this.emitColor.g = frameData[slot + 1]
            this.emitColor.b = frameData[slot + 2]

            const y = ~~(offset / this.width)
            this.setPixel(offset - y * this.width, y, this.emitColor)

            frameData[slot] = 0
            frameData[slot + 1] = 0
            frameData[slot + 2] = 0
            this.frameIsTouched[offset] = 0
        }

        this.frameTouchedCount = 0
    }

    status() {
        // console.log("Matrix pixels: ", this.size);
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

