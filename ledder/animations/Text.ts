import PixelBox from "../PixelBox.js"
import DrawText, {type HorizontalAlign, type VerticalAlign} from "../draw/DrawText.js"
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
import {interpretMacro} from "../macros.js"
import FxWobble from "../fx/FxWobble.js";
import {colorRed, colorWhite} from "../Colors.js";


export default class Text extends Animator {



    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        const input = controls.input('Text', "Text", true)

        const colorControl = controls.color("Text color", 0x21, 0xff, 0, 1, true)

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


        const hAlign = hAlignControl.selected as HorizontalAlign
        const vAlign = vAlignControl.selected as VerticalAlign

        //How much room the text has inside the box, measured from the anchor in the direction(s) it
        //grows: right for left-aligned, left for right-aligned, both ways (so twice the nearest edge)
        //for centered.
        const roomLeftOfAnchor = positionControl.x - box.xMin + 1
        const roomRightOfAnchor = box.xMax - positionControl.x + 1
        let roomForText = roomRightOfAnchor
        if (hAlign === "right")
            roomForText = roomLeftOfAnchor
        else if (hAlign === "centered")
            roomForText = 2 * Math.min(roomLeftOfAnchor, roomRightOfAnchor) - 1

        const wrapEnabled = controls.switch("Wrap text", true, true).enabled

        const font = fontSelect(controls, 'Font')

        const textPixels = new DrawText(positionControl.x, positionControl.y, font, macroedText, colorControl, 1,
            wrapEnabled ? Math.max(1, roomForText) : undefined,
            hAlign, vAlign)

        if (controls.group("Text anchor position").switch("Show anchor", false, true).enabled) {
            const anchorColor = colorWhite.copy()
            textPixels.add(new Pixel(positionControl.x, positionControl.y, colorRed))
            textPixels.add(new Pixel(positionControl.x, positionControl.y, anchorColor))
            scheduler.interval(15, () => {
                anchorColor.a = anchorColor.a ? 0 : 1
            })
        }


        //The cursor sits at the end of the text: where the next character would be drawn, so it
        //follows wrapping and alignment. It's added to textPixels before scrolling/effects, so it
        //scrolls and repeats along with the text.
        let cursorGroup = controls.group("Cursor", true, true, true)
        if (cursorGroup.enabled) {
            const cursorXOffset = cursorGroup.value("X offset", 0, 0, 100, 1, true)
            const cursorYOffset = cursorGroup.value("Y offset", 1, 0, 100, 1, true)
            const cursorHeight = cursorGroup.value("Height", 6, 0, 100, 1, true)
            const cursorWidth = cursorGroup.value("Width", 5, 0, 100, 1, true)
            const cursorOnTime = cursorGroup.value("On time", 30, 0, 60, 1, false)
            const fader = new FxFadeOut(scheduler, cursorGroup, 10)
            const cursorOffTime = cursorGroup.value("Off time", 30, 0, 60, 1, false)

            const colorCopy=colorControl.copy()
            textPixels.add(new DrawBox(
                textPixels.cursorX + cursorXOffset.value,
                textPixels.cursorY + cursorYOffset.value,
                cursorWidth.value, cursorHeight.value, colorCopy))


            //blinking runs for as long as the animation does, so it's not awaited here
            void (async () => {
                while (1) {
                    colorCopy.a = 1
                    await scheduler.delay(cursorOnTime.value)
                    await fader.run(colorCopy)
                    await scheduler.delay(cursorOffTime.value)
                }
            })()
        }


        let wobbleGroup=controls.group("Wobble", true,false, true)
        if (wobbleGroup.enabled) {
            let wobble = new FxWobble(scheduler, wobbleGroup)
            wobble.run(textPixels)
        }


        let scrollPromise=undefined

        let scrollGroup = controls.group("Scrolling", true, true, true)

        const scrollSpeed=scrollGroup.value("Scroll Speed", 1, 0.1,8,0.1)
        scrollSpeed.meta.enabled=scrollGroup.enabled

