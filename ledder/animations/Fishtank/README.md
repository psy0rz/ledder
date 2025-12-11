# Fishtank - Dynamic Scene Composition System

**What is Fishtank?**

Fishtank is a modular animation framework that lets you fill your LED display with dynamic, layered scenes. Think of it as a virtual "tank" where you can add and configure visual elements - fish, plants, weather effects, buildings, scrolling text, and more. Each element is independently controllable, allowing you to create unique compositions that fit your display size and performance capabilities.

> **⚠️ Experimental System**  
> Fishtank is highly experimental and optimized for speed, but with many objects and effects enabled, performance can degrade. Start with a few elements and add more until you find the sweet spot for your display.

---

## 🎯 What Can You Put in the Tank?

### Available Elements

- **🌀 Fractals** - Animated Mandelbrot and Julia sets with auto-zoom and customizable color palettes
- **🐠 Fish** - 5 species with realistic swimming behavior (Tropical, Goldfish, Clownfish, Angelfish, Neon Tetra) plus schooling fish
- **🌿 Plants** - 12 varieties including tall/short aquatic plants, bushes, grass, flowers, ferns, trees, and cacti
- **🏢 Buildings** - 8 animated structures (Factory, School, Windmill, Statue of Liberty, Eiffel Tower, Castle, Church, Tower)
- **🌤️ Weather & Environment** - Bubbles, clouds, sun, moon, stars, rain, snow, thunder, rainbow
- **🎮 Retro Games** - Animated game sprites (Galaga, Space Invaders, Arkanoid)
- **🎄 Christmas** - Santa sleigh and reindeer with twinkling lights
- **🖼️ Logo** - Display custom or predefined logos with animations and effects
- **📝 Text** - Scrolling text with 8 animation styles, multiple content sources (manual, clock, RSS feeds, SpaceAPI)
- **🖼️ Background** - Load images from URLs with adjustable opacity and fit modes
- **✨ Post-Effects** - Anti-aliasing, color cycling, tunnel warp, motion blur, fire effects
- **📝 Text Effects** - Motion blur, glow, shadow, flames, plasma, sharpening, subpixel rendering

### Layering System

Elements render in this order (back to front):
1. Fractals (animated mathematical patterns)
2. Background Image
3. Environment (sun, moon, stars, rainbow)
4. Plants & Vegetation
5. Buildings
6. Fish & Schools
7. Weather (bubbles, rain, snow, clouds, thunder)
8. Game Elements (Space Invaders, Arkanoid, Christmas sprites)
9. Logo (before or after post-FX based on setting)
10. Post-Processing Effects (applied to layers 1-8, optional for logo)
11. Text (always on top, with optional text-specific effects)

---

## 🎮 How to Use Fishtank

### Getting Started

1. **Select "Fishtank Composition"** from the Aquarium category in your animation list
2. **Start with a clean slate** - All elements are disabled by default
3. **Enable what you want** - Each control group has an enable/disable switch
4. **Adjust quantities** - Use count controls to add elements (start small!)
5. **Fine-tune settings** - Tweak speeds, colors, positions, and distributions
6. **Monitor performance** - If animation stutters, reduce element counts or disable effects

### Performance Tips

- **Start minimal:** Enable 1-2 element types, then gradually add more
- **Monitor FPS:** Lower speed = better performance (default: 1.0, try 0.5 or 0.3)
- **Reduce counts:** Fewer sprites = faster rendering
- **Disable effects:** Post-processing effects are resource-intensive
- **Match display size:** Larger displays require more processing power
- **Test combinations:** Some effects work better together than others

---

## 📖 Control Reference

### Global Controls

#### Speed Control
- **Parameter:** `Speed` (0.1 to 5.0)
- **Default:** 1.0 (60 FPS equivalent)
- **Description:** Controls animation update rate. Higher = faster updates = more CPU usage
- **Tip:** Reduce to 0.5 or lower if performance is slow

---

### 🌀 Fractals

**Enable Switch:** Turn fractal rendering on/off

#### Fractal Type
- **Mandelbrot** - Classic Mandelbrot set with intricate detail
- **Julia** - Julia set variations with smooth organic shapes

#### Animation Settings
- **Auto Zoom** (switch): Enable automatic zoom in/out animation
  - Zooms into fractal hotspots automatically
  - Cycles through predefined interesting locations
- **Zoom Speed** (0.001-0.1): Speed of automatic zoom animation
- **Manual Zoom** (0.01-1000): Manual zoom level (when auto zoom disabled)

