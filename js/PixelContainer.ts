import {Pixel} from "./Pixel.js";

export class PixelContainer {
  pixels: Array<Pixel>;

  constructor() {
    this.pixels = [];
  }


  addPixel(...pixels: Array<Pixel>) {

    for (const i in pixels)
    {
      if (this.pixels.indexOf(pixels[i]) == -1) {
        this.pixels.push(pixels[i]);
      }

    }
    return (this);
  }


}
