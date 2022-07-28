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
  rr.rr.rr
  rr.rr.rr
  .rrrrrr.
  .rrrrrr.
  .rrrrrr.
  .rr..rr.
  .rr..rr.
  rrr..rrr
`

export default class Template extends Animation {
    static category = "Misc"
    static title = "HSD"
    static description = ""
    static presetDir = "HSD"


    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const font = fontSelect(controls)
        const text = new DrawText(8, 1, font, ".   Hackerspace Drenthe", controls.color("tekst"))
        display.add(text)

        const bbox = text.bbox()
        bbox.xMax += 20
        new FxRotate(scheduler, controls).run(text, bbox)

        display.add(new DrawAsciiArtColor(0, 8, logo))
        display.add(new DrawAsciiArtColor(display.width-8, 8, logo))

    }
}
