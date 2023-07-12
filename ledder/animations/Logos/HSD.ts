import PixelBox from "../../PixelBox.js"
import Pacman from "../Components/Pacman.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {animationRun} from "../../server/utils.js"
import Animator from "../../Animator.js"



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

export default class HSD extends Animator {
    static category = "Misc"
    static title = "HSD"
    static description = ""


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        const marqueeBox = new PixelBox(box)
        box.add(marqueeBox)

        // box.add(new DrawBox(0,0,4,8, new Color(0,0,0,)))
        // box.centerV(box)

        new Pacman().run(box, scheduler, controls)



        const logoBox=new DrawAsciiArtColor(box.width() - 8, 0, logo).centerV(box)
        box.add(logoBox)

        // box.centerV(box)

       await animationRun(marqueeBox, scheduler, controls, "Text/Marquee")


    }
}
