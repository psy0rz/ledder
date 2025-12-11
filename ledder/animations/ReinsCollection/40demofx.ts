import PixelBox from "../../PixelBox.js";
import Scheduler from "../../Scheduler.js";
import ControlGroup from "../../ControlGroup.js";
import Animator from "../../Animator.js";
import Pixel from "../../Pixel.js";
import Color from "../../Color.js";
import type ColorInterface from "../../ColorInterface.js";
import PixelList from "../../PixelList.js";
import DrawRectangle from "../../draw/DrawRectangle.js";
import DrawText from "../../draw/DrawText.js";
import DrawCircle from "../../draw/DrawCircle.js";
import { fonts } from "../../fonts.js";

export default class EightiesFx extends Animator {
    static category = "Retro"
    static title = "80s Demo AI"
    static description = "A retro demoscene-style animation with 80s and 90s effects including fractals, blobs, fire, and retro sprites"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        // Add debug control
        const debugControl = controls.switch("Debug logging", false);

        // Define multiple specialized color palettes

        // Smooth gradient palette for fractals and organic effects (256 colors)
        const smoothColors = Array.from({ length: 256 }, (_, i) => new Color(
            Math.floor(128 + 127 * Math.sin((i / 256) * Math.PI * 2)),
            Math.floor(128 + 127 * Math.sin((i / 256) * Math.PI * 2 + Math.PI / 3)),
            Math.floor(128 + 127 * Math.sin((i / 256) * Math.PI * 2 + 2 * Math.PI / 3))
        ));

        // Basic retro colors for classic effects (16 colors)
        const retroColors = [
            new Color(255, 0, 0),     // Red
            new Color(0, 255, 0),     // Green
            new Color(0, 0, 255),     // Blue
            new Color(255, 255, 0),   // Yellow
            new Color(255, 0, 255),   // Magenta
            new Color(0, 255, 255),   // Cyan
            new Color(255, 128, 0),   // Orange
            new Color(128, 0, 255),   // Purple
            new Color(255, 255, 255), // White
            new Color(192, 192, 192), // Light Gray
            new Color(128, 128, 128), // Gray
            new Color(64, 64, 64),    // Dark Gray
            new Color(128, 64, 0),    // Brown
            new Color(0, 128, 0),     // Dark Green
            new Color(0, 0, 128),     // Dark Blue
            new Color(128, 0, 0)      // Dark Red
        ];

        // Synthwave palette (64 colors)
        const synthwaveColors = Array.from({ length: 64 }, (_, i) => new Color(
            Math.floor(255 * Math.max(0, Math.sin((i / 64) * Math.PI))),
            Math.floor(128 + 127 * Math.sin((i / 64) * Math.PI * 2 + Math.PI / 2)),
            Math.floor(255 * Math.max(0, Math.cos((i / 64) * Math.PI)))
        ));

        // Fire palette (128 colors)
        const fireColors = Array.from({ length: 128 }, (_, i) => {
            const intensity = i / 127;
            return new Color(
                Math.min(255, Math.floor(255 * intensity)),
                Math.min(255, Math.floor(255 * intensity * 0.7)),
                Math.min(255, Math.floor(255 * intensity * 0.3))
            );
        });

        // Water/ice palette (128 colors)
        const waterColors = Array.from({ length: 128 }, (_, i) => {
            const intensity = i / 127;
            return new Color(
                Math.min(255, Math.floor(255 * intensity * 0.3)),
                Math.min(255, Math.floor(255 * intensity * 0.7)),
                Math.min(255, Math.floor(255 * intensity))
            );
        });

        const effectsList = new PixelList();
        const transitionList = new PixelList();
        box.add(effectsList);
        box.add(transitionList);

        let frame = 0;
        const effectDuration = 360; // Increased duration for calmer transitions
        const transitionDuration = 60; // Smooth transition period

        const intervalControl = controls.value("Animation interval", 2, 1, 10, 0.1); // Slower default
        const speedControl = controls.value("Effect speed", 0.7, 0.1, 2, 0.1); // Slower default
        const transitionControl = controls.value("Transition smoothness", 1, 0.1, 2, 0.1);

        // Individual effect toggle switches
        const effectToggles = {
            mandelbrot: controls.switch("Mandelbrot Fractal", true),
            plasma: controls.switch("Plasma Effect", true),
            metaballs: controls.switch("Metaballs", true),
            fire: controls.switch("Fire Effect", true),
            spiral: controls.switch("Spiral Fractal", true),
            cube: controls.switch("Rotating Cube", true),
            tunnel: controls.switch("Tunnel Effect", true),
            sprites: controls.switch("Retro Sprites", true),
            wave: controls.switch("Wave Distortion", true),
            starfield: controls.switch("Starfield 3D", true),
            colorCycle: controls.switch("Color Cycling", true),
            scrollText: controls.switch("Scrolling Text", true),
            julia: controls.switch("Julia Set", true),
            rotozoomer: controls.switch("Rotozoomer", true),
            maze3d: controls.switch("Maze 3D", true),
            lens: controls.switch("Lens Distortion", true),
            water: controls.switch("Water Effect", true),
            vectorBalls: controls.switch("Vector Balls", true),
            sierpinski: controls.switch("Sierpinski Triangle", true),
            dragon: controls.switch("Dragon Curve", true),
            escherStairs: controls.switch("Escher Stairs", true),
            escherTess: controls.switch("Escher Tessellation", true),
            wolfenstein: controls.switch("Wolfenstein 3D", true),
            burningShip: controls.switch("Burning Ship Fractal", true),
            mandala: controls.switch("Mandala Pattern", true),
            copper: controls.switch("Copper Bars", true),
            bobbing: controls.switch("Bobbing", true),
            phong: controls.switch("Phong 3D", true),
            checkerboard: controls.switch("Checkerboard 3D", true),
            dotMatrix: controls.switch("Dot Matrix", true),
            metamorphosis: controls.switch("Metamorphosis", true),
            galaga: controls.switch("Galaga", true),
            asteroids: controls.switch("Asteroids", true),
            tetris: controls.switch("Tetris", true),
            donkeyKong: controls.switch("Donkey Kong", true),
            zelda: controls.switch("Zelda", true),
            princeOfPersia: controls.switch("Prince of Persia", true),
            lemmings: controls.switch("Lemmings", true),
            boulderDash: controls.switch("Boulder Dash", true),
            polePosition: controls.switch("Pole Position", true)
        };

        // Helper function to check if an effect is enabled
        const isEffectEnabled = (index: number): boolean => {
            const effectKeys = Object.keys(effectToggles);
            if (index >= 0 && index < effectKeys.length) {
                const key = effectKeys[index] as keyof typeof effectToggles;
                return effectToggles[key].enabled;
            }
            return false;
        };

        // Helper function to find next enabled effect
        const findNextEnabledEffect = (currentIndex: number): number => {
            const effectKeys = Object.keys(effectToggles);
            const totalEffects = effectKeys.length;
            
            // If all effects are disabled, return current
            let enabledCount = 0;
            for (let i = 0; i < totalEffects; i++) {
                if (isEffectEnabled(i)) enabledCount++;
            }
            if (enabledCount === 0) return currentIndex;
            
            // Find next enabled effect
            let nextIndex = (currentIndex + 1) % totalEffects;
            let attempts = 0;
            while (!isEffectEnabled(nextIndex) && attempts < totalEffects) {
                nextIndex = (nextIndex + 1) % totalEffects;
                attempts++;
            }
            return nextIndex;
        };

        let currentDisplayedEffect = -1; // Track which effect is currently displayed
        let effectStartFrame = 0; // Track when the current effect started

