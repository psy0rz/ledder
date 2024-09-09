import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import {fontSelect} from "../fonts.js"
import DrawText from "../draw/DrawText.js"
import Animator from "../Animator.js"

import Marquee from "./Text/Marquee.js"

function paddy(num, padlen, padchar = '0') {
    var pad = new Array(1 + padlen).join(padchar)
    return (pad + num).slice(-pad.length)
}

export default class Countdown extends Animator {


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        let targetDate = new Date(controls.input('Target time', '2024-09-04T00:00', true).text)

        const marqueeBox=new PixelBox(box)
        box.add(marqueeBox)

        const countBox = new PixelBox(box)
        box.add(countBox)

        let controlNormalColor = controls.color('Normal', 0, 255, 0)
        let controlWarningColor = controls.color('Warning', 255, 0, 0)
        let controlShowMs = controls.switch('Show mS', true)
        let controlWarningMinutes = controls.value('Warning time (min)', 60, -60, 600)

        const font = fontSelect(controls.group("Font"), 'Font', 'C64 mono')
        let controlX = controls.group("Font").value('X', box.xMin, box.xMin, box.xMax)
        let controlY = controls.group("Font").value('Y', box.xMin, box.yMin, box.yMax)

        let blinkdir = 1 / 60

        let marquee=new Marquee()
        marquee.run(marqueeBox, scheduler,controls.group("Marquee"))

        scheduler.interval(1, () => {

            //millesec
            let diff = Number(targetDate) - Number(new Date())
            let color


            let text = ""
            if (isNaN(diff)) {
                text = "(invalid)"
                color = controlWarningColor
            } else {

                if (diff / 60000 < controlWarningMinutes.value)
                    color = controlWarningColor
                else
                    color = controlNormalColor

                let timeout=false
                if (diff <= 0) {
                    diff = 0
                    timeout=true
                }

                if (timeout) {

                    color.a = color.a + blinkdir
                    if (color.a >= 1) {
                        blinkdir = -blinkdir
                        color.a = 1
                    }
                    if (color.a <= 0) {
                        blinkdir = -blinkdir
                        color.a = 0
                    }
                }
                else
                    color.a=1

                // hue = (hue + 1)%361
                // textColor.setHsl(hue,100,50)

                diff = Math.abs(diff)
                let ms = diff % 1000

                //seconds
                diff = ~~(diff / 1000)
                let s = diff % 60

                //minutes
                diff = ~~(diff / 60)
                let m = diff % 60

                //hours
                diff = ~~(diff / 60)
                let h = diff

                //te groot
                // h=h%10

                text = `${h}:${paddy(m, 2)}:${paddy(s, 2)}`

                if (controlShowMs.enabled)
                    text = text + `.${paddy(~~(ms / 10), 2)}`
            }




            countBox.clear()
            countBox.add(new DrawText(controlX.value, controlY.value, font, text, color))


        })
    }

}
