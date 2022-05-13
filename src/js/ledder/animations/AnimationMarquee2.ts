import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {CharPixels} from "../CharPixels.js";
import {Scheduler} from "../Scheduler.js";
import {Controls} from "../Controls.js";
import FxRotateLeft from "../fx/FxRotateLeft.js";
import {fontSelect} from "../fonts.js";

export default class AnimationMarquee2 extends Animation {

    static title = "freetype marquee"
    static description = ""
    static presetDir = "Marquee2"
    static category = "Marquees"

    async run(matrix: Matrix, scheduler: Scheduler, control: Controls)
    {

        const font = fontSelect(control, 'Font')
        const input = matrix.control.input('Text', "Atari 2600 ", true)
        const colorControl = control.color("Text color", 100,0,0, 1);
        const charPixels=new CharPixels(matrix, font, input.text, 0, 0, colorControl)

        // new AnimationTwinkle(matrix, this.pixels)
        if (control.switch('Scroll', false, true).enabled) {
            const rotator = new FxRotateLeft(matrix, "Move")

            await rotator.run(charPixels)
        }

    }

}


