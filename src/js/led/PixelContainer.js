/**
 * A list of Pixels
 */
export class PixelContainer {
    constructor() {
        this.pixels = [];
    }
    reset() {
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
    //add pixel to "background" (e.g. add to front of pixel list)
    addPixelBG(...pixels) {
        for (const i in pixels) {
            if (this.pixels.indexOf(pixels[i]) == -1) {
                this.pixels.unshift(pixels[i]);
            }
        }
        return (this);
    }
    //add pixels to background
    addPixelsBG(pixels) {
        for (const i in pixels) {
            if (this.pixels.indexOf(pixels[i]) == -1) {
                this.pixels.unshift(pixels[i]);
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
                this.pixels.splice(ourPixelIndex, 1);
            }
        }
        return (this);
    }
}
//# sourceMappingURL=PixelContainer.js.map