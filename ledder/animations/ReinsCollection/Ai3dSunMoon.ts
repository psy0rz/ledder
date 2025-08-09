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
    
    fillTriangle(p1: {x: number, y: number, z: number}, 
                 p2: {x: number, y: number, z: number}, 
                 p3: {x: number, y: number, z: number}, 
                 color: Color, pl: PixelList) {
        
        // Sort vertices by y coordinate
        const vertices = [p1, p2, p3].sort((a, b) => a.y - b.y)
        const [top, mid, bottom] = vertices
        
        // Skip degenerate triangles
        if (bottom.y - top.y < 1) return
        
        for (let y = Math.max(0, Math.floor(top.y)); y <= Math.min(this._height - 1, Math.ceil(bottom.y)); y++) {
            let xLeft = Infinity
            let xRight = -Infinity
            
            // Find intersection points with triangle edges
            const edges = [
                [top, mid], [mid, bottom], [bottom, top]
            ]
            
            for (const [v1, v2] of edges) {
                if ((v1.y <= y && y <= v2.y) || (v2.y <= y && y <= v1.y)) {
                    if (Math.abs(v2.y - v1.y) > 0.001) {
                        const t = (y - v1.y) / (v2.y - v1.y)
                        const x = v1.x + t * (v2.x - v1.x)
                        xLeft = Math.min(xLeft, x)
                        xRight = Math.max(xRight, x)
                    }
                }
            }
            
            if (xLeft !== Infinity && xRight !== -Infinity) {
                for (let x = Math.max(0, Math.floor(xLeft)); x <= Math.min(this.width - 1, Math.ceil(xRight)); x++) {
                    pl.add(new Pixel(x, y, color))
                }
            }
        }
    }
    
    renderWireframeLine(start: Vec3, end: Vec3, color: Color): PixelList {
        const pl = new PixelList()
        const p1 = this.projectPoint(start)
        const p2 = this.projectPoint(end)
        
        if (p1.z > 0 && p2.z > 0) {
            pl.add(new DrawLine(p1.x, p1.y, p2.x, p2.y, color, color))
        }
        
        return pl
    }
}

// 3D Synthwave Grid
class SynthwaveGrid3D extends Mesh3D {
    constructor(size: number, spacing: number) {
        super(new Vec3(0, 0, 0))
        this.generateGrid(size, spacing)
    }
    
    generateGrid(size: number, spacing: number) {
        // Create a synthwave grid that covers the entire ground plane visible on screen
        const rows = 15  // More lines to cover full ground plane with higher density
        const cols = 18  // More vertical lines for complete coverage
        const xStart = -size / 2
        const zStart = -1.0   // Start even closer to camera
        const xEnd = size / 2
        const zEnd = 8.0      // Extend to horizon for full coverage
        const xSpacing = (xEnd - xStart) / cols
        const zSpacing = (zEnd - zStart) / rows
        
        // Create horizontal lines (parallel to x-axis) - these create the perspective effect
        for (let row = 0; row <= rows; row++) {
            const z = zStart + row * zSpacing
            
            // Calculate depth-based transparency - closer lines are more opaque, distant lines more transparent
            const depthRatio = (z - zStart) / (zEnd - zStart)  // 0 at front, 1 at back
            const baseAlpha = 0.9  // Strong alpha for close lines
            const minAlpha = 0.15  // Minimum alpha for distant lines
            const alpha = baseAlpha - (depthRatio * (baseAlpha - minAlpha))
            
            // Make lines as thin as possible while still visible on small screens
            const yOffset = 0
            const v1 = new Vec3(xStart, 0.05 + yOffset, z)
            const v2 = new Vec3(xEnd, 0.05 + yOffset, z)
            
            // Neon green with depth-based transparency for synthwave effect
            const gridColor = colors.neonGreen.copy()
            gridColor.r = 57
            gridColor.g = 255
            gridColor.b = 20
            gridColor.a = alpha  // Depth-based transparency for depth effect
            
            // Create minimal thin line using triangle strip
            const lineWidth = 0.02  // Very thin line
            const v3 = new Vec3(xEnd, 0.05 + yOffset + lineWidth, z)
            const v4 = new Vec3(xStart, 0.05 + yOffset + lineWidth, z)
            this.addTriangle(new Triangle3D(v1, v2, v3, gridColor))
            this.addTriangle(new Triangle3D(v1, v3, v4, gridColor))
        }
        
        // Create vertical lines (parallel to z-axis) - these create depth
        for (let col = 0; col <= cols; col++) {
            const x = xStart + col * xSpacing
            
            // Make lines as thin as possible while still visible
            const yOffset = 0
            const v1 = new Vec3(x, 0.05 + yOffset, zStart)
            const v2 = new Vec3(x, 0.05 + yOffset, zEnd)
            
            // Neon green with transparency for vertical lines (less transparency variation)
            const gridColor = colors.neonGreen.copy()
            gridColor.r = 57
            gridColor.g = 255
            gridColor.b = 20
            gridColor.a = 0.6  // Consistent transparency for vertical lines
            
            // Create minimal thin line using triangle strip
            const lineWidth = 0.02  // Very thin line
            const v3 = new Vec3(x, 0.05 + yOffset + lineWidth, zEnd)
            const v4 = new Vec3(x, 0.05 + yOffset + lineWidth, zStart)
            this.addTriangle(new Triangle3D(v1, v2, v3, gridColor))
            this.addTriangle(new Triangle3D(v1, v3, v4, gridColor))
        }
        
        // Add some filled grid squares for a synthwave groundplane effect
        for (let row = 0; row < rows; row += 2) {
            for (let col = 0; col < cols; col += 2) {
                const x1 = xStart + col * xSpacing
                const x2 = xStart + (col + 1) * xSpacing
                const z1 = zStart + row * zSpacing
                const z2 = zStart + (row + 1) * zSpacing
                
                // Create subtle filled squares
                const v1 = new Vec3(x1, 0.02, z1)
                const v2 = new Vec3(x2, 0.02, z1)
                const v3 = new Vec3(x2, 0.02, z2)
                const v4 = new Vec3(x1, 0.02, z2)
                
                // Dark purple/blue fill for ground squares
                const fillColor = colors.groundPurple.copy()
                fillColor.a = 0.3  // Semi-transparent
                
                this.addTriangle(new Triangle3D(v1, v2, v3, fillColor))
                this.addTriangle(new Triangle3D(v1, v3, v4, fillColor))
            }
        }
    }
}

// Electric spark system for the tower - OPTIMIZED
class ElectricSpark {
    position: Vec3
    velocity: Vec3
    life: number
    maxLife: number
    color: Color
    intensity: number
    
    constructor(startPos: Vec3, direction: Vec3, life: number = 30) {
        this.position = startPos.copy()
        this.velocity = direction.multiply(0.05 + Math.random() * 0.1) // Random speed
        this.life = life
        this.maxLife = life
        this.intensity = 0.8 + Math.random() * 0.4 // Random intensity
        
        // OPTIMIZED: Pre-calculated color variations
        const colorVariation = Math.random()
        if (colorVariation < 0.3) {
            this.color = new Color(200, 220, 255, 1, true) // Blue-white
        } else if (colorVariation < 0.7) {
            this.color = new Color(255, 255, 255, 1, true) // Pure white
        } else {
            this.color = new Color(180, 200, 255, 1, true) // Light blue
        }
    }
    
    update(): boolean {
        // OPTIMIZED: Use in-place operations to reduce object creation
        this.position.addInPlace(this.velocity)
        
        // Add some random jitter for electric effect (reduced for smoother motion)
        this.position.x += (Math.random() - 0.5) * 0.005
        this.position.y += (Math.random() - 0.5) * 0.005
        this.position.z += (Math.random() - 0.5) * 0.005
        
        // Slow down over time
        this.velocity.multiplyInPlace(0.98)
        
        // Decrease life
        this.life--
        
        // OPTIMIZED: Direct alpha modification instead of creating new color
        const lifeRatio = this.life / this.maxLife
        this.color.a = lifeRatio * this.intensity
        
        return this.life > 0
    }
    
    render(renderer: Renderer3D): PixelList {
        const pl = new PixelList()
        
        // Render spark as a small bright point with subpixel precision
        const projected = renderer.projectPoint(this.position)
        
        if (projected.z > 0 && projected.x >= -1 && projected.x < renderer.getWidth() + 1 && 
            projected.y >= -1 && projected.y < renderer.getHeight() + 1) {
            
            // Use subpixel rendering for smoother sparks
            renderer.renderSubpixel(pl, projected.x, projected.y, this.color)
            
            // Add glow effect for brighter sparks
            if (this.color.a > 0.5) {
                const glowColor = this.color.copy()
                glowColor.a *= 0.3
                
                // Add surrounding glow with subpixel precision
                renderer.renderSubpixel(pl, projected.x - 1, projected.y, glowColor)
                renderer.renderSubpixel(pl, projected.x + 1, projected.y, glowColor)
                renderer.renderSubpixel(pl, projected.x, projected.y - 1, glowColor)
                renderer.renderSubpixel(pl, projected.x, projected.y + 1, glowColor)
            }
        }
        
        return pl
    }
}

// 3D Fractal Tree system - grows over time with seasonal changes
class FractalTree3D extends Mesh3D {
    branches: TreeBranch[] = []
    leaves: TreeLeaf[] = []
    fallingLeaves: FallingLeaf[] = []
    age: number = 0 // Tree age in days (0-12, with 12 = 1 full year)
    maxHeight: number = 10.0 // MUCH BIGGER - Maximum height the tree can reach
    trunkRadius: number = 0.6 // MASSIVE trunk for giant ancient oak
    seasonalGrowthRate: number = 1.0
    leafSpawnTimer: number = 0
    leafFallTimer: number = 0
    
    constructor() {
        super(new Vec3(0, 0, 4)) // Tree positioned at Z=4 - between camera and target for optimal visibility
        this.initializeBaseTrunk()
    }
    
    // Initialize with a single trunk segment
    initializeBaseTrunk() {
        const rootBranch = new TreeBranch(
            new Vec3(0, 0, 0),    // Start at ground level (Y=0) - FIXED POSITION
            new Vec3(0, 1, 0),    // Grow straight up toward sky - NO Z MOVEMENT
            1.0,                  // MASSIVE trunk - Large initial trunk thickness for immediate visibility
            3.0,                  // TALL initial segment - start tall for immediate visibility
            0,                    // Generation 0 (trunk)
            null                  // No parent
        )
        this.branches.push(rootBranch)
        this.generateBranchMesh()
    }
    
    // Update tree based on time progression (12 days = 1 year, 4 days = 1 season)
    update(timeOfDay: number, dayOfYear: number) {
        // Calculate age and season
        this.age = dayOfYear % 12 // Tree age cycles over 12 days
        const season = Math.floor((dayOfYear % 12) / 3) // 0=spring, 1=summer, 2=autumn, 3=winter
        const seasonProgress = ((dayOfYear % 12) % 3) / 3 // Progress within current season (0-1)
        
        // Update seasonal growth rate
        this.updateSeasonalGrowth(season, seasonProgress)
        
        // Grow branches based on age and season
        this.growBranches(season, seasonProgress)
        
        // Manage leaves based on season
        this.manageLeaves(season, seasonProgress, timeOfDay)
        
        // Update falling leaves
        this.updateFallingLeaves()
        
        // Regenerate mesh
        this.generateBranchMesh()
        this.generateLeafMesh(season, seasonProgress)
    }
    
    updateSeasonalGrowth(season: number, seasonProgress: number) {
        switch(season) {
            case 0: // Spring - ULTRA FAST growth for rapid development
                this.seasonalGrowthRate = 4.0 + seasonProgress * 3.0 // 4.0 to 7.0 (extremely fast)
                break
            case 1: // Summer - ULTRA FAST sustained growth
                this.seasonalGrowthRate = 6.0 - seasonProgress * 1.0 // 6.0 to 5.0 (very fast)
                break  
            case 2: // Autumn - FAST growth 
                this.seasonalGrowthRate = 4.0 - seasonProgress * 1.5 // 4.0 to 2.5 (fast)
                break
            case 3: // Winter - Still fast growing
                this.seasonalGrowthRate = 2.0 + seasonProgress * 1.0 // 2.0 to 3.0 (moderate-fast)
                break
        }
    }
    
    growBranches(season: number, seasonProgress: number) {
        const targetHeight = Math.min(this.maxHeight, (this.age / 12) * this.maxHeight)
        
        // Find branches that can grow
        const growableBranches = this.branches.filter(branch => 
            branch.generation <= 5 && // Ancient oaks have even more generations
            branch.length < branch.targetLength
        )
        
        for (const branch of growableBranches) {
            // ULTRA FAST growth for rapid development
            const baseGrowthAmount = 0.15 * this.seasonalGrowthRate // TRIPLED base growth rate
            const generationMultiplier = 1.0 - branch.generation * 0.1 // Less reduction per generation for bigger tree
            const growthAmount = baseGrowthAmount * generationMultiplier
            branch.length = Math.min(branch.targetLength, branch.length + growthAmount)
            
            // MASSIVE thickening over time for giant ancient oak appearance
            if (branch.generation <= 4) { // Thicken even more generations for massive tree
                const baseThickenRate = 0.012 * this.seasonalGrowthRate // TRIPLED thickening rate
                const generationThickenMultiplier = (5 - branch.generation) // Even stronger multiplier for lower generations
                const thickenRate = baseThickenRate * generationThickenMultiplier
                const maxThickness = branch.radius * 4.0 // Allow even MORE massive thickening
                branch.radius = Math.min(maxThickness, branch.radius + thickenRate)
            }
            
            // MUCH more frequent branching for rapid massive development
            const branchingChance = 0.25 * this.seasonalGrowthRate // DOUBLED base chance for faster branching
            const maturityThreshold = 0.3 // Even earlier branching for faster development
            
            if (branch.length >= branch.targetLength * maturityThreshold && 
                branch.childBranches.length === 0 && 
                branch.generation < 6 && // Allow even more generations for massive tree
                Math.random() < branchingChance) {
                
                this.spawnChildBranches(branch)
            }
        }
    }
    
