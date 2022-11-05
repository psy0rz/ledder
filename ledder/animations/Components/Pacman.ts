import Animation from "../../Animation.js"
import Scheduler from "Scheduler.js"
import Color from "Color.js";
import PixelSet from "PixelSet.js";
import DrawAsciiArt from "draw/DrawAsciiArt.js"
import FxMovie from "fx/FxMovie.js"
import FxRotate from "fx/FxRotate.js"
import PixelBox from "PixelBox.js"
import ControlGroup from "ControlGroup.js"




export default class Pacman extends  Animation
{
    static category = "Misc"
    static title = "Pacman"
    static description = "blabla"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const frames=new PixelSet()
        const color= controls.color("Color", 255,255,0)
        frames.add(new DrawAsciiArt(0,7, color,`
        ..####..
        .######.
        ########
        ########
        ########
        ########
        .######.
        ..####..
        `))
        frames.add(new DrawAsciiArt(0,7, color,`
        ..####..
        .######.
        ########
        ####....
        ###.....
        ####....
        .######.
        ..####..
        `))
        frames.add(new DrawAsciiArt(0,7, color,`
        ..####..
        .######.
        #####...
        ####....
        ###.....
        ####....
        .####...
        ..####..
        `))
        frames.add(new DrawAsciiArt(0,7, color,`
        ..####..
        .######.
        #####...
        ####....
        ###.....
        ####....
        .####...
        ..####..
        `))
        frames.add(new DrawAsciiArt(0,7, color,`
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
