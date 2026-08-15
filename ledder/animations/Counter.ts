import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import PixelList from "../PixelList.js"
import DrawText from "../draw/DrawText.js"
import {fonts} from "../fonts.js"
import Animator from "../Animator.js"
import {easeInOutCubic, easeInOutQuad, easeInOutQuart, easeInOutSine, linear} from "../utils.js"
import DrawBox from "../draw/DrawBox.js"
import DrawGlowMask from "../draw/DrawGlowMask.js"

/** The number a user typed into a text control, or 0 when its not a number */
function numberOfInput(text: string): number {
    const value = Number(text)
    return isNaN(value) ? 0 : value
}

//how the digits accelerate and slow down while rolling to a new value.
//https://easings.net, the steeper ones snap into place harder.
const easingFunctionsById = {
    linear: linear,
    easeInOutSine: easeInOutSine,
    easeInOutQuad: easeInOutQuad,
    easeInOutCubic: easeInOutCubic,
    easeInOutQuart: easeInOutQuart,
}

const easingChoices = [
    {id: "linear", name: "Linear (none)"},
    {id: "easeInOutSine", name: "Sine (softest)"},
    {id: "easeInOutQuad", name: "Quadratic"},
    {id: "easeInOutCubic", name: "Cubic"},
    {id: "easeInOutQuart", name: "Quartic (hardest)"},
]

export default class Counter extends Animator {
    static description = "Odometer style counter with rotating digits. Other animations can compose it and call update() to change the value."

    private targetValue: number
    private startValue: number

    private completedPercentage: number


    //over every digit of the counter we pre-generate all possible offsets (for the rotate effect)
    private prepareDigits(x, y, charWidth, charHeight, digitCount, font, colorCounter, colorDivider) {
        const wheelHeight = 10 * charHeight

        const digitPixels: Array<Array<PixelList>> = []

        for (let digitNr = 0; digitNr < digitCount; digitNr++) {
            digitPixels[digitNr] = []
            const charX = x + (digitNr * charWidth)
            for (let offset = 0; offset < wheelHeight; offset++) {
                const container = new PixelList()

                const charY = y - (offset % charHeight)
                const digitValue = ~~(offset / charHeight)

                let aboveDigitValue = (digitValue + 10 - 1) % 10
                let belowDigitValue = (digitValue + 1) % 10

                //character above
                container.add(new DrawText(charX, charY - charHeight, font, aboveDigitValue.toString(), colorCounter))
                container.add(new DrawBox(charX, charY - charHeight - 1, charWidth, 1, colorDivider))

                //character
                container.add(new DrawText(charX, charY , font, digitValue.toString(), colorCounter))
                container.add(new DrawBox(charX, charY - 1, charWidth, 1, colorDivider))

                //character below
                container.add(new DrawText(charX, charY + charHeight, font, belowDigitValue.toString(), colorCounter))
                container.add(new DrawBox(charX, charY + charHeight - 1, charWidth, 1, colorDivider))

                //draw divider between digits
                container.add(new DrawBox(charX-1, y, 1, charHeight, colorDivider))

                //crop stuff thats outside
                container.crop({xMin: x, yMin: y, xMax: x + digitCount * charWidth, yMax: y + font.height-1})

                digitPixels[digitNr][offset] = container

            }
        }

        return (digitPixels)

    }

    /** The dividers of one digit position, without any digit on it: what a hidden leading zero leaves behind.
     * These are the dividers of a wheel at rest, so they line up with those of the digits next to it. */
    private prepareBlankDigits(x, y, charWidth, charHeight, digitCount, font, colorDivider) {

        const blankDigitPixels: Array<PixelList> = []

        for (let digitNr = 0; digitNr < digitCount; digitNr++) {
            const container = new PixelList()
            const charX = x + (digitNr * charWidth)

            //divider below the (invisible) character
            container.add(new DrawBox(charX, y + charHeight - 1, charWidth, 1, colorDivider))

            //divider between digits
            container.add(new DrawBox(charX - 1, y, 1, charHeight, colorDivider))

            //crop stuff thats outside
            container.crop({xMin: x, yMin: y, xMax: x + digitCount * charWidth, yMax: y + font.height - 1})

            blankDigitPixels[digitNr] = container
        }

        return (blankDigitPixels)
    }

