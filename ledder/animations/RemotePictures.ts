import PixelBox from "../PixelBox.js"
import sharp from "sharp"
import {AnimatedImage} from "../draw/AnimatedImage.js"
import type {PlainAnimatedImage} from "../draw/AnimatedImage.js"
import DrawText from "../draw/DrawText.js"
import {fonts} from "../fonts.js"
import Color from "../Color.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animator from "../Animator.js"
import {NodeFetchCache, FileSystemCache, cacheStrategies} from "node-fetch-cache"
import {createHash} from "crypto"
import {mkdir, readFile, writeFile} from "fs/promises"

const logPrefix = "RemotePictures:"

//the downloaded image files are cached on disk (raw bytes, one file per url), so restarting the
//animation (which happens on every control change) doesnt refetch them.
const fetchImage = NodeFetchCache.create({
    cache: new FileSystemCache({cacheDirectory: ".cache/remote-pictures"}),

    //never cache 404s and other error responses, they would stay in the cache for the whole ttl
    shouldCacheResponse: cacheStrategies.cacheOkayOnly
})

//Decoding is by far the slowest part: sharp decodes every frame of an animation at full resolution
//(tens of megapixels for a big gif) and we keep only a few hundred pixels of it. Skipping the download
//is not enough, so we also cache the decoded frames, keyed by everything that changes the result.
//Note that the cached pixels are shared between every animation using them, so treat them as read-only.
const decodedImageDiskCacheDirectory = ".cache/remote-pictures-decoded"
const maxCachedImagesInMemory = 10

type CachedImage = {
    //the promise, not the result: restarting while a load is still running reuses that same load
    framesPromise: Promise<AnimatedImage>
    decodedAtMs: number
}

//in least-recently-used order, so the first entry is the one to drop
const decodedImageMemoryCache = new Map<string, CachedImage>()

//how the image is fitted into the display when its aspect ratio doesnt match: crop it, letterbox it, stretch it, ...
//https://github.com/lovell/sharp/blob/main/docs/api-resize.md
const resizeFitChoices = [
    {id: "cover", name: "crop to fill, centered"},
    {id: "contain", name: "whole image, centered"},
    {id: "fill", name: "stretch to fill"},
    {id: "inside", name: "whole image, top left"},
    {id: "outside", name: "crop to fill, top left"}
]

const defaultImageUrl = ""

const statusFont = fonts['Pixel-Gosub']
statusFont.load()
const loadingTextColor = new Color(128, 128, 128, 1, true)
const errorTextColor = new Color(255, 0, 0, 1, true)


export default class RemotePictures extends Animator {

    /** Download the image and decode it into pixel frames that fit imageBox. ttlMs undefined means cache forever. */
    private async loadImageFrames(imageUrl: string, imageBox: PixelBox, resizeFit: keyof sharp.FitEnum, ttlMs: number | undefined): Promise<AnimatedImage> {

        console.log(logPrefix, "downloading", imageUrl)

        //ttl is passed per-request, so the user can change it via the control without recreating fetchImage
        const response = await fetchImage(imageUrl, {}, {
            cache: new FileSystemCache({cacheDirectory: ".cache/remote-pictures", ttl: ttlMs})
        })
        if (!response.ok)
            throw new Error(`Could not fetch ${imageUrl}: ${response.status} ${response.statusText}`)

        const imageBuffer = Buffer.from(await response.arrayBuffer())

        console.log(logPrefix, "decoding", imageUrl)
        const sourceImage = sharp(imageBuffer, {animated: true})

        //read the frame delays from the source: after resizing sharp reports the input metadata anyway
        const sourceMetadata = await sourceImage.metadata()

        const resizedImage = sourceImage.resize(imageBox.width(), imageBox.height(), {
            fit: resizeFit,
            background: {r: 0, g: 0, b: 0, alpha: 0}
        })

        //clip instead of wrap: cover/outside produce an image that is larger than the box
        const frames = await AnimatedImage.fromSharp(resizedImage, imageBox.xMin, imageBox.yMin, imageBox)

        if (sourceMetadata.delay)
            frames.setFrameDelaysMs(sourceMetadata.delay)

        console.log(logPrefix, "ready", imageUrl)
        return frames
    }

    private decodedImageDiskCachePath(cacheKey: string): string {
        return `${decodedImageDiskCacheDirectory}/${createHash("sha256").update(cacheKey).digest("hex")}.json`
    }

    /** Read previously decoded frames for cacheKey from disk, if present and not older than ttlMs (undefined = cache forever) */
    private async readDecodedImageFromDisk(cacheKey: string, ttlMs: number | undefined): Promise<AnimatedImage | undefined> {
        try {
            const diskCacheFile = JSON.parse(await readFile(this.decodedImageDiskCachePath(cacheKey), "utf8"))
            if (ttlMs !== undefined && (Date.now() - diskCacheFile.decodedAtMs) >= ttlMs)
                return undefined

            return AnimatedImage.fromPlainObject(diskCacheFile.frames as PlainAnimatedImage)
        } catch (e) {
            //no cache file, corrupt cache file, ... just treat it as a cache miss
            return undefined
        }
    }

    private async writeDecodedImageToDisk(cacheKey: string, frames: AnimatedImage) {
        try {
            await mkdir(decodedImageDiskCacheDirectory, {recursive: true})
            const diskCacheFile = {decodedAtMs: Date.now(), frames: frames.toPlainObject()}
            await writeFile(this.decodedImageDiskCachePath(cacheKey), JSON.stringify(diskCacheFile))
        } catch (e) {
            console.error(logPrefix, "failed to write decoded image cache:", e.message)
        }
    }

