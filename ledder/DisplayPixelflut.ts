import Display from "./Display.js"
import ColorInterface from "./ColorInterface.js"
import * as net from "node:net"
import Color from "./Color.js"

const encoder = new TextEncoder()


/*
We pre-generate one fixed send buffer and flood that in a loop.
Then the driver will manipulate the colors in this buffer with the new data.
 */
export default class DisplayPixelflut extends Display {
    client: net.Socket

    frameBuffer: Array<Array<Color>>

    sendBuffer: Uint8Array
    sendBufferOffsets: Array<Array<Array<number>>>

    statsBytesSend: number


    constructor(width, height, host, port, gridSize = 15, pixelSize = 15) {
        super(width, height)

        this.statsBytesSend = 0

        //create render buffer
        this.frameBuffer = []
        for (let x = 0; x < width; x++) {
            const Ys = []
            this.frameBuffer.push(Ys)
            for (let y = 0; y < height; y++) {
                Ys.push(new Color())
            }
        }

        this.sendBufferOffsets = []
        //create static sendbuffer
        let buff = ""
        for (let x = 0; x < width; x++) {
            const yOffsets = []
            this.sendBufferOffsets.push(yOffsets)
            for (let y = 0; y < height; y++) {
                const xScaled = ~~x * gridSize
                const yScaled = ~~y * gridSize

                const offsets = []
                yOffsets.push(offsets)

                for (let thisX = xScaled; thisX < xScaled + pixelSize; thisX++) {
                    for (let thisY = yScaled; thisY < yScaled + pixelSize; thisY++) {

                        buff = buff + `PX ${thisX},${thisY} ffffffff\n`
                        offsets.push(buff.length - 9)
                    }
                }
            }
        }


        this.sendBuffer = new Uint8Array(buff.length)
        this.sendBuffer.set(encoder.encode(buff))

        this.client = new net.Socket()
        this.client.setNoDelay(true)

        this.client.connect(port, host)


        this.client.on('connect', () => {
            this.client.write('OFFSET 1000,550\n')
            this.fillSendbuffer()


        })

        this.client.on('drain', () => {

            this.fillSendbuffer()

        })

        setInterval(() => {
            if (this.statsBytesSend === 0)
                console.log('PixelFlut: idle')
            else
                console.log(`PixelFlut: ${~~(this.statsBytesSend / 1000000)} MB/s `)
            this.statsBytesSend = 0
        }, 1000)

        this.client.on('error', (e) => {
            console.error(`PixelFLut: ${e}`)
        })
    }

    fillSendbuffer() {
        this.statsBytesSend = this.statsBytesSend + this.sendBuffer.length
        while (this.client.write(this.sendBuffer)) {
            this.statsBytesSend = this.statsBytesSend + this.sendBuffer.length

        }

    }

    frame(displayTimeMicros: number) {


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