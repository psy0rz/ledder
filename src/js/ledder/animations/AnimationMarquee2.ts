import {Animation} from "../Animation.js";
import {Pixel} from "../Pixel.js";
import {Matrix} from "../Matrix.js";
import {AnimationTwinkle} from "../AnimationTwinkle.js";


import {mkdir, readFile, rm, stat, writeFile} from "fs/promises";
import {readFileSync} from "fs";
import freetype from "freetype2"

export default class AnimationMarquee extends Animation {

  static title = "freetype marquee"
  static description = ""
  static presetDir = "Marquee2"
  static category = "Marquees"

  constructor(matrix:Matrix ) {
    super(matrix);


    // const face = freetype.NewMemoryFace(readFileSync('fonts/C64_Pro_Mono-STYLE.otf'));
    const face = freetype.NewMemoryFace(readFileSync('fonts/OpenBaskerville-0.0.53.otf'));
    face.setPixelSizes(0, 8);


    const input=matrix.preset.input('Text', "ABC ")

    // const width = text.length * font.width;
    let char_nr = 0;
    let x = 0;

    const intervalControl = matrix.preset.value("Marquee interval", 2, 1, 10, 1);
    const colorControl = matrix.preset.color("Text color");

    // new AnimationTwinkle(matrix, this.pixels)


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



      // //add column to the right
      const c = input.text.charCodeAt(char_nr)

      if (c!==undefined) {
        const glyph = face.loadChar(c, {
          render: true,
          loadTarget: freetype.RenderMode.MONO
        });

        // const mask=1 << (glyph.bitmap.width-x-1)
        const mask=1 << x

        for (let y = 0; y < glyph.bitmap.height; y++) {

          if (glyph.bitmap.buffer.readUInt8(y) & mask)
            this.addPixel(new Pixel(matrix, matrix.width - 1, y, colorControl))
        }


        //goto next column
        x = x + 1;
        if (x == glyph.bitmap.width) {
          char_nr++
          x=0;
        }

      }


    })

  }

}
