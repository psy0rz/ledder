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
import Starfield from "../Components/Starfield.js"
import FxTwinkle from "../../fx/FxTwinkle.js"


export default class Rammstein extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        let starfield=new Starfield().run(box, scheduler, controls.group('stars'))

        //load image and determine colors
        const image = await sharp('images/rammstein.png')
        const imageLetterColor = controls.color('color', 255, 216, 0)

        const logo = await drawImage(0, 0, image)
        logo.setColor(imageLetterColor)
        logo.move(128,0)
        box.add(logo)


        let twinkle=new FxTwinkle(scheduler,controls.group('twinkle')).run(logo, logo)

        //get letters:
        // const letterColorControl=controls.color('Text color', imageLetterColor.r, imageLetterColor.g, imageLetterColor.b)
        // const letters = logo.filterColor(imageLetterColor)
        // letters.setColor(letterColorControl)
        // box.add(letters)

        //find start of each trace and filter it out
        // const traces=new PixelList()
        // box.add(traces)
        //
        // logo.forEachPixel((p) => {
        //     if (imageTraceStartColor.equal(p.color)) {
        //         const trace = logo.filterCluster(p)
        //         traces.add(trace)
        //     }
        // })
        //
        // //make trace color configurable
        // const traceColorControl=controls.color('Trace color', imageTraceColor.r, imageTraceColor.g, imageTraceColor.b)
        // box.replaceColor(imageTraceColor, traceColorControl)
        //
        // const patternGroup=controls.group('Color pattern')
        // if (patternGroup.switch('Color pattern fx', false).enabled)
        //     new FxColorPattern(scheduler, patternGroup
        //     ).run(letters)

        // new FxMove(scheduler,controls).run(box)

        // let rotate=new FxRotate(scheduler, controls).run(logo, {
        //     xMin: 0,
        //     xMax: logo.bbox().xMax+64,
        //     yMin: logo.bbox().yMin,
        //     yMax: logo.bbox().yMax,
        //
        // }, 64*3)
        new FxMove(scheduler, controls,-1,0,2 ).run(box)


        //start trace-effect on all the traces we've found
        // const autoTraceFx=new FxAutoTrace(scheduler,controls)
        // await autoTraceFx.run(traces, box)
        // return Promise.all([starfield, rotate, twinkle])
        // return starfield


    }
}
