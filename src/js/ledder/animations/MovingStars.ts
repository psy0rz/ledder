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

export default class MovingStars extends Animation {

    static category = "Basic"
    static title = "Moving stars left"
    static description = "Used in nyancat :)"
    static presetDir = "Moving stars"

    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        // const intervalControl = controls.value("Star move interval", 3, 1, 30, 0.1);
        const blinkDelayControl = controls.value("Star twinkle interval", 30, 1, 10, 0.1);
        // const starDensityControl = controls.value("Star density", 10, 1, 100, 1)
        // const starColorControl = controls.color("Star color", 128, 128, 128);

//        let mover=new FxMove(scheduler, controls, -1,0)

        // for (let i=0; i<10; i++) {
        let frames = new PixelContainer()
        //
        //     const x=random(0, matrix.xMax)
        //     const y=random(0,matrix.yMax)
        const x = 3
        const y = 3

        frames.add(new DrawAsciiArt(x, y, `
                    ...
                    .w.
                    ...
                `))

        frames.add(new DrawAsciiArt(x, y, `
                    .w.
                    w.w
                    .w.
                `))

        frames.add(new DrawAsciiArt(x, y, `
                    ...
                    ...
                    ...
                `))

        // mover.run(frames)
        console.log(frames.dump())

        let movie = new FxMovie(scheduler, controls, 30)
        movie.run(frames, matrix)


        // let step=0;
        // scheduler.intervalControlled(blinkDelayControl, () => {
        //
        //     stars.delete(steps[step])
        //     step=(step+1)%steps.length
        //     stars.add(steps[step])


        // //add new flying star at right side
        // const star = new PixelStar(matrix, matrix.width + 2, random(0, matrix.height), starColorControl, blinkDelayControl, true);
        // const mover = new AnimationMove(matrix, intervalControl, {value: -1}, {value: 0})
        // mover.addPixel(star);
        //
        // //destroy star at left side
        // matrix.scheduler.interval((matrix.width + 2) * intervalControl.value, () => {
        //     mover.destroy(true);
        //     star.destroy(matrix)
        //     return false;
        // })
        //
        // //schedule creation of next star at random time
        // return (random(intervalControl.value, (100 * intervalControl.value) / starDensityControl.value));
        // // return(1);
        // //
        // })

    }
}
