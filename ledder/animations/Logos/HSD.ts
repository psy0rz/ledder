import PixelBox from "../../PixelBox.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
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


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const logoBox=new DrawAsciiArtColor(box.width() - 8, 0, logo).centerV(box)
        box.add(logoBox)
    }
}
