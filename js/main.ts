import {DrawPixel} from "./DrawPixel.js";
import {MatrixCanvas} from "./MatrixCanvas.js";
import {Animation} from "./Animation.js";
import {Matrix} from "./Matrix.js";
import {DrawContainer} from "./DrawContainer.js";



class AnimationTest extends Animation
{
  setup(matrix: Matrix)
  {
    // for ( let i=0; i<300; i++)
    //   matrix.addPixel(new Pixel(Math.round(Math.random()*37),Math.round(Math.random()*8),0,0,0, 1));
    this.addPixel(new DrawPixel(0,0,255,255,255,255));
    this.addPixel(new DrawPixel(36,7,255,0,0,255));
    matrix.interval(this, 60);

  }

  loop(matrix:Matrix, frameNr)
  {
    console.log("ches", this);
    let p=this.pixels[0];
    p.x++;
    // p.r=Math.random()*255;
    //
    // p.g=Math.random()*255;
    // p.b=Math.random()*255;
  }
}
let m=new MatrixCanvas(37,8, '#matrix', 5, 16);

m.addAnimation(new AnimationTest());

m.run();







