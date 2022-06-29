import {Animation} from "../Animation.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {glow} from "./DoomFire.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {fireColorsBertrik, patternSelect} from "../ColorPatterns.js";

export default class BertrikFire extends Animation {
    static category = "Fire"
    static title = "Bertrik"
    static description = "Fire, based on <a href='https://github.com/bertrik/nyancat/blob/master/fire.c'>this.</a>"
    static presetDir = "BertrikFire";


    move_fire(matrix, field, height, decay, maxFlame) {
        let x, y, flame;

        // move flames up
        for (y = 0; y < height - 1; y++) {
            for (x = 0; x < matrix.width; x++) {
                // average
                if (x == 0) {
                    flame = (field[y][x] + 2 * field[y + 1][x] + field[y + 1][x + 1]) / 4;
                } else if (x == (matrix.width - 1)) {
                    flame = (field[y][x] + 2 * field[y + 1][x] + field[y + 1][x - 1]) / 4;
                } else {
                    flame = (field[y][x] + field[y + 1][x - 1] + field[y + 1][x] + field[y + 1][x + 1]) / 4;
                }
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


    save_image(matrix, field, pixels: Array<Array<Pixel>>, colors) {
        let row, col;

        for (row = 0; row < matrix.height; row++) {
            for (col = 0; col < matrix.width; col++) {
                const intensity = field[row][col]
                pixels[row][col].color = colors[~~intensity]
            }
        }

    }

    async run(matrix: Display, scheduler: Scheduler, controls: ControlGroup) {

        let pixels = matrix.raster(matrix, new Color(0, 0, 0), true, false, true)
        let field = []
        let colors = patternSelect(controls, 'Fire colors', 'Bertrik fire')

        //create clear field
        for (let y = 0; y < matrix.height; y++) {
            field[y] = []
            for (let x = 0; x < matrix.width; x++) {
                field[y][x] = 0
            }
        }

        const fireintervalControl = controls.value("Fire interval", 1, 1, 10, 0.1)
        const minIntensityControl = controls.value("Fire minimum intensity %", 0, 0, 100, 1);
        const maxIntensityControl = controls.value("Fire maximum intensity %", 100, 0, 100, 1);
        const wildnessIntensityControl = controls.value("Fire wildness %", 10, 0, 100, 1);
        const decayControl = controls.value("Fire decay %", 10, 0, 40, 1)

        const colorScale = (colors.length - 1) / 100

        matrix.scheduler.intervalControlled(fireintervalControl, () => {


            //glow lower row
            for (let x = 0; x < matrix.width; x++) {
                field[matrix.height - 1][x] = glow(field[matrix.height - 1][x],
                    ~~minIntensityControl.value * colorScale,
                    ~~maxIntensityControl.value * colorScale,
                    ~~wildnessIntensityControl.value * colorScale, 3)
            }
            this.move_fire(matrix, field, matrix.height, ~~decayControl.value * colorScale, colors.length - 1)
            this.save_image(matrix, field, pixels, colors)

            return true
        })

    }
}
