import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {PixelContainer} from "../PixelContainer.js"
import DrawText from "./DrawText.js"
import {fonts, fontSelect} from "../fonts.js"
import {colorRed, colorWhite} from "../Colors.js"
import Draw from "../Draw.js"
import {easeInOutCubic, easeInOutQuad, easeInOutQuart, easeInOutSine} from "../util.js"
import DrawBox from "./DrawBox.js"
import DrawGlowMask from "./DrawGlowMask.js"
import {ControlValue} from "../ControlValue.js"

export default class DrawCounter extends Draw {
    private targetValue: number
    private running: boolean
    private startValue: number

    private completedPercentage: number
    private speedPercentageControl: ControlValue


    //over every digit of the counter we pre-generate all possible offsets (for the rotate effect)
    private prepareDigits(x, y, charWidth, charHeight, digitCount, font, colorCounter, colorDivider) {
        const wheelHeight = 10 * charHeight

        const digitPixels: Array<Array<PixelContainer>> = []

        for (let digitNr = 0; digitNr < digitCount; digitNr++) {
            digitPixels[digitNr] = []
            const charX = x + (digitNr * charWidth)
            for (let offset = 0; offset < wheelHeight; offset++) {
                const container = new PixelContainer()

                const charY = y + (offset % charHeight)
                const digitValue = ~~(offset / charHeight)

                let aboveDigitValue = (digitValue + 10 - 1) % 10
                let belowDigitValue = (digitValue + 1) % 10

                //character above
                container.add(new DrawText(charX, charY + charHeight, font, aboveDigitValue.toString(), colorCounter))
                container.add(new DrawBox(charX, charY + charHeight, charWidth, 1, colorDivider))

                //character
                container.add(new DrawText(charX, charY, font, digitValue.toString(), colorCounter))
                container.add(new DrawBox(charX, charY, charWidth, 1, colorDivider))

                //character below
                container.add(new DrawText(charX, charY - charHeight, font, belowDigitValue.toString(), colorCounter))
                container.add(new DrawBox(charX, charY - charHeight, charWidth, 1, colorDivider))

                //draw divider between digits
                container.add(new DrawBox(charX - 1, charY - charHeight, 1, charHeight * 3, colorDivider))

                //crop stuff thats outside
                container.crop({xMin: x, yMin: y, xMax: x + digitCount * charWidth, yMax: y + font.height})

                digitPixels[digitNr][offset] = container

            }
        }

        return (digitPixels)

    }

    public async run(scheduler: Scheduler, controls: ControlGroup, x, y, digitCount = 5, speedPercentage=0.002) {

        const font = fonts.C64
        font.load()

        const charHeight = font.height
        const charWidth = 7

        const controlDigitColor = controls.color("Digit color", 255, 0x90, 0)
        const controlDividerColor = controls.color("Divider color", 0x80, 0x80, 0x80)
        const controlSpeedPercentage = controls.value("Rotate speed", speedPercentage, 0, 0.025, 0.0001)

        const digitPixels = this.prepareDigits(x, y, charWidth, charHeight, digitCount, font, controlDigitColor, controlDividerColor)

        const digitContainer = new PixelContainer()
        this.add(digitContainer)

        //make digits look round by fading them
        const startAlphaControl = controls.value("Counter dim %", 80, 0, 100, 1, true)
        const middleAlphaControl = controls.value("Counter dim middle %", 50, 0, 100, 1, true)

        if (startAlphaControl.value != 0)
            this.add(new DrawGlowMask(x, y, charWidth * digitCount, charHeight + 1, startAlphaControl.value / 100, middleAlphaControl.value / 100))

        this.update(0)

        //main loop
        while (1) {
            if (this.completedPercentage != 1) {

                //make sure we end on exactly 100%
                this.completedPercentage = this.completedPercentage + controlSpeedPercentage.value

                if (this

                    .completedPercentage > 1) this.completedPercentage = 1

                //current value we're at according to our easing function:
                // let currentValue = this.startValue + ((this.targetValue - this.startValue) * easeInOutCubic(this.completedPercentage))
                let currentValue = this.startValue + ((this.targetValue - this.startValue) * easeInOutSine(this.completedPercentage))
                // let currentValue = this.startValue + ((this.targetValue - this.startValue) * easeInOutQuad(this.completedPercentage))
                // let currentValue = this.startValue + ((this.targetValue - this.startValue) * easeInOutQuart(this.completedPercentage))

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

                    //prevent leading zeros
                    if (offset==0 && divided==0 && digitNr< digitCount-1)
                        break


                    str = `.${digitValue}@${offset}` + str

                    digitContainer.add(digitPixels[digitNr][(digitValue * charHeight) + offset])

                    div = div * 10
                }
                // console.log(str)
                await scheduler.delay(1)
            }
            else
            {
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
