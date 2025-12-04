import type ControlGroup from "../../ControlGroup.js"

export class PostFXConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Post FX 🎨", true, false);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enablePostFX = this.controls.switch("Enable Post FX", false);
        
        // Anti-Aliasing
        const aaGroup = this.controls.group("Anti-Aliasing", true, false);
        const enableAA = aaGroup.switch("Enable", false);
        
        // Motion Blur
        const motionBlurGroup = this.controls.group("Motion Blur", true, false);
        const enableMotionBlur = motionBlurGroup.switch("Enable", false);
        const motionBlurAmount = motionBlurGroup.value("Amount", 3, 2, 5, 1);
        
        // Fire/Flames Effect
        const fireGroup = this.controls.group("Fire Effect 🔥", true, false);
        const enableFire = fireGroup.switch("Enable", false);
        const fireIntensity = fireGroup.value("Intensity", 5, 1, 10, 1);
        const fireSpeed = fireGroup.value("Speed", 1.0, 0.1, 5.0, 0.1);
        
        // Color Cycling
        const colorCycleGroup = this.controls.group("Color Cycling", true, false);
        const enableColorCycle = colorCycleGroup.switch("Enable", false);
        const colorCycleSpeed = colorCycleGroup.value("Speed", 1.0, 0.1, 5.0, 0.1);
        
        // Tunnel/Warp Effect
        const tunnelGroup = this.controls.group("Tunnel/Warp", true, false);
        const enableTunnel = tunnelGroup.switch("Enable", false);
        const tunnelIntensity = tunnelGroup.value("Intensity", 5, 0, 20, 1);
        const tunnelSpeed = tunnelGroup.value("Speed", 1.0, 0.1, 5.0, 0.1);
        
        return {
            enablePostFX,
            antiAliasing: {
                enable: enableAA
            },
            motionBlur: {
                enable: enableMotionBlur,
                amount: motionBlurAmount
            },
            fire: {
                enable: enableFire,
                intensity: fireIntensity,
                speed: fireSpeed
            },
            colorCycling: {
                enable: enableColorCycle,
                speed: colorCycleSpeed
            },
            tunnel: {
                enable: enableTunnel,
                intensity: tunnelIntensity,
                speed: tunnelSpeed
            }
        };
    }
    
    getOptions() {
        const config = this.config;
        
        return {
            antiAliasing: config.enablePostFX.enabled && config.antiAliasing.enable.enabled,
            motionBlur: config.enablePostFX.enabled && config.motionBlur.enable.enabled,
            motionBlurAmount: config.motionBlur.amount.value,
            fire: config.enablePostFX.enabled && config.fire.enable.enabled,
            fireIntensity: config.fire.intensity.value,
            fireSpeed: config.fire.speed.value,
            colorCycling: config.enablePostFX.enabled && config.colorCycling.enable.enabled,
            colorCycleSpeed: config.colorCycling.speed.value,
            tunnelWarp: config.enablePostFX.enabled && config.tunnel.enable.enabled,
            tunnelIntensity: config.tunnel.intensity.value,
            tunnelSpeed: config.tunnel.speed.value
        };
    }
}
