import Fx from "../Fx.js";
import { ControlValue } from "../ControlValue.js";
import { ControlGroup } from "../ControlGroup.js";
import { PixelContainer } from "../PixelContainer.js";
import BboxInterface from "../BboxInterface.js";
import { Scheduler } from "../Scheduler.js";
import { random, randomGaussian } from "../util.js";
import { Pixel } from "../Pixel.js";
import { ControlSwitch } from "../ControlSwitch.js";


//Move pixels in a random direction/speed.
export default class FxRandomMove extends Fx {

    intervalControl: ControlValue
    intervalRandomizerControl: ControlValue
    xStepMinControl: ControlValue;
    xStepMaxControl: ControlValue;
    yStepMinControl: ControlValue;
    yStepMaxControl: ControlValue;
    independentControl: ControlSwitch


    constructor(scheduler: Scheduler, controlGroup: ControlGroup, xStepMin = -1, xStepMax = 1, yStepMin = -1, yStepMax = 1, interval = 1, intervalRandomizer = 0, independent=false) {
        super(scheduler, controlGroup)

        this.intervalControl = controlGroup.value('Move interval', interval, 1, 60, 1)
        this.intervalRandomizerControl = controlGroup.value('Move interval randomizer', intervalRandomizer, 0, 60, 1, true)
        this.xStepMinControl = controlGroup.value('Move X step min', xStepMin, -5, 5, 0.01)
        this.xStepMaxControl = controlGroup.value('Move X step max', xStepMax, -5, 5, 0.01)
        this.yStepMinControl = controlGroup.value('Move Y step min', yStepMin, -5, 5, 0.01)
        this.yStepMaxControl = controlGroup.value('Move Y step max', yStepMax, -5, 5, 0.01)
        this.independentControl = controlGroup.switch("Move independently", independent)
    }

    //move all pixels in the pixelcontainer
    //stops after steps number of steps
    run(container: PixelContainer , steps?: number) {
        this.running = true



        const randomizer = random(0, this.intervalRandomizerControl.value)

        this.promise = this.scheduler.interval(this.intervalControl.value + randomizer, (frameNr) => {

            if (this.independentControl.enabled) {

                container.forEachPixel((pixel) =>
                {
                    pixel.move(
                        randomGaussian(this.xStepMinControl.value, this.xStepMaxControl.value),
                        randomGaussian(this.yStepMinControl.value, this.yStepMaxControl.value)
                    )

                })

            }
            else {
                container.move(
                    randomGaussian(this.xStepMinControl.value, this.xStepMaxControl.value),
                    randomGaussian(this.yStepMinControl.value, this.yStepMaxControl.value)
                )

            }


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

