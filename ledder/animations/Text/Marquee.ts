import PixelBox from "../../PixelBox.js"
import DrawText from "../../draw/DrawText.js"
import MovingStars from "../Components/MovingStars.js"
import Starfield from "../Components/Starfield.js"
import FxRotate from "../../fx/FxRotate.js"
import PixelList from "../../PixelList.js"
import DrawBox from "../../draw/DrawBox.js"
import {FxFadeOut} from "../../fx/FxFadeOut.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {fontSelect} from "../../fonts.js"
import FxFlames from "../../fx/FxFlames.js"
import Animator from "../../Animator.js"
import FxTwinkle from "../../fx/FxTwinkle.js"
import FxColorPattern from "../../fx/FxColorPattern.js"
import TheMatrix from "../MovieFx/TheMatrix.js"



export default class Marquee extends Animator {

    static title = "Marquee"
    static description = ""
    static category = "Marquees"

    async run(box: PixelBox, scheduler: Scheduler, control: ControlGroup) {

        const font = fontSelect(control, 'Font')
        const input = control.input('Text', "Marquee  ", true)
        const colorControl = control.color("Text color", 0x21, 0xff, 0, 1)
        const textPixels = new DrawText(box.xMin, box.yMin, font, input.text, colorControl)


        textPixels.centerV(box)

        //target container for scroll-view
        // const textBox = new PixelBox(box)

        let starsGroup = control.group("Stars", false, false)
        if (starsGroup.switch('Enabled', false).enabled) {
            new MovingStars().run(box, scheduler, starsGroup)
        }

        let starFieldGroup = control.group("Star field", false, false)
        if (starFieldGroup.switch('Enabled', false).enabled) {
            new Starfield().run(box, scheduler, starFieldGroup)
        }

        let theMatrixGroup = control.group("The Matrix", false, false)
        if (theMatrixGroup.switch('Enabled', false).enabled) {
            new TheMatrix().run(box, scheduler, theMatrixGroup)
        }

        //add text on top of background stuff
        box.add(textPixels)

        let scrollGroup = control.group("Scrolling")
        let rotatorPromise
        if (scrollGroup.switch('Enabled', true).enabled) {

            //allow finetuning via actual FPS
            const fpsControl = scrollGroup.value("FPS", 60, 1, 120, 1)
            fpsControl.onChange(() => {
                scheduler.setFps(fpsControl.value)
            })

            const rotator = new FxRotate(scheduler, scrollGroup)

            //show one time or loop?
            let waitX = 0

            //circular?
            if (scrollGroup.switch('Circular', false, true).enabled) {
                //circular display, only add whitespace
                const whitespace = scrollGroup.value("Whitespace", 10, 0, 100, 1, true)
                textPixels.move(whitespace.value, 0)
                //replicate text until display is filled
                const width = textPixels.bbox().xMax - box.xMin
                if (textPixels.bbox().xMax > 0) {
                    let charPixelsCopy = textPixels.copy()
                    while (textPixels.bbox().xMax < box.xMax) {
                        charPixelsCopy.move(width, 0)
                        textPixels.add(charPixelsCopy)

                        charPixelsCopy = charPixelsCopy.copy()
                    }
                    textPixels.flatten()
                }

            } else {
                //non-circular, make sure marquee starts outside of the display
                textPixels.move(box.width(), 0)

                //only show one time?
                if (scrollGroup.switch('Show one time only', false, true).enabled)
                    waitX = textPixels.bbox().xMax - box.xMin

            }
            const textBoundBox = textPixels.bbox()
            textBoundBox.xMin = 0

            rotatorPromise = rotator.run(textPixels, textBoundBox, waitX, null)
        } else {
            //no scrolling
            textPixels.centerH(box)
        }


        let flameGroup = control.group("Flames", false, false)
        if (flameGroup.switch('Enabled', false).enabled) {
            const flames = new PixelList()
            box.add(flames)
            new FxFlames(scheduler, flameGroup).run(textPixels, flames, box)
        }

        let twinkleGroup = control.group("Twinkle")
        if (twinkleGroup.switch('Enabled', false).enabled) {
            const twinkleContainer = new PixelList()
            box.add(twinkleContainer)
            new FxTwinkle(scheduler, twinkleGroup).run(textPixels, box)
        }


        let colorPatternGroup = control.group("Color pattern")
        if (colorPatternGroup.switch('Enabled', false).enabled) {
            new FxColorPattern(scheduler, colorPatternGroup).run(textPixels)
        }

        let cursorGroup = control.group("Cursor")
        if (cursorGroup.switch('Enabled', false).enabled) {
            const cursorColor = cursorGroup.color("Color", 128, 128, 128, 1, true).copy()
            const cursorX = cursorGroup.value("X offset", 2, 0, 100, 1, true)
            const cursorY = cursorGroup.value("Y offset", 1, 0, 100, 1, true)
            const cursorH = cursorGroup.value("Height", 6, 0, 100, 1, true)
            const cursorW = cursorGroup.value("Width", 5, 0, 100, 1, true)
            const cursorOn = cursorGroup.value("On time", 30, 0, 60, 1, false)
            const cursorOff = cursorGroup.value("Off time", 30, 0, 60, 1, false)
            const bbox = textPixels.bbox()
            const cursor = new DrawBox(bbox.xMax + cursorX.value, bbox.yMin + cursorY.value, cursorW.value, cursorH.value, cursorColor)
            const fader = new FxFadeOut(scheduler, cursorGroup, 10)
            textPixels.add(cursor)
            while (1) {
                cursorColor.a = 1
                await scheduler.delay(cursorOn.value)
                fader.run(cursorColor)
                await scheduler.delay(cursorOff.value)

            }
        }

        await rotatorPromise

    }

}


