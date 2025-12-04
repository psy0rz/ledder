import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"
import PixelList from "../../PixelList.js"

// Base class for game sprites with collision detection
export class GameSprite extends SpriteAnimator {
    public isAlive: boolean = true;
    public shouldRespawn: boolean = true;
    
    getPosition() {
        return { x: this.state.x, y: this.state.y };
    }
    
    getBounds() {
        return {
            x: this.state.x,
            y: this.state.y,
            width: this.spriteWidth,
            height: this.spriteHeight
        };
    }
    
    checkCollision(other: GameSprite): boolean {
        if (!this.isAlive || !other.isAlive) return false;
        
        const a = this.getBounds();
        const b = other.getBounds();
        
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
    
    explode() {
        this.isAlive = false;
    }
    
    respawn(x: number, y: number) {
        this.state.x = x;
        this.state.y = y;
        this.isAlive = true;
    }
    
    render() {
        if (!this.isAlive) {
            // Return empty pixel list for dead sprites
            return new PixelList();
        }
        return super.render();
    }
}

// Explosion effect sprite
const explosionFrames = [
    `
....r....
...rrr...
..ryoyr..
.ryoyoyr.
ryoywyoyr
.ryoyoyr.
..ryoyr..
...rrr...
....r....
`,
    `
..r...r..
.ryr.ryr.
ryoyryoyr
yoy.w.yoy
r.y.w.y.r
yoy.w.yoy
ryoyryoyr
.ryr.ryr.
..r...r..
`,
    `
.........
...r.r...
..y.y.y..
.r.w.w.r.
...w5w...
.r.w.w.r.
..y.y.y..
...r.r...
.........
`,
    `
.........
.........
...5.5...
..5.5.5..
.5.5.5.5.
..5.5.5..
...5.5...
.........
.........
`
];

export class ExplosionSprite extends SpriteAnimator {
    private frameIndex: number = 0;
    private frameCounter: number = 0;
    private readonly frames = explosionFrames;
    private isDone: boolean = false;

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        super(explosionFrames[0], initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        this.frameCounter++;
        if (this.frameCounter >= 4) {
            this.frameCounter = 0;
            this.frameIndex++;
            
            if (this.frameIndex >= this.frames.length) {
                this.isDone = true;
                this.sprite = '.'; // Empty sprite when done
            } else {
                this.sprite = this.frames[this.frameIndex];
                (this as any).flippedSprite = null;
            }
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
    
    isFinished(): boolean {
        return this.isDone;
    }
}

// ==================== GALAGA ====================

// Galaga Boss - 2 animation frames
const galagaBossFrames = [
    `
.yy.yy.
.ybbby.
ybbbbby
..yyy..
yy...yy
`,
    `
.yy.yy.
.ybbby.
ybbbbby
..yyy..
.y...y.
`
];

// Galaga Butterfly - 2 animation frames
const galagaButterflyFrames = [
    `
r..r
.rr.
rbbr
rbbr
`,
    `
r..r
.rr.
rbbr
.rr.
`
];

// Galaga Bee - 2 animation frames
const galagaBeeFrames = [
    `
.w.
wbw
wrw
`,
    `
.w.
wbw
.w.
`
];

export class GalagaBossSprite extends GameSprite {
    private frameIndex: number = 0;
    private frameCounter: number = 0;
    private readonly frames = galagaBossFrames;
    private divePhase: number = 0;
    private isDiving: boolean = false;
    private homeX: number;
    private homeY: number;

    constructor(x: number, y: number, speed: number = 0.5) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speed,
            velocityY: 0
        };

        super(galagaBossFrames[0], initialState, {
            bounceOnEdges: false,
            wrapAround: true
        });
        
        this.homeX = x;
        this.homeY = y;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate sprite every 12 frames
        this.frameCounter++;
        if (this.frameCounter >= 12) {
            this.frameCounter = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            this.sprite = this.frames[this.frameIndex];
            (this as any).flippedSprite = null;
        }

        // Galaga-style movement: spiral dive attack
        if (!this.isDiving && Math.random() < 0.005) {
            // Start dive attack
            this.isDiving = true;
            this.divePhase = 0;
        }
        
        if (this.isDiving) {
            // Spiral dive pattern
            this.divePhase += 0.08;
            const spiralRadius = 15 + Math.sin(this.divePhase * 2) * 10;
            this.state.velocityX = Math.cos(this.divePhase) * spiralRadius * 0.1;
            this.state.velocityY = 1.5 + Math.sin(this.divePhase) * 0.5;
            
            // Return to home position after dive
            if (this.state.y > boxHeight * 0.7 || this.divePhase > Math.PI * 4) {
                this.isDiving = false;
                this.state.velocityY = -1.0;
                // Return to home area
                if (Math.abs(this.state.y - this.homeY) < 2) {
                    this.state.y = this.homeY;
                    this.state.velocityY = 0;
                    this.state.velocityX = 0.5;
                }
            }
        } else {
            // Idle horizontal movement
            this.state.velocityY = 0;
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
}

export class GalagaButterflySprite extends GameSprite {
    private frameIndex: number = 0;
    private frameCounter: number = 0;
    private readonly frames = galagaButterflyFrames;
    private divePhase: number = 0;
    private isDiving: boolean = false;
    private homeX: number;
    private homeY: number;

    constructor(x: number, y: number, speed: number = 0.3) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speed,
            velocityY: 0
        };

        super(galagaButterflyFrames[0], initialState, {
            bounceOnEdges: false,
            wrapAround: true
        });
        
        this.homeX = x;
        this.homeY = y;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate sprite every 10 frames
        this.frameCounter++;
        if (this.frameCounter >= 10) {
            this.frameCounter = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            this.sprite = this.frames[this.frameIndex];
            (this as any).flippedSprite = null;
        }
        
        // Galaga butterfly: figure-8 dive pattern
        if (!this.isDiving && Math.random() < 0.004) {
            this.isDiving = true;
            this.divePhase = 0;
        }
        
        if (this.isDiving) {
            // Figure-8 pattern (lemniscate curve)
            this.divePhase += 0.1;
            const scale = 12;
            this.state.velocityX = Math.sin(this.divePhase) * scale * 0.15;
            this.state.velocityY = 1.2 + Math.sin(this.divePhase * 2) * 0.8;
            
            // Return after completing pattern
            if (this.state.y > boxHeight * 0.7 || this.divePhase > Math.PI * 3) {
                this.isDiving = false;
                this.state.velocityY = -0.8;
                if (Math.abs(this.state.y - this.homeY) < 2) {
                    this.state.y = this.homeY;
                    this.state.velocityY = 0;
                    this.state.velocityX = 0.3;
                }
            }
        } else {
            this.state.velocityY = 0;
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
}

export class GalagaBeeSprite extends GameSprite {
    private frameIndex: number = 0;
    private frameCounter: number = 0;
    private readonly frames = galagaBeeFrames;
    private divePhase: number = 0;
    private isDiving: boolean = false;
    private homeX: number;
    private homeY: number;

    constructor(x: number, y: number, speed: number = 0.4) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speed,
            velocityY: 0
        };

        super(galagaBeeFrames[0], initialState, {
            bounceOnEdges: false,
            wrapAround: true
        });
        
        this.homeX = x;
        this.homeY = y;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate sprite every 8 frames
        this.frameCounter++;
        if (this.frameCounter >= 8) {
            this.frameCounter = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            this.sprite = this.frames[this.frameIndex];
            (this as any).flippedSprite = null;
        }
        
        // Galaga bee: fast zigzag dive
        if (!this.isDiving && Math.random() < 0.006) {
            this.isDiving = true;
            this.divePhase = 0;
        }
        
        if (this.isDiving) {
            // Zigzag pattern
            this.divePhase += 0.15;
            this.state.velocityX = Math.sin(this.divePhase * 4) * 8 * 0.2;
            this.state.velocityY = 1.8;
            
            // Quick return
            if (this.state.y > boxHeight * 0.6 || this.divePhase > Math.PI * 2) {
                this.isDiving = false;
                this.state.velocityY = -1.2;
                if (Math.abs(this.state.y - this.homeY) < 2) {
                    this.state.y = this.homeY;
                    this.state.velocityY = 0;
                    this.state.velocityX = 0.4;
                }
            }
        } else {
            this.state.velocityY = 0;
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// ==================== SPACE INVADERS ====================

// Space Invaders Squid - 2 animation frames
const invaderSquidFrames = [
    `
.gwwwg.
gwwwwwg
gwgwgwg
gwwwwwg
.g.g.g.
g.g.g.g
`,
    `
.gwwwg.
gwwwwwg
gwgwgwg
gwwwwwg
.g.g.g.
.g.g.g.
`
];

// Space Invaders Crab - 2 animation frames
const invaderCrabFrames = [
    `
.g.gg.g.
g.gwwg.g
gwwwwwwg
.gwgwgw.
gg.gg.gg
`,
    `
.g.gg.g.
g.gwwg.g
gwwwwwwg
.gwgwgw.
.gg..gg.
`
];

// Space Invaders Octopus - 2 animation frames
const invaderOctopusFrames = [
    `
..gwwg..
.gwwwwg.
gwgwwgwg
gwwwwwwg
.g.gg.g.
g.g..g.g
`,
    `
..gwwg..
.gwwwwg.
gwgwwgwg
gwwwwwwg
.g.gg.g.
.g.g.g..
`
];

export class SpaceInvaderSquidSprite extends GameSprite {
    private frameIndex: number = 0;
    private frameCounter: number = 0;
    private readonly frames = invaderSquidFrames;
    private movementPhase: number = 0;
    private stepCounter: number = 0;

    constructor(x: number, y: number, speed: number = 0.2) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speed,
            velocityY: 0
        };

        super(invaderSquidFrames[0], initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate sprite every 15 frames
        this.frameCounter++;
        if (this.frameCounter >= 15) {
            this.frameCounter = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            this.sprite = this.frames[this.frameIndex];
            (this as any).flippedSprite = null;
        }

        // Space Invaders movement: side-to-side with periodic downward steps
        this.stepCounter++;
        if (this.stepCounter >= 60) {
            // Move down and reverse direction
            this.stepCounter = 0;
            this.state.y += 2;
            this.state.velocityX = -this.state.velocityX!;
        }

        // Wrap vertically
        if (this.state.y > boxHeight) {
            this.state.y = 0;
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
}

export class SpaceInvaderCrabSprite extends GameSprite {
    private frameIndex: number = 0;
    private frameCounter: number = 0;
    private readonly frames = invaderCrabFrames;
    private stepCounter: number = 0;

    constructor(x: number, y: number, speed: number = 0.2) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speed,
            velocityY: 0
        };

        super(invaderCrabFrames[0], initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate sprite every 15 frames
        this.frameCounter++;
        if (this.frameCounter >= 15) {
            this.frameCounter = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            this.sprite = this.frames[this.frameIndex];
            (this as any).flippedSprite = null;
        }

        // Space Invaders movement
        this.stepCounter++;
        if (this.stepCounter >= 60) {
            this.stepCounter = 0;
            this.state.y += 2;
            this.state.velocityX = -this.state.velocityX!;
        }

        if (this.state.y > boxHeight) {
            this.state.y = 0;
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
}

export class SpaceInvaderOctopusSprite extends GameSprite {
    private frameIndex: number = 0;
    private frameCounter: number = 0;
    private readonly frames = invaderOctopusFrames;
    private stepCounter: number = 0;

    constructor(x: number, y: number, speed: number = 0.2) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speed,
            velocityY: 0
        };

        super(invaderOctopusFrames[0], initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate sprite every 15 frames
        this.frameCounter++;
        if (this.frameCounter >= 15) {
            this.frameCounter = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            this.sprite = this.frames[this.frameIndex];
            (this as any).flippedSprite = null;
        }

        // Space Invaders movement
        this.stepCounter++;
        if (this.stepCounter >= 60) {
            this.stepCounter = 0;
            this.state.y += 2;
            this.state.velocityX = -this.state.velocityX!;
        }

        if (this.state.y > boxHeight) {
            this.state.y = 0;
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// ==================== ARKANOID ====================

// Arkanoid Paddle - 1 frame (moves left/right)
const arkanoidPaddleSprite = `
rrrrrrrr
bwwwwwwb
rrrrrrrr
`;

// Arkanoid Ball - 2 animation frames
const arkanoidBallFrames = [
    `
.55.
5ww5
55w5
.55.
`,
    `
.55.
55w5
5ww5
.55.
`
,
    `
.55.
5w55
5ww5
.55.
`
,
    `
.55.
5ww5
5w55
.55.
`
];

export class ArkanoidPaddleSprite extends GameSprite {
    private direction: number = 1;
    private moveCounter: number = 0;

    constructor(x: number, y: number, speed: number = 0.8) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speed,
            velocityY: 0
        };

        super(arkanoidPaddleSprite, initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Paddle moves back and forth at bottom
        this.moveCounter++;
        
        // Change direction at edges
        if (this.state.x <= 0) {
            this.state.velocityX = Math.abs(this.state.velocityX!);
        } else if (this.state.x >= boxWidth - 8) {
            this.state.velocityX = -Math.abs(this.state.velocityX!);
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
}

export class ArkanoidBallSprite extends GameSprite {
    private frameIndex: number = 0;
    private frameCounter: number = 0;
    private readonly frames = arkanoidBallFrames;
    public onCollision?: (sprite: GameSprite) => void;

    constructor(x: number, y: number, speedX: number = 0.6, speedY: number = -0.8) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speedX,
            velocityY: speedY
        };

        super(arkanoidBallFrames[0], initialState, {
            bounceOnEdges: true,
            wrapAround: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate sprite every 6 frames
        this.frameCounter++;
        if (this.frameCounter >= 6) {
            this.frameCounter = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            this.sprite = this.frames[this.frameIndex];
            (this as any).flippedSprite = null;
        }

        // Ball bounces on all edges
        super.update(frameNr, boxWidth, boxHeight);
    }
}

export const GameSprites = {
    GalagaBoss: GalagaBossSprite,
    GalagaButterfly: GalagaButterflySprite,
    GalagaBee: GalagaBeeSprite,
    SpaceInvaderSquid: SpaceInvaderSquidSprite,
    SpaceInvaderCrab: SpaceInvaderCrabSprite,
    SpaceInvaderOctopus: SpaceInvaderOctopusSprite,
    ArkanoidPaddle: ArkanoidPaddleSprite,
    ArkanoidBall: ArkanoidBallSprite
};
