import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {PixelContainer} from "../PixelContainer.js"
import DrawText from "./DrawText.js"
import {fontSelect} from "../fonts.js"
import {colorRed, colorWhite} from "../Colors.js"
import Draw from "../Draw.js"
import {easeInOutCubic} from "../util.js"
import DrawBox from "./DrawBox.js"

export default class DrawCounter extends Draw {
    private targetValue: number
    private running: boolean
    private startValue: number

    private speedPercentage: number
    private completedPercentage: number


    public async update(scheduler: Scheduler, controls: ControlGroup, x, y, updateValue = 0, speedPercentage = 0.001, digitCount = 5) {

        if (this.targetValue === undefined) this.targetValue = 0


        this.startValue = this.targetValue
        this.targetValue = updateValue

        //XXX TEST
        this.targetValue = 100
        this.startValue = 0

        this.speedPercentage = speedPercentage
        this.completedPercentage = 0

        if (this.running === undefined) {
            this.run(scheduler, controls, x, y, digitCount)
            this.running = true
        }
    }


    //over every digit of the counter we pre-generate all possible offsets (for the rotate effect)
    private prepareDigits(x, y, charWidth, charHeight, digitCount, font) {
        const wheelHeight = 10 * charHeight

        //prepare the digits
        const digitPixels: Array<Array<PixelContainer>> = []

        for (let digitNr = 0; digitNr < digitCount; digitNr++) {
            digitPixels[digitNr] = []
            const charX = x + (digitNr * charWidth)
            for (let offset = 0; offset < wheelHeight; offset++) {
                const container = new PixelContainer()

                digitPixels[digitNr][offset] = container

                const charY = y + (offset % charHeight)
                const digitValue = ~~(offset / charHeight)

                let aboveDigitValue = (digitValue + 10 - 1) % 10
                let belowDigitValue = (digitValue + 1) % 10


                //character above
                container.add(new DrawText(charX, charY + charHeight, font, aboveDigitValue.toString(), colorRed))
                container.add(new DrawBox(charX, charY + charHeight, charWidth, 1, colorWhite))
                //character
                container.add(new DrawText(charX, charY, font, digitValue.toString(), colorRed))
                container.add(new DrawBox(charX, charY, charWidth, 1, colorWhite))
                //character below
                container.add(new DrawText(charX, charY - charHeight, font, belowDigitValue.toString(), colorRed))
                container.add(new DrawBox(charX, charY - charHeight, charWidth, 1, colorWhite))

                //crop stuff thats oudside
                // container.crop({ xMin: x, yMin: y, xMax: x+digitCount*charWidth, yMax: y+font.height})
            }
        }

        return (digitPixels)

    }

    private async run(scheduler: Scheduler, controls: ControlGroup, x, y, digitCount = 5) {

        const font = fontSelect(controls)

        const charHeight = font.height + 1
        const charWidth = 8

        const digitPixels = this.prepareDigits(x, y, charWidth, charHeight, digitCount, font)

        while (1) {

            if (this.completedPercentage != 1) {

                //make sure we end on exactly 100%
                this.completedPercentage = this.completedPercentage + this.speedPercentage

                if (this

                    .completedPercentage > 1) this.completedPercentage = 1

                //current value we're at according to our easing function:
                let currentValue = this.startValue + ((this.targetValue - this.startValue) * easeInOutCubic(this.completedPercentage))

                //split up the float currentValue into a integer counterValue and counterOffset
                let counterValue = ~~currentValue
                let counterOffset = ~~((currentValue % 1) * charHeight)

                //print digits
                let div = 1
                let str = `  (${counterValue} @${counterOffset})  `
                let carry = true

                this.clear()
                for (let digitNr = digitCount - 1; digitNr >= 0; digitNr--) {
                    const divided = ~~(counterValue / div)
                    const digitValue = divided % 10

                    let offset = 0

                    if (carry) {
                        offset = counterOffset
                        if (digitValue != 9) carry = false
                    }

                    str = `.${digitValue}@${offset}` + str

                    this.add(digitPixels[digitNr][(digitValue * charHeight) + offset])

                    div = div * 10
                }
                // console.log(str)
            }
            await scheduler.delay(1)
        }

    }
}
