import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"

export class PostFX {
    private frameCounter: number = 0;
    private motionBlurHistory: PixelList[] = [];
    private readonly MAX_BLUR_FRAMES = 5;
    
    /**
     * Apply post-processing effects to a pixel list
     */
    apply(
        pixels: PixelList,
        boxWidth: number,
        boxHeight: number,
        options: {
            antiAliasing: boolean;
            colorCycling: boolean;
            colorCycleSpeed: number;
            tunnelWarp: boolean;
            tunnelIntensity: number;
            tunnelSpeed: number;
            motionBlur: boolean;
            motionBlurAmount: number;
            fire: boolean;
            fireIntensity: number;
            fireSpeed: number;
        }
    ): PixelList {
        let result = pixels;
        
        // Apply tunnel/warp effect first (affects positions)
        if (options.tunnelWarp) {
            result = this.applyTunnelWarp(result, boxWidth, boxHeight, options.tunnelIntensity, options.tunnelSpeed);
        }
        
        // Apply fire effect (affects colors and adds flickering)
        if (options.fire) {
            result = this.applyFire(result, boxWidth, boxHeight, options.fireIntensity, options.fireSpeed);
        }
        
        // Apply color cycling (affects colors)
        if (options.colorCycling) {
            result = this.applyColorCycling(result, options.colorCycleSpeed);
        }
        
        // Apply motion blur (temporal smoothing)
        if (options.motionBlur) {
            result = this.applyMotionBlur(result, options.motionBlurAmount);
        }
        
        // Apply anti-aliasing last (spatial smoothing)
        if (options.antiAliasing) {
            result = this.applyAntiAliasing(result, boxWidth, boxHeight);
        }
        
        this.frameCounter++;
        return result;
    }
    
