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


export default class Test extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        scheduler.setFrameTimeuS(1000000)

        const c=new Color(255,0,0,0.3)
        box.add(new DrawBox(0,0,box.width(),32, c))

        let flip=true
        while(1) {
            await scheduler.delay(1)


            // box.move(1,0)

            flip=!flip
            if (flip)
                c.g=255
            else
                c.g=0

        }


    }
}
