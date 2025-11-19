# Fishtank - Modular Sprite Animation

A comprehensive, fully-configurable sprite-based animation system for creating aquarium scenes and environments. Features fish, plants, weather effects, and complete user control over all elements.

## 🎯 Quick Start

The Fishtank animation provides:
- **5 fish types** with configurable distribution and bidirectional movement
- **12 plant varieties** including trees, bushes, flowers, and aquatic plants
- **9 environment effects** (bubbles, clouds, sun, moon, stars, rain, snow, thunder, rainbow)
- **3-layer depth system** for realistic rain and snow parallax
- **Complete user controls** with organized groups and enable/disable switches
- **Background image support** with URL loading and fit modes

All elements are fully configurable through an intuitive control panel.

## 🎮 User Controls

See **[CONTROLS-GUIDE.md](./CONTROLS-GUIDE.md)** for complete control documentation.

### Control Groups Overview

#### 🐠 Fish (Enable/Disable)
- Large fish count & speed
- 5 fish types with percentage distribution (Tropical, Goldfish, Clownfish, Angelfish, Neon Tetra)
- Tiny fish school with formation behavior

#### 🌿 Plants & Vegetation (Enable/Disable)
- Total plant count
- 8 plant type percentages (Tall, Short, Bushes, Grass, Flowers, Ferns, Trees, Cactus)
- Weighted pool distribution system

#### � Buildings (Enable/Disable)
- Building type selection (8 types: Factory, School, Windmill, Liberty Statue, Eiffel Tower, Castle, Church, Tower)
- X/Y position controls (0-100)
- Show/hide switch
- Animated elements (smoke, blades, flags, lights)

#### �🌈 Environment Effects (Enable/Disable)
- **Bubbles:** Count + rise speed
- **Clouds:** Count + drift speed (3 sizes)
- **Celestial:** Sun, Moon, Stars, Rainbow
- **Rain:** Count + speed + 3-layer depth distribution (far/mid/near %)
- **Snow:** Count + speed + 3-layer depth distribution (far/mid/near %)
- **Thunder:** Lightning flash count

#### 🖼️ Background
- Image URL loading
- Fit modes (cover/contain/fill)
- Opacity control

---

## 🏗️ Architecture

### Core Framework Components

### Core Framework Components

### 1. **SpriteAnimator** (Base Class)
Foundation class for all sprites providing:
- ASCII art sprite rendering with color codes
- Position and velocity management
- Boundary constraints (bouncing, wrapping)
- Horizontal sprite flipping for directional movement
- Protected state management
- Automatic dimension calculation

### 2. **SpriteManager** (Collection Manager)
Manages sprite collections:
- Add/remove sprites dynamically
- Update all sprites in one call
- Render all sprites to PixelList
- Layered rendering support

### 3. **Sprite Collections**

#### **FishSprites.ts** - 6 Fish Types
- `TropicalFish` - Colorful, medium speed (base 0.08/0.02)
- `Goldfish` - Orange, gentle swimming (base 0.06/0.03)
- `Clownfish` - Orange/white, darting behavior (base 0.1/0.03)
- `Angelfish` - Tall, graceful movement (base 0.05/0.02)
- `NeonTetra` - Small, quick movements (base 0.12/0.04)
- `TinyFishSchool` - Schooling formation with 4-frame animation (base 0.1/0.03)

**Features:**
- Bidirectional movement (50% spawn left-facing)
- Automatic horizontal flipping based on direction
- Water flow effects that preserve direction
- Edge wrapping behavior
- Frame-based smooth animation

#### **PlantSprites.ts** - 12 Plant Varieties
- `TallPlant`, `ShortPlant` - Aquatic plants with sway
- `Bush`, `SmallBush` - Round bushes in two sizes
- `PineTree`, `SmallPine` - Static pine trees
- `OakTree`, `SmallOak` - Static oak trees
- `Grass` - Short grass tufts with sway
- `Flower` - Decorative flowers with sway
- `Cactus` - Static desert cactus
- `Fern` - Leafy fern with sway

**Features:**
- Trees are static (no movement)
- Other plants use sine-wave swaying
- Varying speeds and sway amounts
- Bottom-anchored positioning

#### **BuildingSprites.ts** - 8 Large Animated Buildings
- `Factory` - Factory with animated smoking chimney (3 frames)
- `School` - School building with windows and yellow roof
- `Windmill` - Windmill with rotating blades (4 frames)
- `LibertyStatue` - Statue of Liberty with torch
- `EiffelTower` - Eiffel Tower with gentle sway in wind
- `Castle` - Castle with waving flags (2 frames)
- `Church` - Church with bell tower (bell animation)
- `Tower` - Tower with blinking red/yellow light (3 frames)

