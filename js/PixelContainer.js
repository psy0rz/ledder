export class PixelContainer {
    constructor() {
        this.pixels = [];
    }
    addPixel(...pixels) {
        for (const i in pixels) {
            if (this.pixels.indexOf(pixels[i]) == -1) {
                this.pixels.push(pixels[i]);
            }
        }
        return (this);
    }
}
//# sourceMappingURL=PixelContainer.js.map