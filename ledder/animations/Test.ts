import Animator from "../Animator.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Pixel from "../Pixel.js"
import Color from "../Color.js"
import FxRotate from "../fx/FxRotate.js"
import {random} from "../utils.js"
import PixelBox from "../PixelBox.js"
import DrawText from "../draw/DrawText.js"
import {fonts, fontSelect} from "../fonts.js"
import {Col} from "framework7-svelte"
import {colorRed} from "../Colors.js"
import {clearInterval} from "timers"
import {FxFadeMask} from "../fx/FxFadeMask.js"
import PixelList from "../PixelList.js"

export default class Test extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const colorControl=controls.color('Main color')
        const controlY=controls.value('Y coordinate', 3, box.yMin, box.yMax , 1, true)
        const controlInterval=controls.value('Move interval', 1, 1,60)

        const pixel=new Pixel(0,controlY.value, colorControl)
        box.add(pixel)

        scheduler.intervalControlled(controlInterval, ()=>
        {
            box.move(1,0)
            box.wrap(box)

        })

    }
}
