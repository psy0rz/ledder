import {Animation} from "./Animation.js";
import {Matrix} from "./Matrix.js";
import {AnimationBlink} from "./AnimationBlink.js";
import {DrawPixel} from "./DrawPixel.js";
import { random } from "./util.js";



export class AnimationTest extends Animation {
    setup(matrix: Matrix) {
        for (let i = 0; i < 600; i++) {
            // let blink=new AnimationBlink(matrix, random(30,60), random(30,60));
            let blink = new AnimationBlink(matrix, 120, 120, random(-60, 0));
            blink.addPixel(new DrawPixel(random(0, 36), random(0, 7), random(0, 0), random(0, 255), random(0, 255)));

        }


        // for ( let i=0; i<300; i++)
        //   matrix.addPixel(new Pixel(Math.round(Math.random()*37),Math.round(Math.random()*8),0,0,0, 1));
        // let blink=new AnimationBlink(matrix, 60,60);
        // this.addPixel(new DrawPixel(36,7,255,0,0,255));
        // matrix.interval(this, 60);

    }

    loop(matrix: Matrix, frameNr) {
        let p = this.pixels[0];
        p.x++;
        // p.r=Math.random()*255;
        //
        // p.g=Math.random()*255;
        // p.b=Math.random()*255;
    }
}
