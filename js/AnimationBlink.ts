//blink led by using the alpha value.
import {Animation} from "./Animation.js";
import {Matrix} from "./Matrix.js";

export class AnimationBlink extends Animation {
    onInterval: number;
    offInterval: number;
    alpha: number;

    //use offset to "offset" the first time, so that the animation isnt in sync with other animations.
    constructor(matrix:Matrix, onInterval:number, offInterval:number, offset=0) {
        super();

        this.onInterval = onInterval;
        this.offInterval = offInterval;
        this.alpha = 1;

        matrix.addAnimation(this);
        matrix.interval(this, onInterval+offset);
    }

    loop(matrix, frameNr) {
        if (this.alpha) {
            this.alpha = 0;
            matrix.interval(this, this.offInterval);
        } else {
            this.alpha = 1;
            matrix.interval(this, this.onInterval);
        }

        for (let i = 0, n = this.pixels.length; i < n; ++i) {
            const p = this.pixels[i];
            p.a = this.alpha;
        }

    }
}
