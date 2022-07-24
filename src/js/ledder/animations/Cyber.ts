import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";
import {fontSelect} from "../fonts.js"
import DrawText from "../draw/DrawText.js"
import {colorBlack} from "../Colors.js"
import DrawBox from "../draw/DrawBox.js"

export default class Template extends  Animation
{
    static category = "Misc"
    static title = "Cyber"
    static description = "blabla"
    static presetDir = "Misc";

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const font = fontSelect(controls)
        const text = new DrawText(0, 0, font, "CYBER", controls.color("tekst", 255,255,0))
        text.centerH(display)

        const a=new PixelContainer()
        a.add(text)

        const text2 = new DrawText(0, 0, font, "CYBER", colorBlack)
        text2.centerH(display)

        const b=new PixelContainer()
        b.add(new DrawBox(0,0,display.width, display.height, controls.color("tekst")))
        b.add(text2)

        let flip=false
        scheduler.intervalControlled(controls.value("interval", 5), ()=>{

            if (flip)
            {
                display.add(a);
                display.delete(b)
                flip=!flip
            }
            else
            {
                display.add(b);
                display.delete(a)
                flip=!flip

            }

        })





    }
}
