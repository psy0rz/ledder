import Animator from "../../Animator.js"
import ControlGroup from "../../ControlGroup.js"
import PixelBox from "../../PixelBox.js"
import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import Scheduler from "../../Scheduler.js"
import sharp from "sharp"
import drawImage from "../../draw/DrawImage.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import { random } from "../../utils.js"

// The icon follows the 8x8 grid in the supplied SVG.
const icon = [
    "ww.ww.ww",
    "ww.ww.ww",
    ".wwwwww.",
    ".wwwwww.",
    ".wwwwww.",
    ".ww..ww.",
    ".ww..ww.",
    "www..www",
]

const hackerText = `
w.w..w...ww.w.w.www.ww.......w.
w.w.w.w.w...w.w.w...w.w.....w.w
www.www.w...ww..ww..ww.......w.
w.w.w.w.w...w.w.w...w.w.....w.w
w.w.w.w..ww.w.w.www.w.w......ww
`
const makerspaceText = `
w.w..w..w.w.www.ww...ww.ww...w...ww.www
www.w.w.w.w.w...w.w.w...w.w.w.w.w...w..
www.www.ww..ww..ww...w..ww..www.w...ww.
w.w.w.w.w.w.w...w.w...w.w...w.w.w...w..
w.w.w.w.w.w.www.w.w.ww..w...w.w..ww.www
`
const drentheText = `
ww..ww..www.w.w.www.w.w.www
w.w.w.w.w...ww...w..w.w.w..
w.w.ww..ww..www..w..www.ww.
w.w.w.w.w....ww..w..w.w.w..
ww..w.w.www.w.w..w..w.w.www
`
const hackerspaceText = hackerText.trim().split("\n").map((row, i) =>
    row.slice(0, 23) + "." + makerspaceText.trim().split("\n")[i].slice(20),
).join("\n")

function pixelIcon(size: number): PixelList {
    const logo = new PixelList()
    const white = new Color(255, 255, 255)
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (icon[Math.floor(y * 8 / size)][Math.floor(x * 8 / size)] === "w")
                logo.add(new Pixel(x, y, white))
        }
    }
    return logo
}

function pixelWordmark(width: number, height: number): PixelList {
    const logo = new PixelList()
    const iconScale = Math.min(4, Math.floor((height - 18) / 8), Math.floor(width / 8))
    const iconSize = iconScale * 8
    const mark = pixelIcon(iconSize)
    mark.move(Math.floor((width - iconSize) / 2), 0)
    logo.add(mark)

    logo.add(new DrawAsciiArtColor(Math.floor((width - 31) / 2), iconSize + 1, hackerText))
    logo.add(new DrawAsciiArtColor(Math.floor((width - 39) / 2), iconSize + 7, makerspaceText))

    const red = new Color(193, 0, 0)
    const drentheX = Math.floor((width - 27) / 2)
    logo.add(new DrawAsciiArtColor(drentheX, iconSize + 13, drentheText).setColor(red))
    for (let x = 0; x < width; x++) {
        if (x < drentheX - 1 || x >= drentheX + 28)
            logo.add(new Pixel(x, iconSize + 15, red))
    }
    return logo
}

function textWordmark(first: string, second: string, secondRed: boolean): PixelList {
    const logo = new PixelList()
    const top = new DrawAsciiArtColor(0, 0, first)
    const bottom = new DrawAsciiArtColor(0, 6, second)
    if (secondRed)
        bottom.setColor(new Color(193, 0, 0))
    const width = Math.max(top.bbox().xMax + 1, bottom.bbox().xMax + 1)
    top.centerH((width - 1) / 2, 0)
    bottom.centerH((width - 1) / 2, 0)
    logo.add(top)
    logo.add(bottom)
    return logo
}

function horizontalWordmark(): PixelList {
    const logo = pixelIcon(8)
    logo.add(new DrawAsciiArtColor(10, 1, hackerText))
    logo.add(new DrawAsciiArtColor(43, 1, makerspaceText))
    logo.add(new DrawAsciiArtColor(84, 1, drentheText).setColor(new Color(193, 0, 0)))
    return logo
}

function fitPixelArt(logo: PixelList, box: PixelBox): PixelList {
    const bounds = logo.bbox()
    const scale = Math.max(1, Math.min(
        4,
        Math.floor(box.width() / (bounds.xMax - bounds.xMin + 1)),
        Math.floor(box.height() / (bounds.yMax - bounds.yMin + 1)),
    ))
    if (scale === 1)
        return logo

    const scaled = new PixelList()
    logo.forEachPixel(pixel => {
        for (let y = 0; y < scale; y++)
            for (let x = 0; x < scale; x++)
                scaled.add(new Pixel((pixel.x - bounds.xMin) * scale + x, (pixel.y - bounds.yMin) * scale + y, pixel.color))
    })
    return scaled
}

