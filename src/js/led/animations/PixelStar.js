import { Pixel } from "../Pixel.js";
export class PixelStar extends Pixel {
    constructor(matrix, x, y, color, delay, bg = false) {
        super(matrix, x, y, color, bg);
        this.step = 0;
        matrix.scheduler.intervalControlled(delay, () => {
            this.step = (this.step + 1) % 3;
            return (this.keep);
        });
    }
    render(matrix) {
        switch (this.step) {
            case 0:
                matrix.setPixel(this.x, this.y, this.color);
                break;
            case 1:
                matrix.setPixel(this.x, this.y, this.color);
                matrix.setPixel(this.x - 1, this.y, this.color);
                matrix.setPixel(this.x + 1, this.y, this.color);
                matrix.setPixel(this.x, this.y - 1, this.color);
                matrix.setPixel(this.x, this.y + 1, this.color);
                break;
            case 2:
                matrix.setPixel(this.x - 1, this.y, this.color);
                matrix.setPixel(this.x + 1, this.y, this.color);
                matrix.setPixel(this.x, this.y - 1, this.color);
                matrix.setPixel(this.x, this.y + 1, this.color);
                break;
            case 3:
                break;
        }
    }
}
//# sourceMappingURL=PixelStar.js.map