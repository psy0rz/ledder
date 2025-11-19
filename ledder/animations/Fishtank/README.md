# Fishtank Sprite Framework

A modular sprite-based animation framework for the Ledder Fishtank animations. You can put fish and plants in the fishtank and/or everything else that fits ;-)

## Architecture

The framework consists of several key components:

### 1. **SpriteAnimator** (Base Class)
The foundation for all sprites. Provides:
- Sprite rendering using ASCII art
- Position and velocity management
- Constraint system (boundaries, bouncing)
- Automatic dimension calculation
- State management

```typescript
import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"

const mySprite = `
.rrr.
r...r
.rrr.
`;

class MySprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 1,
            velocityY: 0.5
        };

        super(mySprite, initialState, {
            bounceOnEdges: true,
            minX: 0,
            minY: 0
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        super.update(frameNr, boxWidth, boxHeight);
        // Add custom behavior here
    }
}
```

### 2. **Sprite Collections**

#### FishSprites.ts
Contains all fish sprite classes:
- `TropicalFishSprite` - Orange/yellow fish with random vertical movement
- `GoldfishSprite` - Yellow goldfish with gentle swimming
- `ClownfishSprite` - Orange/white striped fish with darting behavior
- `AngelfishSprite` - Tall angelfish with graceful movement
- `NeonTetraSprite` - Small schooling fish with quick movements

Each fish has unique movement patterns and behaviors.

#### PlantSprites.ts
Contains plant sprite classes:
- `TallPlantSprite` - Tall seaweed that sways in water
- `ShortPlantSprite` - Short plant with gentle sway

Plants use a swaying animation based on sine waves.

#### EnvironmentSprites.ts
Contains environmental sprites:
- `BubbleSprite` - Rising bubbles with wobble effect

#### BackgroundSprites.ts
Contains background animations:
- `SandyBottom` - Sandy aquarium floor with repeating tile pattern
- `RockyBottom` - Rocky aquarium floor with pebbles
- `ImageBackground` - User-defined external image/media as background (supports URLs, animated GIFs, static images)

These are full Animator classes that can be used as backgrounds. ImageBackground uses the same technology as RemotePictures to load and display external images with configurable fit options (cover, contain, fill, inside, outside).
Manages collections of sprites:
- Add/remove sprites
- Update all sprites in one call
- Render all sprites to a PixelList
- Query sprite collections

```typescript
import SpriteManager from "./SpriteManager.js"
import { FishSprites } from "./FishSprites.js"

const fishManager = new SpriteManager();

// Add fish
const fish1 = new FishSprites.TropicalFish(10, 10, 0.5, 0.2);
const fish2 = new FishSprites.Goldfish(20, 15, 0.3, 0.1);
fishManager.addSprite(fish1);
fishManager.addSprite(fish2);

// In animation loop
fishManager.update(frameNr, boxWidth, boxHeight);
box.add(fishManager.render());
```

## Adding New Sprites

### Step 1: Create the Sprite Class

Create a new file in the `Fishtank` folder or add to an existing sprite collection file:

```typescript
// NewFishSprite.ts or add to FishSprites.ts
import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"

const piranhaSprite = `
..rrrr..
.rrrrrr.
rrr00rrr
.rrrrrr.
..rrrr..
`;

export class PiranhaSprite extends SpriteAnimator {
    constructor(x: number, y: number, speedX: number = 1.0, speedY: number = 0.4) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speedX,
            velocityY: speedY
        };

        super(piranhaSprite, initialState, {
            bounceOnEdges: true,
            minX: 0,
            minY: 2
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        super.update(frameNr, boxWidth, boxHeight);
        
        // Custom behavior: aggressive speed changes
        if (Math.random() > 0.90) {
            this.state.velocityX = (Math.random() - 0.5) * 2.5;
            this.state.velocityY = (Math.random() - 0.5) * 1.0;
        }
    }
}
```

### Step 2: Export in Collection

If adding to an existing collection file, add to the export:

