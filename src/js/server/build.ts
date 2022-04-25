//rebuild preset store and updates preview thumbnails

import {PresetStore} from "./PresetStore.js";

const presetStore = new PresetStore()
await presetStore.updateAnimationPresetList()
await presetStore.updateAnimationPreviews(false)

//creating previews changes some metadata (timestamp)
await presetStore.updateAnimationPresetList()
