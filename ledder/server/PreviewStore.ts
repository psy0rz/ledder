import {DisplayApng} from "./drivers/DisplayApng.js"
import {type AnimationListType} from "../AnimationListTypes.js"
import {presetStore} from "./PresetStore.js"
import {RenderPreview} from "./RenderPreview.js"
import {PreviewCache} from "./PreviewCache.js"
import * as path from "path"

const previewWidth = 40
const previewHeight = 8
const previewColors = 128


//handles creation of previews
export class PreviewStore {

    private display: DisplayApng
    private renderer: RenderPreview
    private previewCache: PreviewCache

    constructor() {

        this.display = new DisplayApng(previewWidth, previewHeight)
        this.renderer = new RenderPreview()
        this.renderer.addDisplay(this.display)

        //everything about the preview output itself: changing it invalidates all stored hashes
        const renderSignature = `apng ${previewWidth}x${previewHeight} ${previewColors}colors`
        this.previewCache = new PreviewCache(path.join(presetStore.presetPath, "previewhashes.json"), renderSignature)
    }


    /**
     * Renders preview to APNG file, and updates the stored hash of just this preview so that a
     * later buildpreviews knows it is up to date. AnimationManager should be prepared.
     */
    async render(animationName: string, presetName: string) {
        //we're in the long running server: files changed since we last looked at them
        this.previewCache.forgetFileContents()
        await this.previewCache.loadStoredHashes()

        await this.renderPreview(animationName, presetName)

        await this.previewCache.storeHashes(false)
    }

    //renders the preview and remembers its hash in memory (caller persists the hashes)
    private async renderPreview(animationName: string, presetName: string) {
        await this.renderer.render(animationName, presetName)
        await this.display.storeImage(presetStore.previewFilename(animationName, presetName), previewColors)
        this.display.clear()

        await this.recordPreviewHash(animationName, presetName)
    }

    async renderAll(animationList: AnimationListType, force: boolean) {
        console.log("Rendering previews...")

        this.previewCache.forgetFileContents()
        await this.previewCache.loadStoredHashes()

        let renderedCount = 0
        let skippedCount = 0

        await presetStore.forEachPreset(animationList, async (animation, preset) => {
            if (!force && !await this.previewOutdated(animation.name, preset.name)) {
                skippedCount++
                return
            }

            try {
                console.log(` - Rendering ${animation.name}/${preset.name} ...`)
                await this.renderPreview(animation.name, preset.name)
                renderedCount++
            } catch (e) {
                console.error(`Exception while creating preview: `, e)
            }
        })

        //we walked the complete list, so hashes of presets that no longer exist can be dropped
        await this.previewCache.storeHashes(true)

        console.log(`Rendering previews completed: ${renderedCount} rendered, ${skippedCount} still up to date.`)
    }

    private previewOutdated(animationName: string, presetName: string) {
        return this.previewCache.previewOutdated(
            presetStore.previewFilename(animationName, presetName),
            presetStore.animationFilename(animationName),
            presetStore.presetFilename(animationName, presetName)
        )
    }

    private recordPreviewHash(animationName: string, presetName: string) {
        return this.previewCache.previewRendered(
            presetStore.previewFilename(animationName, presetName),
            presetStore.animationFilename(animationName),
            presetStore.presetFilename(animationName, presetName)
        )
    }
}

export let previewStore = new PreviewStore()
