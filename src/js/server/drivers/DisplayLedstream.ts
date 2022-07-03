import {Display} from "../../ledder/Display.js";


// @ts-ignore
import dgram from "dgram";

import {gamma} from "./DisplayWLED.js";

const headerLength = 8;


const numberMask = 0b00111111 //last bits are number-bits
const colorFullMask = 0b00000000 //x full colors follow
const skipMask = 0b01000000 //skip x pixels (same as previous frame)
const repeatMask = 0b10000000 //repeat last pixel x times
const colorRefMask = 0b11000000 //use same color as x pixels ago


//NOTE: This needs a  MulticastSyncer as well.
export class DisplayLedstream extends Display {

    packets: Uint8ClampedArray[];
    socket: dgram.Socket;
    // socket2: dgram.Socket;
    flipX: boolean;
    flipY: boolean;
    ip: string;
    port: number;

    chanHeight: number;
    channels: number;
    // frameNr:number;

    //list of pixel colors, encoded as 24bits numbers

    prevFrame: Array<number>
    newFrame: Array<number>
    pixelCount: number


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

        this.chanHeight = height / channels;
        this.channels = channels;

        this.packets = [];


        for (let c = 0; c < channels; c++) {
            this.packets.push(new Uint8ClampedArray(headerLength + (this.width * this.chanHeight * 3)));
        }

        this.socket = dgram.createSocket('udp4');
        this.socket.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
        });

        this.socket.connect(this.port, this.ip)

        // this.socket2 = dgram.createSocket('udp4');
        // this.socket2.on('error', (err) => {
        //     console.log(`server error:\n${err.stack}`);
        // });


        this.pixelCount = this.width * this.height
        this.newFrame=[]
        this.prevFrame=[]
        this.clear()

    }

    clear() {
        super.clear()

        for (let i = 0; i < this.pixelCount; i++) {
            this.prevFrame[i] = 0
            this.newFrame[i] = 0
        }
    }


    //sets a pixel in the render buffer (called from Draw-classes render() functions)
    setPixel(x, y, color) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {

            const floorY = ~~y;
            const floorX = ~~x;

            // const channel = ~~(floorY / this.chanHeight)
            // const chanY = floorY % this.chanHeight;
            //
            // let offset;
            // if (floorY & 1)
            //     offset = headerLength + (floorX * 3 + chanY * 3 * this.width);
            // else
            //     offset = headerLength + ((this.width-floorX-1) * 3 + chanY * 3 * this.width);
            //
            //
            const old_a = 1 - color.a;
            //
            // this.packets[channel][offset] = (this.packets[channel][offset] * old_a + gamma[~~color.r] * color.a);
            // this.packets[channel][offset + 1] = (this.packets[channel][offset + 1] * old_a + gamma[~~color.g] * color.a);
            // this.packets[channel][offset + 2] = (this.packets[channel][offset + 2] * old_a + gamma[~~color.b] * color.a);

            const offset = (y * this.height) + x
            //todo: alpha blending
            this.newFrame[offset] = ((~~color.r) << 16) | ((~~color.g) << 8) | (~~color.b)

        }
    }


    //get number of pixels that are the same as previous frame, at offset
    getSameCount(offset: number) {
        let sameCount = 0
        while (offset < this.pixelCount && sameCount < numberMask && this.newFrame[offset] == this.prevFrame[offset]) {
            sameCount++
            offset++
        }

        return (sameCount)
    }

    //get number of pixels that are the same as the previous pixel, at offset
    getRepeatCount(offset: number) {
        let repeatCount = 0
        if (offset > 0) {
            while (repeatCount + offset < this.pixelCount && repeatCount < numberMask && this.newFrame[offset - 1] == this.newFrame[offset + repeatCount]) {
                repeatCount++
            }
        }
        return (repeatCount)
    }

    //find color back reference from current offset (0=not found)
    findColorRef(offset: number) {
        let colorRefOffset = 1
        while (colorRefOffset < numberMask && offset - colorRefMask > 0) {
            if (this.newFrame[offset] == this.newFrame[offset - colorRefOffset]) {
                return (colorRefOffset)
            }
        }
        return 0
    }

    /*

    Uses a custom delta encoder to bandwidth.
    - use skip count to skip unchanged pixels (compared to previous frame) ( 0b01xxxxxx)
    - use repeat count to indicate repeating pixels (0b10xxxxxx)
    - reference to previous pixels to re-use a color (0b11xxxxxx)
    - use full 3 byte colors, x times. (0b00xxxxxx)



    */


    frame(displayTime: number) {


        const encoded: Array<number> = []


        let fullColorCount = 0

        let p = 0
        while (p < this.pixelCount) {
            //get skip count
            let skipCount = this.getSameCount(p)

            //get repeat count
            let repeatCount = this.getRepeatCount(p)

            //detected repeated or skippable pixels?
            if (skipCount || repeatCount) {
                //use whichever is the longest
                if (skipCount > repeatCount) {
                    encoded.push(skipMask | skipCount)
                    p = p + skipCount
                } else {
                    encoded.push(repeatMask | repeatCount)
                    p = p + repeatCount
                }
                fullColorCount = 0
            }
            //we cant repeat/skip this time, reference a color or use full color
            else {
                //can we reference a previous pixel?
                const ref = this.findColorRef(p)

                if (ref) {
                    encoded.push(colorRefMask | ref)
                } else {
                    //FIXME: update count in previous colorFullMask byte if we can
                    encoded.push(colorFullMask)
                    encoded.push(this.newFrame[p] >> 16)
                    encoded.push(this.newFrame[p] >> 8 & 0xff)
                    encoded.push(this.newFrame[p] & 0xff)
                }

                p++

            }
        }

        // console.log(encoded)/

        //get ready for next frame
        for (let i = 0; i < this.width * this.height; i++) {
            this.newFrame[i] = 0
        }


        // for (let c = 0; c < this.channels; c++) {
        //     this.packets[c][3] = ((displayTime  >> 24) & 0xff)
        //     this.packets[c][2] = ((displayTime  >> 16) & 0xff)
        //     this.packets[c][1] = ((displayTime  >> 8) & 0xff)
        //     this.packets[c][0] = (displayTime & 0xff)
        //     this.packets[c][4]=c;
        //     // this.packets[c][5]=;//unused
        //     // this.packets[c][6]=;
        //     // this.packets[c][7]=;
        //
        //     try {
        //         // @ts-ignore
        //         this.socket.send(this.packets[c]);
        //     }
        //     catch(e)
        //     {
        //         console.error("MatrixLedstream: Send error: "+e)
        //     }
        //     // @ts-ignore
        //     this.packets[c]=new Uint8ClampedArray(headerLength + (this.width * this.chanHeight * 3))
        // }
    }
}
