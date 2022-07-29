import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {Pixel} from "../Pixel.js"
import {Color} from "../Color.js"
import {PixelContainer} from "../PixelContainer.js"
import DrawText from "./DrawText.js"
import {fontSelect} from "../fonts.js"
import {colorRed} from "../Colors.js"
import {webcrypto} from "crypto"
import {element} from "svelte/internal"
import {random} from "../util.js"
import Draw from "../Draw.js"

export default class DrawCounter extends Draw {
    public targetValue: number

    async run(scheduler: Scheduler, controls: ControlGroup, startValue = 0, digitCount = 5) {

        const font = fontSelect(controls)

        //rotate through a bunch of chars (target may already have a char in it which also will be rotated)
        async function rotate(x, y, chars: string, target: PixelContainer, step = 1) {

            let charStep
            let totalCharOffset

            if (step > 0)
                charStep = -font.height - 1
            else
                charStep = font.height + 1

            totalCharOffset = charStep * chars.length


            //add new chars above or below
            let offset = 0
            let lastChar
            for (const char of chars) {
                offset = offset + charStep
                lastChar = new DrawText(x, y + offset, font, char, colorRed)
                target.add(lastChar)
            }

            //now rotate in step direction
            while (Math.abs(totalCharOffset) >= Math.abs(step)) {
                //move up one step
                totalCharOffset = totalCharOffset + step
                target.move(0, step)
                await scheduler.delay(1)
            }

            //final move
            target.move(0, -totalCharOffset, true)


            //remove rest of the chars
            target.clear()
            target.add(lastChar)

        }


        const spacing = 8
        const wheel = '0123456789'
        let text = []

        let currentValue = startValue
        this.targetValue = startValue

        for (let i = 0; i < digitCount; i++) {
            const digitValue = ~~(currentValue / (Math.pow(10, i))) % 10

            text.unshift(wheel[digitValue])
        }


        async function count(text, index, direction, speed) {
            let d = text[index]
            let wheelIndex = wheel.indexOf(d)
            wheelIndex = wheelIndex + direction

            if (wheelIndex >= wheel.length) {
                //at the end of wheel?

                //reset wheel and carry to next wheel
                text[index] = wheel[0]
                if (index != 0) {
                    rotate(spacing * index, 0, text[index], digits[index], speed)

                    await count(text, index - 1, direction, speed)
                }
            } else if (wheelIndex < 0) {
                //beginning of wheel

                //reset wheel and carry to next wheel
                text[index] = wheel[wheel.length - 1]
                if (index != 0) {
                    rotate(spacing * index, 0, text[index], digits[index], -speed)

                    await count(text, index - 1, direction, speed)
                }

            } else {
                //next on wheel
                text[index] = wheel[wheelIndex]
                if (direction > 0)
                    await rotate(spacing * index, 0, text[index], digits[index], speed)
                else
                    await rotate(spacing * index, 0, text[index], digits[index], -speed)
            }
        }


        //start text
        let i = 0
        let digits = []
        for (const char of text) {
            const c = new PixelContainer()
            this.add(c)
            digits.push(c)
            await rotate(spacing * i, 0, char, c, 2)
            i++
        }


        // await count(text, text.length - 1, 1, 0.9)


        while (1) {
            // await scheduler.delay(1)
            let speed = Math.abs((currentValue - this.targetValue) / controls.value("Speedfactor", 100).value)
            if (speed < 0.1)
                speed = 0.1
            else if (speed > 8)
                speed = 8


            if (currentValue < this.targetValue) {
                currentValue = currentValue + 1
                await count(text, text.length - 1, 1, speed)
            } else if (currentValue > this.targetValue) {
                currentValue = currentValue - 1
                await count(text, text.length - 1, -1, speed)
            } else {
                await scheduler.delay(1)
            }

        }

//

    }
}
