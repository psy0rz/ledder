import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {Pixel} from "../Pixel.js"
import {Color} from "../Color.js"
import {PixelContainer} from "../PixelContainer.js"
import {random, randomFloat} from "../util.js"
import FxMove from "../fx/FxMove.js"


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
        this.update()

    }

    update() {
        if (this.z == 1)
            return false

        this.z = this.z + 0.01 + (this.z*0.02)
        if (this.z > 1)
            this.z = 1
        this.p.color.a = this.z - 0.1
        if (this.p.color.a<0)
            this.p.color.a=0

        this.p.color.r=255*this.z
        this.p.color.g=255*this.z

        this.p.x = this.xStart + (this.xEnd - this.xStart) * this.z
        this.p.y = this.yStart + (this.yEnd - this.yStart) * this.z
        return true

    }

}

export default class Template extends Animation {
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
                if (!star.update())
                    stars.delete(star)

            }


        })


        const xStart = display.width / 2
        const yStart = display.height / 2

        scheduler.intervalControlled(controls.value("Creation interval", 10), () => {

            let xEnd
            let yEnd
            const side = random(0, 3)

            if (side == 0) {
                xEnd = -1
                yEnd = random(0, display.height - 1)
            } else if (side == 1) {
                xEnd = display.width + 1
                yEnd = random(0, display.height - 1)
            } else if (side == 2) {
                xEnd = random(0, display.width - 1)
                yEnd = -1
            } else if (side == 3) {
                xEnd = random(0, display.width - 1)
                yEnd = display.height + 1
            }

            const star = new Star(xStart, yStart, xEnd, yEnd)
            c.add(star.p)

            stars.add(star)


        })

    }
}
