import Animation from "Animation.js";
import Pixel from "Pixel.js";
import Scheduler from "Scheduler.js";
import ControlGroup from "ControlGroup.js";
import { patternSelect } from "ColorPatterns.js";
import { glow, randomGaussian } from "utils.js";
import { colorBlack } from "Colors.js";
import PixelBox from "PixelBox.js"


export default class PlasmaFire extends Animation {
    static category = "Fire"
    static title = "Plasma Fire "
    static description = "Base on the 1993 Firedemo"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        const fireintervalControl = controls.value("Fire interval", 1, 1, 10, 0.1)
        const minIntensityControl = controls.value("Fire minimum intensity %", 0, 0, 100, 1);
        const maxIntensityControl = controls.value("Fire maximum intensity %", 100, 0, 100, 1);
        const wildnessIntensityControl = controls.value("Fire wildness %", 25, 0, 100, 1);
        const decayControl = controls.value("Fire decay ", 25, 0, 100, 1)
        const decayDensity = controls.value("Fire decay density % ", 100, 0, 100, 1)

        // const fireMoveFactorControl = controls.value("Fire sintel factor", 0, 0, 2, 0.01)
        // const fireSpeedControl = controls.value("Fire speed", 1, 1, 10, 1)

        const colors = patternSelect(controls, 'Fire colors', 'Bertrik fire')


        class FlamePixel extends Pixel {
            value: number
            newValue: number
            neighbours: Array<FlamePixel> = []

            constructor(x, y) {
                super(x, y, colorBlack)
                this.value = 0
                this.newValue = 0
            }

            //calculate new value
            calculate() {
                this.newValue = 0

                if (this.neighbours.length == 0)
                    return

                for (const flamePixel of this.neighbours) {
                    this.newValue = this.newValue + flamePixel.value
                }

//                const cool = ~~this.newValue & 3
                this.newValue = this.newValue / (this.neighbours.length)

                // if (cool && this.newValue >= 10) {
                //     this.newValue=this.newValue-10
                // }
                if (randomGaussian(0, 100) < decayDensity.value) {
                    if (this.newValue >= decayControl.value)
                        this.newValue = this.newValue - decayControl.value
                    else
                        this.newValue = 0


                }

            }

            //apply a value and color
            apply(value: number) {
                this.value = value
                this.color = colors[~~this.value]
            }
        }

        let pixels: Array<Array<FlamePixel>> = []

        //create flame pixels
        for (let x = 0; x < box.width(); x++) {
            pixels[x] = []

            for (let y = 0; y < box.height() + 2; y++) {
                pixels[x][y] = new FlamePixel(x, y - 2)
                box.add(pixels[x][y])
            }
        }


        //determine neighbours
        for (let x = 1; x < box.width() - 1; x++) {

            for (let y = 1; y < box.height() - 1 + 2; y++) {
                const p = pixels[x][y]

                //lower
                p.neighbours.push(pixels[x - 1][y - 1])
                p.neighbours.push(pixels[x][y - 1])
                p.neighbours.push(pixels[x + 1][y - 1])

                //upper
                p.neighbours.push(pixels[x - 1][y + 1])
                p.neighbours.push(pixels[x][y + 1])
                p.neighbours.push(pixels[x + 1][y + 1])

                //sides
                p.neighbours.push(pixels[x - 1][y])
                p.neighbours.push(pixels[x + 1][y])


            }
        }

        const colorScale = (colors.length - 1) / 100

        scheduler.intervalControlled(fireintervalControl, (frameNr) => {

            //calculate new values
            for (let x = 0; x < box.width(); x++) {
                for (let y = 1; y < box.height() + 2; y++) {
                    pixels[x][y].calculate()

                }
            }

            //apply calculated values
            for (let x = 0; x < box.width(); x++) {
                for (let y = 1; y < box.height() + 2; y++) {
                    pixels[x][y].apply(pixels[x][y - 1].newValue)
                }
            }

            //glow
            for (let x = 0; x < box.width(); x++) {
                // if (pixels[x][0].value<=1)
                pixels[x][0].value = pixels[x][0].newValue =
                    glow(pixels[x][0].value,
                        ~~minIntensityControl.value * colorScale,
                        ~~maxIntensityControl.value * colorScale,
                        ~~wildnessIntensityControl.value * colorScale, 3)
            }
        })
    }
}
