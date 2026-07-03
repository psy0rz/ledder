// QOIS encoder test/benchmark tool.
//
// Captures raw frame sequences from animations, measures how the current encoder
// compresses them, and round-trip verifies the encoded stream against a reference
// decoder that implements the full QOIS decoder contract (see DisplayQOIS.ts).
//
// Compile first (npx tsc), then run from anywhere:
//   node tools/qois/qois-frames.mjs capture        render animations, save raw frames to frames/*.bin
//   node tools/qois/qois-frames.mjs size           encode saved frames, print bytes/frame
//   node tools/qois/qois-frames.mjs verify         size + round-trip against the reference decoder
//   node tools/qois/qois-frames.mjs dump [ppc]     write frames/*.qois streams (test vectors for the
//                                                  ledstream firmware decoder, see ledstream/test/host).
//                                                  [ppc] sets the pixels-per-channel header field
//                                                  (default 0 = let the decoder use its compiled-in value)
//
// The captured .bin files are raw gamma-mapped RGB, frame after frame, in OffsetMapper
// order — exactly the bytes the encoder sees. They are not committed (see .gitignore);
// capture regenerates them, but note the exact bytes depend on animation randomness.

import {fileURLToPath} from "node:url"
import {dirname, join} from "node:path"
import {readFile, writeFile, mkdir} from "node:fs/promises"

const TOOLDIR = dirname(fileURLToPath(import.meta.url))
process.chdir(join(TOOLDIR, "..", "..")) //animations load fonts/images relative to the repo root
const R = join(TOOLDIR, "..", "..", "ledder")
const DIR = join(TOOLDIR, "frames")

const {default: OffsetMapper} = await import(`${R}/server/drivers/OffsetMapper.js`)
const {DisplayQOIS} = await import(`${R}/server/DisplayQOIS.js`)
const {default: Color} = await import(`${R}/Color.js`)
const {default: Scheduler} = await import(`${R}/Scheduler.js`)
const {default: ControlGroup} = await import(`${R}/ControlGroup.js`)
const {default: PixelBox} = await import(`${R}/PixelBox.js`)

//animation, width, height, preset (null = default controls)
const cases = [
    ["Fires/PlasmaFire", 64, 32, null],
    ["Fires/Fire", 64, 32, null],
    ["Text/Marquee", 64, 32, "github"],
    ["Text/Marquee", 32, 8, "github"],
    ["Lights/PoliceLights", 64, 32, null],
]
const WARMUP_FRAMES = 120
const CAPTURE_FRAMES = 300

const caseName = ([anim, W, H, preset]) => `${anim.replaceAll("/", "_")}${preset ? "-" + preset : ""}-${W}x${H}`

class DisplayCapture extends DisplayQOIS {
    constructor(width, height, pixelsPerChannel = 0, identityGamma = false) {
        super(new OffsetMapper(width, height, true), pixelsPerChannel)
        if (identityGamma) {
            //raw captures are already gamma-mapped, dont apply gamma twice
            this.gammaMapper.length = 0
            for (let i = 0; i <= 255; i++) this.gammaMapper.push(i)
        } else
            this.gammaMapper.setGamma()
    }

    rawFrame() {
        const buf = Buffer.alloc(this.pixelCount * 3)
        for (let i = 0; i < this.pixelCount; i++) {
            const c = this.pixels[i]
            if (c !== undefined) {
                buf[i * 3] = this.gammaMapper[Math.round(c.r)]
                buf[i * 3 + 1] = this.gammaMapper[Math.round(c.g)]
                buf[i * 3 + 2] = this.gammaMapper[Math.round(c.b)]
            }
        }
        return buf
    }

    setFrame(raw) {
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++) {
                const i = (x + y * this.width) * 3
                this.setPixel(x, y, new Color(raw[i], raw[i + 1], raw[i + 2], 1))
            }
    }

    frame() { return 0 }
}

async function capture() {
    await mkdir(DIR, {recursive: true})
    for (const c of cases) {
        const [anim, W, H, preset] = c
        const {default: AnimClass} = await import(`${R}/animations/${anim}.js`)
        const display = new DisplayCapture(W, H)
        const scheduler = new Scheduler()
        scheduler.__setDefaultFrameTime(display.defaultFrameTimeMicros)
        const box = new PixelBox(display.bbox())
        const controls = new ControlGroup("root")
        if (preset)
            controls.load(JSON.parse(await readFile(`presets/${anim}/${preset}.json`, "utf8")).values)
        new AnimClass().run(box, scheduler, controls).catch(() => {})
        for (let i = 0; i < WARMUP_FRAMES; i++) await scheduler.__step(false)
        const raws = []
        for (let i = 0; i < CAPTURE_FRAMES; i++) {
            await scheduler.__step(false)
            display.render(box)
            raws.push(display.rawFrame())
        }
        await writeFile(join(DIR, `${caseName(c)}.bin`), Buffer.concat(raws))
        console.log(`captured ${caseName(c)}: ${raws.length} frames`)
    }
}

