import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Pixel} from "../Pixel.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import FxBlink from "../fx/FxBlink.js";
import {fontSelect} from "../fonts.js";
import {DrawText} from "../draw/DrawText.js";

export default class Music extends Animation {

    static title = "Music"
    static description = ""
    static presetDir = "music"
    static category = "Music"


    async run(matrix: Matrix, scheduler: Scheduler, control: ControlGroup) {

        const color1Control = matrix.control.color("Color 1", 255, 0, 0, 1);

        for (let x = 0; x < matrix.width / 5; x++)
            for (let y = 0; y < matrix.height; y++)
                new Pixel(matrix, x, y, color1Control)

        const color2Control = matrix.control.color("Color 2", 0, 0, 255, 1);

        for (let x = matrix.width - (matrix.width / 5); x < matrix.width; x++)
            for (let y = 0; y < matrix.height; y++)
                new Pixel(matrix, x, y, color2Control)


        const blinker = new FxBlink(matrix, 'Flasher', 2, 4, 4)

        const wait = control.value('Wait', 0, 0, 120, 1)

        const font=fontSelect(control)



        const textDelay = control.value('Text delay', 60, 20, 120, 1)


        while (1) {
            await blinker.run(color1Control)
            await scheduler.delay(wait.value)
            await blinker.run(color2Control)
            await scheduler.delay(wait.value)
        }

    }

}
