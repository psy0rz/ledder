import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {Pixel} from "../Pixel.js"
import {Color} from "../Color.js"
import {PixelContainer} from "../PixelContainer.js"
import {random} from "../util.js"


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

    update(controls:ControlGroup) {
        if (this.z == 1)
            return false

        this.z = this.z +
            controls.value("Base speed", 0.001, 0.00001,0.1,0.0001).value +
            (this.z* controls.value("Accelration", 0.03, 0, 0.1, 0.0001).value)
        if (this.z > 1)
            this.z = 1
        this.p.color.a = this.z - (controls.value("Star offset", 0.1, 0,1,0.001).value)
        // this.p.color.a = this.z
        if (this.p.color.a<0)
            this.p.color.a=0

        this.p.color.r=255*this.z
        this.p.color.g=255*this.z

        this.p.x = this.xStart + (this.xEnd - this.xStart) * this.z
        this.p.y = this.yStart + (this.yEnd - this.yStart) * this.z
        return true

    }

}

export default class Starfield extends Animation {
    static category = "Misc"
    static title = "Starfield"
    static description = "blabla"
    static presetDir = "Test"


    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const midX = display.width / 2
        const midY = display.height / 2

        const c = new PixelContainer()
        display.add(c)

        let stars = new Set<Star>()

        //move all
        scheduler.interval(1, () => {
            for (const star of stars) {
                if (!star.update(controls))
                    stars.delete(star)

            }


        })


        // const xStart = display.width / 2 + random(-2,2)
        // const yStart = display.height / 2 + random(2,2)
        const xStart = display.width / 2
        const yStart = display.height / 2
        // const xStart = random(0,display.width-1)
        // const yStart = random(0,display.height-1)

        scheduler.intervalControlled(controls.value("Creation interval", 5), () => {
            let xEnd
            let yEnd
            const side = random(0, 3)

            let xOffset=0;
            let yOffset=0

            if (side == 0) {
                xEnd = -1
                yEnd = random(0, display.height - 1)
                // xOffset = random(-75/4,0)
            } else if (side == 1) {
                xEnd = display.width + 1
                yEnd = random(0, display.height - 1)
                // xOffset = random(0,75/4)
            } else if (side == 2) {
                xEnd = random(0, display.width - 1)
                yEnd = -1
                // yOffset=random(-2,0)
            } else if (side == 3) {
                xEnd = random(0, display.width - 1)
                yEnd = display.height + 1
                // yOffset=random(0,2)
            }

            const star = new Star(xStart + xOffset, yStart +yOffset, xEnd, yEnd)

            c.add(star.p)

            stars.add(star)


        })

    }
}
