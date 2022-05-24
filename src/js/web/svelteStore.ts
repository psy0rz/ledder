//svelte variable store
import { writable } from 'svelte/store';
import {Controls} from "../ledder/Controls.js";

export const sveltePresets = writable<Controls>( )

// export const svelteSelected = writable({ animationName: "", presetName:"" })

//human readable title for selected animation/preset combo
export const svelteSelectedTitle =writable("")

export const svelteSelectedAnimationName =writable("")

export const svelteAnimations = writable([])

export const svelteLive =writable(true)

