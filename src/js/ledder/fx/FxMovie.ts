import Fx from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {ControlGroup} from "../ControlGroup.js";
import {Scheduler} from "../Scheduler.js";
import {PixelContainer} from "../PixelContainer.js";

//"plays" a collection of pixelcontainers at a certain framerate, by adding/removing them to the specified target container.
export default class FxMovie extends Fx {

    intervalControl: ControlValue

    constructor(scheduler: Scheduler, controlGroup: ControlGroup, interval: number) {
        super(scheduler, controlGroup)

        this.intervalControl = controlGroup.value('Interval', interval, 1, 60, 1)
    }

    run(source: PixelContainer, target: PixelContainer, repeat = 0) {

        this.running = true

        let frameI = source.values()
        let currentFrame

        this.promise = this.scheduler.intervalControlled(this.intervalControl, (frameNr) => {

            if (currentFrame)
                target.delete(currentFrame.value)

            currentFrame = frameI.next()
            if (currentFrame.done) {
                if (repeat) {
                    repeat--
                    if (repeat == 0)
                        return false
                }

                //restart
                frameI = source.values()
                currentFrame = frameI.next()

            }

            target.add(currentFrame.value)
        })


        return (this.promise)
    }
}
