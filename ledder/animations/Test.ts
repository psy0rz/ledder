import Animator from "../Animator.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import PixelBox from "../PixelBox.js"
import DrawImage from "../draw/DrawImage.js"
import sharp from "sharp"
import FxColorCycle from "../fx/FxColorCycle.js"
import FxColorPattern from "../fx/FxColorPattern.js"


export default class Test extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        // const {data, info} = await sharp('/home/psy/Downloads/hackerhotel1.png').trim().resize({width: 75, height:16}).raw().toBuffer({resolveWithObject: true})
        // const {data, info} = await sharp('/home/psy/Downloads/pixil-frame-0.png').trim().resize({width: 75, height:16, fit:'fill'}).raw().toBuffer({resolveWithObject: true})
        // const image = await sharp('/home/psy/Downloads/hackerhotel1.png')
        const image = await sharp('images/hackerhotel.png')
            // .threshold(255)
            // .trim()
            // .negate({alpha: false})
            // .resize({width: 80, height:32, fit:'inside', kernel: "lanczos3" })


        box.add(await new DrawImage().addImage(0,0,image))

        // const cycle=new FxColorPattern(scheduler, controls)
        // cycle.run(box)



    }
}
