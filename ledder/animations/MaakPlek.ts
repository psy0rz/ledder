import Animation from "../Animation.js";
import Display from "../Display.js";
import Scheduler from "../Scheduler.js";
import ControlGroup from "../ControlGroup.js";
import PixelSet from "../PixelSet.js";
import DrawText from "../draw/DrawText.js"
import {fontSelect} from "../fonts.js"

export default class MaakPlek extends  Animation
{
    static category = "Misc"
    static title = "Maakplek"
    static description = "blabla"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const c=new PixelSet()
        display.add(c)


        const font = fontSelect(controls)

        const maak=new DrawText(0,0,font, "MAAK", controls.color("Maak"))
        const plek=new DrawText(maak.bbox().xMax+5,0,font, "PLEK", controls.color("Plek"))

        c.add(maak)
        c.add(plek)
        c.center(display)

    }
}
