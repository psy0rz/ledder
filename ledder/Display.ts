import PixelList from "./PixelList.js"
import type ColorInterface from "./ColorInterface.js"
import Pixel from "./Pixel.js"
import GammaMapper from "./server/drivers/GammaMapper.js"

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

    //set in server.ts
    gammaMapper: GammaMapper

    //indicdates the display is ready for the next frame.
    //The renderer will pause until its ready. (only for primary displays)
    ready: boolean


    protected constructor(width, height) {

        this.width = width
        this.height = height

        this.xMin = 0
        this.yMin = 0
        this.xMax = width - 1
        this.yMax = height - 1

        this.ready=true

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
        for (const p of container) {
            if (p instanceof Pixel) {
                if (p.color.a !== 0) {
                    this.setPixel(p.x, p.y, p.color)
                    // this.colors.add(p.color)
                }
            } else if (p instanceof PixelList) {
                this.render(p)
            }
        }
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

