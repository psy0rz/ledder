import PixelSet from "./PixelSet.js"
import {fonts} from "./fonts.js"
import DrawText from "./draw/DrawText.js"
import {colorRed} from "./Colors.js"

//helper to display a status message on the display.

export function statusMessage(box: PixelSet, text: string) {

    fonts.Picopixel.load()
    let msg = new DrawText(0, 0, fonts.Picopixel, text, colorRed)
    box.add(msg)

    return msg

}
