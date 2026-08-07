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
    //the per-frame clearing proportional to the number of lit pixels instead of the display size.
    //Allocated on first use and whenever the display changes size (the preview resizes to whatever
    //the browser asks for), so they always match the current width and height.
    private filterBufferPixelCount: number
    private layerRed: Float64Array
    private layerGreen: Float64Array
    private layerBlue: Float64Array
    private layerCoverage: Float64Array
    private layerTouched: Array<number>
    private frameRed: Float64Array
    private frameGreen: Float64Array
    private frameBlue: Float64Array
    private frameTouched: Array<number>
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
        this.layerRed = new Float64Array(pixelCount)
        this.layerGreen = new Float64Array(pixelCount)
        this.layerBlue = new Float64Array(pixelCount)
        this.layerCoverage = new Float64Array(pixelCount)
        this.layerTouched = []
        this.frameRed = new Float64Array(pixelCount)
        this.frameGreen = new Float64Array(pixelCount)
        this.frameBlue = new Float64Array(pixelCount)
        this.frameTouched = []
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

        for (const child of container) {
            if (child instanceof Pixel)
                this.accumulatePixel(child)
            else if (child instanceof PixelList) {
                //the loose pixels before this sublist are a layer below it
                this.compositeLayer()
                this.accumulateList(child)
                this.compositeLayer()
            }
        }

        //loose pixels after the last sublist
        this.compositeLayer()

        this.emitFrame()
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
        if (this.layerCoverage[offset] === 0)
            this.layerTouched.push(offset)

        this.layerRed[offset] += color.r * weight
        this.layerGreen[offset] += color.g * weight
        this.layerBlue[offset] += color.b * weight
        this.layerCoverage[offset] += weight
    }

    //alphablends the accumulated layer over the frame so far, and clears the layer
    private compositeLayer() {
        for (const offset of this.layerTouched) {
            let coverage = this.layerCoverage[offset]
            let red = this.layerRed[offset]
            let green = this.layerGreen[offset]
            let blue = this.layerBlue[offset]

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
                this.frameTouched.push(offset)
            }

            this.frameRed[offset] = this.frameRed[offset] * behind + red
            this.frameGreen[offset] = this.frameGreen[offset] * behind + green
            this.frameBlue[offset] = this.frameBlue[offset] * behind + blue

            this.layerRed[offset] = 0
            this.layerGreen[offset] = 0
            this.layerBlue[offset] = 0
            this.layerCoverage[offset] = 0
        }

        this.layerTouched.length = 0
    }

    //hands the composited frame to the driver, one opaque pixel per lit display pixel
    private emitFrame() {
        this.emitColor.a = 1

        for (const offset of this.frameTouched) {
            this.emitColor.r = this.frameRed[offset]
            this.emitColor.g = this.frameGreen[offset]
            this.emitColor.b = this.frameBlue[offset]

            const y = ~~(offset / this.width)
            this.setPixel(offset - y * this.width, y, this.emitColor)

            this.frameRed[offset] = 0
            this.frameGreen[offset] = 0
            this.frameBlue[offset] = 0
            this.frameIsTouched[offset] = 0
        }

        this.frameTouched.length = 0
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

