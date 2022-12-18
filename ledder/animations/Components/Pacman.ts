
import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelSet from "../../PixelSet.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animation from "../../Animation.js"


export default class Pacman extends  Animation
{
    static category = "Misc"
    static title = "Pacman"
    static description = "blabla"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const frames=new PixelSet()
        const color= controls.color("Color", 255,255,0)
        frames.add(new DrawAsciiArt(0,0, color,`
        ..####..
        .######.
        ########
        ########
        ########
        ########
        .######.
        ..####..
        `))
        frames.add(new DrawAsciiArt(0,0, color,`
        ..####..
        .######.
        ########
        ####....
        ###.....
        ####....
        .######.
        ..####..
        `))
        frames.add(new DrawAsciiArt(0,0, color,`
        ..####..
        .######.
        #####...
        ####....
        ###.....
        ####....
        .####...
        ..####..
        `))
        frames.add(new DrawAsciiArt(0,0, color,`
        ..####..
        .######.
        #####...
        ####....
        ###.....
        ####....
        .####...
        ..####..
        `))
        frames.add(new DrawAsciiArt(0,0, color,`
        ..####..
        .######.
        ########
        ####....
        ###.....
        ####....
        .######.
        ..####..
        `))
        // frames.add(new DrawAsciiArt(3,display.height, colorGreen,`
        // ...##...
        // .######.
        // .######.
        // ####....
        // #####...
        // .######.
        // .######.
        // ...##...
        // `))
        //
        // frames.add(new DrawAsciiArt(3,display.height-1, colorGreen,`
        // ..#.###..
        // .##.####
        // `))

         new FxMovie(scheduler, controls, 4,0).run(frames,box)

        new FxRotate(scheduler, controls, 1).run(frames, box)


    }
}
