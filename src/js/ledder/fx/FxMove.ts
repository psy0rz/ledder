import Fx from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {ControlGroup} from "../ControlGroup.js";
import {PixelContainer} from "../PixelContainer.js";
import BboxInterface from "../BboxInterface.js";
import {Scheduler} from "../Scheduler.js";


//Move pixels. If they leave the box they will be removed from the container.
export default class FxMove extends Fx {

    intervalControl: ControlValue
    xStepControl: ControlValue
    yStepControl: ControlValue


    constructor(scheduler: Scheduler, controlGroup: ControlGroup, xStep = -1, yStep = 0, interval = 2) {
        super(scheduler, controlGroup)

        this.intervalControl = controlGroup.value('Interval', interval, 1, 60, 1)
        this.xStepControl = controlGroup.value('X step', xStep, -5, 5, 1)
        this.yStepControl = controlGroup.value('Y step', yStep, -5, 5, 1)
    }

    //rotate pixels inside specified bbox if specified. (otherwise uses bbox() of pixelcontainer)
    //stops after steps number of steps
    run(container: PixelContainer, bbox?: BboxInterface, steps?:number) {
        this.running = true

        if (bbox === undefined)
            bbox = container.bbox()

        this.promise = this.scheduler.intervalControlled(this.intervalControl, (frameNr) => {
            container.forEachPixel((p) => {
                p.x = p.x + this.xStepControl.value
                p.y = p.y + this.yStepControl.value
            })

            if (steps)
            {
                steps--
                if (steps==0)
                    return false
            }
            return (this.running )
        })

        return (this.promise)
    }
}

