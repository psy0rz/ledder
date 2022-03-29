//basic pixel. Will add itself to the display matrix.
export class Pixel {
    /**
     * Renders one pixel.
     * @param matrix Display matrix
     * @param x X coord
     * @param y Y coord
     * @param color Color object
     * @param bg Make true to add to background
     */
    constructor(matrix, x, y, color, bg = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.keep = true;
        if (bg)
            matrix.addPixelBG(this);
        else
            matrix.addPixel(this);
    }
    destroy(matrix) {
        matrix.removePixel(this);
        this.keep = false;
    }
    render(matrix) {
        matrix.setPixel(this.x, this.y, this.color);
    }
}
//# sourceMappingURL=Pixel.js.map