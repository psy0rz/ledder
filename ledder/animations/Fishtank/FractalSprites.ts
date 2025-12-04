import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import SpriteAnimator from "./SpriteAnimator.js"

/**
 * Fractal types supported by the sprite
 */
export enum FractalType {
    Mandelbrot = "Mandelbrot",
    Julia = "Julia"
}

/**
 * Hotspot coordinates for interesting fractal regions
 */
interface FractalHotspot {
    cx: number;
    cy: number;
    maxZoom: number;
}

/**
 * Fractal sprite that renders Mandelbrot or Julia sets
 * Optimized for real-time animation with configurable zoom and color palettes
 */
export class FractalSprite extends SpriteAnimator {
    private displayWidth: number;
    private displayHeight: number;
    private fractalType: FractalType;
    private colorPalette: Color[];
    private maxIterations: number;
    private zoom: number;
    private zoomSpeed: number;
    private currentHotspot: FractalHotspot;
    private hotspotIndex: number;
    private zoomDirection: number; // 1 = zoom in, -1 = zoom out
    private autoZoom: boolean;
    private colorShift: number;
    
    // Predefined interesting hotspots for both fractal types
    private static readonly MANDELBROT_HOTSPOTS: FractalHotspot[] = [
        { cx: -0.7499444695, cy: 0.0047777284, maxZoom: 9 },
        { cx: -0.1555437602, cy: -0.6501036500, maxZoom: 8 },
        { cx: -0.8181282518, cy: -0.1988497155, maxZoom: 9 },
        { cx: 0.3516449386, cy: -0.5813339105, maxZoom: 9 },
        { cx: 0.2467967239, cy: 0.5034225398, maxZoom: 9 },
        { cx: -1.1785276065, cy: 0.3009623114, maxZoom: 8 }
    ];
    
    private static readonly JULIA_HOTSPOTS: FractalHotspot[] = [
        { cx: -0.7480088846, cy: 0.0586412100, maxZoom: 2.80 },
        { cx: 0.3199798902, cy: 0.0377391147, maxZoom: 8 },
        { cx: 0.3053222341, cy: 0.0280303875, maxZoom: 8.05 },
        { cx: -1.4183762255, cy: -0.0005832247, maxZoom: 9 },
        { cx: -1.0658884716, cy: -0.2543128406, maxZoom: 9 },
        { cx: -1.1780691869, cy: 0.3001403188, maxZoom: 9 }
    ];

    constructor(
        displayWidth: number,
        displayHeight: number,
        fractalType: FractalType,
        colorPalette: Color[],
        maxIterations: number = 256
    ) {
        super("", { x: 0, y: 0 }, {});
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.fractalType = fractalType;
        this.colorPalette = colorPalette;
        this.maxIterations = maxIterations;
        this.zoom = 1.0;
        this.zoomSpeed = 0.01;
        this.hotspotIndex = 0;
        this.zoomDirection = 1;
        this.autoZoom = true;
        this.colorShift = 0;
        
        // Initialize with first hotspot
        const hotspots = this.getHotspots();
        this.currentHotspot = hotspots[0];
    }
    
    private getHotspots(): FractalHotspot[] {
        return this.fractalType === FractalType.Mandelbrot
            ? FractalSprite.MANDELBROT_HOTSPOTS
            : FractalSprite.JULIA_HOTSPOTS;
    }
    
    /**
     * Set fractal type and reset to first hotspot
     */
    setFractalType(type: FractalType) {
        if (this.fractalType !== type) {
            this.fractalType = type;
            this.hotspotIndex = 0;
            this.zoom = 1.0;
            this.zoomDirection = 1;
            const hotspots = this.getHotspots();
            this.currentHotspot = hotspots[0];
        }
    }
    
    /**
     * Set color palette
     */
    setColorPalette(palette: Color[]) {
        this.colorPalette = palette;
    }
    
    /**
     * Set maximum iterations (higher = more detail, slower)
     */
    setMaxIterations(iterations: number) {
        this.maxIterations = Math.max(16, Math.min(1024, iterations));
    }
    
    /**
     * Set zoom speed
     */
    setZoomSpeed(speed: number) {
        this.zoomSpeed = Math.max(0.001, Math.min(0.1, speed));
    }
    
    /**
     * Enable/disable automatic zooming
     */
    setAutoZoom(enabled: boolean) {
        this.autoZoom = enabled;
    }
    
    /**
     * Set manual zoom level
     */
    setZoom(zoom: number) {
        this.zoom = Math.max(0.01, zoom);
    }
    