#### Appearance
- **Color Palette**: Select color scheme (Rainbow, Fire, Ocean, etc.)
- **Max Iterations** (16-1024): Detail level (higher = more detail, slower)
  - 16-64: Fast, simple patterns
  - 128-256: Good balance (recommended)
  - 512-1024: Maximum detail, slower performance
- **Opacity** (0.0-1.0): Fractal transparency

#### Manual Hotspot (Advanced)
- **Use Manual** (switch): Override automatic hotspot selection
- **Center X** (-2.0 to 2.0): X coordinate in complex plane
- **Center Y** (-2.0 to 2.0): Y coordinate in complex plane
- **Max Zoom** (1-12): Maximum zoom depth for this location

**How it Works:**
- Fractals are rendered as the bottom-most layer
- **Mandelbrot:** Each pixel tests if that coordinate escapes to infinity
- **Julia:** Uses a fixed constant, creates organic shapes
- **Auto Zoom:** Automatically explores 6 predefined interesting locations per fractal type
- **Color Mapping:** Iteration count determines pixel color from palette
- **Performance:** Lower iterations = faster, higher = more detail

**Tips:**
- **Start simple:** Use 128-256 iterations for smooth performance
- **Experiment with palettes:** Different colors reveal different patterns
- **Manual hotspots:** Classic coordinates:
  - Mandelbrot: cx=-0.75, cy=0.0 (main bulb)
  - Julia: cx=-0.7, cy=0.27 (spiral)
- **Opacity:** Use 0.5-0.7 to blend with other layers
- **Performance:** Fractals are CPU-intensive - disable if animation is slow

---

### 🐠 Fish

**Enable Switch:** Turn fish simulation on/off

#### Large Fish
- **Large Fish Count** (0-50): Total number of large fish
- **Large Fish Speed** (0.01-0.5): Swimming speed multiplier

#### Fish Distribution (Percentages)
Set the mix of fish species (total should equal 100%):
- **Tropical Fish %** - Colorful, medium speed
- **Goldfish %** - Orange, gentle swimming
- **Clownfish %** - Orange/white, quick darting
- **Angelfish %** - Tall, graceful movement
- **Neon Tetra %** - Small, fast swimmers

#### Tiny Fish School
- **School Count** (0-20): Number of schooling formations
- **School Speed** (0.01-0.5): School movement speed
- **School Fish** (2-10): Number of fish per school

**How it Works:**
- Fish spawn randomly and swim left or right
- They wrap around screen edges
- Swimming direction affects sprite orientation
- Species distribution is weighted by percentages

---

### 🌿 Plants & Vegetation

**Enable Switch:** Turn plant system on/off

#### Plant Controls
- **Plant Count** (0-100): Total number of plants to display

#### Plant Type Distribution (Percentages)
Set the mix of plant types (total should equal 100%):
- **Tall Plants %** - Large aquatic plants
- **Short Plants %** - Medium aquatic plants
- **Bushes %** - Round bushes
- **Grass %** - Short grass tufts
- **Flowers %** - Decorative flowers
- **Ferns %** - Leafy ferns
- **Trees %** - Pine and oak trees
- **Cactus %** - Desert cacti

**How it Works:**
- Plants are positioned at the bottom of the display
- Some plants sway (aquatic plants, grass, flowers, ferns)
- Trees and cacti are static
- Plants are selected randomly based on percentage weights

---

### 🏢 Buildings

**Enable Switch:** Turn building display on/off

#### Building Controls
- **Building Type** (dropdown): Select from 8 building types
  - Factory (animated smoke)
  - School (static)
  - Windmill (rotating blades)
  - Liberty Statue (static)
  - Eiffel Tower (gentle sway)
  - Castle (waving flags)
  - Church (bell animation)
  - Tower (blinking light)
- **X Position** (0-100): Horizontal position (% of screen width)
- **Y Position** (0-100): Vertical position (% of screen height)
- **Show Building** (switch): Toggle visibility

**How it Works:**
- Only one building displays at a time
- Position is percentage-based (works with any display size)
- Animated buildings loop their animations automatically
- Building renders behind fish, in front of plants

---

### 🌤️ Environment & Weather

**Enable Switch:** Turn environment system on/off

#### Bubbles
- **Bubble Count** (0-50): Number of rising bubbles
- **Bubble Speed** (0.01-0.5): How fast bubbles rise

#### Clouds
- **Cloud Count** (0-20): Number of drifting clouds
- **Cloud Speed** (0.01-0.3): Horizontal drift speed
- Includes small, medium, and large cloud variants

