import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {Pixel} from "../Pixel.js"
import {Color} from "../Color.js"
import {PixelContainer} from "../PixelContainer.js"
import DrawText from "../draw/DrawText.js"
import {fontSelect} from "../fonts.js"
import {colorRed} from "../Colors.js"

export default class Counter extends Animation {
    static category = "Misc"
    static title = "Mechanical counter"
    static description = "blabla"
    static presetDir = "Misc"

    //rotate a character, returns pixelcontainer


    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const font = fontSelect(controls)

        //rotate through a bunch of chars
        async function rotateUp(x, y, char: string, oldChar: PixelContainer, step=1) {
            const newChar = new DrawText(x, y - font.height - 1, font, char, colorRed)
            display.add(newChar)

            for (let offset = 0; offset < font.height + 1; offset=offset+step) {
                //move up on step
                newChar.move(0, step)
                if (oldChar !== undefined)
                    oldChar.move(0, step)

                await scheduler.delay(10)
            }

            //remove old char
            display.delete(oldChar)
            return (newChar)

        }


        // let digits = []
        // const spacing=8
        // for (let i = 0; i < 4; i++) {
        //     const t = new DrawText(spacing * i, 0, font, '0', colorRed)
        //     console.log(font.width)
        //     digits.push(t)
        //     display.add(t)
        // }

        let old
        for (let i = 0; i < 9; i++) {
            old = await rotateUp(0, 0, `${i}`, old,5)
            // await scheduler.delay(0)
        }


    }
}
