import Display from "./Display.js"
import ColorInterface from "./ColorInterface.js"
import * as net from "node:net"
import Color from "./Color.js"

const encoder = new TextEncoder()


/*
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


    constructor(width, height, host, port, gridSize = 25, pixelSize = 24) {
        super(width, height)

        this.statsBytesSend = 0
        this.statsFpsSend = 0

        this.offsetX = 0
        this.offsetY = 0
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


        // const shuffeled = sequence.sort(() => Math.random() - 0.5)


        //we want to shuffle every pixel. create linair sequence of PX commands first:
        const sequence=[]
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const xScaled = ~~x * gridSize
                const yScaled = ~~y * gridSize


                for (let thisX = xScaled; thisX < xScaled + pixelSize; thisX++) {
                    for (let thisY = yScaled; thisY < yScaled + pixelSize; thisY++) {

                        sequence.push([x,y,`PX ${thisX},${thisY} ffffffff\n`])
                    }
                }
            }
        }

        //shuffle it
        const shuffled = sequence.sort(() => Math.random() - 0.5);

        //create the grand-string-of-shuffled-PX commands
        let buff = ""
        for (const xyPX of shuffled) {

            const [x,y,px]=xyPX

            buff = buff + px
            this.sendBufferOffsets[x][y].push(buff.length - 9)
        }

        //convert to uint8array so we can manipulate it efficiently
        this.sendBuffer = new Uint8Array(buff.length)
        this.sendBuffer.set(encoder.encode(buff))

        this.client = new net.Socket()
        this.client.setNoDelay(true)


        this.client.on('connect', () => {
            this.client.write('OFFSET 500,550\n')
            this.fillSendbuffer()

        })

        this.client.on('drain', () => {

            this.fillSendbuffer()

        })

        this.client.connect(port, host)
        setInterval(() => {
            if (this.statsBytesSend === 0)
                console.log('PixelFlut: STALLED')
            else
                console.log(`PixelFlut: ${~~(this.statsBytesSend / 1000000)} MB/s ${this.statsFpsSend} FPS`)
            this.statsBytesSend = 0
            this.statsFpsSend = 0

            if (this.client.readyState == "closed") {
                console.log("Pixelflut: Reconnecting")
                this.client.connect(port, host)
            }

        }, 1000)


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

    fillSendbuffer() {
        while (1) {
            this.statsFpsSend = this.statsFpsSend + 1
            this.statsBytesSend = this.statsBytesSend + this.sendBuffer.length

            this.updateOffsets()

            if (!this.client.write(this.sendBuffer))
                return
        }

    }

    frame(displayTimeMicros: number) {

        //dont waist resources when not connected
        if (this.client.readyState!=='open')
            return

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {

                const color = this.frameBuffer[x][y]
                const rgb = `${(~~color.r).toString(16).padStart(2, '0')}${(~~color.g).toString(16).padStart(2, '0')}${(~~color.b).toString(16).padStart(2, '0')}${(~~color.b).toString(16).padStart(2, '0')}`

                const rgbArray = encoder.encode(rgb)

                // console.log(this.frameBuffOffsets.length)
                for (const offset of this.sendBufferOffsets[~~x][~~y]) {
                    this.sendBuffer.set(rgbArray, offset)


                }
                color.reset()

            }
        }

    }


    setPixel(x: number, y: number, color: ColorInterface) {

        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {

            this.frameBuffer[~~x][~~y].blend(color)
        }
    }

}