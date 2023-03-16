import PixelBox from "../../PixelBox.js"
import PixelList from "../../PixelList.js"
import DrawText from "../../draw/DrawText.js"
import FxPattern from "../../fx/FxPattern.js"
import DrawBox from "../../draw/DrawBox.js"
import FxBlink from "../../fx/FxBlink.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {fontSelect} from "../../fonts.js"
import Animator from "../../Animator.js"
import Font from "../../Font.js"
import Starfield from "../Components/Starfield.js"


export default class Stijn extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        new Starfield().run(box, scheduler,controls)


        /////////////// text
        const textList = new PixelList()

        const font1 = fontSelect(controls, 'Font1', 'C64', 8)
        const colorText1 = controls.color("Text1 color", 255, 128, 128, 1)
        const inputText1 = controls.input('Text1', 'APK', true)

        const font2 = fontSelect(controls, 'Font2', 'C64')
        const colorText2 = controls.color("Text2 color", 128, 128, 255, 1)
        const inputText2A = controls.input('Text2', 'ZONDER', true)
        const inputText2B = controls.input('Text3', 'AFSPRAAK', true)

        ///////////// the lamps

        //the controls
        const lightControls = controls.group("Lights")
        const widthControl = lightControls.value("Width", 10, 1, box.width(), 1, true)
        const colorLeft = lightControls.color("Left color", 255, 128, 128, 1)
        const colorRight = lightControls.color("Right color", 128, 128, 255, 1)
        const wait = lightControls.value('Wait', 0, 0, 120, 1)

        //draw them
        let lampLeft = new DrawBox(0, 0, widthControl.value, box.height(), colorLeft)
        let lampRight = new DrawBox(box.width() - widthControl.value, 0, widthControl.value, box.height(), colorRight)

        //lamps on the background, so use a sepate container as a layer.
        //the texts above will be added to the display directly by FxMovie while running, so they will end up on top.
        let lampsLayer = new PixelList()
        box.add(lampsLayer)

        const text1 = new DrawText(0, -1, font1, inputText1.text, colorText1).centerH(box)
        const text2 = new DrawText(0, 15, font2, inputText2A.text, colorText2).centerH(box)
        text2.add(new DrawText(0, 15 + 8, font2, inputText2B.text, colorText2).centerH(box))

        //call the blinker effect on the left and right lamps
        const blinker = new FxBlink(scheduler, lightControls, 6, 2, 3, true)
        while (1) {
            blinker.run(text1, lampsLayer)
            await blinker.run(lampLeft, lampsLayer)
            lampsLayer.add(text1)

            await scheduler.delay(wait.value)

            blinker.run(text2, lampsLayer)
            await blinker.run(lampRight, lampsLayer)
            lampsLayer.add(text2)

            await scheduler.delay(wait.value)
        }


    }

}
