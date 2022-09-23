import Animation from "../Animation.js"
import Pixel from "../Pixel.js"
import Color from "../Color.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import {patternSelect} from "../ColorPatterns.js"
import { glow, randomFloatGaussian} from "../util.js"
import PixelBox from "../PixelBox.js"

export default class BertrikFire extends Animation {
    static category = "Fire"
    static title = "Bertrik"
    static description = "Fire, based on <a href='https://github.com/bertrik/nyancat/blob/master/fire.c'>this.</a>"


    move_fire(box: PixelBox, field, decay, maxFlame, glower, moveFactor) {
        let x, y, flame

        // move flames up
        for (y = box.yMax; y >= box.yMin; y--) {
            for (x = box.xMin; x <= box.xMax; x++) {
                let self, left, middle, right

                self = field[y][x]
                if (y > box.yMin) {
                    middle = field[y - 1][x]
                    if (x > box.xMin)
                        left = field[y - 1][x - 1]
                    else
                        //wrap around
                        left = field[y - 1][box.xMax]

                    if (x < box.xMax)
                        right = field[y - 1][x + 1]
                    else
                        //wrap around
                        right = field[y - 1][box.xMin]
                } else {
                    //bottom row uses glower as input
                    middle = glower[x]
                    if (x > box.xMin)
                        left = glower[x - 1]
                    else
                        left = glower[box.xMax]

                    if (x < box.xMax)
                        right = glower[x + 1]
                    else
                        right = left
                }

                flame = (self + left + middle + right) / (4 - randomFloatGaussian(moveFactor / 2, moveFactor))

                // decay
                if (flame > decay) {
                    flame -= decay
                } else {
                    flame /= 2
                }
                if (flame < 0)
                    flame = 0

                if (flame > maxFlame)
                    flame = maxFlame
                field[y][x] = flame
            }
        }
    }


    save_image(box: PixelBox, field, pixels: Array<Array<Pixel>>, colors) {
        let row, col

        for (row = box.yMin; row <= box.yMax; row++) {
            for (col = box.xMin; col <= box.xMax; col++) {
                const intensity = field[row][col]
                pixels[row][col].color = colors[~~intensity]
            }
        }

    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        let pixels = box.raster(box, new Color(0, 0, 0, 0), true, false, false)
        let field = []
        let colors = patternSelect(controls, 'Fire colors', 'Bertrik fire')


        //glower
        let glower = []
        for (let x = box.xMin; x <= box.xMax; x++) {
            glower[x] = 0
        }


        //create clear field
        for (let y = box.yMin; y <= box.yMax; y++) {
            field[y] = []
            for (let x = box.xMin; x <= box.xMax; x++) {
                field[y][x] = 0
            }
        }

        const fireintervalControl = controls.value("Fire interval", 1, 1, 10, 0.1)
        const intensityControl = controls.range("Fire intensity %")
        const wildnessIntensityControl = controls.value("Fire wildness %", 10, 0, 100, 1)
        const decayControl = controls.value("Fire decay %", 10, 0, 40, 0.1)
        const fireMoveFactorControl = controls.value("Fire sintel factor", 0, 0, 2, 0.01)
        const fireSpeedControl = controls.value("Fire speed", 1, 1, 10, 1)

        const fireXrange = controls.range("Fire X range %", 0, 100)

        const colorScale = (colors.length - 1) / 100

        scheduler.intervalControlled(fireintervalControl, (frameNr) => {


            //glower
            for (let x = box.xMin; x < box.xMax; x++) {

                const percentageX = box.percentageX( x)
                if (percentageX >= fireXrange.from && percentageX <= fireXrange.to)
                    glower[x] = glow(glower[x],
                        ~~intensityControl.from * colorScale,
                        ~~intensityControl.to * colorScale,
                        ~~wildnessIntensityControl.value * colorScale, 3)
                else
                    glower[x] = 0
            }
            for (let y = 0; y < fireSpeedControl.value; y++)
                this.move_fire(box, field, decayControl.value * colorScale, colors.length - 1, glower, fireMoveFactorControl.value)

            this.save_image(box, field, pixels, colors)

            return true
        })

    }
}
