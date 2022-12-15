import PixelBox from "../PixelBox.js"
import Pixel from "../Pixel.js"
import Scheduler from "../Scheduler.js"
import Color from "../Color.js"
import ControlGroup from "../ControlGroup.js"
import Animation from "../Animation.js"


export default class Template extends  Animation
{
    static category = "Misc"
    static title = "Template for new animations"
    static description = "blabla"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const pixel=new Pixel(0,0, new Color(255,0,0))
        box.add(pixel)

    }
}
