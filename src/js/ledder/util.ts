//led utils

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
        const colorH = (i * 40 / 100)/360
        const colorS = 1;
        const colorL = i/100;
        const c=new Color()
        c.setHsl(colorH, colorS, colorL)
        colors.push(c)
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
