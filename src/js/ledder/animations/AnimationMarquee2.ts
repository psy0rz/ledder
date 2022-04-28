import {Animation} from "../Animation.js";
import {Pixel} from "../Pixel.js";
import {Matrix} from "../Matrix.js";
import {readFileSync} from "fs";
import freetype from "freetype2"
import {Color} from "../Color.js";
import {CharPixels} from "../CharPixels.js";
import {Font} from "../Font.js";
import {AnimationMove} from "../AnimationMove.js";
import {Value} from "../Value.js";


export default class AnimationMarquee2 extends Animation {

    static title = "freetype marquee"
    static description = ""
    static presetDir = "Marquee2"
    static category = "Marquees"

    constructor(matrix: Matrix) {
        super(matrix);


        const f = new Font('test', 'fonts/EightBit Atari-Regular.ttf', 0, 8, 0)
        f.load()




        // https://damieng.com/typography/zx-origins/#All/All
        // https://fontstruct.com/gallery/tag/41/Pixels
        // const face = freetype.NewMemoryFace(readFileSync('fonts/OpenBaskerville-0.0.53.otf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/C64_Pro_Mono-STYLE.otf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/C64_Pro-STYLE.otf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/PxPlus_IBM_BIOS.ttf'));
        // const face = freetype.NewMemoryFace(readFileSync('fonts/MSX-Screen0.ttf'));
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


        const input = matrix.preset.input('Text', "Atari  2600")

        const intervalControl = matrix.preset.value("Marquee interval", 1, 1, 10, 1);
        const colorControl = matrix.preset.color("Text color", 255);

        const pixels=new CharPixels(matrix, f, input.text, 0, 0, colorControl)

        // new AnimationTwinkle(matrix, this.pixels)
        const mover=new AnimationMove(matrix, intervalControl, new Value(-1), new Value(0))

        mover.add(pixels)




    }

}
