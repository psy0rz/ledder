import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"

export class TextPostFX {
    private previousFrame: Map<string, Pixel> | null = null;
    private frameCounter: number = 0;
    private motionBlurHistory: PixelList[] = [];
    private readonly MAX_BLUR_FRAMES = 5;
    
    /**
     * Apply text-specific post-processing effects
     */
    apply(
        pixels: PixelList,
        boxWidth: number,
        boxHeight: number,
        options: {
            motionAdaptiveAA: boolean;
            motionBlur: boolean;
            motionBlurAmount: number;
            subpixelRendering: boolean;
            sharpen: boolean;
            sharpenAmount: number;
            glow: boolean;
            glowIntensity: number;
            shadow: boolean;
            shadowOffsetX: number;
            shadowOffsetY: number;
            flames: boolean;
            flameCount: number;
            flameHeight: number;
            flameIntensity: number;
            flameWildness: number;
            plasma: boolean;
            plasmaPalette: string;
            plasmaSpeed: number;
            plasmaScale: number;
            plasmaIntensity: number;
            plasmaCycleSpeed: number;
        }
    ): PixelList {
        // Early exit if no effects enabled
        if (!options.motionAdaptiveAA && !options.motionBlur && !options.subpixelRendering &&
            !options.sharpen && !options.glow && !options.shadow && !options.flames && !options.plasma) {
            return pixels;
        }
        
        let result = pixels;
        
        // Apply shadow first (behind text)
        if (options.shadow) {
            result = this.applyShadow(result, options.shadowOffsetX, options.shadowOffsetY, boxWidth, boxHeight);
        }
        
        // Apply glow (around text)
        if (options.glow) {
            result = this.applyGlow(result, options.glowIntensity, boxWidth, boxHeight);
        }
        
        // Apply flames effect (rising flames from text)
        if (options.flames) {
            result = this.applyFlames(result, options.flameCount, options.flameHeight, options.flameIntensity, options.flameWildness, boxWidth, boxHeight);
        }
        
        // Apply plasma colors (smooth color variations across text)
        if (options.plasma) {
            result = this.applyPlasma(result, options.plasmaPalette, options.plasmaSpeed, options.plasmaScale, options.plasmaIntensity, options.plasmaCycleSpeed, boxWidth, boxHeight);
        }
        
        // Apply motion blur (temporal smoothing)
        if (options.motionBlur) {
            result = this.applyMotionBlur(result, options.motionBlurAmount);
        }
        
        // Apply motion-adaptive anti-aliasing
        if (options.motionAdaptiveAA) {
            result = this.applyMotionAdaptiveAA(result, boxWidth, boxHeight);
        }
        
        // Apply subpixel rendering (for LCD displays)
        if (options.subpixelRendering) {
            result = this.applySubpixelRendering(result, boxWidth, boxHeight);
        }
        
        // Apply sharpening last (enhances edges)
        if (options.sharpen) {
            result = this.applySharpen(result, options.sharpenAmount, boxWidth, boxHeight);
        }
        
        this.frameCounter++;
        return result;
    }
    
