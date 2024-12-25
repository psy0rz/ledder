import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"


export class DisplayQOISbuffer extends DisplayQOIS {

    private buffer:number[]

    /**
     Adds QOIS frames to specified buffer. (never cleans it)
     * @param mapper Offset mapper that determines the width and height, and which coordinate belongs to with offset in the display buffer.
     @param pixelsPerChannel Number of pixels per channel you want to use. Doesnt have to correspondent with how you compiled ledder, leds will be skipped/cropped. Or 0 to use all the leds available in the firmware.
     */
    constructor(buffer:number[], mapper: OffsetMapper, pixelsPerChannel,maxFps=60) {
        super(mapper, pixelsPerChannel)

        this.minFrameTimeMicros = ~~(1000000 / maxFps)
        this.defaultFrameTimeMicros = this.minFrameTimeMicros

        this.buffer=buffer



    }


    frame(displayTime: number) {

        displayTime = displayTime / 1000


        this.encode(this.buffer, displayTime)


    }

}
