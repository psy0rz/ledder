import {Animation} from "../Animation.js";
import {ValueInterface} from "../ValueInterface.js";
import {FontInterface} from "../fonts/FontInterface.js";
import {ColorInterface} from "../ColorInterface.js";
import {Pixel} from "../Pixel.js";
import {FontSimple8x8} from "../fonts/FontSimple8x8.js";
import {Matrix} from "../Matrix.js";
import {AnimationTwinkle} from "../AnimationTwinkle.js";
import { Color } from "../Color.js";

export default class Open extends Animation {

  static title = "Open"
  static description = ""
  static presetDir = "Open"
  static category = "Marquees"


  constructor(matrix:Matrix ) {
    super(matrix);

    const font=FontSimple8x8
    const text="Open! "

    const width = text.length * font.width;
    let char_nr = 0;
    let x = 0;

    const intervalControl = matrix.preset.value("Marquee interval", 1, 1, 10, 1);
    // const colorControl = matrix.preset.color("Text color");
    // let colorControl=new Color()

    new AnimationTwinkle(matrix, this.pixels)

    let hue=0;

    matrix.scheduler.intervalControlled(intervalControl, () => {

      //move everything to the left
      for (const p of this.pixels) {
        p.x--
        if (p.x<0) {
          p.destroy(matrix)
          this.removePixel(p)
        }

      }


      hue=(hue+5)%360
      //add column to the right
      const c = text[char_nr];
      for (let y=0; y<font.height; y++)
      {
        if (font.data[c][x][y])
        {
          let color=new Color()
          color.setHsl(hue,100,50)
          this.addPixel(new Pixel(matrix, matrix.width-1,y, color))
        }

      }

      //goto next column
      x = x + 1;
      if (x == font.width) {
        char_nr++
        if (char_nr>=text.length)
          char_nr=0
        x=0;
      }


    })

  }

}