#### Celestial Objects
- **Sun** (switch): Show/hide sun with gentle pulsing
- **Moon** (switch): Show/hide moon
- **Stars** (switch): Show/hide twinkling stars
- **Star Count** (0-50): Number of stars (if enabled)
- **Rainbow** (switch): Show/hide rainbow arc

#### Rain
- **Rain Count** (0-100): Number of raindrops
- **Rain Speed** (0.1-2.0): Fall speed multiplier
- **Far Layer %** (0-100): Percentage in background (gray, slow)
- **Mid Layer %** (0-100): Percentage in middle (blue, medium)
- **Near Layer %** (0-100): Percentage in foreground (blue, fast)

#### Snow
- **Snow Count** (0-100): Number of snowflakes
- **Snow Speed** (0.1-2.0): Fall speed multiplier
- **Far Layer %** (0-100): Percentage in background (slow)
- **Mid Layer %** (0-100): Percentage in middle (medium)
- **Near Layer %** (0-100): Percentage in foreground (fast)

#### Thunder
- **Thunder Count** (0-20): Number of lightning flashes

**How it Works:**
- **3-Layer Depth System:** Rain and snow have parallax layers (far/mid/near) for realistic depth
- **Layer Distribution:** Percentages control how many particles appear in each depth layer
- **Speed Variation:** Far layers move slower, near layers move faster
- **Wrapping Behavior:** Elements wrap around edges (bubbles rise and reappear, clouds drift horizontally)
- **Random Timing:** Stars twinkle and thunder flashes at random intervals

---

### 🖼️ Background

**Enable Switch:** Turn background image on/off

#### Background Image Controls
- **Image URL**: Enter direct image URL (JPEG, PNG, GIF)
- **Fit Mode**: How image scales to display
  - `cover` - Fill display, crop if needed (maintains aspect ratio)
  - `contain` - Fit entirely within display (may have letterboxing)
  - `fill` - Stretch to fill display (may distort)
- **Opacity** (0.0-1.0): Image transparency (0=invisible, 1=opaque)

**How it Works:**
- Images are fetched and processed server-side
- Supports JPEG, PNG, and GIF formats
- Image renders as bottom layer (everything appears on top)
- Invalid URLs fall back to no background

**Tips:**
- Use lower opacity (0.3-0.7) to keep foreground elements visible
- `cover` mode works best for most scenarios
- Test with small images first to verify URL works

---

### 🖼️ Logo Display

**Enable Switch:** Turn logo display on/off

#### Logo Source
- **Logo Type**: Select logo source
  - `Remote URL` - Load from custom URL
  - Predefined logos: HSD, TkkrLab, Stc, Hack42, TDVenlo, MaakPlek, and size variants
- **Image URL**: Enter custom logo URL (when Remote URL selected)

#### Position
- **X Position %** (0-100): Horizontal position (center of logo)
- **Y Position %** (0-100): Vertical position (center of logo)
- **Scale** (0.1-3.0): Size multiplier

#### Animation
- **Type**: Choose animation style
  - `Static` - No movement
  - `Horizontal Scroll` - Scroll left/right
  - `Vertical Scroll` - Scroll up/down
  - `Bounce` - Bouncing movement
  - `Flow` - Gentle floating motion
- **Speed** (-2.0 to 2.0): Animation speed (negative = reverse direction)

#### Effects
- **Opacity** (0.0-1.0): Logo transparency
- **Glow** (0-5): Add glow effect around logo
  - **Glow R/G/B** (0-255): Glow color components
- **Rainbow** (switch): Apply rainbow color cycling effect
- **Apply PostFX** (switch): Include logo in post-processing effects

**How it Works:**
- Logo dimensions are automatically detected from image data
- Position is based on logo center point for accurate placement
- Logo renders after main scene, before or after post-FX based on toggle
- Supports PNG, JPEG, and GIF formats

**Tips:**
- Use PNG format with transparency for best results
- Scale adjusts size while maintaining aspect ratio
- Disable PostFX for crisp logo display
- Enable PostFX to blend logo with scene effects

---

### 📝 Text Display

**Enable Switch:** Turn text system on/off

#### Content Source
Choose where text comes from:
- **Manual Text** - Type text directly
- **Digital Clock** - Real-time clock display with multiple formats
- **RSS Feed** - Fetch from RSS URL (auto-updates)
- **SpaceAPI Status** - Show hackerspace open/closed status

#### Manual Text
- **Text**: Enter your message
  - Press Enter for line breaks
  - Long lines automatically wrap to fit display

