import {Display} from "../../ledder/Display.js"


// @ts-ignore
import dgram from "dgram"

import {DisplayQOIS} from "../DisplayQOIS.js"


// const dataLength = 1472 - 4 //4 bytes overhead
const dataLength = 1460 - 4 //4 bytes overhead

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
    //  [syncoffset (2 bytes)][frame]
    //
    //frame:
    // [framelength (2 bytes)][display time (4 bytes)][QOIS encoded bytes]

    frame(displayTime: number) {


        const frameBytes = []


        // //frame byte length
        // frameBytes.push(0) //0
        // frameBytes.push(0) //1

        //time
        //TODO: only use lower 16 bits
        frameBytes.push(displayTime & 0xff)          //2
        frameBytes.push((displayTime >> 8) & 0xff)   //3
        frameBytes.push((displayTime >> 16) & 0xff)  //4
        frameBytes.push((displayTime >> 24) & 0xff)  //5


        //encodes current frame via QIOS into bytes
        this.encode(frameBytes)

        // //update frame byte length
        // frameBytes[0]=frameBytes.length & 0xff;
        // frameBytes[1]=(frameBytes.length >>8) & 0xff;


        //the syncoffset is needed so that a display can pickup a stream thats already running, or if it lost packets
        this.nextSyncOffset = this.nextSyncOffset + frameBytes.length
        this.byteStream = this.byteStream.concat(frameBytes)

        while (this.byteStream.length >= dataLength) {

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
                this.nextSyncOffset = this.nextSyncOffset - dataLength
                this.syncOffset = this.nextSyncOffset

                this.socket.send(Uint8Array.from(packet.concat(this.byteStream.splice(0, dataLength))))

            } catch (e) {
                console.error("MatrixLedstream: Send error: " + e)
            }
        }


    }
}
