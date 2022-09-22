import Fx from "../Fx.js";
import ControlValue from "../ControlValue.js";
import ControlGroup from "../ControlGroup.js";
import Color from "../Color.js";
import Scheduler from "../Scheduler.js";
import ColorInterface from "../ColorInterface.js";

import {randomGaussian} from "../util.js";
import {patternSelect} from "../ColorPatterns.js";
import ControlSelect from "../ControlSelect.js"

//Smooth cycle through a list of color objects, with 60 fps. Calculating the optimum step size
export default class FxColorCycle extends Fx {


    private repeat: ControlValue //0=infinite
    private mode: ControlSelect;
    private cycleTimeControl: ControlValue;
    private randomizerControl: ControlValue;
    private cyclePattern: Array<Color>;

    constructor(scheduler: Scheduler, controls: ControlGroup, mode = "pingpong", cycleTime = 60, randomizer = 0, repeat = 0, colorPatternName:string='Bertrik fire') {
        super(scheduler, controls)

        this.cycleTimeControl = controls.value('Color cycle time', cycleTime, 0, 240, 1, true)
        this.randomizerControl = controls.value('Color cycle time randomizer', randomizer, 0, 240, 1, true)
        this.repeat = controls.value('Color cycle repeat count', repeat, 0, 100, 1, true)
        this.mode = controls.select("Color cycle mode", mode,
            [
                {
                    "id": "forward",
                    "name": "Forward"
                },
                {
                    "id": "reverse",
                    "name": "Reverse"
                },
                {
                    "id": "pingpong",
                    "name": "Ping pong"
                },
            ], true)
        this.cyclePattern=patternSelect(controls, 'Color cycle pattern', colorPatternName)
    }


    //cycle the target color object through the list of colors.
    //use skip to skip the first percentage of colors
    //note: skipping makes the cycle-time shorter, since thats usually what you want.
    run(target: ColorInterface, skipPercentage = 0, overridePattern?: Array<ColorInterface>) {

        this.running = true
        let repeat = 0
        let colorI = 0
        let colorPattern
        if (overridePattern)
            colorPattern=overridePattern
        else
            colorPattern=this.cyclePattern

        const skip=~~(skipPercentage/100*colorPattern.length)

        //calculate step size (does not take into account skip!)
        let step = colorPattern.length / (this.cycleTimeControl.value + randomGaussian(0, this.randomizerControl.value))

        if (this.mode.selected == "reverse") {
            step = -step
            colorI = colorPattern.length - 1 - skip
        } else {
            colorI = 0 + skip
        }
        Object.assign(target,
            colorPattern[~~colorI])

        Object.assign(target, colorPattern[~~colorI])
        this.promise = this.scheduler.interval(1, (frameNr) => {

            Object.assign(target, colorPattern[~~colorI])
            colorI = colorI + step

            if (step > 0) {
                if (colorI >= colorPattern.length) {
                    if (this.mode.selected == "pingpong") {
                        //invert direction and move one step back
                        step = -step
                        colorI = colorI + step + step
                    }
                    //forward
                    else {
                        repeat++
                        if (this.repeat.value && repeat >= this.repeat.value)
                            return false

                        colorI = 0
                    }
                }
            } else {
                if (colorI < 0) {
                    repeat++
                    if (this.repeat.value && repeat >= this.repeat.value)
                        return false

                    if (this.mode.selected == "pingpong") {
                        //invert direction and move one step back
                        step = -step
                        colorI = colorI + step + step

                    }
                    //reverse
                    else {
                        colorI = colorPattern.length - 1
                    }

                }
            }
        })


        return (this.promise)
    }
}
