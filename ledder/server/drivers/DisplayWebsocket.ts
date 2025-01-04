import Display from "../../Display.js"
import {WsContext} from "../WsContext.js"


//a display that can send data to one or more websockets

export class DisplayWebsocket extends Display {
    imageBuf8: Uint8ClampedArray
    wsContexts: Set<WsContext>


    minFrameTimeMicros = ~~(1000000 / 60)

    defaultFrameTimeMicros = ~~(1000000 / 60)

    //width and height are led-display-pixels, not canvas pixels.
    constructor(width, height) {
        super(width, height)

        this.wsContexts = new Set()

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

    sendSize(wsContext:WsContext)
    {
        wsContext.request("display.changedSize", this.width, this.height)
    }

    addWsContext(wsContext: WsContext) {
        this.wsContexts.add(wsContext)
        this.sendSize(wsContext)
        this.enabled = true

    }

    removeWebsocket(wsContext: WsContext) {
        this.wsContexts.delete(wsContext)
        if (this.wsContexts.size == 0)
            this.enabled = false
    }

    frame() {
        //NOTE: yeah we just blast raw frames over websockets.
        // Its fine, since the browser client will check if the received message starts with '{' in which case it treats it as json :)

        for (const wsContext of this.wsContexts)
            wsContext.ws.send(this.imageBuf8)

        this.imageBuf8.fill(0) //alpha of all pixels will be 0, so canvas is transparent.

    }
}
