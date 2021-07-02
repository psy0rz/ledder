export class PixelContainer {
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
//# sourceMappingURL=PixelContainer.js.map