#### Digital Clock
- **Clock Format**: Choose display format
  - `HH:MM:SS` - Time with seconds
  - `HH:MM` - Time without seconds
  - `HH:MM:SS DD/MM/YYYY` - Date and time
  - `DD/MM/YYYY` - Date only
- **24-Hour Format** (switch): Toggle 12/24 hour format

#### RSS Feed
- **RSS Feed URL**: Feed endpoint URL
- **Show Title** (switch): Display article titles
- **Show Description** (switch): Display article descriptions
- **Max Items** (1-20): Number of articles to cycle through
- **Update Interval (min)** (1-60): How often to refresh feed

#### SpaceAPI Status
- **SpaceAPI URL**: Status endpoint URL (e.g., `https://space.example.com/status.json`)
- **Display Format**: Choose what to show
  - `Open/Closed Status` - Show open/closed text only
  - `Status Message` - Show status message only
  - `Status + Message` - Show both
- **Open Text**: Custom text for open status (default: "OPEN")
- **Closed Text**: Custom text for closed status (default: "CLOSED")
- **Update Interval (min)** (1-60): How often to check status

#### Text Appearance
- **Font**: Select from available fonts (C64, Picopixel, Tiny 3x3, etc.)
- **Text Color**: RGBA color picker (R: 0-255, G: 0-255, B: 0-255, A: 0-1)

#### Animation
- **Animation Type**: Choose text animation
  - `Static` - No animation, fixed position
  - `Scroll Horizontal` - Right to left scrolling
  - `Scroll Vertical` - Bottom to top scrolling
  - `Star Wars Intro` - 3D perspective scroll
  - `Typewriter` - Character-by-character reveal
  - `Fade` - Fade in/out cycling
  - `Wave` - Sine wave vertical motion
  - `Bounce` - Bouncing text
- **Animation Speed** (0.1-5.0): Speed multiplier
- **X Position** (0-100): Horizontal position (%)
- **Y Position** (0-100): Vertical position (%)

**How it Works:**
- **Automatic Word Wrapping:** Long lines break at word boundaries to fit display width
- **Multi-line Support:** Manual line breaks are preserved
- **Dynamic Clock:** Updates every second when clock source is selected
- **RSS Updates:** Content refreshes at specified interval (cached between updates)
- **SpaceAPI Integration:** Fetches hackerspace status from standard SpaceAPI JSON endpoint
- **Layered on Top:** Text always renders above all other elements
- **Font-Aware Wrapping:** Calculates max characters per line based on selected font

**Tips:**
- **Static messages:** Use "Manual Text" + "Static" animation
- **Time display:** Use "Digital Clock" with preferred format
- **News ticker:** Use "RSS Feed" + "Scroll Horizontal"
- **Hackerspace status:** Use "SpaceAPI Status" to show if space is open
- **Readability:** Choose high-contrast colors (white/cyan/yellow on dark backgrounds)

---

### ✨ Post-Processing Effects

**Enable Switch:** Turn post-FX system on/off

Apply visual effects to the entire scene (excluding text):

#### Anti-Aliasing
- **Enable** (switch): Smooth pixel edges
- Reduces jagged diagonal lines

#### Motion Blur
- **Enable** (switch): Add motion blur trails
- **Blur Amount** (1-10): Strength of blur effect
- Creates smooth motion trails behind moving objects

#### Color Cycling
- **Enable** (switch): Animated color shifts
- **Cycle Speed** (0.1-5.0): How fast colors change
- Cycles hue values over time

#### Tunnel/Warp Effect
- **Enable** (switch): Distort space
- **Intensity** (0-20): Strength of warp
- **Speed** (0.1-5.0): Animation speed
- Creates psychedelic tunnel effects

#### Fire Effect
- **Enable** (switch): Add flames
- **Intensity** (0.0-1.0): Fire strength
- **Speed** (0.1-5.0): Flame animation speed
- Adds flickering fire colors

**Performance Note:** Each effect adds processing overhead. Disable unused effects for better performance.

---

### 📝 Text Post-Processing Effects

**Enable Switch:** Turn text effects on/off

Apply effects specifically to text layer:

#### Motion Adaptive Anti-Aliasing
- **Enable** (switch): Smooth text edges with motion detection

#### Motion Blur
- **Enable** (switch): Blur trail for moving text
- **Blur Amount** (1-10): Blur strength

#### Subpixel Rendering
- **Enable** (switch): RGB subpixel color fringing for sharper text

