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

        // const charHeight = font.height + 1
        const charHeight = 10

        const wheel = '0123456789'
        const wheelHeight = wheel.length * charHeight
        let text = []


        while (1) {

            this.completedPercentage = this.completedPercentage + this.speedPercentage

            if (this.completedPercentage <= 1) {

                //current value we're at according to our easing function:
                let currentValue = this.startValue + ((this.targetValue - this.startValue) * this.completedPercentage)
                console.log(currentValue)

                //split up the float currentValue into a integer counterValue and counterOffset
                let counterValue = ~~currentValue
                let counterOffset = ~~((currentValue % 1) * charHeight)

                //print digits
                let div = 1
                let str = `  (${counterValue} @${counterOffset})  `
                let carry = true
                for (let digitNr = 0; digitNr < digitCount; digitNr++)
                 {
                    const divided = ~~(counterValue / div)
                    const digitValue = divided % 10

                    let offset = 0
                    if (carry) {
                        offset = counterOffset
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
