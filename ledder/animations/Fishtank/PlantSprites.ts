import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"

const tallPlantSprite = `
..gg..
.gggg.
.gggg.
.gggg.
.gggg.
..gg..
.gggg.
.gggg.
..gg..
.gggg.
`;

export class TallPlantSprite extends SpriteAnimator {
    private baseX: number;

    constructor(x: number, y: number, swayAmount: number = 1.5) {
        const initialState: SpriteState = {
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            swayAmount
        };

        super(tallPlantSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Plants don't move, they sway
        const sway = Math.sin(frameNr / 15 + (this.state.phase || 0)) * (this.state.swayAmount || 1.5);
        this.state.x = this.baseX + sway;
        
        // No need to call super.update() as we're handling position manually
    }
}

const shortPlantSprite = `
.ggg.
ggggg
.ggg.
ggggg
.ggg.
..g..
`;

export class ShortPlantSprite extends SpriteAnimator {
    private baseX: number;

    constructor(x: number, y: number, swayAmount: number = 1.0) {
        const initialState: SpriteState = {
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            swayAmount
        };

        super(shortPlantSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Plants don't move, they sway
        const sway = Math.sin(frameNr / 20 + (this.state.phase || 0)) * (this.state.swayAmount || 1.0);
        this.state.x = this.baseX + sway;
        
        // No need to call super.update() as we're handling position manually
    }
}

// Bush sprite - round and bushy
const bushSprite = `
..ggg..
.ggggg.
ggggggg
ggggggg
.ggggg.
..ggg..
`;

export class BushSprite extends SpriteAnimator {
    private baseX: number;

    constructor(x: number, y: number, swayAmount: number = 0.5) {
        const initialState: SpriteState = {
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            swayAmount
        };

        super(bushSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Gentle sway
        const sway = Math.sin(frameNr / 25 + (this.state.phase || 0)) * (this.state.swayAmount || 0.5);
        this.state.x = this.baseX + sway;
    }
}

// Small bush
const smallBushSprite = `
.ggg.
ggggg
.ggg.
`;

export class SmallBushSprite extends SpriteAnimator {
    private baseX: number;

    constructor(x: number, y: number, swayAmount: number = 0.3) {
        const initialState: SpriteState = {
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            swayAmount
        };

        super(smallBushSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        const sway = Math.sin(frameNr / 30 + (this.state.phase || 0)) * (this.state.swayAmount || 0.3);
        this.state.x = this.baseX + sway;
    }
}

// Pine tree - classic triangle shape
const pineTreeSprite = `
...g...
..ggg..
.ggggg.
.ggggg.
..ggg..
.ggggg.
ggggggg
ggggggg
..555..
..555..
`;

export class PineTreeSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y
        };

        super(pineTreeSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Trees don't move
    }
}

// Small pine tree
const smallPineSprite = `
..g..
.ggg.
ggggg
.ggg.
..5..
..5..
`;

export class SmallPineSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y
        };

        super(smallPineSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Trees don't move
    }
}

// Oak tree - round crown
const oakTreeSprite = `
..ggggg..
.ggggggg.
ggggggggg
ggggggggg
.ggggggg.
...555...
...555...
...555...
`;

export class OakTreeSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y
        };

        super(oakTreeSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Trees don't move
    }
}

// Small oak tree
const smallOakSprite = `
.ggggg.
ggggggg
ggggggg
..555..
..555..
`;

export class SmallOakSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y
        };

        super(smallOakSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Trees don't move
    }
}

// Grass tuft - very small
const grassSprite = `
.g.g.
gggg.
.ggg.
`;

export class GrassSprite extends SpriteAnimator {
    private baseX: number;

    constructor(x: number, y: number, swayAmount: number = 0.8) {
        const initialState: SpriteState = {
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            swayAmount
        };

        super(grassSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Grass sways more quickly
        const sway = Math.sin(frameNr / 10 + (this.state.phase || 0)) * (this.state.swayAmount || 0.8);
        this.state.x = this.baseX + sway;
    }
}

// Flower sprite
const flowerSprite = `
.r.
rrr
.g.
.g.
`;

export class FlowerSprite extends SpriteAnimator {
    private baseX: number;

    constructor(x: number, y: number, swayAmount: number = 0.5) {
        const initialState: SpriteState = {
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            swayAmount
        };

        super(flowerSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        const sway = Math.sin(frameNr / 18 + (this.state.phase || 0)) * (this.state.swayAmount || 0.5);
        this.state.x = this.baseX + sway;
    }
}

// Cactus - doesn't sway
const cactusSprite = `
..g..
.ggg.
gggg.
.ggg.
.ggg.
.ggg.
`;

export class CactusSprite extends SpriteAnimator {
    constructor(x: number, y: number) {
        const initialState: SpriteState = {
            x,
            y
        };

        super(cactusSprite, initialState, {
            bounceOnEdges: false
        });
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Cactus doesn't move at all
    }
}

// Fern - delicate and detailed
const fernSprite = `
.g.g.g.
gggggg.
.ggggg.
..ggg..
...g...
`;

export class FernSprite extends SpriteAnimator {
    private baseX: number;

    constructor(x: number, y: number, swayAmount: number = 1.2) {
        const initialState: SpriteState = {
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            swayAmount
        };

        super(fernSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Ferns sway more
        const sway = Math.sin(frameNr / 12 + (this.state.phase || 0)) * (this.state.swayAmount || 1.2);
        this.state.x = this.baseX + sway;
    }
}

export const PlantSprites = {
    TallPlant: TallPlantSprite,
    ShortPlant: ShortPlantSprite,
    Bush: BushSprite,
    SmallBush: SmallBushSprite,
    PineTree: PineTreeSprite,
    SmallPine: SmallPineSprite,
    OakTree: OakTreeSprite,
    SmallOak: SmallOakSprite,
    Grass: GrassSprite,
    Flower: FlowerSprite,
    Cactus: CactusSprite,
    Fern: FernSprite
};

