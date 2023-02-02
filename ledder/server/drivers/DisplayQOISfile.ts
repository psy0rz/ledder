import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"

import {createWriteStream, WriteStream} from "fs"


export class DisplayQOISfile extends DisplayQOIS {

    byteStream: Array<number>
    private fh: WriteStream

    /**
     * QOIS file driver, used in for https://github.com/psy0rz/ledstream
     * Instead of streaming via UDP like DisplayQOISudp, this one writes frames to a file which can be uploaded.
     * Our side will create a list of pixels and send it to ledstream. (total of width * height pixels)
     * Ledstream will send these pixels to the ledstrips, starting with the first channel and filling them all up.
     * Use offset-mapper to make sure the pixels actually end up in the right position on your actual screen. :)
     * @param mapper Offset mapper that determines the width and height, and which coordinate belongs to with offset in the display buffer.
     * @param ips IP address
     * @param port UDP port
     */
    constructor(mapper: OffsetMapper) {
        super(mapper)


        this.frameRoundingMicros = 1000
        this.minFrameTimeMicros = ~~(1000000 / 120)


    }


    //QOIS FRAME:
    // [display time (2 bytes)][QOIS encoded bytes]

    frame(displayTime: number) {

        displayTime = displayTime / 1000

        const frameBytes = []

        // //frame byte length
        frameBytes.push(0) //0
        frameBytes.push(0) //1

        //time when to display frame
        frameBytes.push(displayTime & 0xff)
        frameBytes.push((displayTime >> 8) & 0xff)

        //encodes current frame via QIOS into bytes
        this.encode(frameBytes)

        // //update frame byte length
        frameBytes[0] = frameBytes.length & 0xff
        frameBytes[1] = (frameBytes.length >> 8) & 0xff


        this.fh.write(new Uint8Array(frameBytes))


    }

    openFile(filePath: string) {

        // this.fh = await open(filePath, 'w')
        this.fh=createWriteStream(filePath)
    }

     closeFile()
    {
        this.fh.close()
    }
}
