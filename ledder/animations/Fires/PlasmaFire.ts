import PixelBox from "../../PixelBox.js"
import {colorBlack} from "../../Colors.js"
import {glow, randomFloatGaussian, randomGaussian} from "../../utils.js"
import Scheduler from "../../Scheduler.js"
import {patternSelect} from "../../ColorPatterns.js"
import ControlGroup from "../../ControlGroup.js"
import Pixel from "../../Pixel.js"

import Animation from "../../Animation.js"
import {inspect} from "util"

export default class PlasmaFire extends Animation {
    static category = "Fire"
    static title = "Plasma Fire "
    static description = "Base on the 1993 Firedemo"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        const fireintervalControl = controls.value("Fire interval", 1, 1, 10, 0.1)
        const intensityControl = controls.range("Fire glower range %", 0, 100, 0, 100);
        const wildnessIntensityControl = controls.value("Fire glower wildness %", 25, 0, 100, 1);
        const decayControl = controls.value("Fire decay ", 25, 0, 300, 1)
        // const decayDensity = controls.value("Fire decay density % ", 100, 0, 100, 1)

        const fireMoveFactorControl = controls.range("Fire move factor", 1, 1, 0.5, 1.5, 0.01)

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
                this.newValue = (this.newValue / (this.neighbours.length))*  ( randomFloatGaussian(fireMoveFactorControl.from, fireMoveFactorControl.to))

                // if (cool && this.newValue >= 10) {
                //     this.newValue=this.newValue-10
                // }
                // if (randomGaussian(0, 100) < decayDensity.value) {
                    if (this.newValue >= decayControl.value)
                        this.newValue = this.newValue - decayControl.value
                    else
                        this.newValue = 0


                // }

                if (this.newValue>=colors.length)
                    this.newValue=colors.length-1
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
                pixels[x][y] = new FlamePixel(x, y )
                box.add(pixels[x][y])
            }
        }


        //determine neighbours
        for (let x = 1; x < box.width() - 1; x++) {

            for (let y = 1; y < box.height() - 1 + 2; y++) {
                const p = pixels[x][y]

                //upper
                p.neighbours.push(pixels[x - 1][y - 1])
                p.neighbours.push(pixels[x][y - 1])
                p.neighbours.push(pixels[x + 1][y - 1])

                //lower
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
                for (let y = 0; y < box.height() + 1; y++) {
                    pixels[x][y].calculate()

                }
            }

            //apply calculated values and move up
            for (let x = 0; x < box.width(); x++) {
                for (let y = box.height(); y >=0;y--) {
                    pixels[x][y].apply(pixels[x][y+1].newValue)
                    // pixels[x][y+1].apply(pixels[x][y+1].newValue)
                }
            }

            //glow
            const y=box.height()+1
            for (let x = 0; x < box.width(); x++) {
                // if (pixels[x][0].value<=1)
                pixels[x][y].value = pixels[x][y].newValue =
                    glow(pixels[x][y].value,
                        ~~intensityControl.from * colorScale,
                        ~~intensityControl.to * colorScale,
                        ~~wildnessIntensityControl.value * colorScale, 3)
            }
        })
    }
}
