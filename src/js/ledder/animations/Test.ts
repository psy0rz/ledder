import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import FxColorCycle from "../fx/FxColorCycle.js";
import {random} from "../util.js";
import {Color} from "../Color.js";
import {Pixel} from "../Pixel.js";
import DrawBox from "../draw/DrawBox.js";
import DrawText from "../draw/DrawText.js";
import {fonts, fontSelect} from "../fonts.js";
import FxMovie from "../fx/FxMovie.js";
import FxMove from "../fx/FxMove.js";
import {PixelContainer} from "../PixelContainer.js";
import {fireColors} from "../ColorPatterns.js";
import FxFlameout from "../fx/FxFlameout.js";
import FxRotate from "../fx/FxRotate.js";
import FxFlames from "../fx/FxFlames.js";


export default class Test extends Animation {

    static title = "Test stuff"
    static description = ""
    static presetDir = "test"
    static category = "test"

    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {


        const text = new DrawText(0, 0, fontSelect(controls), "Qunix.nl", new Color(0, 0, 255))
        matrix.add(text)
        new FxRotate(scheduler, controls,-1,0,2).run(text, matrix)

        const flames=new PixelContainer()
        matrix.add(flames)
        new FxFlames(scheduler,controls).run(text, flames)

    }
}
