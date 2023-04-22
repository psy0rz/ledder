// /**
//  * "Rules" of the display rain code, by watching the original scene: https://www.youtube.com/watch?v=8ZdpA3p9ZMY :
//  *
//  * - Every column has a rain trail at random moments
//  * - Most trails have the same speed but around 10% as falling with about 50% speed
//  * - The trails have a "head" that starts white and quickly fades to dark a green tail. The tail slowly fades out to black
//  * - A new trail can only start if the previous head has left the screen. (previous tail may still exist)

//  */

import Color from "../../Color.js"
import {random} from "../../utils.js"
import Pixel from "../../Pixel.js"
import {FxFadeOut} from "../../fx/FxFadeOut.js"
import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"

export default class TheMatrix extends Animator {


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const headColor = controls.color("Head color", 128, 128, 128)
        const tailColor = controls.color("Tail color", 0, 128, 0)
        const speed = controls.value("Fall interval", 5, 1, 30, 0.1)
        const createinterval = controls.value("Create interval", 10, 1, 40, 1)

        const slowprecentage = controls.value("Slow trials (percent)", 10, 0, 100, 1)
        const speedSlow = controls.value("Slow fall interval", 10, 1, 100, 1)

        const fxFadeHead = new FxFadeOut(scheduler, controls.group("Fade head"), 10, 5)
        const fxFadeTail = new FxFadeOut(scheduler, controls.group("Fade tail"), 30, 5)

        let trails = []

        const container = new PixelList()
        box.add(container)

        //interval to start new trails
        scheduler.intervalControlled(createinterval, () => {

            //start new trail
            let x = random(box.xMin, box.xMax)
            let y = box.yMin

            //1 trail-head per column max.
            if (trails[x])
                return true

            trails[x] = true

            let thisSpeed
            if (random(1, 100) <= slowprecentage.value)
                thisSpeed = speedSlow.value
            else
                thisSpeed = speed.value


            //interval to draw the actual pixels in a trail
            scheduler.interval(thisSpeed, () => {

                //add pixel to trail
                if (y <= box.yMax) {

                    let c1 = new Color(headColor.r, headColor.g, headColor.b)
                    const p1 = new Pixel(x, y, c1)

                    let c2 = new Color(tailColor.r, tailColor.g, tailColor.b)
                    const p2 = new Pixel(x, y, c2)

                    //layered approach with alpha bending
                    container.add(p2)
                    container.add(p1)

                    fxFadeHead.run(c1).then(() => {
                        container.delete(p1)
                        fxFadeTail.run(c2).then(() => {
                            container.delete(p2)
                        })
                    })
                } else {
                    trails[x] = false
                    return false
                }
                y++
                return true
            })
            return true
        })
    }
}