    /**
     * Motion-adaptive anti-aliasing that adjusts based on pixel movement speed
     */
    private applyMotionAdaptiveAA(pixels: PixelList, boxWidth: number, boxHeight: number): PixelList {
        const currentFrame = new Map<string, Pixel>();
        const velocityMap = new Map<string, { vx: number; vy: number }>();
        
        // Build current frame map
        pixels.forEachPixel((pixel) => {
            const key = `${Math.floor(pixel.x)},${Math.floor(pixel.y)}`;
            currentFrame.set(key, pixel);
        });
        
        // Calculate velocity for each pixel if we have previous frame
        if (this.previousFrame) {
            currentFrame.forEach((pixel, key) => {
                const [x, y] = key.split(',').map(Number);
                
                // Look for same-colored pixel in previous frame (tracking)
                let closestMatch = null;
                let closestDist = Infinity;
                
                // Search in a small radius
                for (let dy = -3; dy <= 3; dy++) {
                    for (let dx = -3; dx <= 3; dx++) {
                        const prevKey = `${x + dx},${y + dy}`;
                        const prevPixel = this.previousFrame.get(prevKey);
                        
                        if (prevPixel) {
                            const colorMatch = this.colorsSimilar(
                                new Color(pixel.color.r, pixel.color.g, pixel.color.b, pixel.color.a),
                                new Color(prevPixel.color.r, prevPixel.color.g, prevPixel.color.b, prevPixel.color.a)
                            );
                            
                            if (colorMatch) {
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                if (dist < closestDist) {
                                    closestDist = dist;
                                    closestMatch = { vx: -dx, vy: -dy };
                                }
                            }
                        }
                    }
                }
                
                if (closestMatch) {
                    velocityMap.set(key, closestMatch);
                } else {
                    velocityMap.set(key, { vx: 0, vy: 0 });
                }
            });
        }
        
        const result = new PixelList();
        
        pixels.forEachPixel((pixel) => {
            const x = Math.floor(pixel.x);
            const y = Math.floor(pixel.y);
            const key = `${x},${y}`;
            const velocity = velocityMap.get(key) || { vx: 0, vy: 0 };
            const speed = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
            
            // Adjust AA kernel size based on speed
            let kernelSize = 1; // Default: 3x3
            if (speed > 2) {
                kernelSize = 0; // Fast motion: no AA (sharp)
            } else if (speed > 1) {
                kernelSize = 1; // Medium motion: small AA
            } else if (speed < 0.5) {
                kernelSize = 2; // Slow/static: more AA for smoothness
            }
            
            if (kernelSize === 0) {
                // No AA, keep original
                result.add(pixel);
            } else {
                // Apply directional AA in motion direction
                const samples: Array<{ pixel: Pixel; weight: number }> = [];
                
                for (let dy = -kernelSize; dy <= kernelSize; dy++) {
                    for (let dx = -kernelSize; dx <= kernelSize; dx++) {
                        const neighborKey = `${x + dx},${y + dy}`;
                        const neighbor = currentFrame.get(neighborKey);
                        
                        if (neighbor) {
                            // Weight based on distance and alignment with motion
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            let weight = 1.0 / (1 + dist);
                            
                            // If moving, prefer pixels along motion direction
                            if (speed > 0.5) {
                                const dot = (dx * velocity.vx + dy * velocity.vy) / (speed + 0.001);
                                weight *= (1 + Math.max(0, dot) * 0.5);
                            }
                            
                            samples.push({ pixel: neighbor, weight });
                        }
                    }
                }
                
                if (samples.length > 1) {
                    let totalWeight = 0;
                    let r = 0, g = 0, b = 0, a = 0;
                    
                    for (const sample of samples) {
                        r += sample.pixel.color.r * sample.weight;
                        g += sample.pixel.color.g * sample.weight;
                        b += sample.pixel.color.b * sample.weight;
                        a += sample.pixel.color.a * sample.weight;
                        totalWeight += sample.weight;
                    }
                    
                    const avgColor = new Color(
                        Math.round(r / totalWeight),
                        Math.round(g / totalWeight),
                        Math.round(b / totalWeight),
                        a / totalWeight
                    );
                    result.add(new Pixel(x, y, avgColor));
                } else {
                    result.add(pixel);
                }
            }
        });
        
        // Store current frame for next iteration
        this.previousFrame = currentFrame;
        
        return result;
    }
    
