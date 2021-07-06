import {Animation} from "./Animation.js";
import {Matrix} from "./Matrix.js";
import {AnimationMovingStarsL} from "./AnimationMovingStarsL.js";
import {AnimationMove} from "./AnimationMove.js";
import {Pixel} from "./Pixel.js";
import {AnimationBlink} from "./AnimationBlink.js";
import {random} from "./util.js";


export class AnimationTest extends Animation {
  constructor(matrix: Matrix) {
    super(matrix);

    // new AnimationMovingStarsL(matrix, 1,2);

    const p=new Pixel(matrix, matrix.width,3,255,0,0);
    new AnimationMove(matrix, 4,-1,0).addPixel(p);
    new AnimationBlink(matrix, 10,10).addPixel(p);

    matrix.scheduler.interval(120, ()=>{
      p.x=matrix.width;
    });

    // let p1=new Pixel(0,5,255,255,0,1);
    // let p2=new Pixel(0,4,255,0,0,1);
    // let p3=new Pixel(0,3,0,255,0,1);
    //
    // new AnimationBlink(matrix, 50,50).addPixel(p1);
    // new AnimationBlink(matrix, 50,10).addPixel(p2);
    //
    // matrix.addPixel(p1);
    // matrix.addPixel(p2);
    // matrix.addPixel(p3);

    for (let i = 0; i < 100; i++) {
        let p=new Pixel(matrix,random(0, 36), random(0, 7), random(0, 255), random(0, 255), random(0, 255))
        //new AnimationBlink(matrix, random(0,60), random(0,60), random(-60, 0)).addPixel(p);
        new AnimationMove(matrix, 5,0,1).addPixel(p);
        matrix.scheduler.interval(random(0,50),()=>{
          p.x=random(0,36);
          p.y=random(0,7);
        })


    }

    //pendulum wave
    // for (let i = 0; i < 37; i++) {
    //   let p=new Pixel(matrix,i,0,255,255,255);
    //   new AnimationBlink(matrix, 30+i,30+i).addPixel(p);
    //
    // }
    ``

    // matrix.scheduler.interval(10,()=>{
    //   p1.x=(p1.x+1)%matrix.width;
    //
    // });
    // matrix.scheduler.interval(1,(time)=>{
    //   p2.x=(p2.x+1)%matrix.width;
    //
    // });

    // matrix.scheduler.interval(10.2,()=>{
    //   p3.x=(p3.x+1)%matrix.width;
    //   // console.log("ches", this);
    //
    // });

    // for ( let i=0; i<300; i++)
    //   matrix.addPixel(new Pixel(Math.round(Math.random()*37),Math.round(Math.random()*8),0,0,0, 1));
    // let blink=new AnimationBlink(matrix, 60,60);
    // this.addPixel(new DrawPixel(36,7,255,0,0,255));
    // matrix.interval(this, 60);

  }

}
