import {Pixel} from "./Pixel.js";

export class PixelContainer {
    pixels: Array<Pixel>;

    constructor() {
        this.pixels = [];
    }

    addPixel(pixel: Pixel) {
        //already has this object?
        if (this.pixels.indexOf(pixel) != -1)
            return;

        this.pixels.push(pixel);
    }

}
