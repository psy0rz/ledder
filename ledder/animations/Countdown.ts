import Pixel from "../Pixel.js"
import Display from "../Display.js"
import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import {fontSelect} from "../fonts.js"
import DrawText from "../draw/DrawText.js"
import Animator from "../Animator.js"
import Nyancat from "./Memes/Nyancat.js"
import XmasSantaReindeer from "./ReinsCollection/XmasSantaReindeer.js"

function paddy(num, padlen, padchar = '0') {
    var pad = new Array(1 + padlen).join(padchar)
    return (pad + num).slice(-pad.length)
}

export default class Countdown extends Animator {


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const font = fontSelect(controls)

        let targetDate = new Date('2023-12-31T23:59:59')

        // let targetDate = new Date('2022-04-01T12:37:42');

        const textColor = controls.color("Text color", 255, 0, 0, 1)
        let cat=new Nyancat()
         cat.run(box, scheduler, controls.group('cat'))

        const countBox=new PixelBox(box)
        box.add(countBox)

const kerstman=new XmasSantaReindeer()
        kerstman.run(box, scheduler,controls.group('xmas'))


        let blinkdir = 1 / 60
        let hue = 0
        scheduler.interval(1, () => {

            //millesec
            let diff = Number(targetDate) - Number(new Date())

            if (diff <= 0) {

                textColor.a = textColor.a + blinkdir
                if (textColor.a >= 1) {
                    blinkdir = -blinkdir
                    textColor.a = 1
                }
                if (textColor.a <= 0) {
                    blinkdir = -blinkdir
                    textColor.a = 0
                }
            }

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


            let text = `${h}:${paddy(m, 2)}:${paddy(s, 2)}.${paddy(~~(ms / 10), 2)}`
            countBox.clear()
            countBox.add(new DrawText(0,0,font, text, controls.color()))
            countBox.center(box)


        })
    }

}
