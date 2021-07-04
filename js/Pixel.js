export class Pixel {
    constructor(matrix, x, y, r = 255, g = 255, b = 255, a = 1) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        matrix.addPixel(this);
    }
    render(matrix) {
        matrix.setPixel(this.x, this.y, this.r, this.g, this.b, this.a);
    }
}
//# sourceMappingURL=Pixel.js.map
