import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import { patternSelect } from "../../ColorPatterns.js"

/**
 * One x/y position of the matrix.
 *
 * Pixels added during a frame are averaged together with the pixel that was blended in the previous
 * frame, so the blended pixel decays towards the new input instead of being replaced by it. That
 * carry-over is what gives the matrix its smear/afterglow.
 */
class PixelStack {
    x: number
    y: number
    blendedPixel: Pixel | null
    addedPixels: Pixel[]

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.blendedPixel = null
        this.addedPixels = []
    }

    addPixel(pixel: Pixel) {
        this.addedPixels.push(pixel)
    }

    /**
     * Average everything added this frame with the previous blend result, into one pixel.
     *
     * @param afterglowWeight How heavy the previous frame's pixel counts in the average. 0 discards
     *                        it (crisp), 1 weighs it as one extra added pixel, higher values smear.
     * @param maxAlpha        Upper limit for the resulting alpha.
     */
    blendAddedPixels(afterglowWeight: number, maxAlpha: number) {
        if (this.addedPixels.length === 0)
            return

        let redSum = 0
        let greenSum = 0
        let blueSum = 0
        let alphaSum = 0

        for (const pixel of this.addedPixels) {
            redSum += pixel.color.r
            greenSum += pixel.color.g
            blueSum += pixel.color.b
            alphaSum += pixel.color.a
        }

        let pixelCount = this.addedPixels.length
        if (this.blendedPixel !== null && afterglowWeight > 0) {
            redSum += this.blendedPixel.color.r * afterglowWeight
            greenSum += this.blendedPixel.color.g * afterglowWeight
            blueSum += this.blendedPixel.color.b * afterglowWeight
            alphaSum += this.blendedPixel.color.a * afterglowWeight
            pixelCount += afterglowWeight
        }

        this.addedPixels = []
        this.blendedPixel = new Pixel(this.x, this.y, new Color(
            Math.round(redSum / pixelCount),
            Math.round(greenSum / pixelCount),
            Math.round(blueSum / pixelCount),
            Math.min(maxAlpha, alphaSum / pixelCount),
        ))
    }
}

/**
 * A grid of PixelStacks: pixels drawn on top of each other at the same position are blended
 * additively instead of overwriting each other.
 */
class PhotonMatrix {
    width: number
    height: number
    pixelStacks: PixelStack[]

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.pixelStacks = []
        for (let y = 0; y < height; y++)
            for (let x = 0; x < width; x++)
                this.pixelStacks.push(new PixelStack(x, y))
    }

    /** Index into pixelStacks, or -1 when x/y falls outside the matrix. */
    stackIndex(x: number, y: number) {
        const stackX = Math.floor(x)
        const stackY = Math.floor(y)
        if (stackX < 0 || stackX >= this.width || stackY < 0 || stackY >= this.height)
            return -1
        return (this.width * stackY) + stackX
    }

    addPixel(pixel: Pixel) {
        const index = this.stackIndex(pixel.x, pixel.y)
        if (index >= 0)
            this.pixelStacks[index].addPixel(pixel)
    }

    /**
     * Sweep the palette over the whole matrix twice: once column by column (the vertical sweep),
     * once row by row (the horizontal sweep). Both passes continue on the same palette index, so
     * their diagonals interfere and blend into a plaid-like pattern.
     *
     * @param startColorIndex Palette index the first pass starts at.
     * @param verticalShift   Palette steps per pixel while sweeping columns top to bottom.
     * @param horizontalShift Palette steps per pixel while sweeping rows left to right.
     */
    addXYSweep(colorPalette: Color[], startColorIndex: number,
               verticalShift: number, horizontalShift: number,
               sweepVertical: boolean, sweepHorizontal: boolean) {

        let colorIndex = startColorIndex

        if (sweepVertical) {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    colorIndex = (colorIndex + verticalShift) % colorPalette.length
                    this.addPixel(new Pixel(x, y, colorPalette[colorIndex].copy()))
                }
            }
        }

        if (sweepHorizontal) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    colorIndex = (colorIndex + horizontalShift) % colorPalette.length
                    this.addPixel(new Pixel(x, y, colorPalette[colorIndex].copy()))
                }
            }
        }
    }

    blendAddedPixels(afterglowWeight: number, maxAlpha: number) {
        for (const pixelStack of this.pixelStacks)
            pixelStack.blendAddedPixels(afterglowWeight, maxAlpha)
    }

    render() {
        const pixelList = new PixelList()
        for (const pixelStack of this.pixelStacks)
            if (pixelStack.blendedPixel !== null)
                pixelList.add(pixelStack.blendedPixel)
        return pixelList
    }
}

export default class Photon extends Animator {

    static description = "Additive photon matrix, sweeping a color palette over the x and y axis"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const photonControls = controls.group("Photon", true)
        const intervalControl = photonControls.value("Animation interval", 1, 1, 10, 1)
        const colorPaletteControl = patternSelect(photonControls, 'Color Palette', 'DimmedReinbow')

        const sweepControls = photonControls.group("Sweep")
        const verticalShiftControl = sweepControls.value("Vertical color shift", 3, 0, 32, 1)
        const horizontalShiftControl = sweepControls.value("Horizontal color shift", 3, 0, 32, 1)
        const sweepVerticalControl = sweepControls.switch("Sweep vertically", true, false)
        const sweepHorizontalControl = sweepControls.switch("Sweep horizontally", true, false)
        const paletteScrollControl = sweepControls.value("Palette scroll per frame", 1, 0, 32, 1)

        const blendControls = photonControls.group("Blending")
        const afterglowControl = blendControls.value("Afterglow", 1, 0, 16, 0.5)
        const maxAlphaControl = blendControls.value("Max alpha", 0.8, 0, 1, 0.05)

        const photonMatrix = new PhotonMatrix(box.width(), box.height())

        const pixelList = new PixelList()
        box.add(pixelList)

        scheduler.intervalControlled(intervalControl, (frameNr) => {
            pixelList.clear()
            const startColorIndex = (frameNr * paletteScrollControl.value) % colorPaletteControl.length
            photonMatrix.addXYSweep(
                colorPaletteControl, startColorIndex,
                verticalShiftControl.value, horizontalShiftControl.value,
                sweepVerticalControl.enabled, sweepHorizontalControl.enabled,
            )
            photonMatrix.blendAddedPixels(afterglowControl.value, maxAlphaControl.value)
            pixelList.add(photonMatrix.render())
        })
    }
}
