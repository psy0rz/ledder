import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import FxRotate from "../fx/FxRotate.js";
import {fontSelect} from "../fonts.js";
import DrawText from "../draw/DrawText.js";
import FxFlames from "../fx/FxFlames.js";
import {PixelContainer} from "../PixelContainer.js";
import MovingStars from "./MovingStars.js";

export default class Marquee extends Animation {

    static title = "Marquee"
    static description = ""
    static presetDir = "Marquee"
    static category = "Marquees"

    async run(matrix: Matrix, scheduler: Scheduler, control: ControlGroup)
    {

        const font = fontSelect(control, 'Font')
        const input = control.input('Text', "Marquee  ", true)
        const colorControl = control.color("Text color", 0x21,0xff,0, 1);
        const charPixels=new DrawText(0,0, font, input.text, colorControl )
        charPixels.centerV(matrix)

        let starsGroup=control.group("Stars")
        if (starsGroup.switch('Enabled', false).enabled) {
            new MovingStars().run(matrix,scheduler, starsGroup)
        }

        //add on top of stars
        matrix.add(charPixels)

        let scrollGroup=control.group("Scrolling")
        if (scrollGroup.switch('Enabled', true).enabled) {
            const whitespace=scrollGroup.value("Whitespace", 10,0,100,1,true)
            const rotator = new FxRotate(scheduler, scrollGroup)

            const bbox=charPixels.bbox()
            bbox.xMax=bbox.xMax+whitespace.value
            if (bbox.xMax<matrix.width)
                bbox.xMax=matrix.width

            rotator.run(charPixels, bbox)
        }
        else
        {
            charPixels.centerH(matrix)
        }

        let flameGroup=control.group("Flames")
        if (flameGroup.switch('Enabled', false).enabled) {
            const flames=new PixelContainer()
            matrix.add(flames)
            new FxFlames(scheduler,flameGroup).run(charPixels, flames)
        }

    }

}


