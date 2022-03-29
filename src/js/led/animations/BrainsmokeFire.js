import { Animation } from "../Animation.js";
import { glow } from "./DoomFire.js";
import { Pixel } from "../Pixel.js";
import { Color } from "../Color.js";
export class BrainsmokeFire extends Animation {
    constructor(matrix) {
        super(matrix);
        this.old = [];
        this.new = [];
        // oversampling x2 !
        this.w = matrix.width * 2;
        this.h = matrix.height * 2;
        //create fire-pixel maps
        for (let h = 0; h < this.h + 2; h++) {
            this.old[h] = [];
            this.new[h] = [];
            for (let w = 0; w < this.w + 2; w++) {
                this.old[h][w] = 0;
                this.new[h][w] = 0;
            }
        }
        //create actual pixels
        this.xypixels = [];
        for (let h = 0; h < matrix.height; h++) {
            this.xypixels[h] = [];
            for (let w = 0; w < matrix.width; w++) {
                const p = new Pixel(matrix, w, matrix.height - h - 1, new Color(0, 0, 0));
                this.addPixel(p);
                this.xypixels[h][w] = p;
            }
        }
        //colortab
        this.colortab = [];
        for (let c = 0; c < 256; c++)
            this.colortab.push(this.color(c / 256));
        this.black = new Color(0, 0, 0);
        //decay mapping
        this.mapping = [];
        for (let m = 0; m < 2048; m++)
            this.mapping.push(~~Math.min(((m / 256) ** 1.25 / 3.7 * 256), 2047));
        this.minIntensityControl = matrix.preset.value("Fire minimum intensity", 0, 0, 2047, 20);
        this.maxIntensityControl = matrix.preset.value("Fire maximum intensity", 650, 0, 2047, 20);
        this.wildnessIntensityControl = matrix.preset.value("Fire wildness", 100000, 0, 2047, 20);
        const fireintervalControl = matrix.preset.value("Fire interval", 60 / 50, 1, 10, 0.1); //best at 50fps according to brainsmoke
        matrix.scheduler.intervalControlled(fireintervalControl, () => {
            this.next();
        });
    }
    color(x) {
        let [r, g, b] = [x ** 1 * 3, x ** 1.5 * 4., x ** 2];
        if (r > 1.)
            r = 1.;
        if (g > 1.)
            g = 1.;
        if (b > 1.)
            b = 1.;
        if (r == 1 && g == 1 && b == 1)
            [r, g, b] = [1, 1, 1];
        return new Color(~~(r * 255), ~~(g * 255), ~~(b * 255));
    }
    next() {
        let [w, h] = [this.w, this.h];
        // console.log(this.new)
        this.old = this.new;
        this.new = [];
        for (let y = 0; y < h + 1; y++) {
            // if (y == h):
            //   r = random.getrandbits(w)
            this.new[y] = [];
            for (let x = 0; x < w; x++) {
                let s = 0;
                //below-bottom row is glowing
                if (y == h) {
                    //(original is random switching between only 0 and 650, not in between.)
                    s = glow(this.old[y][x], this.minIntensityControl.value, this.maxIntensityControl.value, this.wildnessIntensityControl.value);
                }
                else 
                //other rows decay
                {
                    s = this.old[y + 1][x];
                    if (x > 0)
                        s += this.old[y + 1][x - 1];
                    if (x < w - 1)
                        s += this.old[y + 1][x + 1];
                }
                //decay mapper magic
                // console.log(s)
                this.new[y][x] = this.mapping[Math.min(s, 2047)];
            }
            // print
        }
        //downsample and assigned mapped color to actual pixels
        for (let y = 0; y < h; y = y + 2) {
            for (let x = 0; x < w; x = x + 2) {
                const avg = ~~((this.new[y][x] + this.new[y][x + 1] + this.new[y + 1][x] + this.new[y + 1][x + 1]) / 4);
                if (avg >= this.colortab.length)
                    this.xypixels[y / 2][x / 2].color = this.black;
                else
                    this.xypixels[y / 2][x / 2].color = this.colortab[avg];
            }
        }
    }
}
BrainsmokeFire.category = "Fire";
BrainsmokeFire.title = "Brainsmoke";
BrainsmokeFire.description = "Fire based on <a href='https://github.com/techinc/lewd/blob/master/animations/fire.py'>this.</a><br>Has an interesting decay method.";
BrainsmokeFire.presetDir = "BrainsmokeFire";
//# sourceMappingURL=BrainsmokeFire.js.map