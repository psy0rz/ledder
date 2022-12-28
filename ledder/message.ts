import PixelSet from "./PixelSet.js"
import {fonts} from "./fonts.js"
import DrawText from "./draw/DrawText.js"
import {colorRed} from "./Colors.js"

//helper to display a status message on the display.
let currentMessage: PixelSet

export function statusMessage(box: PixelSet, text: string) {
    if (currentMessage !== undefined)
        box.delete(currentMessage)

    fonts.Picopixel.load()
    currentMessage = new DrawText(0, 0, fonts.Picopixel, text, colorRed)
    box.add(currentMessage)

    return currentMessage

}
