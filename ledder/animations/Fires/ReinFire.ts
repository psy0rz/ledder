import Animator from "../../Animator.js"
import Color from "../../Color.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelBox from "../../PixelBox.js"
import {patternSelect} from "../../ColorPatterns.js"
import {glow} from "../../utils.js"


export default class ReinFire extends Animator {
    static category = "Fire"
    static title = "ReinFire"
    static description = "Simple realistic wood fire simulation"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        
        // Fire configuration
        const fireGroup = controls.group("Fire Settings")
        const flameHeight = fireGroup.value("Flame height", 80, 10, 100, 5)
        const flameCount = fireGroup.value("Flame count", 8, 1, 20, 1)
        const flameWidth = fireGroup.value("Flame width", 8, 1, 64, 1)
        const flameVariation = fireGroup.value("Flame variation %", 40, 0, 100, 5)
        const randomization = fireGroup.value("Randomization %", 50, 0, 100, 5)
        const randomPeriod = fireGroup.value("Randomization period (s)", 60, 0.1, 60, 0.1)
        
        // Fuel controls
        const fuelGroup = controls.group("Fuel")
        const oxygen = fuelGroup.value("Oxygen %", 80, 0, 100, 5)
        const fuelAmount = fuelGroup.value("Wood amount", 70, 0, 100, 5)
        const woodType = fuelGroup.select("Wood type", "Oak", [
            {id: "Oak", name: "Oak (hot, steady)"},
            {id: "Pine", name: "Pine (fast, bright)"},
            {id: "Birch", name: "Birch (clean, moderate)"},
            {id: "Cedar", name: "Cedar (aromatic, crackling)"}
        ])
        
        // Visual settings
        const visualGroup = controls.group("Visual")
        const fireInterval = visualGroup.value("Update speed", 2, 1, 10, 0.5)
        let colors = patternSelect(visualGroup, 'Fire colors', 'ReinFire')

        const width = box.width()
        const height = box.height()
        
        // Fire position (center bottom, 70% width)
        const fireWidth = Math.floor(width * 0.7)
        const fireXStart = Math.floor((width - fireWidth) / 2)
        const fireXEnd = fireXStart + fireWidth
        const fireCenterX = Math.floor(width / 2)  // Center of fuel
        const fireY = 0  // Bottom of screen
        
        // Create pixel raster
        let pixels = box.raster(box, new Color(0, 0, 0, 0), true, false, false)
        
        // Fire field - stores heat/intensity values
        let field: number[][] = []
        for (let y = 0; y < height; y++) {
            field[y] = []
            for (let x = 0; x < width; x++) {
                field[y][x] = 0
            }
        }
        
        // Flame sources - individual flames across fire width
        let flames: {x: number, heat: number, variation: number, baseX: number, width: number, baseWidth: number, phaseOffset: number, distanceFromCenter: number}[] = []
        for (let i = 0; i < flameCount.value; i++) {
            const x = fireXStart + Math.floor((i / (flameCount.value - 1)) * fireWidth)
            const distanceFromCenter = Math.abs(x - fireCenterX) / (fireWidth / 2)  // 0 at center, 1 at edges
            flames.push({
                x: x,
                baseX: x,
                heat: 0,
                variation: Math.random(),
                width: flameWidth.value,
                baseWidth: flameWidth.value,
                phaseOffset: Math.random() * Math.PI * 2,  // Random phase for each flame
                distanceFromCenter: distanceFromCenter
            })
        }
        
        // Wood type properties
        const woodProps = {
            "Oak": {burnRate: 0.8, heatOutput: 1.2, stability: 0.9},
            "Pine": {burnRate: 1.3, heatOutput: 0.9, stability: 0.6},
            "Birch": {burnRate: 1.0, heatOutput: 1.0, stability: 0.85},
            "Cedar": {burnRate: 1.1, heatOutput: 0.95, stability: 0.7}
        }

