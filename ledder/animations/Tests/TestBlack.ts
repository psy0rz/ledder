

//flip colors every other frame to show glitches in some cases. uses low framerate
import PixelBox from "../../PixelBox.js"
import Color from "../../Color.js"
import DrawBox from "../../draw/DrawBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"

export default class TestBlack extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        scheduler.setFrameTimeuS(1000000)

       box.clear()



    }
}
