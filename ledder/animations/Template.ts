import Animation from "../Animation.js";
import Display from "../Display.js";
import Scheduler from "../Scheduler.js";
import ControlGroup from "../ControlGroup.js";
import Pixel from "../Pixel.js";
import Color from "../Color.js";

export default class Template extends  Animation
{
    static category = "Misc"
    static title = "Template for new animations"
    static description = "blabla"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const pixel=new Pixel(0,0, new Color(255,0,0))
        display.add(pixel)

    }
}