        scheduler.intervalControlled(intervalControl, (frameNr) => {
            effectsList.clear();
            transitionList.clear();

            const totalCycle = effectDuration + transitionDuration;
            const cyclePosition = frame % totalCycle;
            
            // Get base effect index from all 40 effects
            const baseEffectIndex = Math.floor(frame / totalCycle) % 40;
            
            // Find the actual enabled effect to display
            let effectIndex = baseEffectIndex;
            if (!isEffectEnabled(effectIndex)) {
                effectIndex = findNextEnabledEffect(baseEffectIndex);
            }
            
            // Reset frame counter when switching to a new effect
            if (currentDisplayedEffect !== effectIndex) {
                effectStartFrame = frame;
                currentDisplayedEffect = effectIndex;
            }
            
            // Find next enabled effect for transitions
            const nextEffectIndex = findNextEnabledEffect(effectIndex);

            // Use relative frame for effect rendering (starts from 0 for each effect)
            const relativeFrame = frame - effectStartFrame;
            const adjustedFrame = relativeFrame * speedControl.value;

            // Determine if we're in transition period
            const isTransitioning = cyclePosition >= effectDuration;
            const transitionProgress = isTransitioning ? 
                (cyclePosition - effectDuration) / transitionDuration : 0;

            // Smooth easing function for transitions
            const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const smoothTransition = easeInOut(transitionProgress * transitionControl.value);

            if (isTransitioning) {
                // During transition, render both effects and blend them
                this.renderEffect(effectIndex, effectsList, box, smoothColors, retroColors, synthwaveColors, fireColors, waterColors, adjustedFrame, debugControl.enabled);
                this.renderEffect(nextEffectIndex, transitionList, box, smoothColors, retroColors, synthwaveColors, fireColors, waterColors, adjustedFrame, debugControl.enabled);

                // Apply fade transition
                this.applyFadeTransition(effectsList, transitionList, smoothTransition);
            } else {
                // Normal effect rendering
                this.renderEffect(effectIndex, effectsList, box, smoothColors, retroColors, synthwaveColors, fireColors, waterColors, adjustedFrame, debugControl.enabled);
            }

            frame++;
        });
    }

    private renderEffect(effectIndex: number, container: PixelList, box: PixelBox, smoothColors: Color[], retroColors: Color[], synthwaveColors: Color[], fireColors: Color[], waterColors: Color[], frame: number, debug: boolean = false) {
        if (debug) console.log(`[DEBUG] Starting renderEffect for effect ${effectIndex} at frame ${frame}`);

        // Validate inputs first
        if (!container || !box || !smoothColors || !retroColors || !synthwaveColors || !fireColors || !waterColors) {
            console.error(`[ERROR] Invalid parameters passed to renderEffect`);
            return;
        }

        if (box.width() <= 0 || box.height() <= 0) {
            console.error(`[ERROR] Invalid box dimensions: ${box.width()}x${box.height()}`);
            return;
        }

        // Display effect name at the top
        const effectNames = [
            "Mandelbrot Fractal", "Plasma Effect", "Metaballs", "Fire Effect", "Spiral Fractal",
            "Rotating Cube", "Tunnel Effect", "Retro Sprites", "Wave Distortion", "3D Starfield",
            "Color Cycling", "Scrolling Text", "Julia Set", "Rotozoomer", "3D Maze",
            "Lens Distortion", "Water Effect", "Vector Balls", "Sierpinski Triangle", "Dragon Curve",
            "Escher Stairs", "Escher Tessellation", "Wolfenstein 3D", "Burning Ship Fractal", "Mandala Pattern",
            "Copper Bars", "Bobbing", "Phong 3D", "Checkerboard 3D", "Dot Matrix", "Metamorphosis",
            "Galaga", "Asteroids", "Tetris", "Donkey Kong", "Zelda", "Prince of Persia", "Lemmings", "Boulder Dash", "Pole Position"
        ];

        const effectName = effectNames[effectIndex] || `Effect ${effectIndex}`;
        if (debug) console.log(`[DEBUG] Rendering effect: ${effectName} (index ${effectIndex})`);

        // Draw effect name at the top with error handling
        try {
            fonts['Tiny 3x3'].load(); // Use smaller font for titles
            if (retroColors && retroColors.length > 0) {
                container.add(new DrawText(2, 2, fonts['Tiny 3x3'], effectName, retroColors[0]));
            }
        } catch (error) {
            console.error(`[ERROR] Failed to draw effect name:`, error);
        }

        try {
            // Wrap each effect in individual try-catch to prevent one effect from crashing others
            switch(effectIndex) {
                case 0:
                    this.safeEffectCall(() => this.drawMandelbrotFractal(container, box, smoothColors, frame), "drawMandelbrotFractal", debug);
                    break;
                case 1:
                    this.safeEffectCall(() => this.drawPlasmaEffect(container, box, smoothColors, frame), "drawPlasmaEffect", debug);
                    break;
                case 2:
                    this.safeEffectCall(() => this.drawMetaballs(container, box, smoothColors, frame), "drawMetaballs", debug);
                    break;
                case 3:
                    this.safeEffectCall(() => this.drawFireEffect(container, box, fireColors, frame), "drawFireEffect", debug);
                    break;
                case 4:
                    this.safeEffectCall(() => this.drawSpiralFractal(container, box, smoothColors, frame), "drawSpiralFractal", debug);
                    break;
                case 5:
                    this.safeEffectCall(() => this.drawRotatingCube(container, box, retroColors, frame), "drawRotatingCube", debug);
                    break;
                case 6:
                    this.safeEffectCall(() => this.drawTunnelEffect(container, box, smoothColors, frame), "drawTunnelEffect", debug);
                    break;
                case 7:
                    this.safeEffectCall(() => this.drawRetroSprites(container, box, retroColors, frame), "drawRetroSprites", debug);
                    break;
                case 8:
                    this.safeEffectCall(() => this.drawWaveDistortion(container, box, synthwaveColors, frame), "drawWaveDistortion", debug);
                    break;
                case 9:
                    this.safeEffectCall(() => this.drawStarfield3D(container, box, retroColors, frame), "drawStarfield3D", debug);
                    break;
                case 10:
                    this.safeEffectCall(() => this.drawColorCycling(container, box, smoothColors, frame), "drawColorCycling", debug);
                    break;
                case 11:
                    this.safeEffectCall(() => this.drawScrollingText(container, box, retroColors, frame), "drawScrollingText", debug);
                    break;
                case 12:
                    this.safeEffectCall(() => this.drawJuliaSet(container, box, smoothColors, frame), "drawJuliaSet", debug);
                    break;
                case 13:
                    this.safeEffectCall(() => this.drawRotozoomer(container, box, retroColors, frame), "drawRotozoomer", debug);
                    break;
                case 14:
                    this.safeEffectCall(() => this.drawMaze3D(container, box, retroColors, frame), "drawMaze3D", debug);
                    break;
                case 15:
                    this.safeEffectCall(() => this.drawLensDistortion(container, box, smoothColors, frame), "drawLensDistortion", debug);
                    break;
                case 16:
                    this.safeEffectCall(() => this.drawWaterEffect(container, box, waterColors, frame), "drawWaterEffect", debug);
                    break;
                case 17:
                    this.safeEffectCall(() => this.drawVectorBalls(container, box, smoothColors, frame), "drawVectorBalls", debug);
                    break;
                case 18:
                    this.safeEffectCall(() => this.drawSierpinskiTriangle(container, box, retroColors, frame, debug), "drawSierpinskiTriangle", debug);
                    break;
                case 19:
                    this.safeEffectCall(() => this.drawDragonCurve(container, box, retroColors, frame, debug), "drawDragonCurve", debug);
                    break;
                case 20:
                    this.safeEffectCall(() => this.drawEscherStairs(container, box, retroColors, frame, debug), "drawEscherStairs", debug);
                    break;
                case 21:
                    this.safeEffectCall(() => this.drawEscherTessellation(container, box, retroColors, frame, debug), "drawEscherTessellation", debug);
                    break;
                case 22:
                    this.safeEffectCall(() => this.drawWolfenstein3D(container, box, retroColors, frame, debug), "drawWolfenstein3D", debug);
                    break;
                case 23:
                    this.safeEffectCall(() => this.drawBurningShipFractal(container, box, smoothColors, frame), "drawBurningShipFractal", debug);
                    break;
                case 24:
                    this.safeEffectCall(() => this.drawMandalaPattern(container, box, smoothColors, frame), "drawMandalaPattern", debug);
                    break;
                case 25:
                    this.safeEffectCall(() => this.drawCopperBars(container, box, smoothColors, frame), "drawCopperBars", debug);
                    break;
                case 26:
                    this.safeEffectCall(() => this.drawBobbing(container, box, smoothColors, frame), "drawBobbing", debug);
                    break;
                case 27:
                    this.safeEffectCall(() => this.drawPhong3D(container, box, smoothColors, frame), "drawPhong3D", debug);
                    break;
                case 28:
                    this.safeEffectCall(() => this.drawCheckerboard3D(container, box, retroColors, frame), "drawCheckerboard3D", debug);
                    break;
                case 29:
                    this.safeEffectCall(() => this.drawDotMatrix(container, box, retroColors, frame), "drawDotMatrix", debug);
                    break;
                case 30:
                    this.safeEffectCall(() => this.drawMetamorphosis(container, box, smoothColors, frame, debug), "drawMetamorphosis", debug);
                    break;
                case 31:
                    this.safeEffectCall(() => this.drawGalaga(container, box, retroColors, frame), "drawGalaga", debug);
                    break;
                case 32:
                    this.safeEffectCall(() => this.drawAsteroids(container, box, retroColors, frame), "drawAsteroids", debug);
                    break;
                case 33:
                    this.safeEffectCall(() => this.drawTetris(container, box, retroColors, frame), "drawTetris", debug);
                    break;
                case 34:
                    this.safeEffectCall(() => this.drawDonkeyKong(container, box, retroColors, frame), "drawDonkeyKong", debug);
                    break;
                case 35:
                    this.safeEffectCall(() => this.drawZelda(container, box, retroColors, frame), "drawZelda", debug);
                    break;
                case 36:
                    this.safeEffectCall(() => this.drawPrinceOfPersia(container, box, retroColors, frame), "drawPrinceOfPersia", debug);
                    break;
                case 37:
                    this.safeEffectCall(() => this.drawLemmings(container, box, retroColors, frame), "drawLemmings", debug);
                    break;
                case 38:
                    this.safeEffectCall(() => this.drawBoulderDash(container, box, retroColors, frame), "drawBoulderDash", debug);
                    break;
                case 39:
                    this.safeEffectCall(() => this.drawPolePosition(container, box, retroColors, frame), "drawPolePosition", debug);
                    break;
                default:
                    if (debug) console.log(`[DEBUG] Unknown effect index: ${effectIndex}`);
                    // Draw a simple fallback effect
                    this.safeEffectCall(() => {
                        for (let y = 0; y < Math.min(box.height(), 20); y++) {
                            for (let x = 0; x < Math.min(box.width(), 50); x++) {
                                if ((x + y + frame) % 10 === 0) {
                                    const color = retroColors && retroColors.length > 0 ? retroColors[0] : new Color(255, 255, 255);
                                    container.add(new Pixel(x, y, color));
                                }
                            }
                        }
                    }, "fallback", debug);
                    break;
            }
        } catch (error) {
            console.error(`[ERROR] Critical exception in effect ${effectIndex} (${effectName}):`, error);
            console.error(`[ERROR] Stack trace:`, error.stack);
            // Don't rethrow - just log and continue to next effect
        }

        if (debug) console.log(`[DEBUG] Finished renderEffect for effect ${effectIndex}`);
    }

    // Add new safety wrapper method
    private safeEffectCall(effectFunction: () => void, effectName: string, debug: boolean = false) {
        try {
            effectFunction();
            if (debug) console.log(`[DEBUG] Successfully completed ${effectName}`);
        } catch (error) {
            console.error(`[ERROR] Exception in ${effectName}:`, error);
            console.error(`[ERROR] Stack trace:`, error.stack);
            // Continue execution - don't let one effect break the whole animation
        }
    }

    drawWolfenstein3D(container: PixelList, box: PixelBox, colors: Color[], frame: number, debug: boolean = false) {
        if (debug) console.log(`[DEBUG] Starting drawWolfenstein3D optimized for ${box.width()}x${box.height()}`);
        const time = frame * 0.04;

        // Player movement simulation (simplified for small screen)
        const playerX = Math.sin(time * 0.3) * 2 + 4;
        const playerY = Math.cos(time * 0.2) * 2 + 4;
        const playerAngle = time * 0.15;

        // Simplified maze layout (8x8 for 64x32 screen)
        const maze = [
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,1],
            [1,0,2,0,0,0,1,1],
            [1,0,0,0,1,0,0,1],
            [1,1,0,1,1,0,1,1],
            [1,0,0,0,0,0,0,1],
            [1,0,3,0,1,0,2,1],
            [1,1,1,1,1,1,1,1]
        ];

        // Simplified raycasting - fewer rays for performance on small screen
        const rayStep = Math.max(1, Math.floor(box.width() / 32)); // Reduce detail for small screens

        for (let x = 0; x < box.width(); x += rayStep) {
            const rayAngle = playerAngle + (x - box.width() / 2) * 0.03; // Wider FOV for small screen
            const rayDx = Math.cos(rayAngle);
            const rayDy = Math.sin(rayAngle);

            let distance = 0;
            let hit = false;
            let wallType = 1;

            // Faster ray casting with larger steps
            while (!hit && distance < 12) {
                distance += 0.2; // Larger steps for performance
                const testX = Math.floor(playerX + rayDx * distance);
                const testY = Math.floor(playerY + rayDy * distance);

                if (testX >= 0 && testX < 8 && testY >= 0 && testY < 8) {
                    wallType = maze[testY][testX];
                    if (wallType > 0) {
                        hit = true;
                    }
                }
            }

            if (hit) {
                // Simplified wall height calculation
                const wallHeight = Math.floor(box.height() / (distance * 0.5 + 0.1));
                const wallStart = Math.max(0, Math.floor((box.height() - wallHeight) / 2));
                const wallEnd = Math.min(box.height(), wallStart + wallHeight);

                // Simple texture selection based on wall type
                let colorIndex;
                switch (wallType) {
                    case 1: colorIndex = 8; break;  // Gray walls
                    case 2: colorIndex = 4; break;  // Blue walls  
                    case 3: colorIndex = 12; break; // Brown walls
                    default: colorIndex = 0; break;
                }

                // Apply distance shading (simplified)
                const shadeFactor = Math.max(0.4, 1 - distance / 10);
                colorIndex = Math.floor(colorIndex * shadeFactor) % colors.length;

                // Draw wall column (fill gaps for small screen)
                for (let fillX = x; fillX < x + rayStep && fillX < box.width(); fillX++) {
                    for (let y = wallStart; y < wallEnd; y++) {
                        container.add(new Pixel(fillX, y, colors[colorIndex]));
                    }
                }

                // Simple floor/ceiling for small screen
                const floorColor = colors[2 % colors.length];
                const ceilingColor = colors[1 % colors.length];

                for (let fillX = x; fillX < x + rayStep && fillX < box.width(); fillX++) {
                    // Floor
                    for (let y = wallEnd; y < box.height(); y++) {
                        container.add(new Pixel(fillX, y, floorColor));
                    }
                    // Ceiling  
                    for (let y = 0; y < wallStart; y++) {
                        container.add(new Pixel(fillX, y, ceilingColor));
                    }
                }
            }
        }

        // Add simplified sprites optimized for small screen
        this.drawSimplifiedWolfensteinSprites(container, box, colors, playerX, playerY, playerAngle, time);

        if (debug) console.log(`[DEBUG] Completed optimized drawWolfenstein3D`);
    }

    drawSimplifiedWolfensteinSprites(container: PixelList, box: PixelBox, colors: Color[], playerX: number, playerY: number, playerAngle: number, time: number) {
        // Simplified monsters for small screen
        const monsters = [
            { x: 2, y: 2, type: 'guard' },
            { x: 6, y: 4, type: 'dog' },
            { x: 3, y: 6, type: 'officer' }
        ];

        monsters.forEach((monster, index) => {
            const dx = monster.x - playerX;
            const dy = monster.y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) - playerAngle;

            // Only draw if close and in view
            if (distance < 6 && Math.abs(angle) < Math.PI / 3) {
                const screenX = Math.floor(box.width() / 2 + Math.tan(angle) * box.width() / 3);
                const spriteSize = Math.max(2, Math.floor(8 / distance)); // Smaller sprites for small screen
                const screenY = Math.floor(box.height() / 2 - spriteSize / 2);

                if (screenX >= 0 && screenX < box.width()) {
                    this.drawTinyWolfensteinSprite(container, box, screenX, screenY, spriteSize, colors[index % colors.length], monster.type);
                }
            }
        });
    }

    drawTinyWolfensteinSprite(container: PixelList, box: PixelBox, x: number, y: number, size: number, color: Color, type: string) {
        // Ultra-simplified sprites for small screen
        const patterns: { [key: string]: string[] } = {
            'guard': ['███', '█ █', '███'],
            'dog': ['██', '██', '██'],
            'officer': ['███', '█ █', '███']
        };

        const pattern = patterns[type] || patterns['guard'];

        pattern.forEach((row, rowIndex) => {
            for (let col = 0; col < row.length; col++) {
                if (row[col] === '█') {
                    const pixelX = x + col;
                    const pixelY = y + rowIndex;
                    if (pixelX >= 0 && pixelX < box.width() && pixelY >= 0 && pixelY < box.height()) {
                        container.add(new Pixel(pixelX, pixelY, color));
                    }
                }
            }
        });
    }

    drawEscherStairs(container: PixelList, box: PixelBox, colors: Color[], frame: number, debug: boolean = false) {
        if (debug) console.log(`[DEBUG] Starting optimized drawEscherStairs for ${box.width()}x${box.height()}`);
        const time = frame * 0.02;
        const centerX = box.width() / 2;
        const centerY = box.height() / 2;

        // Simplified Penrose stairs for small screen
        const numSteps = 8; // Reduced from 12
        const baseRadius = Math.min(box.width(), box.height()) / 4; // Smaller radius

        // Draw simplified impossible loop structure
        for (let step = 0; step < numSteps; step++) {
            const angle = (step / numSteps) * Math.PI * 2 + time * 0.3;

            // Simpler elevation calculation
            const elevation = Math.sin(step / numSteps * Math.PI * 2 + time) * 4; // Reduced amplitude
            const radius = baseRadius + Math.cos(step / numSteps * Math.PI + time * 0.5) * 6; // Smaller variation

            // Calculate step position
            const stepX = centerX + Math.cos(angle) * radius;
            const stepY = centerY + Math.sin(angle) * radius * 0.5 + elevation;

            // Draw simplified step - just a few pixels
            this.drawTinyEscherStep(container, box, stepX, stepY, colors, step);

            // Draw connection to next step
            const nextAngle = ((step + 1) % numSteps / numSteps) * Math.PI * 2 + time * 0.3;
            const nextStepX = centerX + Math.cos(nextAngle) * baseRadius;
            const nextStepY = centerY + Math.sin(nextAngle) * baseRadius * 0.5;

            this.drawTinyLine(container, box, stepX, stepY, nextStepX, nextStepY, colors[(step * 2) % colors.length]);
        }

        if (debug) console.log(`[DEBUG] Completed optimized drawEscherStairs`);
    }

    drawTinyEscherStep(container: PixelList, box: PixelBox, x: number, y: number, colors: Color[], stepIndex: number) {
        // Ultra-simplified step for small screen - just a 3x2 rectangle
        const stepWidth = 3;
        const stepHeight = 2;

        for (let dx = 0; dx < stepWidth; dx++) {
            for (let dy = 0; dy < stepHeight; dy++) {
                const pixelX = Math.floor(x - stepWidth/2 + dx);
                const pixelY = Math.floor(y - stepHeight/2 + dy);

                if (pixelX >= 0 && pixelX < box.width() && pixelY >= 0 && pixelY < box.height()) {
                    const colorIndex = (stepIndex + dy) % colors.length;
                    container.add(new Pixel(pixelX, pixelY, colors[colorIndex]));
                }
            }
        }
    }

    drawTinyLine(container: PixelList, box: PixelBox, x1: number, y1: number, x2: number, y2: number, color: Color) {
        // Simplified line drawing for small screen
        const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        if (steps === 0) return;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.floor(x1 + (x2 - x1) * t);
            const y = Math.floor(y1 + (y2 - y1) * t);

            if (x >= 0 && x < box.width() && y >= 0 && y < box.height()) {
                container.add(new Pixel(x, y, color));
            }
        }
    }

    drawEscherTessellation(container: PixelList, box: PixelBox, colors: Color[], frame: number, debug: boolean = false) {
        if (debug) console.log(`[DEBUG] Starting optimized drawEscherTessellation for ${box.width()}x${box.height()}`);
        const time = frame * 0.02;
        const tileSize = Math.max(8, Math.floor(Math.min(box.width(), box.height()) / 6)); // Adaptive tile size

        // Simplified tessellation for small screen
        for (let tileY = 0; tileY < Math.ceil(box.height() / tileSize); tileY++) {
            for (let tileX = 0; tileX < Math.ceil(box.width() / tileSize); tileX++) {
                const offsetX = tileX * tileSize;
                const offsetY = tileY * tileSize;

                // Simple wave motion
                const waveOffset = Math.sin(time * 0.5 + tileY * 0.5) * 2;

                // Determine creature type based on vertical position
                const transitionZone = box.height() / 2;
                const isBird = (offsetY < transitionZone);

                // Simplified color selection
                const colorIndex = isBird ? 
                    Math.floor(colors.length * 0.8) : 
                    Math.floor(colors.length * 0.2);
                const finalColorIndex = (colorIndex + Math.floor(time * 2)) % colors.length;

                this.drawTinyEscherCreature(container, box, offsetX + waveOffset, offsetY, tileSize, colors[finalColorIndex], isBird);
            }
        }

        if (debug) console.log(`[DEBUG] Completed optimized drawEscherTessellation`);
    }

    drawTinyEscherCreature(container: PixelList, box: PixelBox, x: number, y: number, size: number, color: Color, isBird: boolean) {
        // Ultra-simplified creatures for small screen
        const halfSize = size / 2;

        for (let dy = 0; dy < size; dy++) {
            for (let dx = 0; dx < size; dx++) {
                const relX = (dx - halfSize) / halfSize;
                const relY = (dy - halfSize) / halfSize;

                let inShape = false;

                if (isBird) {
                    // Simple bird shape: body + wings
                    const body = (relX * relX + relY * relY * 1.5) < 0.6;
                    const wings = Math.abs(relY) < 0.3 && Math.abs(relX) > 0.3 && Math.abs(relX) < 0.8;
                    inShape = body || wings;
                } else {
                    // Simple fish shape: oval body + tail
                    const body = (relX * relX * 0.8 + relY * relY * 1.2) < 0.6;
                    const tail = relX < -0.4 && Math.abs(relY) < 0.4;
                    inShape = body || tail;
                }

                if (inShape) {
                    const pixelX = Math.floor(x + dx);
                    const pixelY = Math.floor(y + dy);
                    if (pixelX >= 0 && pixelX < box.width() && pixelY >= 0 && pixelY < box.height()) {
                        container.add(new Pixel(pixelX, pixelY, color));
                    }
                }
            }
        }
    }

    drawSierpinskiTriangle(container: PixelList, box: PixelBox, colors: Color[], frame: number, debug: boolean = false) {
        if (debug) console.log(`[DEBUG] Starting drawSierpinskiTriangle with ${colors.length} colors`);

        try {
            const time = frame * 0.02;
            const zoom = 1 + Math.sin(time) * 0.3;
            const rotation = time * 0.1;

            const centerX = box.width() / 2;
            const centerY = box.height() / 2;
            if (debug) console.log(`[DEBUG] Sierpinski center: ${centerX}, ${centerY}`);

            // Use a lightweight approach - draw points randomly within the triangle
            const size = Math.min(box.width(), box.height()) * 0.4 * zoom;
            const vertices = [
                [centerX + Math.cos(rotation) * size, centerY + Math.sin(rotation) * size],
                [centerX + Math.cos(rotation + 2 * Math.PI / 3) * size, centerY + Math.sin(rotation + 2 * Math.PI / 3) * size],
                [centerX + Math.cos(rotation + 4 * Math.PI / 3) * size, centerY + Math.sin(rotation + 4 * Math.PI / 3) * size]
            ];
            if (debug) console.log(`[DEBUG] Sierpinski vertices calculated`);

            let currentX = centerX;
            let currentY = centerY;
            const numPoints = 500; // Limit points to ensure smooth rendering
            if (debug) console.log(`[DEBUG] Starting to generate ${numPoints} points`);

            for (let i = 0; i < numPoints; i++) {
                if (debug && i % 100 === 0) {
                    console.log(`[DEBUG] Sierpinski point ${i}/${numPoints}`);
                }

                const vertexIndex = Math.floor(Math.random() * 3);
                const [targetX, targetY] = vertices[vertexIndex];
                currentX = (currentX + targetX) / 2;
                currentY = (currentY + targetY) / 2;

                if (i > 5) {
                    const x = Math.floor(currentX);
                    const y = Math.floor(currentY);
                    if (x >= 0 && x < box.width() && y >= 0 && y < box.height()) {
                        const colorIndex = (i + Math.floor(time * 5)) % colors.length;
                        container.add(new Pixel(x, y, colors[colorIndex]));
                    }
                }
            }

            if (debug) console.log(`[DEBUG] Sierpinski triangle completed successfully`);
        } catch (error) {
            console.error(`[ERROR] Exception in drawSierpinskiTriangle:`, error);
            throw error;
        }
    }

    drawDragonCurve(container: PixelList, box: PixelBox, colors: Color[], frame: number, debug: boolean = false) {
        if (debug) console.log(`[DEBUG] Starting drawDragonCurve with ${colors.length} colors`);

        try {
            // Ultra-safe implementation - just draw a simple animated spiral pattern
            // No loops, no recursion, no complex math - absolutely crash-proof
            const time = frame * 0.05;
            const centerX = Math.floor(box.width() / 2);
            const centerY = Math.floor(box.height() / 2);
            const maxRadius = Math.min(box.width(), box.height()) / 3;
            if (debug) console.log(`[DEBUG] Dragon curve center: ${centerX}, ${centerY}, maxRadius: ${maxRadius}`);

            // Draw a simple animated spiral with limited, predictable points
            for (let i = 0; i < 30; i++) { // Fixed small number of iterations
                if (debug && i % 10 === 0) {
                    console.log(`[DEBUG] Dragon curve point ${i}/30`);
                }

                const t = i / 30;
                const angle = time + t * Math.PI * 4;
                const radius = maxRadius * t;

                // Calculate position with guaranteed bounds
                const rawX = centerX + Math.cos(angle) * radius;
                const rawY = centerY + Math.sin(angle) * radius;

                // Force coordinates to be within bounds (double safety)
                const x = Math.max(0, Math.min(box.width() - 1, Math.floor(rawX)));
                const y = Math.max(0, Math.min(box.height() - 1, Math.floor(rawY)));

                // Add a simple color pattern
                const colorIndex = i % colors.length;
                container.add(new Pixel(x, y, colors[colorIndex]));

                // Add some decorative points around each main point
                if (i % 3 === 0) { // Only every 3rd point to keep it simple
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const decorX = Math.max(0, Math.min(box.width() - 1, x + dx));
                            const decorY = Math.max(0, Math.min(box.height() - 1, y + dy));
                            if (decorX !== x || decorY !== y) { // Don't overdraw center point
                                container.add(new Pixel(decorX, decorY, colors[(colorIndex + 1) % colors.length]));
                            }
                        }
                    }
                }
            }

            // Add a simple center point for visual anchor
            container.add(new Pixel(centerX, centerY, colors[0]));
            if (debug) console.log(`[DEBUG] Dragon curve completed successfully`);
        } catch (error) {
            console.error(`[ERROR] Exception in drawDragonCurve:`, error);
            throw error;
        }
    }

    private applyFadeTransition(currentEffect: PixelList, nextEffect: PixelList, transitionProgress: number) {
        // Create a map of pixel positions for blending
        const currentPixels = new Map<string, Pixel>();
        const nextPixels = new Map<string, Pixel>();

        // Collect current effect pixels
        for (const pixel of currentEffect) {
            if (pixel instanceof Pixel) {
                const key = `${pixel.x},${pixel.y}`;
                currentPixels.set(key, pixel);
            }
        }

        // Collect next effect pixels
        for (const pixel of nextEffect) {
            if (pixel instanceof Pixel) {
                const key = `${pixel.x},${pixel.y}`;
                nextPixels.set(key, pixel);
            }
        }

        // Clear both lists and add blended pixels
        currentEffect.clear();
        nextEffect.clear();

        // Blend pixels that exist in both effects
        for (const [key, currentPixel] of currentPixels) {
            const nextPixel = nextPixels.get(key);

            if (nextPixel) {
                // Blend the colors
                const blendedColor = this.blendColors(currentPixel.color, nextPixel.color, transitionProgress);
                currentEffect.add(new Pixel(currentPixel.x, currentPixel.y, blendedColor));
                nextPixels.delete(key); // Remove to avoid duplication
            } else {
                // Fade out current pixel
                const fadedColor = this.fadeColor(currentPixel.color, 1 - transitionProgress);
                if (fadedColor.r > 5 || fadedColor.g > 5 || fadedColor.b > 5) { // Only add if not too dark
                    currentEffect.add(new Pixel(currentPixel.x, currentPixel.y, fadedColor));
                }
            }
        }

        // Add remaining next effect pixels (fade in)
        for (const [key, nextPixel] of nextPixels) {
            const fadedColor = this.fadeColor(nextPixel.color, transitionProgress);
            if (fadedColor.r > 5 || fadedColor.g > 5 || fadedColor.b > 5) { // Only add if not too dark
                currentEffect.add(new Pixel(nextPixel.x, nextPixel.y, fadedColor));
            }
        }
    }

    private blendColors(color1: ColorInterface, color2: ColorInterface, progress: number): Color {
        // Ensure both colors exist and have valid properties
        if (!color1 || typeof color1.r === 'undefined') {
            return color2 ? new Color(color2.r, color2.g, color2.b) : new Color(0, 0, 0);
        }
        if (!color2 || typeof color2.r === 'undefined') {
            return new Color(color1.r, color1.g, color1.b);
        }

        const r = Math.floor(color1.r * (1 - progress) + color2.r * progress);
        const g = Math.floor(color1.g * (1 - progress) + color2.g * progress);
        const b = Math.floor(color1.b * (1 - progress) + color2.b * progress);
        return new Color(r, g, b);
    }

    private fadeColor(color: ColorInterface, intensity: number): Color {
        // Ensure color exists and has valid properties
        if (!color || typeof color.r === 'undefined') {
            return new Color(0, 0, 0);
        }

        const r = Math.floor(color.r * intensity);
        const g = Math.floor(color.g * intensity);
        const b = Math.floor(color.b * intensity);
        return new Color(r, g, b);
    }

    drawMandelbrotFractal(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const zoom = 1 + Math.sin(frame * 0.01) * 0.3; // Slower zoom
        const offsetX = Math.cos(frame * 0.005) * 0.3; // Slower movement
        const offsetY = Math.sin(frame * 0.008) * 0.2;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const a = (x / box.width() - 0.5) * 4 / zoom + offsetX;
                const b = (y / box.height() - 0.5) * 4 / zoom + offsetY;

                let ca = a, cb = b;
                let za = 0, zb = 0;
                let n = 0;

                while (n < 32 && za * za + zb * zb < 4) {
                    const temp = za * za - zb * zb + ca;
                    zb = 2 * za * zb + cb;
                    za = temp;
                    n++;
                }

                if (n < 32) {
                    const colorIndex = n % colors.length;
                    container.add(new Pixel(x, y, colors[colorIndex]));
                }
            }
        }
    }

    drawPlasmaEffect(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.05; // Slower movement

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const value = Math.sin(x * 0.15 + time) + 
                             Math.sin(y * 0.2 + time * 1.2) + 
                             Math.sin((x + y) * 0.1 + time * 1.5) + 
                             Math.sin(Math.sqrt(x * x + y * y) * 0.15 + time * 0.6);

                const colorIndex = Math.floor((value + 4) * colors.length / 8) % colors.length;
                container.add(new Pixel(x, y, colors[colorIndex]));
            }
        }
    }

    drawMetaballs(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.1;
        const balls = [
            {
                x: box.width() / 2 + Math.cos(time) * box.width() / 4,
                y: box.height() / 2 + Math.sin(time) * box.height() / 4,
                r: 15 + Math.sin(time * 2) * 5
            },
            {
                x: box.width() / 2 + Math.cos(time * 1.3 + Math.PI) * box.width() / 3,
                y: box.height() / 2 + Math.sin(time * 1.7) * box.height() / 3,
                r: 12 + Math.cos(time * 1.5) * 4
            },
            {
                x: box.width() / 2 + Math.sin(time * 0.8) * box.width() / 5,
                y: box.height() / 2 + Math.cos(time * 1.1) * box.height() / 5,
                r: 10 + Math.sin(time * 3) * 3
            }
        ];

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                let sum = 0;

                for (const ball of balls) {
                    const dx = x - ball.x;
                    const dy = y - ball.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        sum += ball.r * ball.r / (dist * dist);
                    }
                }

                if (sum > 1) {
                    const colorIndex = Math.floor(sum * 2) % colors.length;
                    container.add(new Pixel(x, y, colors[colorIndex]));
                }
            }
        }
    }

    drawFireEffect(container: PixelList, box: PixelBox, fireColors: Color[], frame: number) {
        // Create fire buffer
        const fireBuffer: number[][] = [];
        for (let y = 0; y < box.height(); y++) {
            fireBuffer[y] = [];
            for (let x = 0; x < box.width(); x++) {
                if (y === box.height() - 1) {
                    // Bottom row - fire source
                    fireBuffer[y][x] = Math.random() > 0.3 ? fireColors.length - 1 : 0;
                } else {
                    fireBuffer[y][x] = 0;
                }
            }
        }

        // Fire propagation (simplified for performance)
        for (let y = box.height() - 2; y >= 0; y--) {
            for (let x = 0; x < box.width(); x++) {
                const spread = Math.floor(Math.random() * 3) - 1;
                const sourceX = Math.max(0, Math.min(box.width() - 1, x + spread));
                fireBuffer[y][x] = Math.max(0, fireBuffer[y + 1][sourceX] - Math.floor(Math.random() * 3));
            }
        }

        // Render fire
        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                if (fireBuffer[y][x] > 0) {
                    const colorIndex = Math.min(fireColors.length - 1, fireBuffer[y][x]);
                    container.add(new Pixel(x, y, fireColors[colorIndex]));
                }
            }
        }
    }

    // Add simplified stubs for remaining effects to prevent compilation errors
    drawSpiralFractal(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.03;
        const centerX = box.width() / 2;
        const centerY = box.height() / 2;

        for (let i = 0; i < 100; i++) {
            const angle = i * 0.2 + time;
            const radius = i * 0.3;
            const x = Math.floor(centerX + Math.cos(angle) * radius);
            const y = Math.floor(centerY + Math.sin(angle) * radius);

            if (x >= 0 && x < box.width() && y >= 0 && y < box.height()) {
                container.add(new Pixel(x, y, colors[i % colors.length]));
            }
        }
    }

    drawRotatingCube(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.02;
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        const projectedVertices = vertices.map(([x, y, z]) => {
            const rotX = x * Math.cos(time) - z * Math.sin(time);
            const rotZ = x * Math.sin(time) + z * Math.cos(time);
            const rotY = y * Math.cos(time * 1.3) - rotZ * Math.sin(time * 1.3);
            const finalZ = y * Math.sin(time * 1.3) + rotZ * Math.cos(time * 1.3);

            const scale = 10 / (finalZ + 5);
            return [
                Math.floor(box.width() / 2 + rotX * scale),
                Math.floor(box.height() / 2 + rotY * scale)
            ];
        });

        edges.forEach(([start, end], index) => {
            const [x1, y1] = projectedVertices[start];
            const [x2, y2] = projectedVertices[end];
            this.drawTinyLine(container, box, x1, y1, x2, y2, colors[index % colors.length]);
        });
    }

    drawTunnelEffect(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.05;
        const centerX = box.width() / 2;
        const centerY = box.height() / 2;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.max(0.1, Math.sqrt(dx * dx + dy * dy)); // Prevent division by zero
                const angle = Math.atan2(dy, dx);

                const tunnelDistance = 20 / distance + time;
                const tunnelAngle = angle * 4 + time;

                const colorIndex = Math.floor(Math.abs((tunnelDistance + Math.sin(tunnelAngle) * 2) * colors.length / 8)) % colors.length;
                container.add(new Pixel(x, y, colors[colorIndex]));
            }
        }
    }

    drawRetroSprites(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.1;
        const sprites = [
            { x: Math.sin(time) * 20 + box.width() / 2, y: Math.cos(time * 1.3) * 10 + box.height() / 2, type: 0 },
            { x: Math.cos(time * 0.7) * 15 + box.width() / 2, y: Math.sin(time * 0.9) * 8 + box.height() / 2, type: 1 },
        ];

        sprites.forEach((sprite, index) => {
            const x = Math.floor(sprite.x);
            const y = Math.floor(sprite.y);
            const size = 3;

            for (let dy = 0; dy < size; dy++) {
                for (let dx = 0; dx < size; dx++) {
                    const px = x + dx - size / 2;
                    const py = y + dy - size / 2;
                    if (px >= 0 && px < box.width() && py >= 0 && py < box.height()) {
                        container.add(new Pixel(px, py, colors[(index * 3 + dx + dy) % colors.length]));
                    }
                }
            }
        });
    }

    drawWaveDistortion(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.05;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const wave1 = Math.sin(x * 0.2 + time * 2) * 4;
                const wave2 = Math.cos(y * 0.15 + time * 1.5) * 3;
                const finalY = y + wave1;
                const finalX = x + wave2;

                if (finalX >= 0 && finalX < box.width() && finalY >= 0 && finalY < box.height()) {
                    const colorIndex = Math.floor((Math.sin(finalX * 0.1 + time) + 1) * colors.length / 2) % colors.length;
                    container.add(new Pixel(x, y, colors[colorIndex]));
                }
            }
        }
    }

    drawStarfield3D(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.1;
        const stars = Array.from({ length: 50 }, (_, i) => ({
            x: (Math.sin(i * 0.5) * 100) % box.width(),
            y: (Math.cos(i * 0.7) * 100) % box.height(),
            z: (i * 3 + time) % 50,
            color: colors[i % colors.length]
        }));

        stars.forEach(star => {
            const scale = 20 / (star.z + 1);
            const x = Math.floor(box.width() / 2 + (star.x - box.width() / 2) * scale);
            const y = Math.floor(box.height() / 2 + (star.y - box.height() / 2) * scale);

            if (x >= 0 && x < box.width() && y >= 0 && y < box.height()) {
                container.add(new Pixel(x, y, star.color));
            }
        });
    }

    drawColorCycling(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const offset = Math.floor(frame * 0.5) % colors.length;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const pattern = (x + y * 2) % colors.length;
                const colorIndex = (pattern + offset) % colors.length;
                container.add(new Pixel(x, y, colors[colorIndex]));
            }
        }
    }

    drawScrollingText(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const text = "RETRO DEMO";
        const scrollX = (frame * 0.5) % (text.length * 4 + box.width());
        const textX = box.width() - scrollX;

        try {
            fonts['Tiny 3x3'].load();
            container.add(new DrawText(textX, box.height() / 2, fonts['Tiny 3x3'], text, colors[0]));
        } catch (error) {
            // Fallback simple scroll
            for (let i = 0; i < text.length; i++) {
                const x = Math.floor(textX + i * 4);
                const y = Math.floor(box.height() / 2);
                if (x >= 0 && x < box.width() && y >= 0 && y < box.height()) {
                    container.add(new Pixel(x, y, colors[i % colors.length]));
                }
            }
        }
    }

    // Simplified stubs for remaining effects
    drawJuliaSet(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        // Simple Julia set approximation
        const cx = Math.sin(frame * 0.02) * 0.5;
        const cy = Math.cos(frame * 0.03) * 0.5;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                let zx = (x / box.width() - 0.5) * 3;
                let zy = (y / box.height() - 0.5) * 3;
                let n = 0;

                while (n < 20 && zx * zx + zy * zy < 4) {
                    const temp = zx * zx - zy * zy + cx;
                    zy = 2 * zx * zy + cy;
                    zx = temp;
                    n++;
                }

                if (n < 20) {
                    container.add(new Pixel(x, y, colors[n % colors.length]));
                }
            }
        }
    }

    drawRotozoomer(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.02;
        const zoom = 1 + Math.sin(time) * 0.5;
        const rotation = time * 0.5;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const dx = x - box.width() / 2;
                const dy = y - box.height() / 2;

                const rotX = dx * Math.cos(rotation) - dy * Math.sin(rotation);
                const rotY = dx * Math.sin(rotation) + dy * Math.cos(rotation);

                const pattern = Math.floor((rotX * zoom + rotY * zoom) / 5) % colors.length;
                container.add(new Pixel(x, y, colors[Math.abs(pattern)]));
            }
        }
    }

    drawMaze3D(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        // Simplified 3D maze view
        const time = frame * 0.03;
        const maze = [
            [1, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 0, 1, 1],
            [1, 1, 1, 1]
        ];

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (maze[y][x]) {
                    const height = 8 + Math.sin(time + x + y) * 4;
                    const screenX = x * 8 + 8;
                    const screenY = box.height() / 2 - height / 2;

                    for (let h = 0; h < height; h++) {
                        const py = Math.floor(screenY + h);
                        if (screenX < box.width() && py >= 0 && py < box.height()) {
                            container.add(new Pixel(screenX, py, colors[(x + y) % colors.length]));
                        }
                    }
                }
            }
        }
    }

    drawLensDistortion(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.02;
        const centerX = box.width() / 2;
        const centerY = box.height() / 2;
        const lensStrength = Math.sin(time) * 0.5 + 0.5;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const distortion = lensStrength * Math.sin(distance * 0.1 + time);

                const newX = x + dx * distortion * 0.1;
                const newY = y + dy * distortion * 0.1;

                const colorIndex = Math.floor((newX + newY + time * 10) / 5) % colors.length;
                container.add(new Pixel(x, y, colors[Math.abs(colorIndex)]));
            }
        }
    }

    drawWaterEffect(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.03;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const wave1 = Math.sin(x * 0.1 + time * 2) * 3;
                const wave2 = Math.cos(y * 0.15 + time * 1.5) * 2;
                const wave3 = Math.sin((x + y) * 0.08 + time) * 1;

                const intensity = (wave1 + wave2 + wave3 + 6) / 12;
                const colorIndex = Math.floor(intensity * colors.length) % colors.length;
                container.add(new Pixel(x, y, colors[colorIndex]));
            }
        }
    }

    drawVectorBalls(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.1;
        const balls = [
            { x: box.width() / 2 + Math.sin(time) * 15, y: box.height() / 2 + Math.cos(time) * 10, r: 5 },
            { x: box.width() / 2 + Math.cos(time * 1.3) * 12, y: box.height() / 2 + Math.sin(time * 1.7) * 8, r: 4 },
        ];

        balls.forEach((ball, index) => {
            for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
                const x = Math.floor(ball.x + Math.cos(angle) * ball.r);
                const y = Math.floor(ball.y + Math.sin(angle) * ball.r);

                if (x >= 0 && x < box.width() && y >= 0 && y < box.height()) {
                    container.add(new Pixel(x, y, colors[(index * 5 + Math.floor(angle * 3)) % colors.length]));
                }
            }
        });
    }

    drawBurningShipFractal(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const zoom = 1 + Math.sin(frame * 0.01) * 0.3;
        const offsetX = Math.cos(frame * 0.005) * 0.3;
        const offsetY = Math.sin(frame * 0.008) * 0.2;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const a = (x / box.width() - 0.5) * 4 / zoom + offsetX;
                const b = (y / box.height() - 0.5) * 4 / zoom + offsetY;

                let ca = a, cb = b;
                let za = 0, zb = 0;
                let n = 0;

                while (n < 32 && za * za + zb * zb < 4) {
                    const temp = za * za - zb * zb + ca;
                    zb = Math.abs(2 * za * zb) + cb; // Burning ship variation
                    za = Math.abs(temp);
                    n++;
                }

                if (n < 32) {
                    container.add(new Pixel(x, y, colors[n % colors.length]));
                }
            }
        }
    }

    drawMandalaPattern(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.02;
        const centerX = box.width() / 2;
        const centerY = box.height() / 2;

        for (let r = 1; r < Math.min(box.width(), box.height()) / 2; r += 2) {
            const numPoints = r * 2;
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2 + time;
                const x = Math.floor(centerX + Math.cos(angle) * r);
                const y = Math.floor(centerY + Math.sin(angle) * r);

                if (x >= 0 && x < box.width() && y >= 0 && y < box.height()) {
                    container.add(new Pixel(x, y, colors[(r + i) % colors.length]));
                }
            }
        }
    }

    drawCopperBars(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.05;

        for (let y = 0; y < box.height(); y++) {
            const wave = Math.sin(y * 0.3 + time) * 0.5 + 0.5;
            const colorIndex = Math.floor(wave * colors.length) % colors.length;

            for (let x = 0; x < box.width(); x++) {
                container.add(new Pixel(x, y, colors[colorIndex]));
            }
        }
    }

    drawBobbing(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.1;

        for (let x = 0; x < box.width(); x++) {
            const y1 = Math.floor(box.height() / 2 + Math.sin(x * 0.2 + time) * 8);
            const y2 = Math.floor(box.height() / 2 + Math.cos(x * 0.15 + time * 1.3) * 6);

            if (y1 >= 0 && y1 < box.height()) {
                container.add(new Pixel(x, y1, colors[x % colors.length]));
            }
            if (y2 >= 0 && y2 < box.height()) {
                container.add(new Pixel(x, y2, colors[(x + 5) % colors.length]));
            }
        }
    }

    drawPhong3D(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.02;
        const lightX = Math.sin(time) * 10 + box.width() / 2;
        const lightY = Math.cos(time) * 8 + box.height() / 2;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const dx = x - lightX;
                const dy = y - lightY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const intensity = Math.max(0, 1 - distance / 20);

                const colorIndex = Math.floor(intensity * colors.length) % colors.length;
                if (intensity > 0.1) {
                    container.add(new Pixel(x, y, colors[colorIndex]));
                }
            }
        }
    }

    drawCheckerboard3D(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.03;
        const tileSize = 4;

        for (let y = 0; y < box.height(); y += tileSize) {
            for (let x = 0; x < box.width(); x += tileSize) {
                const tileX = Math.floor(x / tileSize);
                const tileY = Math.floor(y / tileSize);
                const wave = Math.sin(tileX + tileY + time) * 0.5 + 0.5;

                const colorIndex = Math.floor(wave * colors.length) % colors.length;

                for (let dy = 0; dy < tileSize && y + dy < box.height(); dy++) {
                    for (let dx = 0; dx < tileSize && x + dx < box.width(); dx++) {
                        container.add(new Pixel(x + dx, y + dy, colors[colorIndex]));
                    }
                }
            }
        }
    }

    drawDotMatrix(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const time = frame * 0.1;
        const spacing = 3;

        for (let y = 0; y < box.height(); y += spacing) {
            for (let x = 0; x < box.width(); x += spacing) {
                const intensity = Math.sin(x * 0.1 + y * 0.15 + time) * 0.5 + 0.5;
                if (intensity > 0.5) {
                    const colorIndex = Math.floor(intensity * colors.length) % colors.length;
                    container.add(new Pixel(x, y, colors[colorIndex]));
                }
            }
        }
    }

    drawMetamorphosis(container: PixelList, box: PixelBox, colors: Color[], frame: number, debug: boolean = false) {
        const time = frame * 0.03;
        const centerX = box.width() / 2;
        const centerY = box.height() / 2;

        for (let y = 0; y < box.height(); y++) {
            for (let x = 0; x < box.width(); x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                const morphFactor = Math.sin(time + distance * 0.2) * 0.5 + 0.5;
                const newAngle = angle + morphFactor * Math.PI;
                const newDistance = distance * (1 + morphFactor * 0.3);

                const newX = centerX + Math.cos(newAngle) * newDistance;
                const newY = centerY + Math.sin(newAngle) * newDistance;

                const colorIndex = Math.floor((newX + newY + time * 10) / 8) % colors.length;
                container.add(new Pixel(x, y, colors[Math.abs(colorIndex)]));
            }
        }
    }

    drawGalaga(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const width = box.width();
        const height = box.height();

        // Galaga enemy formation flying pattern
        const enemyCount = 12;
        const formationTime = frame * 0.05;

        for (let i = 0; i < enemyCount; i++) {
            const angle = (i / enemyCount) * Math.PI * 2 + formationTime;
            const radius = 8 + Math.sin(formationTime + i) * 3;

            const x = Math.floor(width / 2 + Math.cos(angle) * radius);
            const y = Math.floor(height / 3 + Math.sin(angle * 0.5) * 4 + i * 2);

            if (x >= 0 && x < width && y >= 0 && y < height) {
                // Draw enemy sprite (simple cross pattern)
                const color = colors[i % colors.length];
                container.add(new Pixel(x, y, color));
                if (x > 0) container.add(new Pixel(x - 1, y, color));
                if (x < width - 1) container.add(new Pixel(x + 1, y, color));
                if (y > 0) container.add(new Pixel(x, y - 1, color));
                if (y < height - 1) container.add(new Pixel(x, y + 1, color));
            }
        }

        // Player ship at bottom
        const shipX = Math.floor(width / 2 + Math.sin(frame * 0.1) * 8);
        const shipY = height - 3;
        if (shipX >= 1 && shipX < width - 1) {
            const shipColor = colors[0];
            container.add(new Pixel(shipX, shipY, shipColor));
            container.add(new Pixel(shipX - 1, shipY + 1, shipColor));
            container.add(new Pixel(shipX + 1, shipY + 1, shipColor));
        }

        // Shooting stars effect
        for (let i = 0; i < 5; i++) {
            const starX = Math.floor((frame * 2 + i * 20) % width);
            const starY = Math.floor(height / 2 + Math.sin(frame * 0.1 + i) * 8);
            if (starX >= 0 && starX < width && starY >= 0 && starY < height) {
                container.add(new Pixel(starX, starY, colors[colors.length - 1]));
            }
        }
    }

    drawAsteroids(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const width = box.width();
        const height = box.height();

        // Rotating asteroids
        const asteroidCount = 8;
        for (let i = 0; i < asteroidCount; i++) {
            const angle = frame * 0.02 + i * 0.8;
            const radius = 5 + Math.sin(frame * 0.05 + i) * 2;

            const centerX = (width / 4) * (1 + (i % 3));
            const centerY = (height / 3) * (1 + Math.floor(i / 3));

            // Draw asteroid as irregular polygon
            for (let j = 0; j < 8; j++) {
                const vertexAngle = angle + (j / 8) * Math.PI * 2;
                const vertexRadius = radius + Math.sin(vertexAngle * 3) * 1.5;

                const x = Math.floor(centerX + Math.cos(vertexAngle) * vertexRadius);
                const y = Math.floor(centerY + Math.sin(vertexAngle) * vertexRadius);

                if (x >= 0 && x < width && y >= 0 && y < height) {
                    container.add(new Pixel(x, y, colors[i % colors.length]));
                }
            }
        }

        // Ship in center with thruster effect
        const shipX = Math.floor(width / 2);
        const shipY = Math.floor(height / 2);
        const shipAngle = frame * 0.05;

        // Ship triangle
        for (let i = 0; i < 3; i++) {
            const angle = shipAngle + (i / 3) * Math.PI * 2;
            const x = Math.floor(shipX + Math.cos(angle) * 2);
            const y = Math.floor(shipY + Math.sin(angle) * 2);

            if (x >= 0 && x < width && y >= 0 && y < height) {
                container.add(new Pixel(x, y, colors[0]));
            }
        }

        // Thruster particles
        for (let i = 0; i < 5; i++) {
            const thrustX = Math.floor(shipX - Math.cos(shipAngle) * (3 + i));
            const thrustY = Math.floor(shipY - Math.sin(shipAngle) * (3 + i) + (Math.random() - 0.5) * 2);

            if (thrustX >= 0 && thrustX < width && thrustY >= 0 && thrustY < height) {
                container.add(new Pixel(thrustX, thrustY, colors[colors.length - 1]));
            }
        }
    }

    drawTetris(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const width = box.width();
        const height = box.height();

        // Define tetris pieces
        const pieces = [
            [[1,1,1,1]], // I-piece
            [[1,1],[1,1]], // O-piece
            [[0,1,0],[1,1,1]], // T-piece
            [[1,0,0],[1,1,1]], // L-piece
            [[0,0,1],[1,1,1]], // J-piece
            [[0,1,1],[1,1,0]], // S-piece
            [[1,1,0],[0,1,1]]  // Z-piece
        ];

        // Falling pieces
        const fallSpeed = Math.floor(frame / 30);
        for (let p = 0; p < 3; p++) {
            const piece = pieces[(frame + p) % pieces.length];
            const pieceX = 2 + p * 8;
            const pieceY = (fallSpeed + p * 10) % (height + 10) - 5;

            for (let y = 0; y < piece.length; y++) {
                for (let x = 0; x < piece[y].length; x++) {
                    if (piece[y][x] && pieceX + x >= 0 && pieceX + x < width && 
                        pieceY + y >= 0 && pieceY + y < height) {
                        container.add(new Pixel(pieceX + x, pieceY + y, colors[p % colors.length]));
                    }
                }
            }
        }

        // Bottom filled rows with line clear effect
        const clearEffect = Math.sin(frame * 0.2) * 0.5 + 0.5;
        for (let y = height - 5; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if ((x + y) % 2 === 0 && Math.random() < clearEffect) {
                    container.add(new Pixel(x, y, colors[(x + y) % colors.length]));
                }
            }
        }
    }

    drawDonkeyKong(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const width = box.width();
        const height = box.height();

        // Draw platforms (girders)
        for (let level = 0; level < 4; level++) {
            const y = height - 3 - level * 6;
            const offset = (level % 2) * 8;

            for (let x = offset; x < width - offset; x++) {
                if (y >= 0 && y < height) {
                    container.add(new Pixel(x, y, colors[0]));
                }
            }
        }

        // Mario climbing animation
        const marioLevel = Math.floor(frame / 60) % 4;
        const marioX = 2 + Math.floor(frame / 10) % 8;
        const marioY = height - 5 - marioLevel * 6;

        if (marioX >= 0 && marioX < width && marioY >= 0 && marioY < height) {
            // Mario sprite (simple representation)
            container.add(new Pixel(marioX, marioY, colors[1])); // body
            if (marioY > 0) container.add(new Pixel(marioX, marioY - 1, colors[2])); // hat
        }

        // Rolling barrels
        const barrelCount = 6;
        for (let i = 0; i < barrelCount; i++) {
            const barrelTime = frame * 0.15 + i * 20;
            const level = i % 4;
            const y = height - 4 - level * 6;
            const direction = (level % 2) * 2 - 1;
            let x = Math.floor(barrelTime * direction) % (width + 10);

            if (direction < 0) {
                x = width - x;
            }

            if (x >= 0 && x < width && y >= 0 && y < height) {
                container.add(new Pixel(x, y, colors[3]));
                // Barrel rotation effect
                if (Math.floor(barrelTime) % 2 === 0 && x > 0) {
                    container.add(new Pixel(x - 1, y, colors[3]));
                }
            }
        }

        // Donkey Kong at the top
        const dkX = width / 2;
        const dkY = 2;
        const dkBounce = Math.sin(frame * 0.3) * 2;

        // DK sprite (simplified)
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = 0; dy <= 2; dy++) {
                const x = Math.floor(dkX + dx);
                const y = Math.floor(dkY + dy + dkBounce);

                if (x >= 0 && x < width && y >= 0 && y < height) {
                    container.add(new Pixel(x, y, colors[4 % colors.length]));
                }
            }
        }
    }

    drawZelda(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const width = box.width();
        const height = box.height();

        // Triforce in center with pulsing effect
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;
        const triforceSize = Math.floor(4 * pulse);

        // Draw triforce triangles
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
            const offsetX = Math.floor(Math.cos(angle) * triforceSize);
            const offsetY = Math.floor(Math.sin(angle) * triforceSize);

            const triX = centerX + offsetX;
            const triY = centerY + offsetY;

            // Draw small triangle
            for (let dy = 0; dy < 3; dy++) {
                for (let dx = -dy; dx <= dy; dx++) {
                    const x = triX + dx;
                    const y = triY + dy;

                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        container.add(new Pixel(x, y, colors[i % colors.length]));
                    }
                }
            }
        }

        // Link walking around the triforce
        const linkAngle = frame * 0.05;
        const linkRadius = 8 + triforceSize;
        const linkX = Math.floor(centerX + Math.cos(linkAngle) * linkRadius);
        const linkY = Math.floor(centerY + Math.sin(linkAngle) * linkRadius);

        if (linkX >= 0 && linkX < width && linkY >= 0 && linkY < height) {
            // Link sprite (simple representation)
            container.add(new Pixel(linkX, linkY, colors[colors.length - 1]));

            // Sword slash effect
            const slashAngle = linkAngle + Math.PI / 2;
            const slashX = Math.floor(linkX + Math.cos(slashAngle) * 2);
            const slashY = Math.floor(linkY + Math.sin(slashAngle) * 2);

            if (slashX >= 0 && slashX < width && slashY >= 0 && slashY < height) {
                container.add(new Pixel(slashX, slashY, colors[0]));
            }
        }

        // Rupees scattered around
        for (let i = 0; i < 8; i++) {
            const rupeeAngle = (i / 8) * Math.PI * 2 + frame * 0.02;
            const rupeeRadius = 12 + Math.sin(frame * 0.1 + i) * 3;

            const rupeeX = Math.floor(centerX + Math.cos(rupeeAngle) * rupeeRadius);
            const rupeeY = Math.floor(centerY + Math.sin(rupeeAngle) * rupeeRadius);

            if (rupeeX >= 0 && rupeeX < width && rupeeY >= 0 && rupeeY < height) {
                const rupeeColor = colors[(i + Math.floor(frame / 30)) % colors.length];
                container.add(new Pixel(rupeeX, rupeeY, rupeeColor));
            }
        }
    }

    drawPrinceOfPersia(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const width = box.width();
        const height = box.height();

        // Palace architecture - ornate pillars
        for (let pillar = 0; pillar < 3; pillar++) {
            const x = 5 + pillar * 12;

            for (let y = height - 8; y < height; y++) {
                if (x >= 0 && x < width) {
                    container.add(new Pixel(x, y, colors[0]));
                    if (x + 1 < width) container.add(new Pixel(x + 1, y, colors[0]));
                }
            }

            // Ornate tops
            for (let dx = -2; dx <= 3; dx++) {
                const topY = height - 8;
                if (x + dx >= 0 && x + dx < width && topY >= 0) {
                    container.add(new Pixel(x + dx, topY, colors[1]));
                }
            }
        }

        // Prince running/jumping animation
        const princeX = Math.floor((frame * 0.3) % (width + 10)) - 5;
        const isJumping = Math.floor(frame / 30) % 4 === 0;
        const princeY = height - 6 - (isJumping ? Math.sin(frame * 0.5) * 4 : 0);

        if (princeX >= 0 && princeX < width && princeY >= 0 && princeY < height) {
            // Prince sprite
            container.add(new Pixel(princeX, Math.floor(princeY), colors[2]));
            if (princeX > 0) container.add(new Pixel(princeX - 1, Math.floor(princeY), colors[2]));

            // Sword
            const swordX = princeX + (Math.floor(frame / 10) % 2 === 0 ? 2 : 1);
            if (swordX < width) {
                container.add(new Pixel(swordX, Math.floor(princeY) - 1, colors[3]));
            }
        }

        // Spinning blade traps
        const trapCount = 4;
        for (let i = 0; i < trapCount; i++) {
            const trapX = 8 + i * 10;
            const trapY = height - 4;
            const bladeAngle = frame * 0.2 + i;

            for (let blade = 0; blade < 4; blade++) {
                const angle = bladeAngle + (blade / 4) * Math.PI * 2;
                const bladeX = Math.floor(trapX + Math.cos(angle) * 3);
                const bladeY = Math.floor(trapY + Math.sin(angle) * 1);

                if (bladeX >= 0 && bladeX < width && bladeY >= 0 && bladeY < height) {
                    container.add(new Pixel(bladeX, bladeY, colors[4 % colors.length]));
                }
            }
        }

        // Falling sand effect
        for (let i = 0; i < 15; i++) {
            const sandX = Math.floor((frame + i * 7) % width);
            const sandY = Math.floor((frame * 0.5 + i * 3) % height);

            if (Math.random() < 0.3) {
                container.add(new Pixel(sandX, sandY, colors[colors.length - 1]));
            }
        }
    }

    drawLemmings(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const width = box.width();
        const height = box.height();

        // Terrain platforms
        const platforms = [
            { x: 0, y: height - 3, width: 15 },
            { x: 20, y: height - 8, width: 12 },
            { x: 35, y: height - 5, width: 10 },
            { x: 10, y: height - 12, width: 8 }
        ];

        platforms.forEach(platform => {
            for (let x = platform.x; x < platform.x + platform.width && x < width; x++) {
                if (platform.y >= 0 && platform.y < height) {
                    container.add(new Pixel(x, platform.y, colors[0]));
                }
            }
        });

        // Lemmings walking and falling
        const lemmingCount = 8;
        for (let i = 0; i < lemmingCount; i++) {
            const lemmingTime = frame * 0.1 + i * 15;
            let lemmingX = Math.floor(lemmingTime % (width + 20)) - 10;
            let lemmingY = height - 15;

            // Simple physics - find platform below
            let onPlatform = false;
            for (const platform of platforms) {
                if (lemmingX >= platform.x && lemmingX < platform.x + platform.width) {
                    lemmingY = platform.y - 1;
                    onPlatform = true;
                    break;
                }
            }

            if (!onPlatform) {
                lemmingY = Math.floor(height - 15 + (lemmingTime * 0.2) % 15);
            }

            if (lemmingX >= 0 && lemmingX < width && lemmingY >= 0 && lemmingY < height) {
                // Lemming sprite
                const lemmingColor = colors[(i + Math.floor(frame / 20)) % colors.length];
                container.add(new Pixel(lemmingX, lemmingY, lemmingColor));

                // Hair tuft
                if (lemmingY > 0) {
                    container.add(new Pixel(lemmingX, lemmingY - 1, lemmingColor));
                }
            }
        }

        // Entrance portal
        const entranceX = 2;
        const entranceY = 2;
        const portalPulse = Math.sin(frame * 0.3) * 0.5 + 0.5;

        for (let dy = 0; dy < 4; dy++) {
            for (let dx = 0; dx < 3; dx++) {
                const x = entranceX + dx;
                const y = entranceY + dy;

                if (x < width && y < height && Math.random() < portalPulse) {
                    container.add(new Pixel(x, y, colors[colors.length - 1]));
                }
            }
        }

        // Exit portal
        const exitX = width - 5;
        const exitY = height - 8;

        for (let dy = 0; dy < 4; dy++) {
            for (let dx = 0; dx < 3; dx++) {
                const x = exitX + dx;
                const y = exitY + dy;

                if (x < width && y >= 0 && y < height && Math.random() < portalPulse) {
                    container.add(new Pixel(x, y, colors[1]));
                }
            }
        }
    }

    drawBoulderDash(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const width = box.width();
        const height = box.height();

        // Cave background - rocky walls
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const noise = Math.sin(x * 0.3 + y * 0.2 + frame * 0.01) * 0.5 + 0.5;
                if (noise > 0.7 && (x === 0 || x === width - 1 || y === 0 || y === height - 1 || Math.random() < 0.1)) {
                    container.add(new Pixel(x, y, colors[0]));
                }
            }
        }

        // Diamonds scattered around
        const diamondCount = 12;
        for (let i = 0; i < diamondCount; i++) {
            const diamondX = Math.floor((5 + i * 3.5 + Math.sin(frame * 0.05 + i) * 2) % (width - 2)) + 1;
            const diamondY = Math.floor((3 + i * 2.2 + Math.cos(frame * 0.04 + i) * 1.5) % (height - 2)) + 1;
            const sparkle = Math.sin(frame * 0.2 + i) * 0.5 + 0.5;

            if (sparkle > 0.3) {
                container.add(new Pixel(diamondX, diamondY, colors[1]));

                // Diamond sparkle effect
                if (Math.random() < 0.3) {
                    const sparkleX = diamondX + (Math.random() > 0.5 ? 1 : -1);
                    const sparkleY = diamondY + (Math.random() > 0.5 ? 1 : -1);
                    if (sparkleX >= 0 && sparkleX < width && sparkleY >= 0 && sparkleY < height) {
                        container.add(new Pixel(sparkleX, sparkleY, colors[2]));
                    }
                }
            }
        }

        // Rockford (player) moving through the cave
        const rockfordX = Math.floor((frame * 0.2) % (width - 4)) + 2;
        const rockfordY = Math.floor(height / 2 + Math.sin(frame * 0.1) * 3);

        if (rockfordX >= 0 && rockfordX < width && rockfordY >= 0 && rockfordY < height) {
            // Rockford sprite
            container.add(new Pixel(rockfordX, rockfordY, colors[3]));
            container.add(new Pixel(rockfordX - 1, rockfordY, colors[3]));
            if (rockfordY > 0) container.add(new Pixel(rockfordX, rockfordY - 1, colors[3]));
        }

        // Falling boulders
        const boulderCount = 6;
        for (let i = 0; i < boulderCount; i++) {
            const boulderX = 5 + i * 8;
            const boulderY = Math.floor((frame * 0.3 + i * 20) % (height + 10)) - 5;

            if (boulderX < width && boulderY >= 0 && boulderY < height) {
                // Boulder sprite (2x2)
                const boulderColor = colors[4 % colors.length];
                container.add(new Pixel(boulderX, boulderY, boulderColor));
                if (boulderX + 1 < width) {
                    container.add(new Pixel(boulderX + 1, boulderY, boulderColor));
                }
                if (boulderY + 1 < height) {
                    container.add(new Pixel(boulderX, boulderY + 1, boulderColor));
                    if (boulderX + 1 < width) {
                        container.add(new Pixel(boulderX + 1, boulderY + 1, boulderColor));
                    }
                }
            }
        }

        // Butterflies (enemies) flying in patterns
        for (let i = 0; i < 4; i++) {
            const butterflyAngle = frame * 0.15 + i * Math.PI / 2;
            const butterflyX = Math.floor(width / 2 + Math.cos(butterflyAngle) * 8);
            const butterflyY = Math.floor(height / 2 + Math.sin(butterflyAngle * 1.3) * 6);

            if (butterflyX >= 0 && butterflyX < width && butterflyY >= 0 && butterflyY < height) {
                container.add(new Pixel(butterflyX, butterflyY, colors[5 % colors.length]));

                // Wing flap effect
                const wingFlap = Math.sin(frame * 0.5 + i) > 0;
                if (wingFlap) {
                    if (butterflyX > 0) container.add(new Pixel(butterflyX - 1, butterflyY, colors[5 % colors.length]));
                    if (butterflyX < width - 1) container.add(new Pixel(butterflyX + 1, butterflyY, colors[5 % colors.length]));
                }
            }
        }
    }

    drawPolePosition(container: PixelList, box: PixelBox, colors: Color[], frame: number) {
        const width = box.width();
        const height = box.height();

        // Racing track - road with center line
        const roadWidth = Math.floor(width * 0.6);
        const roadLeft = Math.floor((width - roadWidth) / 2);
        const roadRight = roadLeft + roadWidth;

        // Draw road surface
        for (let y = 0; y < height; y++) {
            for (let x = roadLeft; x <= roadRight; x++) {
                container.add(new Pixel(x, y, colors[0])); // Dark road
            }
        }

        // Center line dashes
        const dashLength = 3;
        const dashGap = 2;
        const lineOffset = Math.floor(frame * 0.5) % (dashLength + dashGap);

        for (let y = -lineOffset; y < height; y += dashLength + dashGap) {
            for (let dy = 0; dy < dashLength && y + dy < height; dy++) {
                if (y + dy >= 0) {
                    container.add(new Pixel(Math.floor(width / 2), y + dy, colors[1])); // White center line
                }
            }
        }

        // Road side barriers
        for (let y = 0; y < height; y++) {
            container.add(new Pixel(roadLeft - 1, y, colors[2])); // Left barrier
            container.add(new Pixel(roadRight + 1, y, colors[2])); // Right barrier
        }

        // Player car at bottom center
        const playerX = Math.floor(width / 2 + Math.sin(frame * 0.1) * 3); // Slight steering
        const playerY = height - 4;

        if (playerX >= roadLeft && playerX <= roadRight) {
            // Player car sprite
            container.add(new Pixel(playerX, playerY, colors[3]));
            container.add(new Pixel(playerX, playerY - 1, colors[3]));
            if (playerX > roadLeft) container.add(new Pixel(playerX - 1, playerY, colors[3]));
            if (playerX < roadRight) container.add(new Pixel(playerX + 1, playerY, colors[3]));
        }

        // Opponent cars racing down
        const opponentCount = 5;
        for (let i = 0; i < opponentCount; i++) {
            const carSpeed = 0.8 + i * 0.1;
            const carY = Math.floor((frame * carSpeed + i * 15) % (height + 10)) - 5;
            const laneOffset = (i % 3 - 1) * 4; // Three lanes
            const carX = Math.floor(width / 2 + laneOffset + Math.sin(frame * 0.05 + i) * 2);

            if (carX >= roadLeft && carX <= roadRight && carY >= 0 && carY < height - 5) {
                // Opponent car sprite
                const carColor = colors[(4 + i) % colors.length];
                container.add(new Pixel(carX, carY, carColor));
                container.add(new Pixel(carX, carY + 1, carColor));
                if (carX > roadLeft) container.add(new Pixel(carX - 1, carY, carColor));
                if (carX < roadRight) container.add(new Pixel(carX + 1, carY, carColor));
            }
        }

        // Trackside scenery - trees and signs
        for (let i = 0; i < 8; i++) {
            const sceneryY = (frame + i * 20) % (height + 10) - 5;

            // Left side scenery
            const leftX = roadLeft - 3;
            if (leftX >= 0 && sceneryY >= 0 && sceneryY < height) {
                container.add(new Pixel(leftX, sceneryY, colors[colors.length - 1]));
            }

            // Right side scenery
            const rightX = roadRight + 3;
            if (rightX < width && sceneryY >= 0 && sceneryY < height) {
                container.add(new Pixel(rightX, sceneryY, colors[colors.length - 1]));
            }
        }

        // Speedometer effect - dots racing around the border
        const speedDots = 12;
        for (let i = 0; i < speedDots; i++) {
            const dotProgress = (frame * 0.2 + i * (1 / speedDots)) % 1;
            let dotX, dotY;

            if (dotProgress < 0.25) {
                // Top edge
                dotX = Math.floor(dotProgress * 4 * width);
                dotY = 0;
            } else if (dotProgress < 0.5) {
                // Right edge
                dotX = width - 1;
                dotY = Math.floor((dotProgress - 0.25) * 4 * height);
            } else if (dotProgress < 0.75) {
                // Bottom edge
                dotX = Math.floor(width - (dotProgress - 0.5) * 4 * width);
                dotY = height - 1;
            } else {
                // Left edge
                dotX = 0;
                dotY = Math.floor(height - (dotProgress - 0.75) * 4 * height);
            }

            if (dotX >= 0 && dotX < width && dotY >= 0 && dotY < height) {
                container.add(new Pixel(dotX, dotY, colors[colors.length - 2]));
            }
        }
    }
}