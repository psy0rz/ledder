//run an animation from within another animation.
import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import {PresetStore} from "./PresetStore.js"

export async function utils(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, animationName, presetName?: string) {
    const presetStore = new PresetStore()
    const animationClass = await presetStore.loadAnimation(animationName)
    const animation = new animationClass()
    if (presetName) {
        const presetValues = await presetStore.load(animationClass, presetName)
        controls.load(presetValues.values)
    }
    animation.run(box, scheduler, controls)

}