    /**
     * Check if two colors are similar
     */
    private colorsSimilar(c1: Color, c2: Color, threshold: number = 40): boolean {
        const dr = Math.abs(c1.r - c2.r);
        const dg = Math.abs(c1.g - c2.g);
        const db = Math.abs(c1.b - c2.b);
        return (dr + dg + db) < threshold;
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
     * Subpixel rendering for LCD displays (RGB stripe)
     */
    private applySubpixelRendering(pixels: PixelList, boxWidth: number, boxHeight: number): PixelList {
        const pixelMap = new Map<string, Pixel>();
        
        pixels.forEachPixel((pixel) => {
            const key = `${Math.floor(pixel.x)},${Math.floor(pixel.y)}`;
            pixelMap.set(key, pixel);
        });
        
        const result = new PixelList();
        
        pixels.forEachPixel((pixel) => {
            const x = Math.floor(pixel.x);
            const y = Math.floor(pixel.y);
            
            // Get neighboring pixels
            const leftKey = `${x - 1},${y}`;
            const rightKey = `${x + 1},${y}`;
            const left = pixelMap.get(leftKey);
            const right = pixelMap.get(rightKey);
            
            // Subpixel rendering: shift R, G, B channels slightly
            let r = pixel.color.r;
            let g = pixel.color.g;
            let b = pixel.color.b;
            
            // Shift red channel from left neighbor
            if (left) {
                r = Math.round(r * 0.7 + left.color.r * 0.3);
            }
            
            // Shift blue channel from right neighbor
            if (right) {
                b = Math.round(b * 0.7 + right.color.b * 0.3);
            }
            
            const newColor = new Color(r, g, b, pixel.color.a);
            result.add(new Pixel(x, y, newColor));
        });
        
        return result;
    }
    
    /**
     * Apply sharpening to enhance text edges
     */
    private applySharpen(pixels: PixelList, amount: number, boxWidth: number, boxHeight: number): PixelList {
        const pixelMap = new Map<string, Pixel>();
        
        pixels.forEachPixel((pixel) => {
            const key = `${Math.floor(pixel.x)},${Math.floor(pixel.y)}`;
            pixelMap.set(key, pixel);
        });
        
        const result = new PixelList();
        
        // Sharpening kernel (Laplacian)
        const kernel = [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ];
        
        pixels.forEachPixel((pixel) => {
            const x = Math.floor(pixel.x);
            const y = Math.floor(pixel.y);
            
            let r = 0, g = 0, b = 0;
            let centerWeight = kernel[1][1];
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const key = `${x + dx},${y + dy}`;
                    const neighbor = pixelMap.get(key) || pixel;
                    const weight = kernel[dy + 1][dx + 1];
                    
                    r += neighbor.color.r * weight;
                    g += neighbor.color.g * weight;
                    b += neighbor.color.b * weight;
                }
            }
            
            // Blend with original based on amount
            const sharpR = Math.max(0, Math.min(255, r));
            const sharpG = Math.max(0, Math.min(255, g));
            const sharpB = Math.max(0, Math.min(255, b));
            
            const finalR = Math.round(pixel.color.r * (1 - amount) + sharpR * amount);
            const finalG = Math.round(pixel.color.g * (1 - amount) + sharpG * amount);
            const finalB = Math.round(pixel.color.b * (1 - amount) + sharpB * amount);
            
            const newColor = new Color(finalR, finalG, finalB, pixel.color.a);
            result.add(new Pixel(x, y, newColor));
        });
        
