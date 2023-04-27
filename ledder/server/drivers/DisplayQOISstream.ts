import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"

import {createWriteStream, WriteStream} from "fs"

//Renders a animation to a writestream. Used to do static rendering/uploading
//Note: user of this class is responsible for creating fh.
export class DisplayQOISstream extends DisplayQOIS {

    public writeCallback: (Uint8Array)=>void

    /**
     * QOIS file driver, used in for https://github.com/psy0rz/ledstream
     * Instead of streaming via UDP like DisplayQOISudp, this one writes frames to a writestream.
     * @param mapper Offset mapper that determines the width and height, and which coordinate belongs to with offset in the display buffer.
     @param pixelsPerChannel Number of pixels per channel you want to use. Doesnt have to correspondent with how you compiled ledder, leds will be skipped/cropped. Or 0 to use all the leds available in the firmware.
     */
    constructor(mapper: OffsetMapper, pixelsPerChannel,maxFps=50) {
        super(mapper, pixelsPerChannel)

        this.minFrameTimeMicros = ~~(1000000 / maxFps)
        this.defaultFrameTimeMicros = this.minFrameTimeMicros



    }


    //QOIS FRAME:
    // [display time (2 bytes)][QOIS encoded bytes]

    frame(displayTime: number) {

        displayTime = displayTime / 1000

        const frameBytes = []

        this.encode(frameBytes, displayTime)

        this.writeCallback(new Uint8Array(frameBytes))


    }

}
