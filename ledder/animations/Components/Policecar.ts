import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


export default class Policecar extends Animator {
    static category = "Vehicles"
    static title = "Police Car"
    static description = "Police car sprite with flashing lights animation"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        const frames = new PixelList()
        
        // Police car - 10 width x 8 height, simple 8-bit style
        frames.add(new DrawAsciiArtColor(x, y, `
        ..bbbbbw...    
        ..bbbbbbn..
        wwwwwwwwwww
        bbbbbbbbbyy
.       ..55...55..
        `))
          frames.add(new DrawAsciiArtColor(x, y, `
        ..bbbbbb...    
        ..bbbbbbn..
        wwwwwwwwwwb
        bbbbbbbbbyb
.       ..55...55..
        `))
        
       
        
        frames.centerV(box)

        let policecarBox = new PixelBox(box)
        box.add(policecarBox)

        new FxMovie(scheduler, controls, 2, 0).run(frames, policecarBox)
        new FxRotate(scheduler, controls, 1).run(frames, policecarBox)
    }
}
