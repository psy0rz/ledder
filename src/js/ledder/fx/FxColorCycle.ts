import Fx from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {ControlGroup} from "../ControlGroup.js";
import {Color} from "../Color.js";
import {Scheduler} from "../Scheduler.js";
import {PixelContainer} from "../PixelContainer.js";
import {Pixel} from "../Pixel.js";
import {ColorInterface} from "../ColorInterface.js";
import {ControlSelect} from "../ControlSelect.js";
import {random} from "../util.js";

//Smooth cycle through a list of color objects, with 60 fps. Calculating the optimum step size
export default class FxColorCycle extends Fx {


    private repeat: ControlValue //0=infinite
    private mode: ControlSelect;
    private cycleTimeControl: ControlValue;
    private randomizerControl: ControlValue;

    constructor(scheduler: Scheduler, controls: ControlGroup, mode = "pingpong", cycleTime=60, randomizer=0, repeat = 0) {
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
    }


    //cycle the target color object through the list of colors
    run(colors: Array<ColorInterface>, target: ColorInterface) {

        this.running = true
        let repeat = 0
        let colorI = 0

        //calculate step size
        let step=colors.length/(this.cycleTimeControl.value +  random(0, this.randomizerControl.value))

        if (this.mode.selected == "reverse") {
            step=-step
            colorI = colors.length - 1
        } else {
            colorI = 0
        }
        Object.assign(target, colors[~~colorI])

        this.promise = this.scheduler.interval(1, (frameNr) => {

            Object.assign(target, colors[~~colorI])
            colorI = colorI + step

            if (step > 0) {
                if (colorI >= colors.length) {
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
                        colorI = colorI + step +step

                    }
                    //reverse
                    else {
                        colorI = colors.length - 1
                    }

                }
            }
        })


        return (this.promise)
    }
}
