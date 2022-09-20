import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {PixelContainer} from "../PixelContainer.js"
import DrawText from "./DrawText.js"
import {fontSelect} from "../fonts.js"
import {colorRed} from "../Colors.js"
import Draw from "../Draw.js"
import FxFlameout from "../fx/FxFlameout.js"
import {next} from "dom7"

export default class DrawCounter extends Draw {
    private targetValue: number
    private running: boolean
    private startValue: number

    private speedPercentage: number
    private completedPercentage: number


    public async update(scheduler: Scheduler, controls: ControlGroup, x, y, updateValue = 0, speedPercentage = 0.01, digitCount = 5) {

        if (this.targetValue === undefined)
            this.targetValue = 0


        this.startValue = this.targetValue
        this.targetValue = updateValue

        //XXX TEST
        this.targetValue=10
        this.startValue=0

        this.speedPercentage = speedPercentage
        this.completedPercentage = 0

        if (this.running === undefined) {
            this.run(scheduler, controls, x, y, digitCount)
            this.running = true
        }
    }


    private async run(scheduler: Scheduler, controls: ControlGroup, x, y, digitCount = 5) {

        const font = fontSelect(controls)

        // const charHeight = font.height + 1
        const charHeight = 10

        const wheel = '0123456789'
        const wheelHeight = wheel.length * charHeight
        let text = []

        //always start at zero
        let counterValue = 0

        //offset of last wheel, for the all important rotating counter effect
        let digitOffset = 0


        //step counter with a certain stepsize and direction. to increase by a whole value use charHeight as stepSize.
        function step(stepSize) {
            const oldOffset = digitOffset
            digitOffset = (digitOffset + stepSize) % charHeight

            //number of full digit steps
            counterValue = counterValue + ~~(stepSize / charHeight)

            //did we loop and filled a partial digit?
            if (stepSize > 0 && digitOffset < oldOffset)
                counterValue = counterValue + 1
            else if (stepSize < 0 && digitOffset > oldOffset)
                counterValue = counterValue - 1

        }

        while (1) {

            this.completedPercentage = this.completedPercentage + this.speedPercentage

            if (this.completedPercentage < 1) {

                //current value we're at according to our easing function:
                let currentValue = this.startValue + ((this.targetValue - this.startValue) * this.completedPercentage)
                console.log(currentValue)

                //which step size is needed to get there?
                step(~~((currentValue - counterValue) * charHeight))
                // console.log(currentValue, digitOffset)

                //print digits
                let div = 1
                let str = `  (${counterValue} @${digitOffset})  `
                let carry = true
                for (let digitNr = 0; digitNr < digitCount; digitNr++) {
                    const divided = ~~(counterValue / div)
                    const digitValue = divided % 10

                    let offset = 0
                    if (carry) {
                        offset = digitOffset
                        if (digitValue != 9)
                            carry = false
                    }

                    str = `.${digitValue}@${offset}` + str

                    div = div * 10
                }
                console.log(str)
            }
            await scheduler.delay(1)
        }

    }
}
