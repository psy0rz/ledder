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

        scheduler.intervalControlled(controls.value("Creation interval", 10), ()=>{

            const pixel=new Pixel(midX,midY, new Color(255,0,0, 0.3))
            const c=new PixelContainer()
            c.add(pixel)
            display.add(c)
            new FxMove(scheduler, controls, randomFloat(-0.2,.2), randomFloat(-.2,.2)).run(c)

        })

    }
}
