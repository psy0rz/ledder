import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {CharPixels} from "../CharPixels.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import FxRotate from "../fx/FxRotate.js";
import {fontSelect} from "../fonts.js";

export default class AnimationMarquee2 extends Animation {

    static title = "freetype marquee"
    static description = ""
    static presetDir = "Marquee2"
    static category = "Marquees"

    async run(matrix: Matrix, scheduler: Scheduler, control: ControlGroup)
    {

        const font = fontSelect(control, 'Font')
        const input = control.input('Text', "Atari 2600 ", true)
        const colorControl = control.color("Text color", 255,0,0, 1);
        const charPixels=new CharPixels(matrix, font, input.text, 0, 0, colorControl)

        // new AnimationTwinkle(matrix, this.pixels)
        if (control.switch('Scroll', true).enabled) {
            const rotator = new FxRotate(matrix,control)
            await rotator.run(charPixels)
        }

    }

}


