import {DrawPixel} from "./DrawPixel.js";
import {MatrixCanvas} from "./MatrixCanvas.js";
import {Animation} from "./Animation.js";
import {Matrix} from "./Matrix.js";
import {DrawContainer} from "./DrawContainer.js";

class AnimationBlink extends Animation
{
  onInterval: number;
  offInterval: number;
  on: boolean;

  constructor(matrix, onInterval, offInterval) {
    super();

    this.onInterval=onInterval;
    this.offInterval=offInterval;
    this.on=true;

    matrix.addAnimation(this);
    matrix.interval(this, onInterval);
  }

  loop(matrix, frameNr)
  {
    let alpha;
    if (this.on) {
      this.on=false;
      alpha = 0;
      matrix.interval(this, this.offInterval);
    }
    else {
      this.on=true;
      alpha = 255;
      matrix.interval(this, this.onInterval);
    }

    for (let i = 0, n = this.pixels.length; i < n; ++i) {
      const p = this.pixels[i];
      p.a = alpha;
    }

  }
}


class AnimationTest extends Animation
{
  setup(matrix: Matrix)
  {
    // for ( let i=0; i<300; i++)
    //   matrix.addPixel(new Pixel(Math.round(Math.random()*37),Math.round(Math.random()*8),0,0,0, 1));
    // let blink=new AnimationBlink(matrix, 60,60);
    blink.addPixel(new DrawPixel(0,0,255,255,255,255));
    // this.addPixel(new DrawPixel(36,7,255,0,0,255));
    // matrix.interval(this, 60);

  }

  loop(matrix:Matrix, frameNr)
  {
    let p=this.pixels[0];
    p.x++;
    // p.r=Math.random()*255;
    //
    // p.g=Math.random()*255;
    // p.b=Math.random()*255;
  }
}
let matrix=new MatrixCanvas(37,8, '#matrix', 5, 16);

let blink=new AnimationBlink(matrix, 5,5);
blink.addPixel(new DrawPixel(0,0,255,255,255,255));

let blink2=new AnimationBlink(matrix, 60, 60);
blink2.addPixel(new DrawPixel(0,0,255,0,0,0));

// matrix.addAnimation(new AnimationTest());

matrix.run();







