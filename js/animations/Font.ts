import {Animation} from "../Animation.js";
import {random} from "../util.js";
import {AnimationMove} from "../AnimationMove.js";
import {Pixel} from "../Pixel.js";
import {AnimationFade} from "../AnimationFade.js";
import {Color} from "../Color.js";
import {AnimationWobbleX} from "../AnimationWobbleX.js";
import { AnimationWobbleY } from "../AnimationWobbleY.js";
import {FontSimple8x8} from "../fonts/FontSimple8x8.js";
import {AnimationMarquee} from "../AnimationMarquee.js";



export class Font extends Animation {

  static title = "Font"
  static description = "not finished"
  static presetDir = "Font"


  constructor(matrix) {
    super(matrix);

    const intervalControl = matrix.preset.value("Speed", 1, 1, 5, 0.1);
    const colorControl = matrix.preset.color("color");

    new AnimationMarquee(matrix, intervalControl, "Dit is een test!       ", FontSimple8x8, colorControl)

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

