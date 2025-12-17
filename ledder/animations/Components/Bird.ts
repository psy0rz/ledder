import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import FxNearestNeighbor from "../../fx/FxNearestNeighbor.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"

class Bird extends Animator {
    private usedPositions: Set<string> = new Set()
    
    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const birdControls = controls.group("Bird Settings")
        const bigBirdCount = birdControls.value("Big Birds", 1, 0, 16, 1, true)
        const smallBirdCount = birdControls.value("Small Birds", 0, 0, 16, 1, true)
        const antialiasIntensity = birdControls.value("Antialias", 0.25, 0, 1, 0.05, true)
        
        const pl = new PixelList()
        box.add(pl)
        
        // Reset used positions
        this.usedPositions.clear()
        
        // Create big birds
        for (let i = 0; i < bigBirdCount.value; i++) {
            this.createBigBird(box, scheduler, controls, antialiasIntensity.value, i)
        }
        
        // Create small birds
        for (let i = 0; i < smallBirdCount.value; i++) {
            this.createSmallBird(box, scheduler, controls, antialiasIntensity.value, i)
        }
        
        // Watch for count changes
        scheduler.interval(100, () => {
            // This will trigger re-run when values change
        })
    }
    
    getUniquePosition(box: PixelBox, birdWidth: number, birdHeight: number): {x: number, y: number} {
        let attempts = 0
        const maxAttempts = 100
        
        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * (box.width() - birdWidth))
            const y = Math.floor(Math.random() * (box.height() - birdHeight))
            const posKey = `${x},${y}`
            
            if (!this.usedPositions.has(posKey)) {
                this.usedPositions.add(posKey)
                return {x, y}
            }
            attempts++
        }
        
        // Fallback: return position even if occupied (after max attempts)
        const x = Math.floor(Math.random() * (box.width() - birdWidth))
        const y = Math.floor(Math.random() * (box.height() - birdHeight))
        return {x, y}
    }
    
    createBigBird(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, antialiasIntensity: number, index: number) {
        const frames = new PixelList()
        const pos = this.getUniquePosition(box, 9, 3)
        const x = pos.x
        const y = pos.y
        
        // Smooth wing flapping animation with intermediate frames for antialiasing effect
        // Frame 1: Wings level
        frames.add(new DrawAsciiArtColor(x, y, `
             .........
             .wwwywww.
             .........
              `))
        
        // Frame 2: Wings starting to go up (transition frame)
        frames.add(new DrawAsciiArtColor(x, y, `
             .w.....w.
             ..wwyww..
             .........
              `))
        
        // Frame 3: Wings up
        frames.add(new DrawAsciiArtColor(x, y, `
             ww.....ww
             ...wyw...
             .........
              `))
        
        // Frame 4: Wings coming back down (transition frame)
        frames.add(new DrawAsciiArtColor(x, y, `
             .w.....w.
             ..wwyww..
             .........
              `))
        
        // Frame 5: Wings level
        frames.add(new DrawAsciiArtColor(x, y, `
             .........
             .wwwywww.
             .........
              `))
        
        // Frame 6: Wings starting to go down (transition frame)
        frames.add(new DrawAsciiArtColor(x, y, `
             .........
             ..wwyww..
             .w.....w.
              `))
        
        // Frame 7: Wings down
        frames.add(new DrawAsciiArtColor(x, y, `
             .........
             ...wyw...
             ww.....ww
              `))
        
        // Frame 8: Wings coming back up (transition frame)
        frames.add(new DrawAsciiArtColor(x, y, `
             .........
             ..wwyww..
             .w.....w.
              `))
        
        let birdBox = new PixelBox(box)
        box.add(birdBox)
        
        // Apply nearest neighbor antialiasing to frames
        if (antialiasIntensity > 0) {
            new FxNearestNeighbor(scheduler, controls, antialiasIntensity).run(frames)
        }
        
        // Faster animation speed (2 instead of 3) for smoother motion
        new FxMovie(scheduler, controls, 2, index % 8).run(frames, birdBox)
        new FxRotate(scheduler, controls, 1).run(frames, birdBox)
    }
    
    createSmallBird(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, antialiasIntensity: number, index: number) {
        const frames = new PixelList()
        const pos = this.getUniquePosition(box, 3, 3)
        const x = pos.x
        const y = pos.y
        
        // Tiny 3-pixel wide bird animation
        // Frame 1: Wings level
        frames.add(new DrawAsciiArtColor(x, y, `
             ...
             wyw
             ...
              `))
        
        // Frame 2: Wings up
        frames.add(new DrawAsciiArtColor(x, y, `
             w.w
             .y.
             ...
              `))
        
        // Frame 3: Wings level
        frames.add(new DrawAsciiArtColor(x, y, `
             ...
             wyw
             ...
              `))
        
        // Frame 4: Wings down
        frames.add(new DrawAsciiArtColor(x, y, `
             ...
             .y.
             w.w
              `))
        
        let birdBox = new PixelBox(box)
        box.add(birdBox)
        
        // Apply nearest neighbor antialiasing to frames
        if (antialiasIntensity > 0) {
            new FxNearestNeighbor(scheduler, controls, antialiasIntensity).run(frames)
        }
        
        // Fast animation for small bird
        new FxMovie(scheduler, controls, 2, index % 4).run(frames, birdBox)
        new FxRotate(scheduler, controls, 1).run(frames, birdBox)
    }
}

Bird.category = "Sprites"
Bird.title = "Bird"
Bird.description = "Flying bird sprite with FRONT VIEW wing flapping animation"

export default Bird
