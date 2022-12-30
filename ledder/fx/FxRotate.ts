import Fx from "../Fx.js"
import ControlValue from "../ControlValue.js"
import ControlGroup from "../ControlGroup.js"
import PixelList from "../PixelList.js"
import BoxInterface from "../BoxInterface.js"
import Scheduler from "../Scheduler.js"
import {random} from "../utils.js"


//Rotate pixels inside a box
export default class FxRotate extends Fx {

    intervalControl: ControlValue
    xStepControl: ControlValue
    yStepControl: ControlValue
    intervalRandomizerControl: ControlValue


    constructor(scheduler: Scheduler, controlGroup: ControlGroup, xStep = -1, yStep = 0, interval = 2, intervalRandomizer = 0) {
        super(scheduler, controlGroup)

        this.intervalControl = controlGroup.value('Rotate interval', interval, 1, 60, 1)
        this.intervalRandomizerControl = controlGroup.value('Rotate interval randomizer', intervalRandomizer, 0, 60, 1, true)
        this.xStepControl = controlGroup.value('Rotate X step', xStep, -5, 5, 1)
        this.yStepControl = controlGroup.value('Rotate Y step', yStep, -5, 5, 1)

    }

    //rotate pixels inside specified bbox if specified. (otherwise uses bbox() of pixelcontainer)
    //waitX and waitY will stop and resolve the promise when axis has shifted this much.
    run(container: PixelList, bbox?: BoxInterface, waitX?: number, waitY?: number) {
        this.running = true

        if (bbox === undefined)
            bbox = container.bbox()

        let scrolledX = 0
        let scrolledY = 0

        const randomizer = random(0, this.intervalRandomizerControl.value)

        this.promise = this.scheduler.interval(this.intervalControl.value + randomizer, (frameNr) => {

            scrolledX = scrolledX + this.xStepControl.value
            scrolledY = scrolledY + this.yStepControl.value

            container.forEachPixel((p) => {
                p.x = p.x + this.xStepControl.value
                p.y = p.y + this.yStepControl.value
                p.wrap(bbox)

            })

            if ((waitX && Math.abs(scrolledX) > waitX) || (waitY && Math.abs(scrolledY) > waitY))
                return false

            if (this.running)
                return this.intervalControl.value + randomizer
            else
                return false
        })

        return (this.promise)
    }
}

