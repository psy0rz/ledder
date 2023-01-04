//rebuild preset store and updates preview thumbnails


import {presetStore} from "./PresetStore.js"
import {previewStore} from "./PreviewStore.js"


await presetStore.storeAnimationPresetList()
await previewStore.renderAll(await presetStore.loadAnimationPresetList(), process.argv[2]=='-f')

//force exit, in case of async hanging stuff
process.exit(0)
