import PixelBox from "../../PixelBox.js"
import Fire from "../Fires/Fire.js"
import DrawText from "../../draw/DrawText.js"
import PixelList from "../../PixelList.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {fontSelect} from "../../fonts.js"
import FxFlames from "../../fx/FxFlames.js"
import Animator from "../../Animator.js"



export default class ItsFine extends Animator {

    static title = "Its fine"
    static description = ""
    static category = "memes"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        new Fire().run(box, scheduler, controls.group("Bottom fire"))

        const inputControl=controls.input("Text", "its fine.", true)

        const colorControl = controls.color("Text color", 0, 255, 0)
        const text = new DrawText(0, 0, fontSelect(controls), inputControl.text, colorControl).centerH(box)
        box.add(text)
        text.center(box)

        await scheduler.delay(60 * 4)
        const flames = new PixelList()
        box.add(flames)
        new FxFlames(scheduler, controls.group("Top fire")).run(text, flames)

        // await scheduler.delay(60 * 2)
        // controls.group("Bottom fire").value("Fire maximum intensity").value = 380
        //
        // await scheduler.delay(60 * 2)
        // controls.group("Bottom fire").value("Fire maximum intensity").value = 600
        //
        // await scheduler.delay(60 * 2)
        // controls.group("Bottom fire").value("Fire maximum intensity").value = 700


    }
}