```typescript
export const FishSprites = {
    TropicalFish: TropicalFishSprite,
    Goldfish: GoldfishSprite,
    Clownfish: ClownfishSprite,
    Angelfish: AngelfishSprite,
    NeonTetra: NeonTetraSprite,
    Piranha: PiranhaSprite  // Add new sprite
};
```

### Step 3: Use in Fishtank Composition

Update `Components/Fishtank.ts` to include the new sprite:

```typescript
const fishTypes = [
    FishSprites.TropicalFish,
    FishSprites.Goldfish,
    FishSprites.Clownfish,
    FishSprites.Angelfish,
    FishSprites.NeonTetra,
    FishSprites.Piranha  // Add here
];
```

That's it! The sprite will now be randomly assigned to fish in the tank.

## Sprite Features

### Movement Patterns
- **Velocity-based**: Set `velocityX` and `velocityY` in state
- **Custom**: Override `update()` method for complex patterns
- **Constrained**: Use `bounceOnEdges` to keep sprites in bounds

### Constraints
```typescript
{
    bounceOnEdges: true,    // Reverse velocity at boundaries
    minX: 0,                // Left boundary
    maxX: width,            // Right boundary
    minY: 0,                // Top boundary
    maxY: height            // Bottom boundary
}
```

### State Management
Store custom data in sprite state:
```typescript
const initialState: SpriteState = {
    x: 10,
    y: 10,
    velocityX: 1,
    velocityY: 0.5,
    // Custom properties
    hunger: 100,
    color: "red",
    animation: "swim"
};
```

Access in `update()`:
```typescript
update(frameNr: number, boxWidth: number, boxHeight: number) {
    super.update(frameNr, boxWidth, boxHeight);
    
    // Access custom state
    if (this.state.hunger < 50) {
        // Change behavior when hungry
    }
}
```

## Color Codes

Available colors in ASCII art sprites:
- `r` - red
- `b` - blue
- `y` - yellow
- `w` - white
- `m` - magenta/orange
- `g` - green
- `o` - orange/tan
- `5` - gray/green
- `.` - transparent (no pixel)

Avoid `0` (black) as it's invisible on black backgrounds.

## Best Practices

1. **Sprite Size**: Keep sprites between 4x4 and 16x16 pixels
2. **Side View**: Fish should face sideways (head-body-tail orientation)
3. **Readable**: Make sprites recognizable at small sizes
4. **Unique Behavior**: Give each sprite type distinctive movement
5. **Performance**: Don't create too many sprites (limit controlled by user)

## Example: Complete Custom Sprite

```typescript
import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"

const jellyfishSprite = `
..www..
.wwwww.
wwwwwww
.wwwww.
..w.w..
..w.w..
`;

export class JellyfishSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0,
            pulsePhase: Math.random() * Math.PI * 2,
            driftPhase: Math.random() * Math.PI * 2
        };

        super(jellyfishSprite, initialState, {
            bounceOnEdges: false,  // Jellyfish drift gently
            minY: 2
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Pulsing vertical movement
        const pulse = Math.sin(frameNr / 10 + (this.state.pulsePhase || 0)) * 0.3;
        this.state.velocityY = pulse;
        
        // Gentle horizontal drift
        const drift = Math.sin(frameNr / 30 + (this.state.driftPhase || 0)) * 0.2;
        this.state.velocityX = drift;
        
        super.update(frameNr, boxWidth, boxHeight);
        
        // Wrap around horizontally instead of bouncing
        if (this.state.x < -this.spriteWidth) {
            this.state.x = boxWidth;
        } else if (this.state.x > boxWidth) {
            this.state.x = -this.spriteWidth;
        }
    }
}
```

## Framework Benefits

✅ **Modular** - Each sprite is independent and reusable
✅ **Extensible** - Easy to add new sprite types
✅ **Maintainable** - Clear separation of concerns
✅ **Type-safe** - Full TypeScript support
✅ **Performant** - Efficient rendering and updates
✅ **Flexible** - Support for complex behaviors and animations
