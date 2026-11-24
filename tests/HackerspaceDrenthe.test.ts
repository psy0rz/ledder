import assert from "node:assert/strict"
import test from "node:test"
import HackerspaceDrenthe from "../ledder/animations/Logos/HackerspaceDrenthe.js"
import ControlGroup from "../ledder/ControlGroup.js"
import PixelBox from "../ledder/PixelBox.js"
import RenderSettings from "../ledder/RenderSettings.js"
import Scheduler from "../ledder/Scheduler.js"

async function render(width: number, height: number, layout = "auto") {
    const box = new PixelBox({ xMin: 5, yMin: 7, xMax: width + 4, yMax: height + 6 })
    const controls = new ControlGroup()
    controls.load({ "Logo layout": { selected: layout } })
    const scheduler = new Scheduler(new RenderSettings())
    await new HackerspaceDrenthe().run(box, scheduler, controls)
    for (let frame = 0; frame < 150; frame++)
        await scheduler.__step(false)
    return { box, controls, scheduler }
}

test("small displays show a centered pixel-aligned version of the logo icon", async () => {
    for (const [width, height] of [[8, 8], [32, 16], [120, 8]]) {
        const { box } = await render(width, height)
        const bounds = box.bbox()
        assert(bounds.xMin >= box.xMin && bounds.xMax <= box.xMax)
        assert(bounds.yMin >= box.yMin && bounds.yMax <= box.yMax)
        assert.equal(bounds.xMax - bounds.xMin + 1, Math.min(height, 16))
        box.forEachPixel(pixel => {
            assert(Number.isInteger(pixel.x) && Number.isInteger(pixel.y))
            assert.equal(pixel.color.r, 255)
            assert.equal(pixel.color.g, 255)
            assert.equal(pixel.color.b, 255)
        })
    }
})

test("medium displays show the complete high-contrast pixel wordmark", async () => {
    const { box } = await render(64, 32)
    const bounds = box.bbox()
    assert.equal(bounds.xMin, box.xMin)
    assert.equal(bounds.xMax, box.xMax)
    assert(bounds.yMin >= box.yMin && bounds.yMax <= box.yMax)
    const redRows = new Set<number>()
    const whiteRows = new Set<number>()
    box.forEachPixel(pixel => {
        assert(Number.isInteger(pixel.x) && Number.isInteger(pixel.y))
        if (pixel.color.r === 193 && pixel.color.g === 0)
            redRows.add(pixel.y)
        else if (pixel.color.r === 255 && pixel.color.g === 255)
            whiteRows.add(pixel.y)
        else
            assert.fail("unexpected pixel color")
    })
    assert.equal(redRows.size, 5)
    assert.equal(whiteRows.size, 18)
})

test("wide displays use the SVG only when it fits vertically", async () => {
    const wide = await render(128, 32)
    const large = await render(128, 128)
    const wideBounds = wide.box.bbox()
    const largeBounds = large.box.bbox()
    assert(wideBounds.yMin >= wide.box.yMin && wideBounds.yMax <= wide.box.yMax)
    assert(largeBounds.yMax - largeBounds.yMin + 1 > 80)
    assert(largeBounds.yMin >= large.box.yMin && largeBounds.yMax <= large.box.yMax)
})

test("selectable pixel variants retain their distinct layouts", async () => {
    for (const [layout, width, height, expectedWidth, expectedHeight] of [
        ["icon", 64, 26, 24, 24],
        ["full", 64, 26, 40, 26],
        ["hackerspace", 64, 26, 43, 11],
        ["makerspace", 64, 26, 39, 11],
        ["horizontal", 120, 8, 111, 8],
    ] as const) {
        const { box } = await render(width, height, layout)
        const bounds = box.bbox()
        assert.equal(bounds.xMax - bounds.xMin + 1, expectedWidth, layout)
        assert.equal(bounds.yMax - bounds.yMin + 1, expectedHeight, layout)
        assert(bounds.xMin >= box.xMin && bounds.xMax <= box.xMax, layout)
        assert(bounds.yMin >= box.yMin && bounds.yMax <= box.yMax, layout)
    }
})

test("overflowing variants scroll all their pixels into view", async () => {
    for (const [layout, width, height, frames] of [
        ["horizontal", 64, 8, 200],
        ["full", 8, 8, 2000],
    ] as const) {
        const { box, controls, scheduler } = await render(width, height, layout)
        controls.group("Effects").value("Overflow scroll speed (pixels/frame)", 0.25, -10, 10, 0.25).value = 1
        const pixels = new Set<object>()
        const visible = new Set<object>()
        box.forEachPixel(pixel => pixels.add(pixel))
        for (let frame = 0; frame < frames; frame++) {
            await scheduler.__step(false)
            box.forEachPixel(pixel => {
                if (!pixel.isOutside(box))
                    visible.add(pixel)
            })
        }
        assert.equal(visible.size, pixels.size, `${layout} did not reveal every pixel`)
    }
})

test("overflow speed can pause and reverse horizontal scrolling", async () => {
    const { box, controls, scheduler } = await render(64, 8, "horizontal")
    const speed = controls.group("Effects").value("Overflow scroll speed (pixels/frame)", 0.25, -10, 10, 0.25)
    speed.value = 0
    await scheduler.__step(false)
    const pixels: { x: number, y: number }[] = []
    box.forEachPixel(pixel => pixels.push(pixel))
    const positions = pixels.map(pixel => pixel.x)
    await scheduler.__step(false)
    assert.deepEqual(pixels.map(pixel => pixel.x), positions)
    speed.value = -1
    await scheduler.__step(false)
    await scheduler.__step(false)
    for (let i = 0; i < pixels.length; i++)
        assert.equal(pixels[i].x, box.xMin + (positions[i] - box.xMin + 1) % (64 + 111))
})

test("original layout remains available and pixel layouts support effects", async () => {
    const original = await render(64, 8, "original")
    assert(original.box.bbox().yMax - original.box.bbox().yMin + 1 > 8)

    const { box, controls, scheduler } = await render(64, 32)
    const before: string[] = []
    box.forEachPixel(pixel => before.push(`${pixel.x},${pixel.y},${pixel.color.r},${pixel.color.g},${pixel.color.b}`))
    const effects = controls.group("Effects")
    const switches = ["Vertical scroll", "Zoom", "Color cycle", "Twinkle", "Moving scan line", "Glitch", "Floating motion"]
        .map(name => effects.switch(name, false, false))
    for (const effect of switches)
        effect.enabled = true
    for (let frame = 0; frame < 100; frame++)
        await scheduler.__step(false)
    let colored = false
    box.forEachPixel(pixel => {
        assert(Number.isFinite(pixel.x) && Number.isFinite(pixel.y))
        colored ||= pixel.color.r !== pixel.color.g
    })
    assert(colored)
    for (const effect of switches)
        effect.enabled = false
    await scheduler.__step(false)
    const after: string[] = []
    box.forEachPixel(pixel => after.push(`${pixel.x},${pixel.y},${pixel.color.r},${pixel.color.g},${pixel.color.b}`))
    assert.deepEqual(after, before)
})
