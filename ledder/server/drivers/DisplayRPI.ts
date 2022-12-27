import Display from "../../Display.js"
import leds from "rpi-ws281x-smi"
import OffsetMapper from "./OffsetMapper.js"


/**
 * Uses rpi-ws281x-smi to drive up to 8 displays in parallel.
 * All displays should be oriented from left to right, starting with channel 0.
 */
export class DisplayRPI extends Display {

    rows: number
    cols: number
    displayWidth: number
    displayHeight: number

    /*
        width,height: Total display size of everything stacked together.

        ledsPerChannel: Every channel has this amount of leds.
        mapper: OffsetMapper

        It will divide/modulo the mapper-result to get the correct channel and offset.
        Its up to you to configure the mapper in a way that makes sense for your display layout.

     */
    private offsetMapper: OffsetMapper
    private ledsPerChannel: number

    constructor(width, height, ledsPerChannel, mapper: OffsetMapper) {

        super(width, height)

        //width and height is the size of one strip on one channel. e.g. one display
        leds.init(ledsPerChannel)
        this.offsetMapper = mapper
        this.ledsPerChannel = ledsPerChannel

    }

    setPixel(x, y, color) {

        const floor_x=~~x
        const floor_y=~~y

        if (floor_x<0 || floor_y<0 || floor_x>=this.width || floor_y>=this.height)
            return

        const offset = this.offsetMapper[floor_x][floor_y]

        leds.setPixel(
            ~~(offset / this.ledsPerChannel), // channel
            offset % this.ledsPerChannel, //led nr
            this.gammaMapper[Math.round(color.r)],
            this.gammaMapper[Math.round(color.g)],
            this.gammaMapper[Math.round(color.b)],
            color.a
        )

        // leds.setPixel()

    }


    frame() {

        leds.send() //timed exactly

        leds.clear()

    }


}


