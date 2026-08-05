import PixelBox from "../PixelBox.js"
import DrawText from "../draw/DrawText.js"
import FxRotate from "../fx/FxRotate.js"
import PixelList from "../PixelList.js"
import DrawBox from "../draw/DrawBox.js"
import Pixel from "../Pixel.js"
import {FxFadeOut} from "../fx/FxFadeOut.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import {fontSelect} from "../fonts.js"
import FxFlames from "../fx/FxFlames.js"
import Animator from "../Animator.js"
import FxTwinkle from "../fx/FxTwinkle.js"
import FxColorPattern from "../fx/FxColorPattern.js"
import FxSubpixels from "../fx/FxSubpixels.js"
import {interpretMacro} from "../macros.js"
import FxWobble from "../fx/FxWobble.js";
import {colorRed, colorWhite} from "../Colors.js";


export default class Text extends Animator {



    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const font = fontSelect(controls, 'Font')
        const input = controls.input('Text', "Text", true)

        const colorControl = controls.color("Text color", 0x21, 0xff, 0, 1)

        let macroedText=interpretMacro(input.text)

        const positionControl=controls.position("Text anchor position", box, true , "center" , 0, "middle",0)



        const hAlignControl = controls.select("Horizontal text align", "centered", [
            {id: "left", name: "Left"},
            {id: "centered", name: "Centered"},
            {id: "right", name: "Right"},
        ], true)

        const vAlignControl = controls.select("Vertical text align", "middle", [
            {id: "top", name: "Top"},
            {id: "middle", name: "Middle"},
            {id: "bottom", name: "Bottom"},
        ], true)


        const textPixels = new DrawText(positionControl.x, positionControl.y, font, macroedText, colorControl)

        const textBbox = textPixels.bbox()

        if (hAlignControl.selected === "centered")
            textPixels.centerH(positionControl.x, positionControl.y)
        else if (hAlignControl.selected === "right")
            textPixels.move(positionControl.x - textBbox.xMax, 0)

        if (vAlignControl.selected === "middle")
            textPixels.centerV(positionControl.x, positionControl.y)
        else if (vAlignControl.selected === "bottom")
            textPixels.move(0, positionControl.y - textBbox.yMax)

        if (controls.group("Text anchor position").switch("Show anchor", false, true).enabled) {
            const anchorColor = colorWhite.copy()
            textPixels.add(new Pixel(positionControl.x, positionControl.y, colorRed))
            textPixels.add(new Pixel(positionControl.x, positionControl.y, anchorColor))
            scheduler.interval(15, () => {
                anchorColor.a = anchorColor.a ? 0 : 1
            })
        }


        let wobbleGroup=controls.group("Wobble", true,false, true)
        if (wobbleGroup.enabled) {
            let wobble = new FxWobble(scheduler, wobbleGroup)
            wobble.run(textPixels)
        }


        let scrollGroup = controls.group("Scrolling", true, true, true)
        let rotatorPromise
        if (scrollGroup.enabled) {

            //allow finetuning via actual FPS
            const fpsControl = scrollGroup.value("FPS", 60, 1, 120, 1)
            fpsControl.onChange(() => {
                scheduler.setFps(fpsControl.value)
            })

            if (scrollGroup.switch("Subpixel filtering", false).enabled) {
                const subpixelFilter = new FxSubpixels(scheduler, controls)
                const filteredTextPixels = new PixelBox(box)
                box.add(filteredTextPixels)
                subpixelFilter.run(textPixels, filteredTextPixels)
            } else {
                box.add(textPixels)
            }

            const rotator = new FxRotate(scheduler, scrollGroup, -1, 0, 1, 0, 0.01)

            //show one time or loop?
            let waitX = 0

            //circular?
            if (scrollGroup.switch('Circular', false, true).enabled) {
                //circular display, only add whitespace
                const whitespace = scrollGroup.value("Whitespace", 10, 0, 100, 1, true)
                // textPixels.move(whitespace.value, 0)
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
                // textPixels.move(box.width(), 0)

                //only show one time?
                if (scrollGroup.switch('Show one time only', false, true).enabled)
                    waitX = textPixels.bbox().xMax - box.xMin

            }
            const textBoundBox = textPixels.bbox()
            // textBoundBox.xMin = 0
            // textBoundBox.yMin=box.yMin
            // textBoundBox.yMax=box.yMax

            rotatorPromise = rotator.run(textPixels, box, waitX, null)


        } else {
            //no scrolling
            box.add(textPixels)
        }


        let flameGroup = controls.group("Flames", true,true,true)
        if (flameGroup.enabled) {
            const flames = new PixelList()
            box.add(flames)
            new FxFlames(scheduler, flameGroup).run(textPixels, flames, box)
        }

        let twinkleGroup = controls.group("Twinkle", true,true,true)
        if (twinkleGroup.enabled) {
            const twinkleContainer = new PixelList()
            box.add(twinkleContainer)
            new FxTwinkle(scheduler, twinkleGroup).run(textPixels, box)
        }


        let colorPatternGroup = controls.group("Color pattern", true,true,true)
        if (colorPatternGroup.enabled) {
            new FxColorPattern(scheduler, colorPatternGroup).run(textPixels)
        }

        let cursorGroup = controls.group("Cursor",true,true,true)
        if (cursorGroup.enabled) {
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


