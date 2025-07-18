import PixelBox from "../../PixelBox.js"
import sharp from "sharp"
import drawImage from "../../draw/DrawImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"
import FxAutoTrace from "../../fx/FxAutoTrace.js"
import FxColorPattern from "../../fx/FxColorPattern.js"
import FxMove from "../../fx/FxMove.js"
import FxRotate from "../../fx/FxRotate.js"


export default class Hackerhotel extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        scheduler.stop() //going to do external async stuff

        //load image and determine colors
        const image = await sharp('images/hackerhotel.png')




        const imageLetterColor=new Color(255, 216, 0)
        const imageTraceStartColor=new Color(128,128,128)
        const imageTraceColor=new Color(38,127,0)

        const logo = await drawImage(0, 0, image)
        logo.center(box)

        //get letters:
        const letterColorControl=controls.color('Text color', imageLetterColor.r, imageLetterColor.g, imageLetterColor.b)
        const letters = logo.filterColor(imageLetterColor)
        letters.setColor(letterColorControl)
        box.add(letters)

        //find start of each trace and filter it out
        const traces=new PixelList()
        box.add(traces)

        logo.forEachPixel((p) => {
            if (imageTraceStartColor.equal(p.color)) {
                const trace = logo.filterCluster(p)
                traces.add(trace)
            }
        })

        //make trace color configurable
        const traceColorControl=controls.color('Trace color', imageTraceColor.r, imageTraceColor.g, imageTraceColor.b)
        box.replaceColor(imageTraceColor, traceColorControl)

        const patternGroup=controls.group('Color pattern', true,false,true)
        if (patternGroup.enabled) {
            new FxColorPattern(scheduler, patternGroup
            ).run(letters)
            controls.disable(letterColorControl)
        }
        else
        {
            controls.enable(letterColorControl)
        }

        // new FxMove(scheduler,controls).run(box)
        // new FxRotate(scheduler, controls).run(box)

       scheduler.resume()

        //start trace-effect on all the traces we've found
        const autoTraceFx=new FxAutoTrace(scheduler,controls)
        await autoTraceFx.run(traces, box)



    }
}
