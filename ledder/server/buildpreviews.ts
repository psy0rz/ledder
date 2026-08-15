//rebuild preset store and updates preview thumbnails


import {presetStore} from "./PresetStore.js"
import {previewStore} from "./PreviewStore.js"

//normally only outdated previews are rendered (decided by content hash, see PreviewCache).
//-f/--force rerenders all of them, e.g. when something outside the hashed sources changed.
const forceRebuild = process.argv.includes('-f') || process.argv.includes('--force')

await presetStore.storeAnimationPresetList()
await previewStore.renderAll(presetStore.animationPresetList, forceRebuild)

//force exit, in case of async hanging stuff
process.exit(0)
