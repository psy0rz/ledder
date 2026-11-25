import Display from "../../Display.js"

// @ts-ignore
import leds from "rpi-ws281x-smi"
import OffsetMapper from "./OffsetMapper.js"




/**
 * Uses rpi-ws281x-smi to drive up to 8 displays in parallel.
 * All displays should be oriented from left to right, starting with channel 0.
 * https://github.com/psy0rz/rpi-ws281x-smi
 */
export class DisplayRPI extends Display {


    /*

        ledsPerChannel: Every channel has this amount of leds.
        mapper: OffsetMapper

        It will divide/modulo the mapper-result to get the correct channel and offset.
        Its up to you to configure the mapper in a way that makes sense for your display layout.

     */
    private mapper: OffsetMapper
    private pixelsPerChannel: number
    private rgbOrder:number

    constructor(mapper:OffsetMapper, pixelsPerChannel:number, rgbOrder=0) {

        super(mapper.width, mapper.height)
        this.rgbOrder=rgbOrder;

        this.id=`RPI`
        this.descriptionControl.text=`RPI`


        //width and height is the size of one strip on one channel. e.g. one display
        leds.init(pixelsPerChannel)
        this.mapper = mapper
        this.pixelsPerChannel = pixelsPerChannel

    }

    setPixel(x, y, color) {

        const floor_x=~~x
        const floor_y=~~y

        if (floor_x<0 || floor_y<0 || floor_x>=this.width || floor_y>=this.height)
            return

        const offset = this.mapper[floor_x][floor_y]

        /**
        * For compatibility reasons 0 = RGB 1 = GRB
        * 0 = RGB
        * 1 = GRB
        * 2 = RBG
        * 3 = GBR
        * 4 = BRG
        * 5 = BGR
        */

        switch (this.rgbOrder) {
            case 0:
                leds.setPixel(
                    ~~(offset / this.pixelsPerChannel), // channel
                    offset % this.pixelsPerChannel, //led nr
                    this.gammaMapper[Math.round(color.r)],
                    this.gammaMapper[Math.round(color.g)],
                    this.gammaMapper[Math.round(color.b)],
                    color.a
                )
                break;
            case 1:
                leds.setPixel(
                    ~~(offset / this.pixelsPerChannel), // channel
                    offset % this.pixelsPerChannel, //led nr
                    this.gammaMapper[Math.round(color.g)],
                    this.gammaMapper[Math.round(color.r)],
                    this.gammaMapper[Math.round(color.b)],
                    color.a
                )
                break;
            case 2:
                leds.setPixel(
                    ~~(offset / this.pixelsPerChannel), // channel
                    offset % this.pixelsPerChannel, //led nr
                    this.gammaMapper[Math.round(color.r)],
                    this.gammaMapper[Math.round(color.b)],
                    this.gammaMapper[Math.round(color.g)],
                    color.a
                )
                break;
            case 3:
                leds.setPixel(
                    ~~(offset / this.pixelsPerChannel), // channel
                    offset % this.pixelsPerChannel, //led nr
                    this.gammaMapper[Math.round(color.b)],
                    this.gammaMapper[Math.round(color.r)],
                    this.gammaMapper[Math.round(color.g)],
                    color.a
                )
                break;
            case 4:
                leds.setPixel(
                    ~~(offset / this.pixelsPerChannel), // channel
                    offset % this.pixelsPerChannel, //led nr
                    this.gammaMapper[Math.round(color.g)],
                    this.gammaMapper[Math.round(color.r)],
                    this.gammaMapper[Math.round(color.b)],
                    color.a
                )
                break;
            case 5:
                leds.setPixel(
                    ~~(offset / this.pixelsPerChannel), // channel
                    offset % this.pixelsPerChannel, //led nr
                    this.gammaMapper[Math.round(color.b)],
                    this.gammaMapper[Math.round(color.g)],
                    this.gammaMapper[Math.round(color.r)],
                    color.a
                )
                break;
            default:
                leds.setPixel(
                    ~~(offset / this.pixelsPerChannel), // channel
                    offset % this.pixelsPerChannel, //led nr
                    this.gammaMapper[Math.round(color.r)],
                    this.gammaMapper[Math.round(color.g)],
                    this.gammaMapper[Math.round(color.b)],
                    color.a
                )
        }

    }


    frame() {

        leds.send() //timed exactly

        leds.clear()

        return 0
    }


}


