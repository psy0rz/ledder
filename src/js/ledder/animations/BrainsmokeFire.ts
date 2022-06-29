import {Animation} from "../Animation.js";
import {glow} from "./DoomFire.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {ControlValue} from "../ControlValue.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {Matrix} from "../Matrix.js";
import {fireColorsBertrik, fireColorsBrainsmoke, fireColorsDoom, patternSelect} from "../ColorPatterns.js";

//best at 50fps according to brainsmoke
export default class BrainsmokeFire extends Animation {

    static category = "Fire"
    static title = "Brainsmoke"
    static description = "Fire based on <a href='https://github.com/techinc/lewd/blob/master/animations/fire.py'>this.</a><br>Has an interesting decay method."
    static presetDir = "BrainsmokeFire";


    old: any;
    new: any;
    w: number;
    h: number;
    mapping: any
    xypixels: any
    black: Color
    private minIntensityControl: ControlValue;
    private maxIntensityControl: ControlValue;
    private wildnessIntensityControl: ControlValue;
    private fireColors: any[];

    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        this.old = []
        this.new = []

        // oversampling x2 !
        this.w = matrix.width * 2
        this.h = matrix.height * 2

        //create fire-pixel maps
        for (let h = 0; h < this.h + 2; h++) {
            this.old[h] = []
            this.new[h] = []
            for (let w = 0; w < this.w + 2; w++) {
                this.old[h][w] = 0
                this.new[h][w] = 0
            }
        }

        this.xypixels = matrix.raster(matrix, new Color(0, 0, 0), true, false, true)

        this.black = new Color(0, 0, 0)

        this.fireColors = patternSelect(controls)

        //decay mapping
        this.mapping = []
        for (let m = 0; m < 2048; m++)
            this.mapping.push(~~Math.min(((m / 256) ** 1.25 / 3.7 * 256), 2047))


        this.minIntensityControl = controls.value("Fire minimum intensity", 0, 0, 2047, 20);
        this.maxIntensityControl = controls.value("Fire maximum intensity", 650, 0, 2047, 20);
        this.wildnessIntensityControl = controls.value("Fire wildness", 10000, 0, 20000, 20);

        const fireintervalControl = controls.value("Fire interval", 1, 1, 10, 0.1)
        matrix.scheduler.intervalControlled(fireintervalControl, () => {
            this.next()
            return true
        })

    }

    next() {
        let [w, h] = [this.w, this.h]

        // console.log(this.new)

        this.old = this.new
        this.new = []


        for (let y = 0; y < h + 1; y++) {
            // if (y == h):
            //   r = random.getrandbits(w)
            this.new[y] = []
            for (let x = 0; x < w; x++) {
                let s = 0

                //below-bottom row is glowing
                if (y == h) {
                    //(original is random switching between only 0 and 650, not in between.)
                    s = glow(this.old[y][x], this.minIntensityControl.value, this.maxIntensityControl.value, this.wildnessIntensityControl.value)

                }
                //other rows get influnce by neighbouring pixels below them
                else {
                    // sum of 3 neighbours below
                    s = this.old[y + 1][x]
                    if (x > 0)
                        s += this.old[y + 1][x - 1]
                    if (x < w - 1)
                        s += this.old[y + 1][x + 1]
                }
                //decay mapper magic
                this.new[y][x] = this.mapping[Math.min(s, 2047)]
            }
            // print
        }

        //downsample and assigned mapped color to actual pixels
        for (let y = 0; y < h; y = y + 2) {
            for (let x = 0; x < w; x = x + 2) {
                let avg = ((this.new[y][x] + this.new[y][x + 1] + this.new[y + 1][x] + this.new[y + 1][x + 1]) / 4)
                //scale to color map and round (brainsmokes original used 256 colors)
                avg=~~(avg/256*this.fireColors.length)
                if (avg >= this.fireColors.length) {
                    this.xypixels[y / 2][x / 2].color = this.black
                } else {
                    this.xypixels[y / 2][x / 2].color = this.fireColors[avg]
                }
            }
        }
    }
}

