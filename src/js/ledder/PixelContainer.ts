import {Pixel} from "./Pixel.js";

/**
 * A list of Pixels
 */
export class PixelContainer {
  pixels: Array<Pixel>;

  constructor() {
    this.pixels = [];
  }

  reset()
  {
    this.pixels = [];
  }

  add(pixelContainer: PixelContainer)
  {
    this.pixels.push(...pixelContainer.pixels)
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

  //add pixel to "background" (e.g. add to front of pixel list)
  addPixelBG(...pixels: Array<Pixel>) {

    for (const i in pixels)
    {
      if (this.pixels.indexOf(pixels[i]) == -1) {
        this.pixels.unshift(pixels[i]);
      }

    }
    return (this);
  }

  //add pixels to background
  addPixelsBG(pixels: Array<Pixel>) {

    for (const i in pixels)
    {
      if (this.pixels.indexOf(pixels[i]) == -1) {
        this.pixels.unshift(pixels[i]);
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
        this.pixels.splice(ourPixelIndex,1);
      }
    }
    return (this);
  }
}
