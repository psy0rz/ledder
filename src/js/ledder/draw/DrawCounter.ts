import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {PixelContainer} from "../PixelContainer.js"
import DrawText from "./DrawText.js"
import {fontSelect} from "../fonts.js"
import {colorRed} from "../Colors.js"
import Draw from "../Draw.js"
import FxFlameout from "../fx/FxFlameout.js"

export default class DrawCounter extends Draw {
    private targetValue: number
    private running: boolean


    public async update(scheduler: Scheduler, controls: ControlGroup, x, y, updateValue = 0, digitCount = 5) {
        if (this.running === undefined) {
            this.run(scheduler, controls, x, y, updateValue, digitCount)
            this.running = true
        } else {
            this.targetValue = updateValue

        }
    }


    private async run(scheduler: Scheduler, controls: ControlGroup, x, y, startValue = 0, digitCount = 5) {

        const font = fontSelect(controls)

        // const charHeight = font.height + 1
        const charHeight = 10

        const wheel = '0123456789'
        const wheelHeight = wheel.length * charHeight
        const pushStart = wheelHeight - charHeight // start pushing next wheel from this position
        let text = []

        let currentValue = 0
        this.targetValue = startValue

        const wheelOffsets = []

        //create digits
        for (let i = 0; i < digitCount; i++) {
            wheelOffsets.push(0)
        }

        function step(digitNr, stepSize) {
            if (digitNr < 0)
                return

            //how much does it step in?
            let stepin = (wheelOffsets[digitNr] + stepSize) - pushStart

            //push next wheel (starts pushing when at last character of current wheel)
            if (stepin > 0) {
                // let stepnext = (stepin%stepSize)+1
                let stepNext=(wheelOffsets[digitNr]+stepSize)%(charHeight)

                //carry to next digit
                step(digitNr - 1, stepNext%(stepSize+1))
            }

            wheelOffsets[digitNr] = (wheelOffsets[digitNr] + stepSize) % wheelHeight

        }

        while (1) {
            this.targetValue = 100 //xxx
            let diff = this.targetValue - currentValue


            if (diff != 0) {
                let stepSize = 3
                currentValue = currentValue + 1

                step(digitCount - 1, stepSize)
                console.log(wheelOffsets)
            }

            await scheduler.delay(1)

        }

        //
        // for (let i = 0; i < digitCount; i++) {
        //     const digitValue = ~~(currentValue / (Math.pow(10, i))) % 10
        //     text.unshift(wheel[digitValue])
        // }
        //


        // //start text
        // let i = 0
        // let digits = []
        // for (const char of text) {
        //     const c = new PixelContainer()
        //     this.add(c)
        //     digits.push(c)
        //     await rotate(x + spacing * i, y, char, c, 2)
        //     i++
        // }

        // let turbo=0
        // while (1) {
        //     // await scheduler.delay(1)
        //     let diff=Math.abs((currentValue - this.targetValue))
        //
        //     let speed = diff / controls.value("Speedfactor", 100).value
        //     let magnitude=0
        //     if (speed < 0.2)
        //         speed = 0.2
        //     else if (speed > 8) {
        //         speed = 8
        //     }
        //
        //     magnitude=0
        //     while (diff>100)
        //     {
        //         diff=diff/10
        //         magnitude++
        //
        //     }
        //
        //     if (currentValue < this.targetValue) {
        //
        //         turbo=(turbo+1)%wheel.length
        //         for (let i=0;i<magnitude; i++) {
        //             const digitNr=digits.length-1-i
        //             rotate(x + (spacing * digitNr), y, wheel[turbo], digits[digitNr], speed)
        //         }
        //
        //         currentValue = currentValue + (Math.pow(10,magnitude))
        //
        //         await count(text, text.length - 1 - magnitude, 1, speed)
        //     } else if (currentValue > this.targetValue) {
        //         turbo=(turbo+1)%wheel.length
        //         for (let i=0;i<magnitude; i++) {
        //             const digitNr=digits.length-1-i
        //             rotate(x + (spacing * digitNr), y, wheel[turbo], digits[digitNr], -speed)
        //         }
        //         currentValue = currentValue - (Math.pow(10,magnitude))
        //         await count(text, text.length - 1 -magnitude, -1, speed)
        //     } else {
        //         await scheduler.delay(1)
        //     }
        //
        // }
    }
}
