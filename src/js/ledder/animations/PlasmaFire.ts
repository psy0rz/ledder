import { Animation } from "../Animation.js";
import { Pixel } from "../Pixel.js";
import { Color } from "../Color.js";
import { Display } from "../Display.js";
import { Scheduler } from "../Scheduler.js";
import { ControlGroup } from "../ControlGroup.js";
import { fireColorsBertrik, patternSelect } from "../ColorPatterns.js";
import { glow, random, randomFloatGaussian, randomGaussian } from "../util.js";
import { DisplayMulti } from "../../server/drivers/DisplayMulti.js";
import { colorBlack } from "../Colors.js";


export default class BertrikFire extends Animation {
    static category = "Fire"
    static title = "Plasma Fire"
    static description = "Based on Fire, based on <a href='https://github.com/bertrik/nyancat/blob/master/fire.c'>this.</a>"
    static presetDir = "PlasmaFire";





    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {


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

                const cool = ~~this.newValue & 3
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
        for (let x = 0; x < display.width; x++) {
            pixels[x] = []

            for (let y = 0; y < display.height + 2; y++) {
                pixels[x][y] = new FlamePixel(x, y - 2)
                display.add(pixels[x][y])
            }
        }

        //determine neighbours
        for (let x = 1; x < display.width - 1; x++) {

            for (let y = 1; y < display.height - 1 + 2; y++) {
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

        display.scheduler.intervalControlled(fireintervalControl, (frameNr) => {

            for (let x = 0; x < display.width; x++) {
                for (let y = 1; y < display.height + 2; y++) {
                    pixels[x][y].calculate()

                }
            }

            for (let x = 0; x < display.width; x++) {
                for (let y = 1; y < display.height + 2; y++) {
                    pixels[x][y].apply(pixels[x][y - 1].newValue)
                }
            }

            for (let x = 0; x < display.width; x++) {
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
