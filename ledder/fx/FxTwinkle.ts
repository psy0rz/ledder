import Fx from "../Fx.js"
import ControlValue from "../ControlValue.js"
import ControlGroup from "../ControlGroup.js"
import PixelSet from "../PixelSet.js"
import BoxInterface from "../BoxInterface.js"
import Scheduler from "../Scheduler.js"
import {random, randomFloatGaussian, randomGaussian} from "../utils.js"
import FxColorCycle from "./FxColorCycle.js"
import Pixel from "../Pixel.js"
import ControlColor from "../ControlColor.js"
import {FxFadeOut} from "./FxFadeOut.js"


//Add flames to the top pixels of a container
export default class FxTwinkle extends Fx {
    colorControl: ControlColor
    private densityControl: ControlValue
    createRandomizer: ControlValue
    randomColors: import("/home/psy/WebstormProjects/ledder/ledder/ControlSwitch").default

    constructor(scheduler: Scheduler, controls: ControlGroup) {
        super(scheduler, controls)

        this.colorControl = controls.color("Color", 255, 255, 255)
        this.densityControl = controls.value("Twinkle density", 5, 0, 100)
        this.createRandomizer = controls.value("Create randomizer %", 100, 50, 100)
        this.randomColors=controls.switch("Random colors", false)

    }

    run(sourceContainer: PixelSet, targetContainer: PixelSet) {

        const fader = new FxFadeOut(this.scheduler, this.controls, 0, 30)

        this.scheduler.interval(1, () => {
            for (let i = 0; i < this.densityControl.value; i++) {
                if (this.createRandomizer.value > randomGaussian(0, 100)) {
                    const p = sourceContainer.randomPixel()
                    const c = this.colorControl.copy()

                    if (this.randomColors.enabled)
                    {
                        c.r=random(0,c.r)
                        c.g=random(0,c.g)
                        c.b=random(0,c.b)
                    }

                    const twinkle = new Pixel(p.x, p.y, c)
                    targetContainer.add(twinkle)
                    fader.run(c).then( ()=>{
                      targetContainer.delete(twinkle)
                    })
                }
            }
        })

        return (this.promise)
    }
}