export default class HackerspaceDrenthe extends Animator {
    static description = "Hackerspace Drenthe logo assembles from pixels, then gently pulses."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const layout = controls.select("Logo layout", "auto", [
            { id: "auto", name: "Adaptive pixel art" },
            { id: "original", name: "Original SVG" },
            { id: "icon", name: "Icon only" },
            { id: "full", name: "Full pixel-art logo" },
            { id: "hackerspace", name: "Hackerspace Drenthe" },
            { id: "makerspace", name: "Hacker & Makerspace" },
            { id: "horizontal", name: "8-pixel horizontal" },
        ], true)
        const effects = controls.group("Effects")
        const twinkle = effects.switch("Twinkle", false, false)
        const colorCycle = effects.switch("Color cycle", false, false)
        const scanLine = effects.switch("Moving scan line", false, false)
        const glitch = effects.switch("Glitch", false, false)
        const floating = effects.switch("Floating motion", false, false)
        const zoom = effects.switch("Zoom", false, false)
        const zoomSpeed = effects.value("Zoom speed", 1, 0, 10, 0.1)
        const verticalScroll = effects.switch("Vertical scroll", false, false)
        const scrollSpeed = effects.value("Vertical scroll speed (pixels/frame)", 0.25, -10, 10, 0.25)
        const overflowSpeed = effects.value("Overflow scroll speed (pixels/frame)", 0.25, -10, 10, 0.25)

        // The trimmed SVG is 198x129; use it only when its text is legible and it fits vertically.
        let logo: PixelList
        const manualPixelLayout = ["icon", "full", "hackerspace", "makerspace", "horizontal"].includes(layout.selected)
        if (layout.selected === "icon" || (layout.selected === "auto" && (box.width() < 40 || box.height() < 26))) {
            const available = Math.min(box.width(), box.height())
            const size = available < 8 ? available : Math.floor(available / 8) * 8
            logo = pixelIcon(size)
        } else if (layout.selected === "full") {
            logo = fitPixelArt(pixelWordmark(40, 26), box)
        } else if (layout.selected === "hackerspace") {
            logo = fitPixelArt(textWordmark(hackerspaceText, drentheText, true), box)
        } else if (layout.selected === "makerspace") {
            logo = fitPixelArt(textWordmark(hackerText, makerspaceText, false), box)
        } else if (layout.selected === "horizontal") {
            logo = horizontalWordmark()
        } else if (layout.selected === "auto" &&
            (box.width() < 128 || box.height() < Math.ceil(box.width() * 129 / 198))) {
            logo = pixelWordmark(box.width(), box.height())
        } else if (layout.selected === "auto" || layout.selected === "original") {
            scheduler.stop()
            try {
                logo = await drawImage(
                    0,
                    0,
                    sharp("images/hackerspace-drenthe.svg").trim().resize({ width: box.width() }).ensureAlpha(),
                )
            } finally {
                scheduler.resume()
            }
        } else {
            throw new Error(`Unknown logo layout: ${layout.selected}`)
        }
        logo.center(box)

        const pixels: { pixel: Pixel, copies: Pixel[], x: number, y: number, color: Color, phase: number }[] = []
        logo.forEachPixel(pixel => {
            const color = new Color(pixel.color.r, pixel.color.g, pixel.color.b, pixel.color.a)
            pixel.color = color.copy()
            pixels.push({ pixel, copies: [], x: pixel.x, y: pixel.y, color, phase: Math.random() * Math.PI * 2 })
        })
        const bounds = logo.bbox()
        const centerX = (bounds.xMin + bounds.xMax) / 2
        const centerY = (bounds.yMin + bounds.yMax) / 2
        const overflowX = manualPixelLayout && bounds.xMax - bounds.xMin + 1 > box.width()
        const overflowY = manualPixelLayout && bounds.yMax - bounds.yMin + 1 > box.height()

        for (let i = pixels.length - 1; i > 0; i--) {
            const j = random(0, i)
            const pixel = pixels[i]
            pixels[i] = pixels[j]
            pixels[j] = pixel
        }

        const assembledLogo = new PixelList()
        box.add(assembledLogo)

        const pixelsPerFrame = Math.max(1, Math.ceil(pixels.length / 120))
        let nextPixel = 0
        let pulseFrame = 0
        let frame = 0
        let zoomPhase = 0
        let scrollPosition = 0
        let horizontalPosition = 0
        const rainbow = new Color()

