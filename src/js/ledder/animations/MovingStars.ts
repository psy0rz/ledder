import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import PixelStar from "./PixelStar.js";
import {random} from "../util.js";
import {AnimationMove} from "../AnimationMove.js";
import DrawAsciiArt from "../draw/DrawAsciiArt.js";
import {Pixel} from "../Pixel.js";
import {PixelContainer} from "../PixelContainer.js";
import FxMove from "../fx/FxMove.js";
import FxMovie from "../fx/FxMovie.js";
import FxRotate from "../fx/FxRotate.js";

export default class MovingStars extends Animation {

    static category = "Basic"
    static title = "Moving stars left"
    static description = "Used in nyancat :)"
    static presetDir = "Moving stars"

    createStar(x,y)
    {
        let star = new PixelContainer()
        star.add(new DrawAsciiArt(x, y, `
                    ...
                    .w.
                    ...
                `))

        star.add(new DrawAsciiArt(x, y, `
                    .w.
                    w.w
                    .w.
                `))

        star.add(new DrawAsciiArt(x, y, `
                    ...
                    ...
                    ...
                `))
        return (star)
    }

    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        // const intervalControl = controls.value("Star move interval", 3, 1, 30, 0.1);
        //const blinkDelayControl = controls.value("Star twinkle interval", 30, 1, 10, 0.1);
        // const starDensityControl = controls.value("Star density", 10, 1, 100, 1)
        // const starColorControl = controls.color("Star color", 128, 128, 128);

        for (let i=0; i<10; i++) {

            const x = random(0, matrix.xMax)
            const y = random(0, matrix.yMax)
            const star=this.createStar(x,y)
            new FxMovie(scheduler, controls, 30).run(star, matrix)
            new FxRotate(scheduler, controls, -1,0).run(star, matrix)

        }


    }
}
