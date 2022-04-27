import {Animation} from "../Animation.js";
import {Pixel} from "../Pixel.js";
import {FontSimple8x8} from "../fonts/FontSimple8x8.js";
import {Matrix} from "../Matrix.js";
import {AnimationTwinkle} from "../AnimationTwinkle.js";

export default class AnimationMarquee extends Animation {

  static title = "Basic marquee"
  static description = ""
  static presetDir = "Marquee"
  static category = "Marquees"


  constructor(matrix:Matrix ) {
    super(matrix);

    const font=FontSimple8x8
    const input=matrix.preset.input('Text', "ABCabc!")

    // const width = text.length * font.width;
    let char_nr = 0;
    let x = 0;

    const intervalControl = matrix.preset.value("Marquee interval", 2, 1, 10, 1);
    const colorControl = matrix.preset.color("Text color");

    new AnimationTwinkle(matrix, this.pixels)

    matrix.scheduler.intervalControlled(intervalControl, () => {

      //move everything to the left
      for (const p of this.pixels) {
        p.x--
        if (p.x<0) {
          p.destroy(matrix)
          this.removePixel(p)
        }

      }

      if (char_nr>=input.text.length)
        char_nr=0

      if (input.text.length==0)
        return

      //add column to the right
      const c = input.text[char_nr];
      if (c!==undefined) {
        for (let y = 0; y < font.height; y++) {
          if (font.data[c][x][y]) {
            this.addPixel(new Pixel(matrix, matrix.width - 1, y, colorControl))
          }

        }
      }

      //goto next column
      x = x + 1;
      if (x == font.width) {
        char_nr++
        x=0;
      }


    })

  }

}
