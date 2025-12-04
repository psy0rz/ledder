import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"

// Factory with smoking chimney - 12x10
const factoryFrames = [
    `
...5.....55.
..555...555.
.55555.5555.
555555555555
5rrr55rrr555
5www55www555
5www55www555
555555555555
`,
    `
..5......55.
..555...555.
.55555.5555.
555555555555
5rrr55rrr555
5www55www555
5www55www555
555555555555
`,
    `
...5.5...55.
..555...555.
.55555.5555.
555555555555
5rrr55rrr555
5www55www555
5www55www555
555555555555
`
];

export class FactorySprite extends SpriteAnimator {
    private currentFrame: number = 0;
    private frames: string[];
    private frameCount: number;
    private animSpeed: number = 8;

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        super(factoryFrames[0], initialState, {
            bounceOnEdges: false
        });

        this.frames = factoryFrames;
        this.frameCount = factoryFrames.length;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate smoke
        const newFrame = ((frameNr / this.animSpeed) | 0) % this.frameCount;
        if (newFrame !== this.currentFrame) {
            this.currentFrame = newFrame;
            this.sprite = this.frames[this.currentFrame];
            const lines = this.sprite.trim().split('\n');
            this.spriteHeight = lines.length;
            this.spriteWidth = lines[0]?.length || 1;
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// School building - 10x8
const schoolSprite = `
..yyyy..
.yyyyyy.
55555555
5ww55ww5
5ww55ww5
55555555
5ww5ww55
55555555
`;

export class SchoolSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        super(schoolSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Windmill with rotating blades - 9x11
const windmillFrames = [
    `
....w....
...www...
..55555..
.5555555.
555555555
..55555..
.w55555w.
..w555w..
..55555..
..55555..
..55555..
`,
    `
....w....
...w.w...
..w555w..
.5555555.
555555555
..55555..
..55555..
.w5555w..
..55555..
..55555..
..55555..
`,
    `
....w....
...www...
..55555..
.5555555.
555555555
..55555..
w.55555.w
.w5555w..
..55555..
..55555..
..55555..
`,
    `
....w....
...w.w...
.w5555...
.5555555.
555555555
..55555..
..55555..
w.5555.w.
..55555..
..55555..
..55555..
`
];

export class WindmillSprite extends SpriteAnimator {
    private currentFrame: number = 0;
    private frames: string[];

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        super(windmillFrames[0], initialState, {
            bounceOnEdges: false
        });

        this.frames = windmillFrames;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Rotate blades
        this.currentFrame = Math.floor(frameNr / 6) % this.frames.length;
        this.sprite = this.frames[this.currentFrame];

        const lines = this.sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 1;

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Statue of Liberty - 7x12
const libertyStatueSprite = `
...5...
..555..
.55555.
.5ggg5.
..ggg..
..ggg..
.ggggg.
ggggggg
..ggg..
..ggg..
.55555.
5555555
`;

export class LibertyStatueSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        super(libertyStatueSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Eiffel Tower - 9x11
const eiffelTowerSprite = `
....5....
...555...
..55555..
.5555555.
.5.555.5.
.5.555.5.
..55555..
..5.5.5..
.55.5.55.
.5555555.
555555555
`;

export class EiffelTowerSprite extends SpriteAnimator {
    private phase: number = 0;

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        super(eiffelTowerSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Gentle sway
        this.phase += 0.02;
        const sway = Math.sin(this.phase) * 0.3;
        this.state.x = (this.state.originalX || this.state.x) + sway;
        
        if (this.state.originalX === undefined) {
            this.state.originalX = this.state.x;
        }

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Castle with flags - 11x9
const castleFrames = [
    `
r.5.5.5.5.r
rr5r5r5r5rr
55555555555
5ww55ww55w5
5555555555.
55ww55ww555
5555555555.
555wwwww555
55555555555
`,
    `
.r5.5.5.5r.
rr5r5r5r5rr
55555555555
5ww55ww55w5
5555555555.
55ww55ww555
5555555555.
555wwwww555
55555555555
`
];

export class CastleSprite extends SpriteAnimator {
    private currentFrame: number = 0;
    private frames: string[];

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        super(castleFrames[0], initialState, {
            bounceOnEdges: false
        });

        this.frames = castleFrames;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate flags waving
        this.currentFrame = Math.floor(frameNr / 10) % this.frames.length;
        this.sprite = this.frames[this.currentFrame];

        const lines = this.sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 1;

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Church with bell tower - 9x10
const churchFrames = [
    `
...y5y...
..y555y..
.y55555y.
..55555..
..55555..
.5555555.
.5ww5ww5.
.5ww5ww5.
.5555555.
555555555
`,
    `
...555...
..y555y..
.y55555y.
..55555..
..55555..
.5555555.
.5ww5ww5.
.5ww5ww5.
.5555555.
555555555
`
];

export class ChurchSprite extends SpriteAnimator {
    private currentFrame: number = 0;
    private frames: string[];

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        super(churchFrames[0], initialState, {
            bounceOnEdges: false
        });

        this.frames = churchFrames;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Animate bell
        if (frameNr % 120 === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }
        this.sprite = this.frames[this.currentFrame];

        const lines = this.sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 1;

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Tower with blinking light - 7x9
const towerFrames = [
    `
...r...
..555..
..555..
.55555.
.55555.
.55555.
5555555
5555555
5555555
`,
    `
...y...
..555..
..555..
.55555.
.55555.
.55555.
5555555
5555555
5555555
`,
    `
.......
..555..
..555..
.55555.
.55555.
.55555.
5555555
5555555
5555555
`
];

export class TowerSprite extends SpriteAnimator {
    private currentFrame: number = 0;
    private frames: string[];

    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y,
            velocityX: 0,
            velocityY: 0
        };

        super(towerFrames[0], initialState, {
            bounceOnEdges: false
        });

        this.frames = towerFrames;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Blinking light at top
        const cycle = frameNr % 60;
        if (cycle < 15) {
            this.currentFrame = 0; // Red
        } else if (cycle < 30) {
            this.currentFrame = 1; // Yellow
        } else if (cycle < 45) {
            this.currentFrame = 0; // Red
        } else {
            this.currentFrame = 2; // Off
        }
        
        this.sprite = this.frames[this.currentFrame];

        const lines = this.sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 1;

        super.update(frameNr, boxWidth, boxHeight);
    }
}

// Export all building sprites
export const BuildingSprites = {
    Factory: FactorySprite,
    School: SchoolSprite,
    Windmill: WindmillSprite,
    LibertyStatue: LibertyStatueSprite,
    EiffelTower: EiffelTowerSprite,
    Castle: CastleSprite,
    Church: ChurchSprite,
    Tower: TowerSprite
};
