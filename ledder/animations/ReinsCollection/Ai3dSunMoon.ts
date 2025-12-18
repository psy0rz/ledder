import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import DrawCircle from "../../draw/DrawCircle.js"

// Simplified color palette
const colors = {
    trunkBrown: new Color(85, 65, 45, 1, true),
    springGreen: new Color(120, 200, 100, 1, true),
    summerGreen: new Color(50, 180, 60, 1, true),
    autumnRed: new Color(200, 80, 60, 1, true),
    autumnOrange: new Color(220, 140, 65, 1, true),
    autumnYellow: new Color(210, 200, 70, 1, true),
    grass: new Color(0, 120, 40, 1, true),
    sunYellow: new Color(255, 255, 100, 1, true)
}

// Simple 3D vector
class Vec3 {
    constructor(public x: number, public y: number, public z: number) {}
    add(v: Vec3): Vec3 { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z) }
    multiply(s: number): Vec3 { return new Vec3(this.x * s, this.y * s, this.z * s) }
    normalize(): Vec3 {
        const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        return len === 0 ? new Vec3(0, 0, 0) : new Vec3(this.x / len, this.y / len, this.z / len)
    }
}

// Tree branch
class TreeBranch {
    childBranches: TreeBranch[] = []
    constructor(
        public start: Vec3,
        public direction: Vec3,
        public radius: number,
        public targetLength: number,
        public generation: number,
        public parent: TreeBranch | null,
        public length: number = 0.5
    ) {}
}

// Tree leaf
class TreeLeaf {
    constructor(public position: Vec3, public branch: TreeBranch, public color: Color) {}
}

// Falling leaf
class FallingLeaf {
    life: number = 200
    constructor(public position: Vec3, public velocity: Vec3, public color: Color) {}
    
    update(): boolean {
        this.velocity.y -= 0.0005
        this.velocity.x += (Math.random() - 0.5) * 0.001
        this.position = this.position.add(this.velocity)
        this.life--
        this.color.a = Math.max(0, this.life * 0.003)
        return this.life > 0 && this.position.y > 0
    }
}

// Simplified tree
class FractalTree {
    branches: TreeBranch[] = []
    leaves: TreeLeaf[] = []
    fallingLeaves: FallingLeaf[] = []
    age: number = 0
    maxHeight: number = 10.0
    position: Vec3
    
    constructor() {
        this.position = new Vec3(0, 0, 4)
        const root = new TreeBranch(new Vec3(0, 0, 0), new Vec3(0, 1, 0), 1.0, 3.0, 0, null)
        this.branches.push(root)
    }
    
    update(dayOfYear: number) {
        this.age = dayOfYear % 12
        const season = Math.floor((dayOfYear % 12) / 3)
        const seasonProgress = ((dayOfYear % 12) % 3) / 3
        
        // Grow branches
        for (const branch of this.branches) {
            if (branch.length < branch.targetLength) {
                branch.length = Math.min(branch.targetLength, branch.length + 0.3)
                
                if (branch.length >= branch.targetLength * 0.3 && 
                    branch.childBranches.length === 0 && 
                    branch.generation < 4 && 
                    Math.random() < 0.5) {
                    this.spawnChildBranches(branch)
                }
            }
        }
        
        // Manage leaves
        if ((season === 0 || season === 1) && this.leaves.length < 500) {
            this.spawnLeaves(season)
        }
        if (season === 2 && Math.random() < 0.1) {
            const leaf = this.leaves.pop()
            if (leaf) this.createFallingLeaf(leaf)
        }
        if (season === 3 && Math.random() < 0.05 && this.leaves.length > 0) {
            const leaf = this.leaves.pop()
            if (leaf) this.createFallingLeaf(leaf)
        }
        
        this.fallingLeaves = this.fallingLeaves.filter(l => l.update())
    }
    
    spawnChildBranches(parent: TreeBranch) {
        const num = parent.generation === 0 ? 4 : 3
        for (let i = 0; i < num; i++) {
            const angle = (i / num) * Math.PI * 2
            const upBias = parent.generation === 0 ? 0.6 : 0.3
            const dir = new Vec3(
                Math.cos(angle) * (1.0 - upBias),
                upBias,
                0
            ).normalize()
            
            const start = parent.start.add(parent.direction.multiply(parent.length * 0.7))
            const length = 0.5 + Math.random() * 0.5
            const child = new TreeBranch(start, dir, parent.radius * 0.7, length, parent.generation + 1, parent)
            this.branches.push(child)
            parent.childBranches.push(child)
        }
    }
    
