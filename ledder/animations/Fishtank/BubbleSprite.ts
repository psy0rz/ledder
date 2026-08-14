import SpriteAnimator from "./SpriteAnimator.js"
import type { SpriteState } from "./SpriteAnimator.js"

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

        // Start over at the bottom once fully out of view at the top, at a new random spot: otherwise
        // every bubble keeps rising in the same column forever. (state.y is the top row of the sprite,
        // so it has to travel its own height past the edge before the last row is gone)
        if (this.state.y < -this.spriteHeight) {
            this.state.y = boxHeight - 2;
            this.baseX = Math.random() * boxWidth;
            this.state.x = this.baseX;
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
