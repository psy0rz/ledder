import Fx from "../Fx.js"
import ControlValue from "../ControlValue.js"
import ControlGroup from "../ControlGroup.js"
import Color from "../Color.js"
import Scheduler from "../Scheduler.js"
import ColorInterface from "../ColorInterface.js"

import {ForwardStepper, PingPongStepper, randomGaussian, ReverseStepper} from "../utils.js"
import {patternSelect} from "../ColorPatterns.js"
import ControlSelect from "../ControlSelect.js"
import controls from "../../src/pages/controls.svelte"
import PixelSet from "../PixelSet.js"

//Applies a color pattern to all pixels in a container. Colors are applied in order of the pixels.
export default class FxColorPattern extends Fx {


    private repeat: ControlValue //0=infinite
    private mode: ControlSelect
    private cycleTimeControl: ControlValue
    private randomizerControl: ControlValue
    private cyclePattern: Array<Color>
    private stepControl: ControlValue
    private offsetControl: ControlValue

    constructor(scheduler: Scheduler, controls: ControlGroup, mode = "pingpong", cycleTime = 240, offset = 1, colorPatternName: string = 'Bertrik fire') {
        super(scheduler, controls)

        this.cycleTimeControl = controls.value('Color cycle time', cycleTime, 0, 240, 1, true)
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
        this.cyclePattern = patternSelect(controls, 'Color cycle pattern', colorPatternName)
        this.offsetControl = controls.value('Per pixel offset', offset, 0, 100, 0.1, true)
    }


    run(target: PixelSet) {

        this.running = true
        let mainStepper
        let internalStepper

        let step=0
        if (this.cycleTimeControl.value>0)
            step = this.cyclePattern.length / this.cycleTimeControl.value


        if (this.mode.selected == "reverse") {
            mainStepper = new ReverseStepper(this.cyclePattern.length, step)
            internalStepper=new ReverseStepper(this.cyclePattern.length, this.offsetControl.value)
        }
        else if (this.mode.selected == "forward") {
            mainStepper = new ForwardStepper(this.cyclePattern.length, step)
            internalStepper=new ForwardStepper(this.cyclePattern.length, this.offsetControl.value)
        }
        else {
            mainStepper = new PingPongStepper(this.cyclePattern.length, step)
            internalStepper=new PingPongStepper(this.cyclePattern.length, this.offsetControl.value)
        }


        this.promise = this.scheduler.interval(1, (frameNr) => {

            //step
            let colorI = mainStepper.next()
            internalStepper.value=mainStepper.value
            if (mainStepper.step>=0)
                internalStepper.step=this.offsetControl.value
            else
                internalStepper.step=-this.offsetControl.value

            target.forEachPixel((p) => {
                // Object.assign(p.color, this.cyclePattern[~~pixelColorI])
                p.color = this.cyclePattern[colorI]
                colorI=internalStepper.next()

            })
        })

        return (this.promise)
    }
}
