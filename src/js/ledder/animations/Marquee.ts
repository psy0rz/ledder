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
import DrawBox from "../draw/DrawBox.js";
import {Color} from "../Color.js";
import {FxFadeOut} from "../fx/FxFadeOut.js";

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

        let starsGroup=control.group("Stars", false, false)
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

        let flameGroup=control.group("Flames", false, false)
        if (flameGroup.switch('Enabled', false).enabled) {
            const flames=new PixelContainer()
            matrix.add(flames)
            new FxFlames(scheduler,flameGroup).run(charPixels, flames)
        }

        let cursorGroup=control.group("Cursor")
        if (cursorGroup.switch('Enabled', true).enabled) {
            const cursorColor=cursorGroup.color("Color", 128,128,128).copy()
            const cursorX=cursorGroup.value("X offset",2, 0,100,1,true)
            const cursorY=cursorGroup.value("Y offset",1,0,100,1,true)
            const cursorH=cursorGroup.value("Height",6,0,100,1,true)
            const cursorW=cursorGroup.value("Width",5,0,100,1,true)
            const bbox=charPixels.bbox()
            const cursor=new DrawBox(bbox.xMax+cursorX.value, bbox.yMin+cursorY.value , cursorW.value,cursorH.value, cursorColor)
            const fader=new FxFadeOut(scheduler,cursorGroup,10)
            charPixels.add(cursor)
            while(1)
            {
                cursorColor.a=1
                await scheduler.delay(62.5/2) //TODO: actual time calculator
                fader.run(cursorColor)
                await scheduler.delay(62.5/2)

            }
        }



        }

}


