import {Animation} from "../Animation.js";
import {Pixel} from "../Pixel.js";
import {Matrix} from "../Matrix.js";
import {AnimationTwinkle} from "../AnimationTwinkle.js";


import {mkdir, readFile, rm, stat, writeFile} from "fs/promises";
import {readFileSync} from "fs";
import freetype from "freetype2"
import {Color} from "../Color.js";
import {trim_end} from "svelte/types/compiler/utils/trim.js";

export default class AnimationMarquee extends Animation {

    static title = "freetype marquee"
    static description = ""
    static presetDir = "Marquee2"
    static category = "Marquees"

    constructor(matrix: Matrix) {
        super(matrix);

        // https://damieng.com/typography/zx-origins/#All/All
        // https://fontstruct.com/gallery/tag/41/Pixels
        // const face = freetype.NewMemoryFace(readFileSync('fonts/OpenBaskerville-0.0.53.otf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/C64_Pro_Mono-STYLE.otf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/C64_Pro-STYLE.otf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/PxPlus_IBM_BIOS.ttf'));
        const face = freetype.NewMemoryFace(readFileSync('fonts/MSX-Screen0.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/EightBit Atari-Regular.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/ZX Sierra Quest.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/Anarchist.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/Skid Row.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/Quasar.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/Computer.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/Picopixel.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/ORG_V01_.TTF'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/tiny3x3a.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/tom-thumb.bdf'));

        face.setPixelSizes(0, 8);

        let base=0

        // face.setCharSize()


        const input = matrix.preset.input('Text', "Xx abcdef ABCDEF")

        // const width = text.length * font.width;
        let char_nr = 0;
        let x = 0;

        const intervalControl = matrix.preset.value("Marquee interval", 2, 1, 10, 1);
        const colorControl = matrix.preset.color("Text color", 255);

        // new AnimationTwinkle(matrix, this.pixels)


        matrix.scheduler.intervalControlled(intervalControl, () => {

            //move everything to the left
            for (const p of this.pixels) {
                p.x--
                if (p.x < 0) {
                    p.destroy(matrix)
                }

            }

            if (char_nr >= input.text.length)
                char_nr = 0

            if (input.text.length == 0)
                return


            // //add column to the right
            const c = input.text.charCodeAt(char_nr)

            if (c !== undefined) {
                const glyph = face.loadChar(c, {
                    render: true,
                    loadTarget: freetype.RenderMode.NORMAL,

                });


                // console.log(glyph.bitmap.pitch)
                // const mask=1 << (glyph.bitmap.width-x-1)
                // const mask = 1 << (x%8)
                // const offset =

                // console.log(glyph)
                // console.log(input.text[char_nr],glyph)
                if (glyph.bitmap) {
                    // console.log(input.text[char_nr],glyph.bitmap.height,   glyph.metrics.height/64)
                    if (x >= glyph.bitmapLeft && x - glyph.bitmapLeft < glyph.bitmap.width) {
                        for (let row = 0; row < glyph.bitmap.height; row++) {
                            const offset = (row * glyph.bitmap.pitch) + x - glyph.bitmapLeft
                            const gray = glyph.bitmap.buffer.readUInt8(offset)


                            // console.log(gray)
                            if (gray > 128)
                                this.addPixel(new Pixel(matrix, matrix.width - 1, glyph.bitmapTop - row+base, new Color(255, 0, 0, 1)))
                        }
                    }
                }

                //goto next column
                x = x + 1;
                if (x === glyph.metrics.horiAdvance / 64) {
                    char_nr++
                    x = 0;
                }

            }


        })

    }

}
