import Animation from "../Animation.js"
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

export default class Test extends Animation {
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
    console.log(fonts)
        box.add(new DrawText(0,0, fontSelect(controls), "Test 123.", new Color(255,0,0)))
        // box.add(new DrawText(0,0, fontSelect(controls, "A", "Tiny 3x3"), "Test 123.", new Color(0,255,0)))

    }
}
