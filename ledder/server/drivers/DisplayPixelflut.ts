import * as net from "node:net"
import Display from "../../Display.js";
import Color from "../../Color.js";
import type ColorInterface from "../../ColorInterface.js";

const encoder = new TextEncoder()


/*
Text-mode pixelflooder.

We pre-generate one fixed send buffer and flood that in a loop.
Then the driver will manipulate the colors in this buffer with the new data.

NOTE: it sent 125 FPS @118 MB/s with my laptop, only using 33%CPU.



 */
export default class DisplayPixelflut extends Display {
    client: net.Socket
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

    flood: boolean

    /*
      If flood is true, it will keep sending the current frame as fast as possible. Otherwise it will be at the fps of this driver (60fps, adjustable )
      gridsize and pixelsize determine how many display pixels each ledder pixel will be. If the grid is bigger than then pixels, you will get a nice led-like rendering.
     */
    constructor(width, height, host, port, gridSize = 1, pixelSize = 1, flood = false, sendOffset=false) {
        super(width, height)

        this.statsBytesSend = 0
        this.statsFpsSend = 0

        this.offsetX = 0
        this.offsetY = 0
        this.stepY = 0
        this.stepX = 0
        this.stepSize = 1
        this.flood = flood


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

                        sequence.push([x, y, `PX ${thisX} ${thisY} ffffff\n`])
                    }
                }
            }
        }

        //shuffle it
        const shuffled = sequence.sort(() => Math.random() - 0.5)

        //create the grand-string-of-shuffled-PX commands
        let buff = ""
        for (const xyPX of shuffled) {

            const [x, y, px] = xyPX

            buff = buff + px
            this.sendBufferOffsets[x][y].push(buff.length - 7)
        }

        //convert to uint8array so we can manipulate it efficiently
        this.sendBuffer = new Uint8Array(buff.length)
        this.sendBuffer.set(encoder.encode(buff))

        this.client = new net.Socket()
        this.client.setNoDelay(true)


        this.client.on('connect', () => {
            if (sendOffset)
                this.client.write('OFFSET 5,5\n')


            if (flood)
                while (this.send()) {
                }


        })

        this.client.on('drain', () => {

            if (flood)
                while (this.send()) {
                }

        })

        this.client.connect(port, host)
        // setInterval(() => {
        //     if (this.statsBytesSend === 0)
        //         console.log('PixelFlut: STALLED')
        //     else
        //         console.log(`PixelFlut: ${~~(this.statsBytesSend / 1000000)} MB/s ${this.statsFpsSend} FPS`)
        //     this.statsBytesSend = 0
        //     this.statsFpsSend = 0
        //
        //     if (this.client.readyState == "closed") {
        //         console.log("Pixelflut: Reconnecting")
        //         this.client.connect(port, host)
        //     }
        //
        // }, 1000)


        this.client.on('error', (e) => {
            console.error(`PixelFLut: ${e}`)
        })
    }

    updateOffsets() {
        return
        if (this.offsetX <= 0)
            this.stepX = this.stepSize

        if (this.offsetX > 3300)
            this.stepX = -this.stepSize

        if (this.offsetY <= 0)
            this.stepY = this.stepSize

        if (this.offsetY > 900)
            this.stepY = -this.stepSize

        this.offsetX = this.offsetX + this.stepX
        this.offsetY = this.offsetY + this.stepY


        this.client.write(`OFFSET ${this.offsetX},${this.offsetY}\n`)
    }

    send() {
        this.statsFpsSend = this.statsFpsSend + 1
        this.statsBytesSend = this.statsBytesSend + this.sendBuffer.length

        this.updateOffsets()

        return this.client.write(this.sendBuffer)

    }

    frame(displayTimeMicros: number) {

        //dont waist resources when not connected
        if (this.client.readyState !== 'open')
            return

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {

                const color = this.frameBuffer[x][y]
                let rgb = `${(~~color.r).toString(16).padStart(2, '0')}${(~~color.g).toString(16).padStart(2, '0')}${(~~color.b).toString(16).padStart(2, '0')}`

                // console.log(rgb)
                // if (rgb=='000000')
                //     rgb='555555'

                const rgbArray = encoder.encode(rgb)

                // console.log(this.frameBuffOffsets.length)
                for (const offset of this.sendBufferOffsets[~~x][~~y]) {
                    this.sendBuffer.set(rgbArray, offset)


                }
                color.reset()

            }
        }

        if (!this.flood)
            this.send()

        const b=this.statsBytesSend
        this.statsBytesSend=0
        return b

    }


    setPixel(x: number, y: number, color: ColorInterface) {

        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {

            this.frameBuffer[~~x][~~y].blend(color)
        }
    }

}