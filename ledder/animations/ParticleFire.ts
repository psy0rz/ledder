import Animation from "../Animation.js";
import Display from "../Display.js";
import Scheduler from "../Scheduler.js";
import ControlGroup from "../ControlGroup.js";
import Pixel from "../Pixel.js";
import Color from "../Color.js";
import { glow, randomGaussian } from "../util.js";
import FxColorCycle from "../fx/FxColorCycle.js";
import FxRandomMove from "../fx/FxRandomMove.js";
import PixelContainer from "../PixelContainer.js";

export default class ParticleFire extends Animation {
    static category = "Fire"
    static title = "Particle fire"
    static description = "Individual pixel objects with color cycle effects on them. (more of a ledder way of doing it)"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        let wind = new FxRandomMove(scheduler, controls.group("Wind"), -0.3, 0.3, 0.9, 1, 1, 0, false)

        const fireGroup = controls.group("Fire")

        const minIntensityControl = fireGroup.value("Minimum intensity %", 0, 0, 100, 1);
        const maxIntensityControl = fireGroup.value("Maximum intensity %", 100, 0, 100, 1);
        const wildnessIntensityControl = fireGroup.value("Wildness %", 30, 0, 100, 1);
        const fireintervalControl = fireGroup.value("Interval", 1, 1, 10, 0.1)
        // const firespeedControl = controls.value("Fire speed", 1, 1, 10, 1)
        let cycler = new FxColorCycle(scheduler, fireGroup.group("Flame cycle"), "reverse", 8, 4, 1)

        const sparksGroup = controls.group("Sparks")
        const firesparksControl = sparksGroup.value("Amount %", 25, 0, 100, 1)

        let sparksCycler = new FxColorCycle(scheduler, sparksGroup.group("Spark cycle"), "reverse", 8, 8, 1)
        let sparksMover = new FxRandomMove(scheduler, sparksGroup.group("Movement"), -1, 1, -0.1, 0.1, 1, 0, true)

        wind.run(display)

        let fireContainer = new PixelContainer()
        display.add(fireContainer)

        let sparksContainer = new PixelContainer()
        display.add(sparksContainer)
        sparksMover.run(sparksContainer)

        //glower
        let glower = []
        for (let x = 0; x < display.width; x++) {
            glower.push(50)

        }

        display.scheduler.intervalControlled(fireintervalControl, () => {

            let glowerTmp = []

            for (let x = 0; x < display.width; x++) {
                //average pixel with neighbours and apply glowing
                let l, r
                let m = glower[x]
                if (x > 0)
                    l = glower[x - 1]
                else
                    l = glower[display.width - 1]

                if (x < display.width - 1)
                    r = glower[x + 1]
                else
                    r = glower[0]


                glower[x] = glow((l +  r) / 2.01,
                    ~~minIntensityControl.value,
                    ~~maxIntensityControl.value,
                    ~~wildnessIntensityControl.value, 3)

                //create pixel and apply color cycle
                const color = new Color()
                const pixel = new Pixel(x, 0, color)
                fireContainer.add(pixel)
                cycler.run(color, 99 - ~~glower[x]).then(() => {
                    fireContainer.delete(pixel)

                })


            }
            // glower = glowerTmp



            //add spark
            if (randomGaussian(0, 100) < firesparksControl.value) {

                const color = new Color()
                const pixel = new Pixel(randomGaussian(0, display.width - 1), 0, color)
                sparksContainer.add(pixel)
                sparksCycler.run(color, 0).then(() => {
                    sparksContainer.delete(pixel)
                })


            }
            // }

        })


    }
}
