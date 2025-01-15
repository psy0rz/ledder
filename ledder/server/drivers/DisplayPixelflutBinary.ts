import dgram from "dgram"
import Display from "../../Display.js";
import  Color from "../../Color.js";
import type ColorInterface from "../../ColorInterface.js";

const encoder = new TextEncoder()
/*
 Binary mode pixel flooder, in UDP mode
https://github.com/JanKlopper/pixelvloed/blob/master/protocol.md

 */
export default class DisplayPixelflutBinary extends Display {
    client: dgram.Socket

    frameBuffer: Array<Array<Color>>

    sendBuffer: Uint8Array
    sendBufferOffsets: Array<Array<Array<number>>>

    statsBytesSend: number
    statsFpsSend: number

    offsetX: number
    offsetY: number
    stepX: number
    stepY: number
    stepSize: number


    host: string
    port: number

    /*
      gridsize and pixelsize determine how many display pixels each ledder pixel will be. If the grid is bigger than then pixels, you will get a nice led-like rendering.
     */
    constructor(width, height, host, port, gridSize = 1, pixelSize = 1, offsetX=0, offsetY=0) {
        super(width, height)

        this.statsBytesSend = 0
        this.statsFpsSend = 0

        this.offsetX = offsetX
        this.offsetY = offsetY
        this.stepY = 0
        this.stepX = 0
        this.stepSize = 1


        //create render buffer
        this.frameBuffer = []
        for (let x = 0; x < width; x++) {
            const Ys = []
            this.frameBuffer.push(Ys)
            for (let y = 0; y < height; y++) {
                Ys.push(new Color())
            }
        }

        //prepare offset array
        this.sendBufferOffsets = []
        for (let x = 0; x < this.width; x++) {
            const Ys = []
            this.sendBufferOffsets.push(Ys)
            for (let y = 0; y < this.height; y++) {
                Ys.push([])
            }
        }

        //create static sendbuffer, in random order to smooth out vsync/hsync
        //we want to shuffle every pixel. create linair sequence of PX commands first:
        const sequence = []
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const xScaled = ~~x * gridSize
                const yScaled = ~~y * gridSize


                for (let thisX = xScaled; thisX < xScaled + pixelSize; thisX++) {
                    for (let thisY = yScaled; thisY < yScaled + pixelSize; thisY++) {

                        //protocol 0
                        const buffer = new ArrayBuffer(7)
                        const view = new DataView(buffer)

                        view.setUint16(0, thisX+this.offsetX, true)
                        view.setUint16(2, thisY+this.offsetY, true)
                        view.setUint8(4, 255) //r
                        view.setUint8(5, 0)   //g
                        view.setUint8(6, 0)   //b

                        sequence.push([x, y, new Uint8Array(buffer)])
                    }
                }
            }
        }

        //shuffle it
        const shuffled = sequence.sort(() => Math.random() - 0.5)

        //create the grand-uint8array-of-shuffed-binaryof-shuffled-commands
        let buff = []

        //select mode 0, no alpha
        buff.push(0)
        buff.push(0)
        for (const xyPX of shuffled) {

            const [x, y, cmd] = xyPX

            for (const b of cmd) {
                buff.push(b)
            }

            this.sendBufferOffsets[x][y].push(buff.length - 3)
        }

        //convert to uint8array so we can manipulate it efficiently
        this.sendBuffer = new Uint8Array(buff)

        this.client = dgram.createSocket('udp4')

        this.host = host
        this.port = port


//stats
        setInterval(() => {
            if (this.statsBytesSend === 0)
                console.log('PixelFlut: STALLED')
            else
                console.log(`PixelFlut: ${~~(this.statsBytesSend / 1000000)} MB/s ${this.statsFpsSend} FPS`)
            this.statsBytesSend = 0
            this.statsFpsSend = 0


        }, 1000)

    }


    send() {
        this.statsFpsSend = this.statsFpsSend + 1
        this.statsBytesSend = this.statsBytesSend + this.sendBuffer.length



        this.client.send(this.sendBuffer, this.port, this.host, (err) => {
            if (err) {
                console.error('Error sending data:', err)
            }
        })
    }

    frame(displayTimeMicros: number) {

        const colorBytes=new Uint8Array(3)

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {

                const color = this.frameBuffer[x][y]

                colorBytes[0]=color.r
                colorBytes[1]=color.g
                colorBytes[2]=color.b

                // console.log(this.frameBuffOffsets.length)
                for (const offset of this.sendBufferOffsets[~~x][~~y]) {
                    this.sendBuffer.set(colorBytes, offset)
                }
                color.reset()

            }
        }

        this.send()

        return this.sendBuffer.length

    }


    setPixel(x: number, y: number, color: ColorInterface) {

        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {

            this.frameBuffer[~~x][~~y].blend(color)
        }
    }

}