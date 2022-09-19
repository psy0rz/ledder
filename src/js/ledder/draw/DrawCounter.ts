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
            if (digitNr < 0 || stepSize == 0)
                return


            let oldOffset = wheelOffsets[digitNr]

            //make our step
            wheelOffsets[digitNr] = (wheelOffsets[digitNr] + stepSize) % wheelHeight

            let newOffset = wheelOffsets[digitNr]




            // let oldOffset = wheelOffsets[digitNr]
            //
            // //make our step
            // wheelOffsets[digitNr] = (wheelOffsets[digitNr] + stepSize) % wheelHeight
            //
            // let newOffset = wheelOffsets[digitNr]
            //
            // //each whole wheel revolution means one characterHeight step for the next wheel:
            // let nextStep = ~~(stepSize / wheelHeight) * charHeight
            //
            // //we where outside pushstart
            // if (oldOffset <= pushStart) {
            //     //we've stepped inside
            //     if (newOffset > pushStart) {
            //         console.log("inside", digitNr)
            //         nextStep = nextStep + (newOffset - pushStart)
            //     }
            // }
            // //we where already inside pushstart
            // else {
            //     //stepped out
            //     if (newOffset < pushStart) {
            //         //push it to the end
            //         console.log("to the end", digitNr)
            //         nextStep = nextStep + (wheelHeight - oldOffset)
            //     } else {
            //         if (newOffset > oldOffset) {
            //             //stayed inside, just move it along
            //             console.log("move along",digitNr)
            //             nextStep = nextStep + (newOffset - oldOffset)
            //         } else if (newOffset < oldOffset) {
            //             //stepped "back" (was an almost full wheel revolution step)
            //             //add enough to end up in same offset, but one char later
            //             console.log("step back", digitNr)
            //             nextStep = nextStep + (charHeight-(oldOffset-newOffset))
            //         }
            //     }
            // }


            // //we where outside pushstart
            // if (oldOffset < pushStart) {
            //     //we've stepped inside
            //     if (newOffset >= pushStart) {
            //         nextStep = nextStep + (newOffset - pushStart)
            //     }
            //
            // }
            // //we where already inside pushstart
            // else {
            //     //stepped out
            //     if (newOffset < pushStart) {
            //         //push it to the end
            //         nextStep = nextStep + (wheelHeight - oldOffset)
            //     } else {
            //         if (newOffset > oldOffset) {
            //             //stayed inside, just move it along
            //             nextStep = nextStep + (newOffset - oldOffset)
            //         } else if (newOffset < oldOffset) {
            //             //stepped "back" (was a full wheel revolution step)
            //             //calculate from pushstart
            //             nextStep = nextStep + (newOffset - pushStart)
            //         }
            //     }
            // }

            step(digitNr - 1, nextStep)

        }

        while (1) {
            this.targetValue = ~~(100 ) //xxx
            let diff = this.targetValue - currentValue


            if (diff != 0) {
                let stepSize = 101
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
