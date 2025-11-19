import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"

// Import sprite framework
import SpriteManager from "./SpriteManager.js"
import { FishSprites } from "./FishSprites.js"
import { PlantSprites } from "./PlantSprites.js"
import { EnvironmentSprites } from "./EnvironmentSprites.js"
import { BackgroundSprites } from "./BackgroundSprites.js"

export default class Fishtank extends Animator {
    static category = "Aquarium"
    static title = "Fishtank Composition"
    static description = "Modular fishtank using sprite framework"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        try {
        
        // === FISH CONTROLS ===
        const fishGroup = controls.group("Fish");
        const numFish = fishGroup.value("Large fish count", 5, 0, 15, 1).value;
        const fishSpeedMultiplier = fishGroup.value("Speed multiplier", 1.0, 0.1, 3.0, 0.1).value;
        
        // Fish type distribution (percentages)
        const fishTropical = fishGroup.value("Tropical %", 20, 0, 100, 5).value;
        const fishGoldfish = fishGroup.value("Goldfish %", 20, 0, 100, 5).value;
        const fishClownfish = fishGroup.value("Clownfish %", 20, 0, 100, 5).value;
        const fishAngelfish = fishGroup.value("Angelfish %", 20, 0, 100, 5).value;
        const fishNeonTetra = fishGroup.value("Neon Tetra %", 20, 0, 100, 5).value;
        
        // Tiny fish school
        const schoolSize = fishGroup.value("Tiny fish school size", 8, 0, 30, 1).value;
        const schoolSpeedMultiplier = fishGroup.value("School speed multiplier", 1.0, 0.1, 3.0, 0.1).value;
        
        // === PLANT CONTROLS ===
        const plantGroup = controls.group("Plants & Vegetation");
        const numPlants = plantGroup.value("Total plants", 5, 0, 15, 1).value;
        
        // Plant type distribution (percentages)
        const plantTall = plantGroup.value("Tall plants %", 10, 0, 100, 5).value;
        const plantShort = plantGroup.value("Short plants %", 10, 0, 100, 5).value;
        const plantBush = plantGroup.value("Bushes %", 15, 0, 100, 5).value;
        const plantGrass = plantGroup.value("Grass %", 20, 0, 100, 5).value;
        const plantFlower = plantGroup.value("Flowers %", 15, 0, 100, 5).value;
        const plantFern = plantGroup.value("Ferns %", 10, 0, 100, 5).value;
        const plantTree = plantGroup.value("Trees %", 10, 0, 100, 5).value;
        const plantCactus = plantGroup.value("Cactus %", 10, 0, 100, 5).value;
        
        // === ENVIRONMENT CONTROLS ===
        const envGroup = controls.group("Environment Effects");
        
        // Bubbles
        const numBubbles = envGroup.value("Bubbles count", 5, 0, 30, 1).value;
        const bubbleSpeed = envGroup.value("Bubble rise speed", 0.4, 0.1, 2.0, 0.1).value;
        
        // Clouds
        const numClouds = envGroup.value("Clouds count", 0, 0, 10, 1).value;
        const cloudSpeed = envGroup.value("Cloud drift speed", 0.05, 0.01, 0.5, 0.01).value;
        
        // Celestial
        const showSun = envGroup.switch("Show Sun", false).enabled;
        const showMoon = envGroup.switch("Show Moon", false).enabled;
        const numStars = envGroup.value("Stars count", 0, 0, 50, 1).value;
        const showRainbow = envGroup.switch("Show Rainbow", false).enabled;
        
        // Rain
        const numRain = envGroup.value("Rain count", 0, 0, 50, 1).value;
        const rainSpeedMultiplier = envGroup.value("Rain speed multiplier", 1.0, 0.1, 3.0, 0.1).value;
        const rainFarPercent = envGroup.value("Rain far layer %", 40, 0, 100, 5).value;
        const rainMidPercent = envGroup.value("Rain mid layer %", 40, 0, 100, 5).value;
        const rainNearPercent = envGroup.value("Rain near layer %", 20, 0, 100, 5).value;
        
        // Snow
        const numSnow = envGroup.value("Snow count", 0, 0, 50, 1).value;
        const snowSpeedMultiplier = envGroup.value("Snow speed multiplier", 1.0, 0.1, 3.0, 0.1).value;
        const snowFarPercent = envGroup.value("Snow far layer %", 40, 0, 100, 5).value;
        const snowMidPercent = envGroup.value("Snow mid layer %", 40, 0, 100, 5).value;
        const snowNearPercent = envGroup.value("Snow near layer %", 20, 0, 100, 5).value;
        
        // Thunder
        const numThunder = envGroup.value("Lightning bolts", 0, 0, 5, 1).value;
        
        // === BACKGROUND CONTROLS ===
        const bgGroup = controls.group("Background");
        const useBackground = bgGroup.switch("Use Image", true);
        const imageUrl = bgGroup.input("Image URL", "https://github.com/psy0rz/ledder/raw/main/doc/2022-12-30_23-25.png");
        const imageFitChoices = [
            {id: "cover", name: "Cover"},
            {id: "contain", name: "Contain"},
            {id: "fill", name: "Fill"}
        ];
        const imageFit = bgGroup.select("Fit Mode", "cover", imageFitChoices);
        const imageOpacity = bgGroup.value("Opacity", 0.5, 0, 1, 0.1);

        // Create sprite managers
        const backgroundManager = new SpriteManager();
        const fishManager = new SpriteManager();
        const plantManager = new SpriteManager();
        const environmentManager = new SpriteManager();
        const schoolManager = new SpriteManager();

        // Add background sprite if enabled
        if (useBackground.enabled && imageUrl.text) {
            const background = BackgroundSprites.createImageBackground(box.width(), box.height());
            backgroundManager.addSprite(background);
            
            // Load image asynchronously without blocking sprite creation
            background.loadImageData(imageUrl.text, imageFit.selected, imageOpacity.value)
                .catch(err => console.error("Background load failed:", err));
        }

        // Add plants at bottom
        const plantTypes = [
            PlantSprites.TallPlant, 
            PlantSprites.ShortPlant,
            PlantSprites.Bush,
            PlantSprites.SmallBush,
            PlantSprites.PineTree,
            PlantSprites.SmallPine,
            PlantSprites.OakTree,
            PlantSprites.SmallOak,
            PlantSprites.Grass,
            PlantSprites.Flower,
            PlantSprites.Cactus,
            PlantSprites.Fern
        ];
        
        for (let i = 0; i < numPlants; i++) {
            const plantX = (i * (box.width() / numPlants)) + Math.random() * 3;
            const plantY = box.height() - 10;
            const PlantClass = plantTypes[Math.floor(Math.random() * plantTypes.length)];
            plantManager.addSprite(new PlantClass(plantX, plantY));
        }

        // Add fish
        const fishTypes = [FishSprites.TropicalFish, FishSprites.Goldfish, FishSprites.Clownfish, FishSprites.Angelfish, FishSprites.NeonTetra];
        for (let i = 0; i < numFish; i++) {
            const fishX = Math.random() * (box.width() - 16);
            const fishY = 2 + Math.random() * (box.height() - 16);
            const FishClass = fishTypes[Math.floor(Math.random() * fishTypes.length)];
            
            // Randomly spawn some fish going left (negative speedX)
            const goingLeft = Math.random() > 0.5;
            const speedX = goingLeft ? -0.08 : 0.08;
            const speedY = (Math.random() - 0.5) * 0.04;
            
            fishManager.addSprite(new FishClass(fishX, fishY, speedX, speedY));
        }

        // Add tiny fish school with formation
        if (schoolSize > 0) {
            // School formation - leader and followers in a loose formation
            const schoolX = Math.random() * (box.width() / 2);
            const schoolY = 5 + Math.random() * (box.height() / 2);
            
            for (let i = 0; i < schoolSize; i++) {
                // Create a loose school formation
                const offsetX = (i % 4) * 3 - 6;  // Horizontal offset in formation
                const offsetY = Math.floor(i / 4) * 2 - 2; // Vertical offset in formation
                const randomX = (Math.random() - 0.5) * 2; // Small random variation
                const randomY = (Math.random() - 0.5) * 2;
                
                schoolManager.addSprite(new FishSprites.TinyFishSchool(
                    schoolX + offsetX + randomX,
                    schoolY + offsetY + randomY,
                    offsetX,
                    offsetY
                ));
            }
        }

        // Add environment elements - multiple types can be active simultaneously
        
        // Bubbles
        for (let i = 0; i < numBubbles; i++) {
            const x = Math.random() * box.width();
            const y = box.height() - 2 - Math.random() * 5;
            environmentManager.addSprite(new EnvironmentSprites.Bubble(x, y));
        }
        
        // Clouds
        for (let i = 0; i < numClouds; i++) {
            const x = Math.random() * box.width();
            const y = Math.random() * (box.height() / 3);
            const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            environmentManager.addSprite(new EnvironmentSprites.Cloud(x, y, size));
        }
        
        // Sun
        if (showSun) {
            const sunX = box.width() - 10;
            const sunY = 2;
            environmentManager.addSprite(new EnvironmentSprites.Sun(sunX, sunY));
        }
        
        // Moon
        if (showMoon) {
            const moonX = box.width() - 8;
            const moonY = 2;
            environmentManager.addSprite(new EnvironmentSprites.Moon(moonX, moonY));
        }
        
        // Stars
        for (let i = 0; i < numStars; i++) {
            const x = Math.random() * box.width();
            const y = Math.random() * (box.height() / 2);
            environmentManager.addSprite(new EnvironmentSprites.Star(x, y));
        }
        
        // Rain with depth layers
        for (let i = 0; i < numRain; i++) {
            const x = Math.random() * box.width();
            const y = Math.random() * box.height();
            // Distribute across depth layers: 40% far, 40% mid, 20% near
            const rand = Math.random();
            const depth = rand < 0.4 ? 'far' : rand < 0.8 ? 'mid' : 'near';
            environmentManager.addSprite(new EnvironmentSprites.Raindrop(x, y, depth));
        }
        
        // Snow with depth layers
        for (let i = 0; i < numSnow; i++) {
            const x = Math.random() * box.width();
            const y = Math.random() * box.height();
            // Distribute across depth layers: 40% far, 40% mid, 20% near
            const rand = Math.random();
            const depth = rand < 0.4 ? 'far' : rand < 0.8 ? 'mid' : 'near';
            environmentManager.addSprite(new EnvironmentSprites.Snowflake(x, y, depth));
        }
        
        // Thunder/Lightning
        for (let i = 0; i < numThunder; i++) {
            const x = Math.random() * box.width();
            const y = Math.random() * (box.height() / 2);
            environmentManager.addSprite(new EnvironmentSprites.Thunder(x, y));
        }
        
        // Rainbow
        if (showRainbow) {
            const rainbowX = Math.floor((box.width() - 8) / 2);
            const rainbowY = Math.floor(box.height() / 4);
            environmentManager.addSprite(new EnvironmentSprites.Rainbow(rainbowX, rainbowY));
        }


        // Main animation loop
        scheduler.intervalControlled(controls.value("Speed", 1, 0.1, 5, 0.1), (frameNr) => {
            box.clear();

            // Render all sprites in order (background first, then plants, fish, school, bubbles)
            backgroundManager.update(frameNr, box.width(), box.height());
            const bgPixels = backgroundManager.render();
            box.add(bgPixels);

            plantManager.update(frameNr, box.width(), box.height());
            box.add(plantManager.render());

            fishManager.update(frameNr, box.width(), box.height());
            box.add(fishManager.render());

            schoolManager.update(frameNr, box.width(), box.height());
            box.add(schoolManager.render());

            environmentManager.update(frameNr, box.width(), box.height());
            box.add(environmentManager.render());
        });
        
        } catch (error) {
            console.error("=== Fishtank error ===", error);
            throw error;
        }
    }
}
