import PixelBox from "../../PixelBox.js"
import DrawText from "../../draw/DrawText.js"
import PixelList from "../../PixelList.js"
import DrawBox from "../../draw/DrawBox.js"
import Scheduler from "../../Scheduler.js"
import {colorBlack} from "../../Colors.js"
import ControlGroup from "../../ControlGroup.js"
import {fontSelect} from "../../fonts.js"
import Animator from "../../Animator.js"

export default class Cyber extends  Animator
{
    static category = "Misc"
    static title = "Cyber"
    static description = "Cyber, the Meme(tm)"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const textControl=controls.input('text', 'CYBER', true)

        const font = fontSelect(controls)
        const text = new DrawText(0, 0, font, textControl.text, controls.color("tekst", 255,255,0))
        text.center(box)

        const a=new PixelList()
        a.add(text)

        const text2 = new DrawText(0, 0, font, textControl.text, colorBlack)
        text2.center(box)

        const b=new PixelList()
        b.add(new DrawBox(box.xMin,box.yMin,box.width(), box.height(), controls.color("tekst")))
        b.add(text2)

        let flip=false
        scheduler.intervalControlled(controls.value("interval", 5), ()=>{

            if (flip)
            {
                box.add(a);
                box.delete(b)
                flip=!flip
            }
            else
            {
                box.add(b);
                box.delete(a)
                flip=!flip

            }

        })





    }
}
