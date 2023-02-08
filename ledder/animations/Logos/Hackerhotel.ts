import PixelBox from "../../PixelBox.js"
import sharp from "sharp"
import drawImage from "../../draw/DrawImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"
import {random} from "../../utils.js"
import FxTrace from "../../fx/FxTrace.js"


export default class Hackerhotel extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        //load image and determine colors
        const image = await sharp('images/hackerhotel.png')
        const letterColor=new Color(255, 216, 0)
        const traceStartColor=new Color(128,128,128)

        const logo = await drawImage(0, 0, image)

        //get letters:
        const letters = logo.filterColor(letterColor)
        box.add(letters)



        //find start of each trace and filter it out
        const traces=new PixelList()
        box.add(traces)

        logo.forEachPixel((p) => {
            if (traceStartColor.equal(p.color)) {
                const trace = logo.filterCluster(p)
                traces.add(trace)
            }
        })

        const traceFx=new FxTrace(scheduler, controls)

        traceFx.run(letters, box)

        while(1) {
            await scheduler.delay(random(0, 30))
            const trace=traces.random()
            if (trace instanceof PixelList)
            {
                traceFx.run(trace, box)



            }

        }


    }
}
