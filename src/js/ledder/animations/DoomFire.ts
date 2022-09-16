import {Animation} from "../Animation.js";
import {glow} from "../util.js";
import {Color} from "../Color.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {patternSelect} from "../ColorPatterns.js";
import {PixelContainer} from "../PixelContainer.js";


export default class DoomFire extends Animation {
    static category = "Fire"
    static title = "Doom"
    static description = "Pixel art from the game, based on <a href='https://github.com/filipedeschamps/doom-fire-algorithm/blob/master/playground/render-with-canvas-and-hsl-colors/fire.js'>this.</a>"
    static presetDir = "Doom";


    async run(display: Display, scheduler: Scheduler, controls: ControlGroup): Promise<void> {


        const decayControl = controls.value("Fire decay", 40, 1, 120, 1);
        const windControl = controls.value("Wind", 1.4, 0, 5, .1);
        const intervalControl = controls.value("Update interval", 1, 1, 6, .1);
        const minIntensityControl = controls.value("Fire minimum intensity", 0, 0, 100, 1);
        const maxIntensityControl = controls.value("Fire maximum intensity", 100, 0, 100, 1);
        const wildnessIntensityControl = controls.value("Fire wildness", 10, 0, 100, 1);
        const smoothingControl = controls.value("Smoothing", 0, 0, 1, 0.01);

        const colors = patternSelect(controls, 'Fire colors', 'Doom fire')
      const colorScale = (colors.length - 1) / 100


        // const firePixels = []
        // const smoothedPixels = []
        //
        // const numberOfPixels = display.width * display.height

        // //create initial fire pixels
        // for (let i = 0; i < numberOfPixels; i++) {
        //   firePixels[i] = 0;
        //   smoothedPixels[i] = 0;
        //   new Pixel(display, i % display.width, display.height - ~~(i / display.width) - 1, new Color(0, 0, 0))
        // }

        const container = new PixelContainer()
        display.add(container)
        const raster = container.raster(display, new Color(0, 0, 150), false, false, false, false, 0)

        // //set a firepixel to a specified intensity
        // function setFirePixel(pixelIndex, intensity: number) {
        //   if (pixelIndex < 0)
        //     return
        //   firePixels[pixelIndex] = intensity;
        // }

        //actual fire algorithm
        // function updateFireIntensityPerPixel(currentPixelIndex) {
        //   const belowPixelIndex = currentPixelIndex + display.width;
        //
        //   if (belowPixelIndex >= display.width * display.height)
        //     return;
        //
        //   const decay = Math.floor(Math.random() * decayControl.value);
        //   const wind = Math.floor(Math.random() * windControl.value);
        //   const belowPixelFireIntensity = firePixels[belowPixelIndex];
        //   let newFireIntensity = belowPixelFireIntensity - decay;
        //
        //   if (newFireIntensity <= 0)
        //     newFireIntensity = 0;
        //
        //   const updatePixel = currentPixelIndex - wind;
        //
        //   setFirePixel(updatePixel, newFireIntensity)
        // }

        //fire update loop
        display.scheduler.intervalControlled(intervalControl, () => {

            //let firesource glow
            for (let x = 0; x < display.width; x++) {

                const intensity = glow(raster[x][0].data, ~~minIntensityControl.value*colorScale, ~~maxIntensityControl.value*colorScale, ~~wildnessIntensityControl.value*colorScale, 3)
                raster[x][0].data=intensity
                raster[x][0].color = colors[intensity]

            }
            // console.log(raster[0][0].data)

            // // //actual algorithm
            // for (let x = 0; x < display.width; x++) {
            //   for (let y = display.height-1; y >0; y--) {
            //
            //     const decay = Math.floor(Math.random() * decayControl.value);
            //     const wind = Math.floor(Math.random() * windControl.value);
            //
            //     //intensity of pixel below - decay
            //     let intensity=raster[x][y-1].data - decay
            //
            //     if (intensity<0)
            //       intensity=0
            //
            //     const windX=x+wind
            //
            //     if (windX>=0 && windX<display.width && intensity!=raster[windX][y].data) {
            //       raster[windX][y].data = intensity
            //       raster[windX][y].color=fireColors[~~(intensity/100*(fireColors.length-1))]
            //     }
            //   }
            // }
            return true
        })

        // //output loop (smoothing)
        // display.scheduler.interval(1, () => {
        //   for (let i = 0; i < numberOfPixels; i++) {
        //     smoothedPixels          [i] = ~~(firePixels[i] * (1 - smoothingControl.value) + smoothedPixels[i] * smoothingControl.value)
        //     display.pixels          [i].color = fireColors[smoothedPixels[i]]
        //   }
        //   return true
        // })
    }
}
