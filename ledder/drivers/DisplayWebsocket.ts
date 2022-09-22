import Display from "../Display.js";

export class DisplayWebsocket extends Display {
    imageBuf8: Uint8ClampedArray;
    ws: WebSocket


    //width and height are led-display-pixels, not canvas pixels.
    constructor(width, height, ws) {
        super( width, height);

        this.maxFps=120

        this.imageBuf8 = new Uint8ClampedArray(height * width * 4);
        this.ws=ws

    }

    //sets a pixel in the render buffer (called from Draw-classes render() functions)
    setPixel(x, y, color) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {

            const offset = ~~x * 4 + (this.height - ~~y - 1) * 4 * this.width;
            const old_a = 1 - color.a;

            this.imageBuf8[offset] = (this.imageBuf8[offset] * old_a + color.r * color.a);
            this.imageBuf8[offset + 1] = (this.imageBuf8[offset + 1] * old_a + color.g * color.a);
            this.imageBuf8[offset + 2] = (this.imageBuf8[offset + 2] * old_a + color.b * color.a);
            this.imageBuf8[offset + 3] = 255; //alpha of canvas itself
        }
    }


    frame() {
        // setTimeout(() => this.frame(), 1000 / this.fpsControl.value)

        //
        // if (this.runScheduler)
        //     this.scheduler.update();

        if (this.ws)
            this.ws.send(this.imageBuf8)

        this.imageBuf8.fill(0); //alpha of all pixels will be 0, so canvas is transparent.
        // this.render();


    }




}
