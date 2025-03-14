import Display from "../../Display.js";
import UPNG from 'upng-js';
import {writeFile} from "fs/promises"
import {createParentDir} from "../utils.js"



//Matrix driver to render animations to a APNG file. (used for browser previewing)
export class DisplayApng extends Display {

    imageBuf8: Uint8ClampedArray
    filename: string

    images: Array<ArrayBuffer>
    private delays: number[]
    private lastTime: number

    /**
     *
     * @param width
     * @param height
     */
    constructor(width, height) {
        super(width, height);

        this.clearFrame()
        this.clear()

    }

    //clear data and get ready to create a new apng
    clear()
    {
        this.images = []
        this.delays=[]
        this.clearFrame()
        this.lastTime=0
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

    frame(displayTimeMicros:number) {


        //store
        this.images.push(this.imageBuf8.buffer)
        this.delays.push(~~(displayTimeMicros-this.lastTime)/1000)
        this.lastTime=displayTimeMicros
        this.clearFrame()

        return(this.images.length)

    }

    /**
     * Generate apng file from currently stored images, and clears buffer.
     */
    get(quality: number) {

        let image = UPNG.encode(this.images, this.width, this.height, quality, this.delays)
        this.images = []
        return (image)
    }


    /*
    Create apng file from currently stored images
    Quality: 0 lossless,  1-225  from bad to good.
     */
    async storeImage(filename:string, quality:number)
    {
        //generate and store APNG
        let imageData = this.get(quality)

        await createParentDir(filename)

        await writeFile(filename, Buffer.from(imageData))

    }

}


