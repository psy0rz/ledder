import Display from "../../Display.js"


//a display that can send data to one or more websockets

export class DisplayWebsocket extends Display {
    imageBuf8: Uint8ClampedArray
    webSockets: Set<WebSocket>


    minFrameTimeMicros = ~~(1000000 / 60)

    defaultFrameTimeMicros = ~~(1000000 / 60)

    //width and height are led-display-pixels, not canvas pixels.
    constructor(width, height) {
        super(width, height)

        this.webSockets = new Set()

        this.imageBuf8 = new Uint8ClampedArray(height * width * 4)

    }

    //sets a pixel in the render buffer (called from Draw-classes render() functions)
    setPixel(x, y, color) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {

            const offset = ~~x * 4 + (~~y) * 4 * this.width
            const old_a = 1 - color.a

            this.imageBuf8[offset] = (this.imageBuf8[offset] * old_a + color.r * color.a)
            this.imageBuf8[offset + 1] = (this.imageBuf8[offset + 1] * old_a + color.g * color.a)
            this.imageBuf8[offset + 2] = (this.imageBuf8[offset + 2] * old_a + color.b * color.a)
            this.imageBuf8[offset + 3] = 255 //alpha of canvas itself
        }
    }

    addWebSocket(ws: WebSocket) {
        this.webSockets.add(ws)
        this.enabled = true

    }

    removeWebsocket(ws: WebSocket) {
        this.webSockets.delete(ws)
        if (this.webSockets.size == 0)
            this.enabled = false
    }

    frame() {
        for (const ws of this.webSockets)
            ws.send(this.imageBuf8)

        this.imageBuf8.fill(0) //alpha of all pixels will be 0, so canvas is transparent.

    }
}
