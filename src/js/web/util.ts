//webinterface utils

import {f7} from "framework7-svelte";

export function error(title: string, message: string, time = 10000) {
    console.error(`ERROR: ${title}: ${message}`)
    console.log(title, message)
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
    // if (!loaders)
    //     f7.preloader.show()
    //
    loaders++;

}

export function progressDone() {
    loaders--;
    // if (!loaders) {
    //     f7.preloader.hide()
    // }
}

export function progressReset() {
    // loaders = 0;
    // f7.preloader.hide()

}

/**
 * Human readable "how long ago", e.g. "5s ago" / "3m ago" / "2h ago" / "4d ago".
 * @param millisAgo milliseconds since the moment, or undefined if it never happened
 */
export function formatTimeAgo(millisAgo: number): string {
    if (millisAgo === undefined)
        return "never"

    const secondsAgo = Math.max(0, Math.floor(millisAgo / 1000))
    if (secondsAgo < 60)
        return `${secondsAgo}s ago`

    const minutesAgo = Math.floor(secondsAgo / 60)
    if (minutesAgo < 60)
        return `${minutesAgo}m ago`

    const hoursAgo = Math.floor(minutesAgo / 60)
    if (hoursAgo < 24)
        return `${hoursAgo}h ago`

    return `${Math.floor(hoursAgo / 24)}d ago`
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


