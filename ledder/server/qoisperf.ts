/*
 * QOIS *speed* benchmark (qoisbench.ts measures compression ratio, this one measures CPU time).
 *
 * Drives DisplayQOIShttp exactly like RenderRealtime does -- render() the pixel tree into the
 * display, then frame() to encode and write it -- against a fake express Response that throws the
 * bytes away. That isolates the encoder + buffer handling from the animation and from the socket.
 *
 * Usage:
 *   npm run qoisperf                                   # default animation set
 *   node ledder/server/qoisperf.js Fires/Fire:64:32 "Text:128:64:ledder"
 *
 * Each argument is <animationPath>:<width>:<height>[:<presetName>]
 */

import {readFile} from "node:fs/promises"

import Scheduler from "../Scheduler.js"
import RenderSettings from "../RenderSettings.js"
import ControlGroup from "../ControlGroup.js"
import PixelBox from "../PixelBox.js"
import OffsetMapper from "./drivers/OffsetMapper.js"
import {DisplayQOIShttp} from "./drivers/DisplayQOIShttp.js"

//minimal stand-in for the express Response that DisplayQOIShttp writes into. Counts the bytes and
//keeps a reference to the last buffer, so buffer-reuse bugs would show up as a wrong byte count.
class FakeResponse {
    writable = true
    bytes = 0
    lastLength = 0

    write(chunk, cb) {
        this.bytes += chunk.length
        this.lastLength = chunk.length
        if (cb)
            cb()
        return true
    }

    set() {
    }

    flushHeaders() {
    }

    on() {
    }

    socket = {
        destroy() {
        }
    }
}

function stats(samples: Array<number>) {
    const sorted = Array.from(samples).sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)
    return {
        mean: sum / sorted.length,
        median: sorted[~~(sorted.length / 2)],
        p95: sorted[~~(sorted.length * 0.95)],
        max: sorted[sorted.length - 1],
    }
}

const us = (n: number) => `${(n * 1000).toFixed(1)}us`.padStart(9)

async function bench(animPath: string, width: number, height: number, preset: string, frames = 600, skip = 60) {
    const animModule = await import(`../animations/${animPath}.js`)
    const AnimClass = animModule.default

    const mapper = new OffsetMapper(width, height, true)
    const display = new DisplayQOIShttp(mapper, "perf")
    ;(display as any).gammaMapper.setGamma()

    const response = new FakeResponse()
    display.setResponseHandler(response as any)

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

    //let the animation settle and give V8 time to optimize the hot paths
    for (let i = 0; i < skip; i++) {
        await scheduler.__step(false)
        display.render(box, renderSettings.subpixelFiltering)
        display.frame(i * 1000)
    }

    const renderTimes = []
    const frameTimes = []
    let displayTime = 0

    for (let i = 0; i < frames; i++) {
        await scheduler.__step(false)

        const t0 = performance.now()
        display.render(box, renderSettings.subpixelFiltering)
        const t1 = performance.now()
        displayTime += 16000
        display.frame(displayTime)
        const t2 = performance.now()

        renderTimes.push(t1 - t0)
        frameTimes.push(t2 - t1)
    }

    const r = stats(renderTimes)
    const f = stats(frameTimes)
    const bytesPerFrame = response.bytes / (frames + skip)

    console.log(`\n=== ${animPath}${preset ? " [" + preset + "]" : ""}  ${width}x${height} (${width * height} px), ${frames} frames ===`)
    console.log(`                mean    median       p95       max`)
    console.log(`render()  ${us(r.mean)} ${us(r.median)} ${us(r.p95)} ${us(r.max)}`)
    console.log(`frame()   ${us(f.mean)} ${us(f.median)} ${us(f.p95)} ${us(f.max)}   ${bytesPerFrame.toFixed(0)} B/frame`)
    console.log(`frame() costs ${(f.mean * 1000000 / (width * height)).toFixed(1)} ns/pixel, ` +
        `max sustainable ${(1000 / f.mean).toFixed(0)} fps on one core (encode+write only)`)
}

let specs = process.argv.slice(2)
if (specs.length === 0)
    specs = [
        "Fires/PlasmaFire:64:32",
        "Fires/PlasmaFire:128:128",
        "Fires/Fire:64:32",
        "Fires/Fire:128:128",
        "Lights/PoliceLights:64:32",
        "Lights/PoliceLights:128:128",
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
