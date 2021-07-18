import {Animation} from "../Animation.js";
import {PixelStar} from "./PixelStar.js";
import {random} from "../util.js";
import {AnimationMove} from "../AnimationMove.js";
import { ControlValue } from "../ControlValue.js";
import {ControlColor} from "../ControlColor.js";

export class AnimationMovingStarsL extends Animation {

    static category="Fun"
    static title="Moving stars left"
    static description="Used in nyancat :)"
    static presetDir="Moving stars"


    constructor(matrix ) {
        super(matrix);

        const step=matrix.preset.value("Star speed", 0.3, 0.1, 2, 0.1);
        const blinkDelay= matrix.preset.value("Star twinkle delay", 5.8,1,10,0.1);
        const starColor = matrix.preset.color("Star color" , 255,255,255);

        matrix.scheduler.interval(20, () => {


            //add new flying star at right side
            const star = new PixelStar(matrix, matrix.width + 2, random(0, matrix.height), starColor, blinkDelay);
            const mover = new AnimationMove(matrix, 1, -step.value, 0)
            mover.addPixel(star);

            //destroy star at left side
            matrix.scheduler.interval((matrix.width+2)/step.value, () => {
                mover.destroy(true);
                return false;
            })

            //schedule creation of next star at random time
            return (random(10, 30));

        })

    }
}
