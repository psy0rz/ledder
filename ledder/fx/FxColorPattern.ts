import Fx from "../Fx.js"
import ControlValue from "../ControlValue.js"
import ControlGroup from "../ControlGroup.js"
import Color from "../Color.js"
import Scheduler from "../Scheduler.js"

import {Stepper} from "../utils.js"
import {patternSelect} from "../ColorPatterns.js"
import ControlSelect from "../ControlSelect.js"
import PixelSet from "../PixelSet.js"
import ControlSwitch from "../ControlSwitch.js"

//Applies a color pattern to all pixels in a container. Colors are applied in order of the pixels.
export default class FxColorPattern extends Fx {


    private repeat: ControlValue //0=infinite
    private mode: ControlSelect
    private cycleTimeControl: ControlValue
    private randomizerControl: ControlValue
    private cyclePattern: Array<Color>
    private stepControl: ControlValue
    private offsetControl: ControlValue
    private reverseControl: ControlSwitch
    private pingpongControl: ControlSwitch

    constructor(scheduler: Scheduler, controls: ControlGroup,  cycleTime = 240, offset = 1, reverse=false, pingpong=true, colorPatternName: string = 'Bertrik fire') {
        super(scheduler, controls)

        this.cycleTimeControl = controls.value('Color cycle time', cycleTime, 0, 240, 1, true)
        this.reverseControl=controls.switch('Reverse', reverse)
        this.pingpongControl=controls.switch('Ping pong', pingpong)
        this.cyclePattern = patternSelect(controls, 'Color cycle pattern', colorPatternName)
        this.offsetControl = controls.value('Per pixel offset %', offset, 0, 100, 0.1, true)

    }


    run(target: PixelSet) {

        this.running = true
        let mainStepper
        let internalStepper

        let step=0
        if (this.cycleTimeControl.value>0)
            step = this.cyclePattern.length / this.cycleTimeControl.value


        mainStepper = new Stepper(this.cyclePattern.length, step, this.reverseControl.enabled, this.pingpongControl.enabled)
        internalStepper = new Stepper(this.cyclePattern.length, this.offsetControl.value/100*this.cyclePattern.length, this.reverseControl.enabled, this.pingpongControl.enabled)

        this.promise = this.scheduler.interval(1, (frameNr) => {

            //step
            let colorI = mainStepper.next()
            internalStepper.value=mainStepper.value
            internalStepper.reverse=mainStepper.reverse

            target.forEachPixel((p) => {
                // Object.assign(p.color, this.cyclePattern[~~pixelColorI])
                p.color = this.cyclePattern[colorI]
                colorI=internalStepper.next()

            })
        })

        return (this.promise)
    }
}
