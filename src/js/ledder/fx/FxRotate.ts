import {Matrix} from "../Matrix.js";
import Fx from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {ControlGroup} from "../ControlGroup.js";
import {PixelContainer} from "../PixelContainer.js";


export default class FxRotate extends Fx {

    static title = "Rotate pixels inside bounding box of the pixelcontainer"

    intervalControl:ControlValue
    xStepControl: ControlValue
    yStepControl: ControlValue

    constructor(matrix: Matrix, controlGroup: ControlGroup, xStep=-1, yStep=0,interval=2) {
        super(matrix, controlGroup)

        this.intervalControl = controlGroup.value('Interval', interval, 1, 60, 1)
        this.xStepControl = controlGroup.value('X step', xStep,-5,5,1)
        this.yStepControl = controlGroup.value('Y step', yStep,-5,5,1)

    }

    run(pixelContainer:PixelContainer)
    {
        let bbox = pixelContainer.bbox()
        this.running=true
        this.promise=this.matrix.scheduler.intervalControlled(this.intervalControl, (frameNr) => {
            for (const p of pixelContainer.pixels) {
                p.x = p.x + this.xStepControl.value
                p.y = p.y + this.yStepControl.value

                p.wrap( bbox.xMin, bbox.yMin, bbox.xMax, bbox.yMax)

            }
            return (this.running && pixelContainer.pixels.length)
        })

        return (this.promise)
    }
}

