import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { FishSprites } from "./FishSprites.js"

export class FishConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Fish", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableFish = this.controls.switch("Enable", true);
        const fishSpeedMultiplier = this.controls.value("Speed multiplier", 1.0, 0.1, 3.0, 0.1);
        
        // Fish type distribution - each with its own subgroup
        const tropicalGroup = this.controls.group("Tropical Fish", true, true);
        const fishTropical = tropicalGroup.value("Count (0=disabled)", 3, 0, 20, 1);
        
        const goldfishGroup = this.controls.group("Goldfish", true, true);
        const fishGoldfish = goldfishGroup.value("Count (0=disabled)", 3, 0, 20, 1);
        
        const clownfishGroup = this.controls.group("Clownfish", true, true);
        const fishClownfish = clownfishGroup.value("Count (0=disabled)", 3, 0, 20, 1);
        
        const angelfishGroup = this.controls.group("Angelfish", true, true);
        const fishAngelfish = angelfishGroup.value("Count (0=disabled)", 3, 0, 20, 1);
        
        const neonTetraGroup = this.controls.group("Neon Tetra", true, true);
        const fishNeonTetra = neonTetraGroup.value("Count (0=disabled)", 3, 0, 20, 1);
        
        const potOfPetuniasGroup = this.controls.group("Pot of Petunias 🌺", true, true);
        const fishPotOfPetunias = potOfPetuniasGroup.value("Count (0=disabled)", 0, 0, 5, 1);
        
        // Tiny fish school
        const schoolGroup = this.controls.group("Tiny Fish School", true, true);
        const enableSchool = schoolGroup.switch("Enable", true);
        const schoolSize = schoolGroup.value("School size", 8, 0, 30, 1);
        const schoolSpeedMultiplier = schoolGroup.value("Speed multiplier", 1.0, 0.1, 3.0, 0.1);
        
        return {
            enableFish,
            fishSpeedMultiplier,
            fishTropical,
            fishGoldfish,
            fishClownfish,
            fishAngelfish,
            fishNeonTetra,
            fishPotOfPetunias,
            enableSchool,
            schoolSize,
            schoolSpeedMultiplier
        };
    }
    
    populateSprites(fishManager: SpriteManager, schoolManager: SpriteManager, box: PixelBox) {
        const config = this.config;
        
        if (!config.enableFish.enabled) {
            return;
        }
        
        const fishSpeedMultiplier = config.fishSpeedMultiplier.value;
        const schoolSize = config.schoolSize.value;
        const schoolSpeedMultiplier = config.schoolSpeedMultiplier.value;
        
        // Add each fish type directly based on count
        const addFish = (FishClass: any, count: number) => {
            for (let i = 0; i < count; i++) {
                const fishX = Math.random() * (box.width() - 16);
                const fishY = 2 + Math.random() * (box.height() - 16);
                
                // Randomly spawn some fish going left (negative speedX)
                const goingLeft = Math.random() > 0.5;
                const baseSpeed = 0.08 * fishSpeedMultiplier;
                const speedX = goingLeft ? -baseSpeed : baseSpeed;
                const speedY = (Math.random() - 0.5) * 0.04 * fishSpeedMultiplier;
                
                fishManager.addSprite(new FishClass(fishX, fishY, speedX, speedY));
            }
        };
        
        addFish(FishSprites.TropicalFish, config.fishTropical.value);
        addFish(FishSprites.Goldfish, config.fishGoldfish.value);
        addFish(FishSprites.Clownfish, config.fishClownfish.value);
        addFish(FishSprites.Angelfish, config.fishAngelfish.value);
        addFish(FishSprites.NeonTetra, config.fishNeonTetra.value);
        
        // Add Pot of Petunias (special case - they fall, not swim)
        for (let i = 0; i < config.fishPotOfPetunias.value; i++) {
            const potX = Math.random() * (box.width() - 8);
            const potY = -10 - Math.random() * 20; // Start above screen
            fishManager.addSprite(new FishSprites.PotOfPetunias(potX, potY));
        }
        
        // Add tiny fish school with formation
        if (config.enableSchool.enabled && schoolSize > 0) {
            const schoolX = Math.random() * (box.width() / 2);
            const schoolY = 5 + Math.random() * (box.height() / 2);
            
            for (let i = 0; i < schoolSize; i++) {
                // Create a loose school formation
                const offsetX = (i % 4) * 3 - 6;
                const offsetY = Math.floor(i / 4) * 2 - 2;
                const randomX = (Math.random() - 0.5) * 2;
                const randomY = (Math.random() - 0.5) * 2;
                
                const baseSpeed = 0.1 * schoolSpeedMultiplier;
                schoolManager.addSprite(new FishSprites.TinyFishSchool(
                    schoolX + offsetX + randomX,
                    schoolY + offsetY + randomY,
                    offsetX,
                    offsetY,
                    baseSpeed
                ));
            }
        }
    }
}
