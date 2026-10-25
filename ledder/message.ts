import PixelList from "./PixelList.js"
import {fonts} from "./fonts.js"
import DrawText from "./draw/DrawText.js"
import {colorRed} from "./Colors.js"
import type PixelBox from "./PixelBox.js";

//helper to display a status message on the display.

export function statusMessage(box: PixelBox, text: string) {

    fonts["Pixel-Gosub"].load()
    let msg = new DrawText(0, 0, fonts["Pixel-Gosub"], text, colorRed, 1, box.width())
    box.add(msg)

    return msg

}
