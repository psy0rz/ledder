import { Animation } from "./Animation.js";
import { Pixel } from "./Pixel.js";
import { Color } from "./Color.js";
//based on official basic webcolors, but modified for better contast on leds
//https://en.wikipedia.org/wiki/Web_colors
const internetColorMap = {
    w: new Color(0xff, 0xff, 0xff),
    5: new Color(0x80, 0x80, 0x80),
    0: new Color(0, 0, 0),
    r: new Color(0xff, 0, 0),
    m: new Color(0x80, 0, 0),
    y: new Color(0xff, 0xff, 0),
    o: new Color(0x80, 0x80, 0),
    l: new Color(0, 0xff, 0),
    g: new Color(0, 0x80, 0),
    a: new Color(0, 0xff, 0xff),
    t: new Color(0, 0x80, 0x80),
    b: new Color(0, 0, 0xff),
    n: new Color(0, 0, 0x80),
    f: new Color(0xff, 0, 0xff),
    p: new Color(0x80, 0, 0x80), //purple
};
export class AnimationAsciiArt extends Animation {
    /**
     * Create pixels from ascii art. Look at AnimationNyancat for example.
     * Spaces will be ignored, use . as "space"
     *
     * @param matrix
     * @param x
     * @param y
     * @param ascii
     * @param customColorMap
     */
    constructor(matrix, x, y, ascii, customColorMap = undefined) {
        super(matrix);
        let colorMap;
        if (customColorMap !== undefined)
            colorMap = customColorMap;
        else
            colorMap = internetColorMap;
        let currX = x;
        let currY = y;
        for (const c of ascii) {
            // a . is a empty space
            if (c == '.')
                currX++;
            // next line
            else if (c == '\n') {
                currX = x;
                currY--;
            }
            else {
                //add actual pixel with requested color
                if (colorMap[c] !== undefined) {
                    const p = new Pixel(matrix, currX, currY, colorMap[c]);
                    this.addPixel(p);
                    currX++;
                }
            }
        }
    }
}
//# sourceMappingURL=AnimationAsciiArt.js.map