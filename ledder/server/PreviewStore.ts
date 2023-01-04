import {writeFile} from "fs/promises"
import {DisplayApng} from "./drivers/DisplayApng.js"
import Scheduler from "../Scheduler.js"
import Animation from "../Animation.js"
import {PresetValues} from "../PresetValues.js"
import ControlGroup from "../ControlGroup.js"
import PixelBox from "../PixelBox.js"
import AnimationManager from "./AnimationManager.js"
import {preRender} from "./utils.js"
import {AnimationList, AnimationListDir, AnimationListItem, PresetListItem} from "../AnimationLists.js"
import {presetStore} from "./PresetStore.js"


//handles creation of previews
export class PreviewStore {

    private display: DisplayApng
    public animationManager: AnimationManager

    constructor() {

        this.display = new DisplayApng(40, 8)
        let box = new PixelBox(this.display)
        this.animationManager = new AnimationManager(box, new Scheduler(), new ControlGroup('root'))
    }


    /**
     * Renders preview to APNG file. AnimationManager should be prepared.
     */
    async render(animationName: string, presetName: string) {
        this.display.clear()
        await this.animationManager.loadAnimation(animationName)
        await this.animationManager.loadPreset(presetName)
        this.animationManager.run()
        preRender(this.display, this.animationManager)
        this.animationManager.stop(false)
        await this.display.store(presetStore.previewFilename(animationName, presetName), 128)
    }

    async renderAll(animationList: AnimationList, force: boolean) {
        console.log("Rendering previews...")

        await presetStore.forEachPreset(animationList, async (animation, preset) => {
            if (force || await presetStore.previewOutdated(animation.name, preset.name)) {
                try {
                    console.log(` - Rendering ${animation.name}/${preset.name} ...`)
                    await this.render(animation.name, preset.name)
                } catch (e) {
                    console.error(`Exception while creating preview: `, e)
                }
            }
        })

        console.log("Rendering previews completed")
    }
}

export let previewStore = new PreviewStore()