        if (scrollGroup.enabled) {

            const scrollsHorizontally = scrollGroup.select("Scroll direction", "horizontal", [
                {id: "horizontal", name: "Horizontal (right to left)"},
                {id: "vertical", name: "Vertical (bottom to top)"},
            ], true).selected === "horizontal"


            const showsOnce = scrollGroup.switch('Show one time only', false, true).enabled

            //blank space between the end of the text and the start of the next repeat. Defaults to a
            //whole display, so by default the text has completely left before it comes back.
            const boxLength = scrollsHorizontally ? box.width() : box.height()
            const gap = scrollGroup.value("Gap", boxLength, 0, 4 * boxLength, 1, true).value

            //empty text has no bbox: scroll an empty 1x1 block so the animation still runs
            const textBbox = textPixels.bbox() ?? {xMin: box.xMin, xMax: box.xMin, yMin: box.yMin, yMax: box.yMin}
            const textLength = scrollsHorizontally
                ? textBbox.xMax - textBbox.xMin + 1
                : textBbox.yMax - textBbox.yMin + 1

            //start just off screen, at the edge the text scrolls in from
            if (scrollsHorizontally)
                textPixels.move(box.xMax + 1 - textBbox.xMin, 0)
            else
                textPixels.move(0, box.yMax + 1 - textBbox.yMin)

            //One repeat is the text plus the gap. The text scrolls on an endless belt built out of
            //whole repeats: pixels that fall off the start of the belt jump back to its end, which
            //makes the loop seamless. The belt must be at least a display plus a text long, so with
            //a small gap we need several copies of the text on it to keep it from showing holes.
            const repeatLength = textLength + gap
            const beltCopies = showsOnce ? 1 : Math.ceil((boxLength + textLength) / repeatLength)
            const beltLength = beltCopies * repeatLength

            //the belt ends where the text starts off screen, and reaches back from there
            const beltMax = (scrollsHorizontally ? box.xMax : box.yMax) + textLength
            const beltMin = beltMax - beltLength + 1
            const beltBbox = {
                xMin: scrollsHorizontally ? beltMin : box.xMin,
                xMax: scrollsHorizontally ? beltMax : box.xMax,
                yMin: scrollsHorizontally ? box.yMin : beltMin,
                yMax: scrollsHorizontally ? box.yMax : beltMax,
            }

            //fill the rest of the belt with copies, each one repeat further back
            let previousCopy: PixelList = textPixels
            for (let copyNr = 1; copyNr < beltCopies; copyNr++) {
                const nextCopy = previousCopy.copy()
                if (scrollsHorizontally)
                    nextCopy.move(-repeatLength, 0)
                else
                    nextCopy.move(0, -repeatLength)
                textPixels.add(nextCopy)
                previousCopy = nextCopy
            }
            if (beltCopies > 1)
                textPixels.flatten()

            //distance to travel before the text has completely left the display
            const scrollLengthUntilGone = textLength + boxLength

            box.add(textPixels)

            //Pixels are moved in whole 1/256ths of a pixel, because unlike e.g. 0.1 those are exactly
            //representable in binary: the coordinates stay exact however long the animation runs.
            //Moving by the raw speed instead would give every pixel its own rounding error, growing
            //with every frame and differing per pixel because it depends on the pixel's own
            //coordinate. Coordinates that should land exactly on an integer then end up just below
            //it and floor a whole pixel too far, tearing the glyphs apart.
            //The quantization error itself doesn't accumulate (it's taken out of the next step), so
            //the average scroll speed still comes out exactly as set.
            const stepsPerPixel = 256

            let scrolled = 0
            let steppedSteps = 0
            scrollPromise = scheduler.interval(1, () => {

                scrolled = scrolled + scrollSpeed.value

                const wantedSteps = Math.round(scrolled * stepsPerPixel)
                const step = (wantedSteps - steppedSteps) / stepsPerPixel
                steppedSteps = wantedSteps

                if (step) {
                    textPixels.forEachPixel((pixel) => {
                        if (scrollsHorizontally) {
                            pixel.x = pixel.x - step
                            if (!showsOnce)
                                pixel.wrapX(beltBbox)
                        } else {
                            pixel.y = pixel.y - step
                            if (!showsOnce)
                                pixel.wrapY(beltBbox)
                        }
                    })
                }

                if (showsOnce && scrolled >= scrollLengthUntilGone)
                    return false
            })

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

        await scrollPromise

    }

}