        scheduler.interval(1, () => {
            for (let i = 0; i < pixelsPerFrame && nextPixel < pixels.length; i++)
                assembledLogo.add(pixels[nextPixel++].pixel)

            const brightness = nextPixel < pixels.length ? 1 : 0.88 + 0.12 * Math.sin(pulseFrame++ / 30)
            const scale = zoom.enabled
                ? 0.25 + 3.75 * (1 - Math.cos(zoomPhase)) / 2
                : floating.enabled ? 0.9 : 1
            const samples = Math.ceil(scale)
            const marginX = Math.max(0, Math.min(
                centerX + (bounds.xMin - centerX) * scale - box.xMin,
                box.xMax - centerX - (bounds.xMax - centerX) * scale,
            ))
            const marginY = Math.max(0, Math.min(
                centerY + (bounds.yMin - centerY) * scale - box.yMin,
                box.yMax - centerY - (bounds.yMax - centerY) * scale,
            ))
            const offsetX = floating.enabled ? Math.sin(frame / 45) * Math.min(2, marginX) : 0
            const offsetY = floating.enabled ? Math.sin(frame / 57) * Math.min(2, marginY) : 0
            const scanY = bounds.yMin + (frame % ((bounds.yMax - bounds.yMin + 1) * 3)) / 3
            const glitchActive = glitch.enabled && frame % 180 < 6
            const glitchBand = Math.floor(frame / 3) % 4
            const glitchOffset = frame % 2 === 0 ? 2 : -2
            const scrollWidth = box.width() + Math.ceil((bounds.xMax - bounds.xMin + 1) * scale)
            const scrollHeight = box.height() + Math.ceil((bounds.yMax - bounds.yMin + 1) * scale)
            const scrollOffsetX = overflowX ? Math.trunc(horizontalPosition) : 0
            const scrollY = verticalScroll.enabled || overflowY
            const scrollOffsetY = scrollY ? Math.trunc(scrollPosition) : 0
            let horizontalWraps = 0
            if (overflowX) {
                const nextPosition = horizontalPosition + overflowSpeed.value
                horizontalWraps = Math.trunc(nextPosition / scrollWidth)
                horizontalPosition = nextPosition % scrollWidth
            }
            if (verticalScroll.enabled)
                scrollPosition = (scrollPosition + scrollSpeed.value) % scrollHeight
            else if (overflowY)
                scrollPosition = (scrollPosition + (overflowX ? horizontalWraps * box.height() : overflowSpeed.value)) % scrollHeight
            else
                scrollPosition = 0

            for (let i = 0; i < nextPixel; i++) {
                const { pixel, copies, x, y, color, phase } = pixels[i]
                const scaledX = centerX + (x - centerX) * scale + offsetX
                const scaledY = centerY + (y - centerY) * scale + offsetY
                let shiftX = 0
                if (glitchActive && Math.floor(y - bounds.yMin) % 4 === glitchBand)
                    shiftX = glitchOffset

                const sampleCount = samples * samples
                let visibleSamples = 0
                const outsideX = samples > 1 && !overflowX && (scaledX + shiftX + scale / 2 < box.xMin - 1 || scaledX + shiftX - scale / 2 > box.xMax + 1)
                const outsideY = samples > 1 && !scrollY && (scaledY + scale / 2 < box.yMin - 1 || scaledY - scale / 2 > box.yMax + 1)
                for (let sample = 0; sample < sampleCount && !outsideX && !outsideY; sample++) {
                    let sampleX = scaledX + shiftX + ((sample % samples + 0.5) / samples - 0.5) * scale
                    let sampleY = scaledY + ((Math.floor(sample / samples) + 0.5) / samples - 0.5) * scale
                    if (overflowX)
                        sampleX = box.xMin + ((sampleX - box.xMin - scrollOffsetX) % scrollWidth + scrollWidth) % scrollWidth
                    if (scrollY)
                        sampleY = box.yMin + ((sampleY - box.yMin - scrollOffsetY) % scrollHeight + scrollHeight) % scrollHeight
                    if (samples > 1 && (sampleX < box.xMin - 1 || sampleX > box.xMax + 1 || sampleY < box.yMin - 1 || sampleY > box.yMax + 1))
                        continue

                    if (visibleSamples > 0 && copies.length < visibleSamples) {
                        const copy = new Pixel(0, 0, pixel.color)
                        copies.push(copy)
                        assembledLogo.add(copy)
                    }
                    const target = visibleSamples === 0 ? pixel : copies[visibleSamples - 1]
                    target.x = sampleX
                    target.y = sampleY
                    visibleSamples++
                }
                if (visibleSamples === 0)
                    pixel.y = box.yMin - 2
                while (copies.length > Math.max(0, visibleSamples - 1))
                    assembledLogo.delete(copies.pop())

                if (colorCycle.enabled) {
                    const intensity = Math.max(color.r, color.g, color.b) / 255
                    rainbow.setHsl((frame / 360 + (x - bounds.xMin) / Math.max(1, box.width())) % 1, 0.9, intensity * 0.5)
                    pixel.color.r = rainbow.r
                    pixel.color.g = rainbow.g
                    pixel.color.b = rainbow.b
                } else {
                    pixel.color.r = color.r
                    pixel.color.g = color.g
                    pixel.color.b = color.b
                }

                const sparkle = twinkle.enabled ? 0.7 + 0.3 * Math.pow(Math.max(0, Math.sin(frame / 11 + phase)), 12) : 1
                const scan = scanLine.enabled ? 0.65 + 0.35 * Math.max(0, 1 - Math.abs(y - scanY) / 2) : 1
                pixel.color.a = color.a * brightness * sparkle * scan
            }
            zoomPhase = (zoomPhase + zoomSpeed.value / 90) % (2 * Math.PI)
            frame++
        })
    }
}