        scheduler.intervalControlled(fireInterval, (frameNr) => {
            
            // Update flame count if changed
            if (flames.length !== flameCount.value) {
                flames = []
                for (let i = 0; i < flameCount.value; i++) {
                    const x = fireXStart + Math.floor((i / Math.max(1, flameCount.value - 1)) * fireWidth)
                    const distanceFromCenter = Math.abs(x - fireCenterX) / (fireWidth / 2)
                    flames.push({
                        x: x,
                        baseX: x,
                        heat: 0,
                        variation: Math.random(),
                        width: flameWidth.value,
                        baseWidth: flameWidth.value,
                        phaseOffset: Math.random() * Math.PI * 2,
                        distanceFromCenter: distanceFromCenter
                    })
                }
            }
            
            const props = woodProps[woodType.selected]
            const colorScale = (colors.length - 1) / 100
            
            // Calculate time-based randomization value (0 to 1) over the period
            const timeInSeconds = (frameNr * fireInterval.value) / 100  // Convert frames to approximate seconds
            const cycleProgress = (timeInSeconds % randomPeriod.value) / randomPeriod.value
            
            // Update flame sources
            flames.forEach(flame => {
                // Calculate heat and width boost based on distance from center
                // Center flames (distanceFromCenter=0) get full boost, edge flames (distanceFromCenter=1) get reduced
                const centerBoost = 1 - (flame.distanceFromCenter * 0.2)  // 1.0 at center, 0.5 at edges
                
                // Apply randomization to flame properties
                const randFactor = randomization.value / 100
                const maxVariation = 0.6  // 60% maximum variation
                
                // Each flame uses sine waves with different phases for smooth variation
                // Position wave - oscillates between -1 and 1
                const posWave = Math.sin(cycleProgress * Math.PI * 2 + flame.phaseOffset)
                const positionOffset = posWave * 10 * randFactor * maxVariation
                flame.x = Math.round(flame.baseX + positionOffset)
                
                // Width wave - uses different frequency for variety, boosted by center proximity
                const widthWave = Math.sin(cycleProgress * Math.PI * 2 + flame.phaseOffset * 1.3)
                flame.baseWidth += (flameWidth.value - flame.baseWidth) * 0.1  // Smooth transition to new setting
                const widthVariation = widthWave * flame.baseWidth * maxVariation * randFactor
                flame.width = Math.max(1, Math.round((flame.baseWidth + widthVariation) * centerBoost))
                
                // Height wave - uses yet another frequency
                const heightWave = Math.sin(cycleProgress * Math.PI * 2 + flame.phaseOffset * 0.7)
                
                // Fuel combustion - affected by oxygen and fuel amount
                const combustion = (oxygen.value / 100) * (fuelAmount.value / 100) * props.burnRate
                
                // Add variation to flame with smooth randomization affecting height
                // Center flames burn hotter
                const heightRandomization = heightWave * maxVariation * randFactor
                const targetHeat = combustion * 100 * (0.8 + flame.variation * 0.4 * (flameVariation.value / 100) + heightRandomization) * centerBoost
                
                // Smooth heat changes for stability
                flame.heat += (targetHeat - flame.heat) * (1 - props.stability) * 0.3
                
                // Random flickering
                flame.heat *= (0.95 + Math.random() * 0.1)
                
                // Add heat to fire field at flame position
                if (fireY < height) {
                    const spreadWidth = Math.floor(flame.width / 2)
                    for (let dx = -spreadWidth; dx <= spreadWidth; dx++) {
                        const x = flame.x + dx
                        if (x >= 0 && x < width) {
                            const falloff = 1 - Math.abs(dx) / (spreadWidth + 1)
                            field[fireY][x] = Math.max(field[fireY][x], flame.heat * falloff * props.heatOutput)
                        }
                    }
                }
            })
            
            // Heat rise and diffusion
            const newField: number[][] = []
            for (let y = 0; y < height; y++) {
                newField[y] = []
                for (let x = 0; x < width; x++) {
                    newField[y][x] = 0
                }
            }
            
            const maxHeight = Math.floor((flameHeight.value / 100) * height)
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let heat = field[y][x]
                    
                    if (heat > 1) {
                        // Calculate height limitation
                        const heightFactor = Math.max(0, 1 - (y / maxHeight))
                        if (heightFactor <= 0) {
                            heat *= 0.3  // Rapid cooling above max height
                        }
                        
                        // Heat rises
                        if (y < height - 1) {
                            const rise = heat * 0.6 * heightFactor
                            newField[y + 1][x] += rise
                            heat -= rise
                        }
                        
                        // Horizontal spread with turbulence
                        const turbulence = (Math.random() - 0.5) * 0.15
                        
                        if (x > 0) {
                            const leftSpread = heat * (0.15 + turbulence)
                            newField[y][x - 1] += leftSpread
                            heat -= leftSpread
                        }
                        
                        if (x < width - 1) {
                            const rightSpread = heat * (0.15 - turbulence)
                            newField[y][x + 1] += rightSpread
                            heat -= rightSpread
                        }
                        
                        // Cooling
                        heat *= 0.85
                        
                        newField[y][x] += heat
                    }
                }
            }
            
            field = newField
            
            // Render to pixels
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const heat = Math.min(100, field[y][x])
                    if (heat > 0.5) {
                        const colorIndex = Math.floor(heat * colorScale)
                        pixels[height - 1 - y][x].color = colors[Math.min(colorIndex, colors.length - 1)]
                    } else {
                        pixels[height - 1 - y][x].color = new Color(0, 0, 0, 0, true)
                    }
                }
            }

            return true
        })
    }
}
