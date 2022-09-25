import Fx from "../Fx.js";
import ControlGroup from "../ControlGroup.js";
import PixelSet from "../PixelSet.js";
import Scheduler from "../Scheduler.js";
import Color from "../Color.js";
import DrawAsciiArt from "../draw/DrawAsciiArt.js"
import ControlColor from "../ControlColor.js"
import FxMovie from "./FxMovie.js"
import DrawBox from "../draw/DrawBox.js"
import {colorBlack} from "../Colors.js"


export default class FxPacman extends Fx {
    private color: ControlColor


    constructor(scheduler: Scheduler, controls: ControlGroup) {
        super(scheduler, controls)
        this.color= controls.color("Color", 255,255,0)


    }

    run(container: PixelSet, x, y) {
        this.running = true

        const cleanOffset=5
        x=x-cleanOffset

        const frames=new PixelSet()
        const blinder=new PixelSet()
        container.add(blinder)
        frames.add(new DrawAsciiArt(x, y, this.color,`
        ..####..
        .######.
        ########
        ########
        ########
        ########
        .######.
        ..####..
        `))
        frames.add(new DrawAsciiArt(x,y, this.color,`
        ..####..
        .######.
        ########
        ####....
        ###.....
        ####....
        .######.
        ..####..
        `))
        frames.add(new DrawAsciiArt(x,y, this.color,`
        ..####..
        .######.
        #####...
        ####....
        ###.....
        ####....
        .####...
        ..####..
        `))
        frames.add(new DrawAsciiArt(x,y, this.color,`
        ..####..
        .######.
        #####...
        ####....
        ###.....
        ####....
        .####...
        ..####..
        `))
        frames.add(new DrawAsciiArt(x,y, this.color,`
        ..####..
        .######.
        ########
        ####....
        ###.....
        ####....
        .######.
        ..####..
        `))

        let steps=container.bbox().xMax+cleanOffset


        new FxMovie(this.scheduler, this.controls, 4,0).run(frames,container)

        this.promise=this.scheduler.interval(1, ()=>{
            blinder.add(new DrawBox(x+cleanOffset,y-8,1,16, colorBlack))
            x++
            frames.move(1,0)
            steps--;
            if (steps<=0) {
                container.clear()
                return false
            }
        })


        return (this.promise)
    }
}

