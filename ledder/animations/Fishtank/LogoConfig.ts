import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { LogoSprites, LogoSprite, LogoAnimationType } from "./LogoSprites.js"
import Color from "../../Color.js"

/**
 * Configuration class for logo in the Fishtank
 * Manages logo controls, positioning, animations, and effects
 */
export class LogoConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    private logoSprite: LogoSprite | null = null;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Logo 🖼️", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableLogo = this.controls.switch("Enable", false);
        
        // Logo selection
        const logoOptions = [
            { id: "URL", name: "Remote URL" },
            { id: "HSD", name: "HSD Logo" },
            { id: "HSD64W20H", name: "HSD64W20H Logo" },
            { id: "HSD120W8H", name: "HSD120W8H Logo" },
            { id: "TkkrLab", name: "TkkrLab Logo" },
            { id: "Stc", name: "Stc Logo" },
            { id: "Hack42", name: "Hack42 Logo" },
            { id: "TDVenlo", name: "TDVenlo Logo" },
            { id: "MaakPlek", name: "MaakPlek Logo" }
        ];
        const logoType = this.controls.select("Logo Type", "URL", logoOptions, true);
        const logoUrl = this.controls.input("Image URL", "", true);
        
        // Position controls
        const posGroup = this.controls.group("Position", true, true);
        const logoX = posGroup.value("X Position %", 50, 0, 100, 1);
        const logoY = posGroup.value("Y Position %", 50, 0, 100, 1);
        const logoScale = posGroup.value("Scale", 1.0, 0.1, 3.0, 0.1);
        
        // Animation controls
        const animGroup = this.controls.group("Animation", true, true);
        const animOptions = [
            { id: LogoAnimationType.STATIC, name: "Static" },
            { id: LogoAnimationType.HORIZONTAL_SCROLL, name: "Horizontal Scroll" },
            { id: LogoAnimationType.VERTICAL_SCROLL, name: "Vertical Scroll" },
            { id: LogoAnimationType.BOUNCE, name: "Bounce" },
            { id: LogoAnimationType.FLOW, name: "Flow" }
        ];
        const logoAnimType = animGroup.select("Type", LogoAnimationType.STATIC, animOptions, true);
        const logoAnimSpeed = animGroup.value("Speed", 1.0, -2.0, 2.0, 0.1);
        
        // Effects controls
        const fxGroup = this.controls.group("Effects", true, true);
        const logoOpacity = fxGroup.value("Opacity", 1.0, 0.0, 1.0, 0.1);
        const logoGlow = fxGroup.value("Glow", 0, 0, 5, 1);
        const logoGlowR = fxGroup.value("Glow R", 255, 0, 255, 1);
        const logoGlowG = fxGroup.value("Glow G", 255, 0, 255, 1);
        const logoGlowB = fxGroup.value("Glow B", 255, 0, 255, 1);
        const logoRainbow = fxGroup.switch("Rainbow", false);
        const logoPostFX = fxGroup.switch("Apply PostFX", false);
        
        return {
            enableLogo,
            logoType,
            logoUrl,
            logoX,
            logoY,
            logoScale,
            logoAnimType,
            logoAnimSpeed,
            logoOpacity,
            logoGlow,
            logoGlowR,
            logoGlowG,
            logoGlowB,
            logoRainbow,
            logoPostFX
        };
    }
    
    /**
     * Populate sprite manager with logo sprite
     */
    async populateSprites(logoManager: SpriteManager, box: PixelBox) {
        const config = this.config;
        
        if (!config.enableLogo.enabled) {
            return;
        }
        
        const boxWidth = box.width();
        const boxHeight = box.height();
        
        // Clear existing sprites
        logoManager.clear();
        this.logoSprite = null;
        
        // Create Logo
        if (config.logoType.selected !== "URL" || config.logoUrl.text.trim() !== "") {
            const x = Math.round((config.logoX.value / 100) * boxWidth);
            const y = Math.round((config.logoY.value / 100) * boxHeight);
            
            const logo = LogoSprites.createLogo(
                boxWidth,
                boxHeight,
                x,
                y,
                64,
                64,
                config.logoAnimType.selected as LogoAnimationType,
                config.logoAnimSpeed.value,
                config.logoOpacity.value
            );
            
            // Load either built-in logo or remote URL
            const logoSource = config.logoType.selected === "URL" 
                ? config.logoUrl.text 
                : config.logoType.selected;
            
            await logo.loadImageData(logoSource);
            logo.setScale(config.logoScale.value);
            logo.setGlow(
                config.logoGlow.value,
                new Color(config.logoGlowR.value, config.logoGlowG.value, config.logoGlowB.value, 1)
            );
            logo.setRainbow(config.logoRainbow.enabled);
            
            logoManager.addSprite(logo);
            this.logoSprite = logo;
        }
    }
    
    /**
     * Check if PostFX should be applied to logo
     */
    shouldApplyPostFX(): boolean {
        return this.config.logoPostFX.enabled;
    }
    
    /**
     * Update logo position and effects dynamically
     */
    updateLogo(box: PixelBox) {
        const config = this.config;
        const boxWidth = box.width();
        const boxHeight = box.height();
        
        // Update Logo
        if (this.logoSprite) {
            const x = Math.round((config.logoX.value / 100) * boxWidth);
            const y = Math.round((config.logoY.value / 100) * boxHeight);
            this.logoSprite.setPosition(x, y);
            this.logoSprite.setScale(config.logoScale.value);
            this.logoSprite.setAnimation(config.logoAnimType.selected as LogoAnimationType, config.logoAnimSpeed.value);
            this.logoSprite.setOpacity(config.logoOpacity.value);
            this.logoSprite.setGlow(
                config.logoGlow.value,
                new Color(config.logoGlowR.value, config.logoGlowG.value, config.logoGlowB.value, 1)
            );
            this.logoSprite.setRainbow(config.logoRainbow.enabled);
        }
    }
}