        return result;
    }
    
    /**
     * Apply glow effect around text
     */
    private applyGlow(pixels: PixelList, intensity: number, boxWidth: number, boxHeight: number): PixelList {
        const result = new PixelList();
        const addedGlow = new Set<string>();
        
        // First, add all original pixels
        pixels.forEachPixel((pixel) => {
            result.add(pixel);
        });
        
        // Then add glow around bright pixels
        pixels.forEachPixel((pixel) => {
            const brightness = (pixel.color.r + pixel.color.g + pixel.color.b) / 3;
            
            if (brightness > 100) { // Only glow bright pixels
                const x = Math.floor(pixel.x);
                const y = Math.floor(pixel.y);
                const glowRadius = Math.ceil(intensity);
                
                for (let dy = -glowRadius; dy <= glowRadius; dy++) {
                    for (let dx = -glowRadius; dx <= glowRadius; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= glowRadius) {
                            const glowX = x + dx;
                            const glowY = y + dy;
                            const key = `${glowX},${glowY}`;
                            
                            if (glowX >= 0 && glowX < boxWidth && glowY >= 0 && glowY < boxHeight && !addedGlow.has(key)) {
                                const falloff = 1 - (dist / glowRadius);
                                const glowAlpha = pixel.color.a * falloff * (intensity / 10);
                                const glowColor = new Color(
                                    pixel.color.r,
                                    pixel.color.g,
                                    pixel.color.b,
                                    glowAlpha
                                );
                                result.add(new Pixel(glowX, glowY, glowColor));
                                addedGlow.add(key);
                            }
                        }
                    }
                }
            }
        });
        
        return result;
    }
    
    /**
     * Apply drop shadow behind text
     */
    private applyShadow(pixels: PixelList, offsetX: number, offsetY: number, boxWidth: number, boxHeight: number): PixelList {
        const result = new PixelList();
        
        // Add shadow pixels first (behind)
        pixels.forEachPixel((pixel) => {
            const shadowX = Math.floor(pixel.x + offsetX);
            const shadowY = Math.floor(pixel.y + offsetY);
            
            if (shadowX >= 0 && shadowX < boxWidth && shadowY >= 0 && shadowY < boxHeight) {
                // Shadow is dark gray with some transparency
                const shadowColor = new Color(0, 0, 0, pixel.color.a * 0.5);
                result.add(new Pixel(shadowX, shadowY, shadowColor));
            }
        });
        
        // Add original pixels on top
        pixels.forEachPixel((pixel) => {
            result.add(pixel);
        });
        
        return result;
    }
    
    /**
     * Apply animated flames rising from text
     */
    private applyFlames(
        pixels: PixelList,
        flameCount: number,
        flameHeightPercent: number,
        intensity: number,
        wildness: number,
        boxWidth: number,
        boxHeight: number
    ): PixelList {
        const result = new PixelList();
        
        // Collect text pixel positions
        const textPixels: Array<{ x: number; y: number; brightness: number }> = [];
        pixels.forEachPixel((pixel) => {
            const brightness = (pixel.color.r + pixel.color.g + pixel.color.b) / 3;
            textPixels.push({ x: Math.floor(pixel.x), y: Math.floor(pixel.y), brightness });
        });
        
        // Add original text pixels
        pixels.forEachPixel((pixel) => {
            result.add(pixel);
        });
        
        // Generate realistic wide flames
        if (textPixels.length === 0) return result;
        
        const time = this.frameCounter * 0.05;
        
        // Calculate actual flame length based on display height
        const flameLength = Math.floor(boxHeight * (flameHeightPercent / 100));
        
        // Create multiple flame sources across text
        for (let i = 0; i < flameCount; i++) {
            // Pick a text pixel as flame source (changes slowly over time)
            const sourceIndex = Math.floor((this.noise2D(i * 100, time * 0.2) + 1) * 0.5 * textPixels.length) % textPixels.length;
            const source = textPixels[sourceIndex];
            
            // Generate wider, more realistic flames with multiple layers
            for (let h = 0; h < flameLength; h++) {
                const heightRatio = h / flameLength;
                
                // Flame gets wider as it rises (realistic fire behavior)
                const flameWidth = Math.floor(2 + h * 0.8 + wildness * 0.5);
                
                // Smooth vertical wobble and drift
                const yWobble = this.noise2D(i * 5 + h * 0.2, time * 0.8) * wildness * 0.3;
                const yDrift = Math.sin(time * 0.3 + i) * wildness * 0.15;
                
                // Create wider flame by drawing multiple horizontal pixels
                for (let w = -flameWidth; w <= flameWidth; w++) {
                    const widthRatio = Math.abs(w) / (flameWidth + 0.1);
                    
                    // Smooth horizontal wobble for natural flame movement
                    const xWobble = Math.sin(time * 0.6 + i * 0.3 + h * 0.15) * wildness * (0.8 + heightRatio * 1.5);
                    const xNoise = this.noise2D(i * 3 + w * 0.15, time * 0.4 + h * 0.1) * wildness * 0.8;
                    
                    const flameX = Math.floor(source.x + w + xWobble + xNoise);
                    const flameY = Math.floor(source.y - h + yWobble + yDrift);
                    
                    if (flameX >= 0 && flameX < boxWidth && flameY >= 0 && flameY < boxHeight) {
                        // Multi-layered noise for smooth turbulence
                        const turbulence1 = this.noise2D(flameX * 0.1, flameY * 0.1 + time * 0.5);
                        const turbulence2 = this.noise2D(flameX * 0.2, flameY * 0.2 + time * 0.7) * 0.5;
                        const turbulence = (turbulence1 + turbulence2) * 0.5;
                        
                        // Calculate flame intensity with turbulence
                        const baseIntensity = (1 - heightRatio) * (1 - widthRatio * 0.7);
                        const intensity = baseIntensity * (0.6 + turbulence * 0.4);
                        const flicker = 0.8 + this.noise2D(i * 7 + h * 0.5 + w * 0.2, time) * 0.2;
                        
                        if (baseIntensity > 0.1) { // Only draw visible flames
                            // Realistic fire colors: red at bottom, orange in middle, yellow at top
                            let r: number, g: number, b: number;
                            
                            // Bottom of flame: deep red/orange
                            // Middle: bright orange
                            // Top: yellow fading to white
                            
                            if (heightRatio < 0.3) {
                                // Bottom - deep red to orange
                                r = Math.floor(baseIntensity * 255 * flicker * intensity);
                                g = Math.floor(baseIntensity * (30 + heightRatio * 200) * flicker * intensity);
                                b = Math.floor(baseIntensity * 10 * flicker * intensity);
                            } else if (heightRatio < 0.7) {
                                // Middle - bright orange to yellow
                                r = Math.floor(baseIntensity * 255 * flicker * intensity);
                                g = Math.floor(baseIntensity * (100 + heightRatio * 155) * flicker * intensity);
                                b = Math.floor(baseIntensity * 15 * flicker * intensity);
                            } else {
                                // Top - yellow to white (hottest part)
                                r = Math.floor(baseIntensity * 255 * flicker * intensity);
                                g = Math.floor(baseIntensity * (200 + heightRatio * 55) * flicker * intensity);
                                b = Math.floor(baseIntensity * (heightRatio * 100) * flicker * intensity);
                            }
                            
                            // Alpha fades at edges and top
                            const edgeFade = 1 - widthRatio * 0.5;
                            const alpha = intensity * edgeFade * (1 - heightRatio * 0.6) * flicker;
                            
                            if (alpha > 0.05) {
                                const flameColor = new Color(r, g, b, Math.min(1, alpha));
                                result.add(new Pixel(flameX, flameY, flameColor));
                                
                                // Add extra glow layer for brighter core
                                if (widthRatio < 0.3 && heightRatio < 0.4 && intensity > 0.6) {
                                    const glowAlpha = alpha * 0.4;
                                    const glowR = Math.min(255, r + 50);
                                    const glowG = Math.min(255, g + 30);
                                    const glowColor = new Color(glowR, glowG, b, glowAlpha);
                                    result.add(new Pixel(flameX, flameY - 1, glowColor));
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return result;
    }
    
    /**
     * Apply smooth plasma color variations to text pixels
     */
    private applyPlasma(
        pixels: PixelList,
        palette: string,
        speed: number,
        scale: number,
        intensity: number,
        cycleSpeed: number,
        boxWidth: number,
        boxHeight: number
    ): PixelList {
        const result = new PixelList();
        const time = this.frameCounter * speed * 0.05;
        const colorCycle = this.frameCounter * cycleSpeed * 0.02;
        
        pixels.forEachPixel((pixel) => {
            const x = pixel.x;
            const y = pixel.y;
            
            // Multi-layered plasma calculation
            // Classic plasma uses multiple sine waves at different frequencies
            const plasma1 = Math.sin((x * scale * 0.1 + time) * 2) * 0.5 + 0.5;
            const plasma2 = Math.sin((y * scale * 0.1 + time * 1.3) * 2) * 0.5 + 0.5;
            const plasma3 = Math.sin(((x + y) * scale * 0.07 + time * 0.7) * 2) * 0.5 + 0.5;
            const plasma4 = Math.sin((Math.sqrt(x * x + y * y) * scale * 0.05 + time * 1.5) * 2) * 0.5 + 0.5;
            
            // Combine plasma layers with different weights
            const plasmaValue = (plasma1 + plasma2 + plasma3 + plasma4) / 4;
            
            // Get color based on selected palette
            const rgb = this.getPaletteColor(palette, plasmaValue, colorCycle, intensity);
            
            // Blend plasma color with original pixel color
            // Use original pixel's brightness as a mask
            const originalBrightness = (pixel.color.r + pixel.color.g + pixel.color.b) / (3 * 255);
            const blendFactor = intensity * originalBrightness;
            
            const r = Math.floor(pixel.color.r * (1 - blendFactor) + rgb.r * 255 * blendFactor);
            const g = Math.floor(pixel.color.g * (1 - blendFactor) + rgb.g * 255 * blendFactor);
            const b = Math.floor(pixel.color.b * (1 - blendFactor) + rgb.b * 255 * blendFactor);
            
            const plasmaColor = new Color(
                Math.max(0, Math.min(255, r)),
                Math.max(0, Math.min(255, g)),
                Math.max(0, Math.min(255, b)),
                pixel.color.a
            );
            
            result.add(new Pixel(x, y, plasmaColor));
        });
        
        return result;
    }
    
    /**
     * Get color from selected palette based on plasma value
     */
    private getPaletteColor(palette: string, plasmaValue: number, colorCycle: number, intensity: number): { r: number, g: number, b: number } {
        let hue: number, saturation: number, value: number;
        
        switch (palette) {
            case "rainbow":
                // Full spectrum rainbow
                hue = (plasmaValue + colorCycle) % 1.0;
                saturation = 0.8 * intensity;
                value = 0.5 + plasmaValue * 0.5;
                break;
                
            case "fire":
                // Red -> Orange -> Yellow -> White (like flames)
                hue = (plasmaValue * 0.15 + colorCycle * 0.1) % 1.0; // 0-0.15 (red to yellow range)
                saturation = 0.9 * intensity * (1 - plasmaValue * 0.3); // Less saturated at peaks (whiter)
                value = 0.3 + plasmaValue * 0.7; // Bright
                break;
                
            case "ocean":
                // Deep blue -> Cyan -> Light blue
                hue = (0.5 + plasmaValue * 0.15 + colorCycle * 0.05) % 1.0; // Cyan to blue range
                saturation = 0.7 * intensity;
                value = 0.4 + plasmaValue * 0.6;
                break;
                
            case "forest":
                // Dark green -> Green -> Yellow-green
                hue = (0.25 + plasmaValue * 0.15 + colorCycle * 0.05) % 1.0; // Green range
                saturation = 0.6 * intensity;
                value = 0.3 + plasmaValue * 0.5;
                break;
                
            case "sunset":
                // Purple -> Orange -> Pink
                hue = (0.05 + plasmaValue * 0.1 + Math.sin(colorCycle) * 0.15) % 1.0;
                saturation = 0.8 * intensity;
                value = 0.5 + plasmaValue * 0.5;
                break;
                
            case "purple":
                // Deep purple -> Magenta -> Pink
                hue = (0.75 + plasmaValue * 0.15 + colorCycle * 0.05) % 1.0; // Purple/magenta range
                saturation = 0.7 * intensity;
                value = 0.4 + plasmaValue * 0.6;
                break;
                
            case "cyber":
                // Cyan -> Magenta alternating
                hue = plasmaValue > 0.5 
                    ? (0.5 + (plasmaValue - 0.5) * 0.1 + colorCycle * 0.1) % 1.0  // Cyan
                    : (0.83 + plasmaValue * 0.1 + colorCycle * 0.1) % 1.0;        // Magenta
                saturation = 0.9 * intensity;
                value = 0.6 + plasmaValue * 0.4;
                break;
                
            case "neon":
                // Bright saturated colors (pink, green, blue, yellow)
                const neonColors = [0.0, 0.3, 0.5, 0.83]; // Red, green, cyan, magenta
                const neonIndex = Math.floor(plasmaValue * 4) % 4;
                hue = (neonColors[neonIndex] + colorCycle * 0.1) % 1.0;
                saturation = 1.0 * intensity;
                value = 0.8 + plasmaValue * 0.2; // Very bright
                break;
                
            case "lava":
                // Black -> Red -> Orange -> Yellow
                hue = (plasmaValue * 0.12 + colorCycle * 0.05) % 1.0; // Red to yellow
                saturation = 1.0 * intensity * (1 - plasmaValue * 0.2);
                value = plasmaValue * plasmaValue; // Darker at low values (black lava)
                break;
                
            case "ice":
                // White -> Light blue -> Deep blue
                hue = (0.55 + plasmaValue * 0.1 + colorCycle * 0.05) % 1.0; // Blue range
                saturation = 0.5 * intensity * plasmaValue; // Less saturated (whiter) at low values
                value = 0.7 + plasmaValue * 0.3;
                break;
                
            default:
                // Default to rainbow
                hue = (plasmaValue + colorCycle) % 1.0;
                saturation = 0.8 * intensity;
                value = 0.5 + plasmaValue * 0.5;
        }
        
        return this.hsvToRgb(hue, saturation, value);
    }
    
    /**
     * Convert HSV to RGB color space
     */
    private hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
        let r = 0, g = 0, b = 0;
        
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        
        return { r, g, b };
    }
    
    /**
     * Simple 2D Perlin-like noise function
     */
    private noise2D(x: number, y: number): number {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
        return (n - Math.floor(n)) * 2 - 1; // -1 to 1
    }
}