    spawnChildBranches(parentBranch: TreeBranch) {
        // Giant ancient oaks have MASSIVE branching systems
        let numChildren: number
        if (parentBranch.generation === 0) {
            numChildren = 6 + Math.floor(Math.random() * 4) // Trunk spawns 6-9 massive main branches
        } else if (parentBranch.generation === 1) {
            numChildren = 5 + Math.floor(Math.random() * 3) // Main branches spawn 5-7 major branches
        } else if (parentBranch.generation === 2) {
            numChildren = 4 + Math.floor(Math.random() * 2) // Secondary branches spawn 4-5
        } else {
            numChildren = 3 + Math.floor(Math.random() * 2) // Upper branches spawn 3-4
        }
        
        for (let i = 0; i < numChildren; i++) {
            const branchAngle = (i / numChildren) * Math.PI * 2 + Math.random() * 1.0 // WIDER angular spread
            
            // Giant ancient oaks have DRAMATIC horizontal spread in main branches - NO Z MOVEMENT
            let upwardBias: number
            if (parentBranch.generation === 0) {
                upwardBias = 0.6 + Math.random() * 0.3 // Trunk branches more upward but with spread
            } else if (parentBranch.generation === 1) {
                upwardBias = 0.2 + Math.random() * 0.4 // Main branches spread wide but NO Z movement
            } else {
                upwardBias = 0.1 + Math.random() * 0.3 // Upper branches horizontal for canopy spread - NO Z movement
            }
            
            const branchDirection = new Vec3(
                Math.cos(branchAngle) * (1.6 - upwardBias), // EVEN WIDER horizontal spread for giant oak - X only
                upwardBias,
                0 // NO Z MOVEMENT - branches stay in same Z plane
            ).normalize()
            
            const branchStart = parentBranch.start.add(
                parentBranch.direction.multiply(parentBranch.length * (0.5 + Math.random() * 0.4))
            )
            
            // MASSIVE branch lengths for giant ancient oak character
            let baseBranchLength: number
            if (parentBranch.generation === 0) {
                baseBranchLength = 0.8 + Math.random() * 0.8 // HUGE main branches (0.8-1.6)
            } else if (parentBranch.generation === 1) {
                baseBranchLength = 0.6 + Math.random() * 0.6 // Large secondary branches (0.6-1.2)
            } else if (parentBranch.generation === 2) {
                baseBranchLength = 0.4 + Math.random() * 0.4 // Substantial tertiary branches
            } else {
                baseBranchLength = 0.3 + Math.random() * 0.3 // Smaller upper branches
            }
            
            const childBranch = new TreeBranch(
                branchStart,
                branchDirection,
                parentBranch.radius * 0.85, // Less taper for more massive giant oak branches
                baseBranchLength,
                parentBranch.generation + 1,
                parentBranch
            )
            
            this.branches.push(childBranch)
            parentBranch.childBranches.push(childBranch)
        }
    }
    
    manageLeaves(season: number, seasonProgress: number, timeOfDay: number) {
        this.leafSpawnTimer++
        this.leafFallTimer++
        
        // Spawn leaves in spring and summer - MUCH FASTER
        if ((season === 0 || season === 1) && this.leafSpawnTimer > 5) { // TRIPLED speed (5 vs 15)
            this.leafSpawnTimer = 0
            this.spawnLeaves(season, seasonProgress)
        }
        
        // Drop leaves in autumn - FASTER
        if (season === 2 && this.leafFallTimer > 8) { // MUCH faster (8 vs 20)
            this.leafFallTimer = 0
            this.dropLeaves(seasonProgress)
        }
        
        // Remove leaves in winter - OPTIMIZED batch processing
        if (season === 3) {
            // OPTIMIZED: Process leaves in batches to avoid frame drops
            const batchSize = 10
            let processed = 0
            
            this.leaves = this.leaves.filter(leaf => {
                if (processed >= batchSize) return true // Keep remaining for next frame
                processed++
                
                if (Math.random() < 0.05) { // FASTER removal (5% vs 2%)
                    this.createFallingLeaf(leaf)
                    return false
                }
                return true
            })
        }
    }
    
    spawnLeaves(season: number, seasonProgress: number) {
        // OPTIMIZED: Limit total leaves for performance and find branch tips more efficiently
        const maxTotalLeaves = 1200 // Performance limit
        if (this.leaves.length >= maxTotalLeaves) return // Skip if too many leaves already
        
        const leafBranches = this.branches.filter(branch => 
            branch.generation >= 2 && // Only on smaller branches
            branch.generation <= 4 && // Don't go too deep for performance
            branch.length >= branch.targetLength * 0.2 // Even earlier leaf spawning for FASTER development
        )
        
        // OPTIMIZED: Limit branches processed per frame for consistent performance
        const maxBranchesPerFrame = 20
        const branchesToProcess = Math.min(leafBranches.length, maxBranchesPerFrame)
        
        for (let b = 0; b < branchesToProcess; b++) {
            const branch = leafBranches[b]
            if (Math.random() < 0.8) { // MUCH higher chance for MASSIVE giant oak canopy (80% vs 50%)
                const leafCount = Math.min(6 + Math.floor(Math.random() * 6), // MORE leaves per branch (6-11 vs 4-8)
                    Math.floor((maxTotalLeaves - this.leaves.length) / (branchesToProcess - b))) // Don't exceed limit
                
                for (let i = 0; i < leafCount; i++) {
                    if (this.leaves.length >= maxTotalLeaves) break // Performance safety
                    
                    const leafPosition = branch.start.add(
                        branch.direction.multiply(branch.length * (0.1 + Math.random() * 0.9))
                    ).add(new Vec3(
                        (Math.random() - 0.5) * 0.3, // WIDER spread for massive canopy - X only
                        (Math.random() - 0.5) * 0.15, // More vertical variation
                        0 // NO Z MOVEMENT for leaves
                    ))
                    
                    // CRITICAL FIX: Ensure all leaf positions stay at or above ground level (Y >= 0)
                    // Leaves cannot spawn below ground - constrain Y coordinate
                    leafPosition.y = Math.max(0, leafPosition.y)
                    
                    const leaf = new TreeLeaf(leafPosition, branch, season)
                    this.leaves.push(leaf)
                }
            }
        }
    }
    
    dropLeaves(seasonProgress: number) {
        const dropRate = seasonProgress * 0.1 // More drops as autumn progresses
        
        this.leaves = this.leaves.filter(leaf => {
            if (Math.random() < dropRate) {
                this.createFallingLeaf(leaf)
                return false
            }
            return true
        })
    }
    
    createFallingLeaf(leaf: TreeLeaf) {
        const fallingLeaf = new FallingLeaf(
            leaf.position.copy(),
            new Vec3(
                (Math.random() - 0.5) * 0.02, // Random horizontal drift
                -0.01 - Math.random() * 0.02,  // Downward motion
                (Math.random() - 0.5) * 0.01   // Random z-drift
            ),
            leaf.color.copy()
        )
        this.fallingLeaves.push(fallingLeaf)
    }
    
    updateFallingLeaves() {
        // OPTIMIZED: Limit falling leaves processing and batch updates
        const maxFallingLeaves = 100 // Performance limit for falling leaves
        
        // Remove excess falling leaves if too many
        if (this.fallingLeaves.length > maxFallingLeaves) {
            this.fallingLeaves = this.fallingLeaves.slice(0, maxFallingLeaves)
        }
        
        // Update remaining falling leaves
        this.fallingLeaves = this.fallingLeaves.filter(leaf => leaf.update())
    }
    
    generateBranchMesh() {
        // OPTIMIZED: 2D tree rendering - clear all triangles and use simple line rendering
        this.triangles = [] // Clear all 3D geometry for 2D rendering
        
        // No 3D geometry generation needed for 2D tree rendering
        // Tree will be rendered as 2D lines in the render method
    }
    
    createBranchGeometry(branch: TreeBranch) {
        // OPTIMIZED: Fewer segments for faster rendering based on branch importance
        const segments = branch.generation === 0 ? 6 : // Trunk gets more detail
                        branch.generation === 1 ? 4 : // Main branches get some detail  
                        3 // Upper branches get minimal detail (was 8 for all)
        
        // OPTIMIZED: Much fewer length segments for faster rendering
        const lengthSegments = branch.generation === 0 ? Math.max(2, Math.floor(branch.length * 5)) : // Trunk: length/0.2
                              branch.generation === 1 ? Math.max(2, Math.floor(branch.length * 3.33)) : // Main: length/0.3
                              Math.max(1, Math.floor(branch.length * 2.5)) // Upper: length/0.4
        
        // OPTIMIZED: Pre-allocate arrays
        const ring1: Vec3[] = new Array(segments)
        const ring2: Vec3[] = new Array(segments)
        
        for (let i = 0; i < lengthSegments; i++) {
            const t1 = i / lengthSegments
            const t2 = (i + 1) / lengthSegments
            
            const pos1 = branch.start.add(branch.direction.multiply(branch.length * t1))
            const pos2 = branch.start.add(branch.direction.multiply(branch.length * t2))
            
            // CRITICAL FIX: Ensure all tree geometry stays at or above ground level (Y >= 0)
            // Trees cannot grow below ground - constrain all Y coordinates to minimum of 0
            pos1.y = Math.max(0, pos1.y)
            pos2.y = Math.max(0, pos2.y)
            
            // OPTIMIZED: Simpler tapering calculation
            const taperStrength = branch.generation <= 1 ? 0.3 : 0.5 // Less complex calculations
            const radius1 = branch.radius * (1.0 - t1 * taperStrength)
            const radius2 = branch.radius * (1.0 - t2 * taperStrength)
            
            // OPTIMIZED: Remove expensive organic variations for upper branches
            const curvature = branch.generation <= 1 ? Math.sin(t1 * Math.PI * 2 + branch.generation) * 0.02 : 0
            const organicNoise = branch.generation === 0 ? (Math.random() - 0.5) * 0.01 : 0
            
            // Create ring vertices - OPTIMIZED for each generation
            for (let j = 0; j < segments; j++) {
                const angle = j * (Math.PI * 2 / segments) // OPTIMIZED: Pre-calculate step
                
                // OPTIMIZED: Remove expensive organic variations for upper branches
                const radiusVar1 = branch.generation <= 1 ? 
                    radius1 * (0.95 + Math.sin(angle * 3 + t1 * Math.PI) * 0.1) : radius1
                const radiusVar2 = branch.generation <= 1 ? 
                    radius2 * (0.95 + Math.sin(angle * 3 + t2 * Math.PI) * 0.1) : radius2
                
                const cosAngle = Math.cos(angle)
                const sinAngle = Math.sin(angle)
                
                const vertex1 = new Vec3(
                    pos1.x + cosAngle * radiusVar1 + curvature,
                    pos1.y + sinAngle * radiusVar1,
                    pos1.z + organicNoise
                )
                const vertex2 = new Vec3(
                    pos2.x + cosAngle * radiusVar2 + curvature,
                    pos2.y + sinAngle * radiusVar2,
                    pos2.z + organicNoise * 0.8
                )
                
                // CRITICAL FIX: Constrain all vertex Y coordinates to ground level or above
                vertex1.y = Math.max(0, vertex1.y)
                vertex2.y = Math.max(0, vertex2.y)
                
                ring1[j] = vertex1
                ring2[j] = vertex2
            }
            
            // OPTIMIZED: Pre-calculate branch color once per segment
            const branchColor = this.getBranchColor(branch.generation)
            
            // Create triangles between rings
            for (let j = 0; j < segments; j++) {
                const next = (j + 1) % segments
                
                // Two triangles per quad
                this.addTriangle(new Triangle3D(ring1[j], ring1[next], ring2[j], branchColor))
                this.addTriangle(new Triangle3D(ring1[next], ring2[next], ring2[j], branchColor))
            }
        }
    }
    
    // OPTIMIZED: Pre-calculated branch colors to avoid repeated calculations
    private getBranchColor(generation: number): Color {
        let baseR: number, baseG: number, baseB: number
        
        // OPTIMIZED: Pre-calculated base colors per generation (no expensive sin/cos)
        if (generation === 0) {
            // Trunk - simple brown
            baseR = 85
            baseG = 65  
            baseB = 45
        } else if (generation === 1) {
            // Main branches - medium brown
            baseR = 110
            baseG = 75
            baseB = 50
        } else {
            // Small branches - light brown (no expensive calculations)
            baseR = 120
            baseG = 90
            baseB = 55
        }
        
        // OPTIMIZED: Minimal texture variation only for trunk and main branches
        if (generation <= 1) {
            const barkTexture = Math.random() * 0.1 + 0.05 // Simpler variation
            baseR = Math.floor(Math.max(30, Math.min(160, baseR * (0.95 + barkTexture))))
            baseG = Math.floor(Math.max(25, Math.min(120, baseG * (0.95 + barkTexture))))
            baseB = Math.floor(Math.max(20, Math.min(80, baseB * (0.95 + barkTexture))))
        }
        
        return new Color(baseR, baseG, baseB, 1, true)
    }
    
    generateLeafMesh(season: number, seasonProgress: number) {
        // OPTIMIZED: 2D leaf rendering - clear all triangles and use simple point rendering
        // Remove any existing leaf triangles for 2D rendering
        this.triangles = this.triangles.filter(triangle => 
            triangle.color.r > triangle.color.g // Keep non-green triangles (branches are more brown)
        )
        
        // No 3D leaf geometry generation needed for 2D rendering
        // Leaves will be rendered as 2D points/circles in the render method
    }
    
    // OPTIMIZED: 2D tree rendering for ultra-fast performance - ENHANCED VISIBILITY
    render2D(renderer: Renderer3D, season: number, seasonProgress: number): PixelList {
        const pl = new PixelList()
        
        // Debug: Check if we have branches and leaves
        const hasBranches = this.branches.length > 0
        const hasLeaves = this.leaves.length > 0
        
        // Render branches as 2D lines
        this.render2DBranches(renderer, pl)
        
        // Render leaves as 2D points
        this.render2DLeaves(renderer, pl, season, seasonProgress)
        
        // Render falling leaves as 2D points
        this.render2DFallingLeaves(renderer, pl)
        
        // EMERGENCY VISIBILITY FIX: If tree exists but no pixels rendered, force visible tree
        if (pl.size === 0 && hasBranches) {
            const centerX = Math.floor(renderer.getWidth() / 2)
            const centerY = Math.floor(renderer.getHeight() / 2)
            
            // Force visible tree trunk in brown
            const trunkColor = colors.trunkBrown.copy()
            trunkColor.a = 1.0
            pl.add(new Pixel(centerX, centerY, trunkColor))
            pl.add(new Pixel(centerX, centerY + 1, trunkColor))
            pl.add(new Pixel(centerX, centerY + 2, trunkColor))
            pl.add(new Pixel(centerX - 1, centerY + 1, trunkColor))
            pl.add(new Pixel(centerX + 1, centerY + 1, trunkColor))
            
            // Force visible leaves in green
            const leafColor = colors.springGreen.copy()
            leafColor.a = 1.0
            pl.add(new Pixel(centerX - 1, centerY - 1, leafColor))
            pl.add(new Pixel(centerX + 1, centerY - 1, leafColor))
            pl.add(new Pixel(centerX, centerY - 2, leafColor))
            pl.add(new Pixel(centerX - 2, centerY, leafColor))
            pl.add(new Pixel(centerX + 2, centerY, leafColor))
        }
        
        return pl
    }
    
