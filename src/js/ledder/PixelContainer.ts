import {Pixel} from "./Pixel.js";

/**
 * A list of Pixels
 */
export class PixelContainer {
    pixels: Array<Pixel>;

    constructor() {
        this.pixels = [];
    }

    reset() {
        this.pixels = [];
    }

    add(pixelContainer: PixelContainer) {
        this.pixels.push(...pixelContainer.pixels)
    }

    addPixel(...pixels: Array<Pixel>) {

        for (const i in pixels) {
            if (this.pixels.indexOf(pixels[i]) == -1) {
                this.pixels.push(pixels[i]);
            }

        }
        return (this);
    }

    addPixels(pixels: Array<Pixel>) {

        for (const i in pixels) {
            if (this.pixels.indexOf(pixels[i]) == -1) {
                this.pixels.push(pixels[i]);
            }

        }
        return (this);
    }

    //add pixel to "background" (e.g. add to front of pixel list)
    addPixelBG(...pixels: Array<Pixel>) {

        for (const i in pixels) {
            if (this.pixels.indexOf(pixels[i]) == -1) {
                this.pixels.unshift(pixels[i]);
            }

        }
        return (this);
    }

    //add pixels to background
    addPixelsBG(pixels: Array<Pixel>) {

        for (const i in pixels) {
            if (this.pixels.indexOf(pixels[i]) == -1) {
                this.pixels.unshift(pixels[i]);
            }

        }
        return (this);
    }


    removePixel(...pixels: Array<Pixel>) {
        for (const i in pixels) {
            const ourPixelIndex = this.pixels.indexOf(pixels[i]);
            if (ourPixelIndex != -1) {
                this.pixels.splice(ourPixelIndex, 1);
            }
        }
        return (this);
    }

    removePixels(pixels: Array<Pixel>) {
        for (const i in pixels) {
            const ourPixelIndex = this.pixels.indexOf(pixels[i]);
            if (ourPixelIndex != -1) {
                this.pixels.splice(ourPixelIndex, 1);
            }
        }
        return (this);
    }

    //get bounding box (override if needed)
    bbox() {
        if (!this.pixels.length) {
            return undefined
        }
        const ret = {
            xMin: this.pixels[0].x,
            xMax: this.pixels[0].x,
            yMin: this.pixels[0].y,
            yMax: this.pixels[0].y,
        }

        for (const p of this.pixels) {
            if (p.x < ret.xMin)
                ret.xMin=p.x
            else if (p.x > ret.xMax)
                ret.xMax=p.x

            if (p.y < ret.yMin)
                ret.yMin=p.y
            else if (p.y > ret.yMax)
                ret.yMax=p.y

        }
        return (ret)
    }
}
