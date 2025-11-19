import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import SpriteAnimator from "./SpriteAnimator.js"
import sharp from "sharp"
import drawAnimatedImage from "../../draw/DrawAnimatedImage.js"

/**
 * Image background sprite that loads and displays remote images
 */
export class ImageBackgroundSprite extends SpriteAnimator {
    private displayWidth: number;
    private displayHeight: number;
    private imageFrames: PixelList[] = [];
    private currentFrame: number = 0;

    constructor(displayWidth: number, displayHeight: number) {
        super("", { x: 0, y: 0 }, {});
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
    }

    async loadImageData(imageUrl: string, resizeMode: string = "cover", opacity: number = 0.7) {
        try {
            const response = await fetch(imageUrl);
            const imageBuffer = await response.arrayBuffer();
            
            const buffer = Buffer.from(imageBuffer);
            
            const sharpImg = await sharp(buffer, {
                animated: true,
                limitInputPixels: false
            }).resize(this.displayWidth, this.displayHeight, {
                fit: resizeMode as any,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            });

            // Get metadata to check if animated
            const sharpMetaData = await sharp(buffer, {
                animated: true,
                limitInputPixels: false
            }).metadata();

            // Generate frames
            const framesData = await drawAnimatedImage(
                { width: () => this.displayWidth, height: () => this.displayHeight } as any,
                0, 0, sharpImg
            );

            this.imageFrames = framesData.frames.map((frame: PixelList) => {
                const adjustedFrame = new PixelList();
                for (const item of frame) {
                    if (item instanceof Pixel) {
                        const newColor = new Color(item.color.r, item.color.g, item.color.b, opacity);
                        const adjustedPixel = new Pixel(item.x, item.y, newColor);
                        adjustedFrame.add(adjustedPixel);
                    }
                }
                return adjustedFrame;
            });

            this.currentFrame = 0;
        } catch (error) {
            console.error("Error loading image background:", error);
            this.imageFrames = [];
        }
    }

    update(frameNr: number, boxWidth: number, boxHeight: number) {
        // Cycle through animated frames if available
        if (this.imageFrames.length > 1) {
            this.currentFrame = frameNr % this.imageFrames.length;
        }
    }

    render(): PixelList {
        if (this.imageFrames.length > 0) {
            return this.imageFrames[this.currentFrame];
        }
        return new PixelList();
    }
}

// Factory function
export namespace BackgroundSprites {
    export function createImageBackground(displayWidth: number, displayHeight: number): ImageBackgroundSprite {
        return new ImageBackgroundSprite(displayWidth, displayHeight);
    }
}
