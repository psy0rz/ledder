import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {PixelContainer} from "../PixelContainer.js"
import DrawText from "./DrawText.js"
import {fontSelect} from "../fonts.js"
import {colorRed} from "../Colors.js"
import Draw from "../Draw.js"
import {easeInOutCubic} from "../util.js"

export default class DrawCounter extends Draw {
    private targetValue: number
    private running: boolean
    private startValue: number

    private speedPercentage: number
    private completedPercentage: number


    public async update(scheduler: Scheduler, controls: ControlGroup, x, y, updateValue = 0, speedPercentage = 0.002, digitCount = 5) {

        if (this.targetValue === undefined) this.targetValue = 0


        this.startValue = this.targetValue
        this.targetValue = updateValue

        //XXX TEST
        this.targetValue = 10
        this.startValue = 0

        this.speedPercentage = speedPercentage
        this.completedPercentage = 0

        if (this.running === undefined) {
            this.run(scheduler, controls, x, y, digitCount)
            this.running = true
        }
    }


    private async run(scheduler: Scheduler, controls: ControlGroup, x, y, digitCount = 5) {

        const font = fontSelect(controls)

        const charHeight = font.height + 1
        const charWidth = 8

        // const wheel = '0123456789'
        const wheelHeight = 10 * charHeight
        // let text = []

        //prepare the digits
        const digitPixels: Array<Array<PixelContainer>> = []
        for (let digitNr = 0; digitNr < digitCount; digitNr++) {
            digitPixels[digitNr] = []
            const charX = x+(digitNr * charWidth)
            for (let offset = 0; offset < wheelHeight; offset++) {
                const container = new PixelContainer()
                digitPixels[digitNr][offset] = container
                const charY = y+(offset % charHeight)
                const digitValue = ~~(offset / charHeight)
                container.add(new DrawText(charX, charY, font, digitValue.toString(), colorRed))
            }
        }


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
                for (let digitNr = digitCount-1; digitNr >=0; digitNr--) {
                    const divided = ~~(counterValue / div)
                    const digitValue = divided % 10

                    let offset = 0

                    if (carry) {
                        offset = counterOffset
                        if (digitValue != 9) carry = false
                    }

                    str = `.${digitValue}@${offset}` + str

                    this.add(digitPixels[digitNr][(digitValue*charHeight)+offset])

                    div = div * 10
                }
                console.log(str)
            }
            await scheduler.delay(1)
        }

    }
}
