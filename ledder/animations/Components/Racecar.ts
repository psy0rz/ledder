import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


export default class Racecar extends Animator {
    static category = "Vehicles"
    static title = "Racecar"
    static description = "Racing car sprite with motion animation"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        const frames = new PixelList()
        
        // Racecar - 10 width x 8 height, simple 8-bit style
       frames.add(new DrawAsciiArtColor(x, y, `
              www.........    
              w.....rr....
              wrrrrrrrrrw.
              wwwwwwwwwwww
              ..55...55...
              `))
        
        frames.centerV(box)

        let carBox = new PixelBox(box)
        box.add(carBox)

        new FxMovie(scheduler, controls, 2, 0).run(frames, carBox)
        new FxRotate(scheduler, controls, 1).run(frames, carBox)
    }
}
