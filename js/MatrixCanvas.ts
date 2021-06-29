import {Matrix} from "./Matrix.js";

export class MatrixCanvas extends Matrix {
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  // imageData: ImageData;
  // imageBuf8: Uint8ClampedArray;

  ledSize: number;
  ledSpacing: number;

  //width and height are led-matrix-pixels, not canvas pixels.
  constructor(width, height, elementId, ledSize, ledSpacing) {
    super(width, height);

    this.ledSize=ledSize;
    this.ledSpacing=ledSpacing;

    this.canvas=document.querySelector(elementId);
    this.canvasContext = this.canvas.getContext('2d');

    // this.imageData = this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
    // let imageBuf = new ArrayBuffer(this.imageData.data.length);
    // this.imageBuf8 = new Uint8ClampedArray(imageBuf);

    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0,0, this.canvas.width, this.canvas.height);

  }

  render()
  {
    for (let i=0, n=this.pixels.length; i<n; ++i)
    {
      const p=this.pixels[i];

      this.canvasContext.fillStyle='rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
      let x=p.x*this.ledSpacing;
      let y=p.y*this.ledSpacing;
      this.canvasContext.fillRect(x,y, this.ledSize, this.ledSize);
    }
  }
}
