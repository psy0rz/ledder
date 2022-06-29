import {Animation} from "../Animation.js";
import {random, randomGaussian} from "../util.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";


//glow firepixel intesity between min/max (inclusive), with specified "wildness"
export function glow(current:number, min:number, max:number, wildness:number, gausian=3) {

  //pull the flame to the middle. (wildness gets less towards the limits)
  // const factor=(current-min)/ (max-min)
  // const upperWildness=~~((1-factor)*wildness)
  // const lowerWildness=~~((-factor)*wildness)
  // current = current + random(lowerWildness, upperWildness)

    current = current + randomGaussian(-wildness, wildness, gausian)

  if (current > max)
    current = max
  else if (current < min)
    current = min

  return (current)
}

export default class DoomFire extends Animation {
  static category = "Fire"
  static title = "Doom"
  static description = "Pixel art from the game, based on <a href='https://github.com/filipedeschamps/doom-fire-algorithm/blob/master/playground/render-with-canvas-and-hsl-colors/fire.js'>this.</a>"
  static presetDir = "Doom";


  constructor(display) {
    super(display);


    const decayControl = display.control.value("Fire decay", 40, 1, 120, 1);
    const windControl = display.control.value("Wind", 1.4, 0, 5, .1);
    const intervalControl = display.control.value("Update interval", 1, 1, 6, .1);
    const minIntensityControl = display.control.value("Fire minimum intensity", 20, 0, 100, 1);
    const maxIntensityControl = display.control.value("Fire maximum intensity", 100, 0, 100, 1);
    const wildnessIntensityControl = display.control.value("Fire wildness", 10, 0, 100, 1);
    const smoothingControl = display.control.value("Smoothing", 0, 0, 1, 0.01);

    const fireColors = calculateFireColors();

    const firePixels = []
    const smoothedPixels = []

    const numberOfPixels = display.width * display.height

    //create initial fire pixels
    for (let i = 0; i < numberOfPixels; i++) {
      firePixels[i] = 0;
      smoothedPixels[i] = 0;
      new Pixel(display, i % display.width, display.height - ~~(i / display.width) - 1, new Color(0, 0, 0))
    }

    //set a firepixel to a specified intensity
    function setFirePixel(pixelIndex, intensity: number) {
      if (pixelIndex < 0)
        return
      firePixels[pixelIndex] = intensity;
    }

    //actual fire algorithm
    function updateFireIntensityPerPixel(currentPixelIndex) {
      const belowPixelIndex = currentPixelIndex + display.width;

      if (belowPixelIndex >= display.width * display.height)
        return;

      const decay = Math.floor(Math.random() * decayControl.value);
      const wind = Math.floor(Math.random() * windControl.value);
      const belowPixelFireIntensity = firePixels[belowPixelIndex];
      let newFireIntensity = belowPixelFireIntensity - decay;

      if (newFireIntensity <= 0)
        newFireIntensity = 0;

      const updatePixel = currentPixelIndex - wind;

      setFirePixel(updatePixel, newFireIntensity)
    }

    //fire update loop
    display.scheduler.intervalControlled(intervalControl, () => {

        //let firesource glow
        for (let col = 0; col < display.width; col++) {
          const pixelIndex = numberOfPixels - display.width + col
          setFirePixel(pixelIndex, glow(firePixels[pixelIndex], minIntensityControl.value, maxIntensityControl.value, wildnessIntensityControl.value))
        }

        for (let col = 0; col < display.width; col++) {
          for (let row = 0; row < display.height; row++) {
            const pixelIndex = col + (display.width * row);
            updateFireIntensityPerPixel(pixelIndex);
          }
        }
      return true
      }

  )

    //output loop (smoothing)
    display.scheduler.interval(1, () => {
      for (let i = 0; i < numberOfPixels; i++) {
        smoothedPixels          [i] = ~~(firePixels[i] * (1 - smoothingControl.value) + smoothedPixels[i] * smoothingControl.value)
        display.pixels          [i].color = fireColors[smoothedPixels[i]]
      }
      return true
    })
  }
}
