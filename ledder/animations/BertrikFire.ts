import {Animation} from "../Animation.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import { patternSelect} from "../ColorPatterns.js";
import {glow, randomFloatGaussian} from "../util.js";

export default class BertrikFire extends Animation {
    static category = "Fire"
    static title = "Bertrik"
    static description = "Fire, based on <a href='https://github.com/bertrik/nyancat/blob/master/fire.c'>this.</a>"


    move_fire(display, field, height, decay, maxFlame, glower, moveFactor) {
        let x, y, flame;

        // move flames up
        for (y = 0; y < height ; y++) {
            for (x = 0; x < display.width; x++) {
                let self, left, middle, right;

                self = field[y][x];
                if (y < height-1) {
                    middle = field[y + 1][x];
                    if (x > 0)
                        left = field[y + 1][x - 1];
                    else
                        left = field[y + 1][display.width - 1];

                    if (x < display.width - 1)
                        right = field[y + 1][x + 1];
                    else
                        right = left;
                }
                else
                {
                    middle = glower[x];
                    if (x > 0)
                        left = glower[x - 1];
                    else
                        left = glower[display.width-1];

                    if (x < display.width - 1)
                        right = glower[x + 1];
                    else
                        right = left;
                }

                flame = (self + left + middle + right) / (4-  randomFloatGaussian(moveFactor/2, moveFactor))
                // // average
                // if (x == 0) {
                //     flame = (field[y][x] + 2 * field[y + 1][x] + field[y + 1][x + 1]) / 4;
                // } else if (x == (display.width - 1)) {
                //     flame = (field[y][x] + 2 * field[y + 1][x] + field[y + 1][x - 1]) / 4;
                // } else {
                //     flame = (field[y][x] + field[y + 1][x - 1] + field[y + 1][x] + field[y + 1][x + 1]) / 4;
                // }
                // decay
                if (flame > decay) {
                    flame -= decay;
                } else {
                    flame /= 2;
                }
                if (flame < 0)
                    flame = 0

                if (flame > maxFlame)
                    flame = maxFlame
                field[y][x] = flame;
            }
        }
    }


    save_image(display, field, pixels: Array<Array<Pixel>>, colors) {
        let row, col;

        for (row = 0; row < display.height; row++) {
            for (col = 0; col < display.width; col++) {
                const intensity = field[row][col]
                pixels[row][col].color = colors[~~intensity]
            }
        }

    }

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {


        let pixels = display.raster(display, new Color(0, 0, 0,0), true, false, true)
        let field = []
        let colors = patternSelect(controls, 'Fire colors', 'Bertrik fire')


        //glower
        let glower = []
        for (let x = 0; x < display.width; x++) {
            glower.push(0)
        }


        //create clear field
        for (let y = 0; y < display.height; y++) {
            field[y] = []
            for (let x = 0; x < display.width; x++) {
                field[y][x] = 0
            }
        }

        const fireintervalControl = controls.value("Fire interval", 1, 1, 10, 0.1)
        const minIntensityControl = controls.value("Fire minimum intensity %", 0, 0, 100, 1);
        const maxIntensityControl = controls.value("Fire maximum intensity %", 100, 0, 100, 1);
        const wildnessIntensityControl = controls.value("Fire wildness %", 10, 0, 100, 1);
        const decayControl = controls.value("Fire decay %", 10, 0, 40, 0.1)
        const fireMoveFactorControl = controls.value("Fire sintel factor", 0, 0, 2, 0.01)
        const fireSpeedControl = controls.value("Fire speed", 1, 1, 10, 1)

        const colorScale = (colors.length - 1) / 100

        display.scheduler.intervalControlled(fireintervalControl, (frameNr) => {


            //glower
            for (let x = 0; x < display.width; x++) {
                glower[x] = glow(glower[x],
                    ~~minIntensityControl.value * colorScale,
                    ~~maxIntensityControl.value * colorScale,
                    ~~wildnessIntensityControl.value * colorScale, 3)
            }
            for (let y = 0; y < fireSpeedControl.value; y++)

                this.move_fire(display, field, display.height, decayControl.value * colorScale, colors.length - 1, glower, fireMoveFactorControl.value)
            this.save_image(display, field, pixels, colors)

            return true
        })

    }
}