#### Sharpen
- **Enable** (switch): Enhance text edges
- **Sharpen Amount** (0.0-2.0): Sharpening strength

#### Glow
- **Enable** (switch): Add glow around text
- **Glow Intensity** (0.0-1.0): Glow brightness

#### Shadow
- **Enable** (switch): Drop shadow behind text
- **Shadow Offset X** (-5 to 5): Horizontal shadow offset
- **Shadow Offset Y** (-5 to 5): Vertical shadow offset

#### Flames
- **Enable** (switch): Animated fire effect on text
- **Flame Count** (1-20): Number of flames
- **Flame Height** (1-10): How tall flames grow
- **Flame Intensity** (0.0-1.0): Flame brightness
- **Flame Wildness** (0.0-1.0): Flame randomness

#### Plasma
- **Enable** (switch): Animated plasma background
- **Plasma Palette**: Choose color scheme (10 presets)
  - Rainbow, Fire, Ocean, Sunset, Forest, Purple Dream, Neon, Ice, Lava, Cyberpunk
- **Plasma Speed** (0.1-5.0): Animation speed
- **Plasma Scale** (1-20): Pattern size
- **Plasma Intensity** (0.0-1.0): Effect strength
- **Plasma Cycle Speed** (0.1-5.0): Color cycling speed

**Performance Note:** Text effects are GPU-intensive. Use sparingly on low-power devices.

---

## 🎨 Creative Usage Ideas

### Fractal Explorer
```
✓ Fractals: Mandelbrot with Rainbow palette (auto zoom enabled)
✓ Max Iterations: 512 (high detail)
✓ Opacity: 1.0 (solid)
✓ All other elements: Disabled
✓ Speed: 0.3 (slow, smooth zoom)
```

### Psychedelic Ocean
```
✓ Fractals: Julia set with Ocean palette (opacity 0.5)
✓ Fish: 15-20 fish (varied species)
✓ Plants: 20-30 plants
✓ Environment: Bubbles (20-30)
✓ Post-FX: Color cycling
```

### Aquarium Scene
```
✓ Fish: 20-30 fish (mix all species)
✓ Plants: 30-40 plants (varied types)
✓ Environment: Bubbles (20-30), occasional thunder
✓ Background: Blue gradient image (opacity 0.3)
✓ Post-FX: Motion blur (low)
```

### City Skyline
```
✓ Buildings: Multiple buildings enabled (Factory, Tower, Church)
✓ Environment: Clouds (5-10), stars, moon
✓ Weather: Occasional rain or snow
✓ Text: City name with horizontal scroll
✓ Background: Sunset image (opacity 0.5)
```

### Weather Station
```
✓ Environment: Clouds, rain, thunder (heavy)
✓ Buildings: Single building (Windmill or Tower)
✓ Text: RSS weather feed with typewriter animation
✓ Post-FX: Color cycling for dramatic effect
```

### News Ticker
```
✓ Text: RSS feed with horizontal scroll
✓ Text Effects: Glow or shadow for readability
✓ Background: Solid color or minimal pattern
✓ Minimal other elements for performance
```

### Digital Clock Display
```
✓ Text: Digital Clock source with HH:MM:SS format
✓ Text: Large font size (2.0-3.0)
✓ Text: Static or wave animation
✓ Text Effects: Glow for visibility
✓ Background: Dark gradient or fractal (low opacity)
```

### Hackerspace Status
```
✓ Text: SpaceAPI source showing open/closed status
✓ Logo: Hackerspace logo (centered, static)
✓ Environment: Rainbow when open, clouds when closed
✓ Text: Horizontal scroll animation
✓ Background: Themed image
```

### Holiday Theme
```
✓ Environment: Snow (heavy), stars, moon
✓ Buildings: Castle or Church
✓ Plants: Pine trees
✓ Text: Holiday message with Star Wars intro
✓ Text Effects: Flames or plasma
```

---

## ⚠️ Performance Guidelines

### Display Size Recommendations

| Display Size | Max Fish | Max Plants | Max Weather | Post-FX | Text FX |
|--------------|----------|------------|-------------|---------|---------|
| 16x16        | 5-10     | 10-20      | 10-20       | 0-1     | 0-1     |
| 32x32        | 10-20    | 20-40      | 20-40       | 0-2     | 0-2     |
| 64x32        | 20-40    | 40-80      | 40-80       | 1-3     | 1-3     |
| 64x64        | 30-50    | 60-100     | 60-100      | 2-4     | 2-4     |
| 128x64       | 40-60    | 80-120     | 80-120      | 3-5     | 3-5     |

