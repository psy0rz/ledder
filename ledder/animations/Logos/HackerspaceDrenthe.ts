import Animator from "../../Animator.js"
import ControlGroup from "../../ControlGroup.js"
import PixelBox from "../../PixelBox.js"
import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import Scheduler from "../../Scheduler.js"
import sharp from "sharp"
import drawImage from "../../draw/DrawImage.js"
import { random } from "../../utils.js"

export default class HackerspaceDrenthe extends Animator {
    static description = "Hackerspace Drenthe logo assembles from pixels, then gently pulses."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
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

        scheduler.stop()
        let logo: PixelList
        try {
            logo = await drawImage(
                0,
                0,
                sharp("images/hackerspace-drenthe.svg").trim().resize({ width: box.width() }).ensureAlpha(),
            )
        } finally {
            scheduler.resume()
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
            const scrollHeight = box.height() + Math.ceil((bounds.yMax - bounds.yMin + 1) * scale)
            const scrollOffset = verticalScroll.enabled ? Math.trunc(scrollPosition) : 0
            scrollPosition = verticalScroll.enabled ? (scrollPosition + scrollSpeed.value) % scrollHeight : 0

            for (let i = 0; i < nextPixel; i++) {
                const { pixel, copies, x, y, color, phase } = pixels[i]
                const scaledX = centerX + (x - centerX) * scale + offsetX
                const scaledY = centerY + (y - centerY) * scale + offsetY
                let shiftX = 0
                if (glitchActive && Math.floor(y - bounds.yMin) % 4 === glitchBand)
                    shiftX = glitchOffset

                const sampleCount = samples * samples
                let visibleSamples = 0
                const outsideX = samples > 1 && (scaledX + shiftX + scale / 2 < box.xMin - 1 || scaledX + shiftX - scale / 2 > box.xMax + 1)
                const outsideY = samples > 1 && !verticalScroll.enabled && (scaledY + scale / 2 < box.yMin - 1 || scaledY - scale / 2 > box.yMax + 1)
                for (let sample = 0; sample < sampleCount && !outsideX && !outsideY; sample++) {
                    const sampleX = scaledX + shiftX + ((sample % samples + 0.5) / samples - 0.5) * scale
                    let sampleY = scaledY + ((Math.floor(sample / samples) + 0.5) / samples - 0.5) * scale
                    if (verticalScroll.enabled)
                        sampleY = box.yMin + ((sampleY - box.yMin - scrollOffset) % scrollHeight + scrollHeight) % scrollHeight
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
