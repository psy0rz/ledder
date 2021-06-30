import {Matrix} from "./Matrix.js";
import {Animation} from "./Animation.js";

//Matrix driver for Canvas in webbrowser
export class MatrixCanvas extends Matrix {
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  imageData: ImageData;
  imageBuf8: Uint8ClampedArray;
  imageBuf: ArrayBuffer;

  ledSize: number;
  ledSpacing: number;




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

  //sets a pixel in the render buffer (called from Draw-classes render() functions)
  setPixel(x,y, r,g,b,a)
  {
    const offset=x * 4 + (this.height - y - 1) * 4 * this.width;
    const old_a=1-a;

    this.imageBuf8[offset]=Math.floor(this.imageBuf8[offset]*old_a + r*a);
    this.imageBuf8[offset+1]=Math.floor(this.imageBuf8[offset+1]*old_a + g*a);
    this.imageBuf8[offset+2]=Math.floor(this.imageBuf8[offset+2]*old_a + b*a);
  }


  render()
  {
    this.imageBuf8.fill(255);

    for (let i=0, n=this.animations.length; i<n; ++i)
    {
      const a=this.animations[i];
      a.render(this);
    }

    this.imageData.data.set(this.imageBuf8);

    //this step is the most resource intensive by far:
    this.canvasContext.putImageData(this.imageData,0,0);

    let self=this;
    window.requestAnimationFrame(function() { self.loop() });

  }





  run()
  {
    this.frameNr=0;
    this.loop();
  }


}
