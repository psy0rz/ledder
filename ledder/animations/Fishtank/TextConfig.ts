import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { TextSprite, TextAnimationType } from "./TextSprites.js"
import { fonts } from "../../fonts.js"

export class TextConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Text Display", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableText = this.controls.switch("Enable", true);
        
        // Font selection
        const fontChoices = [
            {id: "C64", name: "C64"},
            {id: "C64 mono", name: "C64 Mono"},
            {id: "Atari regular", name: "Atari"},
            {id: "IBM bios", name: "IBM BIOS"},
            {id: "MSX", name: "MSX"},
            {id: "ZX Sierra Quest", name: "ZX Sierra Quest"},
            {id: "Anarchist", name: "Anarchist"},
            {id: "Skid Row", name: "Skid Row"},
            {id: "Quasar", name: "Quasar"},
            {id: "Computer", name: "Computer"},
            {id: "Picopixel", name: "Picopixel"},
            {id: "ORG v01", name: "ORG v01"},
            {id: "Tiny 3x3", name: "Tiny 3x3"},
            {id: "Pixel-Gosub", name: "Pixel-Gosub"}
        ];
        const selectedFont = this.controls.select("Font", "C64", fontChoices);
        
        // Text size
        const textSize = this.controls.value("Text Size", 1.0, 0.5, 5.0, 0.1);
        
        // Text content
        const textContent = this.controls.input("Text", "Hello World!");
        const maxTextWidth = this.controls.value("Max Width %", 90, 10, 100, 5);
        
        // Text animation
        const animationChoices = [
            {id: "static", name: "Static"},
            {id: "scroll-horizontal", name: "Scroll Horizontal"},
            {id: "scroll-vertical", name: "Scroll Vertical"},
            {id: "starwars", name: "Star Wars Intro"},
            {id: "typewriter", name: "Typewriter"},
            {id: "fade", name: "Fade In/Out"},
            {id: "wave", name: "Wave"},
            {id: "bounce", name: "Bounce"}
        ];
        const animationType = this.controls.select("Animation", "static", animationChoices);
        const animationSpeed = this.controls.value("Animation Speed", 1.0, 0.1, 5.0, 0.1);
        
        // Text alignment
        const hAlignChoices = [
            {id: "left", name: "Left"},
            {id: "center", name: "Center"},
            {id: "right", name: "Right"}
        ];
        const textHAlign = this.controls.select("Horizontal Align", "left", hAlignChoices);
        
        const vAlignChoices = [
            {id: "top", name: "Top"},
            {id: "center", name: "Center"},
            {id: "bottom", name: "Bottom"}
        ];
        const textVAlign = this.controls.select("Vertical Align", "top", vAlignChoices);
        
        // Text positioning (percentage-based)
        const textXPercent = this.controls.value("X Position %", 0, 0, 100, 1);
        const textYPercent = this.controls.value("Y Position %", 0, 0, 100, 1);
        
        // Text color
        const textColor = this.controls.color("Color", 255, 255, 255);
        
        return {
            enableText,
            selectedFont,
            textSize,
            textContent,
            maxTextWidth,
            animationType,
            animationSpeed,
            textHAlign,
            textVAlign,
            textXPercent,
            textYPercent,
            textColor
        };
    }
    
    populateSprites(textManager: SpriteManager, box: PixelBox) {
        const config = this.config;
        
        if (!config.enableText.enabled) {
            return;
        }
        
        // Get selected font
        const font = fonts[config.selectedFont.selected];
        
        // Calculate actual positions based on display size
        const textX = Math.floor((config.textXPercent.value / 100) * box.width());
        const textY = Math.floor((config.textYPercent.value / 100) * box.height());
        const actualMaxWidth = Math.floor((config.maxTextWidth.value / 100) * box.width());
        
        // Convert animation type string to enum
        let textAnimationEnum: TextAnimationType;
        switch (config.animationType.selected) {
            case "scroll-horizontal":
                textAnimationEnum = TextAnimationType.ScrollHorizontal;
                break;
            case "scroll-vertical":
                textAnimationEnum = TextAnimationType.ScrollVertical;
                break;
            case "starwars":
                textAnimationEnum = TextAnimationType.StarWarsIntro;
                break;
            case "typewriter":
                textAnimationEnum = TextAnimationType.Typewriter;
                break;
            case "fade":
                textAnimationEnum = TextAnimationType.Fade;
                break;
            case "wave":
                textAnimationEnum = TextAnimationType.Wave;
                break;
            case "bounce":
                textAnimationEnum = TextAnimationType.Bounce;
                break;
            default:
                textAnimationEnum = TextAnimationType.Static;
        }
        
        // Create text sprite
        const textSprite = new TextSprite(
            textX,
            textY,
            font,
            config.textContent.text,
            config.textColor,
            textAnimationEnum,
            config.animationSpeed.value,
            actualMaxWidth,
            config.textHAlign.selected as 'left' | 'center' | 'right',
            config.textVAlign.selected as 'top' | 'center' | 'bottom',
            config.textSize.value
        );
        textManager.addSprite(textSprite);
    }
}
