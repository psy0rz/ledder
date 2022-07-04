import {Display} from "../../ledder/Display.js";


// @ts-ignore
import dgram from "dgram";

import {gamma} from "./DisplayWLED.js";
import {DisplayQOIS} from "../DisplayQOIS.js";

const headerLength = 8;


const numberMask =    0b00111111 //last bits are number-bits
const colorFullMask = 0b00000000 //x full colors follow
const skipMask =      0b01000000 //skip x pixels (same as previous frame)
const repeatMask =    0b10000000 //repeat last pixel x times
const colorRefMask =  0b11000000 //use same color as x pixels ago


//NOTE: This needs a  MulticastSyncer as well.
export class DisplayLedstream extends DisplayQOIS {

    socket: dgram.Socket;
    ip: string;
    port: number;

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
        super(width, height);

        this.roundFrametime = true

        this.ip = ip;
        this.port = port;

        this.socket = dgram.createSocket('udp4');
        this.socket.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
        });

        this.socket.connect(this.port, this.ip)
    }


    frame(displayTime: number) {
        let bytes=[]

        //time
        bytes.push(displayTime & 0xff)
        bytes.push((displayTime >> 8) & 0xff)
        bytes.push((displayTime >> 16) & 0xff)
        bytes.push((displayTime >> 24) & 0xff)

        //encodes current frame via QIOS into bytes
        this.encode(bytes)

        try {
            this.socket.send(Uint8Array.from(bytes));
        } catch (e) {
            console.error("MatrixLedstream: Send error: " + e)
        }

    }
}
