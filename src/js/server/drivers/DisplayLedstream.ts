// @ts-ignore
import dgram from "dgram"

import {DisplayQOIS} from "../DisplayQOIS.js"
import GammaMapper from "./GammaMapper"
import OffsetMapper from "./OffsetMapper"

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
    private sendTime: number

    /**
     * Matrix driver for https://github.com/psy0rz/ledstream
     * We assume it has a Left/Right zigzag pattern, with multiple channels stacked vertically
     * @param channels Number of channels (zigzag ledstrips)
     * @param width Physical width of display.
     * @param height Physical height of display. (divded over multiple channels)
     * @param ips IP address
     * @param port UDP port
     */
    constructor(channels, width, height, ips, port, mapper: OffsetMapper, gamma:GammaMapper) {
        super(width, height, mapper, gamma)


        this.roundFrametime = true

        this.ips = ips
        this.port = port
        this.byteStream = []
        this.nextSyncOffset = 0
        this.packetNr = 0

        this.sendTime=0

        this.sockets = []
        for (const ip of ips) {

            const s = dgram.createSocket('udp4')
            s.connect(this.port, ip)

            this.sockets.push(s)
            s.on('error', (err) => {
                console.log(`server error:\n${err.stack}`)
            })
        }

        // this.socket.connect(this.port, this.ips)
    }


    //udp packet:
    //  [packetNr][reserved][syncoffset (2 bytes)][QOIS FRAME]
    //
    //qois frame:
    // [display time (4 bytes)][QOIS encoded bytes]

    frame(displayTime: number) {

        const frameBytes = []

        // const lag = 16 * 30 //30 frames lag
        const lag = 20 * this.frameMs
        const laggedTime = displayTime + lag
        //first frame to be pushed? determine sendTime
        if (this.byteStream.length == 0)
            this.sendTime = displayTime + 0 * this.frameMs

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

        //is it time to send?

        if (displayTime >= this.sendTime) {
            //break up into packets and send.
            while (this.byteStream.length > 0) {

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
            }
            if (this.nextSyncOffset != 0) {
                this.nextSyncOffset = 0
                console.error("bug: sync offset not 0??")
            }
        }
    }
}
