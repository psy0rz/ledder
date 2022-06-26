import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {random} from "../util.js";
import DrawAsciiArt from "../draw/DrawAsciiArt.js";
import {PixelContainer} from "../PixelContainer.js";
import FxMovie from "../fx/FxMovie.js";
import FxRotate from "../fx/FxRotate.js";
import {Pixel} from "../Pixel.js";


let starAscii=[`
        ...
        .w.
        ...
    `,`
        .w.
        w.w
        .w.
    `,`
        .w.
        ...
        .w.
`]

export default class MovingStars extends Animation {

    static category = "Basic"
    static title = "Moving stars left"
    static description = "Used in nyancat :)"
    static presetDir = "Moving stars"

    createStar(x,y, c)
    {
        let star = new PixelContainer()
        for (const ascii of starAscii)
            star.add(new DrawAsciiArt(x, y, c,ascii))
        return (star)
    }

    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        const starColorControl = controls.color("Star color", 255, 255, 255, 0.001);

        const stars=new PixelContainer()
        matrix.add(stars)

        const starsControl = controls.value("Number of stars", 10, 1, 100, 1, true)
        for (let i=0; i<starsControl.value; i++) {

            const x = random(0, matrix.xMax)
            const y = random(0, matrix.yMax)

            const star=this.createStar(x,y, starColorControl)

            new FxMovie(scheduler, controls, 5).run(star, stars, random(0,2))
            new FxRotate(scheduler, controls, -1,0, 4,2).run(star, matrix)

        }
    }
}
