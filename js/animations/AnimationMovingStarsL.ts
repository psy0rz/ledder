import {Animation} from "../Animation.js";
import {PixelStar} from "./PixelStar.js";
import {random} from "../util.js";
import {AnimationMove} from "../AnimationMove.js";
import { ControlValue } from "../ControlValue.js";
import {ControlColor} from "../ControlColor.js";

export class AnimationMovingStarsL extends Animation {
    constructor(matrix ) {
        super(matrix);

        const step=new ControlValue(matrix,"Star step", 1, 1, 10, 0.1);
        const delay=new ControlValue(matrix,"Star delay", 6, 1, 10,0.1);
        const blinkDelay= new ControlValue(matrix, "Star blink", 1,1,10,0.1);
        const starColor = new ControlColor(matrix, "Star color" , 64,64,64);

        matrix.scheduler.interval(20, () => {


            //add new flying star at right side
            const star = new PixelStar(matrix, matrix.width + 2, random(0, matrix.height), starColor, blinkDelay);
            const mover = new AnimationMove(matrix, delay.value, -step.value, 0)
            mover.addPixel(star);

            //destroy star at left side
            matrix.scheduler.interval(delay.value * matrix.width / step.value + 10, () => {
                mover.destroy(true);
                return false;
            })

            //schedule creation of next star at random time
            return (random(10, 30));

        })

    }
}