**Features:**
- User-positionable with X/Y controls
- Animated elements (smoke, blades, flags, lights)
- Large sprites (10x11 to 14x15 pixels)
- Enable/disable switch
- Selectable building type
- Static positioning (no automatic movement)
- Rendered after background, before plants

#### **EnvironmentSprites.ts** - 9 Environment Types
- `Bubble` - Rising bubbles with wobble and vertical wrapping
- `Cloud` - Drifting clouds in 3 sizes (small/medium/large) with horizontal wrapping
- `Sun` - Static sun with gentle pulsing
- `Moon` - Static moon sprite
- `Star` - Twinkling stars with random offsets
- `Raindrop` - 3 depth variants (far: gray/slow, mid: blue/medium, near: blue/fast)
- `Snowflake` - 3 depth variants with frames, sway, and varying speeds
- `Thunder` - Random flashing lightning bolts
- `Rainbow` - Static rainbow arc

**Features:**
- Depth-based parallax (rain/snow)
- Custom wrapping behavior per sprite type
- Speed multiplier support for rain/snow
- Random timing offsets for stars/thunder

#### **BackgroundSprites.ts**
- `ImageBackground` - External image loading with sharp/fetch
  - URL-based image loading
  - Fit modes: cover, contain, fill
  - Opacity control
  - Async image processing

---

## 🚀 Using the Framework

### Basic Usage Example

```typescript
import SpriteManager from "./SpriteManager.js"
import { FishSprites } from "./FishSprites.js"
import { PlantSprites } from "./PlantSprites.js"

// Create managers
const fishManager = new SpriteManager();
const plantManager = new SpriteManager();

// Add sprites
const fish = new FishSprites.TropicalFish(10, 10, 0.08, 0.02);
const plant = new PlantSprites.TallPlant(5, boxHeight - 10);
fishManager.addSprite(fish);
plantManager.addSprite(plant);

// In animation loop
scheduler.intervalControlled(1).do((frameNr) => {
    fishManager.update(frameNr, boxWidth, boxHeight);
    plantManager.update(frameNr, boxWidth, boxHeight);
    
    box.add(plantManager.render());  // Render plants first (background)
    box.add(fishManager.render());   // Render fish on top
});
```

---

## 🎨 Creating Custom Sprites

### Step 1: Define Sprite Class

```typescript
import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"

const jellyfishSprite = `
..www..
.wwwww.
wwwwwww
.w.w.w.
..w.w..
`;

export class JellyfishSprite extends SpriteAnimator {
    private pulsePhase: number;

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0.1,
            velocityY: 0
        };

        super(jellyfishSprite, initialState, {
            bounceOnEdges: false,
            wrapAround: true
        });

        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Pulsing vertical movement
        const pulse = Math.sin(frameNr / 10 + this.pulsePhase) * 0.3;
        this.state.velocityY = pulse;
        
        super.update(frameNr, boxWidth, boxHeight);
    }
}
```

### Step 2: Add to Collection

```typescript
// In FishSprites.ts or create NewSprites.ts
export const AquaticSprites = {
    Jellyfish: JellyfishSprite,
    // ... other sprites
};
```

### Step 3: Use in Fishtank

```typescript
// In Fishtank.ts
import { AquaticSprites } from "./AquaticSprites.js"

// Add to sprite pool
const jellyfish = new AquaticSprites.Jellyfish(x, y);
fishManager.addSprite(jellyfish);
```

---

## 🎭 Advanced Features

### Sprite Flipping
Fish automatically flip horizontally based on movement direction:
```typescript
// Handled automatically in SpriteAnimator
if (this.state.velocityX < 0) {
    // Sprite is flipped when rendering
}
```

### Wrapping Behavior
```typescript
// Horizontal wrapping
{
    wrapAround: true,
    minX: 0,
    maxX: boxWidth
}

// Custom vertical wrapping (for rain/snow)
if (this.state.y >= boxHeight) {
    this.state.y = 0;
    this.state.x = Math.random() * boxWidth;
}
```

### Depth Layers
Create parallax effects with multiple depth variants:
```typescript
const depthSettings = {
    far: { speed: 0.4, color: '5' },   // Slow, gray
    mid: { speed: 0.8, color: 'b' },   // Medium, blue
    near: { speed: 1.4, color: 'b' }   // Fast, bright
};
```

### Frame-Based Animation
```typescript
const frames = ['w', '5', 'w', '.'];

update(frameNr: number, boxWidth: number, boxHeight: number) {
    const currentFrame = Math.floor(frameNr / 8) % frames.length;
    this.sprite = frames[currentFrame];
    // Update dimensions
    const lines = this.sprite.trim().split('\n');
    this.spriteHeight = lines.length;
    this.spriteWidth = lines[0]?.length || 1;
}
```

