//rebuild preset store and updates preview thumbnails


import {presetStore} from "./PresetStore.js"
import {previewStore} from "./PreviewStore.js"


await presetStore.storeAnimationPresetList()



console.log("__________________________________")
await previewStore.renderAll(await presetStore.loadAnimationPresetList(), false)

//force exit, in case of async hanging stuff
process.exit(0)
