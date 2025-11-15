import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


export default class Cow extends Animator {
    static category = "Animals"
    static title = "Cow"
    static description = "Simple cow sprite with walking animation"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        const frames = new PixelList()
        
    // Cow sprite (user provided)
    frames.add(new DrawAsciiArtColor(x, y, `
    ..........
    .b........
    www.......
    ..www5ww..
    ...wwww...
    ...w..w...
    `));

     frames.add(new DrawAsciiArtColor(x, y, `
    ..........
    .b........
    www.......
    ..www5ww..
    ...wwww...
    ..w....w..
    `))
        
       
        
        frames.centerV(box)

        let cowBox = new PixelBox(box)
        box.add(cowBox)

        new FxMovie(scheduler, controls, 4, 0).run(frames, cowBox)
        new FxRotate(scheduler, controls, 1).run(frames, cowBox)
    }
}
