export class Pixel {
    constructor(matrix, x, y, r = 255, g = 255, b = 255, a = 1) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.keep = true;
        matrix.addPixel(this);
    }
    destroy(matrix) {
        matrix.removePixel(this);
        this.keep = false;
    }
    render(matrix) {
        matrix.setPixel(this.x, this.y, this.r, this.g, this.b, this.a);
    }
}
export class PixelStar extends Pixel {
    constructor(matrix, x, y, r = 255, g = 255, b = 255, a = 1) {
        super(matrix, x, y, r, g, b, a);
    }
    render(matrix) {
        matrix.setPixel(this.x, this.y, this.r, this.g, this.b, this.a);
        matrix.setPixel(this.x - 1, this.y, this.r, this.g, this.b, this.a);
        matrix.setPixel(this.x + 1, this.y, this.r, this.g, this.b, this.a);
        matrix.setPixel(this.x, this.y - 1, this.r, this.g, this.b, this.a);
        matrix.setPixel(this.x, this.y + 1, this.r, this.g, this.b, this.a);
    }
}
//# sourceMappingURL=Pixel.js.map