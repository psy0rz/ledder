import Animator from "../Animator.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import PixelBox from "../PixelBox.js"
import DrawImage from "../draw/DrawImage.js"
import sharp from "sharp"
import FxColorCycle from "../fx/FxColorCycle.js"
import FxColorPattern from "../fx/FxColorPattern.js"
import drawImage from "../draw/DrawImage.js"
import DrawBox from "../draw/DrawBox.js"
import {colorRed} from "../Colors.js"
import FxRotate from "../fx/FxRotate.js"
import Pixel from "../Pixel.js"
import Color from "../Color.js"
import {flip} from "svelte/animate"


export default class Test extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const c = new Color(0,255, 0, 1)
       const p=new Pixel(3,3,c)

        const c2 = new Color(255, 0, 0, 1)
       const p2=new Pixel(3,3,c2)

        scheduler.setFps(50)
        while (1) {
            box.add(p)
            await scheduler.delay(50)
            box.delete(p)
            await scheduler.delay(50)
            box.add(p2)
            await scheduler.delay(1)
            box.delete(p2)
            await scheduler.delay(50)



        }


    }
}