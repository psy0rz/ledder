//rebuild preset store and updates preview thumbnails

import {PresetStore} from "./PresetStore.js";

const presetStore = new PresetStore()

console.log("Creating animation preset list...")

await presetStore.storeAnimationPresetList(true, process.argv[2]=='--force')

console.log("Build complete")

//force exit, in case of async hanging stuff
process.exit(0)
