import {Display} from "../../ledder/Display.js";


// @ts-ignore
import dgram from "dgram";
import {gamma} from "./MatrixWLED.js";
import {MulticastSync} from "./MulticastSync.js";

const headerLength = 8;


export class MatrixLedstreamQuad extends Display {

    packets: Uint8ClampedArray[];
    socket: dgram.Socket;
    // socket2: dgram.Socket;
    flipX: boolean;
    flipY: boolean;
    ip: string;
    port: number;

    chanWidth: number;
    channels: number;
    // frameNr:number;

    displayTime:number;


    syncer: MulticastSync

    /**
     * Matrix driver for https://github.com/psy0rz/ledstream
     * We assume it has a Left/Right zigzag pattern, with multiple channels stacked vertically
     * @param channels Number of channels (zigzag ledstrips)
     * @param width Physical width of matrix.
     * @param height Physical height of matrix. (divded over multiple channels)
     * @param ip IP address
     * @param port UDP port
     */
    constructor(channels, width, height, ip, maxFps=60,port = 21324) {
        super( width, height);
        this.maxFps=maxFps
        this.roundFrametime=true

        this.syncer=new MulticastSync('239.137.111.222', 65001, 1000)

        this.ip = ip;
        this.port = port;

        this.chanWidth = width / channels;
        this.channels=channels;

        this.packets = [];

        // this.frameNr=0;
        this.displayTime=Date.now()

        this.maxFps=maxFps

        for (let c = 0; c < channels; c++) {
            this.packets.push(new Uint8ClampedArray(headerLength + (this.height * this.chanWidth * 3)));
        }


        this.socket = dgram.createSocket('udp4');
        this.socket.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
        });

        // this.socket2 = dgram.createSocket('udp4');
        // this.socket2.on('error', (err) => {
        //     console.log(`server error:\n${err.stack}`);
        // });
        this.socket.connect(this.port, this.ip)

    }

    //sets a pixel in the render buffer (called from Draw-classes render() functions)
    setPixel(x, y, color) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {

            const floorY = ~~y;
            const floorX = ~~x;

            const channel = ~~(floorX / this.chanWidth)
            const chanX = floorX % this.chanWidth;

            let offset;
            if (floorX & 1)
                offset = headerLength + ((this.height-floorY-1) * 3 + chanX * 3 * this.height);
            else
                offset = headerLength + (floorY * 3 + chanX * 3 * this.height);
                // offset = headerLength + (floorY * 3 + chanX * 3 * this.height);
                // offset = headerLength + ((this.width-floorX-1) * 3 + chanY * 3 * this.width);


            const old_a = 1 - color.a;

            this.packets[channel][offset] = (this.packets[channel][offset] * old_a + gamma[~~color.r] * color.a);
            this.packets[channel][offset + 1] = (this.packets[channel][offset + 1] * old_a + gamma[~~color.g] * color.a);
            this.packets[channel][offset + 2] = (this.packets[channel][offset + 2] * old_a + gamma[~~color.b] * color.a);
            // this.packets[channel][offset] = (this.packets[channel][offset] * old_a + ~~color.r * color.a);
            // this.packets[channel][offset + 1] = (this.packets[channel][offset + 1] * old_a + ~~color.g * color.a);
            // this.packets[channel][offset + 2] = (this.packets[channel][offset + 2] * old_a + ~~color.b * color.a);

        }
    }


    frame(displayTime) {



        for (let c = 0; c < this.channels; c++) {
            this.packets[c][3] = ((displayTime  >> 24) & 0xff)
            this.packets[c][2] = ((displayTime  >> 16) & 0xff)
            this.packets[c][1] = ((displayTime  >> 8) & 0xff)
            this.packets[c][0] = (displayTime & 0xff)
            this.packets[c][4]=c;
            // this.packets[c][5]=;//unused
            // this.packets[c][6]=;
            // this.packets[c][7]=;

            // if (random(0,100)>20)

            // @ts-ignore
            this.socket.send(this.packets[c]);
            // @ts-ignore
            // this.socket2.send(this.packets[c]);
            //clear

            this.packets[c]=new Uint8ClampedArray(headerLength + (this.chanWidth * this.height * 3))
        }

    }



}
