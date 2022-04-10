//led utils

import convert from "color-convert"
import {Color} from "./Color.js";

/**
 * Integer number from min to max (inclusive)
 * @param min
 * @param max
 */
export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)

}

/**
 * Floating number from min to max (inclusive min, but never reaches max)
 * @param min
 * @param max
 */
export function randomFloat(min, max) {
    return (Math.random() * (max - min) + min)
}



//calculate converion table for fire-intensity (0-100) to Color()
export function calculateFireColors() {

    const colors = []
    for (let i = 0; i <= 100; i++) {
        const colorH = Math.round(i * 40 / 100);
        const colorS = 100;
        const colorL = i;
        const rgb = convert.hsl.rgb([colorH, colorS, colorL])
        colors.push(new Color(rgb[0], rgb[1], rgb[2]))
    }
    return (colors)
}

//check if its a number and in this range or throw error
export function numberCheck(desc, number, min = undefined, max = undefined) {
    if (isNaN(number))
        throw (`${desc}: '${number}' is not a number`)
    if (min !== undefined && number < min)
        throw (`${desc}: is ${number} but should be at least ${min}`)
    if (max !== undefined && number > max)
        throw (`${desc}: is ${number} but should be at most ${max}`)
}
