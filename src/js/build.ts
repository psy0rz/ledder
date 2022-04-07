//rebuild preset store and updates preview thumbnails

import {PresetStore} from "./PresetStore.js";

const presetStore = new PresetStore("./src/js/led/animations","presets")
await presetStore.updateAnimationPresetList()
await presetStore.updateAnimationPreviews(false)
