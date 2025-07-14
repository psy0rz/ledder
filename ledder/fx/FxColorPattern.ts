import Fx from "../Fx.js"
import ControlValue from "../ControlValue.js"
import ControlGroup from "../ControlGroup.js"
import Color from "../Color.js"
import Scheduler from "../Scheduler.js"

import {patternSelect} from "../ColorPatterns.js"
import ControlSelect from "../ControlSelect.js"
import PixelList from "../PixelList.js"
import ControlSwitch from "../ControlSwitch.js"
import  {Stepper} from "../Stepper.js";

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

        this.cycleTimeControl = controls.value('Color cycle time', cycleTime, 1, 240, 1, true)
        this.reverseControl=controls.switch('Reverse', reverse)
        this.pingpongControl=controls.switch('Ping pong', pingpong)
        this.cyclePattern = patternSelect(controls, 'Color cycle pattern', colorPatternName)
        this.offsetControl = controls.value('Per pixel offset %', offset, 0, 100, 0.1, true)

    }


    run(target: PixelList) {

        this.running = true
        let mainStepper:Stepper
        let internalStepper:Stepper

        let step=0
        if (this.cycleTimeControl.value>0)
            step = this.cyclePattern.length / this.cycleTimeControl.value


        mainStepper = new Stepper(this.cyclePattern.length-1, step, !this.reverseControl.enabled, this.pingpongControl.enabled)
        internalStepper = new Stepper(this.cyclePattern.length-1, this.offsetControl.value/100*this.cyclePattern.length, false, this.pingpongControl.enabled)

        this.promise = this.scheduler.interval(1, (frameNr) => {

            //step main, and offset internal
            mainStepper.next()
            internalStepper.setInternalValue(mainStepper.getInternalValue())

            target.forEachPixel((p) => {
                p.color = this.cyclePattern[~~internalStepper.getValue()]
                internalStepper.next()

            })
        })

        return (this.promise)
    }
}
