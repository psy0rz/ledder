import PixelBox from "../../PixelBox.js"
import sharp from "sharp"
import drawImage from "../../draw/DrawImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import FxColorPattern from "../../fx/FxColorPattern.js"
import Color from "../../Color.js"



export default class Hackerhotel extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        // const {data, info} = await sharp('/home/psy/Downloads/hackerhotel1.png').trim().resize({width: 75, height:16}).raw().toBuffer({resolveWithObject: true})
        // const {data, info} = await sharp('/home/psy/Downloads/pixil-frame-0.png').trim().resize({width: 75, height:16, fit:'fill'}).raw().toBuffer({resolveWithObject: true})
        // const image = await sharp('/home/psy/Downloads/hackerhotel1.png')
        const image = await sharp('images/hackerhotel.png')
        const letterColor=new Color(255, 216, 0)
        const traceStartColor=new Color(128,128,128)

        const logo = await drawImage(0, 0, image)
        //letter color:
        const letters = logo.filterColor(letterColor)

        const pattern = new FxColorPattern(scheduler, controls, 240, 10)

        let first = true

        //find start of each trace and filter it out
        logo.forEachPixel((p) => {
            if (traceStartColor.equal(p.color)) {
                const trace = logo.filterCluster(p)
                box.add(trace)
                pattern.run(trace)
            }

        })
        box.add(letters)



        // const cycle=new FxColorPattern(scheduler, controls)
        // cycle.run(box)


    }
}
