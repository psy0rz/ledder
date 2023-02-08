import Fx from "../Fx.js"
import ControlValue from "../ControlValue.js"
import ControlGroup from "../ControlGroup.js"
import PixelList from "../PixelList.js"
import Scheduler from "../Scheduler.js"
import {random} from "../utils.js"
import Pixel from "../Pixel.js"
import ControlColor from "../ControlColor.js"
import {FxFadeOut} from "./FxFadeOut.js"
import ControlSwitch from "../ControlSwitch.js"


//Add make a glowing pixel trace a list of pixels. (look at hackerhotel.ts for example)
export default class FxTrace extends Fx {
    colorControl: ControlColor
    private densityControl: ControlValue
    createRandomizer: ControlValue
    private randomColors: ControlSwitch
    private intervalControl: ControlValue
    private fader: FxFadeOut

    constructor(scheduler: Scheduler, controls: ControlGroup) {
        super(scheduler, controls)

        this.colorControl = controls.color("Color", 255, 255, 255)
        this.randomColors = controls.switch("Random colors", false)
        this.intervalControl = controls.value("Interval", 2, 1, 120)
        this.fader = new FxFadeOut(this.scheduler, this.controls, 30, 0)

    }

    async run(sourceContainer: PixelList, targetContainer: PixelList) {

        for (const p of sourceContainer) {
            if (p instanceof Pixel) {
                const c = this.colorControl.copy()

                if (this.randomColors.enabled) {
                    c.r = random(0, c.r)
                    c.g = random(0, c.g)
                    c.b = random(0, c.b)
                }
                const twinkle = new Pixel(p.x, p.y, c)
                targetContainer.add(twinkle)
                this.fader.run(c).then(() => {
                    targetContainer.delete(twinkle)
                })

                await this.scheduler.delay(this.intervalControl.value)
            }
        }
    }
}

