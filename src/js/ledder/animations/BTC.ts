import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";
import DrawCounter from "../draw/DrawCounter.js"

export default class Template extends  Animation
{
    static category = "Misc"
    static title = "Template for new animations"
    static description = "blabla"
    static presetDir = "Misc";

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const counter=new DrawCounter()
        display.add(counter)
        counter.run(scheduler, controls, 0,5)




    }
}
