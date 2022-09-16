import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import DrawText from "../draw/DrawText.js";
import {fontSelect} from "../fonts.js";

import {PixelContainer} from "../PixelContainer.js";
import FxFlames from "../fx/FxFlames.js";

import BrainsmokeFire from "./BrainsmokeFire.js";


export default class ItsFine extends Animation {

    static title = "Its fine"
    static description = ""
    static presetDir = "itsfine"
    static category = "memes"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        // new BertrikFire().run(display, scheduler, controls.group("Bottom fire"))
        new BrainsmokeFire().run(display, scheduler, controls.group("Bottom fire"))
        controls.group("Bottom fire").value("Fire maximum intensity").value = 0

        const inputControl=controls.input("Text", "its fine.", true)

        const colorControl = controls.color("Text color", 0, 255, 0)
        const text = new DrawText(0, 0, fontSelect(controls), inputControl.text, colorControl).centerH(display)
        display.add(text)

        await scheduler.delay(60 * 2)
        const flames = new PixelContainer()
        display.add(flames)
        new FxFlames(scheduler, controls.group("Top fire")).run(text, flames)

        await scheduler.delay(60 * 2)
        controls.group("Bottom fire").value("Fire maximum intensity").value = 380

        await scheduler.delay(60 * 2)
        controls.group("Bottom fire").value("Fire maximum intensity").value = 600

        await scheduler.delay(60 * 2)
        controls.group("Bottom fire").value("Fire maximum intensity").value = 700


    }
}
