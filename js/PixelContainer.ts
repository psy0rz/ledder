import {Pixel} from "./Pixel.js";

/**
 * A list of Pixels
 */
export class PixelContainer {
  pixels: Array<Pixel>;

  constructor() {
    this.pixels = [];
  }

  clear()
  {
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

  addPixels(pixels: Array<Pixel>) {

    for (const i in pixels)
    {
      if (this.pixels.indexOf(pixels[i]) == -1) {
        this.pixels.push(pixels[i]);
      }

    }
    return (this);
  }

  removePixel(...pixels: Array<Pixel>)
  {
    for (const i in pixels)
    {
      const ourPixelIndex=this.pixels.indexOf(pixels[i]);
      if (ourPixelIndex != -1) {
        this.pixels.splice(ourPixelIndex,1);
      }
    }
    return (this);
  }

  removePixels(pixels: Array<Pixel>)
  {
    for (const i in pixels)
    {
      const ourPixelIndex=this.pixels.indexOf(pixels[i]);
      if (ourPixelIndex != -1) {
        this.pixels.splice(ourPixelIndex);
      }
    }
    return (this);
  }
}