import PixelBox from "../PixelBox.js"
import sharp from "sharp"
import drawAnimatedImage from "../draw/DrawAnimatedImage.js"
import type {ImgAnimationFrames} from "../draw/DrawAnimatedImage.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animator from "../Animator.js"
import {NodeFetchCache, FileSystemCache, cacheStrategies} from "node-fetch-cache"

//Remote images are cached on disk, so restarting the animation (which happens on every control change)
//doesnt refetch them. The ttl makes sure images that update at the source (weather radar) still refresh.
const cacheTtlMs = 60 * 60 * 1000

const fetchImage = NodeFetchCache.create({
    cache: new FileSystemCache({cacheDirectory: ".cache/remote-pictures", ttl: cacheTtlMs}),

    //never cache 404s and other error responses, they would stay in the cache for the whole ttl
    shouldCacheResponse: cacheStrategies.cacheOkayOnly
})

//how the image is fitted into the display when its aspect ratio doesnt match: crop it, letterbox it, stretch it, ...
//https://github.com/lovell/sharp/blob/main/docs/api-resize.md
const resizeFitChoices = [
    {id: "cover", name: "crop to fill, centered"},
    {id: "contain", name: "whole image, centered"},
    {id: "fill", name: "stretch to fill"},
    {id: "inside", name: "whole image, top left"},
    {id: "outside", name: "crop to fill, top left"}
]

const defaultImageUrl = "https://api.buienradar.nl/image/1.0/RadarMapNL?w=256&h=256"


export default class RemotePictures extends Animator {

    /** Download the image and decode it into pixel frames that fit imageBox */
    private async loadImageFrames(imageUrl: string, imageBox: PixelBox, resizeFit: keyof sharp.FitEnum): Promise<ImgAnimationFrames> {

        const response = await fetchImage(imageUrl)
        if (!response.ok)
            throw new Error(`Could not fetch ${imageUrl}: ${response.status} ${response.statusText}`)

        const imageBuffer = Buffer.from(await response.arrayBuffer())
        const sourceImage = sharp(imageBuffer, {animated: true})

        //read the frame delays from the source: after resizing sharp reports the input metadata anyway
        const sourceMetadata = await sourceImage.metadata()

        const resizedImage = sourceImage.resize(imageBox.width(), imageBox.height(), {
            fit: resizeFit,
            background: {r: 0, g: 0, b: 0, alpha: 0}
        })

        //clip instead of wrap: cover/outside produce an image that is larger than the box
        const frames = await drawAnimatedImage(resizedImage, imageBox.xMin, imageBox.yMin, imageBox)

        if (sourceMetadata.delay)
            frames.setFrameDelaysMs(sourceMetadata.delay)

        return frames
    }

    /** How many display frames to wait before showing the next image frame (at least one) */
    private frameDelayToDisplayFrames(scheduler: Scheduler, frameDelayMs: number, speedMultiplier: number): number {
        return Math.max(1, scheduler.timeToFrames(frameDelayMs / 1000 / speedMultiplier))
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const imageBox = new PixelBox(box)
        box.add(imageBox)

        //create all controls before loading, so they still show up in the GUI when the load fails
        const imageUrlControl = controls.input('Image URL', defaultImageUrl, true)
        const resizeFitControl = controls.select("fit", "fill", resizeFitChoices, true)
        const playbackControls = controls.group("playback")
        const speedControl = playbackControls.value("speed multiplier", 1, 0.1, 10, 0.1)

        console.log("RemotePictures: loading", imageUrlControl.text)

        //pause the (preview) renderer while we do slow network stuff
        scheduler.stop()
        let frames: ImgAnimationFrames
        try {
            frames = await this.loadImageFrames(imageUrlControl.text, imageBox, resizeFitControl.selected as keyof sharp.FitEnum)
        } finally {
            //always resume: without this a failed load blocks this displays render loop forever
            scheduler.resume()
        }

        if (frames.length() === 0) {
            console.warn("RemotePictures: image has no frames:", imageUrlControl.text)
            return
        }

        //still image: just draw it once
        if (frames.length() === 1) {
            imageBox.add(frames.getFrame(0))
            return
        }

        let frameIndex = 0
        scheduler.interval(this.frameDelayToDisplayFrames(scheduler, frames.getFrameDelayMs(0), speedControl.value), () => {

            imageBox.clear()
            imageBox.add(frames.getFrame(frameIndex))

            //the next frame may have a different delay, and the user can change the speed while we run
            const displayFrames = this.frameDelayToDisplayFrames(scheduler, frames.getFrameDelayMs(frameIndex), speedControl.value)
            frameIndex = (frameIndex + 1) % frames.length()
            return displayFrames
        })
    }
}