    /**
     * Apply anti-aliasing by averaging neighboring pixels
     */
    private applyAntiAliasing(pixels: PixelList, boxWidth: number, boxHeight: number): PixelList {
        const pixelMap = new Map<string, Pixel>();
        
        // Build pixel map
        pixels.forEachPixel((pixel) => {
            const key = `${Math.floor(pixel.x)},${Math.floor(pixel.y)}`;
            pixelMap.set(key, pixel);
        });
        
        const result = new PixelList();
        
        pixels.forEachPixel((pixel) => {
            const x = Math.floor(pixel.x);
            const y = Math.floor(pixel.y);
            
            // Sample neighboring pixels
            const neighbors: Pixel[] = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const key = `${x + dx},${y + dy}`;
                    const neighbor = pixelMap.get(key);
                    if (neighbor) {
                        neighbors.push(neighbor);
                    }
                }
            }
            
            if (neighbors.length > 1) {
                // Average colors
                let r = 0, g = 0, b = 0, a = 0;
                for (const n of neighbors) {
                    r += n.color.r;
                    g += n.color.g;
                    b += n.color.b;
                    a += n.color.a;
                }
                const count = neighbors.length;
                const avgColor = new Color(
                    Math.round(r / count),
                    Math.round(g / count),
                    Math.round(b / count),
                    a / count
                );
                result.add(new Pixel(x, y, avgColor));
            } else {
                result.add(pixel);
            }
        });
        
        return result;
    }
    
    /**
     * Apply color cycling effect
     */
    private applyColorCycling(pixels: PixelList, speed: number): PixelList {
        const result = new PixelList();
        const hueShift = (this.frameCounter * speed) % 360;
        
        pixels.forEachPixel((pixel) => {
            const color = pixel.color;
            
            // Convert RGB to HSV
            const r = color.r / 255;
            const g = color.g / 255;
            const b = color.b / 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            
            let h = 0;
            const s = max === 0 ? 0 : delta / max;
            const v = max;
            
            if (delta !== 0) {
                if (max === r) {
                    h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
                } else if (max === g) {
                    h = ((b - r) / delta + 2) / 6;
                } else {
                    h = ((r - g) / delta + 4) / 6;
                }
            }
            
            // Shift hue
            h = (h * 360 + hueShift) % 360;
            
            // Convert back to RGB
            const c = v * s;
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
            const m = v - c;
            
            let rNew = 0, gNew = 0, bNew = 0;
            
            if (h < 60) {
                rNew = c; gNew = x; bNew = 0;
            } else if (h < 120) {
                rNew = x; gNew = c; bNew = 0;
            } else if (h < 180) {
                rNew = 0; gNew = c; bNew = x;
            } else if (h < 240) {
                rNew = 0; gNew = x; bNew = c;
            } else if (h < 300) {
                rNew = x; gNew = 0; bNew = c;
            } else {
                rNew = c; gNew = 0; bNew = x;
            }
            
            const newColor = new Color(
                Math.round((rNew + m) * 255),
                Math.round((gNew + m) * 255),
                Math.round((bNew + m) * 255),
                color.a
            );
            
            result.add(new Pixel(pixel.x, pixel.y, newColor));
        });
        
        return result;
    }
    
    /**
     * Apply tunnel/warp distortion effect
     */
    private applyTunnelWarp(pixels: PixelList, boxWidth: number, boxHeight: number, intensity: number, speed: number): PixelList {
        const result = new PixelList();
        const centerX = boxWidth / 2;
        const centerY = boxHeight / 2;
        const time = this.frameCounter * speed * 0.01;
        
        pixels.forEachPixel((pixel) => {
            // Calculate distance and angle from center
            const dx = pixel.x - centerX;
            const dy = pixel.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Apply tunnel distortion
            const warpAmount = intensity * 0.1;
            const distortedDistance = distance + Math.sin(distance * 0.3 + time) * warpAmount;
            const distortedAngle = angle + Math.sin(distance * 0.2 + time * 0.5) * warpAmount * 0.1;
            
            // Calculate new position
            const newX = centerX + Math.cos(distortedAngle) * distortedDistance;
            const newY = centerY + Math.sin(distortedAngle) * distortedDistance;
            
            // Keep within bounds
            if (newX >= 0 && newX < boxWidth && newY >= 0 && newY < boxHeight) {
                result.add(new Pixel(newX, newY, pixel.color));
            }
        });
        
        return result;
    }
    
    /**
     * Apply motion blur by blending multiple frames
     */
    private applyMotionBlur(pixels: PixelList, amount: number): PixelList {
        // Add current frame to history
        this.motionBlurHistory.push(pixels);
        
        // Keep only the last N frames
        if (this.motionBlurHistory.length > this.MAX_BLUR_FRAMES) {
            this.motionBlurHistory.shift();
        }
        
        // If we don't have enough frames yet, just return current
        if (this.motionBlurHistory.length < 2) {
            return pixels;
        }
        
        const result = new PixelList();
        const pixelMap = new Map<string, { r: number; g: number; b: number; a: number; count: number }>();
        
        // Blend frames with decay
        const framesToBlend = Math.min(Math.ceil(amount), this.motionBlurHistory.length);
        for (let i = 0; i < framesToBlend; i++) {
            const frameIndex = this.motionBlurHistory.length - 1 - i;
            const frame = this.motionBlurHistory[frameIndex];
            const weight = 1.0 / (i + 1); // Newer frames have more weight
            
            frame.forEachPixel((pixel) => {
                const key = `${Math.floor(pixel.x)},${Math.floor(pixel.y)}`;
                const existing = pixelMap.get(key);
                
                if (existing) {
                    existing.r += pixel.color.r * weight;
                    existing.g += pixel.color.g * weight;
                    existing.b += pixel.color.b * weight;
                    existing.a += pixel.color.a * weight;
                    existing.count += weight;
                } else {
                    pixelMap.set(key, {
                        r: pixel.color.r * weight,
                        g: pixel.color.g * weight,
                        b: pixel.color.b * weight,
                        a: pixel.color.a * weight,
                        count: weight
                    });
                }
            });
        }
        
        // Create averaged pixels
        pixelMap.forEach((data, key) => {
            const [x, y] = key.split(',').map(Number);
            const avgColor = new Color(
                Math.round(data.r / data.count),
                Math.round(data.g / data.count),
                Math.round(data.b / data.count),
                data.a / data.count
            );
            result.add(new Pixel(x, y, avgColor));
        });
        
        return result;
    }
    
    /**
     * Apply anti-aliased fire/flames effect
     */
    private applyFire(pixels: PixelList, boxWidth: number, boxHeight: number, intensity: number, speed: number): PixelList {
        const result = new PixelList();
        const time = this.frameCounter * speed * 0.1;
        
        pixels.forEachPixel((pixel) => {
            const color = pixel.color;
            
            // Calculate flame effect based on position and time
            const flameNoise = this.noise2D(pixel.x * 0.1, pixel.y * 0.1 + time);
            const flickerNoise = this.noise2D(pixel.x * 0.3 + time * 2, pixel.y * 0.3);
            
            // Determine if this pixel should have fire effect
            const fireChance = (1.0 - (pixel.y / boxHeight)) * intensity * 0.1; // More fire at bottom
            const shouldFire = flameNoise > (0.3 - fireChance);
            
            if (shouldFire) {
                // Convert to fire colors (red/orange/yellow)
                const brightness = (flameNoise + 1) * 0.5; // 0 to 1
                const flicker = (flickerNoise + 1) * 0.5;
                
                // Fire gradient: red -> orange -> yellow -> white
                let r = 255;
                let g = Math.floor(brightness * 200 + flicker * 55);
                let b = Math.floor(brightness * brightness * 100);
                
                // Add original color tint
                const tintAmount = 0.3;
                r = Math.min(255, Math.floor(r * (1 - tintAmount) + color.r * tintAmount));
                g = Math.min(255, Math.floor(g * (1 - tintAmount) + color.g * tintAmount));
                b = Math.min(255, Math.floor(b * (1 - tintAmount) + color.b * tintAmount));
                
                const fireColor = new Color(r, g, b, color.a);
                result.add(new Pixel(pixel.x, pixel.y, fireColor));
                
                // Add anti-aliased glow around fire
                if (brightness > 0.6) {
                    const glowIntensity = (brightness - 0.6) * 2.5;
                    this.addGlowPixels(result, pixel.x, pixel.y, fireColor, glowIntensity, boxWidth, boxHeight);
                }
            } else {
                result.add(pixel);
            }
        });
        
        return result;
    }
    
    /**
     * Add anti-aliased glow pixels around a point
     */
    private addGlowPixels(result: PixelList, x: number, y: number, color: Color, intensity: number, maxWidth: number, maxHeight: number): void {
        const offsets = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];
        
        for (const offset of offsets) {
            const glowX = x + offset.dx;
            const glowY = y + offset.dy;
            
            if (glowX >= 0 && glowX < maxWidth && glowY >= 0 && glowY < maxHeight) {
                const glowAlpha = color.a * intensity * 0.5;
                const glowColor = new Color(color.r, color.g, color.b, glowAlpha);
                result.add(new Pixel(glowX, glowY, glowColor));
            }
        }
    }
    
    /**
     * Simple 2D Perlin-like noise function
     */
    private noise2D(x: number, y: number): number {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
        return (n - Math.floor(n)) * 2 - 1; // -1 to 1
    }
}
