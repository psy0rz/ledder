import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { EnvironmentSprites } from "./EnvironmentSprites.js"

export class EnvironmentConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Environment Effects", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableEnvironment = this.controls.switch("Enable", true);
        
        // Bubbles
        const bubblesGroup = this.controls.group("Bubbles", true, true);
        const enableBubbles = bubblesGroup.switch("Enable", false);
        const numBubbles = bubblesGroup.value("Count", 5, 0, 30, 1);
        const bubbleSpeed = bubblesGroup.value("Rise speed", 0.4, 0.1, 2.0, 0.1);
        
        // Clouds
        const cloudsGroup = this.controls.group("Clouds", true, true);
        const enableClouds = cloudsGroup.switch("Enable", false);
        const numClouds = cloudsGroup.value("Count", 3, 0, 10, 1);
        const cloudSpeed = cloudsGroup.value("Drift speed", 0.05, 0.01, 0.5, 0.01);
        
        // Sun
        const sunGroup = this.controls.group("Sun", true, true);
        const showSun = sunGroup.switch("Enable", false);
        
        // Moon
        const moonGroup = this.controls.group("Moon", true, true);
        const showMoon = moonGroup.switch("Enable", false);
        
        // Stars
        const starsGroup = this.controls.group("Stars", true, true);
        const enableStars = starsGroup.switch("Enable", false);
        const numStars = starsGroup.value("Count", 10, 0, 50, 1);
        
        // Rainbow
        const rainbowGroup = this.controls.group("Rainbow", true, true);
        const showRainbow = rainbowGroup.switch("Enable", false);
        
        // Rain
        const rainGroup = this.controls.group("Rain", true, true);
        const enableRain = rainGroup.switch("Enable", false);
        const numRain = rainGroup.value("Count", 20, 0, 50, 1);
        const rainSpeedMultiplier = rainGroup.value("Speed multiplier", 1.0, 0.1, 3.0, 0.1);
        const rainFarPercent = rainGroup.value("Far layer %", 40, 0, 100, 5);
        const rainMidPercent = rainGroup.value("Mid layer %", 40, 0, 100, 5);
        const rainNearPercent = rainGroup.value("Near layer %", 20, 0, 100, 5);
        
        // Snow
        const snowGroup = this.controls.group("Snow", true, true);
        const enableSnow = snowGroup.switch("Enable", false);
        const numSnow = snowGroup.value("Count", 20, 0, 50, 1);
        const snowSpeedMultiplier = snowGroup.value("Speed multiplier", 1.0, 0.1, 3.0, 0.1);
        const snowFarPercent = snowGroup.value("Far layer %", 40, 0, 100, 5);
        const snowMidPercent = snowGroup.value("Mid layer %", 40, 0, 100, 5);
        const snowNearPercent = snowGroup.value("Near layer %", 20, 0, 100, 5);
        
        // Thunder
        const thunderGroup = this.controls.group("Lightning", true, true);
        const enableThunder = thunderGroup.switch("Enable", false);
        const numThunder = thunderGroup.value("Bolt count", 2, 0, 5, 1);
        
        return {
            enableEnvironment,
            enableBubbles,
            numBubbles,
            bubbleSpeed,
            enableClouds,
            numClouds,
            cloudSpeed,
            showSun,
            showMoon,
            enableStars,
            numStars,
            showRainbow,
            enableRain,
            numRain,
            rainSpeedMultiplier,
            rainFarPercent,
            rainMidPercent,
            rainNearPercent,
            enableSnow,
            numSnow,
            snowSpeedMultiplier,
            snowFarPercent,
            snowMidPercent,
            snowNearPercent,
            enableThunder,
            numThunder
        };
    }
    
    populateSprites(environmentManager: SpriteManager, box: PixelBox) {
        const config = this.config;
        
        if (!config.enableEnvironment.enabled) {
            return;
        }
        
        // Bubbles
        if (config.enableBubbles.enabled) {
            for (let i = 0; i < config.numBubbles.value; i++) {
                const x = Math.random() * box.width();
                const y = box.height() - 2 - Math.random() * 5;
                environmentManager.addSprite(new EnvironmentSprites.Bubble(x, y, config.bubbleSpeed.value));
            }
        }
        
        // Clouds
        if (config.enableClouds.enabled) {
            for (let i = 0; i < config.numClouds.value; i++) {
                const x = Math.random() * box.width();
                const y = Math.random() * (box.height() / 3);
                const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
                const size = sizes[Math.floor(Math.random() * sizes.length)];
                environmentManager.addSprite(new EnvironmentSprites.Cloud(x, y, size, config.cloudSpeed.value));
            }
        }
        
        // Sun
        if (config.showSun.enabled) {
            const sunX = box.width() - 10;
            const sunY = 2;
            environmentManager.addSprite(new EnvironmentSprites.Sun(sunX, sunY));
        }
        
        // Moon
        if (config.showMoon.enabled) {
            const moonX = box.width() - 8;
            const moonY = 2;
            environmentManager.addSprite(new EnvironmentSprites.Moon(moonX, moonY));
        }
        
        // Stars
        if (config.enableStars.enabled) {
            for (let i = 0; i < config.numStars.value; i++) {
                const x = Math.random() * box.width();
                const y = Math.random() * (box.height() / 2);
                environmentManager.addSprite(new EnvironmentSprites.Star(x, y));
            }
        }
        
        // Rain with depth layers
        if (config.enableRain.enabled) {
            const totalRainPercent = config.rainFarPercent.value + config.rainMidPercent.value + config.rainNearPercent.value;
            for (let i = 0; i < config.numRain.value; i++) {
                const x = Math.random() * box.width();
                const y = Math.random() * box.height();
                
                let depth: 'far' | 'mid' | 'near' = 'mid';
                if (totalRainPercent > 0) {
                    const rand = Math.random() * totalRainPercent;
                    if (rand < config.rainFarPercent.value) {
                        depth = 'far';
                    } else if (rand < config.rainFarPercent.value + config.rainMidPercent.value) {
                        depth = 'mid';
                    } else {
                        depth = 'near';
                    }
                }
                
                environmentManager.addSprite(new EnvironmentSprites.Raindrop(x, y, depth, config.rainSpeedMultiplier.value));
            }
        }
        
        // Snow with depth layers
        if (config.enableSnow.enabled) {
            const totalSnowPercent = config.snowFarPercent.value + config.snowMidPercent.value + config.snowNearPercent.value;
            for (let i = 0; i < config.numSnow.value; i++) {
                const x = Math.random() * box.width();
                const y = Math.random() * box.height();
                
                let depth: 'far' | 'mid' | 'near' = 'mid';
                if (totalSnowPercent > 0) {
                    const rand = Math.random() * totalSnowPercent;
                    if (rand < config.snowFarPercent.value) {
                        depth = 'far';
                    } else if (rand < config.snowFarPercent.value + config.snowMidPercent.value) {
                        depth = 'mid';
                    } else {
                        depth = 'near';
                    }
                }
                
                environmentManager.addSprite(new EnvironmentSprites.Snowflake(x, y, depth, config.snowSpeedMultiplier.value));
            }
        }
        
        // Thunder/Lightning
        if (config.enableThunder.enabled) {
            for (let i = 0; i < config.numThunder.value; i++) {
                const x = Math.random() * box.width();
                const y = Math.random() * (box.height() / 2);
                environmentManager.addSprite(new EnvironmentSprites.Thunder(x, y));
            }
        }
        
        // Rainbow - transparent arc covering full display width
        if (config.showRainbow.enabled) {
            const rainbowY = Math.floor(box.height() / 4);
            environmentManager.addSprite(new EnvironmentSprites.Rainbow(0, rainbowY));
        }
    }
}
