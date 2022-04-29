import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Pixel} from "../Pixel.js";
import {Scheduler} from "../Scheduler.js";
import {PresetControl} from "../PresetControl.js";

export default class PoliceLights extends Animation {

    static title = "Police lights"
    static description = ""
    static presetDir = "policelights"
    static category = "Signal lights"


    async run(matrix: Matrix, scheduler: Scheduler, control: PresetControl) {
        const color1Control = matrix.preset.color("Color 1", 255, 0, 0, 1);

        for (let x = 0; x < matrix.width / 5; x++)
            for (let y = 0; y < matrix.height; y++)
                new Pixel(matrix, x, y, color1Control)

        // while (1)
        // {
        color1Control.a = 0

        while (1) {
            await scheduler.delay(30)
            color1Control.a = 1
            await scheduler.delay(30)
            color1Control.a = 0
        }
        // }
    }




}
