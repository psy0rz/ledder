import {Matrix} from "./Matrix.js";

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
  constructor(scheduler, width, height, elementId, ledSize, ledSpacing) {
    super(scheduler, width, height);

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
  setPixel(x,y, color)
  {
    if (x>=0 && x<this.width && y>=0 && y<this.height) {

      const offset = x * 4 + (this.height - y - 1) * 4 * this.width;
      const old_a = 1 - color.a;

      this.imageBuf8[offset] = Math.floor(this.imageBuf8[offset] * old_a + color.r * color.a);
      this.imageBuf8[offset + 1] = Math.floor(this.imageBuf8[offset + 1] * old_a + color.g * color.a);
      this.imageBuf8[offset + 2] = Math.floor(this.imageBuf8[offset + 2] * old_a + color.b * color.a);
      this.imageBuf8[offset + 3] = 255; //alpha of canvas itself
    }
  }


  frame()
  {


    if (this.runScheduler)
      this.scheduler.update();

    this.imageBuf8.fill(0); //alpha of all pixels will be 0, so canvas is transparent.
    this.render();

    //this step is the most resource intensive by far:
    this.imageData.data.set(this.imageBuf8);
    this.canvasContext.putImageData(this.imageData,0,0);

    window.requestAnimationFrame(() =>{ this.frame() });

  }





  run()
  {
    this.frame();
  }


}
