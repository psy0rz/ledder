/*
 * QOIS compression benchmark.
 *
 * Renders animations headlessly (like RenderPreview) and compares the size of the
 * QOIS encoder output against generic per-frame compressors on the same
 * gamma-mapped RGB data:
 *  - deflate (zlib, levels 1 and 6): upper bound for what an LZ-class codec can do
 *  - lz4 (optional, `npm install --no-save lz4js`): stand-in for LZO/LZ4-class codecs
 *  - delta vs previous frame + deflate: video-style temporal reference
 *
 * Usage:
 *   npm run qoisbench                                # default animation set
 *   node ledder/server/qoisbench.js Fires/Fire:64:32 "Text:64:32:github"
 *
 * Each argument is <animationPath>:<width>:<height>[:<presetName>]
 */

import zlib from "node:zlib"
import {readFile} from "node:fs/promises"
import {createRequire} from "node:module"

import Scheduler from "../Scheduler.js"
import RenderSettings from "../RenderSettings.js"
import ControlGroup from "../ControlGroup.js"
import PixelBox from "../PixelBox.js"
import OffsetMapper from "./drivers/OffsetMapper.js"
import {DisplayQOIS} from "./DisplayQOIS.js"

let lz4
try {
    lz4 = createRequire(import.meta.url)("lz4js")
} catch (e) {
    console.log("(lz4js not installed, skipping LZ4 column. `npm install --no-save lz4js` to enable.)")
}

//capture display: exposes raw gamma-mapped RGB frames next to the real QOIS encoder output
class DisplayCapture extends DisplayQOIS {
    constructor(width: number, height: number) {
        super(new OffsetMapper(width, height, true), 0)
        this.gammaMapper.setGamma()
    }

    //raw gamma-mapped RGB buffer, same values the QOIS encoder sees
    rawFrame(): Buffer {
        const buf = Buffer.alloc(this.pixelCount * 3)
        const acc = this.pixelsRGB
        const table = this.gammaMapper.table
        //same rounding and clamping as the encoder, see DisplayQOIS.encode() pass 1
        for (let i = 0; i < this.pixelCount * 3; i++) {
            let v = (acc[i] + 0.5) | 0
            if (v < 0) v = 0; else if (v > 255) v = 255
            buf[i] = table[v]
        }
        return buf
    }

    frame(displayTimeMicros: number): number {
        return 0
    }
}

function mean(arr: Array<number>) {
    return arr.reduce((a, b) => a + b, 0) / arr.length
}

async function bench(animPath: string, width: number, height: number, preset: string, frames = 300, skip = 120) {
    const animModule = await import(`../animations/${animPath}.js`)
    const AnimClass = animModule.default

    const display = new DisplayCapture(width, height)
    const renderSettings = new RenderSettings()
    renderSettings.__useDisplayLimits(display)
    const scheduler = new Scheduler(renderSettings)
    const box = new PixelBox(display.bbox())
    const controls = new ControlGroup("root")

    if (preset) {
        const pv = JSON.parse(await readFile(`presets/${animPath}/${preset}.json`, "utf8"))
        controls.load(pv.values)
    }

    //normally done by AnimationManager: takes the render settings of the preset
    renderSettings.__createControls(controls)

    const anim = new AnimClass()
    anim.run(box, scheduler, controls).catch(() => {
    })

    for (let i = 0; i < skip; i++)
        await scheduler.__step(false)

    const sizes = {qois: [], lz4: [], deflate1: [], deflate6: [], tDeflate: []}
    let prevRaw: Buffer = null
    let unchanged = 0

    for (let i = 0; i < frames; i++) {
        await scheduler.__step(false)
        display.render(box, renderSettings.subpixelFiltering)

        const raw = display.rawFrame()

        //temporal delta (XOR with previous frame) + deflate as video-style reference
        const delta = Buffer.alloc(raw.length)
        if (prevRaw) {
            let same = true
            for (let b = 0; b < raw.length; b++) {
                delta[b] = raw[b] ^ prevRaw[b]
                if (delta[b] !== 0) same = false
            }
            if (same) unchanged++
        } else raw.copy(delta)
        prevRaw = raw

        //consumes display pixels, encodes one frame into the displays frame buffer
        sizes.qois.push(display.encode(0))
        if (lz4)
            sizes.lz4.push(lz4.compress(raw).length)
        sizes.deflate1.push(zlib.deflateRawSync(raw, {level: 1}).length)
        sizes.deflate6.push(zlib.deflateRawSync(raw, {level: 6}).length)
        sizes.tDeflate.push(zlib.deflateRawSync(delta, {level: 6}).length)
    }

    const rawSize = width * height * 3
    const fmt = (name: string, arr: Array<number>) => {
        const m = mean(arr)
        return `${name.padEnd(9)} ${m.toFixed(0).padStart(6)} B/frame  (${(rawSize / m).toFixed(1)}x)`
    }
    console.log(`\n=== ${animPath}${preset ? " [" + preset + "]" : ""}  ${width}x${height}  raw=${rawSize} B/frame, ${frames} frames, ${unchanged} unchanged ===`)
    console.log(fmt("QOIS", sizes.qois))
    if (lz4)
        console.log(fmt("LZ4", sizes.lz4))
    console.log(fmt("deflate1", sizes.deflate1))
    console.log(fmt("deflate6", sizes.deflate6))
    console.log(fmt("Δ+defl6", sizes.tDeflate))
}

let specs = process.argv.slice(2)
if (specs.length === 0)
    specs = [
        "Fires/PlasmaFire:64:32",
        "Fires/Fire:64:32",
        "Text:64:32:github",
        "Text:32:8:github",
        "Lights/PoliceLights:64:32",
    ]

for (const spec of specs) {
    const [anim, w, h, preset] = spec.split(":")
    try {
        await bench(anim, parseInt(w), parseInt(h), preset)
    } catch (e) {
        console.log(`\n=== ${anim} ${w}x${h}: FAILED: ${e.message.split("\n")[0]}`)
    }
}
process.exit(0)
