import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"
import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"

const bubbleSprite = `
.ww.
w..w
w..w
.ww.
`;

export class BubbleSprite extends SpriteAnimator {
    private baseX: number;
    private wobbleSpeed: number = 10;
    private riseSpeedCache: number;
    private wobbleAmountCache: number;

    constructor(x: number, y: number, riseSpeed: number = 0.4, wobbleAmount: number = 0.3) {
        const initialState: SpriteState = {
            x,
            y
        };

        super(bubbleSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
        this.riseSpeedCache = riseSpeed;
        this.wobbleAmountCache = wobbleAmount;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Bubbles rise upward (cached value)
        this.state.y -= this.riseSpeedCache;

        // Add wobble effect (cached wobble amount)
        this.state.x = this.baseX + Math.sin(frameNr / this.wobbleSpeed) * this.wobbleAmountCache;

        // Wrap at bottom when reaching top
        if (this.state.y < 0) {
            this.state.y = boxHeight - 2;
        }
        
        // Wrap horizontally if wobbling too far
        if (this.state.x < 0) {
            this.state.x = boxWidth;
            this.baseX = boxWidth;
        } else if (this.state.x > boxWidth) {
            this.state.x = 0;
            this.baseX = 0;
        }
    }
}

// Cloud sprite - multiple sizes
const cloudSmallSprite = `
.www.
wwwww
`;

const cloudMediumSprite = `
..www..
.wwwww.
wwwwwww
`;

const cloudLargeSprite = `
...www...
..wwwww..
.wwwwwww.
wwwwwwwww
`;

export class CloudSprite extends SpriteAnimator {
    constructor(x: number, y: number, size: 'small' | 'medium' | 'large' = 'medium', speed: number = 0.05) {
        const sprites = {
            small: cloudSmallSprite,
            medium: cloudMediumSprite,
            large: cloudLargeSprite
        };

        const initialState: SpriteState = {
            x,
            y,
            velocityX: speed,
            velocityY: 0
        };

        super(sprites[size], initialState, {
            wrapAround: true,
            minX: 0,
            minY: 0
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Sun sprite
const sunSprite = `
..y..
.yyy.
yyyyy
.yyy.
..y..
`;

export class SunSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            phase: 0
        };

        super(sunSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Gentle pulsing effect
        this.state.phase = (this.state.phase || 0) + 0.05;
        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Moon sprite
const moonSprite = `
.ww.
w55w
w55w
.ww.
`;

export class MoonSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y
        };

        super(moonSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Star sprite - twinkling
const starFrames = [
    `w`,
    `5`,
    `w`,
    `.`
];

export class StarSprite extends SpriteAnimator {
    private currentFrame: number = 0;
    private frameOffset: number;

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y
        };

        super(starFrames[0], initialState, {
            bounceOnEdges: false
        });

        this.frameOffset = Math.floor(Math.random() * 60);
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Twinkling effect with random offset
        this.currentFrame = Math.floor((frameNr + this.frameOffset) / 15) % starFrames.length;
        this.sprite = starFrames[this.currentFrame];

        const lines = this.sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 1;

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Raindrop sprites - different depths
const raindropFarSprite = `5`;      // Far away - gray
const raindropMidSprite = `b`;      // Medium distance - blue
const raindropNearSprite = `b`;     // Close - blue (will use double height)

export class RaindropSprite extends SpriteAnimator {
    private depth: number;
    
    constructor(x: number, y: number, depth: 'far' | 'mid' | 'near' = 'mid', speedMultiplier: number = 1.0) {
        // Depth determines speed and sprite
        const depthSettings = {
            far: { sprite: raindropFarSprite, speed: 0.4 * speedMultiplier },
            mid: { sprite: raindropMidSprite, speed: 0.8 * speedMultiplier },
            near: { sprite: raindropNearSprite, speed: 1.4 * speedMultiplier }
        };
        
        const settings = depthSettings[depth];
        const initialState: SpriteState = {
            x,
            y,
            velocityY: settings.speed
        };

        super(settings.sprite, initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });
        
        this.depth = depth === 'near' ? 3 : depth === 'mid' ? 2 : 1;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Move position
        if (this.state.velocityY !== undefined) {
            this.state.y += this.state.velocityY;
        }
        
        // Wrap to top with randomized horizontal position
        if (this.state.y >= boxHeight) {
            this.state.y = 0;
            this.state.x = Math.random() * boxWidth;
        }
    }
}

// Snowflake sprites - different depths
const snowflakeFarFrames = [`5`, `5`, `5`, `.`];     // Far - gray, mostly visible
const snowflakeMidFrames = [`w`, `5`, `w`, `5`];     // Mid - white/gray
const snowflakeNearFrames = [`w`, `w`, `w`, `5`];    // Near - bright white

export class SnowflakeSprite extends SpriteAnimator {
    private currentFrame: number = 0;
    private baseX: number;
    private frames: string[];
    private depth: number;

    constructor(x: number, y: number, depth: 'far' | 'mid' | 'near' = 'mid', speedMultiplier: number = 1.0) {
        // Depth determines speed and frames
        const depthSettings = {
            far: { frames: snowflakeFarFrames, speed: 0.08 * speedMultiplier, sway: 0.3 },
            mid: { frames: snowflakeMidFrames, speed: 0.15 * speedMultiplier, sway: 0.5 },
            near: { frames: snowflakeNearFrames, speed: 0.25 * speedMultiplier, sway: 0.8 }
        };
        
        const settings = depthSettings[depth];
        const initialState: SpriteState = {
            x,
            y,
            velocityY: settings.speed,
            swayAmount: settings.sway
        };

        super(settings.frames[0], initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });

        this.baseX = x;
        this.frames = settings.frames;
        this.depth = depth === 'near' ? 3 : depth === 'mid' ? 2 : 1;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate snowflake
        this.currentFrame = Math.floor(frameNr / 8) % this.frames.length;
        this.sprite = this.frames[this.currentFrame];

        const lines = this.sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 1;

        // Move position
        if (this.state.velocityY !== undefined) {
            this.state.y += this.state.velocityY;
        }

        // Gentle swaying while falling (more sway for closer flakes)
        const sway = Math.sin(frameNr / 10) * (this.state.swayAmount || 0.5);
        this.state.x = this.baseX + sway;

        // Wrap to top with randomized horizontal position
        if (this.state.y >= boxHeight) {
            this.state.y = 0;
            this.state.x = Math.random() * boxWidth;
            this.baseX = this.state.x;
        }
    }
}

// Thunder/Lightning sprite - flashing
const thunderFrames = [
    `
y
yy
y
yy
y
`,
    `
.
..
.
..
.
`
];

export class ThunderSprite extends SpriteAnimator {
    private currentFrame: number = 0;
    private flashDuration: number = 0;
    private waitTime: number = 0;

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y
        };

        super(thunderFrames[1], initialState, {
            bounceOnEdges: false
        });

        this.waitTime = Math.floor(Math.random() * 120) + 60;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        if (this.flashDuration > 0) {
            // Flash!
            this.currentFrame = (frameNr % 4 < 2) ? 0 : 1;
            this.flashDuration--;
        } else {
            // Waiting for next flash
            this.currentFrame = 1; // invisible
            this.waitTime--;
            if (this.waitTime <= 0) {
                this.flashDuration = Math.floor(Math.random() * 10) + 5;
                this.waitTime = Math.floor(Math.random() * 120) + 60;
            }
        }

        this.sprite = thunderFrames[this.currentFrame];

        const lines = this.sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 1;

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Rainbow sprite - transparent arc covering the display
export class RainbowSprite extends SpriteAnimator {
    private displayWidth: number = 0;
    
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y
        };

        // Start with a minimal sprite, we'll render dynamically
        super(".", initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        this.displayWidth = boxWidth;
        super.update(frameNr, boxWidth, boxHeight);
    }
    
    render() {
        if (this.displayWidth === 0) return super.render();
        
        const pixels = new PixelList();
        
        // Rainbow colors with transparency (RGB + alpha)
        const rainbowColors = [
            {r: 255, g: 0, b: 0, a: 0.3},     // Red
            {r: 255, g: 127, b: 0, a: 0.3},   // Orange
            {r: 255, g: 255, b: 0, a: 0.3},   // Yellow
            {r: 0, g: 255, b: 0, a: 0.3},     // Green
            {r: 0, g: 0, b: 255, a: 0.3},     // Blue
            {r: 75, g: 0, b: 130, a: 0.3},    // Indigo
            {r: 148, g: 0, b: 211, a: 0.3}    // Violet
        ];
        
        // Draw rainbow bands across the full width
        for (let colorIdx = 0; colorIdx < rainbowColors.length; colorIdx++) {
            const color = rainbowColors[colorIdx];
            const y = this.state.y + colorIdx;
            
            for (let x = 0; x < this.displayWidth; x++) {
                pixels.add(new Pixel(
                    x,
                    y,
                    new Color(color.r, color.g, color.b, color.a)
                ));
            }
        }
        
        return pixels;
    }
}

// Snow ground layer
export class SnowGroundSprite extends SpriteAnimator {
    private displayWidth: number;
    private groundHeight: number;

