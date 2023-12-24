import PixelBox from "../../PixelBox.js"
import Pixel from "../../Pixel.js"
import FxBlink from "../../fx/FxBlink.js"
import PixelList from "../../PixelList.js"
import FxRotate from "../../fx/FxRotate.js"
import Scheduler from "../../Scheduler.js"
import Color from "../../Color.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import DrawBox from "../../draw/DrawBox.js"
import {colorBlue, colorGreen, colorRed, colorYellow} from "../../Colors.js"
import DrawRectangle from "../../draw/DrawRectangle.js"
import DrawText from "../../draw/DrawText.js"
import {fonts} from "../../fonts.js"
import BoxInterface from "../../BoxInterface.js"
import FxBlinkAlpha from "../../fx/FxBlinkAlpha.js"


export default class TestGrid extends Animator {

    static title = "Grid layout test"
    static description = "Usefull to verify the layout of a grid of displays."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        const controlDisplayWidth = controls.value('Display width', 32, 0, 512, 1, true)
        const controlDisplayHeight = controls.value('Display height', 8, 0, 512, 1, true)

        const xCount = ~~(box.width() / controlDisplayWidth.value)
        const yCount = ~~(box.height() / controlDisplayHeight.value)

        let colors = [colorRed, colorGreen, colorBlue]
        let colorNr = 0

        fonts["Pixel-Gosub"].load()

        const blinker=new FxBlink(scheduler, controls, 15,15)

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


                // const txt=new DrawText(0,0, fonts.C64, `${x},${y}`, new Color(128,128,128))
                const txt=new DrawText(x * controlDisplayWidth.value,y * controlDisplayHeight.value, fonts["Pixel-Gosub"], `${x}${y}`, new Color(128,128,128))
                // const centerRect:BoxInterface={
                //     xMin: x * controlDisplayWidth.value,
                //     yMin: y * controlDisplayHeight.value,
                //     xMax: (x+1) * controlDisplayWidth.value -1,
                //     yMax: (y+1) * controlDisplayHeight.value -1
                // }
                // txt.center( centerRect)
                box.add(txt)

                blinker.run( new Pixel(x * controlDisplayWidth.value, y * controlDisplayHeight.value, colorYellow), box)



            }
    }
}
