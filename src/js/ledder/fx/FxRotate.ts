import {Matrix} from "../Matrix.js";
import Fx from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {ControlGroup} from "../ControlGroup.js";
import {PixelContainer} from "../PixelContainer.js";
import BboxInterface from "../BboxInterface.js";


//Rotate pixels inside a box
export default class FxRotate extends Fx {

    intervalControl:ControlValue
    xStepControl: ControlValue
    yStepControl: ControlValue


    constructor(matrix: Matrix, controlGroup: ControlGroup, xStep=-1, yStep=0,interval=2) {
        super(matrix, controlGroup)

        this.intervalControl = controlGroup.value('Interval', interval, 1, 60, 1)
        this.xStepControl = controlGroup.value('X step', xStep,-5,5,1)
        this.yStepControl = controlGroup.value('Y step', yStep,-5,5,1)

    }

    //rotate pixels inside specified bbox if specified. (otherwise uses bbox() of pixelcontainer)
    run(pixelContainer:PixelContainer, bbox?:BboxInterface)
    {
        this.running=true

        if (bbox===undefined)
            bbox = pixelContainer.bbox()

        this.promise=this.matrix.scheduler.intervalControlled(this.intervalControl, (frameNr) => {
            for (const p of pixelContainer.pixels) {
                p.x = p.x + this.xStepControl.value
                p.y = p.y + this.yStepControl.value

                p.wrap( bbox)

            }
            return (this.running && pixelContainer.pixels.length)
        })

        return (this.promise)
    }
}

