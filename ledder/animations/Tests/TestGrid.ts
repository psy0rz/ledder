import PixelBox from "../../PixelBox.js"
import Pixel from "../../Pixel.js"
import FxBlink from "../../fx/FxBlink.js"
import PixelList from "../../PixelList.js"
import FxRotate from "../../fx/FxRotate.js"
import Scheduler from "../../Scheduler.js"
import Color from "../../Color.js"
import ControlGroup from "../../ControlGroup.js"
import Animation from "../../Animation.js"
import DrawBox from "../../draw/DrawBox.js"
import {colorBlue, colorGreen, colorRed, colorYellow} from "../../Colors.js"
import DrawRectangle from "../../draw/DrawRectangle.js"
import DrawText from "../../draw/DrawText.js"
import {fonts} from "../../fonts.js"
import BoxInterface from "../../BoxInterface.js"


export default class TestGrid extends Animation {

    static title = "Grid layout test"
    static description = "Usefull to verify the layout of a grid of displays."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        const controlDisplayWidth = controls.value('Display width', 32, 0, 512, 1, true)
        const controlDisplayHeight = controls.value('Display height', 8, 0, 512, 1, true)

        const xCount = ~~(box.width() / controlDisplayWidth.value)
        const yCount = ~~(box.height() / controlDisplayHeight.value)

        let colors = [colorRed, colorGreen, colorBlue]
        let colorNr = 0

        fonts.C64.load()

        //traverse displays
        for (let y = 0; y < yCount; y++)
            for (let x = 0; x < xCount; x++) {


                box.add(new DrawRectangle(
                    x * controlDisplayWidth.value,
                    y * controlDisplayHeight.value,
                    controlDisplayWidth.value,
                    controlDisplayHeight.value,
                    colors[colorNr]))
                colorNr = (colorNr + 1) % colors.length


                const txt=new DrawText(0,0, fonts.C64, `${x},${y}`, new Color(128,128,128))
                const centerRect:BoxInterface={
                    xMin: x * controlDisplayWidth.value,
                    yMin: y * controlDisplayHeight.value,
                    xMax: (x+1) * controlDisplayWidth.value -1,
                    yMax: (y+1) * controlDisplayHeight.value -1
                }
                txt.center( centerRect)
                box.add(txt)
            }
    }
}
