//rebuild preset store and updates preview thumbnails


import {presetStore} from "./PresetStore.js"
import {previewStore} from "./PreviewStore.js"

await presetStore.storeAnimationPresetList()
await previewStore.renderAll(presetStore.animationPresetList, process.argv.indexOf('-f')!=-1)

//force exit, in case of async hanging stuff
process.exit(0)
