import Display from "../../Display.js"

export class DisplayWebsocket extends Display {
    imageBuf8: Uint8ClampedArray
    ws: WebSocket


    //width and height are led-display-pixels, not canvas pixels.
    constructor(width, height, ws) {
        super(width, height)


        this.imageBuf8 = new Uint8ClampedArray(height * width * 4)
        this.ws = ws

    }

    //sets a pixel in the render buffer (called from Draw-classes render() functions)
    //bilinear interpolation.
    setPixel(x, y, color) {
        const x0 = ~~x
        const y0 = ~~y

        const dx = x - x0
        const dy = y - y0


        const w00 = (1 - dx) * (1 - dy) * color.a  // Weight for top-left pixel (x0, y0)
        this.setPixelRounded(x0, y0, color, w00)

        const w10 = dx * (1 - dy) * color.a     // Weight for top-right pixel (x0+1, y0)
        this.setPixelRounded(x0 + 1, y0, color, w10)

        const w01 = (1 - dx) * dy * color.a   // Weight for bottom-left pixel (x0, y0+1)
        this.setPixelRounded(x0, y0 + 1, color, w01)

        const w11 = dx * dy * color.a       // Weight for bottom-right pixel (x0+1, y0+1)
        this.setPixelRounded(x0 + 1, y0 + 1, color, w11)


    }

    /*

blend:
  c = cn*a + co*(1-a)

verdelen:
  c = cn*b + co


     */

    //weighted , after linear interpolation.
    setPixelRounded(x, y, color, weight) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {

            const offset = x * 4 + (y) * 4 * this.width
            const old_a = 1 - weight
            // const old_a = 1


            this.imageBuf8[offset] = (this.imageBuf8[offset] * old_a + color.r * weight)
            this.imageBuf8[offset + 1] = (this.imageBuf8[offset + 1] * old_a + color.g * weight)
            this.imageBuf8[offset + 2] = (this.imageBuf8[offset + 2] * old_a + color.b * weight)
            this.imageBuf8[offset + 3] = 255 //alpha of canvas itself
        }
    }


    frame() {

        if (this.ws)
            this.ws.send(this.imageBuf8)

        this.imageBuf8.fill(0) //alpha of all pixels will be 0, so canvas is transparent.

    }


}
