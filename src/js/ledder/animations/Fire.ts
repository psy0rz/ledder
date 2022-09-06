import { Animation } from "../Animation.js";
import { Display } from "../Display.js";
import { Scheduler } from "../Scheduler.js";
import { ControlGroup } from "../ControlGroup.js";
import { Pixel } from "../Pixel.js";
import { Color } from "../Color.js";
import { PixelContainer } from "../PixelContainer.js";
import { glow, randomGaussian } from "../util.js";
import { patternSelect } from "../ColorPatterns.js";
import FxColorCycle from "../fx/FxColorCycle.js";
import { Col } from "framework7-svelte";

export default class Fire extends Animation {
    static category = "Misc"
    static title = "Fire"
    static description = "blabla"
    static presetDir = "Misc";

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {


        // let colors = patternSelect(controls, 'Fire colors', 'Bertrik fire')
        const minIntensityControl = controls.value("Fire minimum intensity %", 0, 0, 100, 1);
        const maxIntensityControl = controls.value("Fire maximum intensity %", 100, 0, 100, 1);
        const wildnessIntensityControl = controls.value("Fire wildness %", 10, 0, 100, 1);
        // const decayControl = controls.value("Fire decay %", 10, 0, 40, 1)
        // const colorScale = (colors.length - 1) / 100
        const fireintervalControl = controls.value("Fire interval", 1, 1, 10, 0.1)
        const colorScale = 1

        //glower
        let glower = []
        for (let x = 0; x < display.width; x++) {
            glower.push(50)
        }

        let cycler = new FxColorCycle(scheduler, controls.group("Color cycle"), "reverse", 16, 0, 1)


        display.scheduler.intervalControlled(fireintervalControl, () => {

            display.move(0, 1)
            //glower

            // glower[0] = glow((glower[0]+glower[display.width-1])/2,
            //     ~~minIntensityControl.value * colorScale,
            //     ~~maxIntensityControl.value * colorScale,
            //     ~~wildnessIntensityControl.value * colorScale, 3)

            for (let x = 0; x < display.width; x++) {
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

                // glower[x]=100

                // const color = colors[glower[x]].copy()
                const color = new Color()
                const pixel = new Pixel(x, 0, color)
                display.add(pixel)

                cycler.run(color, 100 - glower[x]).then(() => {
                    display.delete(pixel)

                })


            }

            // const x=randomGaussian(0, display.width)
            // const color = colors[glower[x]].copy()
            // const pixel = new Pixel(x, 0, color)
            // display.add(pixel)

        })


    }
}
