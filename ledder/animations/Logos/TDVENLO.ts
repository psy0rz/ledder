import PixelBox from "../../PixelBox.js"
import PixelList from "../../PixelList.js"
import DrawText from "../../draw/DrawText.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {fontSelect} from "../../fonts.js"

import Animation from "../../Animation.js"

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

export default class TDVenlo extends Animation {
    static category = "Logos"
    static title = "TDvenlo"
    static description = ""


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const c=new PixelList()
        box.add(c)

        const font = fontSelect(controls)
        const text = new DrawText(18, 1, font, "venlo", controls.color("tekst"))

        const bbox = text.bbox()
        bbox.xMax += 20
        // new FxRotate(scheduler, controls).run(text, bbox)

        c.add(new DrawAsciiArtColor(0, 0, logo))
        // display.add(new DrawAsciiArtColor(display.width-17, 8, logo))

        // display.centerH(display.bbox())
        c.add(text)

        c.center(box)



    }
}
