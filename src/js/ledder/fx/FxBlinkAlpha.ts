import Fx from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {ControlGroup} from "../ControlGroup.js";
import {Color} from "../Color.js";
import {Scheduler} from "../Scheduler.js";

//Blink colors via alpha channel. (always starts with on, ends with off)
//Set skipLast to true to skip the last off-delay.
export default class FxBlinkAlpha extends Fx {

    onDelay: ControlValue
    offDelay: ControlValue
    repeat: ControlValue //0=infinite
    skipLast:  boolean

    constructor(scheduler: Scheduler, controls: ControlGroup, onDelay = 60, offDelay = 60, repeat = 0, skipLast=false) {
        super(scheduler, controls)

        this.onDelay = controls.value('Blink on delay', onDelay, 1, 120, 1)
        this.offDelay = controls.value('Blink off delay', offDelay, 1, 120, 1)
        this.repeat = controls.value('Blink repeat', repeat, 0, 120, 1)
        this.skipLast=skipLast
    }

    run(...colors: Array<Color>) {

        this.running = true

        for (const c of colors) {
            if (!(c instanceof Color)) {
                throw("FxBlink can only operate on Color() instances. (Not on color controls)")
            }
            //start with on
            c.a = 1
        }

        let on = true
        let repeated = 0

        this.promise = this.scheduler.interval(this.onDelay.value, (frameNr) => {
            let nextDelay


            if (on) {
                //switch to off
                for (const c of colors)
                    c.a = 0
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
                for (const c of colors)
                    c.a = 1
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
