import PixelBox from "../../PixelBox.js"
import sharp from "sharp"
import drawImage from "../../draw/DrawImage.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import FxColorPattern from "../../fx/FxColorPattern.js"


export default class Hackerhotel extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        // const {data, info} = await sharp('/home/psy/Downloads/hackerhotel1.png').trim().resize({width: 75, height:16}).raw().toBuffer({resolveWithObject: true})
        // const {data, info} = await sharp('/home/psy/Downloads/pixil-frame-0.png').trim().resize({width: 75, height:16, fit:'fill'}).raw().toBuffer({resolveWithObject: true})
        // const image = await sharp('/home/psy/Downloads/hackerhotel1.png')
        const image = await sharp('images/hackerhotel.png')

        const logo = await drawImage(0, 0, image)
        const letters = logo.filterRGB(255, 216, 0)

        const pattern = new FxColorPattern(scheduler, controls, 240, 10)

        const traces = new PixelList()
        let first = true
        logo.forEachPixel((p) => {
            const f = logo.filterCluster(p)
            box.add(f)
            pattern.run(f)

        })
        box.add(letters)

        traces.print()


        // const cycle=new FxColorPattern(scheduler, controls)
        // cycle.run(box)


    }
}
