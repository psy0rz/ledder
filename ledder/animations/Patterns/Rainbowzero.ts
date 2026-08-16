import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Color from "../../Color.js"

const TWO_PI = Math.PI * 2

export default class Rainbowzero extends Animator {

    static description = "Interfering sine waves with a slowly sweeping wavelength, mirrored into four quadrants."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const brightnessControl = controls.value("alpha/brightness", 0.9, 0.1, 1, 0.05)
        const intervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        const waveSpeedControl = controls.value("Wave speed", 1, 0, 5, 0.05)

        const wavelengthControls = controls.group("Wavelength sweep", false, true)
        const wavelengthStepControl = wavelengthControls.value("Sweep per pixel", 0.005, 0.0001, 0.05, 0.0001)
        const wavelengthMaxControl = wavelengthControls.value("Sweep wraps at", 5, 0.5, 20, 0.1)

        //Each channel is the same sine wave, shifted by this fraction of a full turn.
        //The default blue shift of 0.25 turns makes it a cosine, like the original.
        const phaseControls = controls.group("Color phase (turns)", false, true)
        const redPhaseControl = phaseControls.value("Red", 0, 0, 1, 0.01)
        const greenPhaseControl = phaseControls.value("Green", 0, 0, 1, 0.01)
        const bluePhaseControl = phaseControls.value("Blue", 0.25, 0, 1, 0.01)

        const mirrorControl = controls.switch("Mirror quadrants", true, false)

        //One pixel object per coordinate, created once: every frame only updates the colors.
        const rasterPixels = box.raster(box, new Color(0, 0, 0, 1))

        //The mirrored copies used to be stacked as seperate pixels with alpha 0.8, so each one
        //alphablended over the ones drawn before it. We blend them into the single raster color
        //in the same order instead, which looks the same without allocating pixels every frame.
        const layerAlpha = 0.8
        const keepFactor = 1 - layerAlpha

        const blendIntoRaster = (x: number, y: number, r: number, g: number, b: number) => {
            const column = rasterPixels[x]
            if (column === undefined)
                return
            const pixel = column[y]
            if (pixel === undefined)
                return

            const color = pixel.color
            color.r = color.r * keepFactor + r * layerAlpha
            color.g = color.g * keepFactor + g * layerAlpha
            color.b = color.b * keepFactor + b * layerAlpha
        }

        let wavePhase = 0

        scheduler.intervalControlled(intervalControl, () => {

            wavePhase = wavePhase + waveSpeedControl.value

            for (const column of rasterPixels)
                for (const pixel of column) {
                    pixel.color.r = 0
                    pixel.color.g = 0
                    pixel.color.b = 0
                }

            const amplitude = 127 * brightnessControl.value
            const redPhase = redPhaseControl.value * TWO_PI
            const greenPhase = greenPhaseControl.value * TWO_PI
            const bluePhase = bluePhaseControl.value * TWO_PI
            const wavelengthStep = wavelengthStepControl.value
            const wavelengthMax = wavelengthMaxControl.value
            const mirror = mirrorControl.enabled

            //Wavelength sweeps from its wrap point downwards over the whole box, which is what
            //creates the fractal-ish interference bands.
            let wavelength = 1

            for (let x = 0; x < box.width(); x++) {
                for (let y = 0; y < box.height(); y++) {

                    wavelength = wavelength + wavelengthStep
                    if (wavelength > wavelengthMax) wavelength = -wavelengthMax
                    if (wavelength == 0) wavelength = wavelengthStep

                    const wave = (wavePhase + x + y) / wavelength
                    const red = Math.max((Math.sin(wave + redPhase) + 1) * amplitude, 0)
                    const green = Math.max((Math.sin(wave + greenPhase) + 1) * amplitude, 0)
                    const blue = Math.max((Math.sin(wave + bluePhase) + 1) * amplitude, 0)

                    blendIntoRaster(x, y, red, green, blue)

                    if (mirror) {
                        const mirroredX = box.width() - 1 - x
                        const mirroredY = box.height() - 1 - y
                        blendIntoRaster(mirroredX, y, red, green, blue)
                        blendIntoRaster(mirroredX, mirroredY, red, green, blue)
                        blendIntoRaster(x, mirroredY, red, green, blue)
                    }
                }
            }
        })
    }
}
