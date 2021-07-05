import { PixelContainer } from "./PixelContainer.js";
export class Matrix extends PixelContainer {
    constructor(scheduler, width, height) {
        super();
        this.scheduler = scheduler;
        this.width = width;
        this.height = height;
    }
    render() {
        //render all pixels (pixels render() function wil call our setPixel one or more times)
        for (let i = 0, n = this.pixels.length; i < n; ++i) {
            const p = this.pixels[i];
            p.render(this);
        }
    }
    status() {
        console.log("Matrix pixels: ", this.pixels.length);
    }
}
//# sourceMappingURL=Matrix.js.map