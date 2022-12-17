import PixelBox from "../../PixelBox.js"
import Pacman from "../Components/Pacman.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {animationRun} from "../../server/utils.js"
import Animation from "../../Animation.js"



const logo = `
  rr0rr0rr
  rr0rr0rr
  0rrrrrr0
  0rrrrrr0
  0rrrrrr0
  0rr00rr0
  0rr00rr0
  rrr00rrr
`

export default class HSD extends Animation {
    static category = "Misc"
    static title = "HSD"
    static description = ""


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        //rotate
        const marquee = new PixelBox(box)
        box.add(marquee)


        const pacmanGroup = controls.group("Pacman")
        if (pacmanGroup.switch("Enabled", true).enabled)
            new Pacman().run(box, scheduler, pacmanGroup)
        else
            box.add(new DrawAsciiArtColor(0, 7, logo))

        box.add(new DrawAsciiArtColor(box.width() - 8, 7, logo))
        //box.center(box)


        await animationRun(marquee, scheduler, controls, "Text/Marquee")


    }
}
