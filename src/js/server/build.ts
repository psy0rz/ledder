//rebuild preset store and updates preview thumbnails

import {PresetStore} from "./PresetStore.js";

const presetStore = new PresetStore()
await presetStore.updateAnimationPresetList()
await presetStore.updateAnimationPreviews(process.argv[2]=='--force')
//creating previews changes some metadata (timestamp)
await presetStore.updateAnimationPresetList()

