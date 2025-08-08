import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import DrawLine from "../../draw/DrawLine.js"
import DrawCircle from "../../draw/DrawCircle.js"
import { random } from "../../utils.js"

// Extensive synthwave color palette with smooth gradients
const colors = {
    // Neon colors
    neonPink: new Color(255, 20, 147, 1, true),
    neonCyan: new Color(0, 255, 255, 1, true),
    neonPurple: new Color(138, 43, 226, 1, true),
    neonGreen: new Color(57, 255, 20, 1, true),
    neonOrange: new Color(255, 165, 0, 1, true),
    neonBlue: new Color(30, 144, 255, 1, true),

    // Sun colors
    sunYellow: new Color(255, 255, 100, 1, true),
    sunOrange: new Color(255, 180, 50, 1, true),
    sunRed: new Color(255, 100, 80, 1, true),
    sunWhite: new Color(255, 255, 220, 1, true),
    sunsetOrange: new Color(255, 140, 30, 1, true),
    sunriseRed: new Color(255, 80, 60, 1, true),
    sunsetPink: new Color(255, 100, 150, 1, true),
    sunrisePurple: new Color(200, 80, 200, 1, true),

    // Sky colors
    skyDeepPurple: new Color(25, 0, 51, 1, true),
    skyPurple: new Color(40, 20, 80, 1, true),
    skyViolet: new Color(60, 40, 120, 1, true),
    skyBlue: new Color(30, 60, 150, 1, true),
    skyLightBlue: new Color(50, 100, 200, 1, true),
    skyNightDark: new Color(5, 0, 15, 1, true),
    skyDawnPurple: new Color(80, 40, 120, 1, true),
    skyDawnPink: new Color(150, 80, 120, 1, true),
    skyDayBlue: new Color(135, 206, 235, 1, true),

    // Grid colors
    gridCyan: new Color(0, 255, 255, 0.8, true),
    gridPink: new Color(255, 20, 147, 0.8, true),
    gridPurple: new Color(138, 43, 226, 0.8, true),
    gridBlue: new Color(30, 144, 255, 0.8, true),

    // Star colors
    starWhite: new Color(255, 255, 255, 1, true),
    starBlue: new Color(200, 220, 255, 1, true),
    starYellow: new Color(255, 255, 200, 1, true),
    starOrange: new Color(255, 220, 150, 1, true),



    // Ground colors
    groundDark: new Color(10, 0, 20, 1, true),
    groundPurple: new Color(30, 10, 40, 1, true),
    grass: new Color(0, 120, 40, 1, true),
    water: new Color(0, 100, 200, 0.8, true),

    // Tree colors
    trunkBrown: new Color(85, 65, 45, 1, true),
    branchBrown: new Color(110, 75, 50, 1, true),
    springGreen: new Color(120, 200, 100, 1, true),
    summerGreen: new Color(50, 180, 60, 1, true),
    autumnRed: new Color(200, 80, 60, 1, true),
    autumnOrange: new Color(220, 140, 65, 1, true),
    autumnYellow: new Color(210, 200, 70, 1, true)
}

// 3D Vector class with full transformation support - OPTIMIZED
class Vec3 {
    constructor(public x: number, public y: number, public z: number) {}

    copy(): Vec3 {
        return new Vec3(this.x, this.y, this.z)
    }

    add(v: Vec3): Vec3 {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z)
    }

    subtract(v: Vec3): Vec3 {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z)
    }

    multiply(scalar: number): Vec3 {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar)
    }

    dot(v: Vec3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }

    cross(v: Vec3): Vec3 {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        )
    }

    normalize(): Vec3 {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        if (length === 0) return new Vec3(0, 0, 0)
        const invLength = 1.0 / length // OPTIMIZED: Use multiplication instead of division
        return new Vec3(this.x * invLength, this.y * invLength, this.z * invLength)
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

    // OPTIMIZED: Add squared length to avoid sqrt when possible
    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }

    // OPTIMIZED: In-place operations to avoid object creation
    addInPlace(v: Vec3): void {
        this.x += v.x
        this.y += v.y
        this.z += v.z
    }

    multiplyInPlace(scalar: number): void {
        this.x *= scalar
        this.y *= scalar
        this.z *= scalar
    }
}

