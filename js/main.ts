import {Pixel} from "./Pixel.js";
import {MatrixCanvas} from "./MatrixCanvas.js";
import {Animation} from "./Animation.js";


class AnimationTest extends Animation
{
  setup(matrix)
  {
    for ( let i=0; i<300; i++)
      matrix.addPixel(new Pixel(Math.random()*37,Math.random()*8,255,0,0, 1));

  }

  loop(matrix, frameNr)
  {
    let p=matrix.pixels[frameNr%300];
    p.x++;
    p.r=Math.random()*255;
    p.g=Math.random()*255;
    p.b=Math.random()*255;


  }
}
let m=new MatrixCanvas(37,8, '#matrix', 5, 16);

m.run(new AnimationTest());







