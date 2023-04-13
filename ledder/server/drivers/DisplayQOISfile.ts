import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"

import {createWriteStream, WriteStream} from "fs"


export class DisplayQOISfile extends DisplayQOIS {

    byteStream: Array<number>
    private fh: WriteStream

    /**
     * QOIS file driver, used in for https://github.com/psy0rz/ledstream
     * Instead of streaming via UDP like DisplayQOISudp, this one writes frames to a file which can be uploaded.
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

        this.fh.write(new Uint8Array(frameBytes))


    }

    openFile(filePath: string) {

        // this.fh = await open(filePath, 'w')
        this.fh = createWriteStream(filePath)
    }

    closeFile() {
        this.fh.close()
    }
}
