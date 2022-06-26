import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Pixel} from "../Pixel.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import FxBlink from "../fx/FxBlink.js";
import {fontSelect} from "../fonts.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";
import DrawText from "../draw/DrawText.js";

export default class PoliceLights extends Animation {

    static title = "Police lights"
    static description = ""
    static presetDir = "policelights"
    static category = "Signal lights"


    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        const blinker = new FxBlink(scheduler, controls.group("blinker"), 2, 4, 4)

        const color1 = controls.color("Color 1", 255, 0, 0, 1).copy();


        for (let x = 0; x < matrix.width / 5; x++)
            for (let y = 0; y < matrix.height; y++)
                matrix.add(new Pixel(x, y, color1))

        const color2 = controls.color("Color 2", 0, 0, 255, 1).copy();

        for (let x = matrix.width - (matrix.width / 5); x < matrix.width; x++)
            for (let y = 0; y < matrix.height; y++)
                matrix.add(new Pixel(x, y, color2))


        const wait = controls.value('Wait', 0, 0, 120, 1)

        const font = fontSelect(controls)


        const colorText1 = controls.color("Text1 color", 255, 0, 0, 1);
        const text1 = controls.input('Text1', 'STOP', true)
        const textOffset1 = controls.value('Text1 offset', -12, -matrix.width, matrix.width, 1, true)
        matrix.add(new DrawText(matrix.width / 2 + textOffset1.value, 1, font, text1.text, colorText1))

        const colorText2 = controls.color("Text2 color", 255, 0, 0, 1);
        const text2 = controls.input('Text2', 'POLICE', true)
        const textOffset2 = controls.value('Text2 offset', -18, -matrix.width, matrix.width, 1, true)
        matrix.add(new DrawText(matrix.width / 2 + textOffset2.value, 1, font, text2.text, colorText2))

        const textDelay = controls.value('Text delay', 60, 20, 120, 1)

        colorText1.a = 0.5
        colorText2.a = 0.5

        scheduler.intervalControlled(textDelay, (frameNr) => {

            if (colorText1.a) {
                colorText1.a = 0
                colorText2.a = 1
            } else {
                colorText1.a = 1
                colorText2.a = 0
            }
            return true
        }).then(() => {
            console.log("then withtout catch")
        })


        const t=Date.now()
        while (1) {
            await blinker.run(color1)
            await scheduler.delay(wait.value)
            await blinker.run(color2)
            await scheduler.delay(wait.value)
        }

    }

}
