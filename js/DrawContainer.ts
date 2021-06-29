import {DrawPixel} from "./DrawPixel.js";

export class DrawContainer {
    pixels: Array<DrawPixel>;

    constructor() {
        this.pixels = [];
    }

    addPixel(pixel: DrawPixel) {
        //already has this object?
        if (this.pixels.indexOf(pixel) != -1)
            return;

        this.pixels.push(pixel);
    }

}
