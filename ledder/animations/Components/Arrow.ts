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

import DrawLine from "../../draw/DrawLine.js";

export default class Arrow extends  Animator
{

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        let colorControl = controls.color()

            let direction= controls.select("Direction", "up",[
            {
                "id":"up",
                "name":"Up",
            },
            {
                "id":"down",
                "name":"Down",
            },
            {
                "id":"left",
                "name":"Left",
            },
            {
                "id":"right",
                "name":"Right",
            }
        ], true)

        let maxOffset= box.xMax-box.xMin

        let offset = controls.value("Wall offset", 3, 0, maxOffset, 1,true)
        let startOffset = controls.value("Start offset", 1, 0, maxOffset, 1,true)
        let endOffset = controls.value("End offset", 1, 0, maxOffset, 1,true)
        let size = controls.value("Size", 3, 1, 10, 1,true)


        let startX=0
        let startY=0

        //end is where the array head is
        let endX=0
        let endY=0

        //flank end coordinates (line will be drawn from endX,Y to flankX,Y)
        let flank1X=0
        let flank1Y=0
        let flank2X=0
        let flank2Y=0


        if (direction.selected === "up") {
            startX=endX=box.xMin+offset.value
            startY=box.yMax-startOffset.value
            endY=box.yMin+endOffset.value

            flank1X=endX+size.value
            flank2X=endX-size.value
            flank1Y=flank2Y=endY+size.value
        }

        //main line
        box.add(new DrawLine(startX, startY, endX, endY, colorControl))

        //arrow flanks
        box.add(new DrawLine(endX, endY, flank1X, flank1Y, colorControl))
        box.add(new DrawLine(endX, endY, flank2X, flank2Y, colorControl))


    }
}
