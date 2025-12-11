import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { TextSprite, TextAnimationType } from "./TextSprites.js"
import { fonts } from "../../fonts.js"
import { getRssFeedData } from "../../hsdfeed.js"

export class TextConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    // Dynamic content caches
    private rssCache: string[] = [];
    private rssLastUpdate: number = 0;
    private rssCurrentIndex: number = 0;
    private spaceApiCache: any = null;
    private spaceApiLastUpdate: number = 0;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Text Display", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableText = this.controls.switch("Enable", true);
        
        // Text source type
        const sourceGroup = this.controls.group("Content Source", true, true);
        const sourceTypeChoices = [
            {id: "manual", name: "Manual Text"},
            {id: "clock", name: "Digital Clock"},
            {id: "rss", name: "RSS Feed"},
            {id: "spaceapi", name: "SpaceAPI Status"}
        ];
        const sourceType = sourceGroup.select("Source Type", "manual", sourceTypeChoices, true);
        
        // Manual text input
        const textContent = sourceGroup.input("Text", "Hello World!");
        
        // Digital Clock settings
        const clockFormatChoices = [
            {id: "HH:MM:SS", name: "HH:MM:SS"},
            {id: "HH:MM", name: "HH:MM"},
            {id: "HH:MM:SS DD/MM/YYYY", name: "Date & Time"},
            {id: "DD/MM/YYYY", name: "Date Only"}
        ];
        const clockFormat = sourceGroup.select("Clock Format", "HH:MM:SS", clockFormatChoices);
        const clock24Hour = sourceGroup.switch("24-Hour Format", true);
        
        // RSS Feed settings
        const rssFeedUrl = sourceGroup.input("RSS Feed URL", "https://www.hackerspace-drenthe.nl/feed/");
        const rssShowTitle = sourceGroup.switch("Show Title", true);
        const rssShowDescription = sourceGroup.switch("Show Description", false);
        const rssMaxItems = sourceGroup.value("Max Items", 5, 1, 20, 1);
        const rssUpdateInterval = sourceGroup.value("Update Interval (min)", 5, 1, 60, 1);
        
        // SpaceAPI settings
        const spaceApiUrl = sourceGroup.input("SpaceAPI URL", "https://space.hackerspace-drenthe.nl/status.json");
        const spaceApiFormatChoices = [
            {id: "status", name: "Open/Closed Status"},
            {id: "message", name: "Status Message"},
            {id: "both", name: "Status + Message"}
        ];
        const spaceApiFormat = sourceGroup.select("Display Format", "status", spaceApiFormatChoices);
        const spaceOpenText = sourceGroup.input("Open Text", "OPEN");
        const spaceClosedText = sourceGroup.input("Closed Text", "CLOSED");
        const spaceApiUpdateInterval = sourceGroup.value("Update Interval (min)", 1, 1, 30, 1);
        
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
        const selectedFont = this.controls.select("Font", "C64", fontChoices, true);
        
        // Text size
        const textSize = this.controls.value("Text Size", 1.0, 0.5, 5.0, 0.1);
        
        // Max width
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
        const animationType = this.controls.select("Animation", "static", animationChoices, true);
        const animationSpeed = this.controls.value("Animation Speed", 1.0, 0.1, 5.0, 0.1);
        
        // Text alignment
        const hAlignChoices = [
            {id: "left", name: "Left"},
            {id: "center", name: "Center"},
            {id: "right", name: "Right"}
        ];
        const textHAlign = this.controls.select("Horizontal Align", "left", hAlignChoices, true);
        
        const vAlignChoices = [
            {id: "top", name: "Top"},
            {id: "center", name: "Center"},
            {id: "bottom", name: "Bottom"}
        ];
        const textVAlign = this.controls.select("Vertical Align", "top", vAlignChoices, true);
        
        // Text positioning (percentage-based)
        const textXPercent = this.controls.value("X Position %", 0, 0, 100, 1);
        const textYPercent = this.controls.value("Y Position %", 0, 0, 100, 1);
        
        // Text color
        const textColor = this.controls.color("Color", 255, 255, 255);
        
        return {
            enableText,
            sourceType,
            textContent,
            clockFormat,
            clock24Hour,
            rssFeedUrl,
            rssShowTitle,
            rssShowDescription,
            rssMaxItems,
            rssUpdateInterval,
            spaceApiUrl,
            spaceApiFormat,
            spaceOpenText,
            spaceClosedText,
            spaceApiUpdateInterval,
            selectedFont,
            textSize,
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
        
        // Get initial text content based on source type
        const initialText = this.getTextContent();
        
        // Create text update callback for dynamic sources
        const textUpdateCallback = config.sourceType.selected !== "manual" 
            ? () => this.getTextContent()
            : undefined;
        
        // Create text sprite
        const textSprite = new TextSprite(
            textX,
            textY,
            font,
            initialText,
            config.textColor,
            textAnimationEnum,
            config.animationSpeed.value,
            actualMaxWidth,
            config.textHAlign.selected as 'left' | 'center' | 'right',
            config.textVAlign.selected as 'top' | 'center' | 'bottom',
            config.textSize.value,
            textUpdateCallback
        );
        textManager.addSprite(textSprite);
    }
    
    /**
     * Get text content based on selected source type
     */
    private getTextContent(): string {
        const config = this.config;
        
        switch (config.sourceType.selected) {
            case "clock":
                return this.getClockText();
            case "rss":
                return this.getRSSText();
            case "spaceapi":
                return this.getSpaceAPIText();
            case "manual":
            default:
                return config.textContent.text;
        }
    }
    
    /**
     * Generate digital clock text
     */
    private getClockText(): string {
        const config = this.config;
        const now = new Date();
        
        const hours24 = now.getHours();
        const hours = config.clock24Hour.enabled ? hours24 : (hours24 % 12 || 12);
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        
        switch (config.clockFormat.selected) {
            case "HH:MM":
                return `${hours.toString().padStart(2, '0')}:${minutes}`;
            case "HH:MM:SS DD/MM/YYYY":
                return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${day}/${month}/${year}`;
            case "DD/MM/YYYY":
                return `${day}/${month}/${year}`;
            case "HH:MM:SS":
            default:
                return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
        }
    }
    
    /**
     * Get RSS feed text
     */
    private getRSSText(): string {
        const config = this.config;
        const now = Date.now();
        const updateInterval = config.rssUpdateInterval.value * 60 * 1000; // Convert minutes to ms
        
        // Update RSS cache if needed
        if (now - this.rssLastUpdate > updateInterval || this.rssCache.length === 0) {
            this.updateRSSCache();
        }
        
        // Return current item from cache
        if (this.rssCache.length === 0) {
            return "Loading RSS feed...";
        }
        
        return this.rssCache[this.rssCurrentIndex % this.rssCache.length] || "No RSS items";
    }
    
    /**
     * Update RSS cache from feed
     */
    private updateRSSCache() {
        const config = this.config;
        
        getRssFeedData(config.rssFeedUrl.text, (url, items) => {
            try {
                this.rssCache = [];
                
                const maxItems = Math.min(config.rssMaxItems.value, items.length);
                for (let i = 0; i < maxItems; i++) {
                    const item = items[i];
                    let text = "";
                    
                    if (config.rssShowTitle.enabled && item.title) {
                        text += item.title[0];
                    }
                    
                    if (config.rssShowDescription.enabled && item.description) {
                        if (text.length > 0) text += " - ";
                        text += item.description[0];
                    }
                    
                    if (text.length > 0) {
                        this.rssCache.push(text);
                    }
                }
                
                this.rssLastUpdate = Date.now();
                this.rssCurrentIndex = 0;
            } catch (error) {
                console.error("Failed to process RSS feed:", error);
                this.rssCache = ["RSS feed error"];
            }
        });
    }
    
    /**
     * Get SpaceAPI status text
     */
    private getSpaceAPIText(): string {
        const config = this.config;
        const now = Date.now();
        const updateInterval = config.spaceApiUpdateInterval.value * 60 * 1000; // Convert minutes to ms
        
        // Update SpaceAPI cache if needed
        if (now - this.spaceApiLastUpdate > updateInterval || this.spaceApiCache === null) {
            this.updateSpaceAPICache();
        }
        
        // Generate text based on cached data
        if (!this.spaceApiCache) {
            return "Loading Space status...";
        }
        
        const isOpen = this.spaceApiCache.state?.open === true;
        const message = this.spaceApiCache.state?.message || "";
        
        switch (config.spaceApiFormat.selected) {
            case "message":
                return message || (isOpen ? config.spaceOpenText.text : config.spaceClosedText.text);
            case "both":
                const status = isOpen ? config.spaceOpenText.text : config.spaceClosedText.text;
                return message ? `${status} - ${message}` : status;
            case "status":
            default:
                return isOpen ? config.spaceOpenText.text : config.spaceClosedText.text;
        }
    }
    
    /**
     * Update SpaceAPI cache from endpoint
     */
    private async updateSpaceAPICache() {
        const config = this.config;
        
        try {
            const response = await fetch(config.spaceApiUrl.text);
            this.spaceApiCache = await response.json();
            this.spaceApiLastUpdate = Date.now();
        } catch (error) {
            console.error("Failed to fetch SpaceAPI status:", error);
            this.spaceApiCache = { state: { open: false, message: "Status unavailable" } };
        }
    }
}
