

//flip colors every other frame to show glitches in some cases. uses low framerate
import PixelBox from "../../PixelBox.js"
import Color from "../../Color.js"
import DrawBox from "../../draw/DrawBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"

export default class TestFlip extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        scheduler.setFrameTimeuS(1000000)

        const c = new Color(255, 0, 0, 0.5)
        box.add(new DrawBox(0, 0, box.width(), box.height(), c))

        let flip = true
        while (1) {
            await scheduler.delay(1)


            // box.move(1,0)

            flip = !flip
            if (flip)
                c.g = 255
            else
                c.g = 0

        }


    }
}
