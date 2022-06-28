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
import PoliceLights from "./PoliceLights.js";
import Nyancat from "./Nyancat.js";
import {PresetStore} from "../../server/PresetStore.js";




export default class Test extends Animation {

    static title = "Test stuff"
    static description = ""
    static presetDir = "test"
    static category = "test"

    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {


        // const colorControl=controls.color("c",0,0,255)
        // const text = new DrawText(0, 0, fontSelect(controls), "BTC $20.000", colorControl)
        // matrix.add(text)
        //
        // const flames=new PixelContainer()
        // matrix.add(flames)
        // new FxFlames(scheduler,controls).run(text, flames)
        // new FxRotate(scheduler, controls.group("marquee"),0,0,2).run(text, matrix)

        const c=new ControlGroup()

        const store=new PresetStore()

        // while (1) {
            const preset=await store.load(PoliceLights, "Dutch")

            controls.group("Police").load(preset.values)
            new PoliceLights().run(matrix, scheduler, controls)
            // await scheduler.delay(120)
            // scheduler.clear()
            // await new FxFlameout(scheduler,c).run(matrix)
            // matrix.clear()
            //
            // new Nyancat().run(matrix, scheduler, c)
            // await scheduler.delay(60)
            // scheduler.clear()
            // matrix.clear()
        }


    }
}
