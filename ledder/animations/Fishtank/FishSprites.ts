import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"

const tropicalFishSprite = `

y.oyyyyo.
.oyyyybyy
y.oyyyyo.

`;

export class TropicalFishSprite extends SpriteAnimator {
    constructor(x: number, y: number, speedX: number = 0.08, speedY: number = 0.02) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speedX,
            velocityY: speedY
        };

        super(tropicalFishSprite, initialState, {
            wrapAround: true,
            minX: 0,
            minY: 2
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Add gentle water flow effect (preserve direction) - optimized
        const vx = this.state.velocityX;
        if (vx !== undefined) {
            const absVx = vx < 0 ? -vx : vx;
            this.state.velocityX = absVx * 0.3 + (vx < 0 ? -0.05 : 0.05);
        }

        super.update(frameNr, boxWidth, boxHeight);

        // Add smooth, very gentle vertical movement variation (reduced checks)
        if ((frameNr & 79) === 0) { // Bitwise AND is faster than modulo
            const vy = this.state.velocityY;
            if (vy !== undefined) {
                const newVy = vy + (Math.random() - 0.5) * 0.04;
                this.state.velocityY = newVy < -0.1 ? -0.1 : (newVy > 0.1 ? 0.1 : newVy);
            }
        }
    }
}

const goldfishSprite = `
....yyyy..
y..yyybyy.
.yyyyyoooy
y..yyyyyy.
....yyyy..
`;

export class GoldfishSprite extends SpriteAnimator {
    constructor(x: number, y: number, speedX: number = 0.06, speedY: number = 0.03) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speedX,
            velocityY: speedY
        };

        super(goldfishSprite, initialState, {
            wrapAround: true,
            minX: 0,
            minY: 2
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Add gentle water flow effect (optimized)
        const vx = this.state.velocityX;
        if (vx !== undefined) {
            const absVx = vx < 0 ? -vx : vx;
            this.state.velocityX = absVx * 0.25 + (vx < 0 ? -0.04 : 0.04);
        }

        super.update(frameNr, boxWidth, boxHeight);

        // Gentle swimming pattern (optimized)
        if ((frameNr % 100) === 0) {
            const vy = this.state.velocityY;
            if (vy !== undefined) {
                const newVy = vy + (Math.random() - 0.5) * 0.03;
                this.state.velocityY = newVy < -0.08 ? -0.08 : (newVy > 0.08 ? 0.08 : newVy);
            }
        }
    }
}

const clownfishSprite = `
..oooo..
woowbwo.
oowwwwoo
woowowo.
..oooo..
`;

export class ClownfishSprite extends SpriteAnimator {
    constructor(x: number, y: number, speedX: number = 0.1, speedY: number = 0.03) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speedX,
            velocityY: speedY
        };

        super(clownfishSprite, initialState, {
            wrapAround: true,
            minX: 0,
            minY: 2
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Add gentle water flow effect (preserve direction)
        if (this.state.velocityX !== undefined) {
            const direction = this.state.velocityX >= 0 ? 1 : -1;
            this.state.velocityX = Math.abs(this.state.velocityX) * 0.35 + 0.06 * direction;
        }

        super.update(frameNr, boxWidth, boxHeight);

        // Smooth darting movement (but slower)
        if (frameNr % 120 === 0) {
            if (this.state.velocityX !== undefined) {
                const direction = this.state.velocityX >= 0 ? 1 : -1;
                this.state.velocityX += (Math.random() - 0.5) * 0.05;
                this.state.velocityX = Math.max(0.05 * direction, Math.min(0.15 * direction, this.state.velocityX));
            }
        }
    }
}

const angelfishSprite = `
..w..
.www.
yyyyy
yyybb
.yyy.
..y..
`;

export class AngelfishSprite extends SpriteAnimator {
    constructor(x: number, y: number, speedX: number = 0.05, speedY: number = 0.02) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speedX,
            velocityY: speedY
        };

        super(angelfishSprite, initialState, {
            wrapAround: true,
            minX: 0,
            minY: 2
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Add gentle water flow effect (preserve direction)
        if (this.state.velocityX !== undefined) {
            const direction = this.state.velocityX >= 0 ? 1 : -1;
            this.state.velocityX = Math.abs(this.state.velocityX) * 0.2 + 0.03 * direction;
        }

        super.update(frameNr, boxWidth, boxHeight);

        // Graceful slow movement
        if (frameNr % 150 === 0 && this.state.velocityY !== undefined) {
            this.state.velocityY += (Math.random() - 0.5) * 0.02;
            this.state.velocityY = Math.max(-0.06, Math.min(0.06, this.state.velocityY));
        }
    }
}

const neonTetraSprite = `
b.bbb.
bggggb
b.bbb.
`;

