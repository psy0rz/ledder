import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


export default class Firetruck extends Animator {
    static category = "Vehicles"
    static title = "Fire Truck"
    static description = "Fire truck sprite with flashing lights and ladder"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        const frames = new PixelList()
        
    // Truck sprite (user, colors: r->y, w->r)
    frames.add(new DrawAsciiArtColor(x, y, `
    ..................
    ..................
    55555555555555555.
    rrrrrrrrrryyby....
    rrrrrrrrrryy.yy...
    rrrrrrrrrryy..yyyy
    rrrrrrrrrryyyyyyyy
    yy00yyyyyyyyyy00yy
    .0550........0550.
    ..00..........00..
    `));

    frames.add(new DrawAsciiArtColor(x, y, `
    ..................
    ..................
    55555555555555555.
    rrrrrrrrrryyyy....
    rrrrrrrrrryy.yy...
    rrrrrrrrrryy..yyyy
    rrrrrrrrrryyyyyyyb
    yy00yyyyyyyyyy00yy
    .0550........0550.
    ..00..........00..
    `));
    
   
    
        
       
        
        frames.centerV(box)

        let firetruckBox = new PixelBox(box)
        box.add(firetruckBox)

        new FxMovie(scheduler, controls, 2, 0).run(frames, firetruckBox)
        new FxRotate(scheduler, controls, 1).run(frames, firetruckBox)
    }
}
