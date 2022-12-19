import Display from "../../Display.js";
import pkg from 'upng-js';


const UPNG = pkg;

//Matrix driver to render animations to a APNG file. (used for browser previewing)
export class DisplayApng extends Display {

    imageBuf8: Uint8ClampedArray
    filename: string

    images: Array<ArrayBuffer>

    /**
     *
     * @param width
     * @param height
     */
    constructor(width, height) {
        super(width, height);

        this.images = []
        this.clearFrame()

    }

    //sets a pixel in the render buffer (called from Draw-classes render() functions)
    setPixel(x, y, color) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {

            const offset = ~~x * 4 + ~~y * 4 * this.width;
            const old_a = 1 - color.a;

            this.imageBuf8[offset] = (this.imageBuf8[offset] * old_a + color.r * color.a);
            this.imageBuf8[offset + 1] = (this.imageBuf8[offset + 1] * old_a + color.g * color.a);
            this.imageBuf8[offset + 2] = (this.imageBuf8[offset + 2] * old_a + color.b * color.a);
            this.imageBuf8[offset + 3] = 255; //alpha of canvas itself
        }
    }

    clearFrame() {
        //clear buffers for next frame
        this.imageBuf8 = new Uint8ClampedArray(this.width * this.height * 4);
        this.imageBuf8.fill(0); //alpha of all pixels will be 0, so image is transparent
    }

    frame() {

        //keep image
        this.images.push(this.imageBuf8.buffer)
        this.clearFrame()

    }

    /**
     * Generate apng file from currently stored images
     */
    get(fps: number) {

        let delays = []
        for (let i = 0; i < this.images.length; i++)
            delays.push(1000 / fps)
        let image = UPNG.encode(this.images, this.width, this.height, 0, delays)
        this.images = []
        return (image)
    }
}


