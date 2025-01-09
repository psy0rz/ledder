import {DisplayApng} from "./drivers/DisplayApng.js"
import {type AnimationListType} from "../AnimationListTypes.js"
import {presetStore} from "./PresetStore.js"
import {RenderPreview} from "./RenderPreview.js"


//handles creation of previews
export class PreviewStore {

    private display: DisplayApng
    private renderer: RenderPreview

    constructor() {

        this.display = new DisplayApng(40, 8)
        this.renderer=new RenderPreview()
        this.renderer.addDisplay(this.display)
    }


    /**
     * Renders preview to APNG file. AnimationManager should be prepared.
     */
    async render(animationName: string, presetName: string) {

        await this.renderer.render(animationName, presetName)
        await this.display.store(presetStore.previewFilename(animationName, presetName), 128)
        this.display.clear()
    }

    async renderAll(animationList: AnimationListType, force: boolean) {
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