export class NeonTetraSprite extends SpriteAnimator {
    constructor(x: number, y: number, speedX: number = 0.12, speedY: number = 0.04) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speedX,
            velocityY: speedY
        };

        super(neonTetraSprite, initialState, {
            wrapAround: true,
            minX: 0,
            minY: 2
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Add gentle water flow effect (preserve direction)
        if (this.state.velocityX !== undefined) {
            const direction = this.state.velocityX >= 0 ? 1 : -1;
            this.state.velocityX = Math.abs(this.state.velocityX) * 0.4 + 0.07 * direction;
        }

        super.update(frameNr, boxWidth, boxHeight);

        // Quick, smooth schooling fish behavior (but slower)
        if (frameNr % 60 === 0) {
            if (this.state.velocityX !== undefined) {
                const direction = this.state.velocityX >= 0 ? 1 : -1;
                this.state.velocityX += (Math.random() - 0.5) * 0.04;
                this.state.velocityX = Math.max(0.08 * direction, Math.min(0.18 * direction, this.state.velocityX));
            }
            if (this.state.velocityY !== undefined) {
                this.state.velocityY += (Math.random() - 0.5) * 0.04;
                this.state.velocityY = Math.max(-0.1, Math.min(0.1, this.state.velocityY));
            }
        }
    }
}

// Tiny fish school - multiple frames for swimming animation
const tinyFishFrames = [
    `gb`,  // Frame 1: fish with tail
    `g5`,  // Frame 2: fish with tail moving
    `gb`,  // Frame 3: same as frame 1
    `gg`   // Frame 4: fish body only
];

export class TinyFishSchoolSprite extends SpriteAnimator {
    private currentFrame: number = 0;
    private schoolOffset: { x: number, y: number };
    
    constructor(x: number, y: number, offsetX: number = 0, offsetY: number = 0, speedX: number = 0.1, speedY: number = 0.03) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: speedX,
            velocityY: speedY
        };

        super(tinyFishFrames[0], initialState, {
            wrapAround: true,
            minX: 0,
            minY: 2
        });

        // Offset for schooling behavior - each fish slightly offset from the leader
        this.schoolOffset = { x: offsetX, y: offsetY };
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Update animation frame
        this.currentFrame = Math.floor(frameNr / 10) % tinyFishFrames.length;
        this.sprite = tinyFishFrames[this.currentFrame];

        // Recalculate sprite dimensions for current frame
        const lines = this.sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 0;

        // Add gentle water flow effect (preserve direction)
        if (this.state.velocityX !== undefined) {
            const direction = this.state.velocityX >= 0 ? 1 : -1;
            this.state.velocityX = Math.abs(this.state.velocityX) * 0.35 + 0.08 * direction;
        }

        super.update(frameNr, boxWidth, boxHeight);

        // Subtle schooling movement - slight variations
        if (frameNr % 40 === 0) {
            if (this.state.velocityX !== undefined) {
                const direction = this.state.velocityX >= 0 ? 1 : -1;
                this.state.velocityX += (Math.random() - 0.5) * 0.03;
                this.state.velocityX = Math.max(0.06 * direction, Math.min(0.15 * direction, this.state.velocityX));
            }
            if (this.state.velocityY !== undefined) {
                this.state.velocityY += (Math.random() - 0.5) * 0.03;
                this.state.velocityY = Math.max(-0.08, Math.min(0.08, this.state.velocityY));
            }
        }
    }

    // Apply school offset to position
    getSchoolPosition() {
        return {
            x: this.state.x + this.schoolOffset.x,
            y: this.state.y + this.schoolOffset.y
        };
    }
}

// Pot of Petunias - Hitchhiker's Guide to the Galaxy reference
// A falling potted plant thinking "Oh no, not again"
const potOfPetuniasSprite = `
.rrrr.
rrrrrr
rrrrrr
.5555.
.5555.
.5555.
..55..
`;

export class PotOfPetuniasSprite extends SpriteAnimator {
    private baseX: number;
    private fallSpeed: number = 0.15;
    private rotationPhase: number = 0;

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityY: 0
        };

        super(potOfPetuniasSprite, initialState, {
            bounceOnEdges: false,
            wrapAround: false
        });

        this.baseX = x;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Falling with gravity
        if (this.state.velocityY !== undefined) {
            this.state.velocityY += 0.005; // Acceleration
            this.state.velocityY = Math.min(this.state.velocityY, this.fallSpeed); // Terminal velocity
        }

        // Gentle tumbling motion
        this.rotationPhase = (this.rotationPhase + 0.03) % 6.28;
        this.state.x = this.baseX + Math.sin(this.rotationPhase) * 0.5;

        super.update(frameNr, boxWidth, boxHeight);

        // Reset to top when it falls off bottom (loop the fall)
        if (this.state.y > boxHeight + 10) {
            this.state.y = -10;
            this.state.velocityY = 0;
        }
    }
}

export const FishSprites = {
    TropicalFish: TropicalFishSprite,
    Goldfish: GoldfishSprite,
    Clownfish: ClownfishSprite,
    Angelfish: AngelfishSprite,
    NeonTetra: NeonTetraSprite,
    TinyFishSchool: TinyFishSchoolSprite,
    PotOfPetunias: PotOfPetuniasSprite
};