    spawnLeaves(season: number) {
        const leafBranches = this.branches.filter(b => b.generation >= 2 && b.generation <= 4)
        if (leafBranches.length === 0) return
        
        const branch = leafBranches[Math.floor(Math.random() * leafBranches.length)]
        for (let i = 0; i < 3; i++) {
            const pos = branch.start.add(branch.direction.multiply(branch.length * Math.random()))
                .add(new Vec3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.15 - 3, 0))
            pos.y = Math.max(0, pos.y)
            const color = this.getSeasonalLeafColor(season, 0)
            this.leaves.push(new TreeLeaf(pos, branch, color))
        }
    }
    
    createFallingLeaf(leaf: TreeLeaf) {
        const falling = new FallingLeaf(
            new Vec3(leaf.position.x, leaf.position.y, leaf.position.z),
            new Vec3((Math.random() - 0.5) * 0.02, -0.01, 0),
            new Color(leaf.color.r, leaf.color.g, leaf.color.b, 1)
        )
        this.fallingLeaves.push(falling)
    }
    
    getSeasonalLeafColor(season: number, progress: number): Color {
        if (season === 0) return colors.springGreen.copy()
        if (season === 1) return colors.summerGreen.copy()
        if (season === 2) {
            const r = Math.random()
            if (r < 0.33) return colors.autumnRed.copy()
            if (r < 0.66) return colors.autumnOrange.copy()
            return colors.autumnYellow.copy()
        }
        return new Color(100, 70, 40, 0.7, true)
    }
    
    render(pl: PixelList, width: number, height: number) {
        const centerX = Math.floor(width / 2)
        const baseY = Math.floor(height * 0.8)
        
        // Draw branches
        for (const branch of this.branches) {
            const start = branch.start.add(this.position)
            const end = start.add(branch.direction.multiply(branch.length))
            
            const sx = Math.floor(centerX + start.x * 10)
            const sy = Math.floor(baseY - start.y * 10)
            const ex = Math.floor(centerX + end.x * 10)
            const ey = Math.floor(baseY - end.y * 10)
            
            const thick = Math.max(1, Math.floor(branch.radius * 3))
            const color = colors.trunkBrown.copy()
            
            this.drawLine(pl, sx, sy, ex, ey, thick, color, width, height)
        }
        
        // Draw leaves
        for (const leaf of this.leaves) {
            const pos = leaf.position.add(this.position)
            const lx = Math.floor(centerX + pos.x * 10)
            const ly = Math.floor(baseY - pos.y * 10)
            
            if (lx >= 0 && lx < width && ly >= 0 && ly < height) {
                pl.add(new Pixel(lx, ly, leaf.color))
                if (lx + 1 < width) pl.add(new Pixel(lx + 1, ly, leaf.color))
                if (ly + 1 < height) pl.add(new Pixel(lx, ly + 1, leaf.color))
            }
        }
        
        // Draw falling leaves
        for (const leaf of this.fallingLeaves) {
            const pos = leaf.position.add(this.position)
            const lx = Math.floor(centerX + pos.x * 10)
            const ly = Math.floor(baseY - pos.y * 10)
            
            if (lx >= 0 && lx < width && ly >= 0 && ly < height) {
                pl.add(new Pixel(lx, ly, leaf.color))
            }
        }
    }
    
    drawLine(pl: PixelList, x1: number, y1: number, x2: number, y2: number, thickness: number, color: Color, width: number, height: number) {
        const dx = Math.abs(x2 - x1)
        const dy = Math.abs(y2 - y1)
        const sx = x1 < x2 ? 1 : -1
        const sy = y1 < y2 ? 1 : -1
        let err = dx - dy
        
        let x = x1, y = y1
        while (true) {
            for (let ox = -thickness; ox <= thickness; ox++) {
                for (let oy = -thickness; oy <= thickness; oy++) {
                    const px = x + ox
                    const py = y + oy
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        pl.add(new Pixel(px, py, color))
                    }
                }
            }
            
            if (x === x2 && y === y2) break
            const e2 = 2 * err
            if (e2 > -dy) { err -= dy; x += sx }
            if (e2 < dx) { err += dx; y += sy }
        }
    }
}

// Simplified sky
class SkySystem {
    sun: {x: number, y: number, color: Color}
    moon: {x: number, y: number}
    
    constructor(private width: number, private height: number) {
        this.sun = {x: width / 2, y: height * 0.2, color: colors.sunYellow.copy()}
        this.moon = {x: width / 4, y: height * 0.3}
    }
    