// 4x4 Matrix for 3D transformations
class Matrix4 {
    constructor(public m: number[][] = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]) {}

    static perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
        const f = 1.0 / Math.tan(fov / 2)
        const rangeInv = 1.0 / (near - far)

        return new Matrix4([
            [f / aspect, 0, 0, 0],
            [0, f, 0, 0],
            [0, 0, (near + far) * rangeInv, -1],
            [0, 0, 2 * far * near * rangeInv, 0]
        ])
    }

    static lookAt(eye: Vec3, target: Vec3, up: Vec3): Matrix4 {
        const zAxis = eye.subtract(target).normalize()
        const xAxis = up.cross(zAxis).normalize()
        const yAxis = zAxis.cross(xAxis)

        return new Matrix4([
            [xAxis.x, yAxis.x, zAxis.x, 0],
            [xAxis.y, yAxis.y, zAxis.y, 0],
            [xAxis.z, yAxis.z, zAxis.z, 0],
            [-xAxis.dot(eye), -yAxis.dot(eye), -zAxis.dot(eye), 1]
        ])
    }

    static rotationY(angle: number): Matrix4 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Matrix4([
            [cos, 0, sin, 0],
            [0, 1, 0, 0],
            [-sin, 0, cos, 0],
            [0, 0, 0, 1]
        ])
    }

    static translation(x: number, y: number, z: number): Matrix4 {
        return new Matrix4([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [x, y, z, 1]
        ])
    }

    multiply(other: Matrix4): Matrix4 {
        const result = new Matrix4()
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.m[i][j] = 0
                for (let k = 0; k < 4; k++) {
                    result.m[i][j] += this.m[i][k] * other.m[k][j]
                }
            }
        }
        return result
    }

    transformPoint(point: Vec3): Vec3 {
        const x = point.x * this.m[0][0] + point.y * this.m[1][0] + point.z * this.m[2][0] + this.m[3][0]
        const y = point.x * this.m[0][1] + point.y * this.m[1][1] + point.z * this.m[2][1] + this.m[3][1]
        const z = point.x * this.m[0][2] + point.y * this.m[1][2] + point.z * this.m[2][2] + this.m[3][2]
        const w = point.x * this.m[0][3] + point.y * this.m[1][3] + point.z * this.m[2][3] + this.m[3][3]

        if (w !== 0) {
            return new Vec3(x / w, y / w, z / w)
        }
        return new Vec3(x, y, z)
    }
}

// 3D Camera system
class Camera3D {
    position: Vec3
    target: Vec3
    up: Vec3
    fov: number
    near: number
    far: number

    constructor(position: Vec3, target: Vec3) {
        this.position = position
        this.target = target
        this.up = new Vec3(0, 1, 0)
        this.fov = Math.PI / 2.5   // Wider FOV (72 degrees) for better object visibility
        this.near = 0.1   // Keep near plane reasonable
        this.far = 20     // Closer far plane since objects are closer
    }

    getViewMatrix(): Matrix4 {
        return Matrix4.lookAt(this.position, this.target, this.up)
    }

    getProjectionMatrix(aspect: number): Matrix4 {
        return Matrix4.perspective(this.fov, aspect, this.near, this.far)
    }
}

// 3D Triangle for rendering
class Triangle3D {
    constructor(public v1: Vec3, public v2: Vec3, public v3: Vec3, public color: Color) {}

    getNormal(): Vec3 {
        const edge1 = this.v2.subtract(this.v1)
        const edge2 = this.v3.subtract(this.v1)
        return edge1.cross(edge2).normalize()
    }

    getCenter(): Vec3 {
        return new Vec3(
            (this.v1.x + this.v2.x + this.v3.x) / 3,
            (this.v1.y + this.v2.y + this.v3.y) / 3,
            (this.v1.z + this.v2.z + this.v3.z) / 3
        )
    }
}

