import PixelBox from "../../PixelBox.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {animationRun} from "../../server/utils.js"
import Animator from "../../Animator.js"



const logo = `
  ....wwww..................
  ..wwwwwwww................
  .www...wwww...............
  .ww.....wwww..............
  .w......wwww..............
  ....... wwww.......wwwwww.
  .......wwww.....wwwwwww...
  ......wwwww...wwwwwwwww...
  .....wwwww..wwwwwwwwww....
  ....wwwwww.wwwwwwwwwww....
  ...wwwwwwwwwwwwwwwwwww....
  ..www...www...www...ww....
  .wwww.wwwwww.wwww.wwww....
  .wwww...wwww.wwww.wwwww...
  wwwwwww.wwww.wwww.wwwww...
  wwwww...wwww.wwww...www...
`

export default class HSD extends Animator {
    static category = "Misc"
    static title = "Stc"
    static description = "Logo voor Tristan"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


       




        const logoBox=new DrawAsciiArtColor((box.width() - 26)/2, 0, logo).centerV(box)
        box.add(logoBox)
        const marqueeBox = new PixelBox(box)
        box.add(marqueeBox)


        // box.centerV(box)

       await animationRun(marqueeBox, scheduler, controls, "Text/Marquee")


    }
}
