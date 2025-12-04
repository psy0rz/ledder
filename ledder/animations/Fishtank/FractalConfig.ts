import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { FractalSprites, FractalType } from "./FractalSprites.js"
import { patternSelect } from "../../ColorPatterns.js"

export class FractalConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    private fractalSprite: any = null; // Store reference to update settings
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Fractals", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableFractal = this.controls.switch("Enable", false);
        
        // Fractal type selection
        const fractalTypeChoices = [
            {id: "Mandelbrot", name: "Mandelbrot"},
            {id: "Julia", name: "Julia"}
        ];
        const fractalType = this.controls.select("Fractal Type", "Mandelbrot", fractalTypeChoices);
        
        // Color palette selection
        const colorPalette = patternSelect(this.controls, "Color Palette", "Rainbow");
        
        // Animation settings
        const autoZoom = this.controls.switch("Auto Zoom", true);
        const zoomSpeed = this.controls.value("Zoom Speed", 0.01, 0.001, 0.1, 0.001);
        const manualZoom = this.controls.value("Manual Zoom", 1.0, 0.01, 1000, 0.1);
        
        // Quality settings
        const maxIterations = this.controls.value("Max Iterations", 256, 16, 1024, 16);
        
        // Manual hotspot controls
        const manualHotspotGroup = this.controls.group("Manual Hotspot", true, false);
        const useManualHotspot = manualHotspotGroup.switch("Use Manual", false);
        const hotspotCx = manualHotspotGroup.value("Center X", -0.5, -2.0, 2.0, 0.01);
        const hotspotCy = manualHotspotGroup.value("Center Y", 0.0, -2.0, 2.0, 0.01);
        const hotspotMaxZoom = manualHotspotGroup.value("Max Zoom", 9, 1, 12, 0.1);
        
        // Opacity control
        const opacity = this.controls.value("Opacity", 0.7, 0.0, 1.0, 0.1);
        
        return {
            enableFractal,
            fractalType,
            colorPalette,
            autoZoom,
            zoomSpeed,
            manualZoom,
            maxIterations,
            useManualHotspot,
            hotspotCx,
            hotspotCy,
            hotspotMaxZoom,
            opacity
        };
    }
    
    populateSprites(fractalManager: SpriteManager, box: PixelBox) {
        const config = this.setupControls();
        
        if (!config.enableFractal.enabled) {
            return;
        }
        
        // Apply opacity to color palette
        const colorPaletteWithOpacity = config.colorPalette.map(color => {
            const c = color.copy();
            c.a = config.opacity.value;
            return c;
        });
        
        // Create fractal sprite
        const fractalType = config.fractalType.selected === "Julia" 
            ? FractalType.Julia 
            : FractalType.Mandelbrot;
            
        const fractal = FractalSprites.createFractal(
            box.width(),
            box.height(),
            fractalType,
            colorPaletteWithOpacity,
            config.maxIterations.value
        );
        
        // Apply settings
        fractal.setAutoZoom(config.autoZoom.enabled);
        fractal.setZoomSpeed(config.zoomSpeed.value);
        
        if (!config.autoZoom.enabled) {
            fractal.setZoom(config.manualZoom.value);
        }
        
        if (config.useManualHotspot.enabled) {
            fractal.setHotspot(
                config.hotspotCx.value,
                config.hotspotCy.value,
                config.hotspotMaxZoom.value
            );
        }
        
        // Store reference for dynamic updates
        this.fractalSprite = fractal;
        
        // Add onChange handlers for dynamic updates
        config.fractalType.onChange(() => {
            if (this.fractalSprite) {
                const type = config.fractalType.selected === "Julia" 
                    ? FractalType.Julia 
                    : FractalType.Mandelbrot;
                this.fractalSprite.setFractalType(type);
            }
        });
        
        config.maxIterations.onChange(() => {
            if (this.fractalSprite) {
                this.fractalSprite.setMaxIterations(config.maxIterations.value);
            }
        });
        
        config.autoZoom.onChange(() => {
            if (this.fractalSprite) {
                this.fractalSprite.setAutoZoom(config.autoZoom.enabled);
            }
        });
        
        config.zoomSpeed.onChange(() => {
            if (this.fractalSprite) {
                this.fractalSprite.setZoomSpeed(config.zoomSpeed.value);
            }
        });
        
        config.manualZoom.onChange(() => {
            if (this.fractalSprite && !config.autoZoom.enabled) {
                this.fractalSprite.setZoom(config.manualZoom.value);
            }
        });
        
        config.useManualHotspot.onChange(() => {
            if (this.fractalSprite && config.useManualHotspot.enabled) {
                this.fractalSprite.setHotspot(
                    config.hotspotCx.value,
                    config.hotspotCy.value,
                    config.hotspotMaxZoom.value
                );
            }
        });
        
        config.hotspotCx.onChange(() => {
            if (this.fractalSprite && config.useManualHotspot.enabled) {
                this.fractalSprite.setHotspot(
                    config.hotspotCx.value,
                    config.hotspotCy.value,
                    config.hotspotMaxZoom.value
                );
            }
        });
        
        config.hotspotCy.onChange(() => {
            if (this.fractalSprite && config.useManualHotspot.enabled) {
                this.fractalSprite.setHotspot(
                    config.hotspotCx.value,
                    config.hotspotCy.value,
                    config.hotspotMaxZoom.value
                );
            }
        });
        
        config.opacity.onChange(() => {
            if (this.fractalSprite && config.colorPalette) {
                const paletteWithOpacity = config.colorPalette.map(c => {
                    const color = c.copy();
                    color.a = config.opacity.value;
                    return color;
                });
                this.fractalSprite.setColorPalette(paletteWithOpacity);
            }
        });
        
        fractalManager.addSprite(fractal);
    }
}
