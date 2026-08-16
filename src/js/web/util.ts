//webinterface utils

import {f7} from "framework7-svelte";

export {formatTimeAgo} from "../../../ledder/timeAgo.js"

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
 * Framework7 intercepts every <a> click and preventDefault()s it to route through its own
 * router, unless the link carries class="external" (see clicks.js). Animation descriptions
 * are rendered as raw HTML, so any <a> in them needs that class (plus a new tab, since we
 * don't want to navigate the app away) to actually be clickable.
 */
export function externalizeLinks(html: string): string {
    const container = document.createElement("div")
    container.innerHTML = html
    container.querySelectorAll("a").forEach(link => {
        link.classList.add("external")
        link.target = "_blank"
        link.rel = "noopener noreferrer"
    })
    return container.innerHTML
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