// 3D Mesh object
class Mesh3D {
    triangles: Triangle3D[] = []
    position: Vec3
    rotation: Vec3
    scale: Vec3

    constructor(position: Vec3 = new Vec3(0, 0, 0)) {
        this.position = position
        this.rotation = new Vec3(0, 0, 0)
        this.scale = new Vec3(1, 1, 1)
    }

    addTriangle(triangle: Triangle3D) {
        this.triangles.push(triangle)
    }

    getWorldMatrix(): Matrix4 {
        const translation = Matrix4.translation(this.position.x, this.position.y, this.position.z)
        const rotationY = Matrix4.rotationY(this.rotation.y)
        return translation.multiply(rotationY)
    }
}

// 3D Renderer
class Renderer3D {
    private width: number
    private _height: number
    private camera: Camera3D
    private depthBuffer: number[][]

    constructor(width: number, height: number, camera: Camera3D) {
        this.width = width
        this._height = height
        this.camera = camera
        this.depthBuffer = Array(height).fill(null).map(() => Array(width).fill(Infinity))
    }
    public getHeight(): number {
        return this._height;
    }

    public getWidth(): number {
        return this.width;
    }

    clearDepthBuffer() {
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.depthBuffer[y][x] = Infinity
            }
        }
    }

    // Subpixel rendering helper - renders a pixel with fractional coordinates using anti-aliasing
    renderSubpixel(pl: PixelList, x: number, y: number, color: Color) {
        // Extract integer and fractional parts
        const x0 = Math.floor(x)
        const y0 = Math.floor(y)
        const fx = x - x0
        const fy = y - y0

        // Calculate coverage weights for 2x2 pixel grid
        const weights = [
            (1 - fx) * (1 - fy), // Top-left
            fx * (1 - fy),       // Top-right
            (1 - fx) * fy,       // Bottom-left
            fx * fy              // Bottom-right
        ]

        const positions = [
            [x0, y0],         // Top-left
            [x0 + 1, y0],     // Top-right
            [x0, y0 + 1],     // Bottom-left
            [x0 + 1, y0 + 1]  // Bottom-right
        ]

        // Render weighted pixels
        for (let i = 0; i < 4; i++) {
            const [px, py] = positions[i]
            const weight = weights[i]

            // Only render if weight is significant and within bounds
            if (weight > 0.01 && px >= 0 && px < this.width && py >= 0 && py < this._height) {
                const subpixelColor = color.copy()
                subpixelColor.a *= weight
                pl.add(new Pixel(px, py, subpixelColor))
            }
        }
    }

    // Subpixel line rendering using Xiaolin Wu's algorithm for smooth anti-aliased lines
    renderSubpixelLine(pl: PixelList, x1: number, y1: number, x2: number, y2: number, color1: Color, color2: Color) {
        const dx = Math.abs(x2 - x1)
        const dy = Math.abs(y2 - y1)

        // For very short lines, just render endpoints with subpixel precision
        if (dx < 1 && dy < 1) {
            this.renderSubpixel(pl, x1, y1, color1)
            this.renderSubpixel(pl, x2, y2, color2)
            return
        }

        // Determine if line is steep
        const steep = dy > dx

        let startX = x1, startY = y1, endX = x2, endY = y2
        let startColor = color1, endColor = color2

        // Swap coordinates if steep
        if (steep) {
            let temp = startX; startX = startY; startY = temp;
            temp = endX; endX = endY; endY = temp;
        }

        // Ensure left to right drawing
        if (startX > endX) {
            let temp = startX; startX = endX; endX = temp;
            temp = startY; startY = endY; endY = temp;
            let tempColor = startColor; startColor = endColor; endColor = tempColor;
        }

        const deltaX = endX - startX
        const deltaY = endY - startY
        const gradient = deltaX === 0 ? 1 : deltaY / deltaX

        // First endpoint
        let xEnd = Math.round(startX)
        let yEnd = startY + gradient * (xEnd - startX)
        let xGap = 1 - (startX + 0.5 - Math.floor(startX + 0.5))
        let xPixel1 = xEnd
        let yPixel1 = Math.floor(yEnd)

        // Render first endpoint with anti-aliasing
        this.renderAntiAliasedPixel(pl, xPixel1, yPixel1, 1 - (yEnd - yPixel1), xGap, startColor, steep)
        this.renderAntiAliasedPixel(pl, xPixel1, yPixel1 + 1, yEnd - yPixel1, xGap, startColor, steep)

        let interY = yEnd + gradient

        // Second endpoint
        xEnd = Math.round(endX)
        yEnd = endY + gradient * (xEnd - endX)
        xGap = endX + 0.5 - Math.floor(endX + 0.5)
        let xPixel2 = xEnd
        let yPixel2 = Math.floor(yEnd)

        // Render second endpoint with anti-aliasing
        this.renderAntiAliasedPixel(pl, xPixel2, yPixel2, 1 - (yEnd - yPixel2), xGap, endColor, steep)
        this.renderAntiAliasedPixel(pl, xPixel2, yPixel2 + 1, yEnd - yPixel2, xGap, endColor, steep)

        // Main loop for line body
        for (let x = xPixel1 + 1; x < xPixel2; x++) {
            const progress = (x - startX) / deltaX
            const interpolatedColor = this.interpolateColor(startColor, endColor, progress)

            const y = Math.floor(interY)
            this.renderAntiAliasedPixel(pl, x, y, 1 - (interY - y), 1, interpolatedColor, steep)
            this.renderAntiAliasedPixel(pl, x, y + 1, interY - y, 1, interpolatedColor, steep)

            interY += gradient
        }
    }

    // Helper for anti-aliased pixel rendering
    renderAntiAliasedPixel(pl: PixelList, x: number, y: number, coverage: number, intensity: number, color: Color, steep: boolean) {
        const finalX = steep ? y : x
        const finalY = steep ? x : y

        if (finalX >= 0 && finalX < this.width && finalY >= 0 && finalY < this._height && coverage > 0.01) {
            const pixelColor = color.copy()
            pixelColor.a *= coverage * intensity
            pl.add(new Pixel(finalX, finalY, pixelColor))
        }
    }

    // Color interpolation helper
    interpolateColor(color1: Color, color2: Color, t: number): Color {
        return new Color(
            Math.floor(color1.r * (1 - t) + color2.r * t),
            Math.floor(color1.g * (1 - t) + color2.g * t),
            Math.floor(color1.b * (1 - t) + color2.b * t),
            color1.a * (1 - t) + color2.a * t,
            true
        )
    }

    projectPoint(point: Vec3): {x: number, y: number, z: number} {
        const viewMatrix = this.camera.getViewMatrix()
        const projMatrix = this.camera.getProjectionMatrix(this.width / this._height)
        const mvpMatrix = projMatrix.multiply(viewMatrix)

        const projected = mvpMatrix.transformPoint(point)

        // Convert from NDC to screen coordinates
        const screenX = (projected.x + 1) * this.width * 0.5 // OPTIMIZED: Use multiplication instead of division
        const screenY = (1 - projected.y) * this._height * 0.5

        // OPTIMIZED: Remove debug logging that impacts performance

        return { x: screenX, y: screenY, z: projected.z }
    }

    renderMesh(mesh: Mesh3D, isDebug: boolean = false, noClip: boolean = false, lightingMultiplier: number = 1.0): PixelList {
        const pl = new PixelList()
        const worldMatrix = mesh.getWorldMatrix()

        // OPTIMIZED: Pre-allocate triangle array and reuse objects
        const worldTriangles: Triangle3D[] = []
        const cameraPos = this.camera.position

        // Transform triangles to world space and calculate distances in one pass
        for (let i = 0; i < mesh.triangles.length; i++) {
            const triangle = mesh.triangles[i]
            const worldV1 = worldMatrix.transformPoint(triangle.v1)
            const worldV2 = worldMatrix.transformPoint(triangle.v2)
            const worldV3 = worldMatrix.transformPoint(triangle.v3)

            const worldTriangle = new Triangle3D(worldV1, worldV2, worldV3, triangle.color)
            worldTriangles.push(worldTriangle)
        }

        // OPTIMIZED: Sort triangles by distance from camera (painter's algorithm) with faster distance calc
        worldTriangles.sort((a, b) => {
            // Use squared distance to avoid sqrt
            const aCenterSq = a.getCenter().subtract(cameraPos).lengthSquared()
            const bCenterSq = b.getCenter().subtract(cameraPos).lengthSquared()
            return bCenterSq - aCenterSq // Sort back to front
        })

        // OPTIMIZED: Batch render triangles
        for (let i = 0; i < worldTriangles.length; i++) {
            this.renderTriangle(worldTriangles[i], pl, isDebug, noClip, lightingMultiplier)
        }

        return pl
    }

    renderTriangle(triangle: Triangle3D, pl: PixelList, isDebug: boolean = false, noClip: boolean = false, lightingMultiplier: number = 1.0) {
        // Project vertices to screen space
        const p1 = this.projectPoint(triangle.v1)
        const p2 = this.projectPoint(triangle.v2)
        const p3 = this.projectPoint(triangle.v3)

        // OPTIMIZED: Remove debug logging that impacts performance

        // FIXED: Force NO CLIPPING for tree visibility - accept all objects
        if (false) { // Disable clipping completely for tree visibility
            // Only clip if ALL vertices are clearly behind camera or impossibly far
            if (p1.z < -0.5 && p2.z < -0.5 && p3.z < -0.5) return  // All vertices way behind camera
            if (p1.z > 200 && p2.z > 200 && p3.z > 200) return     // All vertices impossibly far
        }

        // OPTIMIZED: Pre-calculate lighting direction (static)
        const lightIntensity = Math.max(0.3, -triangle.getNormal().dot(this.lightDir)) * lightingMultiplier

        const litColor = triangle.color.copy()
        litColor.r = Math.floor(litColor.r * lightIntensity)
        litColor.g = Math.floor(litColor.g * lightIntensity)
        litColor.b = Math.floor(litColor.b * lightIntensity)
        litColor.a = 1.0 // Full opacity

        // OPTIMIZED: Reuse color calculations
        const wireColor = this.getWireColor(p1.z, triangle.v1.y < 0.2 && triangle.v2.y < 0.2 && triangle.v3.y < 0.2, lightingMultiplier)

        // Draw single thin lines for clean grid appearance with subpixel smoothing
        this.renderSubpixelLine(pl, p1.x, p1.y, p2.x, p2.y, wireColor, wireColor)
        this.renderSubpixelLine(pl, p2.x, p2.y, p3.x, p3.y, wireColor, wireColor)
        this.renderSubpixelLine(pl, p3.x, p3.y, p1.x, p1.y, wireColor, wireColor)

        // Fill triangle for solid objects (mountains, not grid)
        this.fillTriangle(p1, p2, p3, litColor, pl)
    }

    // OPTIMIZED: Pre-calculated light direction and wireframe color helper
    private lightDir = new Vec3(0.3, -0.8, 0.5).normalize()

    private getWireColor(z: number, isGrid: boolean, lightingMultiplier: number): Color {
        if (isGrid) {
            // Special handling for grid - neon green with transparency and lighting
            const c = colors.neonGreen.copy()
            c.r = Math.floor(57 * lightingMultiplier)
            c.g = Math.floor(255 * lightingMultiplier)
            c.b = Math.floor(20 * lightingMultiplier)
            c.a = 0.7 * lightingMultiplier  // Semi-transparent with lighting effect
            return c
        } else {
            // Normal wireframe for mountains etc with lighting
            const c = colors.neonCyan.copy()
            c.r = Math.floor(255 * lightingMultiplier)
            c.g = Math.floor(255 * lightingMultiplier)
            c.b = Math.floor(255 * lightingMultiplier)
            c.a = Math.max(0.5, (1.0 - Math.min(1, (z - 1.5) * 0.1)) * lightingMultiplier)
            return c
        }
    }

    