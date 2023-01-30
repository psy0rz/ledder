import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import {random} from "../../utils.js"
import PixelList from "../../PixelList.js"
import Animator from "../../Animator.js"


class Star {
    xStart: number
    yStart: number
    xEnd: number
    yEnd: number
    z: number
    p: Pixel

    constructor(xStart, yStart, xEnd, yEnd) {
        this.xStart = xStart
        this.yStart = yStart
        this.xEnd = xEnd
        this.yEnd = yEnd
        this.z = 0
        this.p = new Pixel(0, 0, new Color(255, 255, 255, 0))
        // this.update()

    }

    update(baseSpeed, acceleration, starOffset) {
        if (this.z == 1)
            return false

        this.z = this.z +
            baseSpeed +
            (this.z * acceleration)
        if (this.z > 1)
            this.z = 1
        this.p.color.a = this.z - (starOffset)
        // this.p.color.a = this.z
        if (this.p.color.a < 0)
            this.p.color.a = 0

        this.p.color.r = 255 * this.z
        this.p.color.g = 255 * this.z

        this.p.x = this.xStart + (this.xEnd - this.xStart) * this.z
        this.p.y = this.yStart + (this.yEnd - this.yStart) * this.z
        return true

    }

}

export default class Starfield extends Animator {
    static category = "Misc"
    static title = "Starfield"
    static description = "blabla"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        const c = new PixelList()
        box.add(c)

        let stars = new Set<Star>()


        const baseSpeedControl = controls.value("Base speed", 0.001, 0.00001, 0.1, 0.0001)
        const accelerationControl = controls.value("Acceleration", 0.03, 0, 0.1, 0.0001)
        const starOffsetControl = controls.value("Star offset", 0.1, 0, 1, 0.001)

        //move all
        scheduler.interval(1, () => {
            for (const star of stars) {
                if (!star.update(baseSpeedControl.value, accelerationControl.value, starOffsetControl.value)) {
                    c.delete(star.p)
                    stars.delete(star)
                }
            }


        })


        // const xStart = display.width / 2 + random(-2,2)
        // const yStart = display.height / 2 + random(2,2)
        const xStart = box.middleX()
        const yStart = box.middleY()
        // const xStart = random(0,display.width-1)
        // const yStart = random(0,display.height-1)

        scheduler.intervalControlled(controls.value("Creation interval", 5), () => {
            let xEnd
            let yEnd
            const side = random(0, 3)

            let xOffset = 0
            let yOffset = 0


            if (side == 0) {
                //left
                xEnd = box.xMin - 1
                yEnd = random(box.yMin, box.yMax)
            } else if (side == 1) {
                //right
                xEnd = box.xMax + 1
                yEnd = random(box.yMin, box.yMax)
            } else if (side == 2) {
                //bottom
                xEnd = random(box.xMin, box.xMax)
                yEnd = box.yMin - 1
            } else if (side == 3) {
                //top
                xEnd = random(box.xMin, box.xMax)
                yEnd = box.yMax + 1
            }

            const star = new Star(xStart + xOffset, yStart + yOffset, xEnd, yEnd)

            c.add(star.p)

            stars.add(star)


        })

    }
}
