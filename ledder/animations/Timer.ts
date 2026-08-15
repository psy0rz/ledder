import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import {fontSelect} from "../fonts.js"
import DrawText from "../draw/DrawText.js"
import Animator from "../Animator.js"

import Text from "./Text.js"

function paddy(num, padlen, padchar = '0') {
    var pad = new Array(1 + padlen).join(padchar)
    return (pad + num).slice(-pad.length)
}

export default class Timer extends Animator {


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        let targetDate = new Date(controls.input('Target time', '2024-09-04T00:00', true).text)

        const textBox=new PixelBox(box)
        box.add(textBox)

        const countBox = new PixelBox(box)
        box.add(countBox)

        let controlBeforeColor = controls.color('Before', 0, 255, 0)
        let controlAfterColor = controls.color('After', 255, 0, 0)
        let controlShowHours = controls.switch('Show hours', true)
        let controlShowMs = controls.switch('Show mS', true)

        const font = fontSelect(controls.group("Font"), 'Font', 'C64 mono')
        const positionControl = controls.position('Timer position', box, true, 'left', 0, 'top', 0)


        scheduler.interval(1, () => {

            //milliseconds until the target time, negative once it has passed
            let msUntilTarget = Number(targetDate) - Number(new Date())
            let color


            let text = ""
            if (isNaN(msUntilTarget)) {
                text = "(invalid)"
                color = controlAfterColor
            } else {

                if (msUntilTarget > 0)
                    color = controlBeforeColor
                else
                    color = controlAfterColor

                //count down to the target time, then up again
                let diff = Math.abs(msUntilTarget)
                let ms = diff % 1000

                //seconds
                diff = ~~(diff / 1000)
                let s = diff % 60

                //minutes (total minutes when hours are not shown separately)
                diff = ~~(diff / 60)
                let m = controlShowHours.enabled ? diff % 60 : diff

                //hours
                diff = ~~(diff / 60)
                let h = diff

                //te groot
                // h=h%10

                if (controlShowHours.enabled)
                    text = `${h}:${paddy(m, 2)}:${paddy(s, 2)}`
                else
                    text = `${m}:${paddy(s, 2)}`

                if (controlShowMs.enabled)
                    text = text + `.${paddy(~~(ms / 10), 2)}`
            }




            countBox.clear()
            countBox.add(new DrawText(positionControl.x, positionControl.y, font, text, color))


        })
    }

}
