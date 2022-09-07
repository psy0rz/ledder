import { Animation } from "../Animation.js";
import { Display } from "../Display.js";
import { Scheduler } from "../Scheduler.js";
import { ControlGroup } from "../ControlGroup.js";
import { Pixel } from "../Pixel.js";
import { Color } from "../Color.js";
import { glow, randomGaussian } from "../util.js";
import FxColorCycle from "../fx/FxColorCycle.js";

export default class ParticleFire extends Animation {
    static category = "Fire"
    static title = "Particle fire"
    static description = "Individual pixel objects with color cycle effects on them. (more of a ledder way of doing it)"
    static presetDir = "Misc";

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {


        const minIntensityControl = controls.value("Fire minimum intensity %", 0, 0, 100, 1);
        const maxIntensityControl = controls.value("Fire maximum intensity %", 100, 0, 100, 1);
        const wildnessIntensityControl = controls.value("Fire wildness %", 30, 0, 100, 1);
        const fireintervalControl = controls.value("Fire interval", 1, 1, 10, 0.1)
        const firespeedControl = controls.value("Fire speed", 1, 1, 10, 1)
        const firesparksControl = controls.value("Fire sparks %", 25, 0, 100, 1)
        const colorScale = 1

        //glower
        let glower = []
        for (let x = 0; x < display.width; x++) {
            glower.push(50)
        }

        let cycler = new FxColorCycle(scheduler, controls.group("Color cycle fire"), "reverse", 8, 8, 1)
        let sparksCycler = new FxColorCycle(scheduler, controls.group("Color cycle sparks"), "reverse", 24, 35, 1)


        display.scheduler.intervalControlled(fireintervalControl, () => {
            for (let y = 0; y < firespeedControl.value; y++) {

                display.move(0, 1)

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

                    glower[x] = glow((l + m + r) / 3,
                        ~~minIntensityControl.value * colorScale,
                        ~~maxIntensityControl.value * colorScale,
                        ~~wildnessIntensityControl.value * colorScale, 3)

                    //create pixel and apply color cycle
                    const color = new Color()
                    const pixel = new Pixel(x, 0, color)
                    display.add(pixel)
                    cycler.run(color, 99 - ~~glower[x]).then(() => {
                        display.delete(pixel)

                    })

                }

                //add spark
                if (randomGaussian(0, 100) < firesparksControl.value) {

                    const color = new Color()
                    const pixel = new Pixel(randomGaussian(0,display.width-1), 0, color)
                    display.add(pixel)
                    sparksCycler.run(color,0 ).then(() => {
                        display.delete(pixel)
                    })
                }
            }

        })


    }
}
