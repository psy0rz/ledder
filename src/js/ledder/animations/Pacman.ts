import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";
import DrawAsciiArt from "../draw/DrawAsciiArt.js"
import {colorGreen} from "../Colors.js"
import FxMovie from "../fx/FxMovie.js"
import FxRotate from "../fx/FxRotate.js"




export default class Template extends  Animation
{
    static category = "Misc"
    static title = "Pacman"
    static description = "blabla"
    static presetDir = "Pacman";

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const frames=new PixelContainer()
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

        new FxRotate(scheduler,controls, 1).run(frames, display)

    }
}