### Troubleshooting Slow Performance

**Symptoms:** Stuttering animation, low FPS, delayed updates

**Solutions (in order of priority):**

1. **Reduce Speed** - Lower the Speed control from 1.0 to 0.5 or 0.3
2. **Disable Effects** - Turn off all Post-FX and Text FX
3. **Reduce Counts** - Cut fish/plant/weather counts in half
4. **Simplify Text** - Use Static animation instead of complex effects
5. **Remove Background** - Disable background image
6. **Limit Layers** - Enable only 2-3 element types at once
7. **Choose Static Elements** - Use trees/buildings instead of animated sprites

### What Impacts Performance Most?

**High Impact (avoid on slow systems):**
- Fractals with high iterations (>512)
- Post-processing effects (especially tunnel warp, fire)
- Text effects (especially plasma, flames)
- High fish counts (>30)
- Animated backgrounds
- Multiple text animations

**Medium Impact (use moderately):**
- Weather particles (rain/snow >50)
- Plant counts (>60)
- School fish (>10 schools)
- Background images

**Low Impact (safe to use):**
- Static buildings
- Static plants (trees, cacti)
- Small fish schools (<5)
- Celestial objects (sun, moon, stars)
- Static text

---

## 🔧 Technical Notes

### System Architecture

Fishtank uses a **sprite-based rendering system** with these components:

- **SpriteAnimator:** Base class for all moving objects
- **SpriteManager:** Manages collections of sprites
- **Layered Rendering:** 9 independent layers composited together
- **PostFX Pipeline:** Applies effects to combined layers
- **Dynamic Loading:** External content fetched asynchronously

### Optimizations Applied

- **Sprite Flip Caching:** Flipped sprites cached, not recalculated every frame
- **Bitwise Rounding:** Fast integer conversion for pixel positions
- **Batched Updates:** All sprites update before rendering for better CPU cache usage
- **Empty Manager Skipping:** Layers with no sprites skip render pass
- **Early Exit Optimization:** PostFX exits early when all effects disabled
- **Lazy Evaluation:** Expensive operations only run when values change

### Limitations

- **No collision detection** (except game sprites)
- **Fixed sprite graphics** (cannot customize pixel art at runtime)
- **Single building display** (can't show multiple buildings simultaneously)
- **Server-side image processing** (background images require server fetch)
- **RSS/JSON parsing** (limited format support)

---

## 📚 Additional Resources

### Example Configurations

**Minimal Setup (16x16 display):**
- Fish: 5 Goldfish
- Plants: 10 Short Plants
- Speed: 0.5

**Balanced Scene (64x32 display):**
- Fish: 15 mixed species
- Plants: 30 varied types
- Environment: 10 bubbles, 5 clouds
- Building: Factory
- Speed: 1.0

**Maximum Scene (128x64 display):**
- Fish: 40 mixed species + 5 schools
- Plants: 80 varied types
- Environment: All weather (moderate counts)
- Building: Windmill
- Text: RSS feed with glow
- Post-FX: Anti-aliasing + motion blur
- Speed: 1.0

### Common Questions

**Q: Why is my animation stuttering?**  
A: Too many elements or effects for your display size. Reduce counts or disable post-FX.

**Q: Can I show multiple buildings?**  
A: No, only one building can display at a time. This is a design limitation.

**Q: How do I make fish swim faster?**  
A: Increase "Large Fish Speed" or "School Speed" controls.

**Q: Can I use my own sprite graphics?**  
A: Not through the UI. You'd need to modify the sprite definition files (e.g., FishSprites.ts).

**Q: Why isn't my RSS feed showing?**  
A: Check the URL is correct and accessible. Some feeds may be blocked by CORS policies.

**Q: What's the difference between Speed and animation speeds?**  
A: Speed controls the global update rate (FPS). Individual animation speeds (fish, rain, text) are multipliers within that rate.

**Q: Can I save my configurations?**  
A: Yes, Fishtank saves control values automatically. They persist between sessions.

---

## 🎉 Get Creative!

Fishtank is designed for experimentation. There's no "right" way to use it - start with a few elements, adjust settings, and see what works for your display. The modular design means you can create anything from a peaceful aquarium to a chaotic weather display to an information dashboard.

**Remember:** If it doesn't fit, don't force it. Performance degradation means you've exceeded your display's capabilities. Scale back and find the sweet spot where everything runs smoothly.

Have fun filling your tank! 🐠🌿✨