    /** The decoded frames of this image, from the memory or disk cache when we decoded them before.
     * ttlMs undefined means cache forever. onDownloadStart is called only when neither cache has a fresh
     * copy, i.e. right before we actually hit the network. */
    private cachedImageFrames(imageUrl: string, imageBox: PixelBox, resizeFit: keyof sharp.FitEnum, ttlMs: number | undefined, onDownloadStart: () => void): Promise<AnimatedImage> {

        const cacheKey = `${imageUrl}|${imageBox.width()}x${imageBox.height()}|${resizeFit}`
        const memoryCached = decodedImageMemoryCache.get(cacheKey)

        if (memoryCached !== undefined && (ttlMs === undefined || (Date.now() - memoryCached.decodedAtMs) < ttlMs)) {
            console.log(logPrefix, "ready (from memory cache)", imageUrl)
            //re-insert to mark it as recently used
            decodedImageMemoryCache.delete(cacheKey)
            decodedImageMemoryCache.set(cacheKey, memoryCached)
            return memoryCached.framesPromise
        }

        const framesPromise = (async () => {
            const diskCached = await this.readDecodedImageFromDisk(cacheKey, ttlMs)
            if (diskCached !== undefined) {
                console.log(logPrefix, "ready (from disk cache)", imageUrl)
                return diskCached
            }

            onDownloadStart()
            const frames = await this.loadImageFrames(imageUrl, imageBox, resizeFit, ttlMs)
            void this.writeDecodedImageToDisk(cacheKey, frames)
            return frames
        })()

        //dont remember failed loads, they would keep failing until the ttl expires
        framesPromise.catch(() => decodedImageMemoryCache.delete(cacheKey))

        decodedImageMemoryCache.set(cacheKey, {framesPromise, decodedAtMs: Date.now()})

        while (decodedImageMemoryCache.size > maxCachedImagesInMemory)
            decodedImageMemoryCache.delete(decodedImageMemoryCache.keys().next().value)

        return framesPromise
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
        const cacheForeverControl = controls.switch("cache forever", true, true)
        const cacheTtlControl = controls.value("cache TTL (minutes)", 60, 1, 1440, 1)
        cacheTtlControl.meta.enabled=!cacheForeverControl.enabled
        const autoRefreshControl = controls.switch("auto-refresh", false, true)
        autoRefreshControl.meta.enabled=!cacheForeverControl.enabled
        const playbackControls = controls.group("playback")
        const speedControl = playbackControls.value("speed multiplier", 1, 0.1, 10, 0.1)

        const showStatusText = (text: string, color: Color) => {
            imageBox.clear()
            imageBox.add(new DrawText(imageBox.middleX(), imageBox.middleY(), statusFont, text, color,
                1, imageBox.width(), "centered", "middle"))
        }

        if (imageUrlControl.text==="")
        {
            showStatusText("No url", errorTextColor)
            return
        }

        //stops the previous image's playback interval, if any, so a reload doesnt draw two images at once
        let stopPlayback: () => void = () => {}

        const showFrames = (frames: AnimatedImage) => {
            stopPlayback()

            //still image: just draw it once
            if (frames.length() === 1) {
                imageBox.clear()
                imageBox.add(frames.getFrame(0))
                stopPlayback = () => {}
                return
            }

            let stopped = false
            stopPlayback = () => {stopped = true}

            let frameIndex = 0
            scheduler.interval(this.frameDelayToDisplayFrames(scheduler, frames.getFrameDelayMs(0), speedControl.value), () => {
                if (stopped)
                    return false

                imageBox.clear()
                imageBox.add(frames.getFrame(frameIndex))

                //the next frame may have a different delay, and the user can change the speed while we run
                const displayFrames = this.frameDelayToDisplayFrames(scheduler, frames.getFrameDelayMs(frameIndex), speedControl.value)
                frameIndex = (frameIndex + 1) % frames.length()
                return displayFrames
            })
        }

        /** Load and show the image. Returns false (and shows an error/blank status) if it could not be loaded. */
        const loadAndShowImage = async (): Promise<boolean> => {

            //pause the (preview) renderer while we do slow network and decoding stuff
            scheduler.stop()
            let frames: AnimatedImage
            try {
                const ttlMs = cacheForeverControl.enabled ? undefined : cacheTtlControl.value * 60 * 1000
                frames = await this.cachedImageFrames(imageUrlControl.text, imageBox, resizeFitControl.selected as keyof sharp.FitEnum, ttlMs,
                    () => showStatusText("loading", loadingTextColor))
            } catch (e) {
                console.error(logPrefix, "failed to load", imageUrlControl.text, e)
                showStatusText("error", errorTextColor)
                return false
            } finally {
                //always resume: without this a failed load blocks this displays render loop forever
                scheduler.resume()
            }

            if (frames.length() === 0) {
                console.warn(logPrefix, "image has no frames:", imageUrlControl.text)
                showStatusText("error", errorTextColor)
                return false
            }

            showFrames(frames)
            return true
        }

        if (!await loadAndShowImage())
            return

        //auto-refresh reuses the cache TTL as the reload interval: once it elapses the cached copy is
        //stale anyway, so reloading naturally refetches the image
        if (autoRefreshControl.enabled && !cacheForeverControl.enabled) {
            const refreshIntervalSeconds = cacheTtlControl.value * 60+10
            while (true) {
                await scheduler.delayTime(refreshIntervalSeconds)
                await loadAndShowImage()
            }
        }
    }
}
