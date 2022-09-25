import Animation from "../Animation.js";
import Display from "../Display.js";
import Scheduler from "../Scheduler.js";
import ControlGroup from "../ControlGroup.js";
import FxRotate from "../fx/FxRotate.js";
import {fontSelect} from "../fonts.js";
import DrawText from "../draw/DrawText.js";
import FxFlames from "../fx/FxFlames.js";
import PixelSet from "../PixelSet.js";
import MovingStars from "./MovingStars.js";
import DrawBox from "../draw/DrawBox.js";
import Color from "../Color.js";
import {FxFadeOut} from "../fx/FxFadeOut.js";
import Starfield from "./Starfield.js"
import PixelBox from "../PixelBox.js"

export default class Marquee extends Animation {

    static title = "Marquee"
    static description = ""
    static category = "Marquees"

    async run(box: PixelBox, scheduler: Scheduler, control: ControlGroup)
    {

        const font = fontSelect(control, 'Font')
        const input = control.input('Text', "Marquee  ", true)
        const colorControl = control.color("Text color", 0x21,0xff,0, 1);
        const charPixels=new DrawText(box.xMin,box.yMin, font, input.text, colorControl )
        charPixels.centerV(box)

        let starsGroup=control.group("Stars", false, false)
        if (starsGroup.switch('Enabled', false).enabled) {
            // new MovingStars().run(box,scheduler, starsGroup)
        }

        let starFieldGroup=control.group("Star field", false, false)
        if (starFieldGroup.switch('Enabled', false).enabled) {
            // new Starfield().run(box,scheduler, starFieldGroup)
        }


        //add on top of stars
        box.add(charPixels)

        let scrollGroup=control.group("Scrolling")
        if (scrollGroup.switch('Enabled', true).enabled) {
            const whitespace=scrollGroup.value("Whitespace", 10,0,100,1,true)
            const rotator = new FxRotate(scheduler, scrollGroup)

            const bbox=charPixels.bbox()
            bbox.xMax=bbox.xMax+whitespace.value
            if (bbox.xMax<box.xMax)
                bbox.xMax=box.xMax

            rotator.run(charPixels, bbox)
        }
        else
        {
            charPixels.centerH(box)
        }

        let flameGroup=control.group("Flames", false, false)
        if (flameGroup.switch('Enabled', false).enabled) {
            const flames=new PixelSet()
            box.add(flames)
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
                await scheduler.delay(30)
                fader.run(cursorColor)
                await scheduler.delay(30)

            }
        }



        }

}


