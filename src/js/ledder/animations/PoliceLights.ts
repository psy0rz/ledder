import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Pixel} from "../Pixel.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import FxBlinkAlpha from "../fx/FxBlinkAlpha.js";
import {fontSelect} from "../fonts.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";
import DrawText from "../draw/DrawText.js";
import {Col} from "framework7-svelte";
import FxBlink from "../fx/FxBlink.js";
import DrawBox from "../draw/DrawBox.js";
import {width} from "dom7";
import FxMovie from "../fx/FxMovie.js";
import FxPattern from "../fx/FxPattern.js";

export default class PoliceLights extends Animation {

    static title = "Police lights"
    static description = ""
    static presetDir = "Policelights"
    static category = "Signal lights"


    async run(matrix: Display, scheduler: Scheduler, controls: ControlGroup, overrideText1?:string, overrideText2?:string) {

        /////////////// text
        const font = fontSelect(controls)
        const textList=new PixelContainer()

        const colorText1 = controls.color("Text1 color", 255, 0, 0, 1);
        const inputText1 = controls.input('Text1', 'STOP', true)
        textList.add(new DrawText(0,0, font, overrideText1?overrideText1:inputText1.text, colorText1).center(matrix))
        textList.add(new PixelContainer()) //blank screen

        const colorText2 = controls.color("Text2 color", 255, 0, 0, 1);
        const inputText2 = controls.input('Text2', 'POLICE', true)

        textList.add(new DrawText(0, 0, font, overrideText2?overrideText2:inputText2.text, colorText2).center(matrix))
        textList.add(new PixelContainer()) //blank screen

        //fxmovie will display the 2 text-containers that are in the textList container:
        new FxPattern(scheduler, controls, 60).run(textList, matrix, [60,5,60,5])


        ///////////// the lamps

        //the controls
        const lightControls=controls.group("Lights")
        const widthControl = lightControls.value("Width", 10,1,matrix.width, 1,true)
        const colorLeft = lightControls.color("Left color", 255, 0, 0, 1)
        const colorRight = lightControls.color("Right color", 0, 0, 255, 1)
        const wait = lightControls.value('Wait', 0, 0, 120, 1)

        //draw them
        let lampLeft=new DrawBox(0,0,widthControl.value, matrix.height, colorLeft)
        let lampRight=new DrawBox(matrix.width-widthControl.value,0,widthControl.value, matrix.height, colorRight)

        //lamps on the background, so use a sepate container as a layer.
        //the texts above will be added to the matrix directly by FxMovie while running, so they will end up on top.
        let lampsLayer=new PixelContainer()
        matrix.add(lampsLayer)

        //call the blinker effect on the left and right lamps
        const blinker = new FxBlink(scheduler, lightControls, 6, 2, 3,true)
        while (1) {
            await blinker.run(lampLeft, lampsLayer)
            await scheduler.delay(wait.value)
            await blinker.run(lampRight, lampsLayer)
            await scheduler.delay(wait.value)
        }


    }

}
