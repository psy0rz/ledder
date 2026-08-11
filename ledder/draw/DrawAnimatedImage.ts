import Pixel from "../Pixel.js"
import sharp from "sharp"
import PixelList from "../PixelList.js"
import ColorCache from "../ColorCache.js"
import type BoxInterface from "../BoxInterface.js"

//plain-data form of ImgAnimationFrames, suitable for JSON.stringify (e.g. to cache decoded frames on disk)
export type PlainAnimationFrames = {
    defaultFrameDelayMs: number
    frameDelaysMs: number[]
    //per frame, per pixel: [x, y, r, g, b, a]
    frames: Array<Array<[number, number, number, number, number, number]>>
}


//Converts raw image data from the sharp library into a list of pixel frames.
//Pixels with alpha 0 are skipped.
//Sharp decodes an animated image into one tall canvas with all frames stacked in the y direction and
//reports the height of a single frame in info.pageHeight.


//display time of a frame that is shorter than this is treated as "not specified" (same as what browsers do)
const minimumFrameDelayMs = 10

export class ImgAnimationFrames {

    readonly frames: PixelList[] = []

    //display time per frame. Animated formats may use a different delay for every frame.
    private readonly frameDelaysMs: number[] = []

    //used for frames that have no (usable) delay of their own
    defaultFrameDelayMs: number

    constructor(frameCount: number, defaultFrameDelayMs: number = 100) {
        this.defaultFrameDelayMs = defaultFrameDelayMs
        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++)
            this.frames.push(new PixelList())
    }

    length() {
        return this.frames.length
    }

    addFrame(frame: PixelList) {
        this.frames.push(frame)
    }

    addPixel(frameIndex: number, pixel: Pixel) {
        if (this.frames[frameIndex])
            this.frames[frameIndex].add(pixel)
    }

    getFrame(frameIndex: number): PixelList {
        if (this.frames.length === 0)
            return new PixelList()

        return this.frames[frameIndex % this.frames.length]
    }

    //store the per-frame delays as reported by sharp (metadata.delay)
    setFrameDelaysMs(delaysMs: number[]) {
        this.frameDelaysMs.length = 0
        this.frameDelaysMs.push(...delaysMs)
    }

    getFrameDelayMs(frameIndex: number): number {
        if (this.frames.length === 0)
            return this.defaultFrameDelayMs

        const delayMs = this.frameDelaysMs[frameIndex % this.frames.length]
        if (delayMs === undefined || delayMs < minimumFrameDelayMs)
            return this.defaultFrameDelayMs

        return delayMs
    }

    //plain-data copy, e.g. to cache decoded frames on disk. See fromPlainObject() for the reverse.
    toPlainObject(): PlainAnimationFrames {
        return {
            defaultFrameDelayMs: this.defaultFrameDelayMs,
            frameDelaysMs: [...this.frameDelaysMs],
            frames: this.frames.map(frame => [...frame].map((pixel: Pixel) =>
                [pixel.x, pixel.y, pixel.color.r, pixel.color.g, pixel.color.b, pixel.color.a]))
        }
    }

    static fromPlainObject(plainFrames: PlainAnimationFrames): ImgAnimationFrames {
        const frames = new ImgAnimationFrames(0, plainFrames.defaultFrameDelayMs)
        const colorCache = new ColorCache()

        for (const plainFrame of plainFrames.frames) {
            const frame = new PixelList()
            for (const [x, y, r, g, b, a] of plainFrame)
                frame.add(new Pixel(x, y, colorCache.get(r, g, b, a)))
            frames.addFrame(frame)
        }

        frames.setFrameDelaysMs(plainFrames.frameDelaysMs)
        return frames
    }

    /**
     * Decode a sharp image into pixel frames.
     * @param image sharp pipeline, created with {animated: true} if you want all frames of an animation.
     *              Must be based on a buffer or file: we read its metadata before rendering it.
     * @param xOffset added to the x of every pixel.
     * @param yOffset added to the y of every pixel.
     * @param clipBox when given, pixels outside this box are dropped instead of drawn.
     */
    static async fromSharp(image: sharp.Sharp, xOffset: number = 0, yOffset: number = 0, clipBox?: BoxInterface): Promise<ImgAnimationFrames> {

        //the raw output doesnt tell us how tall one frame is, so we get the frame count from the source metadata.
        //(the resulting frame height is not the requested height: fit modes like inside/outside change it)
        const frameCount = (await image.metadata()).pages ?? 1

        //ensureAlpha: without an alpha channel (jpeg, opaque png) we would read the next pixel's red as our alpha
        const {data, info} = await image.ensureAlpha().raw().toBuffer({resolveWithObject: true})

        const frameHeight = Math.trunc(info.height / frameCount)
        if (frameHeight < 1)
            return new ImgAnimationFrames(0)

        const frames = new ImgAnimationFrames(frameCount)
        const colorCache = new ColorCache()

        for (let canvasY = 0; canvasY < info.height; canvasY++) {
            const frameIndex = Math.trunc(canvasY / frameHeight)
            const pixelY = (canvasY % frameHeight) + yOffset

            if (clipBox && (pixelY < clipBox.yMin || pixelY > clipBox.yMax))
                continue

            for (let canvasX = 0; canvasX < info.width; canvasX++) {
                const pixelX = canvasX + xOffset

                if (clipBox && (pixelX < clipBox.xMin || pixelX > clipBox.xMax))
                    continue

                const offset = (canvasX * info.channels) + (canvasY * info.width * info.channels)
                const alpha = data[offset + 3]

                //ignore fully transparent pixels
                if (alpha === 0)
                    continue

                const color = colorCache.get(data[offset], data[offset + 1], data[offset + 2], alpha / 255)
                frames.addPixel(frameIndex, new Pixel(pixelX, pixelY, color))
            }
        }

        return frames
    }
}
