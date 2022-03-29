import { Animation } from "./Animation.js";
import { Pixel } from "./Pixel.js";
export class AnimationMarquee extends Animation {
    constructor(matrix, interval, text, font, color) {
        super(matrix);
        const width = text.length * font.width;
        let char_nr = 0;
        let x = 0;
        matrix.scheduler.intervalControlled(interval, () => {
            //move everything to the left
            for (const p of this.pixels) {
                p.x--;
                if (p.x < 0) {
                    p.destroy(matrix);
                    this.removePixel(p);
                }
            }
            //add column to the right
            const c = text[char_nr];
            for (let y = 0; y < font.height; y++) {
                if (font.data[c][x][y]) {
                    this.addPixel(new Pixel(matrix, matrix.width - 1, y, color));
                }
            }
            //goto next column
            x = x + 1;
            if (x == font.width) {
                char_nr++;
                if (char_nr >= text.length)
                    char_nr = 0;
                x = 0;
            }
        });
    }
}
//# sourceMappingURL=AnimationMarquee.js.map