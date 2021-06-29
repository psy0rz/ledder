import {Matrix} from "./Matrix.js";
import {Animation} from "./Animation.js";

export class MatrixCanvas extends Matrix {
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  imageData: ImageData;
  imageBuf8: Uint8ClampedArray;
  imageBuf: ArrayBuffer;

  ledSize: number;
  ledSpacing: number;

  animation: Animation;
  frameNr: number;

  //width and height are led-matrix-pixels, not canvas pixels.
  constructor(width, height, elementId, ledSize, ledSpacing) {
    super(width, height);

    this.ledSize=ledSize;
    this.ledSpacing=ledSpacing;

    this.canvas=document.querySelector(elementId);

    //scaling
    this.canvas.width=width;
    this.canvas.height=height;
    this.canvas.style.width="80%";

    //context and buffer
    this.canvasContext = this.canvas.getContext('2d');
    this.imageData = this.canvasContext.getImageData(0, 0, width, height);

    this.imageBuf = new ArrayBuffer(this.imageData.data.length);
    this.imageBuf8 = new Uint8ClampedArray(this.imageBuf);



  }


  render()
  {
    this.imageBuf8.fill(0);

    for (let i=0, n=this.pixels.length; i<n; ++i)
    {
      const p=this.pixels[i];

      const offset=p.x*4 + p.y*4*this.canvas.width;
      this.imageBuf8[offset]=p.r;
      this.imageBuf8[offset+1]=p.g;
      this.imageBuf8[offset+2]=p.b;
      this.imageBuf8[offset+3]=255;



      // this.canvasContext.fillStyle='rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
      // let x=p.x*this.ledSpacing;
      // let y=p.y*this.ledSpacing;
      // this.canvasContext.fillRect(x,y, this.ledSize, this.ledSize);
    }

    // for (let k=0; k<this.imageBuf8.length; k++)
    // {
    //   this.imageBuf8[k]=100;
    // }


      this.imageData.data.set(this.imageBuf8);
    this.canvasContext.putImageData(this.imageData,0,0);

  }

  loop()
  {
    this.frameNr++;
    this.animation.loop(this, this.frameNr);
    this.render();
    let self=this;
    window.requestAnimationFrame(function() { self.loop() });

  }

  run(animation: Animation)
  {
    this.frameNr=0;
    this.animation=animation;
    animation.setup(this);
    this.loop();
  }
}
