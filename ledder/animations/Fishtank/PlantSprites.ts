import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"

const tallPlantSprite = `
..GG..
.GGGG.
.gggg.
.gggg.
.G22G.
..gg..
.gg2g.
.g22g.
..gg..
.2gg2.
`;

export class TallPlantSprite extends SpriteAnimator {
    private baseX: number;
    private swaySpeed: number = 15;
    private phaseOffset: number;

    constructor(x: number, y: number, swayAmount: number = 1.5) {
        const initialState: SpriteState = {
            x,
            y,
            swayAmount
        };

        super(tallPlantSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
        this.phaseOffset = Math.random() * 6.28; // 2*PI pre-calculated
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Plants don't move, they sway (optimized calculation)
        this.state.x = this.baseX + Math.sin(frameNr / this.swaySpeed + this.phaseOffset) * (this.state.swayAmount || 1.5);
    }
}

const shortPlantSprite = `
.GGG.
Gg2gG
.g2g.
g222g
.2g2.
..2..
`;

export class ShortPlantSprite extends SpriteAnimator {
    private baseX: number;
    private swaySpeed: number = 20;
    private phaseOffset: number;

    constructor(x: number, y: number, swayAmount: number = 1.0) {
        const initialState: SpriteState = {
            x,
            y,
            swayAmount
        };

        super(shortPlantSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
        this.phaseOffset = Math.random() * 6.28;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Plants don't move, they sway (optimized)
        this.state.x = this.baseX + Math.sin(frameNr / this.swaySpeed + this.phaseOffset) * (this.state.swayAmount || 1.0);
    }
}

// Bush sprite - round and bushy
const bushSprite = `
..GGG..
.GgggG.
Gg222gG
G22g22G
.2ggg2.
..222..
`;

export class BushSprite extends SpriteAnimator {
    private baseX: number;
    private swaySpeed: number = 25;
    private phaseOffset: number;

    constructor(x: number, y: number, swayAmount: number = 0.5) {
        const initialState: SpriteState = {
            x,
            y,
            swayAmount
        };

        super(bushSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
        this.phaseOffset = Math.random() * 6.28;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Gentle sway (optimized)
        this.state.x = this.baseX + Math.sin(frameNr / this.swaySpeed + this.phaseOffset) * (this.state.swayAmount || 0.5);
    }
}

// Small bush
const smallBushSprite = `
.G2G.
2ggg2
.222.
`;

export class SmallBushSprite extends SpriteAnimator {
    private baseX: number;
    private swaySpeed: number = 30;
    private phaseOffset: number;

    constructor(x: number, y: number, swayAmount: number = 0.3) {
        const initialState: SpriteState = {
            x,
            y,
            swayAmount
        };

        super(smallBushSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
        this.phaseOffset = Math.random() * 6.28;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Gentle sway (optimized)
        this.state.x = this.baseX + Math.sin(frameNr / this.swaySpeed + this.phaseOffset) * (this.state.swayAmount || 0.3);
    }
}

// Pine tree - classic triangle shape
const pineTreeSprite = `
...G...
..GgG..
.Gg2gG.
.g222g.
..2g2..
.2ggg2.
22ggg22
2g222g2
..777..
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
..G..
.G2G.
2g2g2
.222.
..7..
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
..GgggG..
.Gg222gG.
G2g2g2g2G
2gg2G2gg2
.2ggggg2.
...777...
...575...
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
.Gg2gG.
G2ggg2G
22g2g22
..757..
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
.G.2.
2gg2.
.g2g.
`;

export class GrassSprite extends SpriteAnimator {
    private baseX: number;
    private swaySpeed: number = 10;
    private phaseOffset: number;

    constructor(x: number, y: number, swayAmount: number = 0.8) {
        const initialState: SpriteState = {
            x,
            y,
            swayAmount
        };

        super(grassSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
        this.phaseOffset = Math.random() * 6.28;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Grass sways more quickly (optimized)
        this.state.x = this.baseX + Math.sin(frameNr / this.swaySpeed + this.phaseOffset) * (this.state.swayAmount || 0.8);
    }
}

// Flower sprite
const flowerSprite = `
.y.
ryr
.2.
.g.
`;

export class FlowerSprite extends SpriteAnimator {
    private baseX: number;
    private swaySpeed: number = 18;
    private phaseOffset: number;

    constructor(x: number, y: number, swayAmount: number = 0.5) {
        const initialState: SpriteState = {
            x,
            y,
            swayAmount
        };

        super(flowerSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
        this.phaseOffset = Math.random() * 6.28;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Optimized sway calculation
        this.state.x = this.baseX + Math.sin(frameNr / this.swaySpeed + this.phaseOffset) * (this.state.swayAmount || 0.5);
    }
}

// Cactus - doesn't sway
const cactusSprite = `
..2..
.2g2.
g2g2.
.gg2.
.2gg.
.g2g.
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
.G.2.G.
2gggg2.
.2g2g2.
..222..
...2...
`;

export class FernSprite extends SpriteAnimator {
    private baseX: number;
    private swaySpeed: number = 12;
    private phaseOffset: number;

    constructor(x: number, y: number, swayAmount: number = 1.2) {
        const initialState: SpriteState = {
            x,
            y,
            swayAmount
        };

        super(fernSprite, initialState, {
            bounceOnEdges: false
        });

        this.baseX = x;
        this.phaseOffset = Math.random() * 6.28;
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Ferns sway more (optimized)
        this.state.x = this.baseX + Math.sin(frameNr / this.swaySpeed + this.phaseOffset) * (this.state.swayAmount || 1.2);
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

