import {Pixel} from "./Pixel.js";

export class DrawContainer {

    pixels: Array<Pixel>;

    constructor() {
        this.pixels = [];
    }
    addPixel(pixel) {
        //already has this object?
        if (this.pixels.indexOf(pixel) != -1)
            return;
        this.pixels.push(pixel);
    }
}
//# sourceMappingURL=DrawContainer.js.map
