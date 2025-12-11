import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"
import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import sharp from "sharp"
import drawImage from "../../draw/DrawImage.js"
import drawAnimatedImage from "../../draw/DrawAnimatedImage.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"

/**
 * Movement animation types for logos
 */
export enum LogoAnimationType {
    STATIC = "static",
    HORIZONTAL_SCROLL = "horizontal_scroll",
    VERTICAL_SCROLL = "vertical_scroll",
    BOUNCE = "bounce",
    FLOW = "flow"
}

/**
 * Built-in logo designs as ASCII art
 */
export const BuiltInLogos = {
    HSD: `
  rr0rr0rr
  rr0rr0rr
  0rrrrrr0
  0rrrrrr0
  0rrrrrr0
  0rr00rr0
  0rr00rr0
  rrr00rrr
`,
    
    HSD64W20H: `
........................rrrr..rrrr..rrrr.........................
........................rrrr..rrrr..rrrr.........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrrrrrrrrrr...........................
..........................rrrr....rrrr...........................
..........................rrrr....rrrr...........................
..........................rrrr....rrrr...........................
..........................rrrr....rrrr...........................
........................rrrrrr....rrrrrr.........................
........................rrrrrr....rrrrrr.........................
.................................................................
w...w.wwwww.wwwww.w..w..wwwww.wwwww.wwwww.wwwww.wwwww.wwwww.wwwww
w...w.w...w.w.....w.w...w.....w...w.w.....w...w.w...w.w.....w....
wwwww.wwwww.w.....ww....wwww..wwwww.wwwww.wwwww.wwwww.w.....wwww.
w...w.w...w.w.....w.w...w.....w.w.......w.w.....w...w.w.....w....
w...w.w...w.w.....w..w..w.....w..w......w.w.....w...w.w.....w....
w...w.w...w.wwwww.w...w.wwwww.w...w.wwwww.w.....w...w.wwwww.wwwww
.................................................................
...................rr..rrr.rrr.rrr.rrr.r.r.rrr...................
...................r.r.r...r...r.r..r..r.r.r.....................
.rrrrrrrrrrrrrrrr..r.r.r...rr..r.r..r..rrr.rr...rrrrrrrrrrrrrrrr.
...................r.r.r...r...r.r..r..r.r.r.....................
...................rrr.r...rrr.r.r..r..r.r.rrr...................
`,
    
    HSD120W8H: `
rr.rr.rr......................................................................rr.rr.rr..............................................
rr.rr.rr..w...w.wwwww.wwwww.w..w..wwwww.wwwww.wwwww.wwwww.wwwww.wwwww.wwwww...rr.rr.rr...www...wwwww.wwwww.wwwww.wwwww.w...w.wwwww..
.rrrrrr...w...w.w...w.w.....w.w...w.....w...w.w.....w...w.w...w.w.....w........rrrrrr....w..w..w...w.w.....w...w...w...w...w.w......
.rrrrrr...wwwww.wwwww.w.....ww....wwww..wwwww.wwwww.wwwww.wwwww.w.....wwww.....rrrrrr....w...w.wwwww.wwww..w...w...w...wwwww.wwww...
.rrrrrr...w...w.w...w.w.....w.w...w.....w.w.......w.w.....w...w.w.....w........rrrrrr....w...w.w.w...w.....w...w...w...w...w.w......
.rr..rr...w...w.w...w.w.....w..w..w.....w..w......w.w.....w...w.w.....w........rr..rr....w...w.w..w..w.....w...w...w...w...w.w......
rrr..rrr..w...w.w...w.wwwww.w...w.wwwww.w...w.wwwww.w.....w...w.wwwww.wwwww...rrr..rrr...wwwww.w...w.wwwww.w...w...w...w...w.wwwww..
rrr..rrr......................................................................rrr..rrr..............................................
`,
    
    TkkrLab: `
.......y...
......y.y..
.....yww.y
....y.ww..y
...y...wwwwy
..y....www..y.
.y.....w.w...y
yyyyyyyyyyyyyyy
`,
    
    Stc: `
....wwww..................
..wwwwwwww................
.www...wwww...............
.ww.....wwww..............
.w......wwww..............
....... wwww.......wwwwww.
.......wwww.....wwwwwww...
......wwwww...wwwwwwwww...
.....wwwww..wwwwwwwwww....
....wwwwww.wwwwwwwwwww....
...wwwwwwwwwwwwwwwwwww....
..www...www...www...ww....
.wwww.wwwwww.wwww.wwww....
.wwww...wwww.wwww.wwwww...
wwwwwww.wwww.wwww.wwwww...
wwwww...wwww.wwww...www...
`,
    
    Hack42: `
#...#..###...###.#...#..........
#...#.#...#.#....#...#..........
#...#.#...#.#....#..#...........
#####.#####.#....###............
#...#.#...#.#....#..#...........
#...#.#...#.#....#...#..........
#...#.#...#..###.#...#..........
.........................#...##.
........................##..#..#
.......................#.#....#.
.......................####..#..
.........................#..####
`,
    
    TDVenlo: `
r.wbbbbw.wbbbb..r..
..wbbbbw.bwbbbb
g...bb...bw..bb.g
....bb...bb..bb
b...bb...bb..bb.b..
....bb...bb..bb....
y...bb...wwbbbb.y..
....ww...wbbbb.....
`,
    
    MaakPlek: `
wwww..wwww..wwww..w..w..wwwww..w....wwwww..w..w
w..w..w..w..w..w..w.w...w...w..w....w......w.w.
wwww..wwww..wwww..ww....wwwww..w....wwww...ww..
w.....w.....w.....w.w...w...w..w....w......w.w.
w.....w.....w.....w..w..w...w..wwww.wwwww..w..w
`
};

