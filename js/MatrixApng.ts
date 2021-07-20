import {Matrix} from "./Matrix.js";

import pkg from 'upng-js';

const  UPNG  = pkg;

//Matrix driver to render animations to a APNG format. (used for browser previewing)
export class MatrixApng extends Matrix {

  imageBuf8: Uint8ClampedArray
  filename: string
  frames: number

  constructor(scheduler, width, height, frames ) {
    super(scheduler, width, height);

    this.frames=frames;

  }


  //sets a pixel in the render buffer (called from Draw-classes render() functions)
  setPixel(x,y, color)
  {
    if (x>=0 && x<this.width && y>=0 && y<this.height) {

      const offset = ~~x * 4 + (this.height - ~~y - 1) * 4 * this.width;
      const old_a = 1 - color.a;

      this.imageBuf8[offset] = ~~(this.imageBuf8[offset] * old_a + color.r * color.a);
      this.imageBuf8[offset + 1] = ~~(this.imageBuf8[offset + 1] * old_a + color.g * color.a);
      this.imageBuf8[offset + 2] = ~~(this.imageBuf8[offset + 2] * old_a + color.b * color.a);
      this.imageBuf8[offset + 3] = 255; //alpha of canvas itself
    }
  }


  /**
   * Renders the requested nubmer of frames as quickly as possible and returns APNG filedata
   */
  run()
  {
    let imgs=[]
    let dels=[]

    for (let i=0; i<this.frames; i++) {
      this.scheduler.update();

      //render
      // this.imageBuf8 = new Uint8ClampedArray(this.width * this.height * 4);
      this.imageBuf8 = new Uint8ClampedArray(this.width * this.height * 4);
      this.imageBuf8.fill(0); //alpha of all pixels will be 0, so image is transparent
      this.render();

      //add to image list
      imgs.push(this.imageBuf8.buffer)
      dels.push(1000/60)
    }

    return(UPNG.encode(imgs, this.width, this.height, 0, dels))

  }


}


