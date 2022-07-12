import {Display} from "../../ledder/Display.js"


// @ts-ignore
import dgram from "dgram"

import {DisplayQOIS} from "../DisplayQOIS.js"


const qoisDataLength = 1460 - 4 //4 bytes overhead

//NOTE: This needs a  MulticastSyncer as well.
export class DisplayLedstream extends DisplayQOIS {

    socket: dgram.Socket
    ip: string
    port: number
    byteStream: Array<number>
    syncOffset: number
    nextSyncOffset: number

    packetNr: number

    /**
     * Matrix driver for https://github.com/psy0rz/ledstream
     * We assume it has a Left/Right zigzag pattern, with multiple channels stacked vertically
     * @param channels Number of channels (zigzag ledstrips)
     * @param width Physical width of display.
     * @param height Physical height of display. (divded over multiple channels)
     * @param ip IP address
     * @param port UDP port
     */
    constructor(channels, width, height, ip, port = 21324) {
        super(width, height)


        this.roundFrametime = true

        this.ip = ip
        this.port = port
        this.byteStream = []
        this.syncOffset = 0
        this.nextSyncOffset = 0
        this.packetNr=0;


        this.socket = dgram.createSocket('udp4')
        this.socket.on('error', (err) => {
            console.log(`server error:\n${err.stack}`)
        })

        this.socket.connect(this.port, this.ip)
    }


    //udp packet:
    //  [packetNr][reserved][syncoffset (2 bytes)][QOIS FRAME]
    //
    //qois frame:
    // [display time (4 bytes)][QOIS encoded bytes]

    frame(displayTime: number) {


        const frameBytes = []


        // //frame byte length
        frameBytes.push(0) //0
        frameBytes.push(0) //1

        // frameBytes.push(0xff)          //magic byte

        //time
        frameBytes.push(displayTime & 0xff)
        frameBytes.push((displayTime >> 8) & 0xff)
        // frameBytes.push((displayTime >> 16) & 0xff)
        // frameBytes.push((displayTime >> 24) & 0xff)


        //encodes current frame via QIOS into bytes
        this.encode(frameBytes)
        // for (let i=0;i<11;i++)
        //     frameBytes.push(i);



        // //update frame byte length
        frameBytes[0] = frameBytes.length & 0xff
        frameBytes[1] = (frameBytes.length >> 8) & 0xff


        //the syncoffset is needed so that a display can pickup a stream thats already running, or if it lost packets
        this.nextSyncOffset = this.nextSyncOffset + frameBytes.length
        this.byteStream = this.byteStream.concat(frameBytes)

        while (this.byteStream.length >= qoisDataLength) {

            try {

                const packet = []

                //add packet nr
                packet.push(this.packetNr&0xff);
                this.packetNr++;

                //reserved
                packet.push(0);

                //add current syncoffset
                packet.push(this.syncOffset & 0xff)
                packet.push((this.syncOffset >> 8) & 0xff)
                this.nextSyncOffset = this.nextSyncOffset - qoisDataLength
                this.syncOffset = this.nextSyncOffset

                this.socket.send(Uint8Array.from(packet.concat(this.byteStream.splice(0, qoisDataLength))))

            } catch (e) {
                console.error("MatrixLedstream: Send error: " + e)
            }
        }


    }
}
