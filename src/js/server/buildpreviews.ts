//rebuild preset store and updates preview thumbnails

import {PresetStore} from "./PresetStore.js";

const presetStore = new PresetStore()
await presetStore.updateAnimationPresetList()
await presetStore.updateAnimationPreviews(process.argv[2]=='--force')
//creating previews changes some metadata (timestamp)
await presetStore.updateAnimationPresetList()

console.log("Preview building completed.")

//force exit, in case of async hanging stuff
process.exit(0)
