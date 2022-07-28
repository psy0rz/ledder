import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";
import {random, randomFloat} from "../util.js"
import FxMove from "../fx/FxMove.js"

export default class Template extends  Animation
{
    static category = "Misc"
    static title = "Starfield"
    static description = "blabla"
    static presetDir = "Test";

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const midX=display.width/2;
        const midY=display.height/2;

        const c=new PixelContainer()
        display.add(c)

        //move all
        scheduler.interval(1, ()=>{
            for (const p of c)
            {

            }

        })


        scheduler.intervalControlled(controls.value("Creation interval", 60), ()=>{


            const pixel=new Pixel(random(0, display.width),-1, new Color(255,255,255, 0))
            c.add(pixel)


        })

    }
}
