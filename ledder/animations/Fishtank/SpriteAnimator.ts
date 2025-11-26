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
    private flippedSprite: string | null = null;
    private lastVelocitySign: number = 1;
    private isStatic: boolean = false; // Optimization flag for static sprites

    constructor(sprite: string, initialState: SpriteState, constraints: SpriteConstraints = {}) {
        this.sprite = sprite;
        this.state = initialState;
        this.constraints = constraints;
        
        // Calculate sprite dimensions from the sprite string (done once)
        const lines = sprite.trim().split('\n');
        this.spriteHeight = lines.length;
        this.spriteWidth = lines[0]?.length || 0;
        
        // Detect if sprite is static (no velocity)
        this.isStatic = (initialState.velocityX === 0 || initialState.velocityX === undefined) &&
                        (initialState.velocityY === 0 || initialState.velocityY === undefined);
    }

    /**
     * Update sprite position based on velocity (optimized with static check)
     */
    updatePosition() {
        if (this.isStatic) return; // Fast path for static sprites
        
        const vx = this.state.velocityX;
        const vy = this.state.velocityY;
        if (vx !== undefined) this.state.x += vx;
        if (vy !== undefined) this.state.y += vy;
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
            // Wrap around horizontally (optimized checks)
            const x = this.state.x;
            if (x >= maxX) {
                this.state.x = minX - this.spriteWidth;
            } else if (x < minX - this.spriteWidth) {
                this.state.x = maxX;
            }

            // Clamp vertical position (single operation)
            const y = this.state.y;
            if (y < minY) this.state.y = minY;
            else if (y > maxY) this.state.y = maxY;
        } else if (this.constraints.bounceOnEdges) {
            // Bounce on horizontal edges
            const x = this.state.x;
            const maxXBound = maxX - this.spriteWidth;
            if (x <= minX || x >= maxXBound) {
                if (this.state.velocityX !== undefined) {
                    this.state.velocityX = -this.state.velocityX;
                }
                // Clamp to prevent getting stuck outside bounds
                this.state.x = x < minX ? minX : (x > maxXBound ? maxXBound : x);
            }

            // Bounce on vertical edges
            const y = this.state.y;
            if (y <= minY || y >= maxY) {
                if (this.state.velocityY !== undefined) {
                    this.state.velocityY = -this.state.velocityY;
                }
                // Clamp to prevent getting stuck outside bounds
                this.state.y = y < minY ? minY : (y > maxY ? maxY : y);
            }
        } else {
            // Just clamp position (optimized)
            const x = this.state.x;
            const y = this.state.y;
            const maxXBound = maxX - this.spriteWidth;
            
            if (x < minX) this.state.x = minX;
            else if (x > maxXBound) this.state.x = maxXBound;
            
            if (y < minY) this.state.y = minY;
            else if (y > maxY) this.state.y = maxY;
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
     * Uses cached flipped sprite for better performance
     */
    render() {
        let spriteToRender = this.sprite;
        
        // Flip sprite if moving left (with caching)
        if (this.state.velocityX !== undefined && this.state.velocityX < 0) {
            // Only recalculate if direction changed or no cache
            const currentSign = this.state.velocityX < 0 ? -1 : 1;
            if (currentSign !== this.lastVelocitySign || this.flippedSprite === null) {
                this.flippedSprite = this.flipSpriteHorizontally(this.sprite);
                this.lastVelocitySign = currentSign;
            }
            spriteToRender = this.flippedSprite;
        } else {
            this.lastVelocitySign = 1;
        }
        
        // Use bitwise OR for faster rounding
        return new DrawAsciiArtColor(
            (this.state.x + 0.5) | 0,
            (this.state.y + 0.5) | 0,
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
