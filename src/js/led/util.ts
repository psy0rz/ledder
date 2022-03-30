// min and max included
// import $ from "jquery";
import convert from "color-convert"
import {Color} from "./Color.js";
import {f7} from "framework7-svelte";

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

export function error(title: string, message: string, time = 10000) {
    console.error(`ERROR: ${title}: ${message}`)
    f7.toast.show({
        text: `<i class="material-icons">error</i> <b>${title}</b><p>${message}`,
        position: 'top',
        destroyOnClose: true,
        closeTimeout: time,
        cssClass: 'error',
        closeButton: true
    });

}

export function info(title: string, message: string = "", time = 2000) {

    console.log(`INFO: ${title}: ${message}`)
    f7.toast.show({
        text: `<i class="material-icons">info</i> <b>${title}</b><p>${message}`,
        position: 'top',
        destroyOnClose: true,
        closeTimeout: time,
        cssClass: 'info',
        closeButton: true
    });


}

let loaders = 0;

export function progressStart() {
    if (!loaders)
        f7.preloader.show()

    loaders++;

}

export function progressDone() {
    loaders--;
    if (!loaders) {
        f7.preloader.hide()
    }
}

export function progressReset() {
    loaders = 0;
    f7.preloader.hide()

}

/**
 * Asks user for confirmation, returns Promise
 * @param title
 * @param content
 */
export async function confirmPromise(title: string, content: string) {
    return new Promise<void>((resolve, reject) => {
        f7.dialog.confirm(
            content,
            title,
            () => {
                resolve()
            },
            () => {
                reject()
            })
    })
}

/**
 * Asks user for input, returns Promise
 * @param title
 * @param content
 * @param defaultValue
 */
export async function promptPromise(title: string, content: string, defaultValue: string): Promise<string> {
    return new Promise((resolve, reject) => {
        f7.dialog.prompt(
            content,
            title,
            (ok) => {
                resolve(ok)
            }, (cancel) => {
                reject(cancel)
            },
            defaultValue)
    })
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
