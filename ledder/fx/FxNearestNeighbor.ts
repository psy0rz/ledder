import Fx from "../Fx.js"
import ControlGroup from "../ControlGroup.js"
import PixelList from "../PixelList.js"
import Scheduler from "../Scheduler.js"
import PixelBox from "../PixelBox.js"
import Pixel from "../Pixel.js"
import Color from "../Color.js"

/**
 * Nearest Neighbor antialiasing effect for smooth pixel rendering
 * Blends each pixel with its neighbors to reduce jagged edges
 * Works on animated frames by applying antialiasing each interval
 */
export default class FxNearestNeighbor extends Fx {
    private intensity: number = 0.3

    constructor(scheduler: Scheduler, controls: ControlGroup, intensity: number = 0.3) {
        super(scheduler, controls)
        this.intensity = intensity
    }

    run(container: PixelList, target?: PixelBox): Promise<any> {
        if (target !== undefined && target.size)
            throw ("Please use an empty target container")

        this.running = true

        this.promise = this.scheduler.interval(1, () => {
            if (!this.running) return false

            // Process each frame in the container (for FxMovie frame collections)
            for (const item of container.values()) {
                if (item instanceof PixelList) {
                    this.processFrame(item)
                }
            }

            if (this.running)
                return 1
            else
                return false
        })
        
        return this.promise
    }

    private processFrame(frame: PixelList) {
        // Build a map of current pixel positions and collect pixels
        const pixelMap: Map<string, Pixel> = new Map()
        const pixels: Pixel[] = []
        
        frame.forEachPixel((pixel) => {
            const key = `${pixel.x},${pixel.y}`
            pixelMap.set(key, pixel)
            pixels.push(pixel)
        })

        // Clear frame and rebuild with antialiased pixels
        frame.clear()

        // Process each pixel with neighbor blending
        for (const pixel of pixels) {
            const x = pixel.x
            const y = pixel.y
            
            // Get neighboring pixels (8 neighbors)
            const neighbors: Pixel[] = []
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue
                    const key = `${x + dx},${y + dy}`
                    const neighbor = pixelMap.get(key)
                    if (neighbor) {
                        neighbors.push(neighbor)
                    }
                }
            }

            // Apply blending if neighbors exist
            if (neighbors.length > 0) {
                let r = pixel.color.r * (1 - this.intensity)
                let g = pixel.color.g * (1 - this.intensity)
                let b = pixel.color.b * (1 - this.intensity)
                let a = pixel.color.a * (1 - this.intensity)

                const neighborWeight = this.intensity / neighbors.length

                for (const neighbor of neighbors) {
                    r += neighbor.color.r * neighborWeight
                    g += neighbor.color.g * neighborWeight
                    b += neighbor.color.b * neighborWeight
                    a += neighbor.color.a * neighborWeight
                }

                // Create new pixel with blended color
                const blendedColor = new Color(
                    Math.floor(r),
                    Math.floor(g),
                    Math.floor(b),
                    a,
                    true
                )
                const blendedPixel = new Pixel(x, y, blendedColor)
                frame.add(blendedPixel)
            } else {
                // No neighbors, keep original pixel
                frame.add(pixel)
            }
        }
    }
}
