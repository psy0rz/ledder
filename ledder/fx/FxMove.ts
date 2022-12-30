import Fx from "../Fx.js";
import ControlValue from "../ControlValue.js";
import ControlGroup from "../ControlGroup.js";
import PixelList from "../PixelList.js";
import Scheduler from "../Scheduler.js";
import {random} from "../utils.js";
import Pixel from "../Pixel.js";


//Move pixels in a fixed direction/speed.
export default class FxMove extends Fx {

    intervalControl: ControlValue
    intervalRandomizerControl: ControlValue
    xStepControl: ControlValue
    yStepControl: ControlValue


    constructor(scheduler: Scheduler, controlGroup: ControlGroup, xStep = -1, yStep = 0, interval = 1, intervalRandomizer = 0) {
        super(scheduler, controlGroup)

        this.intervalControl = controlGroup.value('Move interval', interval, 1, 60, 1)
        this.intervalRandomizerControl = controlGroup.value('Move interval randomizer', intervalRandomizer , 0, 60, 1, true)
        this.xStepControl = controlGroup.value('Move X step', xStep, -5, 5, 0.01)
        this.yStepControl = controlGroup.value('Move Y step', yStep, -5, 5, 0.01)
    }

    //move all pixels in the pixelcontainer
    //stops after steps number of steps
    run(container: PixelList|Pixel, steps?: number) {
        this.running = true



        const randomizer = random(0, this.intervalRandomizerControl.value)

        this.promise = this.scheduler.interval(this.intervalControl.value + randomizer, (frameNr) => {
            container.move(this.xStepControl.value, this.yStepControl.value)

            if (steps) {
                steps--
                if (steps == 0)
                    return false
            }
            if (this.running)
                return this.intervalControl.value + randomizer
            else
                return false
        })

        return (this.promise)
    }
}

