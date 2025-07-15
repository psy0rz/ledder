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
import FxColorPattern from "../../fx/FxColorPattern.js";
import FxColorCycle from "../../fx/FxColorCycle.js";

export default class Arrow extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        let colorControl = controls.color()

        let patGroup = controls.group("Color pattern", true,false,true)
        // controls.disable(patGroup)
        let pat = new FxColorPattern(scheduler, patGroup, 240, 10, false, true, 'Bertrik fire')


        let direction = controls.select("Direction", "up", [
            {
                "id": "up",
                "name": "Up",
            },
            {
                "id": "down",
                "name": "Down",
            },
            {
                "id": "left",
                "name": "Left",
            },
            {
                "id": "right",
                "name": "Right",
            }
        ], true)

        let maxOffset = box.xMax - box.xMin

        let offset = controls.value("Wall offset", 3, 0, maxOffset, 1, true)
        let startOffset = controls.value("Start offset", 1, 0, maxOffset, 1, true)
        let endOffset = controls.value("End offset", 1, 0, maxOffset, 1, true)
        let size = controls.value("Size", 3, 1, 10, 1, true)


        let startX = 0
        let startY = 0

        //end is where the arrow head is
        let endX = 0
        let endY = 0

        //flank end coordinates (line will be drawn from endX,Y to flankX,Y)
        let flank1X = 0
        let flank1Y = 0
        let flank2X = 0
        let flank2Y = 0


        if (direction.selected === "up") {
            startX = endX = box.xMin + offset.value
            startY = box.yMax - startOffset.value
            endY = box.yMin + endOffset.value

            flank1X = endX + size.value
            flank2X = endX - size.value
            flank1Y = flank2Y = endY + size.value
        }


        //main line
        // box.add(new DrawLine(startX, startY, endX, endY, colorControl))
        let mainLine = new DrawLine(startX, startY, endX, endY, colorControl)
        box.add(mainLine)

        //arrow flanks
        let flank1 = new DrawLine(flank1X, flank1Y, endX, endY, colorControl)
        box.add(flank1)

        let flank2 = new DrawLine(flank2X, flank2Y, endX, endY, colorControl)
        box.add(flank2)

        if (patGroup.enabled) {
            controls.disable(colorControl)
            pat.run(mainLine)
            pat.run(flank1)
            pat.run(flank2)
        }
        else
        {
            controls.enable(colorControl)
        }


    }
}
