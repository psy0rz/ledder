/**
 * A list of Pixels
 */
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
    addPixels(pixels) {
        for (const i in pixels) {
            if (this.pixels.indexOf(pixels[i]) == -1) {
                this.pixels.push(pixels[i]);
            }
        }
        return (this);
    }
    removePixel(...pixels) {
        for (const i in pixels) {
            const ourPixelIndex = this.pixels.indexOf(pixels[i]);
            if (ourPixelIndex != -1) {
                this.pixels.splice(ourPixelIndex, 1);
            }
        }
        return (this);
    }
    removePixels(pixels) {
        for (const i in pixels) {
            const ourPixelIndex = this.pixels.indexOf(pixels[i]);
            if (ourPixelIndex != -1) {
                this.pixels.splice(ourPixelIndex);
            }
        }
        return (this);
    }
}
//# sourceMappingURL=PixelContainer.js.map