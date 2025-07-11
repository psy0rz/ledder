import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js";
import Color from "../../Color.js";


export default class Arrow extends  Animator
{

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const pixel=new Pixel(0,0, new Color(255,0,0))
        box.add(pixel)
        box.xMin
        box.yMax

    }
}
