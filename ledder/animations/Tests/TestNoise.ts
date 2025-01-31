import PixelBox from "../../PixelBox.js"
import Pixel from "../../Pixel.js"
import FxBlink from "../../fx/FxBlink.js"
import PixelList from "../../PixelList.js"
import FxRotate from "../../fx/FxRotate.js"
import Scheduler from "../../Scheduler.js"
import Color from "../../Color.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import {colorBlack} from "../../Colors.js"
import {random} from "../../utils.js"


export default class TestNoise extends Animator {


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        const raster = box.raster(box, colorBlack, false, false, false, true)

        const fpsControl = controls.value("FPS", 60, 1, 120, 1)
        fpsControl.onChange(() => {
            scheduler.setFps(fpsControl.value)
        })

        scheduler.interval(1, () => {
            box.forEachPixel((p) => {
                p.color.r = random(0, 255)
                p.color.g = random(0, 255)
                p.color.b = random(0, 255)

            })
        })


    }
}
