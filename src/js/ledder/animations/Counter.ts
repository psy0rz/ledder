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
            target.move(0, totalHeight - offset)

            //remove rest of the chars
            target.clear()
            target.add(lastChar)

        }


        // let digits = []
        const spacing = 8
        const wheel = '0123456789'
        let text = ['0', '0', '0' ,'0', '0']




        async function countUp(text, index, speed)
        {
            let d = text[index]
            let wheelIndex = wheel.indexOf(d)
            //at the end of wheel?
            if (wheelIndex==wheel.length-1)
            {
                //reset wheel and carry to next wheel
                text[index]=wheel[0];
                if (index!=0) {
                    rotateUp(spacing * index, 0, text[index], digits[index], speed)

                    await countUp(text, index - 1, speed)
                }
            }
            else
            {
                //next on wheel
                text[index]=wheel[wheelIndex+1]
                await rotateUp(spacing * index, 0, text[index], digits[index], speed)
            }
        }


        //start text
        let i = 0
        let digits = []
        for (const char of text) {
            const c = new PixelContainer()
            display.add(c)
            digits.push(c)
            await rotateUp(spacing * i, 0, char, c, 8)
            i++
        }


        let speed=8
        for (let i=0;i<10000; i++)
        {
            speed=speed-0.1
            // console.log(text)
            await countUp(text, text.length - 1,speed)
        }


//

    }
}
