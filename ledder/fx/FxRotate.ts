import Fx from "../Fx.js"
import ControlValue from "../ControlValue.js"
import ControlGroup from "../ControlGroup.js"
import PixelList from "../PixelList.js"
import BoxInterface from "../BoxInterface.js"
import Scheduler from "../Scheduler.js"
import {random} from "../utils.js"
import PixelBox from "../PixelBox.js"


//Rotate pixels inside a box
export default class FxRotate extends Fx {

    intervalControl: ControlValue
    xStepControl: ControlValue
    yStepControl: ControlValue
    intervalRandomizerControl: ControlValue


    constructor(scheduler: Scheduler, controlGroup: ControlGroup, xStep = -1, yStep = 0, interval = 1, intervalRandomizer = 0) {
        super(scheduler, controlGroup)

        this.intervalControl = controlGroup.value('Rotate interval', interval, 1, 60, 1)
        this.intervalRandomizerControl = controlGroup.value('Rotate interval randomizer', intervalRandomizer, 0, 60, 1, true)
        this.xStepControl = controlGroup.value('Rotate X step', xStep, -5, 5, 0.01)
        this.yStepControl = controlGroup.value('Rotate Y step', yStep, -5, 5, 0.01)

    }

    //rotate pixels inside specified bbox if specified. (otherwise uses bbox() of pixelcontainer)
    //waitX and waitY will stop and resolve the promise when axis has shifted this much.
    //If target is specified, the pixels that are within the target bounds are added to it
    run(container: PixelList, bbox?: BoxInterface, waitX?: number, waitY?: number, target?: PixelBox) {
        if (target !== undefined && target.size)
            throw ("Please use an empty target container")

        this.running = true

        if (bbox === undefined)
            bbox = container.bbox()

        let scrolledX = 0
        let scrolledY = 0

        const randomizer = random(0, this.intervalRandomizerControl.value)

        this.promise = this.scheduler.interval(this.intervalControl.value + randomizer, (frameNr) => {

            scrolledX = scrolledX + this.xStepControl.value
            scrolledY = scrolledY + this.yStepControl.value

            if (target != undefined)
                target.clear()

            container.forEachPixel((p) => {
                p.x = p.x + this.xStepControl.value
                p.y = p.y + this.yStepControl.value
                p.wrap(bbox)
                if (target != undefined && !p.isOutside(target))
                    target.add(p)

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

