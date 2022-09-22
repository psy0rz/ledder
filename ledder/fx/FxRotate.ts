import Fx from "../Fx.js";
import ControlValue from "../ControlValue.js";
import ControlGroup from "../ControlGroup.js";
import PixelContainer from "../PixelContainer.js";
import BboxInterface from "../BboxInterface.js";
import Scheduler from "../Scheduler.js";
import {random} from "../util.js";


//Rotate pixels inside a box
export default class FxRotate extends Fx {

    intervalControl: ControlValue
    xStepControl: ControlValue
    yStepControl: ControlValue
    intervalRandomizerControl: ControlValue;


    constructor(scheduler: Scheduler, controlGroup: ControlGroup, xStep = -1, yStep = 0, interval = 2, intervalRandomizer=0) {
        super(scheduler, controlGroup)

        this.intervalControl = controlGroup.value('Rotate interval', interval, 1, 60, 1)
        this.intervalRandomizerControl = controlGroup.value('Rotate interval randomizer', intervalRandomizer, 0, 60, 1, true)
        this.xStepControl = controlGroup.value('Rotate X step', xStep, -5, 5, 1)
        this.yStepControl = controlGroup.value('Rotate Y step', yStep, -5, 5, 1)

    }

    //rotate pixels inside specified bbox if specified. (otherwise uses bbox() of pixelcontainer)
    run(container: PixelContainer, bbox?: BboxInterface) {
        this.running = true

        if (bbox === undefined)
            bbox = container.bbox()

        const randomizer = random(0, this.intervalRandomizerControl.value)

        this.promise = this.scheduler.interval(this.intervalControl.value + randomizer, (frameNr) => {
            container.forEachPixel((p) => {
                p.x = p.x + this.xStepControl.value
                p.y = p.y + this.yStepControl.value
                p.wrap(bbox)

            })
            if (this.running)
                return this.intervalControl.value + randomizer
            else
                return false
        })

        return (this.promise)
    }
}