// Reference decoder implementing the QOIS decoder contract (see DisplayQOIS.ts):
// framebuffer + 64-color index persist across frames within a stream, px resets to
// black per frame, the index is updated ONLY by DIFF/LUMA/RGB ops (never RUN/INDEX/
// PREVFRAME — stock QOI updates it after every op, which desyncs a persistent index).
function makeStreamDecoder(pixelCount) {
    const index = new Array(64).fill(null).map(() => [0, 0, 0])
    const fb = Buffer.alloc(pixelCount * 3) //persistent framebuffer
    const hash = (c) => (c[0] * 3 + c[1] * 5 + c[2] * 7 + 255 * 11) % 64
    return function decodeFrame(bytes) {
        let px = [0, 0, 0]
        let p = 6 //skip frame header
        let run = 0
        for (let i = 0; i < pixelCount; i++) {
            if (run > 0) {
                run--
            } else {
                const b1 = bytes[p++]
                if (b1 === 0xff) { //QOIS_OP_PREVFRAME: keep N pixels from previous frame
                    let n = bytes[p++]
                    n |= bytes[p++] << 8
                    i += n - 1
                    if (i >= pixelCount) throw new Error("PREVFRAME run past frame end")
                    px = [fb[i * 3], fb[i * 3 + 1], fb[i * 3 + 2]] //px = last kept pixel, index untouched
                    continue
                } else if (b1 === 0xfe) { //RGB
                    px = [bytes[p++], bytes[p++], bytes[p++]]
                    index[hash(px)] = [...px]
                } else if ((b1 & 0xc0) === 0x00) { //INDEX
                    px = [...index[b1 & 0x3f]]
                } else if ((b1 & 0xc0) === 0x40) { //DIFF
                    px = [(px[0] + ((b1 >> 4) & 3) - 2) & 0xff, (px[1] + ((b1 >> 2) & 3) - 2) & 0xff, (px[2] + (b1 & 3) - 2) & 0xff]
                    index[hash(px)] = [...px]
                } else if ((b1 & 0xc0) === 0x80) { //LUMA
                    const b2 = bytes[p++]
                    const vg = (b1 & 0x3f) - 32
                    px = [(px[0] + vg - 8 + ((b2 >> 4) & 0x0f)) & 0xff, (px[1] + vg) & 0xff, (px[2] + vg - 8 + (b2 & 0x0f)) & 0xff]
                    index[hash(px)] = [...px]
                } else { //RUN
                    run = (b1 & 0x3f)
                }
            }
            fb[i * 3] = px[0]
            fb[i * 3 + 1] = px[1]
            fb[i * 3 + 2] = px[2]
        }
        if (p !== bytes.length) throw new Error(`decoder consumed ${p} of ${bytes.length} bytes`)
        return Buffer.from(fb)
    }
}

async function sizeAndVerify(doVerify) {
    let allOk = true
    for (const c of cases) {
        const [anim, W, H] = c
        const N = W * H
        const data = await readFile(join(DIR, `${caseName(c)}.bin`))
        const frames = data.length / (N * 3)
        const enc = new DisplayCapture(W, H, 0, true)
        const decode = doVerify ? makeStreamDecoder(N) : null
        let total = 0
        let ok = true
        for (let f = 0; f < frames; f++) {
            const raw = data.subarray(f * N * 3, (f + 1) * N * 3)
            enc.setFrame(raw)
            const bytes = []
            enc.encode(bytes, 0)
            total += bytes.length
            if (doVerify && !decode(bytes).equals(raw)) ok = false
        }
        allOk &&= ok
        console.log(`${caseName(c).padEnd(36)} ${(total / frames).toFixed(0).padStart(6)} B/frame` +
            (doVerify ? `  roundtrip:${ok ? "OK" : "MISMATCH"}` : ""))
    }
    if (doVerify) {
        console.log(allOk ? "\nAll round-trips exact." : "\nFAILURES present.")
        process.exitCode = allOk ? 0 : 1
    }
}

async function dump(ppc) {
    for (const c of cases) {
        const [anim, W, H] = c
        const N = W * H
        const data = await readFile(join(DIR, `${caseName(c)}.bin`))
        const frames = data.length / (N * 3)
        const enc = new DisplayCapture(W, H, ppc, true)
        const chunks = []
        for (let f = 0; f < frames; f++) {
            enc.setFrame(data.subarray(f * N * 3, (f + 1) * N * 3))
            const bytes = []
            enc.encode(bytes, f & 0xffff) //vary displayTime like real streams do
            chunks.push(Buffer.from(bytes))
        }
        const out = join(DIR, `${caseName(c)}${ppc ? `-${ppc}ppc` : ""}.qois`)
        await writeFile(out, Buffer.concat(chunks))
        console.log(`${out}: ${frames} frames, ${Buffer.concat(chunks).length} bytes`)
    }
}

const mode = process.argv[2]
if (mode === "capture") await capture()
else if (mode === "size") await sizeAndVerify(false)
else if (mode === "verify") await sizeAndVerify(true)
else if (mode === "dump") await dump(parseInt(process.argv[3] ?? "0"))
else console.log("usage: qois-frames.mjs capture | size | verify | dump [pixelsPerChannel]")
process.exit()
