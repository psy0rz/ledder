import Fx from "../Fx.js"
import ControlValue from "../ControlValue.js"
import ControlGroup from "../ControlGroup.js"
import PixelList from "../PixelList.js"
import Scheduler from "../Scheduler.js"
import {random, randomGaussian} from "../utils.js"
import Pixel from "../Pixel.js"
import ControlColor from "../ControlColor.js"
import {FxFadeOut} from "./FxFadeOut.js"
import ControlSwitch from "../ControlSwitch.js"


//Add flames to the top pixels of a container
export default class FxTwinkle extends Fx {
    colorControl: ControlColor
    private densityControl: ControlValue
    createRandomizer: ControlValue
    randomColors: ControlSwitch

    constructor(scheduler: Scheduler, controls: ControlGroup) {
        super(scheduler, controls)

        this.colorControl = controls.color("Color", 255, 255, 255)
        this.densityControl = controls.value("Twinkle density", 3, 0, 10)
        this.createRandomizer = controls.value("Create randomizer %", 50, 0, 100)
        this.randomColors=controls.switch("Random colors", false)

    }

    run(sourceContainer: PixelList, targetContainer: PixelList) {

        const fader = new FxFadeOut(this.scheduler, this.controls, 0, 30)

        this.scheduler.interval(1, () => {
            for (let i = 0; i < this.densityControl.value; i++) {
                if (this.createRandomizer.value > randomGaussian(0, 100)) {
                    const p = sourceContainer.randomPixel()
                    if (p!==undefined) {
                        const c = this.colorControl.copy()

                        if (this.randomColors.enabled) {
                            c.r = random(0, c.r)
                            c.g = random(0, c.g)
                            c.b = random(0, c.b)
                        }

                        const twinkle = new Pixel(p.x, p.y, c)
                        targetContainer.add(twinkle)
                        fader.run(c).then(() => {
                            targetContainer.delete(twinkle)
                        })
                    }
                }
            }
        })

        return (this.promise)
    }
}

