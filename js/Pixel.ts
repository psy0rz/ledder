import {Matrix} from "./Matrix.js";

export class Pixel {
    x: number;
    y: number;

    r: number;
    g: number;
    b: number;
    a: number;


    constructor(matrix, x: number, y: number, r: number = 255, g: number = 255, b: number = 255, a = 1) {
        this.x = x;
        this.y = y;

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        matrix.addPixel(this);
    }

    render(matrix: Matrix) {
        matrix.setPixel(this.x, this.y, this.r, this.g, this.b, this.a);
    }
}

export class PixelStar extends Pixel {
  constructor(matrix, x: number, y: number, r: number = 255, g: number = 255, b: number = 255, a = 1) {
    super(matrix,x,y,r,g,b,a);

    
  }

  render(matrix)
  {
    matrix.setPixel(this.x, this.y, this.r, this.g, this.b, this.a);

    matrix.setPixel(this.x-1, this.y, this.r, this.g, this.b, this.a);
    matrix.setPixel(this.x+1, this.y, this.r, this.g, this.b, this.a);

    matrix.setPixel(this.x, this.y-1, this.r, this.g, this.b, this.a);
    matrix.setPixel(this.x, this.y+1, this.r, this.g, this.b, this.a);

  }
}