    /**
     * Set hotspot manually
     */
    setHotspot(cx: number, cy: number, maxZoom: number = 9) {
        this.currentHotspot = { cx, cy, maxZoom };
        this.autoZoom = false; // Disable auto zoom when manually setting hotspot
    }
    
    /**
     * Calculate Mandelbrot set iteration count for a pixel
     */
    private mandelbrot(px: number, py: number): number {
        const zoom = 1 / this.zoom;
        const REAL_SET = {
            start: this.currentHotspot.cx - zoom,
            end: this.currentHotspot.cx + zoom
        };
        const IMAGINARY_SET = {
            start: this.currentHotspot.cy - zoom,
            end: this.currentHotspot.cy + zoom
        };
        
        const complex = {
            x: REAL_SET.start + (px / this.displayWidth) * (REAL_SET.end - REAL_SET.start),
            y: IMAGINARY_SET.start + (py / this.displayHeight) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
        };
        
        let z = { x: 0, y: 0 };
        let n = 0;
        let d = 0;
        
        while (d <= 4 && n < this.maxIterations) {
            const temp = {
                x: z.x * z.x - z.y * z.y,
                y: 2 * z.x * z.y
            };
            z = {
                x: temp.x + complex.x,
                y: temp.y + complex.y
            };
            d = z.x * z.x + z.y * z.y;
            n++;
        }
        
        return n;
    }
    
    /**
     * Calculate Julia set iteration count for a pixel
     */
    private julia(px: number, py: number): number {
        let newRe = 1.5 * (px - this.displayWidth / 2) / (0.5 * this.zoom * this.displayWidth);
        let newIm = (py - this.displayHeight / 2) / (0.5 * this.zoom * this.displayHeight);
        let n = 0;
        
        while (n < this.maxIterations) {
            const oldRe = newRe;
            const oldIm = newIm;
            
            newRe = oldRe * oldRe - oldIm * oldIm + this.currentHotspot.cx;
            newIm = 2 * oldRe * oldIm + this.currentHotspot.cy;
            
            if (newRe * newRe + newIm * newIm > 4) break;
            n++;
        }
        
        return n;
    }
    
    /**
     * Update zoom animation
     */
    update(frameNr: number, boxWidth: number, boxHeight: number) {
        super.update(frameNr, boxWidth, boxHeight);
        
        if (!this.autoZoom) return;
        
        const hotspots = this.getHotspots();
        const maxZoom = Math.pow(10, this.currentHotspot.maxZoom);
        
        // Update zoom
        if (this.zoomDirection === 1) {
            // Zooming in
            this.zoom *= (1 + this.zoomSpeed);
            if (this.zoom >= maxZoom) {
                this.zoomDirection = -1; // Start zooming out
            }
        } else {
            // Zooming out
            this.zoom *= (1 - this.zoomSpeed);
            if (this.zoom <= 1.0) {
                // Move to next hotspot
                this.hotspotIndex = (this.hotspotIndex + 1) % hotspots.length;
                this.currentHotspot = hotspots[this.hotspotIndex];
                this.zoom = 1.0;
                this.zoomDirection = 1;
            }
        }
        
        // Update color shift for palette cycling
        this.colorShift = (this.colorShift + 0.5) % this.colorPalette.length;
    }
    
    /**
     * Render the fractal
     */
    render(): PixelList {
        const pixels = new PixelList();
        
        if (this.colorPalette.length === 0) {
            return pixels;
        }
        
        // Calculate fractal for each pixel
        for (let y = 0; y < this.displayHeight; y++) {
            for (let x = 0; x < this.displayWidth; x++) {
                let iterations: number;
                
                if (this.fractalType === FractalType.Mandelbrot) {
                    iterations = this.mandelbrot(x, y);
                } else {
                    iterations = this.julia(x, y);
                }
                
                // Map iteration count to color
                if (iterations < this.maxIterations) {
                    const colorIndex = ((iterations + (this.colorShift | 0)) * 11) % this.colorPalette.length;
                    const color = this.colorPalette[colorIndex];
                    pixels.add(new Pixel(x, y, color));
                }
            }
        }
        
        return pixels;
    }
}

/**
 * Factory class for creating fractal sprites
 */
export class FractalSprites {
    static createFractal(
        displayWidth: number,
        displayHeight: number,
        fractalType: FractalType,
        colorPalette: Color[],
        maxIterations: number = 256
    ): FractalSprite {
        return new FractalSprite(displayWidth, displayHeight, fractalType, colorPalette, maxIterations);
    }
}
