import {Animation} from "../Animation.js";
import {calculateFireColors} from "../util.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";


export class DoomFire extends Animation {
  static category = "Fire"
  static title = "Doom"
  static description = "From the game Doom. Based on https://github.com/filipedeschamps/doom-fire-algorithm/blob/master/playground/render-with-canvas-and-hsl-colors/fire.js"
  static presetDir = "Doom";

  constructor(matrix) {
    super(matrix);

    const decayControl = matrix.preset.value("Fire decay", 40, 1, 120, 1);
    const windControl = matrix.preset.value("Wind", 1.4, 0, 5, .1);
    const intervalControl = matrix.preset.value("Update interval", 1, 1, 6, .1);

    const fireColors = calculateFireColors();

    const firePixels = []
    const numberOfPixels = matrix.width * matrix.height

    //create initial fire pixels
    for (let i = 0; i <= numberOfPixels; i++) {
      firePixels[i] = 0;
      new Pixel(matrix, i % matrix.width, matrix.height - i / matrix.width, new Color(0, 0, 255))
    }

    //create fire source
    for (let col = 0; col <= matrix.width; col++) {
      const overflowPixelIndex = numberOfPixels;
      const pixelIndex = (overflowPixelIndex - matrix.width) + col;

      firePixels[pixelIndex] = 100;
      matrix.pixels[pixelIndex].color = fireColors[100]
    }

    function updateFireIntensityPerPixel(currentPixelIndex) {
      const belowPixelIndex = currentPixelIndex + matrix.width;

      if (belowPixelIndex >= matrix.width * matrix.height)
        return;

      const decay = Math.floor(Math.random() * decayControl.value);
      const wind =  Math.floor(Math.random() * windControl.value);
      const belowPixelFireIntensity = firePixels[belowPixelIndex];
      let newFireIntensity = belowPixelFireIntensity - decay;

      if (newFireIntensity <= 0)
        newFireIntensity = 0;

      const updatePixel=currentPixelIndex - wind;
      firePixels[updatePixel] = newFireIntensity;

      //assign actual color to actual matrix pixel
      if (updatePixel>0) {
        matrix.pixels[updatePixel].color = fireColors[newFireIntensity]
      }
    }

    matrix.scheduler.intervalControlled(intervalControl, () => {

        for (let col = 0; col < matrix.width; col++) {
          for (let row = 0; row < matrix.height; row++) {
            const pixelIndex = col + (matrix.width * row);

            updateFireIntensityPerPixel(pixelIndex);
          }
        }


    })


  }

}