/**
 * Logo sprite that loads and displays remote images with various animations
 */
export class LogoSprite extends SpriteAnimator {
    private displayWidth: number;
    private displayHeight: number;
    private imageFrames: PixelList[] = [];
    private currentFrame: number = 0;
    private baseX: number;
    private baseY: number;
    private animationType: LogoAnimationType;
    private animationSpeed: number;
    private opacity: number;
    private scale: number;
    private targetWidth: number;
    private targetHeight: number;
    private pulsePhase: number = 0;
    private driftPhase: number = Math.random() * Math.PI * 2;
    private rotationAngle: number = 0;
    
    // FX parameters
    private glowAmount: number = 0;
    private glowColor: Color = new Color(255, 255, 255, 1);
    private rainbowEffect: boolean = false;
    private rainbowPhase: number = 0;

    constructor(
        displayWidth: number, 
        displayHeight: number,
        x: number,
        y: number,
        width: number,
        height: number,
        animationType: LogoAnimationType = LogoAnimationType.STATIC,
        animationSpeed: number = 1.0,
        opacity: number = 1.0
    ) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        // Allow negative coordinates for off-screen positioning during animations
        super("", initialState, {
            minX: -Infinity,
            minY: -Infinity
        });

        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.baseX = x;
        this.baseY = y;
        this.targetWidth = width;
        this.targetHeight = height;
        this.animationType = animationType;
        this.animationSpeed = animationSpeed;
        this.opacity = opacity;
        this.scale = 1.0;
    }

    /**
     * Load logo from remote URL or built-in ASCII art
     */
    async loadImageData(imageUrl: string) {
        try {
            // Check if it's a built-in logo
            if (imageUrl in BuiltInLogos) {
                const asciiArt = BuiltInLogos[imageUrl as keyof typeof BuiltInLogos];
                const asciiSprite = new DrawAsciiArtColor(0, 0, asciiArt);
                this.imageFrames = [asciiSprite];
                this.currentFrame = 0;
                return;
            }
            
            // Otherwise load from URL
            const response = await fetch(imageUrl);
            const imageBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(imageBuffer);
            
            const sharpImg = await sharp(buffer, {
                animated: true,
                limitInputPixels: false
            }).resize(this.targetWidth, this.targetHeight, {
                fit: "contain",
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            });

            // Check if animated
            const metadata = await sharp(buffer, {
                animated: true,
                limitInputPixels: false
            }).metadata();

            if (metadata.pages && metadata.pages > 1) {
                // Animated image - store raw frames
                const framesData = await drawAnimatedImage(
                    { width: () => this.targetWidth, height: () => this.targetHeight } as any,
                    0, 0, sharpImg
                );
                
                this.imageFrames = framesData.frames;
            } else {
                // Static image - store raw frame
                const imageData = await drawImage(0, 0, sharpImg);
                this.imageFrames = [imageData];
            }

            this.currentFrame = 0;
        } catch (error) {
            // Silently fail - invalid URLs or network errors shouldn't crash
            console.error("Failed to load logo image:", error);
            this.imageFrames = [];
        }
    }

    /**
     * Set animation parameters
     */
    setAnimation(type: LogoAnimationType, speed: number = 1.0) {
        this.animationType = type;
        this.animationSpeed = speed;
    }

    /**
     * Set FX parameters
     */
    setGlow(amount: number, color: Color = new Color(255, 255, 255, 1)) {
        this.glowAmount = amount;
        this.glowColor = color;
    }

    setRainbow(enabled: boolean) {
        this.rainbowEffect = enabled;
    }

    setOpacity(opacity: number) {
        this.opacity = opacity;
    }

    setScale(scale: number) {
        this.scale = scale;
    }

    /**
     * Update logo position and effects based on animation type
     */
    update(frameNr: number, boxWidth: number, boxHeight: number) {
        const time = frameNr * this.animationSpeed * 0.5; // Smoother animation
        const absTime = frameNr * Math.abs(this.animationSpeed) * 0.5; // For modulo calculations

        // Calculate actual rendered logo dimensions from current frame
        let actualWidth = this.targetWidth * this.scale;
        let actualHeight = this.targetHeight * this.scale;
        
        if (this.imageFrames.length > 0) {
            const pixels = this.imageFrames[this.currentFrame];
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            
            for (const item of pixels) {
                if (item instanceof Pixel) {
                    const x = item.x * this.scale;
                    const y = item.y * this.scale;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
            
            if (isFinite(minX)) {
                actualWidth = maxX - minX + 1;
                actualHeight = maxY - minY + 1;
            }
        }

        // Auto-switch to scrolling if logo is bigger than screen
        let effectiveAnimationType = this.animationType;
        if (this.animationType === LogoAnimationType.STATIC) {
            if (actualWidth > boxWidth) {
                effectiveAnimationType = LogoAnimationType.HORIZONTAL_SCROLL;
            } else if (actualHeight > boxHeight) {
                effectiveAnimationType = LogoAnimationType.VERTICAL_SCROLL;
            }
        }

        switch (effectiveAnimationType) {
            case LogoAnimationType.STATIC:
                this.state.x = this.baseX;
                this.state.y = this.baseY;
                break;

            case LogoAnimationType.HORIZONTAL_SCROLL:
                // Horizontal scroll: starts at x = -logoWidth - 16, ends at x = displayWidth + 16
                const hScrollStart = -actualWidth - 16;
                const hScrollEnd = boxWidth + 16;
                const hScrollDistance = hScrollEnd - hScrollStart;
                const scrollX = absTime % hScrollDistance;
                this.state.x = this.animationSpeed >= 0 ? 
                    hScrollStart + scrollX : 
                    hScrollEnd - scrollX;
                this.state.y = this.baseY;
                break;

            case LogoAnimationType.VERTICAL_SCROLL:
                // Scroll vertically: starts completely off-screen, scrolls through, ends completely off-screen
                // Double the distance to ensure logo fully disappears before looping
                const vScrollDistance = (boxHeight + actualHeight) * 2;
                const scrollY = absTime % vScrollDistance;
                this.state.x = this.baseX;
                this.state.y = this.animationSpeed >= 0 ? 
                    boxHeight + actualHeight - scrollY : 
                    scrollY - actualHeight * 2;
                break;

            case LogoAnimationType.BOUNCE:
                // Bouncing motion with physics-like behavior - works with any logo size
                const maxBounceHeight = Math.min(boxHeight * 0.3, boxHeight - actualHeight);
                const bounceSpeed = absTime * 0.02;
                const bounce = Math.abs(Math.sin(bounceSpeed * Math.PI)) * maxBounceHeight;
                this.state.x = this.baseX;
                this.state.y = this.baseY - bounce;
                break;

            case LogoAnimationType.FLOW:
                // Flowing wave-like motion - constrain movement to keep logo visible
                const flowDirection = this.animationSpeed >= 0 ? 1 : -1;
                const maxFlowX = Math.max(0, (boxWidth - actualWidth) * 0.15);
                const maxFlowY = Math.max(0, (boxHeight - actualHeight) * 0.1);
                this.state.x = this.baseX + Math.sin(time * 0.015) * maxFlowX * flowDirection;
                this.state.y = this.baseY + Math.cos(time * 0.01) * maxFlowY * flowDirection;
                break;
        }

        // Update rainbow effect
        if (this.rainbowEffect) {
            this.rainbowPhase = (this.rainbowPhase + 0.02 * Math.abs(this.animationSpeed)) % (Math.PI * 2);
        }

        // Update animated frames
        if (this.imageFrames.length > 1) {
            this.currentFrame = (this.currentFrame + 1) % this.imageFrames.length;
        }

        super.update(frameNr, boxWidth, boxHeight);
    }

    /**
     * Render logo with effects - apply opacity, scale, and effects during render
     */
    render(): PixelList {
        if (this.imageFrames.length === 0) {
            return new PixelList();
        }

        let pixels = this.imageFrames[this.currentFrame];
        const result = new PixelList();

        // Apply scale only (pulse removed)
        const effectiveScale = this.scale;

        for (const item of pixels) {
            if (item instanceof Pixel) {
                // Apply scaling
                let x = Math.round(this.state.x + item.x * effectiveScale);
                let y = Math.round(this.state.y + item.y * effectiveScale);

                let color = item.color;

                // Apply opacity
                if (this.opacity < 1.0) {
                    color = new Color(color.r, color.g, color.b, color.a * this.opacity);
                }

                // Apply rainbow effect
                if (this.rainbowEffect) {
                    const hue = (this.rainbowPhase + (item.x + item.y) * 0.1) % (Math.PI * 2);
                    const r = Math.round(127 + 127 * Math.sin(hue));
                    const g = Math.round(127 + 127 * Math.sin(hue + Math.PI * 2 / 3));
                    const b = Math.round(127 + 127 * Math.sin(hue + Math.PI * 4 / 3));
                    color = new Color(r, g, b, color.a);
                }

                result.add(new Pixel(x, y, color));

                // Apply glow effect
                if (this.glowAmount > 0) {
                    const glowRadius = Math.round(this.glowAmount);
                    for (let dy = -glowRadius; dy <= glowRadius; dy++) {
                        for (let dx = -glowRadius; dx <= glowRadius; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance <= glowRadius) {
                                const glowIntensity = (1 - distance / glowRadius) * 0.3;
                                const glowColor = new Color(
                                    this.glowColor.r,
                                    this.glowColor.g,
                                    this.glowColor.b,
                                    glowIntensity
                                );
                                result.add(new Pixel(x + dx, y + dy, glowColor));
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    /**
     * Set position
     */
    setPosition(x: number, y: number) {
        this.baseX = x;
        this.baseY = y;
    }

    /**
     * Set size
     */
    setSize(width: number, height: number) {
        this.targetWidth = width;
        this.targetHeight = height;
    }
}

/**
 * Factory namespace for creating logo sprites
 */
export namespace LogoSprites {
    export function createLogo(
        displayWidth: number,
        displayHeight: number,
        x: number,
        y: number,
        width: number,
        height: number,
        animationType: LogoAnimationType = LogoAnimationType.STATIC,
        animationSpeed: number = 1.0,
        opacity: number = 1.0
    ): LogoSprite {
        return new LogoSprite(
            displayWidth,
            displayHeight,
            x,
            y,
            width,
            height,
            animationType,
            animationSpeed,
            opacity
        );
    }
}
