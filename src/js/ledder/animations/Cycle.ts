import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {Pixel} from "../Pixel.js"
import {Color} from "../Color.js"
import {PixelContainer} from "../PixelContainer.js"
import {PresetStore} from "../../server/PresetStore.js"
import FxFlameout from "../fx/FxFlameout.js"

const presetStore = new PresetStore()

export default class Template extends Animation {
    static category = "Misc"
    static title = "Cycle stuff"
    static description = ""
    static presetDir = "Cycle"



    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        async function show(animationName, presetName, time) {
            const subControls=controls.group(animationName)
            const animationClass=await presetStore.loadAnimation(animationName)
            const animation= new animationClass()
            const presetValues = await presetStore.load(animationClass, presetName)
            subControls.load(presetValues.values)
            await animation.run(display, scheduler,subControls)

            await scheduler.delay(time/display.frameMs)

            // scheduler.clear()
        }

        const fxControls=controls.group("FX")
        while(1) {
            await show("TDVENLO", "default", 4000)
            await new FxFlameout(scheduler, fxControls).run(display)
            scheduler.clear()

            await show("TkkrLab", "default", 4000)
            await new FxFlameout(scheduler, fxControls).run(display)
            scheduler.clear()

            await show("HSD", "default", 4000)
            await new FxFlameout(scheduler, fxControls).run(display)
            scheduler.clear()


        }
    }
}
