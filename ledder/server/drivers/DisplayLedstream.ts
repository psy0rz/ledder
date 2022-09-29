// @ts-ignore
import dgram from "dgram"

import {DisplayQOIS} from "../DisplayQOIS.js"
import OffsetMapper from "./OffsetMapper.js"

const qoisDataLength = 1460 - 4 //4 bytes overhead


//NOTE: This needs a  MulticastSyncer as well.
export class DisplayLedstream extends DisplayQOIS {

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
     * We assume it has a Left/Right zigzag pattern, with multiple channels stacked vertically
     * @param channels Number of channels (zigzag ledstrips)
     * @param width Physical width of display.
     * @param height Physical height of display. (divded over multiple channels)
     * @param ips IP address
     * @param port UDP port
     */
    constructor(channels, width, height, ips, port, mapper: OffsetMapper) {
        super(width, height, mapper)


        this.roundFrametime = true

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
    //  [packetNr][reserved][syncoffset (2 bytes)][QOIS FRAME]
    //
    //QOIS FRAME:
    // [display time (2 bytes)][QOIS encoded bytes]

    frame(displayTime: number) {

        const frameBytes = []

        const maxFramesLag=20
        const maxTimeLag=500

        //buffer this many frames
        const lag = Math.min(maxTimeLag, maxFramesLag * this.frameMs)

        //try to full up packets, but dont wait longer than this time:
        // const maxWait= (lag/2)  * this.frameMs
        const maxWait= ~~(lag/4)
        // const maxWait=0

        const laggedTime = displayTime + lag

        // //frame byte length
        frameBytes.push(0) //0
        frameBytes.push(0) //1

        //time
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

                //add packet nr
                packet.push(this.packetNr & 0xff)
                this.packetNr++

                //reserved
                packet.push(0)

                //time
                // packet.push(time & 0xff)
                // packet.push((time>>8) & 0xff)

                //add current syncoffset
                packet.push(this.nextSyncOffset & 0xff)
                packet.push((this.nextSyncOffset >> 8) & 0xff)
                // this.syncOffset = this.nextSyncOffset

                const payload = this.byteStream.splice(0, qoisDataLength)
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
