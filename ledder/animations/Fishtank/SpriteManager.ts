import type SpriteAnimator from "./SpriteAnimator.js"
import PixelList from "../../PixelList.js"

/**
 * Manages a collection of sprites, handling updates and rendering
 */
export default class SpriteManager {
    private sprites: SpriteAnimator[] = [];

    /**
     * Add a sprite to the manager
     */
    addSprite(sprite: SpriteAnimator) {
        this.sprites.push(sprite);
    }

    /**
     * Add multiple sprites at once
     */
    addSprites(sprites: SpriteAnimator[]) {
        this.sprites.push(...sprites);
    }

    /**
     * Remove a sprite from the manager
     */
    removeSprite(sprite: SpriteAnimator) {
        const index = this.sprites.indexOf(sprite);
        if (index > -1) {
            this.sprites.splice(index, 1);
        }
    }

    /**
     * Remove all sprites
     */
    clear() {
        this.sprites = [];
    }

    /**
     * Update all sprites
     */
    update(frameNr: number, boxWidth: number, boxHeight: number) {
        for (const sprite of this.sprites) {
            sprite.update(frameNr, boxWidth, boxHeight);
        }
    }

    /**
     * Render all sprites to a PixelList
     */
    render(): PixelList {
        const pixelList = new PixelList();
        for (const sprite of this.sprites) {
            pixelList.add(sprite.render());
        }
        return pixelList;
    }

    /**
     * Get all sprites
     */
    getSprites(): SpriteAnimator[] {
        return this.sprites;
    }

    /**
     * Get sprite count
     */
    count(): number {
        return this.sprites.length;
    }

    /**
     * Get sprite at index
     */
    get(index: number): SpriteAnimator | undefined {
        return this.sprites[index];
    }
}