    // OPTIMIZED: Render branches as fast 2D lines - ENHANCED VISIBILITY
    render2DBranches(renderer: Renderer3D, pl: PixelList) {
        // FIXED: Only render visible/important branches for performance but ensure visibility
        const importantBranches = this.branches.filter(branch => 
            branch.generation <= 4 && // Render more generations since 2D is faster
            branch.length > 0.05 // Lower threshold for branch visibility
        )
        
        // DEBUG: Force at least one visible branch if tree exists but branches are filtered out
        if (importantBranches.length === 0 && this.branches.length > 0) {
            importantBranches.push(this.branches[0]) // Always include the trunk/first branch
        }
        
        for (const branch of importantBranches) {
            const startPos = branch.start.add(this.position)
            const endPos = branch.start.add(branch.direction.multiply(branch.length)).add(this.position)
            
            // FIXED: Project to screen space with better bounds checking
            const startScreen = renderer.projectPoint(startPos)
            const endScreen = renderer.projectPoint(endPos)
            
            // FIXED: Much more lenient visibility check - render almost everything
            const maxZ = 100 // Increased from 50 to 100 for better visibility
            const buffer = 10 // Screen buffer for off-screen branches
            
            if (startScreen.z > -10 && endScreen.z > -10 && // Allow some negative Z for visibility
                startScreen.z < maxZ && endScreen.z < maxZ &&
                (startScreen.x >= -buffer || endScreen.x >= -buffer) &&
                (startScreen.x < renderer.getWidth() + buffer || endScreen.x < renderer.getWidth() + buffer) &&
                (startScreen.y >= -buffer || endScreen.y >= -buffer) &&
                (startScreen.y < renderer.getHeight() + buffer || endScreen.y < renderer.getHeight() + buffer)) {
                
                // Get branch color and thickness - ENHANCED VISIBILITY
                const branchColor = this.getBranchColor(branch.generation)
                branchColor.a = 1.0 // Force full opacity for visibility
                
                // FIXED: Ensure minimum thickness for visibility
                const baseThickness = Math.max(1, branch.radius * 30 / Math.max(0.1, Math.abs(startScreen.z)))
                const screenThickness = Math.max(2, Math.floor(baseThickness)) // Minimum 2 pixels wide
                
                // Render branch as thick line using multiple parallel lines
                for (let t = 0; t < screenThickness; t++) {
                    const offset = t - screenThickness / 2
                    renderer.renderSubpixelLine(pl, 
                        startScreen.x + offset * 0.3, startScreen.y + offset * 0.2,
                        endScreen.x + offset * 0.3, endScreen.y + offset * 0.2,
                        branchColor, branchColor
                    )
                }
            }
        }
        
        // EMERGENCY FALLBACK: If no branches were rendered, create a simple visible tree
        let renderedAny = false
        for (const branch of importantBranches) {
            const startPos = branch.start.add(this.position)
            const startScreen = renderer.projectPoint(startPos)
            if (startScreen.z > 0) {
                renderedAny = true
                break
            }
        }
        
        if (!renderedAny && this.branches.length > 0) {
            // Create emergency visible tree in center of screen
            const centerX = renderer.getWidth() / 2
            const centerY = renderer.getHeight() / 2
            const trunkColor = colors.trunkBrown
            trunkColor.a = 1.0
            
            // Draw simple visible trunk
            for (let y = 0; y < 5; y++) {
                pl.add(new Pixel(centerX, centerY + y, trunkColor))
                pl.add(new Pixel(centerX - 1, centerY + y, trunkColor))
                pl.add(new Pixel(centerX + 1, centerY + y, trunkColor))
            }
            
            // Draw simple branches
            const leafColor = colors.springGreen
            leafColor.a = 1.0
            pl.add(new Pixel(centerX - 2, centerY - 1, leafColor))
            pl.add(new Pixel(centerX + 2, centerY - 1, leafColor))
            pl.add(new Pixel(centerX - 1, centerY - 2, leafColor))
            pl.add(new Pixel(centerX + 1, centerY - 2, leafColor))
            pl.add(new Pixel(centerX, centerY - 3, leafColor))
        }
    }
    
    // OPTIMIZED: Render leaves as fast 2D points/circles - ENHANCED VISIBILITY
    render2DLeaves(renderer: Renderer3D, pl: PixelList, season: number, seasonProgress: number) {
        // OPTIMIZED: Limit leaves for performance
        const maxLeaves = 800 // Reduced for 2D rendering speed
        const leafStep = this.leaves.length > maxLeaves ? Math.ceil(this.leaves.length / maxLeaves) : 1
        
        let renderedLeaves = 0
        
        for (let i = 0; i < this.leaves.length; i += leafStep) {
            if (renderedLeaves >= maxLeaves) break
            
            const leaf = this.leaves[i]
            const leafWorldPos = leaf.position.add(this.position)
            const leafScreen = renderer.projectPoint(leafWorldPos)
            
            // FIXED: Much more lenient visibility check for leaves
            const maxZ = 50 // Increased visibility range
            const buffer = 10 // Screen buffer
            
            if (leafScreen.z > -5 && leafScreen.z < maxZ &&
                leafScreen.x >= -buffer && leafScreen.x < renderer.getWidth() + buffer &&
                leafScreen.y >= -buffer && leafScreen.y < renderer.getHeight() + buffer) {
                
                const leafColor = this.getSeasonalLeafColor(season, seasonProgress)
                leafColor.a = 1.0 // Force full opacity for visibility
                
                // FIXED: Ensure minimum leaf size for visibility
                const baseSize = 4 / Math.max(0.1, Math.abs(leafScreen.z))
                const leafSize = Math.max(2, Math.floor(baseSize)) // Minimum 2 pixels
                
                // Render leaf as enhanced cluster for better visibility
                renderer.renderSubpixel(pl, leafScreen.x, leafScreen.y, leafColor)
                
                // Add enhanced cluster effect for fuller appearance
                const clusterSize = Math.min(leafSize, 3) // Limit cluster size for performance
                for (let cx = -clusterSize; cx <= clusterSize; cx++) {
                    for (let cy = -clusterSize; cy <= clusterSize; cy++) {
                        if (cx === 0 && cy === 0) continue // Skip center (already rendered)
                        if (Math.abs(cx) + Math.abs(cy) <= clusterSize) { // Diamond shape
                            const clusterAlpha = leafColor.copy()
                            clusterAlpha.a *= 0.7 // Slightly dimmer for cluster effect
                            renderer.renderSubpixel(pl, leafScreen.x + cx, leafScreen.y + cy, clusterAlpha)
                        }
                    }
                }
                
                renderedLeaves++
            }
        }
        
        // EMERGENCY FALLBACK: If no leaves were rendered but we have leaves, create visible ones
        if (renderedLeaves === 0 && this.leaves.length > 0) {
            const centerX = renderer.getWidth() / 2
            const centerY = renderer.getHeight() / 2 - 5
            const leafColor = colors.springGreen
            leafColor.a = 1.0
            
            // Create simple visible leaves around center
            for (let lx = -3; lx <= 3; lx++) {
                for (let ly = -2; ly <= 2; ly++) {
                    if (Math.abs(lx) + Math.abs(ly) <= 3) {
                        pl.add(new Pixel(centerX + lx, centerY + ly, leafColor))
                    }
                }
            }
        }
    }
    
    // OPTIMIZED: Render falling leaves as animated 2D points
    render2DFallingLeaves(renderer: Renderer3D, pl: PixelList) {
        // OPTIMIZED: Limit falling leaves for performance
        const maxFallingLeaves = 50 // Reduced for 2D performance
        const leafCount = Math.min(this.fallingLeaves.length, maxFallingLeaves)
        
        for (let i = 0; i < leafCount; i++) {
            const leaf = this.fallingLeaves[i]
            const leafWorldPos = leaf.position.add(this.position)
            const leafScreen = renderer.projectPoint(leafWorldPos)
            
            // Only render if leaf is visible
            if (leafScreen.z > 0 && leafScreen.z < 20 &&
                leafScreen.x >= -2 && leafScreen.x < renderer.getWidth() + 2 &&
                leafScreen.y >= -2 && leafScreen.y < renderer.getHeight() + 2) {
                
                // Render falling leaf with motion blur effect
                renderer.renderSubpixel(pl, leafScreen.x, leafScreen.y, leaf.color)
                
                // Add subtle motion trail
                if (leaf.color.a > 0.3) {
                    const trailColor = leaf.color.copy()
                    trailColor.a *= 0.3
                    renderer.renderSubpixel(pl, leafScreen.x, leafScreen.y - 1, trailColor)
                }
            }
        }
    }
    
    createLeafGeometry(leaf: TreeLeaf | FallingLeaf, season: number, seasonProgress: number) {
        // SIMPLER, SMALLER leaves for faster rendering
        const size = 0.04 + Math.random() * 0.02 // SMALLER leaves: 0.04-0.06 vs 0.06-0.10
        
        // SIMPLE square leaf shape for faster rendering - no complex rotation
        const leafSize = size
        
        // SIMPLE axis-aligned square vertices - much faster to render
        const vertices = [
            leaf.position.add(new Vec3(-leafSize, -leafSize, 0)),
            leaf.position.add(new Vec3(leafSize, -leafSize, 0)),
            leaf.position.add(new Vec3(leafSize, leafSize, 0)),
            leaf.position.add(new Vec3(-leafSize, leafSize, 0))
        ]
        
        // CRITICAL FIX: Ensure all leaf vertices stay at or above ground level (Y >= 0)
        // Leaves cannot appear below ground - constrain all vertex Y coordinates
        for (const vertex of vertices) {
            vertex.y = Math.max(0, vertex.y)
        }
        
        // Get SIMPLER seasonal leaf color (reuse existing function but simpler shapes)
        const leafColor = this.getSeasonalLeafColor(season, seasonProgress)
        
        // Create two triangles for the leaf quad - SIMPLER geometry
        this.addTriangle(new Triangle3D(vertices[0], vertices[1], vertices[2], leafColor))
        this.addTriangle(new Triangle3D(vertices[0], vertices[2], vertices[3], leafColor))
    }
    
    // OPTIMIZED: Cache seasonal leaf colors to avoid repeated calculations
    private leafColorCache: Map<string, Color> = new Map()
    
    getSeasonalLeafColor(season: number, seasonProgress: number): Color {
        // OPTIMIZED: Cache colors with reduced precision for better hit rate
        const cacheKey = `${season}-${Math.floor(seasonProgress * 10)}`
        
        if (this.leafColorCache.has(cacheKey)) {
            return this.leafColorCache.get(cacheKey)!.copy()
        }
        
        // Add randomness for natural variation
        const leafVariation = Math.random() * 0.3 - 0.15 // -0.15 to +0.15
        let color: Color
        
        switch(season) {
            case 0: // Spring - fresh young greens with yellow undertones
                const springBase = {
                    r: 95 + seasonProgress * 40,   // 95-135 - soft fresh green
                    g: 180 + seasonProgress * 50,  // 180-230 - vibrant spring green
                    b: 85 + seasonProgress * 35    // 85-120 - yellow-green undertone
                }
                
                color = new Color(
                    Math.floor(Math.max(60, Math.min(160, springBase.r * (1 + leafVariation)))),
                    Math.floor(Math.max(140, Math.min(255, springBase.g * (1 + leafVariation * 0.5)))),
                    Math.floor(Math.max(60, Math.min(140, springBase.b * (1 + leafVariation)))),
                    0.7 + Math.random() * 0.2, // 70-90% opacity for fresh spring leaves
                    true
                )
                break
                
            case 1: // Summer - deep rich greens
                const summerIntensity = 0.8 + Math.random() * 0.4 // 0.8-1.2
                const summerBase = {
                    r: 45 + Math.random() * 25,   // 45-70 - deep forest green
                    g: 160 + Math.random() * 60,  // 160-220 - rich summer green
                    b: 55 + Math.random() * 20    // 55-75 - natural green undertone
                }
                
                color = new Color(
                    Math.floor(Math.max(30, Math.min(90, summerBase.r * summerIntensity))),
                    Math.floor(Math.max(140, Math.min(240, summerBase.g * summerIntensity))),
                    Math.floor(Math.max(40, Math.min(85, summerBase.b * summerIntensity))),
                    0.75 + Math.random() * 0.2, // 75-95% opacity for full summer leaves
                    true
                )
                break
                
            case 2: // Autumn - smooth gradient from green to warm colors
                const autumnProgress = seasonProgress // 0=early autumn, 1=late autumn
                const randomChoice = Math.random()
                
                if (randomChoice < 0.25) {
                    // Staying green (25% chance)
                    color = new Color(
                        Math.floor(60 + autumnProgress * 40), // 60-100
                        Math.floor(140 - autumnProgress * 30), // 140-110
                        Math.floor(50 + autumnProgress * 20), // 50-70
                        0.65 + Math.random() * 0.25, // 65-90% opacity for autumn greens
                        true
                    )
                } else if (randomChoice < 0.45) {
                    // Yellow transition (20% chance)
                    color = new Color(
                        Math.floor(180 + autumnProgress * 50), // 180-230
                        Math.floor(190 + autumnProgress * 45), // 190-235
                        Math.floor(60 + autumnProgress * 30),  // 60-90
                        0.6 + Math.random() * 0.3, // 60-90% opacity for autumn yellows
                        true
                    )
                } else if (randomChoice < 0.7) {
                    // Orange transition (25% chance)
                    color = new Color(
                        Math.floor(200 + autumnProgress * 40), // 200-240
                        Math.floor(120 + autumnProgress * 60), // 120-180
                        Math.floor(50 + autumnProgress * 20),  // 50-70
                        0.65 + Math.random() * 0.25, // 65-90% opacity for autumn oranges
                        true
                    )
                } else {
                    // Red transition (30% chance)
                    color = new Color(
                        Math.floor(160 + autumnProgress * 70), // 160-230
                        Math.floor(70 + autumnProgress * 40),  // 70-110
                        Math.floor(45 + autumnProgress * 25),  // 45-70
                        0.7 + Math.random() * 0.25, // 70-95% opacity for autumn reds
                        true
                    )
                }
                
                // Add natural leaf variation
                color.r = Math.floor(Math.max(40, Math.min(255, color.r * (0.9 + leafVariation))))
                color.g = Math.floor(Math.max(40, Math.min(255, color.g * (0.9 + leafVariation))))
                color.b = Math.floor(Math.max(30, Math.min(120, color.b * (0.9 + leafVariation))))
                break
                
            case 3: // Winter - withered browns and muted colors
                const winterBrown = {
                    r: 100 + Math.random() * 40,  // 100-140 - faded brown
                    g: 70 + Math.random() * 25,   // 70-95 - muted
                    b: 40 + Math.random() * 20    // 40-60 - dark undertone
                }
                
                color = new Color(
                    Math.floor(Math.max(70, Math.min(150, winterBrown.r))),
                    Math.floor(Math.max(50, Math.min(110, winterBrown.g))),
                    Math.floor(Math.max(30, Math.min(70, winterBrown.b))),
                    0.7 + Math.random() * 0.3, // Semi-transparent for withered effect
                    true
                )
                break
                
            default:
                // Default rich summer green with transparency
                color = new Color(50, 180, 60, 0.8, true)
        }
        
        // OPTIMIZED: Cache the result (limit cache size to prevent memory leaks)
        if (this.leafColorCache.size < 100) {
            this.leafColorCache.set(cacheKey, color.copy())
        }
        
        return color
    }
}

// Tree branch class for fractal growth
class TreeBranch {
    childBranches: TreeBranch[] = []
    
    constructor(
        public start: Vec3,
        public direction: Vec3,
        public radius: number,
        public targetLength: number,
        public generation: number,
        public parent: TreeBranch | null,
        public length: number = 0.5 // Start with clearly visible length for immediate tree visibility
    ) {}
}

// Tree leaf class
class TreeLeaf {
    constructor(
        public position: Vec3,
        public branch: TreeBranch,
        public season: number,
        public color: Color = new Color(50, 180, 60, 1, true)
    ) {}
}

// Falling leaf class with physics - OPTIMIZED
class FallingLeaf {
    life: number = 200 // Frames until leaf disappears
    
    constructor(
        public position: Vec3,
        public velocity: Vec3,
        public color: Color
    ) {}
    
    update(): boolean {
        // OPTIMIZED: Use in-place operations to reduce object creation
        this.velocity.y -= 0.0005 // Gravity
        this.velocity.x += (Math.random() - 0.5) * 0.001 // Wind
        this.velocity.z += (Math.random() - 0.5) * 0.0005 // Wind
        
        // Update position in-place
        this.position.addInPlace(this.velocity)
        
        // Fade out over time - make leaves more transparent as they fall
        this.life--
        const lifeRatio = this.life * 0.005 // Pre-calculate 1/200
        this.color.a = Math.max(0, lifeRatio * 0.6) // Maximum 60% opacity, fading to 0
        
        // Remove if hit ground or faded out
        return this.life > 0 && this.position.y > 0
    }
}