### Weighted Distribution
```typescript
// Build weighted pool from percentages
const fishTypePool = [];
if (fishTropical > 0) {
    for (let i = 0; i < fishTropical; i++) {
        fishTypePool.push(FishSprites.TropicalFish);
    }
}
// ... add other types

// Select random from pool
const FishClass = fishTypePool[Math.floor(Math.random() * fishTypePool.length)];
```

---

## 📊 Technical Details

### Color Codes
Available in ASCII art sprites:
- `r` - Red
- `o` - Orange
- `y` - Yellow
- `g` - Green
- `b` - Blue
- `m` - Magenta
- `w` - White
- `5` - Gray
- `.` - Transparent (no pixel)

**Note:** Avoid `0` (black) - invisible on dark backgrounds.

### Performance Considerations
- Keep sprites 4x4 to 16x16 pixels
- Limit total sprite count (user-configurable)
- Use frame-based updates (`frameNr % N`) instead of every-frame
- Avoid expensive calculations in `update()`

### State Management
```typescript
interface SpriteState {
    x: number;
    y: number;
    velocityX?: number;
    velocityY?: number;
    // Custom properties allowed
    [key: string]: any;
}
```

### Constraint Options
```typescript
interface SpriteConstraints {
    bounceOnEdges?: boolean;  // Reverse velocity at boundaries
    wrapAround?: boolean;     // Wrap to opposite side
    minX?: number;            // Left boundary
    maxX?: number;            // Right boundary  
    minY?: number;            // Top boundary
    maxY?: number;            // Bottom boundary
}
```

---

## 📁 File Structure

```
Fishtank/
├── Fishtank.ts              # Main animation with user controls
├── SpriteAnimator.ts        # Base class for all sprites
├── SpriteManager.ts         # Collection manager
├── FishSprites.ts           # 6 fish types
├── PlantSprites.ts          # 12 plant varieties
├── BuildingSprites.ts       # 8 large animated buildings
├── EnvironmentSprites.ts    # 9 environment effects
├── BackgroundSprites.ts     # Image background loader
├── README.md                # This file
└── CONTROLS-GUIDE.md        # Complete user controls documentation
```

---

## 💡 Best Practices

1. **Sprite Design**
   - Face sideways for fish (left/right orientation)
   - Keep recognizable at small sizes
   - Use contrasting colors for visibility

2. **Movement Patterns**
   - Slow speeds for calm scenes (0.05-0.15)
   - Fast speeds for action (0.5-2.0)
   - Use sine waves for natural motion

3. **Layering**
   - Render background first
   - Then buildings (large static objects)
   - Then plants
   - Then fish/effects
   - Depth creates visual richness

4. **User Experience**
   - Provide enable/disable switches for groups
   - Use percentage-based distribution
   - Include speed multipliers
   - Organize controls logically
   - Position buildings with X/Y controls

5. **Performance**
   - Limit sprite counts via user controls
   - Use frame-based timing
   - Avoid redundant calculations
   - Keep update logic simple
   - Buildings are static (no movement overhead)

---

## 🌟 Features Showcase

✅ **Modular** - Each sprite is independent and reusable  
✅ **Extensible** - Easy to add new sprite types  
✅ **Configurable** - Complete user control over all parameters  
✅ **Type-safe** - Full TypeScript support  
✅ **Performant** - Efficient rendering and updates  
✅ **Visual** - Depth layers, parallax, and animations  
✅ **Flexible** - Support for complex behaviors  
✅ **Organized** - Logical control grouping with enable/disable

---

## 🎓 Examples

### Classic Aquarium
- 8 large fish (all types enabled)
- 10 bubbles
- 6 aquatic plants
- Ocean background at 50% opacity

### Winter Scene
- No fish
- 5 trees (100% tree distribution)
- 30 snowflakes (3-layer depth)
- Moon + 20 stars
- Night sky background

### City Skyline
- No fish
- Factory at X=10, Y=5
- Eiffel Tower at X=40, Y=3
- 5 clouds drifting
- Moon + 15 stars
- City background image

### Castle Scene
- No fish
- Castle at X=20, Y=10
- 5 trees nearby
- 3 clouds
- Sun showing
- Medieval landscape background

### Stormy Weather
- 3 slow fish
- 10 plants
- 40 raindrops (fast speed)
- 5 clouds
- 2 thunder bolts
- Windmill at X=60, Y=8
- Stormy sky background

### Underwater Paradise
- 12 fish (mixed types)
- 15 tiny fish school
- 12 plants (no trees)
- 15 bubbles
- Rainbow
- Liberty Statue at X=70, Y=5 (underwater landmark)
- Coral reef background

---

**Version:** 2.0  
**Framework:** Modular Sprite System  
**TypeScript:** Full support  
**License:** See main repository
