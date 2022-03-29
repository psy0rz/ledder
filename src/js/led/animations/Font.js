import { Animation } from "../Animation.js";
import { FontSimple8x8 } from "../fonts/FontSimple8x8.js";
import { AnimationMarquee } from "../AnimationMarquee.js";
import { AnimationTwinkle } from "../AnimationTwinkle.js";
export class Font extends Animation {
    constructor(matrix) {
        super(matrix);
        const intervalControl = matrix.preset.value("Speed", 50, 1, 50, 0.1);
        const colorControl = matrix.preset.color("color");
        let marquee = new AnimationMarquee(matrix, intervalControl, "Welkom bij Hackerspace Drenthe!        ", FontSimple8x8, colorControl);
        new AnimationTwinkle(matrix, marquee.pixels);
        // let t = "HACK";
        //
        // for (var i=0; i<t.length; i++) {
        //   for (var y=0; y < 8; y++) {
        //     for (var x=0; x < 8; x++) {
        //       if(FontSimple8x8.data[t[i]][x][y])
        //       {
        //         this.addPixel(new Pixel(matrix, i*8+x,y, new Color(255,255,255,1)))
        //       }
        //     }
        //   }
        // }
        //
        // new AnimationMove(matrix, intervalControl, { value:-1},{value: 0}, true ).addPixels(this.pixels)
        //
    }
}
Font.title = "Font";
Font.description = "not finished";
Font.presetDir = "Font";
//# sourceMappingURL=Font.js.map