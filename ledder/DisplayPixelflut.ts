import Display from "./Display.js"
import ColorInterface from "./ColorInterface"
import * as net from "node:net"

const encoder = new TextEncoder()


export default class DisplayPixelflut extends Display {
    client: net.Socket
    pixelSize: number
    gridSize: number
    frameBuff: Uint8Array

    bytesSend: number


    constructor(width, height, host, port) {
        super(width, height)

        this.gridSize = 15
        this.pixelSize = 10
        this.bytesSend = 0


        //create static pixelbuffer
        let buff = ""
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const xScaled = ~~x * this.gridSize
                const yScaled = ~~y * this.gridSize

                for (let thisX = xScaled; thisX < xScaled + this.pixelSize; thisX++)
                    for (let thisY = yScaled; thisY < yScaled + this.pixelSize; thisY++) {

                        buff = buff + `PX ${thisX},${thisY} ffffff\n`
                    }

            }
        }

        this.frameBuff = new Uint8Array(buff.length)
        this.frameBuff.set(encoder.encode(buff))

        this.client = new net.Socket()
        this.client.setNoDelay(true)

        this.client.connect(port, host)


        this.client.on('connect', () => {
            this.client.write('OFFSET 1600,300\n')
            this.fillSendbuffer()


        })

        this.client.on('drain', () => {

            this.fillSendbuffer()

        })

        setInterval(() => {
            if (this.bytesSend===0)
                console.log('PixelFlut: idle')
            else
                console.log(`PixelFlut: ${~~(this.bytesSend/1000000)} MB/s `)
            this.bytesSend = 0
        }, 1000)

        this.client.on('error', (e)=>{
            console.error(`PixelFLut: ${e}`)
        })
    }

    fillSendbuffer() {
        this.bytesSend = this.bytesSend + this.frameBuff.length
        while (this.client.write(this.frameBuff)) {
            this.bytesSend = this.bytesSend + this.frameBuff.length

        }

    }

    frame(displayTimeMicros: number) {

        // console.log(this.client.write(this.frameBuff))

    }

    clearBuff() {

        //fill with spaces
        // this.frameOffset = 0
        // this.frameBuff.fill(' '.charCodeAt(0))
    }

    // addBuff(stringOrNum) {
    //     const result = encoder.encodeInto(
    //         stringOrNum,
    //         this.frameBuff.subarray(this.frameOffset),
    //     )
    //     this.frameOffset = this.frameOffset + result.written
    //
    //     if (this.frameOffset >= this.frameBuff.length) {
    //         console.log("full")
    //     }
    // }

    setPixel(x: number, y: number, color: ColorInterface) {
        // const rgb = `${(~~color.r).toString(16).padStart(2, '0')}${(~~color.g).toString(16).padStart(2, '0')}${(~~color.b).toString(16).padStart(2, '0')}`
        //
        // const xScaled = ~~x * this.pixelSize
        // const yScaled = ~~y * this.pixelSize
        //
        // for (let thisX = xScaled; thisX < xScaled + this.pixelSize; thisX++)
        //     for (let thisY = yScaled; thisY < yScaled + this.pixelSize; thisY++) {
        //
        //         this.addBuff(PX)
        //
        //         this.addBuff(thisX.toString())
        //         this.frameOffset = this.frameOffset + 1
        //
        //         this.addBuff(thisY.toString())
        //         this.frameOffset = this.frameOffset + 1
        //
        //         this.addBuff(rgb)
        //
        //     }
    }

}