import {Pixel} from "./Pixel.js";

export class PixelStar extends Pixel {
    constructor(matrix, x, y, r = 64, g = 64, b = 64, a = 1) {
        super(matrix, x, y, r, g, b, a);

        this.step = 0;
        matrix.scheduler.interval(3, () => {
            this.step = (this.step + 1) % 3;
            return(this.keep);
        })

    }

    render(matrix) {
        switch (this.step) {
            case 0:
                matrix.setPixel(this.x, this.y, this.r, this.g, this.b, this.a);
                break;
            case 1:
                matrix.setPixel(this.x, this.y, this.r, this.g, this.b, this.a);
                matrix.setPixel(this.x - 1, this.y, this.r, this.g, this.b, this.a);
                matrix.setPixel(this.x + 1, this.y, this.r, this.g, this.b, this.a);
                matrix.setPixel(this.x, this.y - 1, this.r, this.g, this.b, this.a);
                matrix.setPixel(this.x, this.y + 1, this.r, this.g, this.b, this.a);
                break;
            case 2:
                matrix.setPixel(this.x - 1, this.y, this.r, this.g, this.b, this.a);
                matrix.setPixel(this.x + 1, this.y, this.r, this.g, this.b, this.a);
                matrix.setPixel(this.x, this.y - 1, this.r, this.g, this.b, this.a);
                matrix.setPixel(this.x, this.y + 1, this.r, this.g, this.b, this.a);
                break;
            case 3:
                break;


        }
    }
}
