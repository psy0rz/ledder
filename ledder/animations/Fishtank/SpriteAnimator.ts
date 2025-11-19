import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"

export interface SpriteState {
    x: number;
    y: number;
    velocityX?: number;
    velocityY?: number;
    phase?: number;
    [key: string]: any;
}

export interface SpriteConstraints {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    bounceOnEdges?: boolean;
    wrapAround?: boolean;
}

/**
 * Base class for sprite-based animations in the Fishtank
 * Provides common functionality for sprite rendering, movement, and constraints
 */
export default class SpriteAnimator {
    protected sprite: string;
    protected state: SpriteState;
    protected constraints: SpriteConstraints;
    protected spriteWidth: number;
    protected spriteHeight: number;

    constructor(sprite: string, initialState: SpriteState, constraints: SpriteConstraints = {}) {
        this.sprite = sprite;
        this.state = initialState;
        this.constraints = constraints;
        
        // Calculate sprite dimensions from the sprite string
        const lines = sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 0;
    }

    /**
     * Update sprite position based on velocity
     */
    updatePosition() {
        if (this.state.velocityX !== undefined) {
            this.state.x += this.state.velocityX;
        }
        if (this.state.velocityY !== undefined) {
            this.state.y += this.state.velocityY;
        }
    }

    /**
     * Apply constraints (bounce on edges, clamp position, wrap around)
     */
    applyConstraints(boxWidth: number, boxHeight: number) {
        const minX = this.constraints.minX ?? 0;
        const maxX = this.constraints.maxX ?? boxWidth;
        const minY = this.constraints.minY ?? 0;
        const maxY = this.constraints.maxY ?? (boxHeight - this.spriteHeight);

        if (this.constraints.wrapAround) {
            // Wrap around horizontally
            if (this.state.x >= maxX) {
                this.state.x = minX - this.spriteWidth;
            } else if (this.state.x < minX - this.spriteWidth) {
                this.state.x = maxX;
            }

            // Clamp vertical position
            this.state.y = Math.max(minY, Math.min(maxY, this.state.y));
        } else if (this.constraints.bounceOnEdges) {
            // Bounce on horizontal edges
            if (this.state.x <= minX || this.state.x >= maxX - this.spriteWidth) {
                if (this.state.velocityX !== undefined) {
                    this.state.velocityX *= -1;
                }
                // Clamp to prevent getting stuck outside bounds
                this.state.x = Math.max(minX, Math.min(maxX - this.spriteWidth, this.state.x));
            }

            // Bounce on vertical edges
            if (this.state.y <= minY || this.state.y >= maxY) {
                if (this.state.velocityY !== undefined) {
                    this.state.velocityY *= -1;
                }
                // Clamp to prevent getting stuck outside bounds
                this.state.y = Math.max(minY, Math.min(maxY, this.state.y));
            }
        } else {
            // Just clamp position
            this.state.x = Math.max(minX, Math.min(maxX - this.spriteWidth, this.state.x));
            this.state.y = Math.max(minY, Math.min(maxY, this.state.y));
        }
    }

    /**
     * Override this method to implement custom behavior each frame
     */
    update(frameNr: number, boxWidth: number, boxHeight: number) {
        this.updatePosition();
        this.applyConstraints(boxWidth, boxHeight);
    }

    /**
     * Flip sprite horizontally
     */
    protected flipSpriteHorizontally(sprite: string): string {
        const lines = sprite.trim().split('\n');
        const flipped = lines.map(line => {
            return line.split('').reverse().join('');
        });
        return flipped.join('\n');
    }

    /**
     * Render the sprite using DrawAsciiArtColor
     * Automatically flips sprite horizontally when moving left
     */
    render() {
        let spriteToRender = this.sprite;
        
        // Flip sprite if moving left
        if (this.state.velocityX !== undefined && this.state.velocityX < 0) {
            spriteToRender = this.flipSpriteHorizontally(this.sprite);
        }
        
        return new DrawAsciiArtColor(
            Math.round(this.state.x),
            Math.round(this.state.y),
            spriteToRender
        );
    }

    /**
     * Get current sprite state
     */
    getState(): SpriteState {
        return this.state;
    }

    /**
     * Update sprite state
     */
    setState(newState: Partial<SpriteState>) {
        this.state = { ...this.state, ...newState };
    }

    /**
     * Get sprite dimensions
     */
    getDimensions() {
        return {
            width: this.spriteWidth,
            height: this.spriteHeight
        };
    }
}
