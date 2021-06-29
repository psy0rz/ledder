import {Matrix} from "./Matrix.js";

export class DrawPixel
{
  x:number;
  y:number;

  r:number;
  g:number;
  b:number;
  a:number;


  constructor(x: number, y:number, r:number=255, g:number=255, b:number=255, a=0) {
    this.x=x;
    this.y=y;

    this.r=r;
    this.g=g;
    this.b=b;
    this.a=a;
  }

  render(matrix: Matrix)
  {
    matrix.setPixel(this.x, this.y, this.r, this.g, this.b, this.a);
  }
}

