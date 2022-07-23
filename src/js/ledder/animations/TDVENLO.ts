import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {Pixel} from "../Pixel.js"
import {Color} from "../Color.js"
import {PixelContainer} from "../PixelContainer.js"
import DrawAsciiArtColor from "../draw/DrawAsciiArtColor.js"
import DrawText from "../draw/DrawText.js"
import {fonts, fontSelect} from "../fonts.js"
import FxRotate from "../fx/FxRotate.js"


const logo=`
r.wbbbbw.wbbbb..r..
..wbbbbw.bwbbbb
g...bb...bw..bb.g
....bb...bb..bb
b...bb...bb..bb.b..
....bb...bb..bb....
y...bb...wwbbbb.y..
....ww...wbbbb.....
`

export default class Template extends Animation {
    static category = "Misc"
    static title = "TDvenlo"
    static description = ""
    static presetDir = "TDvenlo"


    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const font = fontSelect(controls)
        const text = new DrawText(30, 1, font, "VENLO", controls.color("tekst")).center(display)
        display.add(text)

        const bbox = text.bbox()
        bbox.xMax += 20
        // new FxRotate(scheduler, controls).run(text, bbox)

        display.add(new DrawAsciiArtColor(0, 8, logo))
        display.add(new DrawAsciiArtColor(display.width-17, 8, logo))

    }
}
