import Fx from "../Fx.js";
import ControlValue from "../ControlValue.js";
import ControlGroup from "../ControlGroup.js";
import Scheduler from "../Scheduler.js";
import PixelSet from "../PixelSet.js";
import Pixel from "../Pixel.js";

//Blink pixelcontainers by adding/removing them from the target (always starts with on, ends with off)
//Set skipLast to true to skip the last off-delay.
export default class FxBlink extends Fx {

    onDelay: ControlValue
    offDelay: ControlValue
    repeat: ControlValue //0=infinite
    skipLast: boolean

    constructor(scheduler: Scheduler, controls: ControlGroup, onDelay = 60, offDelay = 60, repeat = 0, skipLast=false) {
        super(scheduler, controls)

        this.onDelay = controls.value('Blink on delay', onDelay, 1, 120, 1)
        this.offDelay = controls.value('Blink off delay', offDelay, 1, 120, 1)
        this.repeat = controls.value('Blink repeat', repeat, 0, 120, 1)
        this.skipLast=skipLast
    }

    run(source: Pixel|PixelSet, target: PixelSet) {

        this.running = true

        //start with on
        target.add(source)

        let on = true
        let repeated = 0

        this.promise = this.scheduler.interval(this.onDelay.value, (frameNr) => {
            let nextDelay


            if (on) {
                //switch to off
                target.delete(source)
                on = false
                nextDelay = this.offDelay.value

                repeated = repeated + 1
                //stop early, skipping last off-cycle ?
                if (this.skipLast && this.repeat.value && repeated >= this.repeat.value)
                    return false

            } else {
                //stop? (completed a full cycle)
                if (this.repeat.value && repeated >= this.repeat.value)
                    return false

                // switch to on
                target.add(source)
                on = true
                nextDelay = this.onDelay.value
            }

            if (!this.running)
                return false

            return nextDelay
        })


        return (this.promise)
    }
}
