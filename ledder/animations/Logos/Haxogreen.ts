import PixelBox from "../../PixelBox.js"
import PixelList from "../../PixelList.js"
import FxBlink from "../../fx/FxBlink.js"
import DrawText from "../../draw/DrawText.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {fontSelect} from "../../fonts.js"
import Animator from "../../Animator.js"



export default class Haxogreen extends Animator {
    static category = "Misc"
    static title = "Haxogreen"
    static description = "blabla"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const c = new PixelList()
        box.add(c)

        const blinker = new FxBlink(scheduler, controls, 5, 5, 5)

        const font = fontSelect(controls)
        const haxo = new DrawText(0, 0, font, "Haxo", controls.color("haxo"))
        const green = new DrawText(controls.value("offset", 28, 0, 100, 1, true).value, 0, font, "Green", controls.color("green"))

        c.add(haxo)
        c.add(green)
        c.center(box)
        c.clear()


        while(1) {
            c.add(haxo)
            await scheduler.delay(30)
            c.add(green)
            await scheduler.delay(60)
            c.delete(haxo)
            c.delete(green)
            await scheduler.delay(30)

        }


        // while (1) {
        //     await blinker.run(haxo, c)
        //     c.add(haxo)
        //
        //     await blinker.run(green, c)
        //     c.add(green)
        //
        // }

    }
}