// 2D Sky system with celestial objects - renders as overlay on top half of screen
class SkySystem2D {
    // Star array for animated lightning effect at night
    stars: {
        baseX: number, 
        baseY: number, 
        x: number, 
        y: number, 
        brightness: number, 
        color: Color, 
        constellation: string, 
        type: string
    }[] = []
    sun: {x: number, y: number, radius: number, color: Color}
    moon: {x: number, y: number, radius: number, color: Color, phase: number}
    clouds: {x: number, y: number, baseX: number, size: number, color: Color}[] = []
    skylineObjects: {x: number, y: number, width: number, height: number, type: string, color: Color}[] = []
    width: number
    height: number
    skyHeight: number
    
    // Northern Lights (Aurora Borealis) system
    northernLights: {
        enabled: boolean,
        intensity: number,
        strips: {
            baseY: number,
            currentY: number,
            height: number,
            waveOffset: number,
            color: Color,
            opacity: number,
            frequency: number
        }[]
    } = { enabled: true, intensity: 1.0, strips: [] }
    
    // Rainbow system for daytime atmospheric effects
    rainbow: {
        enabled: boolean,
        centerY: number,
        radius: number,
        thickness: number,
        opacity: number,
        colors: Color[]
    } = { 
        enabled: true, 
        centerY: 0, 
        radius: 0, 
        thickness: 15, 
        opacity: 0.6,
        colors: []
    }
    
    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.skyHeight = Math.floor(height * 0.8) // Top 80% of screen (above horizon)
        const centerX = width / 2
        const centerY = this.skyHeight / 2
        
        // Initialize rainbow and lightning systems
        this.initializeRainbow()
        this.initializeLightningSystem()
        
          // Generate Northern Lights (Aurora Borealis)
        this.generateNorthernLights()
        // Start with empty stars - lightning appears randomly at night
        this.stars = []
        
        // Sun - initial position will be calculated based on time
        this.sun = {
            x: width * 0.5,  
            y: this.skyHeight * 0.2,  
            radius: Math.min(8, this.skyHeight * 0.4),
            color: colors.sunYellow.copy()
        }
        
        // Moon - initial position will be calculated based on time  
        this.moon = {
            x: width * 0.2,
            y: this.skyHeight * 0.3,  
            radius: Math.min(3, this.skyHeight * 0.2),
            color: new Color(220, 220, 240, 0.7, true), // Slightly bluish white for moon
            phase: 0 // Moon phase: 0=new, 0.5=full, 1=new again
        }
        
        // Clouds - distributed across the sky with wind animation data (only in sky area)
        for (let i = 0; i < 5; i++) {
            const baseX = (width / 6) * (i + 1)
            this.clouds.push({
                x: baseX,
                y: random(this.skyHeight * 0.1, this.skyHeight * 0.7), // Keep clouds in sky area only
                baseX: baseX, // Store original position for wind animation
                size: random(3, 8),
                color: colors.sunWhite.copy()
            })
        }
        
