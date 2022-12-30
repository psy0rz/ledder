import PixelBox from "../../PixelBox.js"
import PixelList from "../../PixelList.js"
import DrawText from "../../draw/DrawText.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {fontSelect} from "../../fonts.js"
import Animation from "../../Animation.js"

export default class MaakPlek extends  Animation
{
    static category = "Logos"
    static title = "Maakplek"
    static description = "http://maakplek.nl"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const c=new PixelList()
        box.add(c)


        const font = fontSelect(controls)

        const maak=new DrawText(0,0,font, "MAAK", controls.color("Maak"))
        const plek=new DrawText(maak.bbox().xMax+5,0,font, "PLEK", controls.color("Plek"))

        c.add(maak)
        c.add(plek)
        c.center(box)

    }
}
