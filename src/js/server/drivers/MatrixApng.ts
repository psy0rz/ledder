import {Matrix} from "../../ledder/Matrix.js";
import pkg from 'upng-js';

const UPNG = pkg;

//Matrix driver to render animations to a APNG format. (used for browser previewing)
export class MatrixApng extends Matrix {

  imageBuf8: Uint8ClampedArray
  filename: string

  /**
   *
   * @param scheduler
   * @param width
   * @param height
   * @param framesSkip Number of initial frames to skip
   * @param frameDivider Divide FPS by this. Lower frame rate, but smaller preview images
   * @param frames Number of ouput frames to generate.
   */
  constructor(scheduler, width, height) {
    super(scheduler, width, height);


  }


  //sets a pixel in the render buffer (called from Draw-classes render() functions)
  setPixel(x, y, color) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {

      const offset = ~~x * 4 + (this.height - ~~y - 1) * 4 * this.width;
      const old_a = 1 - color.a;

      this.imageBuf8[offset] = (this.imageBuf8[offset] * old_a + color.r * color.a);
      this.imageBuf8[offset + 1] = (this.imageBuf8[offset + 1] * old_a + color.g * color.a);
      this.imageBuf8[offset + 2] = (this.imageBuf8[offset + 2] * old_a + color.b * color.a);
      this.imageBuf8[offset + 3] = 255; //alpha of canvas itself
    }
  }


  /**
   * Renders the requested nubmer of frames as quickly as possible and returns APNG filedata
   * NOTE: async to give eventloop opertunity to handle promises.
   */
  async get(animationClass: Animation) {
    let imgs = []
    let dels = []

    //0-60 -> blijft gelijk
    //61-120 -> skip=1, fps=fps/2
    //121-   -> skip=2, fps=fps/3  (dus 40 fps
    //       -> skip=~~((fps-1)/60), newfps=fps/(skip+1)

    //previews shouldnt have a higher than 60fps rate, so just divide more frames above 60fps
    // @ts-ignore
    const divider = ~~((this.fpsControl.value - 1) / 60) + animationClass.previewDivider
    const fps = ~~(this.fpsControl.value / divider )


    //skip frames, just run scheduler
    // @ts-ignore
    for (let i = 0; i < animationClass.previewSkip; i++)
      await this.scheduler.update();

    // @ts-ignore
    for (let i = 0; i < animationClass.previewFrames; i++) {

      // @ts-ignore
      for (let d = 0; d < divider; d++)
        await this.scheduler.update();

      //render
      // this.imageBuf8 = new Uint8ClampedArray(this.width * this.height * 4);
      this.imageBuf8 = new Uint8ClampedArray(this.width * this.height * 4);
      this.imageBuf8.fill(0); //alpha of all pixels will be 0, so image is transparent
      this.render();

      //add to image list
      imgs.push(this.imageBuf8.buffer)
      // @ts-ignore
     dels.push(~~(1000 / fps))
    }

    return (UPNG.encode(imgs, this.width, this.height, 0, dels))

  }

  //not used in this case
  run() {

  }


}


