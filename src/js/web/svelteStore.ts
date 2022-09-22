//svelte variable store
import { writable } from 'svelte/store';
import ControlGroup from "../../../ledder/ControlGroup.js";

export const sveltePresets = writable<ControlGroup>( )

// export const svelteSelected = writable({ animationName: "", presetName:"" })

//human readable title for selected animation/preset combo
export const svelteSelectedTitle =writable("")

export const svelteSelectedAnimationName =writable("")

export const svelteAnimations = writable([])

export const svelteLive =writable(true)

