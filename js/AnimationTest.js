import { Animation } from "./Animation.js";
import { Pixel } from "./Pixel.js";
export class AnimationTest extends Animation {
    constructor(matrix) {
        super(matrix);
        let p = new Pixel(0, 5, 255, 255, 0, 1);
        matrix.addPixel(p);
        // for (let i = 0; i < 600; i++) {
        //     // let blink=new AnimationBlink(matrix, random(30,60), random(30,60));
        //     let blink = new AnimationBlink(matrix, 60, 60, random(-60, 0));
        //     blink.addPixel(new DrawPixel(random(0, 36), random(0, 7), random(0, 255), random(0, 255), random(0, 255)));
        //
        // }
        matrix.scheduler.interval(1, () => {
            p.x = (p.x + 1) % matrix.width;
            // console.log("ches", this);
        });
        // for ( let i=0; i<300; i++)
        //   matrix.addPixel(new Pixel(Math.round(Math.random()*37),Math.round(Math.random()*8),0,0,0, 1));
        // let blink=new AnimationBlink(matrix, 60,60);
        // this.addPixel(new DrawPixel(36,7,255,0,0,255));
        // matrix.interval(this, 60);
    }
}
//# sourceMappingURL=AnimationTest.js.map