import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { XmasSprites } from "./XmasSprites.js"

export class XmasConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Christmas 🎄", true, false);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableXmas = this.controls.switch("Enable", false);
        
        // Santa & Sleigh
        const santaGroup = this.controls.group("Santa & Sleigh", true, false);
        const enableSanta = santaGroup.switch("Enable", true);
        const santaY = santaGroup.value("Y Position %", 80, 0, 100, 1);
        const santaSpeed = santaGroup.value("Speed", -0.3, -2.0, 2.0, 0.1);
        
        // Reindeer
        const reindeerGroup = this.controls.group("Reindeer", true, false);
        const reindeerCount = reindeerGroup.value("Count (0=lights only)", 1, 0, 6, 1);
        
        return {
            enableXmas,
            santa: {
                enable: enableSanta,
                y: santaY,
                speed: santaSpeed
            },
            reindeer: {
                count: reindeerCount
            }
        };
    }
    
    populateSprites(xmasManager: SpriteManager, box: PixelBox) {
        const config = this.config;
        
        if (!config.enableXmas.enabled) {
            return;
        }
        
        // Add Santa with sleigh if enabled
        if (config.santa.enable.enabled) {
            const y = Math.floor((box.height() * config.santa.y.value) / 100);
            const speed = -config.santa.speed.value; // Negative for left-to-right movement
            
            // Start Santa offscreen to the right
            const startX = box.width() + 10;
            
            // Add reindeer or lights FIRST (so they render in front of the sled)
            if (config.reindeer.count.value > 0) {
                // Create multiple reindeer based on count
                for (let i = 0; i < config.reindeer.count.value; i++) {
                    const reindeer = new XmasSprites.ReindeerSprite(
                        startX - 30 - (i * 20), // Position 30 pixels ahead of sleigh, each reindeer 20 pixels apart
                        y,
                        speed,
                        0
                    );
                    xmasManager.addSprite(reindeer);
                }
            } else {
                const lights = new XmasSprites.NoReindeerSprite(
                    startX - 30, // Position 30 pixels ahead of sleigh
                    y,
                    speed,
                    0
                );
                xmasManager.addSprite(lights);
            }
            
            // Add Santa's sled AFTER (renders behind reindeer)
            const santaSled = new XmasSprites.SantaSledSprite(
                startX,
                y,
                speed,
                0
            );
            
            xmasManager.addSprite(santaSled);
        }
    }
}
