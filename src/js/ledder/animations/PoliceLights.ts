import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Pixel} from "../Pixel.js";
import {Scheduler} from "../Scheduler.js";
import {PresetControl} from "../PresetControl.js";
import FxBlink from "../fx/FxBlink.js";
import {fontSelect} from "../fonts.js";
import {CharPixels} from "../CharPixels.js";

export default class PoliceLights extends Animation {

    static title = "Police lights"
    static description = ""
    static presetDir = "policelights"
    static category = "Signal lights"


    async run(matrix: Matrix, scheduler: Scheduler, control: PresetControl) {

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


        const colorText1 = matrix.control.color("Text1 color", 255, 0, 0, 1);
        const text1=control.input('Text1', 'STOP', true)
        const textOffset1 = control.value('Text1 offset', -12, -matrix.width, matrix.width, 1, true)
        const fontPixels1=new CharPixels(matrix, font,text1.text, matrix.width/2 + textOffset1.value,0, colorText1 )

        const colorText2 = matrix.control.color("Text2 color", 255, 0, 0, 1);
        const text2=control.input('Text2', 'POLICE', true)
        const textOffset2 = control.value('Text2 offset', -18, -matrix.width, matrix.width, 1, true)
        const fontPixels2=new CharPixels(matrix, font,text2.text, matrix.width/2 + textOffset2.value,0, colorText2 )

        const textDelay = control.value('Text delay', 60, 20, 120, 1)

        colorText1.a=0.5
        colorText2.a=0.5

        scheduler.intervalControlled(textDelay, (frameNr)=>{

            if (colorText1.a) {
                colorText1.a = 0
                colorText2.a = 1
            }
            else
            {
                colorText1.a = 1
                colorText2.a = 0
            }
        })

        while (1) {
            await blinker.run(color1Control)
            await scheduler.delay(wait.value)
            await blinker.run(color2Control)
            await scheduler.delay(wait.value)
        }

    }

}
