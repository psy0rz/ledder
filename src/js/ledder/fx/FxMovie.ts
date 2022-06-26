import Fx from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {ControlGroup} from "../ControlGroup.js";
import {Scheduler} from "../Scheduler.js";
import {PixelContainer} from "../PixelContainer.js";
import {random} from "../util.js";

//"plays" a collection of pixelcontainers at a certain framerate, by adding/removing them to the specified target container.
export default class FxMovie extends Fx {

    intervalControl: ControlValue
    private intervalRandomizerControl: ControlValue;

    constructor(scheduler: Scheduler, controlGroup: ControlGroup, interval: number, intervalRandomizer=0) {
        super(scheduler, controlGroup)

        this.intervalControl = controlGroup.value('Movie interval', interval, 1, 60, 1)
        this.intervalRandomizerControl = controlGroup.value('Movie interval randomizer', intervalRandomizer, 0, 60, 1, true)

    }

    run(source: PixelContainer, target: PixelContainer, startFrame=0, repeat = 0) {

        this.running = true

        let frameI = source.values()
        let prevFrame

        if (startFrame)
        {
            for(let i=0; i<startFrame;i++)
                frameI.next()
        }

        const randomizer = random(0, this.intervalRandomizerControl.value)

        this.promise = this.scheduler.interval(this.intervalControl.value + randomizer, (frameNr) => {

            if (prevFrame)
                target.delete(prevFrame.value)

            let frame = frameI.next()
            if (frame.done) {
                if (repeat) {
                    repeat--
                    if (repeat == 0)
                        return false
                }

                //restart
                frameI = source.values()
                frame = frameI.next()

            }

            target.add(frame.value)
            prevFrame=frame

            if (this.running)
                return this.intervalControl.value + randomizer
            else
                return false

        })


        return (this.promise)
    }
}
