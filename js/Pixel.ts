export class Pixel
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
}