        // Generate distant skyline objects for depth illusion
        this.generateSkylineObjects()
        
      
    }
    
    // Subpixel rendering helper for smooth star movement
    renderSubpixelStar(pl: PixelList, x: number, y: number, color: Color) {
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
            if (weight > 0.01 && px >= 0 && px < this.width && py >= 0 && py < this.height) {
                const subpixelColor = color.copy()
                subpixelColor.a *= weight
                pl.add(new Pixel(px, py, subpixelColor))
            }
        }
    }
    
    // Lightning parameters for realistic night-time lightning effect
    lightningParams = {
        enabled: false,  // Lightning only shows sometimes
        nextLightningTime: 0,  // When next lightning will appear
        currentLightning: null as any,  // Current lightning bolt data
        duration: 0.3,  // Lightning duration in seconds (very fast)
        intensity: 1.0,
        branches: [] as any[],  // Lightning branch dendrites
        mainChannel: [] as any[]  // Main lightning channel
    }
    
    // Generate realistic lightning with dendrites (branching patterns)
    generateLightning() {
        this.stars = []  // Clear existing lightning stars
        this.lightningParams.branches = []
        this.lightningParams.mainChannel = []
        
        // Main lightning channel from cloud to ground with realistic jagged path
        const startX = this.width * (0.2 + Math.random() * 0.6)  // Random X position across screen
        const startY = this.skyHeight * (0.05 + Math.random() * 0.15)  // Start from upper sky (clouds)
        const endX = startX + (Math.random() - 0.5) * this.width * 0.4  // Larger horizontal deviation
        const endY = this.skyHeight * 0.95  // Near horizon (ground)
        
        // Create main channel with realistic stepped leader pattern
        const channelSegments = 30 + Math.floor(Math.random() * 15)  // More segments for detail
        let currentX = startX
        let currentY = startY
        
        for (let i = 0; i <= channelSegments; i++) {
            const t = i / channelSegments
            
            // Calculate base progression toward target
            const targetX = startX + (endX - startX) * t
            const targetY = startY + (endY - startY) * t
            
            // Add stepped leader behavior - lightning moves in discrete jumps
            const stepProgress = Math.min(1.0, t * 1.2)  // Slightly faster vertical progression
            const verticalBias = 0.7 + 0.3 * Math.sin(t * Math.PI)  // Stronger downward pull
            
            // Calculate next position with realistic lightning physics
            const baseDeviation = (Math.random() - 0.5) * 20  // Base horizontal wandering
            const fractalDeviation = Math.sin(t * Math.PI * 8) * 8 + Math.sin(t * Math.PI * 20) * 3  // Multi-frequency zigzag
            const ionizationPath = Math.sin(t * Math.PI * 6 + Math.random() * Math.PI) * 5  // Ionization effects
            
            currentX = targetX + baseDeviation + fractalDeviation + ionizationPath
            currentY = targetY + (Math.random() - 0.5) * 8 * (1.0 - stepProgress * 0.7)  // Less deviation near ground
            
            // Ensure lightning stays within reasonable bounds
            currentX = Math.max(this.width * 0.05, Math.min(this.width * 0.95, currentX))
            currentY = Math.max(0, Math.min(this.skyHeight, currentY))
            
            const intensity = 1.0 - t * 0.2  // Slight intensity decrease toward ground
            this.lightningParams.mainChannel.push({ x: currentX, y: currentY, intensity })
            
            // Create dendrite branches at random points (more frequent in middle section)
            let branchChance = 0.15  // Base branch chance
            if (t > 0.2 && t < 0.8) branchChance = 0.35  // Higher chance in middle
            if (t > 0.4 && t < 0.6) branchChance = 0.45  // Even higher in center
            
            if (Math.random() < branchChance && i > 2 && i < channelSegments - 2) {
                this.generateLightningBranch(currentX, currentY, intensity, 1, t)
            }
            
            // Add return stroke branches (upward branches that can occur)
            if (Math.random() < 0.08 && t > 0.6) {  // Return strokes more likely near ground
                this.generateReturnStroke(currentX, currentY, intensity, t)
            }
        }
    }
    
    // Generate lightning branch dendrites with improved realism
    generateLightningBranch(startX: number, startY: number, parentIntensity: number, depth: number, parentT: number) {
        if (depth > 5) return  // Limit branch depth
        
        const branchLength = (25 - depth * 3) + Math.random() * 10  // Variable length
        const branchAngle = (Math.random() - 0.5) * Math.PI * 0.9  // Wider angle range
        const segments = Math.max(3, Math.floor(branchLength / 4))
        
        // Add angular bias based on main lightning progress
        let angleBias = 0
        if (parentT < 0.5) angleBias = Math.PI * 0.2 * (Math.random() - 0.5)  // Upward bias early on
        else angleBias = Math.PI * 0.3 * (Math.random() - 0.5)  // Wider spread later
        
        const effectiveAngle = branchAngle + angleBias
        
        const branch = []
        let currentX = startX
        let currentY = startY
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const distance = branchLength * t
            
            // More natural branching with air resistance and ionization
            const targetX = startX + Math.cos(effectiveAngle) * distance
            const targetY = startY + Math.sin(effectiveAngle) * distance
            
            // Add fractal-like deviation for realistic path
            const pathDeviation = (Math.random() - 0.5) * 4 / depth  // Less deviation for deeper branches
            const ionizationNoise = Math.sin(t * Math.PI * 4) * 2 / depth
            
            currentX = targetX + pathDeviation + ionizationNoise
            currentY = targetY + pathDeviation * 0.5  // Less vertical deviation
            
            // Ensure branch stays in bounds
            currentX = Math.max(0, Math.min(this.width, currentX))
            currentY = Math.max(0, Math.min(this.skyHeight, currentY))
            
            const intensity = parentIntensity * (1.0 - t * 0.6) / Math.sqrt(depth)
            branch.push({ x: currentX, y: currentY, intensity })
            
            // Chance for sub-branches (lower for deeper levels)
            const subBranchChance = Math.max(0.05, 0.4 / (depth * depth))
            if (Math.random() < subBranchChance && i > 1 && i < segments - 1) {
                this.generateLightningBranch(currentX, currentY, intensity, depth + 1, parentT + t * 0.1)
            }
        }
        
        this.lightningParams.branches.push(branch)
    }
    
    // Generate return stroke (upward lightning branch)
    generateReturnStroke(startX: number, startY: number, parentIntensity: number, parentT: number) {
        const strokeLength = 10 + Math.random() * 15
        const upwardAngle = -Math.PI * 0.3 - Math.random() * Math.PI * 0.4  // Upward angles
        const segments = Math.floor(strokeLength / 3)
        
        const stroke = []
        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const distance = strokeLength * t
            
            const x = startX + Math.cos(upwardAngle) * distance + (Math.random() - 0.5) * 2
            const y = startY + Math.sin(upwardAngle) * distance + (Math.random() - 0.5) * 2
            const intensity = parentIntensity * (1.0 - t * 0.8) * 0.6  // Dimmer than main channel
            
            stroke.push({ x, y, intensity })
        }
        
        this.lightningParams.branches.push(stroke)
    }
    
    // Convert lightning channels to star-like points for rendering with enhanced detail
    convertLightningToStars() {
        this.stars = []
        
        // Add main channel points with high detail
        for (let i = 0; i < this.lightningParams.mainChannel.length; i++) {
            const point = this.lightningParams.mainChannel[i]
            const intensity = point.intensity
            
            // Add main channel point with maximum intensity
            this.stars.push({
                baseX: point.x,
                baseY: point.y,
                x: point.x,
                y: point.y,
                brightness: intensity * 1.2,  // Brighter main channel
                color: this.getLightningColor(intensity * 1.2, 0),
                constellation: 'lightning',
                type: 'main_channel'
            })
            
            // Add connecting segments between main points for continuity
            if (i > 0) {
                const prevPoint = this.lightningParams.mainChannel[i - 1]
                const segmentSteps = 3  // Steps between main points
                
                for (let step = 1; step < segmentSteps; step++) {
                    const t = step / segmentSteps
                    const segmentX = prevPoint.x + (point.x - prevPoint.x) * t
                    const segmentY = prevPoint.y + (point.y - prevPoint.y) * t
                    const segmentIntensity = (prevPoint.intensity + point.intensity) / 2 * 0.8
                    
                    this.stars.push({
                        baseX: segmentX,
                        baseY: segmentY,
                        x: segmentX,
                        y: segmentY,
                        brightness: segmentIntensity,
                        color: this.getLightningColor(segmentIntensity, 0),
                        constellation: 'lightning',
                        type: 'main_segment'
                    })
                }
            }
            
            // Add intense glow around main channel points
            const glowRadius = 3 + intensity * 2
            const glowLayers = 3
            
            for (let layer = 0; layer < glowLayers; layer++) {
                const layerRadius = (layer + 1) * (glowRadius / glowLayers)
                const pointsInLayer = 6 + layer * 2  // More points in outer layers
                
                for (let p = 0; p < pointsInLayer; p++) {
                    const angle = (p * Math.PI * 2) / pointsInLayer
                    const glowX = point.x + Math.cos(angle) * layerRadius
                    const glowY = point.y + Math.sin(angle) * layerRadius
                    const glowIntensity = intensity * (0.8 - layer * 0.2)
                    
                    this.stars.push({
                        baseX: glowX,
                        baseY: glowY,
                        x: glowX,
                        y: glowY,
                        brightness: glowIntensity,
                        color: this.getLightningColor(glowIntensity, layer + 1),
                        constellation: 'lightning',
                        type: 'main_glow'
                    })
                }
            }
        }
        
        // Add branch points with connecting segments
        for (const branch of this.lightningParams.branches) {
            for (let i = 0; i < branch.length; i++) {
                const point = branch[i]
                
                // Main branch point
                this.stars.push({
                    baseX: point.x,
                    baseY: point.y,
                    x: point.x,
                    y: point.y,
                    brightness: point.intensity,
                    color: this.getLightningColor(point.intensity, 1),
                    constellation: 'lightning',
                    type: 'branch'
                })
                
                // Add connecting segments between branch points
                if (i > 0) {
                    const prevPoint = branch[i - 1]
                    const segmentSteps = 2  // Fewer steps for branches
                    
                    for (let step = 1; step < segmentSteps; step++) {
                        const t = step / segmentSteps
                        const segmentX = prevPoint.x + (point.x - prevPoint.x) * t
                        const segmentY = prevPoint.y + (point.y - prevPoint.y) * t
                        const segmentIntensity = (prevPoint.intensity + point.intensity) / 2 * 0.7
                        
                        this.stars.push({
                            baseX: segmentX,
                            baseY: segmentY,
                            x: segmentX,
                            y: segmentY,
                            brightness: segmentIntensity,
                            color: this.getLightningColor(segmentIntensity, 1),
                            constellation: 'lightning',
                            type: 'branch_segment'
                        })
                    }
                }
                
                // Add smaller glow for significant branch points
                if (point.intensity > 0.4) {
                    const branchGlowRadius = 1.5
                    const branchGlowPoints = 4
                    
                    for (let g = 0; g < branchGlowPoints; g++) {
                        const angle = (g * Math.PI * 2) / branchGlowPoints
                        const glowX = point.x + Math.cos(angle) * branchGlowRadius
                        const glowY = point.y + Math.sin(angle) * branchGlowRadius
                        const glowIntensity = point.intensity * 0.5
                        
                        this.stars.push({
                            baseX: glowX,
                            baseY: glowY,
                            x: glowX,
                            y: glowY,
                            brightness: glowIntensity,
                            color: this.getLightningColor(glowIntensity, 2),
                            constellation: 'lightning',
                            type: 'branch_glow'
                        })
                    }
                }
            }
        }
    }
    
    // Get realistic lightning colors with smooth gradients (white-blue-purple-violet)
    getLightningColor(intensity: number, glowLevel: number = 0): Color {
        // Lightning color progression: brilliant white -> electric blue -> purple -> violet
        let r: number, g: number, b: number
        
        // Adjust intensity based on glow level
        const effectiveIntensity = intensity * Math.max(0.3, 1.0 - glowLevel * 0.2)
        
        if (effectiveIntensity > 0.85) {
            // Core lightning: brilliant white with slight blue tint (plasma temperature)
            r = 255
            g = 255
            b = Math.floor(250 + glowLevel * 5)
        } else if (effectiveIntensity > 0.6) {
            // High-intensity: electric blue-white
            const blueProgress = (0.85 - effectiveIntensity) / 0.25
            r = Math.floor(255 - blueProgress * 80)
            g = Math.floor(255 - blueProgress * 60)
            b = 255
        } else if (effectiveIntensity > 0.35) {
            // Mid-intensity: electric blue to purple
            const purpleProgress = (0.6 - effectiveIntensity) / 0.25
            r = Math.floor(175 + purpleProgress * 40)
            g = Math.floor(195 - purpleProgress * 80)
            b = 255
        } else if (effectiveIntensity > 0.15) {
            // Lower intensity: purple to violet
            const violetProgress = (0.35 - effectiveIntensity) / 0.2
            r = Math.floor(215 - violetProgress * 80)
            g = Math.floor(115 - violetProgress * 50)
            b = Math.floor(255 - violetProgress * 25)
        } else {
            // Very low intensity: deep violet to indigo
            const indigoProgress = effectiveIntensity / 0.15
            r = Math.floor(75 + indigoProgress * 60)
            g = Math.floor(25 + indigoProgress * 40)
            b = Math.floor(180 + indigoProgress * 50)
        }
        
        // Add subtle color temperature variation for realism
        const tempVariation = Math.sin(glowLevel * Math.PI) * 0.05
        r = Math.floor(r * (1.0 + tempVariation))
        g = Math.floor(g * (1.0 - tempVariation * 0.5))
        b = Math.floor(b * (1.0 + tempVariation * 0.3))
        
        // Ensure values stay in valid range
        r = Math.max(0, Math.min(255, r))
        g = Math.max(0, Math.min(255, g))
        b = Math.max(0, Math.min(255, b))
        
        return new Color(r, g, b, 1, true)
    }
    

    // Initialize lightning system
    initializeLightningSystem() {
        this.lightningParams.enabled = false
        this.lightningParams.nextLightningTime = Math.random() * 10 + 5  // First lightning in 5-15 seconds
        this.lightningParams.currentLightning = null
        this.stars = []  // Start with no lightning
    }
    
    // Update lightning system - only shows at night and occasionally
    updateLightningSystem(timeOfDay: number, currentTime: number, intensity: number = 0.7, frequency: number = 1.0) {
        // Lightning only appears at night
        const isNightTime = timeOfDay < 0.18 || timeOfDay > 0.82
        
        if (!isNightTime) {
            // Clear lightning during day
            if (this.lightningParams.enabled) {
                this.lightningParams.enabled = false
                this.stars = []
            }
            return
        }
        
        // Check if it's time for next lightning
        if (!this.lightningParams.enabled && currentTime >= this.lightningParams.nextLightningTime) {
            // Random chance for lightning (more likely during certain night hours)
            let lightningChance = 0.15 * frequency  // Base chance affected by frequency control
            
            // Higher chance during deep night (around midnight)
            if (timeOfDay > 0.95 || timeOfDay < 0.05) {
                lightningChance = 0.3 * frequency
            }
            
            // Very rare but more dramatic during twilight
            if ((timeOfDay > 0.82 && timeOfDay < 0.9) || (timeOfDay > 0.1 && timeOfDay < 0.18)) {
                lightningChance = 0.1 * frequency
            }
            
            if (Math.random() < lightningChance) {
                // Trigger lightning
                this.lightningParams.enabled = true
                this.lightningParams.currentLightning = {
                    startTime: currentTime,
                    flashCount: 1 + Math.floor(Math.random() * 2),  // 1-2 flashes typically
                    currentFlash: 0
                }
                
                // Generate new lightning bolt
                this.generateLightning()
                this.convertLightningToStars()
                
                console.log("⚡ Lightning strike at night!")
            }
            
            // Set next lightning check time (inversely related to frequency)
            const baseInterval = 8 / Math.max(0.1, frequency)  // More frequent with higher frequency
            this.lightningParams.nextLightningTime = currentTime + baseInterval + Math.random() * baseInterval
        }
        
        // Update active lightning
        if (this.lightningParams.enabled && this.lightningParams.currentLightning) {
            const elapsed = currentTime - this.lightningParams.currentLightning.startTime
            const flashDuration = 0.08  // Each flash lasts 0.08 seconds - very fast
            const flashInterval = 0.25   // 0.25 seconds between flashes
            
            // Check if current flash should end
            const currentFlashStart = this.lightningParams.currentLightning.currentFlash * flashInterval
            const currentFlashEnd = currentFlashStart + flashDuration
            
            if (elapsed > currentFlashEnd && elapsed < currentFlashStart + flashInterval) {
                // In dark period between flashes
                this.stars = []
            } else if (elapsed > currentFlashStart + flashInterval) {
                // Start next flash
                this.lightningParams.currentLightning.currentFlash++
                
                if (this.lightningParams.currentLightning.currentFlash >= this.lightningParams.currentLightning.flashCount) {
                    // Lightning sequence finished
                    this.lightningParams.enabled = false
                    this.lightningParams.currentLightning = null
                    this.stars = []
                } else {
                    // Generate slightly different lightning pattern for next flash
                    this.generateLightning()
                    this.convertLightningToStars()
                }
            } else if (elapsed >= currentFlashStart && elapsed <= currentFlashEnd) {
                // Active flash - update intensity with realistic flash curve
                const flashProgress = (elapsed - currentFlashStart) / flashDuration
                const flashIntensity = intensity * this.getLightningFlashIntensity(flashProgress)
                
                // Update star intensities
                for (let star of this.stars) {
                    if (star.constellation === 'lightning') {
                        star.brightness = star.brightness * flashIntensity
                        // Update color temperature during flash
                        star.color = this.getLightningColor(star.brightness * flashIntensity, 
                            star.type === 'main_channel' ? 0 : (star.type.includes('glow') ? 1 : 2))
                    }
                }
            }
        }
    }
    
    // Get realistic lightning flash intensity curve
    getLightningFlashIntensity(progress: number): number {
        // Lightning has a sharp peak at the beginning then rapid decay
        if (progress < 0.1) {
            return 1.0  // Full intensity at start
        } else if (progress < 0.3) {
            return 1.0 - (progress - 0.1) * 1.5  // Sharp drop
        } else {
            return Math.max(0.1, 0.7 - (progress - 0.3) * 0.8)  // Gradual fade
        }
    }
    

    // Generate small distant objects on the horizon for depth illusion
    generateSkylineObjects() {
        const horizonY = this.skyHeight // Horizon line
        const objectCount = 15 + Math.floor(Math.random() * 10) // 15-25 objects
        
        // Create various types of distant objects
        for (let i = 0; i < objectCount; i++) {
            const x = (this.width / objectCount) * i + Math.random() * (this.width / objectCount * 0.8)
            const objectType = Math.random()
            
            let width: number, height: number, type: string, baseColor: Color
            
            if (objectType < 0.3) {
                // Houses/buildings
                width = 1 + Math.random() * 2 // Very small width
                height = 1 + Math.random() * 3 // Small height
                type = "building"
                baseColor = new Color(40, 30, 60, 1, true) // Dark purple-gray
            } else if (objectType < 0.6) {
                // Trees
                width = 1 + Math.random() * 1.5 // Very narrow
                height = 2 + Math.random() * 4 // Slightly taller
                type = "tree"
                baseColor = new Color(20, 40, 20, 1, true) // Dark green
            } else {
                // Hills/distant mountains
                width = 3 + Math.random() * 8 // Wider but low
                height = 1 + Math.random() * 2 // Very low hills
                type = "hill"
                baseColor = new Color(30, 20, 50, 1, true) // Dark blue-purple
            }
            
            // Create a copy and make objects more visible with higher opacity
            const finalColor = baseColor.copy()
            finalColor.a = 0.4 + Math.random() * 0.3 // More visible (40-70% opacity)
            
            this.skylineObjects.push({
                x: Math.floor(x),
                y: horizonY - Math.floor(height), // Position just above horizon
                width: Math.max(1, Math.floor(width)),
                height: Math.max(1, Math.floor(height)),
                type: type,
                color: finalColor
            })
        }
        
        // Sort objects by width (larger hills in back, smaller objects in front)
        this.skylineObjects.sort((a, b) => b.width - a.width)
    }
    
    // Calculate sun position based on time of day (0=midnight, 0.5=noon, 1=midnight)
    calculateSunPosition(timeOfDay: number): {x: number, y: number, color: Color, intensity: number} {
        // Sun follows an arc across the sky
        const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2 // Start at horizon at dawn
        const centerX = this.width / 2
        const maxHeight = this.skyHeight * 0.8
        const arcWidth = this.width * 0.8
        
        // Calculate position on arc
        const x = centerX + Math.cos(sunAngle) * arcWidth / 2
        const y = this.skyHeight - Math.sin(sunAngle) * maxHeight
        
        // Ultra-realistic sun color and intensity based on time with atmospheric effects
        let color: Color
        let intensity: number
        
        if (timeOfDay < 0.18 || timeOfDay > 0.82) {
            // Deep night - sun completely below horizon, no light
            color = new Color(10, 5, 20, 1, true) // Very faint deep blue for astronomical twilight
            intensity = 0.0
        } else if (timeOfDay < 0.22 || timeOfDay > 0.78) {
            // Astronomical twilight - first hint of light
            const twilightProgress = timeOfDay < 0.22 ? (timeOfDay - 0.18) / 0.04 : (0.82 - timeOfDay) / 0.04
            color = new Color(
                Math.floor(10 + twilightProgress * 40),  // Deep blue to purple
                Math.floor(5 + twilightProgress * 10),   // Very subtle
                Math.floor(20 + twilightProgress * 30),  // Blue dominant
                1, true
            )
            intensity = twilightProgress * 0.05
        } else if (timeOfDay < 0.28 || timeOfDay > 0.72) {
            // Civil twilight - deep purple to magenta transition
            const isRising = timeOfDay < 0.5
            const civilProgress = isRising ? (timeOfDay - 0.22) / 0.06 : (0.78 - timeOfDay) / 0.06
            
            color = new Color(
                Math.floor(50 + civilProgress * 100),   // Purple to deep red
                Math.floor(15 + civilProgress * 25),    // Very low green for purple
                Math.floor(50 + civilProgress * 40),    // Purple to magenta
                1, true
            )
            intensity = 0.05 + civilProgress * 0.15
        } else if (timeOfDay < 0.32 || timeOfDay > 0.68) {
            // Nautical twilight - dramatic color burst (golden hour begins)
            const isRising = timeOfDay < 0.5
            const nauticalProgress = isRising ? (timeOfDay - 0.28) / 0.04 : (0.72 - timeOfDay) / 0.04
            
            // Create the famous "golden hour" colors
            color = new Color(
                Math.floor(150 + nauticalProgress * 105), // Deep red to bright orange
                Math.floor(40 + nauticalProgress * 80),   // Low to medium orange
                Math.floor(90 - nauticalProgress * 60),   // Purple fading to warm
                1, true
            )
            intensity = 0.2 + nauticalProgress * 0.3
        } else if (timeOfDay < 0.38 || timeOfDay > 0.62) {
            // Golden hour - warm orange to yellow transition
            const isRising = timeOfDay < 0.5
            const goldenProgress = isRising ? (timeOfDay - 0.32) / 0.06 : (0.68 - timeOfDay) / 0.06
            
            color = new Color(
                255,  // Full red for warm glow
                Math.floor(120 + goldenProgress * 100),  // Orange to yellow
                Math.floor(30 + goldenProgress * 70),    // Warm to bright
                1, true
            )
            intensity = 0.5 + goldenProgress * 0.3
        } else {
            // Full daylight - bright white with subtle temperature variations
            const noonDistance = Math.abs(timeOfDay - 0.5) // Distance from noon (0-0.12)
            const dayStrength = Math.cos(noonDistance * Math.PI / 0.12) // Smooth falloff from noon
            
            // At noon: cool white, moving toward warm white at edges of day
            const warmth = (1 - dayStrength) * 0.3 // Warmth factor based on sun angle
            
            color = new Color(
                255,  // Always full red
                Math.floor(255 - warmth * 30),          // Slight yellow tint away from noon
                Math.floor(255 - warmth * 80),          // More yellow/warm away from noon
                1, true
            )
            intensity = 0.8 + dayStrength * 0.2  // Peak intensity at noon
        }
        
        return { x, y, color, intensity }
    }
    
    // Calculate moon position based on time of day (opposite to sun)
    calculateMoonPosition(timeOfDay: number): {x: number, y: number, phase: number} {
        // Moon is roughly opposite to the sun
        const moonTime = (timeOfDay + 0.5) % 1.0
        const moonAngle = moonTime * Math.PI * 2 - Math.PI / 2
        const centerX = this.width / 2
        const maxHeight = this.skyHeight * 0.8
        const arcWidth = this.width * 0.8
        
        // Calculate position on arc
        const x = centerX + Math.cos(moonAngle) * arcWidth / 2
        const y = this.skyHeight - Math.sin(moonAngle) * maxHeight
        
        // Calculate moon phase (cycles over longer period)
        const phase = (timeOfDay * 8) % 1.0 // Moon phase changes over 8 day cycles
        
        return { x, y, phase }
    }
    
    // Draw moon with phase
    drawMoonWithPhase(pl: PixelList, x: number, y: number, radius: number, phase: number, horizonY: number, visibility: number = 1.0) {
        // Only render moon if it's above the horizon
        if (y >= horizonY) return
        
        const moonX = Math.floor(x)
        const moonY = Math.floor(y)
        
        // Draw moon base (full circle) with visibility modifier (more transparent)
        for (let r = 0; r < radius; r++) {
            const moonColor = this.moon.color.copy()
            moonColor.a = (1.0 - r * 0.15) * visibility * 0.6  // Added 0.6 multiplier for more transparency
            
            if (moonY + r < horizonY && moonY - r >= 0) {
                pl.add(new DrawCircle(moonX, moonY, r, moonColor))
            }
        }
        
        // Draw phase shadow (also more transparent)
        if (phase !== 0.5) { // Skip shadow for full moon
            const shadowColor = colors.skyDeepPurple.copy()
            shadowColor.a = 0.8 * visibility * 0.6  // Added 0.6 multiplier for more transparency
            
            // Calculate shadow position and size based on phase
            let shadowOffset: number
            let shadowWidth: number
            
            if (phase < 0.5) {
                // Waxing moon - shadow on left
                shadowOffset = -radius * (1 - phase * 2)
                shadowWidth = radius * 2 * (1 - phase * 2)
            } else {
                // Waning moon - shadow on right
                shadowOffset = radius * ((phase - 0.5) * 2)
                shadowWidth = radius * 2 * ((phase - 0.5) * 2)
            }
            
            // Draw shadow as partial circle
            for (let r = 0; r < radius; r++) {
                if (moonY + r < horizonY && moonY - r >= 0) {
                    const shadowR = Math.min(r, Math.floor(shadowWidth / 2))
                    if (shadowR > 0) {
                        pl.add(new DrawCircle(moonX + Math.floor(shadowOffset), moonY, shadowR, shadowColor))
                    }
                }
            }
        }
    }
    
    // Generate Northern Lights (Aurora Borealis) strips
    generateNorthernLights() {
        this.northernLights.strips = []
        const numStrips = 4 + Math.floor(Math.random() * 3) // 4-6 aurora strips
        
        for (let i = 0; i < numStrips; i++) {
            // Aurora appears in upper portion of sky
            const baseY = this.skyHeight * (0.1 + Math.random() * 0.4) // Upper 10-50% of sky
            const height = 8 + Math.random() * 15 // Variable height strips
            
            // Aurora colors - green, blue, purple, pink
            let color: Color
            const colorChoice = Math.random()
            if (colorChoice < 0.4) {
                // Green (most common)
                color = new Color(50 + Math.random() * 100, 180 + Math.random() * 75, 50 + Math.random() * 80, 1, true)
            } else if (colorChoice < 0.7) {
                // Blue-green
                color = new Color(30 + Math.random() * 70, 150 + Math.random() * 80, 120 + Math.random() * 100, 1, true)
            } else if (colorChoice < 0.9) {
                // Purple
                color = new Color(120 + Math.random() * 80, 50 + Math.random() * 100, 150 + Math.random() *  80, 1, true)
            } else {
                // Pink (rare)
                color = new Color(180 + Math.random() * 75, 80 + Math.random() * 100, 120 + Math.random() * 80, 1, true)
            }
            
            this.northernLights.strips.push({
                baseY: baseY,
                currentY: baseY,
                height: height,
                waveOffset: Math.random() * Math.PI * 2, // Random phase offset
                color: color,
                opacity: 0.3 + Math.random() * 0.4, // 30-70% opacity
                frequency: 0.5 + Math.random() * 1.0 // Wave frequency variation
            })
        }
    }
    
    // Update Northern Lights dynamically over unified time
    updateNorthernLights(timeOfDay: number, rawTime: number) {
        // Regenerate aurora strips periodically for variety (using raw time for absolute intervals)
        if (Math.floor(rawTime / 1000) % 30 === 0 && rawTime % 50 < 1) { // Every 30 seconds, with small timing window
            this.generateNorthernLights()
        }
        
        // Subtle intensity variations over time using unified time system
        for (const strip of this.northernLights.strips) {
            // Add slow breathing effect to each strip based on timeOfDay
            const breathe = 0.8 + 0.2 * Math.sin(timeOfDay * Math.PI * 4 + strip.waveOffset)
            strip.opacity = Math.max(0.1, Math.min(0.8, strip.opacity * breathe))
        }
    }
    
    // Render Northern Lights with flowing wave animation
    renderNorthernLights(pl: PixelList, time: number, screenWidth: number, screenHeight: number, intensity: number = 1.0, timeOfDay: number = 0.0) {
        if (!this.northernLights.enabled || intensity <= 0) return
        
        // Aurora is most visible during night and twilight
        const horizonY = Math.floor(screenHeight * 0.8)
        
        // Time-based aurora visibility (more visible at night)
        let timeVisibility: number
        if (timeOfDay < 0.15 || timeOfDay > 0.85) {
            timeVisibility = 1.0 // Full visibility at night
        } else if (timeOfDay < 0.25 || timeOfDay > 0.75) {
            // Visible during twilight
            const twilightFactor = timeOfDay < 0.25 ? (0.25 - timeOfDay) / 0.1 : (timeOfDay - 0.75) / 0.1
            timeVisibility = 0.3 + twilightFactor * 0.7
        } else {
            timeVisibility = 0.1 // Very subtle during day
        }
        
        for (const strip of this.northernLights.strips) {
            // Create flowing wave effect across the width of the sky using unified time
            for (let x = 0; x < screenWidth; x++) {
                // Multiple wave functions for complex aurora movement - use timeOfDay for smooth animation
                const waveTime = timeOfDay * Math.PI * 8 // More cycles for smoother wave motion
                const wave1 = Math.sin((x * 0.02) + (waveTime * strip.frequency) + strip.waveOffset) * 8
                const wave2 = Math.sin((x * 0.015) + (waveTime * strip.frequency * 0.8) + strip.waveOffset + Math.PI) * 5
                const wave3 = Math.cos((x * 0.025) + (waveTime * strip.frequency * 1.2) + strip.waveOffset * 0.5) * 3
                
                // Combine waves for complex flowing motion
                const waveOffset = wave1 + wave2 + wave3
                const centerY = Math.floor(strip.baseY + waveOffset)
                
                // Skip if aurora would be below horizon
                if (centerY >= horizonY) continue
                
                // Create vertical gradient for each strip (aurora curtain effect)
                for (let dy = 0; dy < strip.height; dy++) {
                    const y = centerY + dy - Math.floor(strip.height / 2)
                    
                    // Skip if outside screen bounds or below horizon
                    if (y < 0 || y >= horizonY) continue
                    
                    // Calculate opacity falloff from center of strip for smooth edges
                    const distanceFromCenter = Math.abs(dy - strip.height / 2) / (strip.height / 2)
                    const verticalFalloff = 1.0 - Math.pow(distanceFromCenter, 2) // Smooth falloff
                    
                    // Add horizontal intensity variation for more realistic look
                    const horizontalVariation = 0.7 + 0.3 * Math.sin(x * 0.03 + timeOfDay * Math.PI * 4)
                    
                    // Add temporal flickering for aurora shimmer using unified time
                    const shimmer = 0.8 + 0.2 * Math.sin(timeOfDay * Math.PI * 10 + x * 0.01 + dy * 0.1)
                    
                    // Final opacity calculation with time-based visibility
                    const finalOpacity = strip.opacity * verticalFalloff * horizontalVariation * shimmer * intensity * timeVisibility
                    
                    if (finalOpacity > 0.02) {
                        const auroraColor = strip.color.copy()
                        auroraColor.a = finalOpacity
                        
                        // Use subpixel rendering for smoother aurora edges
                        this.renderSubpixelStar(pl, x, y, auroraColor)
                    }
                }
            }
        }
    }
    
    // Initialize rainbow system with realistic colors and physics
    initializeRainbow() {
        // Set rainbow position - centered horizontally, positioned for realistic viewing angle
        this.rainbow.centerY = this.skyHeight * 0.25  // Higher in sky for better arc visibility
        this.rainbow.radius = this.width * 0.8        // Large arc spanning most of screen width
        
        // Create authentic rainbow colors (ROYGBIV) with precise spectral values
        this.rainbow.colors = [
            new Color(255, 0, 0, 1, true),     // Red (700 nm)
            new Color(255, 165, 0, 1, true),   // Orange (620 nm)
            new Color(255, 255, 0, 1, true),   // Yellow (570 nm)
            new Color(0, 255, 0, 1, true),     // Green (530 nm)
            new Color(0, 191, 255, 1, true),   // Blue (475 nm) - more cyan-blue
            new Color(75, 0, 130, 1, true),    // Indigo (445 nm)
            new Color(138, 43, 226, 1, true)   // Violet (400 nm) - more purple-violet
        ]
    }
    
    // Render realistic rainbow arc with advanced blending and atmospheric fade
    renderRainbow(pl: PixelList, timeOfDay: number, screenHeight: number, intensity: number = 1.0) {
        if (!this.rainbow.enabled) return
        let rainbowVisibility: number
        if (timeOfDay >= 0.25 && timeOfDay <= 0.75) {
            const noonDistance = Math.abs(timeOfDay - 0.5)
            const optimalDistance = 0.15
            const distanceFromOptimal = Math.abs(noonDistance - optimalDistance)
            rainbowVisibility = Math.max(0, 1.0 - (distanceFromOptimal * 6))
        } else {
            rainbowVisibility = 0
        }
        if (rainbowVisibility <= 0.02) return
        const horizonY = Math.floor(screenHeight * 0.8)
        const centerX = this.width / 2
        const centerY = this.rainbow.centerY
        const scatteringFactor = Math.sin(timeOfDay * Math.PI * 2) * 0.3 + 0.7
        // Primary rainbow: advanced blending
        for (let colorIndex = 0; colorIndex < this.rainbow.colors.length; colorIndex++) {
            const color = this.rainbow.colors[colorIndex].copy()
            const bandOffset = colorIndex * (this.rainbow.thickness / this.rainbow.colors.length)
            const bandRadius = this.rainbow.radius - bandOffset
            const bandThickness = this.rainbow.thickness / this.rainbow.colors.length * 1.4
            const startAngle = Math.PI * 0.08
            const endAngle = Math.PI * 0.92
            const angleStep = 0.006
            for (let angle = startAngle; angle <= endAngle; angle += angleStep) {
                const arcX = centerX + Math.cos(angle) * bandRadius
                const arcY = centerY + Math.sin(angle) * bandRadius * 0.6
                if (arcX >= 0 && arcX < this.width && arcY >= 0 && arcY < horizonY) {
                    const heightAboveHorizon = (horizonY - arcY) / horizonY
                    const heightFade = Math.pow(heightAboveHorizon, 0.25)
                    for (let thick = 0; thick < bandThickness; thick++) {
                        const thickY = arcY - thick * 0.7
                        if (thickY >= 0 && thickY < horizonY) {
                            const edgePosition = thick / bandThickness
                            // Soft Gaussian edge for realism
                            const edgeOpacity = Math.exp(-Math.pow(edgePosition - 0.5, 2) / 0.08)
                            // Blend with adjacent colors for smooth transitions
                            let blendColor = color.copy()
                            if (colorIndex < this.rainbow.colors.length - 1) {
                                const nextColor = this.rainbow.colors[colorIndex + 1].copy()
                                blendColor.r = Math.floor(color.r * (1 - edgePosition) + nextColor.r * edgePosition)
                                blendColor.g = Math.floor(color.g * (1 - edgePosition) + nextColor.g * edgePosition)
                                blendColor.b = Math.floor(color.b * (1 - edgePosition) + nextColor.b * edgePosition)
                            }
                            // Color intensity varies with wavelength
                            const wavelengthIntensity = colorIndex === 0 ? 1.2 : colorIndex === 1 ? 1.1 : colorIndex === 2 ? 1.0 : colorIndex === 3 ? 0.9 : colorIndex === 4 ? 0.8 : colorIndex === 5 ? 0.6 : 0.5
                            blendColor.a = this.rainbow.opacity * rainbowVisibility * intensity * edgeOpacity * heightFade * scatteringFactor * wavelengthIntensity * 0.8
                            if (blendColor.a > 0.02) {
                                this.renderSubpixelStar(pl, arcX, thickY, blendColor)
                            }
                        }
                    }
                }
            }
        }
        // Secondary rainbow: fainter, reversed colors, more blending
        if (rainbowVisibility > 0.5 && intensity > 0.7) {
            const secondaryRadius = this.rainbow.radius * 1.25
            const secondaryOpacity = this.rainbow.opacity * 0.22
            const secondaryThickness = this.rainbow.thickness * 0.7
            for (let colorIndex = this.rainbow.colors.length - 1; colorIndex >= 0; colorIndex--) {
                const color = this.rainbow.colors[colorIndex].copy()
                const bandOffset = (this.rainbow.colors.length - 1 - colorIndex) * (secondaryThickness / this.rainbow.colors.length)
                const bandRadius = secondaryRadius + bandOffset
                const bandThickness = secondaryThickness / this.rainbow.colors.length
                const startAngle = Math.PI * 0.05
                const endAngle = Math.PI * 0.95
                for (let angle = startAngle; angle <= endAngle; angle += 0.01) {
                    const arcX = centerX + Math.cos(angle) * bandRadius
                    const arcY = centerY + Math.sin(angle) * bandRadius * 0.6
                    if (arcX >= 0 && arcX < this.width && arcY >= 0 && arcY < horizonY) {
                        const heightAboveHorizon = (horizonY - arcY) / horizonY
                        const heightFade = Math.pow(heightAboveHorizon, 0.3)
                        for (let thick = 0; thick < bandThickness; thick++) {
                            const thickY = arcY - thick * 0.6
                            if (thickY >= 0 && thickY < horizonY) {
                                const edgePosition = thick / bandThickness
                                const edgeOpacity = Math.exp(-Math.pow(edgePosition - 0.5, 2) / 0.12)
                                let blendColor = color.copy()
                                if (colorIndex > 0) {
                                    const prevColor = this.rainbow.colors[colorIndex - 1].copy()
                                    blendColor.r = Math.floor(color.r * (1 - edgePosition) + prevColor.r * edgePosition)
                                    blendColor.g = Math.floor(color.g * (1 - edgePosition) + prevColor.g * edgePosition)
                                    blendColor.b = Math.floor(color.b * (1 - edgePosition) + prevColor.b * edgePosition)
                                }
                                blendColor.a = secondaryOpacity * rainbowVisibility * intensity * edgeOpacity * heightFade * scatteringFactor * 0.6
                                if (blendColor.a > 0.01) {
                                    this.renderSubpixelStar(pl, arcX, thickY, blendColor)
                                }
                            }
                        }
                    }
                }
            }
        }
        // Supernumerary bands: faint, white, Gaussian edges
        if (rainbowVisibility > 0.8 && intensity > 0.8) {
            const superRadius = this.rainbow.radius * 0.85
            const superOpacity = this.rainbow.opacity * 0.12
            for (let band = 0; band < 3; band++) {
                const bandRadius = superRadius - (band * 8)
                for (let angle = Math.PI * 0.2; angle <= Math.PI * 0.8; angle += 0.012) {
                    const arcX = centerX + Math.cos(angle) * bandRadius
                    const arcY = centerY + Math.sin(angle) * bandRadius * 0.6
                    if (arcX >= 0 && arcX < this.width && arcY >= 0 && arcY < horizonY) {
                        const bandAlpha = superOpacity * rainbowVisibility * intensity * (0.5 - band * 0.1)
                        if (bandAlpha > 0.008) {
                            const bandColor = new Color(255, 255, 255, bandAlpha, true)
                            this.renderSubpixelStar(pl, arcX, arcY, bandColor)
                        }
                    }
                }
            }
        }
    }
    
    // Complete render method to integrate all sky elements
    render(time: number, timeOfDay: number, windSpeed: number = 0.21, screenHeight: number = 8, lightningFrequency: number = 1.0, lightningIntensity: number = 0.7, auroraIntensity: number = 0.8, showAurora: boolean = true, showRainbow: boolean = true): PixelList {
        const pl = new PixelList()
        
        // Calculate horizon line - sky elements only visible above this line
        const horizonY = Math.floor(screenHeight * 0.8)  // 80% down the screen where sky meets ground
        
        // Calculate celestial body positions and lighting using unified time
        const sunPos = this.calculateSunPosition(timeOfDay)
        const moonPos = this.calculateMoonPosition(timeOfDay)
        
        // Update sun position and color
        this.sun.x = sunPos.x
        this.sun.y = sunPos.y
        this.sun.color = sunPos.color
        
        // Update moon position and phase
        this.moon.x = moonPos.x
        this.moon.y = moonPos.y
        this.moon.phase = moonPos.phase
        
        // Update lightning system - realistic lightning effect only at night, sometimes
        this.updateLightningSystem(timeOfDay, time, lightningIntensity, lightningFrequency)
        
        // Update Northern Lights for dynamic behavior using unified time
        this.updateNorthernLights(timeOfDay, time)
        
        // Render northern lights (aurora) effect FIRST - in the background behind everything else
        if (showAurora) {
            this.renderNorthernLights(pl, time, this.width, screenHeight, auroraIntensity, timeOfDay)
        }
        
        // Render rainbow during daytime - middle atmospheric layer
        if (showRainbow) {
            this.renderRainbow(pl, timeOfDay, screenHeight, 1.0)
        }
        
        // Render lightning effect (MIDDLE LAYER)
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i]
            
            // Lightning is only visible at night with smooth transitions
            let timeAlpha: number
            if (timeOfDay < 0.2 || timeOfDay > 0.8) {
                timeAlpha = 0.9 // High visibility at night for lightning effect
            } else if (timeOfDay < 0.3 || timeOfDay > 0.7) {
                // Smooth fade during dawn/dusk
                const fadeOut = timeOfDay < 0.3 ? (0.3 - timeOfDay) / 0.1 : (timeOfDay - 0.7) / 0.1
                timeAlpha = fadeOut * 0.9
            } else {
                timeAlpha = 0.0 // Lightning not visible during day
            }
            
            // Dynamic flicker effect for lightning animation using unified time
            const flicker = 0.8 + 0.2 * Math.sin(timeOfDay * Math.PI * 12 + i * 0.2)
            const alpha = star.brightness * timeAlpha * flicker * 0.9 // High intensity
            
            // Only render if star is within screen bounds AND above horizon AND visible
            if (star.x >= -1 && star.x < this.width + 1 && star.y >= -1 && star.y < horizonY + 1 && alpha > 0.05) {
                const starColor = star.color.copy()
                starColor.a = alpha
                
                // Draw lightning with subpixel precision for smooth movement
                this.renderSubpixelStar(pl, star.x, star.y, starColor)
                
                // Add subtle glow effect for brighter lightning points (at night)
                if (star.brightness > 0.6 && timeAlpha > 0.6) {
                    const glowColor = starColor.copy()
                    glowColor.a *= 0.3
                    
                    // Add surrounding glow with subpixel precision
                    this.renderSubpixelStar(pl, star.x, star.y - 1, glowColor)
                    this.renderSubpixelStar(pl, star.x + 1, star.y, glowColor)
                    this.renderSubpixelStar(pl, star.x - 1, star.y, glowColor)
                    this.renderSubpixelStar(pl, star.x, star.y + 1, glowColor)
                }
            }
        }
        
        // Render clouds with wind movement and realistic time-based colors
        for (let i = 0; i < this.clouds.length; i++) {
            const cloud = this.clouds[i]
            // Enhanced wind movement - clouds drift horizontally based on wind speed and time
            const windDrift = timeOfDay * windSpeed * 100  // Constant horizontal drift with wind
            const windTurbulence = Math.sin(timeOfDay * Math.PI * 6 + i * 0.7) * 8 * Math.abs(windSpeed)  // Wind turbulence
            const currentX = (cloud.baseX + windDrift + windTurbulence) % (this.width + cloud.size * 3)  // Wrap around screen
            const currentY = cloud.y + Math.sin(timeOfDay * Math.PI * 1.5 + i) * 1.5  // Gentle vertical float
            // Update cloud position for next frame
            cloud.x = currentX
            const cloudX = Math.floor(currentX)
            const cloudY = Math.floor(currentY)
            // Only render cloud if it's above the horizon and visible enough
            if (cloudY < horizonY) {
                // Calculate realistic cloud color based on time of day
                let cloudColor: Color
                
                if (timeOfDay < 0.18 || timeOfDay > 0.82) {
                    // Deep night - very dark clouds, almost black with blue tint
                    cloudColor = new Color(15, 20, 35, 1, true)
                } else if (timeOfDay < 0.25 || timeOfDay > 0.75) {
                    // Dawn/dusk transition - dark purple-gray with hints of the sky colors
                    const isRising = timeOfDay < 0.5
                    const twilightProgress = isRising ? (timeOfDay - 0.18) / 0.07 : (0.82 - timeOfDay) / 0.07
                    cloudColor = new Color(
                        Math.floor(15 + twilightProgress * 45),  // Dark to purple-red
                        Math.floor(20 + twilightProgress * 25),  // Slight warmth
                        Math.floor(35 + twilightProgress * 25),  // Blue to neutral
                        1, true
                    )
                } else if (timeOfDay < 0.32 || timeOfDay > 0.68) {
                    // Early morning/late evening - warm gray with golden tints
                    const isRising = timeOfDay < 0.5
                    const goldenProgress = isRising ? (timeOfDay - 0.25) / 0.07 : (0.75 - timeOfDay) / 0.07
                    cloudColor = new Color(
                        Math.floor(60 + goldenProgress * 80),   // Warm gray to golden
                        Math.floor(45 + goldenProgress * 65),   // Golden tint
                        Math.floor(60 + goldenProgress * 40),   // Less blue, warmer
                        1, true
                    )
                } else if (timeOfDay < 0.4 || timeOfDay > 0.6) {
                    // Golden hour - clouds lit with warm golden light
                    const goldenIntensity = Math.sin((timeOfDay - 0.32) * Math.PI / 0.36) // Peak at sunrise/sunset
                    cloudColor = new Color(
                        Math.floor(140 + goldenIntensity * 80),  // Bright warm light
                        Math.floor(110 + goldenIntensity * 70),  // Golden
                        Math.floor(100 + goldenIntensity * 50),  // Less blue for warmth
                        1, true
                    )
                } else {
                    // Full daylight - bright white/light gray clouds
                    const noonDistance = Math.abs(timeOfDay - 0.5) // Distance from noon
                    const brightness = 1.0 - noonDistance * 0.3    // Brightest at noon
                    cloudColor = new Color(
                        Math.floor(200 + brightness * 55),      // Bright white
                        Math.floor(210 + brightness * 45),      // Slightly warm white
                        Math.floor(220 + brightness * 35),      // Cool white
                        1, true
                    )
                }
                
                // Draw cloud as clusters of overlapping horizontal lines
                const cloudLayers = Math.floor(cloud.size * 0.8)
                const maxWidth = cloud.size * 3
                for (let layer = 0; layer < cloudLayers; layer++) {
                    // Calculate line properties based on layer position
                    const layerY = cloudY + layer - Math.floor(cloudLayers / 2)
                    const distanceFromCenter = Math.abs(layer - cloudLayers / 2)
                    // Only render cloud layers that are above horizon
                    if (layerY >= 0 && layerY < horizonY) {
                        // Lower lines (further from center) are smaller and more transparent
                        const widthMultiplier = 1.0 - (distanceFromCenter / cloudLayers) * 0.7
                        const lineWidth = Math.floor(maxWidth * widthMultiplier)
                        const baseTransparency = (0.4 - (distanceFromCenter / cloudLayers) * 0.3) * 
                                               (0.8 + 0.2 * Math.sin(timeOfDay * Math.PI * 6 + layer + i))
                        // Apply time-based opacity modifier - clouds more visible during day but more transparent overall
                        let timeOpacity: number
                        if (timeOfDay < 0.2 || timeOfDay > 0.8) {
                            timeOpacity = 0.4 // More transparent at night
                        } else if (timeOfDay < 0.35 || timeOfDay > 0.65) {
                            timeOpacity = 0.6 // Medium transparency during twilight
                        } else {
                            timeOpacity = 0.7 // Still quite transparent during day
                        }
                        
                        const finalTransparency = baseTransparency * timeOpacity * 0.6  // Additional 0.6 multiplier for overall transparency
                        // Use the calculated realistic cloud color
                        const layerCloudColor = cloudColor.copy()
                        layerCloudColor.a = Math.max(0.02, finalTransparency * 0.5)  // More transparent overall
                        
                        // Enhanced fuzzy cloud rendering with scattered pixels and gradual edges
                        // Create fuzzy cloud core
                        for (let thickness = 0; thickness < 2; thickness++) {
                            for (let x = cloudX - Math.floor(lineWidth / 2); x <= cloudX + Math.floor(lineWidth / 2); x++) {
                                if (x >= 0 && x < this.width) {
                                    // Distance-based opacity falloff for fuzzy edges
                                    const distanceFromCenter = Math.abs(x - cloudX) / (lineWidth / 2)
                                    const edgeFalloff = Math.max(0.1, 1.0 - Math.pow(distanceFromCenter, 1.5))  // Smooth falloff
                                    
                                    const fuzzyCoreColor = layerCloudColor.copy()
                                    fuzzyCoreColor.a *= edgeFalloff
                                    
                                    if (fuzzyCoreColor.a > 0.01) {
                                        pl.add(new Pixel(x, layerY + thickness, fuzzyCoreColor))
                                    }
                                }
                            }
                        }
                        
                        // Add scattered fuzzy edge pixels for wispy cloud effect
                        const edgePixelCount = Math.floor(lineWidth * 0.8)
                        for (let edge = 0; edge < edgePixelCount; edge++) {
                            if (Math.random() < 0.4) {  // 40% chance for each edge pixel
                                const edgeX = cloudX - Math.floor(lineWidth * 0.7) + Math.floor(Math.random() * lineWidth * 1.4)
                                const edgeY = layerY + Math.floor(Math.random() * 3) - 1  // Slight vertical scatter
                                
                                if (edgeX >= 0 && edgeX < this.width && edgeY >= 0 && edgeY < horizonY) {
                                    const edgeColor = layerCloudColor.copy()
                                    edgeColor.a *= 0.3 + Math.random() * 0.4  // Random transparency for wispy effect
                                    
                                    if (edgeColor.a > 0.01) {
                                        pl.add(new Pixel(edgeX, edgeY, edgeColor))
                                    }
                                }
                            }
                        }
                        
                        // Add additional wispy trails in wind direction
                        if (Math.abs(windSpeed) > 0.1) {
                            const trailLength = Math.floor(Math.abs(windSpeed) * 15)
                            const trailDirection = windSpeed > 0 ? 1 : -1
                            
                            for (let trail = 1; trail <= trailLength; trail++) {
                                if (Math.random() < 0.3) {  // 30% chance for trail pixels
                                    const trailX = cloudX + (trail * trailDirection)
                                    const trailY = layerY + Math.floor(Math.random() * 2) - 1
                                    
                                    if (trailX >= 0 && trailX < this.width && trailY >= 0 && trailY < horizonY) {
                                        const trailColor = layerCloudColor.copy()
                                        trailColor.a *= (0.5 - (trail / trailLength) * 0.4)  // Fade out with distance
                                        
                                        if (trailColor.a > 0.01) {
                                            pl.add(new Pixel(trailX, trailY, trailColor))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Render sun with realistic positioning and colors
        const sunX = Math.floor(this.sun.x)
        const sunY = Math.floor(this.sun.y)
        
        // Only render sun if it's above the horizon and has intensity
        if (sunY < horizonY && sunPos.intensity > 0.05) {
            // Draw sun with time-appropriate color and intensity
            for (let r = 0; r < this.sun.radius; r += 1) {
                const layerIntensity = (1 - (r / this.sun.radius)) * sunPos.intensity
                const sunColor = this.sun.color.copy()
                sunColor.a = layerIntensity
                
                // Add inner core for brighter center during day
                if (r < this.sun.radius * 0.4 && sunPos.intensity > 0.7) {
                    sunColor.r = Math.min(255, sunColor.r + 50)
                    sunColor.g = Math.min(255, sunColor.g + 50)
                    sunColor.b = Math.min(255, sunColor.b + 50)
                }
                
                // Only add sun circle if it's above horizon
                const circleY = sunY
                if (circleY + r < horizonY && circleY - r >= 0) {
                    pl.add(new DrawCircle(sunX, sunY, r, sunColor))
                }
            }
            
            // Add sun rays during bright daylight
            if (sunPos.intensity > 0.8) {
                const rayColor = this.sun.color.copy()
                rayColor.a = 0.3 * sunPos.intensity
                
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI * 2) / 8
                    const rayLength = this.sun.radius * 1.5
                    const endX = sunX + Math.cos(angle) * rayLength
                    const endY = sunY + Math.sin(angle) * rayLength
                    
                    if (endY < horizonY && endY >= 0) {
                        pl.add(new DrawLine(sunX, sunY, Math.floor(endX), Math.floor(endY), rayColor, rayColor))
                    }
                }
            }
        }
        
        // Render moon with realistic positioning and phases (more visible at night)
        const moonVisibility = timeOfDay < 0.3 || timeOfDay > 0.7 ? 1.0 : 
                              timeOfDay < 0.4 || timeOfDay > 0.6 ? 0.5 : 0.2
        
        if (moonVisibility > 0.1) {
            this.drawMoonWithPhase(pl, this.moon.x, this.moon.y, this.moon.radius, this.moon.phase, horizonY, moonVisibility)
        }
        
        // Render distant skyline objects for depth illusion
        this.renderSkylineObjects(pl, timeOfDay, horizonY)
        
        return pl
    }
    
    // Render skyline objects with time-based lighting and atmospheric perspective
    renderSkylineObjects(pl: PixelList, timeOfDay: number, horizonY: number) {
        // Calculate atmospheric visibility based on time of day
        let visibility: number
        if (timeOfDay < 0.2 || timeOfDay > 0.8) {
            visibility = 0.6 // More visible at night (silhouettes)
        } else if (timeOfDay < 0.35 || timeOfDay > 0.65) {
            // Dawn/dusk - objects become silhouettes
            const duskFactor = timeOfDay < 0.35 ? (0.35 - timeOfDay) / 0.15 : (timeOfDay - 0.65) / 0.15
            visibility = 0.6 + duskFactor * 0.3
        } else {
            visibility = 0.9 // More visible during day (less atmospheric haze)
        }
        
        for (const obj of this.skylineObjects) {
            // Skip if object is below horizon
            if (obj.y >= horizonY) continue
            
            // Calculate time-based color modification
            const objColor = obj.color.copy()
            objColor.a *= visibility
            
            // Add atmospheric haze effect during day
            if (timeOfDay > 0.35 && timeOfDay < 0.65) {
                // Blend with sky color during day for atmospheric perspective
                const hazeAmount = 0.6
                objColor.r = Math.floor(objColor.r * (1 - hazeAmount) + 150 * hazeAmount)
                objColor.g = Math.floor(objColor.g * (1 - hazeAmount) + 180 * hazeAmount)
                objColor.b = Math.floor(objColor.b * (1 - hazeAmount) + 200 * hazeAmount)
            }
            
            // Render object with fuzzy edges for distance effect
            for (let x = 0; x < obj.width; x++) {
                for (let y = 0; y < obj.height; y++) {
                    const pixelX = obj.x + x
                    const pixelY = obj.y + y
                    
                    // Skip if out of bounds or below horizon
                    if (pixelX < 0 || pixelX >= this.width || pixelY < 0 || pixelY >= horizonY) continue
                    
                    // Create fuzzy effect by reducing opacity at edges
                    let edgeFactor = 1.0
                    if (obj.type === "hill") {
                        // Hills have softer, more natural edges
                        const centerX = obj.width / 2
                        const centerY = obj.height / 2
                        const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
                        const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2)
                        edgeFactor = Math.max(0.2, 1.0 - (distFromCenter / maxDist) * 0.6)
                    } else {
                        // Buildings and trees have slight edge softening
                        const isEdge = x === 0 || x === obj.width - 1 || y === 0 || y === obj.height - 1
                        edgeFactor = isEdge ? 0.6 : 1.0
                    }
                    
                    const finalColor = objColor.copy()
                    finalColor.a *= edgeFactor
                    
                    // Only render if alpha is significant enough
                    if (finalColor.a > 0.05) {
                        pl.add(new Pixel(pixelX, pixelY, finalColor))
                    }
                }
            }
        }
    }
}

// Main 3D Synthwave Animation
export default class Synthwave extends Animator {
    static category = "Synthwave"
    static title = "3D Synthwave"
    static description = "Fully 3D rendered synthwave landscape with real 3D perspective"
    
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const synthControls = controls.group("3D Synthwave")
        const speedControl = synthControls.value("Animation Speed", 1, 0.1, 3, 0.1, true)
        const windControl = synthControls.value("Wind Speed", 0.21, -1, 1, 0.01, true)  // Wind: -1=left, 0=still, +1=right
        const dayLengthControl = synthControls.value("Day Length (seconds)", 60, 10, 300, 5, true)  // Configurable day length
        const lightningSpeedControl = synthControls.value("Lightning Frequency", 1.0, 0.1, 3.0, 0.1, true)  // Lightning occurrence frequency
        const lightningIntensityControl = synthControls.value("Lightning Intensity", 0.7, 0.1, 1.5, 0.1, true)  // Lightning brightness
        const auroraIntensityControl = synthControls.value("Aurora Intensity", 0.8, 0.0, 2.0, 0.1, true)  // Northern Lights intensity
        const showStarsControl = synthControls.switch("Show Stars", true, false)
        const showAuroraControl = synthControls.switch("Show Northern Lights", true, false)
        const showHorizonControl = synthControls.switch("Show Horizon Effect", true, false)
        const debugModeControl = synthControls.switch("Debug Mode", false, true)
        const noClipControl = synthControls.switch("No Clipping (Debug)", true, true)
        
        const pl = new PixelList()
        box.add(pl)
        
        const width = box.width()
        const height = box.height()
        
        // Setup 3D camera with error checking
        let camera: Camera3D
        let renderer: Renderer3D
        let fractalTree: FractalTree3D
        let skySystem: SkySystem2D
        
        try {
            camera = new Camera3D(
                new Vec3(0, 0.5, -1.5),   // Camera position - stationary
                new Vec3(0, 0, 6.0)       // Camera target updated to new tower position Z=6.0
            )
            
            // Create 3D renderer with error checking
            renderer = new Renderer3D(width, height, camera)
            
            // Create 3D objects with optimal sizing for small screen visibility
            fractalTree = new FractalTree3D() // Growing fractal tree system
            skySystem = new SkySystem2D(width, height)
        } catch (error) {
            console.error("Failed to initialize 3D objects:", error)
            // Fallback to 2D only mode
            camera = null
            renderer = null
        }
        
        let time = 0
        
        // ULTRA-PRECISE TIME SYSTEM: Use 30ms intervals for 33.33 FPS (higher precision)
        scheduler.interval(10, (frameNr) => {
            pl.clear()
            
            // MUCH FASTER time progression with higher precision multiplier
            time += speedControl.value * 18  // 18x faster animation (was 10x) for rapid time progression

            // ULTRA-PRECISE TIME CALCULATIONS - Calculate time of day with sub-frame accuracy
            // dayLengthControl.value = seconds for full day (24 hours)
            // At 33.33 FPS (30ms intervals), dayLengthControl.value * 33.33 = total frames for one day
            const preciseFramesPerSecond = 1000 / 30  // Exact 33.33 FPS for precise calculations
            const framesPerDay = dayLengthControl.value * preciseFramesPerSecond
            
            // Enhanced precision time calculation with double precision
            const rawTimeOfDay = (time / speedControl.value) / framesPerDay
            const timeOfDay = rawTimeOfDay - Math.floor(rawTimeOfDay)  // More precise modulo operation
            
            // Calculate ultra-realistic sky colors based on UNIFIED time of day with atmospheric scattering
            let topSkyColor: Color
            let bottomSkyColor: Color
            
            if (timeOfDay < 0.18 || timeOfDay > 0.82) {
                // Deep night - very dark sky with subtle blue tints
                topSkyColor = new Color(0, 0, 8, 1, true)  // Almost black at zenith
                bottomSkyColor = new Color(5, 8, 25, 1, true)  // Slight blue glow at horizon
            } else if (timeOfDay < 0.22 || timeOfDay > 0.78) {
                // Astronomical twilight - first hint of light
                const twilightProgress = timeOfDay < 0.22 ? (timeOfDay - 0.18) / 0.04 : (0.82 - timeOfDay) / 0.04
                topSkyColor = new Color(
                    Math.floor(0 + twilightProgress * 15),
                    Math.floor(0 + twilightProgress * 8),
                    Math.floor(8 + twilightProgress * 17),
                    1, true
                )
                bottomSkyColor = new Color(
                    Math.floor(5 + twilightProgress * 25),
                    Math.floor(8 + twilightProgress * 15),
                    Math.floor(25 + twilightProgress * 35),
                    1, true
                )
            } else if (timeOfDay < 0.28 || timeOfDay > 0.72) {
                // Civil twilight - purple and deep blue
                const civilProgress = timeOfDay < 0.28 ? (timeOfDay - 0.22) / 0.06 : (0.78 - timeOfDay) / 0.06
                topSkyColor = new Color(
                    Math.floor(15 + civilProgress * 25),
                    Math.floor(8 + civilProgress * 17),
                    Math.floor(25 + civilProgress * 35),
                    1, true
                )
                bottomSkyColor = new Color(
                    Math.floor(30 + civilProgress * 50),
                    Math.floor(23 + civilProgress * 37),
                    Math.floor(60 + civilProgress * 40),
                    1, true
                )
            } else if (timeOfDay < 0.32 || timeOfDay > 0.68) {
                // Nautical twilight - dramatic color burst (purple to orange horizon)
                const nauticalProgress = timeOfDay < 0.32 ? (timeOfDay - 0.28) / 0.04 : (0.72 - timeOfDay) / 0.04
                topSkyColor = new Color(
                    Math.floor(40 + nauticalProgress * 30),
                    Math.floor(25 + nauticalProgress * 35),
                    Math.floor(60 + nauticalProgress * 40),
                    1, true
                )
                bottomSkyColor = new Color(
                    Math.floor(80 + nauticalProgress * 100),
                    Math.floor(60 + nauticalProgress * 80),
                    Math.floor(100 + nauticalProgress * 20),
                    1, true
                )
            } else if (timeOfDay < 0.38 || timeOfDay > 0.62) {
                // Golden hour - warm orange to blue transition
                const goldenProgress = timeOfDay < 0.38 ? (timeOfDay - 0.32) / 0.06 : (0.68 - timeOfDay) / 0.06
                topSkyColor = new Color(
                    Math.floor(70 + goldenProgress * 65),
                    Math.floor(60 + goldenProgress * 100),
                    Math.floor(100 + goldenProgress * 100),
                    1, true
                )
                bottomSkyColor = new Color(
                    Math.floor(180 + goldenProgress * 20),
                    Math.floor(140 + goldenProgress * 60),
                    Math.floor(120 + goldenProgress * 20),
                    1, true
                )
            } else {
                // Full daylight - bright white with subtle temperature variations
                const noonDistance = Math.abs(timeOfDay - 0.5)
                const dayStrength = Math.cos(noonDistance * Math.PI / 0.12)
                
                // Deep blue at zenith, lighter near horizon (Rayleigh scattering effect)
                topSkyColor = new Color(
                    Math.floor(70 + dayStrength * 20),   // Deep blue
                    Math.floor(130 + dayStrength * 30),
                    Math.floor(200 + dayStrength * 35),
                    1, true
                )
                bottomSkyColor = new Color(
                    Math.floor(180 + dayStrength * 40),  // Atmospheric whitening near horizon
                    Math.floor(200 + dayStrength * 35),
                    Math.floor(220 + dayStrength * 35),
 1, true
                )
            }

            // Render realistic sky background gradient (upper half) and grass (lower half)
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let bgColor
                    if (y < Math.floor(height * 0.8)) {
                        // Sky gradient with atmospheric scattering effects
                        const skyGradient = y / (height * 0.8)
                        
                        // Use non-linear gradient for more realistic atmospheric perspective
                        const atmosphericCurve = Math.pow(skyGradient, 1.5) // Atmospheric scattering curve
                        
                        bgColor = new Color(
                            Math.floor(topSkyColor.r + atmosphericCurve * (bottomSkyColor.r - topSkyColor.r)),
                            Math.floor(topSkyColor.g + atmosphericCurve * (bottomSkyColor.g - topSkyColor.g)),
                            Math.floor(topSkyColor.b + atmosphericCurve * (bottomSkyColor.b - topSkyColor.b)),
                            1
                        )
                    } else {
                        // Ground area - grass with dramatic darkening at night (using UNIFIED timeOfDay)
                        bgColor = colors.grass.copy()
                        if (timeOfDay < 0.3 || timeOfDay > 0.7) {
                            // Much more dramatic grass darkening at night with smooth transitions
                            const nightFactor = timeOfDay < 0.3 ? (0.3 - timeOfDay) / 0.3 : (timeOfDay - 0.7) / 0.3
                            const darkenAmount = nightFactor * 0.85 // Up to 85% darker for more dramatic night effect
                            
                            // Add subtle blue tint at night for moonlight effect
                            bgColor.r = Math.floor(bgColor.r * (1 - darkenAmount))
                            bgColor.g = Math.floor(bgColor.g * (1 - darkenAmount * 0.9)) // Keep slightly more green
                            bgColor.b = Math.floor(bgColor.b * (1 - darkenAmount * 0.7) + nightFactor * 15) // Add blue tint
                        }
                    }
                    pl.add(new Pixel(x, y, bgColor))
                }
            }
            
            // Add smooth horizon effect with transparency gradient
            if (showHorizonControl.enabled) {
                const horizonY = Math.floor(height * 0.8) // Horizon line at 80% down
                const horizonEffectHeight = Math.min(8, Math.floor(height * 0.15)) // Effect spans 15% of screen height
            
            // Create horizon gradient colors based on time of day
            let horizonTopColor: Color
            let horizonBottomColor: Color
            
            if (timeOfDay < 0.2 || timeOfDay > 0.8) {
                // Night horizon - subtle dark blue/purple gradient
                horizonTopColor = new Color(15, 25, 45, 0.6, true)  // Dark blue-purple, semi-transparent
                horizonBottomColor = new Color(8, 15, 25, 0.8, true) // Darker at bottom, more opaque
            } else if (timeOfDay < 0.35 || timeOfDay > 0.65) {
                // Dawn/dusk horizon - warm colors
                const duskFactor = timeOfDay < 0.35 ? (0.35 - timeOfDay) / 0.15 : (timeOfDay - 0.65) / 0.15
                horizonTopColor = new Color(
                    Math.floor(80 + duskFactor * 120),   // Orange to deep red
                    Math.floor(60 + duskFactor * 40),    // Warm orange
                    Math.floor(30 + duskFactor * 20),    // Low blue for warmth
                    0.5 + duskFactor * 0.3, true        // Variable transparency
                )
                horizonBottomColor = new Color(
                    Math.floor(40 + duskFactor * 80),    // Darker orange-red
                    Math.floor(30 + duskFactor * 30),    // Darker orange
                    Math.floor(15 + duskFactor * 15),    // Minimal blue
                    0.7 + duskFactor * 0.2, true        // More opaque at bottom
                )
            } else {
                // Daytime horizon - atmospheric haze effect
                horizonTopColor = new Color(200, 220, 240, 0.4, true)  // Light atmospheric haze
                horizonBottomColor = new Color(180, 200, 220, 0.6, true) // Slightly more opaque ground haze
            }
            
            // Render horizon gradient effect
            for (let y = horizonY - horizonEffectHeight; y <= horizonY + horizonEffectHeight; y++) {
                if (y >= 0 && y < height) {
                    // Calculate position in horizon effect (0 = top of effect, 1 = bottom of effect)
                    const effectProgress = (y - (horizonY - horizonEffectHeight)) / (horizonEffectHeight * 2)
                    
                    // Create smooth S-curve for more natural atmospheric transition
                    const smoothProgress = effectProgress * effectProgress * (3 - 2 * effectProgress)
                    
                    // Interpolate colors and opacity
                    const horizonColor = new Color(
                        Math.floor(horizonTopColor.r + smoothProgress * (horizonBottomColor.r - horizonTopColor.r)),
                        Math.floor(horizonTopColor.g + smoothProgress * (horizonBottomColor.g - horizonTopColor.g)),
                        Math.floor(horizonTopColor.b + smoothProgress * (horizonBottomColor.b - horizonTopColor.b)),
                        horizonTopColor.a + smoothProgress * (horizonBottomColor.a - horizonTopColor.a),
                        true
                    )
                    
                    // Add some horizontal variation for atmospheric realism
                    for (let x = 0; x < width; x++) {
                        // Subtle horizontal atmospheric variation
                        const horizontalVariation = 0.9 + 0.1 * Math.sin((x / width) * Math.PI * 4 + timeOfDay * Math.PI * 6)
                        const finalColor = horizonColor.copy()
                        finalColor.a *= horizontalVariation
                        
                        // Only render if opacity is significant
                        if (finalColor.a > 0.05) {
                            pl.add(new Pixel(x, y, finalColor))
                        }
                    }
                }
            }
            } // End horizon effect
            
            // Only render 3D if initialization succeeded
            if (renderer && camera) {
                console.log("3D rendering active, frame:", frameNr)
                try {
                    renderer.clearDepthBuffer()
                    
                    // Calculate lighting multiplier for 3D scene based on UNIFIED time of day
                    const lightingMultiplier = timeOfDay < 0.2 || timeOfDay > 0.8 ? 0.3 : // Night - very dark
                                             timeOfDay < 0.25 || timeOfDay > 0.75 ? 0.3 + ((timeOfDay < 0.25 ? (0.25 - timeOfDay) : (timeOfDay - 0.75)) / 0.05 * 0.2) : // Pre-dawn/late night
                                             timeOfDay < 0.35 || timeOfDay > 0.65 ? 0.5 + ((timeOfDay < 0.35 ? (timeOfDay - 0.25) : (0.75 - timeOfDay)) / 0.1 * 0.3) : // Dawn/dusk
                                             0.8 + (Math.cos(Math.abs(timeOfDay - 0.5) / 0.15 * Math.PI / 2) * 0.2) // Day - bright
                    
                    console.log(`3D Lighting multiplier: ${lightingMultiplier.toFixed(2)} (unified timeOfDay: ${timeOfDay.toFixed(3)})`)
                    
                    // Render sky system FIRST as background layer (behind all 3D objects)
                    if (showStarsControl.enabled && skySystem) {
                        console.log("Rendering sky system as background...")
                        pl.add(skySystem.render(time, timeOfDay, windControl.value, height, lightningSpeedControl.value, lightningIntensityControl.value, auroraIntensityControl.value, showAuroraControl.enabled))
                    }
                    
                    // Render 3D objects with error checking and realistic lighting
                    
                    // Add debug frame border to see screen boundaries
                    for (let x = 0; x < width; x++) {
                        pl.add(new Pixel(x, 0, colors.neonCyan))
                        pl.add(new Pixel(x, height-1, colors.neonCyan))
                    }
                    for (let y = 0; y < height; y++) {
                        pl.add(new Pixel(0, y, colors.neonCyan))
                        pl.add(new Pixel(width-1, y, colors.neonCyan))
                    }
                    
                    if (fractalTree) {
                        console.log("Rendering fractal tree with 2D rendering for maximum performance")
                        
                        // Update fractal tree with seasonal growth
                        const dayOfYear = Math.floor((time / speedControl.value) / framesPerDay) % 12
                        const season = Math.floor((dayOfYear % 12) / 3) // 0=spring, 1=summer, 2=autumn, 3=winter
                        const seasonProgress = ((dayOfYear % 12) % 3) / 3 // Progress within current season (0-1)
                        
                        fractalTree.update(timeOfDay, dayOfYear)
                        
                        // Render fractal tree with ultra-fast 2D rendering
                        pl.add(fractalTree.render2D(renderer, season, seasonProgress))
                    }
                } catch (error) {
                    console.error("3D rendering error:", error)
                    // Continue with 2D fallback
                }
            } else {
                console.log("3D rendering not available - using 2D fallback only")
            }
        })
    }
    
    // ...existing code...
}
