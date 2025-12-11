import type ControlGroup from "../../ControlGroup.js"

export class TextPostFXConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Text Effects 📝", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableTextFX = this.controls.switch("Enable Text FX", false);
        
        // Motion-Adaptive Anti-Aliasing
        const aaGroup = this.controls.group("Motion-Adaptive AA", true, true);
        const enableAA = aaGroup.switch("Enable", true);
        
        // Motion Blur
        const motionBlurGroup = this.controls.group("Motion Blur 💨", true, true);
        const enableMotionBlur = motionBlurGroup.switch("Enable", false);
        const motionBlurAmount = motionBlurGroup.value("Amount", 3, 2, 5, 1);
        
        // Subpixel Rendering
        const subpixelGroup = this.controls.group("Subpixel Rendering", true, true);
        const enableSubpixel = subpixelGroup.switch("Enable", false);
        
        // Sharpening
        const sharpenGroup = this.controls.group("Sharpen", true, true);
        const enableSharpen = sharpenGroup.switch("Enable", false);
        const sharpenAmount = sharpenGroup.value("Amount", 0.3, 0.1, 1.0, 0.1);
        
        // Glow
        const glowGroup = this.controls.group("Glow ✨", true, true);
        const enableGlow = glowGroup.switch("Enable", false);
        const glowIntensity = glowGroup.value("Intensity", 2, 1, 5, 1);
        
        // Shadow
        const shadowGroup = this.controls.group("Drop Shadow", true, true);
        const enableShadow = shadowGroup.switch("Enable", false);
        const shadowOffsetX = shadowGroup.value("Offset X", 1, -5, 5, 1);
        const shadowOffsetY = shadowGroup.value("Offset Y", 1, -5, 5, 1);
        
        // Flames
        const flamesGroup = this.controls.group("Flames 🔥", true, true);
        const enableFlames = flamesGroup.switch("Enable", false);
        const flameCount = flamesGroup.value("Number of Flames", 20, 5, 50, 5);
        const flameHeight = flamesGroup.value("Flame Height %", 50, 10, 100, 5);
        const flameIntensity = flamesGroup.value("Intensity", 1.0, 0.5, 2.0, 0.1);
        const flameWildness = flamesGroup.value("Wildness", 2, 0.5, 5, 0.5);
        
        // Plasma Color Effect
        const plasmaGroup = this.controls.group("Plasma Colors 🌈", true, true);
        const enablePlasma = plasmaGroup.switch("Enable", false);
        const plasmaPaletteChoices = [
            {id: "rainbow", name: "Rainbow"},
            {id: "fire", name: "Fire"},
            {id: "ocean", name: "Ocean"},
            {id: "forest", name: "Forest"},
            {id: "sunset", name: "Sunset"},
            {id: "purple", name: "Purple Dream"},
            {id: "cyber", name: "Cyber"},
            {id: "neon", name: "Neon"},
            {id: "lava", name: "Lava"},
            {id: "ice", name: "Ice"}
        ];
        const plasmaPalette = plasmaGroup.select("Palette", "rainbow", plasmaPaletteChoices, true);
        const plasmaSpeed = plasmaGroup.value("Speed", 1.0, 0.1, 5.0, 0.1);
        const plasmaScale = plasmaGroup.value("Scale", 1.0, 0.1, 5.0, 0.1);
        const plasmaIntensity = plasmaGroup.value("Intensity", 1.0, 0.1, 2.0, 0.1);
        const plasmaCycleSpeed = plasmaGroup.value("Color Cycle Speed", 1.0, 0.0, 5.0, 0.1);
        
        return {
            enableTextFX,
            motionAA: {
                enable: enableAA
            },
            motionBlur: {
                enable: enableMotionBlur,
                amount: motionBlurAmount
            },
            subpixel: {
                enable: enableSubpixel
            },
            sharpen: {
                enable: enableSharpen,
                amount: sharpenAmount
            },
            glow: {
                enable: enableGlow,
                intensity: glowIntensity
            },
            shadow: {
                enable: enableShadow,
                offsetX: shadowOffsetX,
                offsetY: shadowOffsetY
            },
            flames: {
                enable: enableFlames,
                count: flameCount,
                height: flameHeight,
                intensity: flameIntensity,
                wildness: flameWildness
            },
            plasma: {
                enable: enablePlasma,
                palette: plasmaPalette,
                speed: plasmaSpeed,
                scale: plasmaScale,
                intensity: plasmaIntensity,
                cycleSpeed: plasmaCycleSpeed
            }
        };
    }
    
    getOptions() {
        const config = this.config;
        
        return {
            motionAdaptiveAA: config.enableTextFX.enabled && config.motionAA.enable.enabled,
            motionBlur: config.enableTextFX.enabled && config.motionBlur.enable.enabled,
            motionBlurAmount: config.motionBlur.amount.value,
            subpixelRendering: config.enableTextFX.enabled && config.subpixel.enable.enabled,
            sharpen: config.enableTextFX.enabled && config.sharpen.enable.enabled,
            sharpenAmount: config.sharpen.amount.value,
            glow: config.enableTextFX.enabled && config.glow.enable.enabled,
            glowIntensity: config.glow.intensity.value,
            shadow: config.enableTextFX.enabled && config.shadow.enable.enabled,
            shadowOffsetX: config.shadow.offsetX.value,
            shadowOffsetY: config.shadow.offsetY.value,
            flames: config.enableTextFX.enabled && config.flames.enable.enabled,
            flameCount: config.flames.count.value,
            flameHeight: config.flames.height.value,
            flameIntensity: config.flames.intensity.value,
            flameWildness: config.flames.wildness.value,
            plasma: config.enableTextFX.enabled && config.plasma.enable.enabled,
            plasmaPalette: config.plasma.palette.selected,
            plasmaSpeed: config.plasma.speed.value,
            plasmaScale: config.plasma.scale.value,
            plasmaIntensity: config.plasma.intensity.value,
            plasmaCycleSpeed: config.plasma.cycleSpeed.value
        };
    }
}