    /** defaultDigitCount and defaultSpeedPercentage only set the defaults of the controls with those
     * names, so an animation composing this counter can start it off with something that fits its own
     * layout. Once a preset is saved the control values win. */
    public async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, defaultDigitCount = 5, defaultSpeedPercentage = 0.002) {

        const font = fonts.C64
        font.load()

        const charHeight = font.height
        const charWidth = 7

        //the position is the top left corner of the counter, so an animation that composes us can hand
        //us a box starting exactly where it wants the counter and leave the offsets at zero
        const positionControl = controls.position("Counter position", box, true, "left", 0, "top", 0)
        const digitCountControl = controls.value("Digits", defaultDigitCount, 1, 10, 1, true)
        const controlDigitColor = controls.color("Digit color", 255, 0x90, 0)
        const controlDividerColor = controls.color("Divider color", 0x80, 0x80, 0x80)
        const controlSpeedPercentage = controls.value("Rotate speed", defaultSpeedPercentage, 0.0001, 0.025, 0.0001, true)
        const easingControl = controls.select("Easing", "easeInOutQuart", easingChoices, true)
        //read live in the main loop, so toggling it doesnt need a restart
        const leadingZerosControl = controls.switch("Leading zeros", false, false)
        //fall back to the default, so a preset naming an easing we no longer have still runs
        const easing = easingFunctionsById[easingControl.selected] ?? easeInOutSine

        //lets you use the counter standalone: it rolls from the start value to the value. Text inputs,
        //since these are plain numbers with no useful range to slide over.
        //An animation that composes us leaves both at 0 and calls update() instead.
        const startValueControl = controls.input("Start value", "0", true)
        const valueControl = controls.input("Value", "10000", true)

        const x = positionControl.x
        const y = positionControl.y
        const digitCount = digitCountControl.value

        const digitPixels = this.prepareDigits(x, y, charWidth, charHeight, digitCount, font, controlDigitColor, controlDividerColor)
        const blankDigitPixels = this.prepareBlankDigits(x, y, charWidth, charHeight, digitCount, font, controlDividerColor)

        const digitContainer = new PixelList()
        box.add(digitContainer)

        //make digits look round by fading them
        const startAlphaControl = controls.value("Counter dim %", 50, 0, 100, 1, true)
        const alphaStepsControl = controls.value("Counter dim steps", 3, 0, 4, 1, true)

        if (startAlphaControl.value != 0)
            box.add(new DrawGlowMask(x, y, charWidth * digitCount, charHeight + 1, startAlphaControl.value / 100, alphaStepsControl.value ))

        //seed the target, so the first update() rolls from the start value instead of from zero
        this.targetValue = numberOfInput(startValueControl.text)
        this.update(numberOfInput(valueControl.text))

        //main loop
        while (1) {
            if (this.completedPercentage != 1) {

                //make sure we end on exactly 100%
                this.completedPercentage = this.completedPercentage + controlSpeedPercentage.value

                if (this

                    .completedPercentage > 1) this.completedPercentage = 1

                //current value we're at according to the selected easing function:
                let currentValue = this.startValue + ((this.targetValue - this.startValue) * easing(this.completedPercentage))

                //split up the float currentValue into a integer counterValue and counterOffset
                let counterValue = ~~currentValue
                let counterOffset = ~~((currentValue % 1) * charHeight)

                //print digits
                let div = 1
                let str = `  (${counterValue} @${counterOffset})  `
                let carry = true

                digitContainer.clear()
                for (let digitNr = digitCount - 1; digitNr >= 0; digitNr--) {
                    const divided = ~~(counterValue / div)
                    const digitValue = divided % 10


                    let offset = 0

                    if (carry) {
                        offset = counterOffset
                        if (digitValue != 9) carry = false
                    }

                    //hide the leading zeros, but keep their dividers so the counter keeps its full frame
                    if (!leadingZerosControl.enabled && offset == 0 && divided == 0 && digitNr < digitCount - 1) {
                        for (let blankDigitNr = digitNr; blankDigitNr >= 0; blankDigitNr--)
                            digitContainer.add(blankDigitPixels[blankDigitNr])
                        break
                    }


                    str = `.${digitValue}@${offset}` + str

                    digitContainer.add(digitPixels[digitNr][(digitValue * charHeight) + offset])

                    div = div * 10
                }
                // console.log(str)
                await scheduler.delay(1)
            } else {
                await scheduler.delay(10)
            }
        }
    }


    public update(updateValue) {

        if (this.targetValue === undefined)
            this.targetValue = 0

        this.startValue = this.targetValue
        this.targetValue = updateValue

        // //XXX TEST
        // this.targetValue = 100.5
        // this.startValue = 0

        this.completedPercentage = 0

    }

}
