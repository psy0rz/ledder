import Animation from "../Animation.js"
import Display from "../Display.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import DrawAsciiArtColor from "../draw/DrawAsciiArtColor.js"
import DrawText from "../draw/DrawText.js"
import {fontSelect} from "../fonts.js"
import PixelBox from "../PixelBox.js"


// const logo=`
// .......y...
// ......yyy..
// .....yy.yy
// ....yy...yy
// ...yy..y..yy
// ..yy.......yy
// .yyyyyyyyyyyyy
// yyyyyyyyyyyyyyy
//
// `
// const logo=`
// .......y...
// ......y.y..
// .....y.wwy
// ....yw.w..y
// ...y..www..y
// ..y...ww.w..y.
// .y....w.w....y
// yyyyyyyyyyyyyyy
// `
const logo=`
.......y...
......y.y..
.....yww.y
....y.ww..y
...y...wwwwy
..y....www..y.
.y.....w.w...y
yyyyyyyyyyyyyyy
`



export default class TkkrLab extends Animation {
    static category = "Logos"
    static title = "TkkrLab"
    static description = ""


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const font = fontSelect(controls)
        const text = new DrawText(13, 0, font, "TkkrLab", controls.color("tekst"))
        box.add(text)

        const bbox = text.bbox()
        bbox.xMax += 20
        // new FxRotate(scheduler, controls).run(text, bbox)

        box.add(new DrawAsciiArtColor(0, 8, logo))
        // display.add(new DrawAsciiArtColor(display.width-15, 8, logo))

        box.center(box)

    }
}
