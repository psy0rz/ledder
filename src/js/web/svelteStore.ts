//svelte variable store
import { writable } from 'svelte/store';
import ControlGroup from "../../../ledder/ControlGroup.js";
import {type AnimationList} from "../../../ledder/AnimationLists.js"
// import {type DisplayDeviceInfoList, DisplayDeviceStore} from "../../../ledder/server/DisplayDeviceStore.js"

export const sveltePresets = writable<ControlGroup>( )

// export const svelteSelected = writable({ animationName: "", presetName:"" })

//human readable title for selected animation/preset combo
export const svelteSelectedTitle =writable("")

// export const svelteSelectedAnimationName =writable("")

export const svelteAnimations = writable<AnimationList>([])

// export const svelteDisplayDeviceInfoList = writable<DisplayDeviceInfoList>([])


export const svelteLive =writable(true)

export const displayZoom = writable(8);
export const displayWidth = writable(0);
export const displayHeight = writable(0);
