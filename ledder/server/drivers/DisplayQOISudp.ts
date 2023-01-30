// @ts-ignore
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
     */
    constructor(mapper:OffsetMapper, ips, port) {
        super(mapper)



        this.frameRoundingMicros=1000
        this.minFrameTimeMicros=~~(1000000/120)

        this.ips = ips
        this.port = port
        this.byteStream = []
        this.nextSyncOffset = 0
        this.packetNr = 0

        this.bufferEmptyTime = 0

        this.sockets = []
        for (const ip of ips) {

            const s = dgram.createSocket('udp4')
            s.connect(this.port, ip)

            this.sockets.push(s)
            s.on('error', (err) => {
                console.log(`server error:\n${err.stack}`)
            })

            s.on('connect', (e)=>{

                s.setSendBufferSize(1)

            })
        }

        // this.socket.connect(this.port, this.ips)
    }


    //UDP PACKET:
    //  [packetNr][reserved][current time (2 bytes)][syncoffset (2 bytes)][QOIS FRAME]
    //
    //QOIS FRAME:
    // [display time (2 bytes)][QOIS encoded bytes]

    frame(displayTime: number) {

        displayTime=displayTime/1000

        const frameBytes = []

        const maxFramesLag=6
        const maxTimeLag=500

        //buffer this many frames
        const lag = Math.min(maxTimeLag, maxFramesLag * this.defaultFrameTimeMicros/1000)

        //try to full up packets, but dont wait longer than this time:
        // const maxWait= (lag/2)  * this.frameMs
        const maxWait= ~~(lag/2)
        // const maxWait=0

        const laggedTime = displayTime + lag

        // //frame byte length
        frameBytes.push(0) //0
        frameBytes.push(0) //1

        //time when to display frame
        frameBytes.push(laggedTime & 0xff)
        frameBytes.push((laggedTime >> 8) & 0xff)

        //encodes current frame via QIOS into bytes
        this.encode(frameBytes)

        // //update frame byte length
        frameBytes[0] = frameBytes.length & 0xff
        frameBytes[1] = (frameBytes.length >> 8) & 0xff

        //the syncoffset is needed so that a display can pickup a stream thats already running, or if it lost packets
        this.nextSyncOffset = this.nextSyncOffset + frameBytes.length

        this.byteStream.push(...frameBytes)

        //is it time to send, or packet is full?

        while (((displayTime-this.bufferEmptyTime)>=maxWait && this.byteStream.length > 0) || this.byteStream.length >= qoisDataLength) {
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
                packet.push((time>>8) & 0xff)

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
            if (this.byteStream.length==0)
               this.bufferEmptyTime=displayTime


            // if (this.nextSyncOffset != 0) {
            //     this.nextSyncOffset = 0
            //     console.error("bug: sync offset not 0??")
            // }
        }
    }
}
