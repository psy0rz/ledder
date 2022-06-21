import {Matrix} from "../Matrix.js";
import {ColorInterface} from "../ColorInterface.js";
import {ValueInterface} from "../ValueInterface.js";
import {random, randomFloat} from "../util.js";
import Fx from "../Fx.js";
import {ControlGroup} from "../ControlGroup.js";
import {ControlValue} from "../ControlValue.js";
import {fade} from "svelte/transition";


//Fade out by using the alpha channel. This makes pixels more and more transparant during fade.
export class FxFadeOut extends Fx {

    randomizerControl: ControlValue
    fadeTimeControl: ControlValue

    /**
     * @param matrix
     * @param controlGroup
     * @param fadeTime Number of frames to fade out
     * @param randomizer Randomize frames count by this amount
     *
     * the total time will be: fadeTime + a random number between 0 and randomizer.
     */
    constructor(matrix: Matrix, controlGroup:ControlGroup, fadeTime: number, randomizer: number=0) {
        super(matrix, controlGroup);

        this.fadeTimeControl = controlGroup.value('Fade time', fadeTime, 0, 240)
        this.randomizerControl = controlGroup.value('Fade time randomizer', randomizer, 0, 240)

    }

    /** Fade out specified color object
     *  @param color: color object to manipulate the alpha channel on
     */
    run(color: ColorInterface)
    {
        this.running=true

        let frameNr
        frameNr = this.fadeTimeControl.value + random(0, this.randomizerControl.value);

        let stepA = color.a / frameNr

        this.promise = this.matrix.scheduler.interval(1, () => {

            frameNr--;

            //make sure last step is exact on colorTarget (rounding errors)
            if (frameNr <= 0) {
                color.a = 0
                return false
            }

            color.a -= stepA;

            if (!this.running)
                return false;

        })

        return(this.promise)

    }
}
