import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import PixelStar from "./PixelStar.js";
import {random} from "../util.js";
import {AnimationMove} from "../AnimationMove.js";
import DrawAsciiArt from "../draw/DrawAsciiArt.js";

export default class MovingStars extends Animation {

    static category = "Basic"
    static title = "Moving stars left"
    static description = "Used in nyancat :)"
    static presetDir = "Moving stars"



    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        const steps=[
            new DrawAsciiArt(matrix, 5,5,`
                ...
                .w.
                w..
            `),
            new DrawAsciiArt(matrix, 5,5,`
                .w.
                www
                .w.
            `),
            new DrawAsciiArt(matrix, 5,5,`
                .w.
                w.w
                .w.
            `),
        ]


        // const intervalControl = controls.value("Star move interval", 3, 1, 30, 0.1);
        // const blinkDelayControl = controls.value("Star twinkle interval", 5.8, 1, 10, 0.1);
        // const starDensityControl = controls.value("Star density", 10, 1, 100, 1)
        // const starColorControl = controls.color("Star color", 128, 128, 128);

        let step=0;
        matrix.scheduler.interval(20, () => {

            matrix.remove(steps[step])
            step=(step+1)%steps.length
            matrix.add(steps[step])

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
        })

    }
}
