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

        //rotate through a bunch of chars (target may already have a char in it which also will be rotated)
        async function rotateUp(x, y, chars: string, target: PixelContainer, step = 1) {

            //add new chars below
            const charHeight = font.height + 1
            const totalHeight = charHeight * chars.length
            // let texts=new PixelContainer()
            // display.add(texts)

            let offset = 0
            let lastChar
            for (const char of chars) {
                offset = offset - charHeight
                lastChar = new DrawText(x, y + offset, font, char, colorRed)
                target.add(lastChar)
            }
            //now rotate up
            for (offset = 0; offset < totalHeight - step; offset = offset + step) {
                //move up one step
                target.move(0, step)
                await scheduler.delay(1)
            }

            //final move
            target.move(0, totalHeight-offset)

            //remove rest of the chars
            target.clear()
            target.add(lastChar)

 //           target.clear()


            // remove old char and add final char
            // display.delete(oldChar)
            // const newChar=new DrawText(x, y - offset, font, char, colorRed)
            // return (newChar)

        }


        // let digits = []
        const spacing=8
        // for (let i = 0; i < 4; i++) {
        //     const t = new DrawText(spacing * i, 0, font, '0', colorRed)
        //     console.log(font.width)
        //     digits.push(t)
        //     display.add(t)
        // }

        // let old
        // for (let i = 0; i < 9; i++) {
        //     old = await rotateUp(0, 0, `${i}`, old,5)
        //     // await scheduler.delay(0)
        // }

        const wheel='01234567890'
        let text='31337'



        let i=0
        let digits=[]
        for (const char of text)
        {
            const c = new PixelContainer()
            display.add(c)
            digits.push(c)
            await rotateUp(spacing*i, 0, char, c, 1)
            i++
        }

        // await rotateUp(0, 0, '0123456', c, 1)
    }
}
