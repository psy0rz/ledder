import dgram from "dgram"

import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"

const qoisDataLength = 1460 - 6 //6 bytes package-frame overhead


export class DisplayQOISudp extends DisplayQOIS {

    sockets: Array<dgram.Socket>
    ips: string
    port: number
    byteStream: Array<number>
    // syncOffset: number
    nextSyncOffset: number

    packetNr: number
    private bufferEmptyTime: number

    /**
     * Matrix driver for https://github.com/psy0rz/ledstream
     * Our side will create a list of pixels and send it to ledstream. (total of width * height pixels)
     * Ledstream will send these pixels to the ledstrips, starting with the first channel and filling them all up.
     * Use offset-mapper to make sure the pixels actually end up in the right position on your actual screen. :)
     * @param mapper Offset mapper that determines the width and height, and which coordinate belongs to with offset in the display buffer.
     * @param ips IP address
     * @param port UDP port
     * @param pixelsPerChannel Number of pixels per channel you want to use. Doesnt have to correspondent with how you compiled ledder, leds will be skipped/cropped. Or 0 to use all the leds available in the firmware.
     * @param maxFps Maximum frames per second. This depends on the total leds and leds per channel (512 leds per channel is max 58fps or less). We use 50fps to be on the safe side. Keep an eye ledstream and see if the udpbuffer keeps overflowing.
     */
    constructor(mapper: OffsetMapper, ips, port, pixelsPerChannel = 0, maxFps=50) {
        super(mapper, pixelsPerChannel)


        // this.defaultFrameTimeMicros=~~(1000000/1)

        console.log("was", this.defaultFrameTimeMicros)

        this.frameRoundingMicros = 1000

        this.minFrameTimeMicros = ~~(1000000 / maxFps)
        this.defaultFrameTimeMicros = this.minFrameTimeMicros

        this.ips = ips
        this.port = port
        this.byteStream = []
        this.nextSyncOffset = 0
        this.packetNr = 0

        this.bufferEmptyTime = 0

        this.sockets = []
        for (const ip of ips)
        {

            const s = dgram.createSocket('udp4')
            s.connect(this.port, ip)

            this.sockets.push(s)
            s.on('error', (err) => {
                console.log(`server error:\n${err.stack}`)
            })

            s.on('connect', (e) => {

                s.setSendBufferSize(1)

            })
        }

        // this.socket.connect(this.port, this.ips)
    }

    //QOIS FRAME:
    // - frame length: 2 bytes
    // - pixels per channel: 2 bytes
    // - display time: 2 bytes
    // - QOIS encoded bytes

    //UDP PACKET:
    // - packetNr: 1 byte
    // - reserved: 1 bytes
    // - current time: 2 bytes
    // - syncoffset: 2 bytes (offset of next QOIS frame start)
    // - [QOIS FRAMES]: multiple frames, until packet is full. can also be partial frame if its too big.

    frame(displayTime: number) {

        displayTime = displayTime / 1000

        const frameBytes = []

        const maxFramesLag = 12
        const maxTimeLag = 250

        //buffer this many frames
        const lag = Math.min(maxTimeLag, maxFramesLag * this.defaultFrameTimeMicros / 1000)
        // console.log("Max lag", lag)

        //try to full up packets, but dont wait longer than this time:
        // const maxWait= (lag/2)  * this.frameMs
        // const maxWait = ~~(lag / 2)
        const maxWait=0

        const laggedTime = displayTime + lag

        //encodes current frame via QIOS into bytes
        if (this.encode(frameBytes, laggedTime)  ) {

            //the syncoffset is needed so that a display can pickup a stream thats already running, or if it lost packets
            this.nextSyncOffset = this.nextSyncOffset + frameBytes.length

            this.byteStream.push(...frameBytes)
        }

        //is it time to send, or packet is full?

        while (((displayTime - this.bufferEmptyTime) >= maxWait && this.byteStream.length > 0) || this.byteStream.length >= qoisDataLength) {
            // if ( this.byteStream.length ) {


            //send next packet
            try {

                const time = Date.now()

                const packet = []

                //packet byte 0
                //add packet nr
                packet.push(this.packetNr & 0xff)
                this.packetNr++

                //packet byte 1
                //reserved
                packet.push(0)

                //packet byte 2-3
                //current time
                packet.push(time & 0xff)
                packet.push((time >> 8) & 0xff)

                //packet byte 4-5
                //add current syncoffset
                packet.push(this.nextSyncOffset & 0xff)
                packet.push((this.nextSyncOffset >> 8) & 0xff)
                // this.syncOffset = this.nextSyncOffset

                const payload = this.byteStream.splice(0, qoisDataLength)
                //packet byte 6-...
                packet.push(...payload)
                this.nextSyncOffset = this.nextSyncOffset - payload.length

                const p = Uint8Array.from(packet)
                for (const s of this.sockets) {
                    try {
                        s.send(p)
                    } catch (e) {
                        // console.error("MatrixLedstream: send error ",e)
                    }
                }
            } catch (e) {
                console.error("MatrixLedstream: error: " + e)
            }
            if (this.byteStream.length == 0)
                this.bufferEmptyTime = displayTime


            // if (this.nextSyncOffset != 0) {
            //     this.nextSyncOffset = 0
            //     console.error("bug: sync offset not 0??")
            // }
        }
    }
}