    constructor(y: number, displayWidth: number, heightPixels: number = 2) {
        const initialState: SpriteState = {
            x: 0,
            y: y
        };

        super('.', initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });

        this.displayWidth = displayWidth;
        this.groundHeight = heightPixels;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        this.displayWidth = boxWidth;
        super.update(frameNr, boxWidth, boxHeight);
    }

    render() {
        const pixels = new PixelList();
        const white = new Color(255, 255, 255);
        const lightGray = new Color(200, 200, 200);

        // Draw snow ground layer
        for (let dy = 0; dy < this.groundHeight; dy++) {
            const y = this.state.y + dy;
            for (let x = 0; x < this.displayWidth; x++) {
                // Alternate between white and light gray for texture
                const color = (x + dy) % 2 === 0 ? white : lightGray;
                pixels.add(new Pixel(x, y, color));
            }
        }

        return pixels;
    }
}

export const EnvironmentSprites = {
    Bubble: BubbleSprite,
    Cloud: CloudSprite,
    Sun: SunSprite,
    Moon: MoonSprite,
    Star: StarSprite,
    Raindrop: RaindropSprite,
    Snowflake: SnowflakeSprite,
    Thunder: ThunderSprite,
    Rainbow: RainbowSprite,
    SnowGround: SnowGroundSprite
};