    render(pl: PixelList, timeOfDay: number) {
        const horizonY = Math.floor(this.height * 0.8)
        
        // Sun position
        const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2
        this.sun.x = this.width / 2 + Math.cos(sunAngle) * this.width * 0.4
        this.sun.y = horizonY - Math.sin(sunAngle) * this.height * 0.6
        
        // Draw sun
        if (this.sun.y < horizonY && this.sun.y > 0) {
            const sunX = Math.floor(this.sun.x)
            const sunY = Math.floor(this.sun.y)
            const radius = 5
            
            for (let r = 0; r < radius; r++) {
                const sunColor = this.sun.color.copy()
                sunColor.a = 1.0 - (r / radius) * 0.5
                pl.add(new DrawCircle(sunX, sunY, r, sunColor))
            }
        }
        
        // Moon position (opposite sun)
        const moonTime = (timeOfDay + 0.5) % 1.0
        const moonAngle = moonTime * Math.PI * 2 - Math.PI / 2
        this.moon.x = this.width / 2 + Math.cos(moonAngle) * this.width * 0.4
        this.moon.y = horizonY - Math.sin(moonAngle) * this.height * 0.6
        
        // Draw moon
        if (this.moon.y < horizonY && this.moon.y > 0) {
            const moonX = Math.floor(this.moon.x)
            const moonY = Math.floor(this.moon.y)
            const moonColor = new Color(220, 220, 240, 0.7, true)
            
            for (let r = 0; r < 3; r++) {
                const c = moonColor.copy()
                c.a = 0.7 - (r / 3) * 0.3
                pl.add(new DrawCircle(moonX, moonY, r, c))
            }
        }
    }
}

// Main animation
export default class Synthwave extends Animator {
    static category = "Synthwave"
    static title = "3D Synthwave"
    static description = "Simplified tree animation with day/night cycle"
    
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const synthControls = controls.group("Settings")
        const speedControl = synthControls.value("Speed", 1, 0.1, 3, 0.1, true)
        const dayLengthControl = synthControls.value("Day Length (sec)", 60, 10, 300, 5, true)
        
        const pl = new PixelList()
        box.add(pl)
        
        const width = box.width()
        const height = box.height()
        
        const tree = new FractalTree()
        const sky = new SkySystem(width, height)
        
        let time = 0
        
        scheduler.interval(30, () => {
            pl.clear()
            
            time += speedControl.value * 18
            const framesPerDay = dayLengthControl.value * 33.33
            const timeOfDay = ((time / speedControl.value) / framesPerDay) % 1.0
            
            // Sky gradient
            let topColor: Color, bottomColor: Color
            if (timeOfDay < 0.2 || timeOfDay > 0.8) {
                topColor = new Color(0, 0, 8, 1, true)
                bottomColor = new Color(5, 8, 25, 1, true)
            } else if (timeOfDay < 0.35 || timeOfDay > 0.65) {
                topColor = new Color(70, 60, 100, 1, true)
                bottomColor = new Color(180, 140, 120, 1, true)
            } else {
                topColor = new Color(70, 130, 200, 1, true)
                bottomColor = new Color(180, 200, 220, 1, true)
            }
            
            // Render sky and grass
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let color: Color
                    if (y < Math.floor(height * 0.8)) {
                        const t = Math.pow(y / (height * 0.8), 1.5)
                        color = new Color(
                            Math.floor(topColor.r + t * (bottomColor.r - topColor.r)),
                            Math.floor(topColor.g + t * (bottomColor.g - topColor.g)),
                            Math.floor(topColor.b + t * (bottomColor.b - topColor.b)),
                            1
                        )
                    } else {
                        color = colors.grass.copy()
                        if (timeOfDay < 0.3 || timeOfDay > 0.7) {
                            const night = timeOfDay < 0.3 ? (0.3 - timeOfDay) / 0.3 : (timeOfDay - 0.7) / 0.3
                            color.r = Math.floor(color.r * (1 - night * 0.85))
                            color.g = Math.floor(color.g * (1 - night * 0.75))
                            color.b = Math.floor(color.b * (1 - night * 0.7) + night * 15)
                        }
                    }
                    pl.add(new Pixel(x, y, color))
                }
            }
            
            // Render sky objects
            sky.render(pl, timeOfDay)
            
            // Update and render tree
            const dayOfYear = Math.floor((time / speedControl.value) / framesPerDay) % 12
            tree.update(dayOfYear)
            tree.render(pl, width, height)
        })
    }
}
