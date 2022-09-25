import Animation from "../Animation.js";
import Display from "../Display.js";
import Scheduler from "../Scheduler.js";
import ControlGroup from "../ControlGroup.js";
import Color from "../Color.js";
import PixelSet from "../PixelSet.js";
import DrawAsciiArt from "../draw/DrawAsciiArt.js"
import FxMovie from "../fx/FxMovie.js"
import FxRotate from "../fx/FxRotate.js"




export default class Pacman extends  Animation
{
    static category = "Misc"
    static title = "Pacman"
    static description = "blabla"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const frames=new PixelSet()
        const color= controls.color("Color", 255,255,0)
        frames.add(new DrawAsciiArt(3,display.height, color,`
        ..####..
        .######.
        ########
        ########
        ########
        ########
        .######.
        ..####..
        `))
        frames.add(new DrawAsciiArt(3,display.height, color,`
        ..####..
        .######.
        ########
        ####....
        ###.....
        ####....
        .######.
        ..####..
        `))
        frames.add(new DrawAsciiArt(3,display.height, color,`
        ..####..
        .######.
        #####...
        ####....
        ###.....
        ####....
        .####...
        ..####..
        `))
        frames.add(new DrawAsciiArt(3,display.height, color,`
        ..####..
        .######.
        #####...
        ####....
        ###.....
        ####....
        .####...
        ..####..
        `))
        frames.add(new DrawAsciiArt(3,display.height, color,`
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

         new FxMovie(scheduler, controls, 4,0).run(frames,display)

        new FxRotate(scheduler, controls, 1).run(frames, display)


    }
}
