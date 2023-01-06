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
import {colorRed} from "../Colors.js"
import {clearInterval} from "timers"

export default class Test extends Animation {
    private i: NodeJS.Timer
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        //animation that does illegal stuff after ending it
        this.i=setInterval(() => {
            console.log("test interval")
            try {
                box.add(new Pixel(0, 0, colorRed))
                console.log("PIXEL LOOPT NOG")
            } catch (e) {

            }
            try {
                scheduler.interval(60, () => {
                    console.log("SCHEDULER LOOPT NOG")
                })
            } catch (e) {
            }
            try {
                controls.value("TEST")
                console.log("CONTROLGROUP LOOPT NOG")
            } catch (e) {

            }
        }, 1000)

    }

    cleanup() {
        super.cleanup()
        console.log("CLEAUP")
        clearInterval(this.i)
    }
}