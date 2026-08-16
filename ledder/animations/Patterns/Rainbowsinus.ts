import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Color from "../../Color.js"

const TWO_PI = Math.PI * 2

export default class Rainbowsinus extends Animator {

    static description = "A sine wave sweeping across the display, each point smeared out into a vertical rainbow glow."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const brightnessControl = controls.value("alpha/brightness", 0.9, 0.1, 1, 0.05)
        const intervalControl = controls.value("Fractal interval", 1, 1, 10, 0.1)
        const timeSpeedControl = controls.value("Speed", 1, 0, 5, 0.1)

        //The vertical position of the wave: sin() over x, with a wavelength that slowly sweeps
        //back and forth through zero, so the wave alternates between stretched and razor sharp.
        const waveControls = controls.group("Wave", false, true)
        const waveAmplitudeControl = waveControls.value("Amplitude", 1, 0, 1, 0.01)
        const wavelengthSweepSpeedControl = waveControls.value("Wavelength sweep speed", 0.001, 0, 0.02, 0.0001)
        const wavelengthSweepRangeControl = waveControls.value("Wavelength sweep range", 30, 1, 100, 1)

        //Every point of the wave is drawn as a vertical bar that fades out with distance.
        const glowControls = controls.group("Glow", false, true)
        const glowHeightControl = glowControls.value("Height (x display height)", 2, 0.1, 4, 0.1)
        const glowFalloffControl = glowControls.value("Falloff", 10, 1, 100, 1)

        //Color comes from one sine per channel over (time + x + glow offset). Identical phases
        //give a single hue sweep, a quarter turn apart (the original blue cosine) gives rainbows.
        const colorControls = controls.group("Color", false, true)
        const colorWavelengthControl = colorControls.value("Wavelength", 10, 1, 50, 0.5)
        const redPhaseControl = colorControls.value("Red phase (turns)", 0, 0, 1, 0.01)
        const greenPhaseControl = colorControls.value("Green phase (turns)", 0, 0, 1, 0.01)
        const bluePhaseControl = colorControls.value("Blue phase (turns)", 0.25, 0, 1, 0.01)

        const floorControls = controls.group("Color minimum", false, true)
        const redFloorControl = floorControls.value("Red", 0, 0, 255, 1)
        const greenFloorControl = floorControls.value("Green", 0, 0, 255, 1)
        const blueFloorControl = floorControls.value("Blue", 32, 0, 255, 1)

        //One pixel object per coordinate, created once: every frame only updates the colors.
        const rasterPixels = box.raster(box, new Color(0, 0, 0, 1))

        //The glow bars used to be stacked as seperate pixels that alphablended over each other.
        //We blend them into the single raster color in the same order instead, which looks the
        //same without allocating a pixel per bar segment per frame.
        let animationTime = 0

        scheduler.intervalControlled(intervalControl, () => {

            animationTime = animationTime + timeSpeedControl.value

            for (const column of rasterPixels)
                for (const pixel of column) {
                    pixel.color.r = 0
                    pixel.color.g = 0
                    pixel.color.b = 0
                }

            const displayHeight = box.height()
            const displayWidth = box.width()

            const layerAlpha = brightnessControl.value
            const keepFactor = 1 - layerAlpha

            //Sweeps between -range and +range, passing through 0 (which we skip: it would divide by zero).
            const sweep = Math.cos(animationTime * wavelengthSweepSpeedControl.value) + 1
            let waveLength = sweep * wavelengthSweepRangeControl.value - wavelengthSweepRangeControl.value
            if (waveLength == 0)
                waveLength = 0.0001

            const waveAmplitude = waveAmplitudeControl.value * (displayHeight / 2 - 1)
            const waveCenter = displayHeight / 2 - 1

            const glowHeight = Math.round(displayHeight * glowHeightControl.value)
            const glowFalloff = glowFalloffControl.value

            const colorWavelength = colorWavelengthControl.value
            const redPhase = redPhaseControl.value * TWO_PI
            const greenPhase = greenPhaseControl.value * TWO_PI
            const bluePhase = bluePhaseControl.value * TWO_PI
            const redFloor = redFloorControl.value
            const greenFloor = greenFloorControl.value
            const blueFloor = blueFloorControl.value

            for (let x = 0; x < displayWidth; x++) {

                const column = rasterPixels[x]
                if (column === undefined)
                    continue

                const centerY = Math.round(Math.sin((animationTime + x) / waveLength) * waveAmplitude + waveCenter)

                //Clip the glow bar to the display instead of calculating pixels nobody sees.
                const firstOffset = Math.max(-glowHeight, -centerY)
                const lastOffset = Math.min(glowHeight, displayHeight - 1 - centerY)

                for (let offset = firstOffset; offset <= lastOffset; offset++) {

                    const pixel = column[centerY + offset]
                    if (pixel === undefined)
                        continue

                    const fade = Math.abs(offset / glowFalloff) + 1
                    const wave = (animationTime + x + offset + glowHeight) / colorWavelength

                    const red = Math.max((Math.sin(wave + redPhase) * 128 + 128) / fade, redFloor)
                    const green = Math.max((Math.sin(wave + greenPhase) * 128 + 128) / fade, greenFloor)
                    const blue = Math.max((Math.sin(wave + bluePhase) * 128 + 128) / fade, blueFloor)

                    const color = pixel.color
                    color.r = color.r * keepFactor + red * layerAlpha
                    color.g = color.g * keepFactor + green * layerAlpha
                    color.b = color.b * keepFactor + blue * layerAlpha
                }
            }
        })
    }
}
