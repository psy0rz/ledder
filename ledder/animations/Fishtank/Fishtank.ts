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
import { BuildingSprites } from "./BuildingSprites.js"

export default class Fishtank extends Animator {
    static category = "Aquarium"
    static title = "Fishtank Composition"
    static description = "Modular fishtank using sprite framework"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        try {
        
        // === FISH CONTROLS ===
        const fishGroup = controls.group("Fish");
        const enableFish = fishGroup.switch("Enable Fish", true).enabled;
        const numFish = enableFish ? fishGroup.value("Large fish count", 5, 0, 15, 1).value : 0;
        const fishSpeedMultiplier = fishGroup.value("Speed multiplier", 1.0, 0.1, 3.0, 0.1).value;
        
        // Fish type distribution (percentages)
        const fishTropical = fishGroup.value("Tropical %", 20, 0, 100, 5).value;
        const fishGoldfish = fishGroup.value("Goldfish %", 20, 0, 100, 5).value;
        const fishClownfish = fishGroup.value("Clownfish %", 20, 0, 100, 5).value;
        const fishAngelfish = fishGroup.value("Angelfish %", 20, 0, 100, 5).value;
        const fishNeonTetra = fishGroup.value("Neon Tetra %", 20, 0, 100, 5).value;
        
        // Tiny fish school
        const schoolSize = enableFish ? fishGroup.value("Tiny fish school size", 8, 0, 30, 1).value : 0;
        const schoolSpeedMultiplier = fishGroup.value("School speed multiplier", 1.0, 0.1, 3.0, 0.1).value;
        
        // === PLANT CONTROLS ===
        const plantGroup = controls.group("Plants & Vegetation");
        const enablePlants = plantGroup.switch("Enable Plants", true).enabled;
        const numPlants = enablePlants ? plantGroup.value("Total plants", 5, 0, 15, 1).value : 0;
        
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
        const enableEnvironment = envGroup.switch("Enable Effects", true).enabled;
        
        // Bubbles
        const numBubbles = enableEnvironment ? envGroup.value("Bubbles count", 5, 0, 30, 1).value : 0;
        const bubbleSpeed = envGroup.value("Bubble rise speed", 0.4, 0.1, 2.0, 0.1).value;
        
        // Clouds
        const numClouds = enableEnvironment ? envGroup.value("Clouds count", 0, 0, 10, 1).value : 0;
        const cloudSpeed = envGroup.value("Cloud drift speed", 0.05, 0.01, 0.5, 0.01).value;
        
        // Celestial
        const showSun = enableEnvironment && envGroup.switch("Show Sun", false).enabled;
        const showMoon = enableEnvironment && envGroup.switch("Show Moon", false).enabled;
        const numStars = enableEnvironment ? envGroup.value("Stars count", 0, 0, 50, 1).value : 0;
        const showRainbow = enableEnvironment && envGroup.switch("Show Rainbow", false).enabled;
        
        // Rain
        const numRain = enableEnvironment ? envGroup.value("Rain count", 0, 0, 50, 1).value : 0;
        const rainSpeedMultiplier = envGroup.value("Rain speed multiplier", 1.0, 0.1, 3.0, 0.1).value;
        const rainFarPercent = envGroup.value("Rain far layer %", 40, 0, 100, 5).value;
        const rainMidPercent = envGroup.value("Rain mid layer %", 40, 0, 100, 5).value;
        const rainNearPercent = envGroup.value("Rain near layer %", 20, 0, 100, 5).value;
        
        // Snow
        const numSnow = enableEnvironment ? envGroup.value("Snow count", 0, 0, 50, 1).value : 0;
        const snowSpeedMultiplier = envGroup.value("Snow speed multiplier", 1.0, 0.1, 3.0, 0.1).value;
        const snowFarPercent = envGroup.value("Snow far layer %", 40, 0, 100, 5).value;
        const snowMidPercent = envGroup.value("Snow mid layer %", 40, 0, 100, 5).value;
        const snowNearPercent = envGroup.value("Snow near layer %", 20, 0, 100, 5).value;
        
        // Thunder
        const numThunder = enableEnvironment ? envGroup.value("Lightning bolts", 0, 0, 5, 1).value : 0;
        
        // === BUILDING CONTROLS ===
        const buildingGroup = controls.group("Buildings");
        const enableBuildings = buildingGroup.switch("Enable Buildings", false).enabled;
        
        // Building type selection
        const buildingChoices = [
            {id: "factory", name: "Factory"},
            {id: "school", name: "School"},
            {id: "windmill", name: "Windmill"},
            {id: "liberty", name: "Statue of Liberty"},
            {id: "eiffel", name: "Eiffel Tower"},
            {id: "castle", name: "Castle"},
            {id: "church", name: "Church"},
            {id: "tower", name: "Tower"}
        ];
        const buildingType = buildingGroup.select("Building Type", "factory", buildingChoices);
        
        // Building positioning
        const buildingX = enableBuildings ? buildingGroup.value("X Position", 10, 0, 100, 1).value : 0;
        const buildingY = enableBuildings ? buildingGroup.value("Y Position", 10, 0, 100, 1).value : 0;
        const showBuilding = buildingGroup.switch("Show Building", false).enabled;
        
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
        const buildingManager = new SpriteManager();
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

        // Add building sprite if enabled
        if (enableBuildings && showBuilding) {
            let building;
            switch (buildingType.selected) {
                case "factory":
                    building = new BuildingSprites.Factory(buildingX, buildingY);
                    break;
                case "school":
                    building = new BuildingSprites.School(buildingX, buildingY);
                    break;
                case "windmill":
                    building = new BuildingSprites.Windmill(buildingX, buildingY);
                    break;
                case "liberty":
                    building = new BuildingSprites.LibertyStatue(buildingX, buildingY);
                    break;
                case "eiffel":
                    building = new BuildingSprites.EiffelTower(buildingX, buildingY);
                    break;
                case "castle":
                    building = new BuildingSprites.Castle(buildingX, buildingY);
                    break;
                case "church":
                    building = new BuildingSprites.Church(buildingX, buildingY);
                    break;
                case "tower":
                    building = new BuildingSprites.Tower(buildingX, buildingY);
                    break;
                default:
                    building = new BuildingSprites.Factory(buildingX, buildingY);
            }
            buildingManager.addSprite(building);
        }

        // Add plants at bottom - build weighted pool based on percentages
        const plantTypePool: (typeof PlantSprites.TallPlant | typeof PlantSprites.ShortPlant | typeof PlantSprites.Bush | 
                              typeof PlantSprites.SmallBush | typeof PlantSprites.PineTree | typeof PlantSprites.SmallPine |
                              typeof PlantSprites.OakTree | typeof PlantSprites.SmallOak | typeof PlantSprites.Grass |
                              typeof PlantSprites.Flower | typeof PlantSprites.Cactus | typeof PlantSprites.Fern)[] = [];
        
        if (plantTall > 0) {
            for (let i = 0; i < plantTall; i++) plantTypePool.push(PlantSprites.TallPlant);
        }
        if (plantShort > 0) {
            for (let i = 0; i < plantShort; i++) plantTypePool.push(PlantSprites.ShortPlant);
        }
        if (plantBush > 0) {
            for (let i = 0; i < plantBush; i++) {
                plantTypePool.push(PlantSprites.Bush);
                plantTypePool.push(PlantSprites.SmallBush);
            }
        }
        if (plantGrass > 0) {
            for (let i = 0; i < plantGrass; i++) plantTypePool.push(PlantSprites.Grass);
        }
        if (plantFlower > 0) {
            for (let i = 0; i < plantFlower; i++) plantTypePool.push(PlantSprites.Flower);
        }
        if (plantFern > 0) {
            for (let i = 0; i < plantFern; i++) plantTypePool.push(PlantSprites.Fern);
        }
        if (plantTree > 0) {
            for (let i = 0; i < plantTree; i++) {
                plantTypePool.push(PlantSprites.PineTree);
                plantTypePool.push(PlantSprites.SmallPine);
                plantTypePool.push(PlantSprites.OakTree);
                plantTypePool.push(PlantSprites.SmallOak);
            }
        }
        if (plantCactus > 0) {
            for (let i = 0; i < plantCactus; i++) plantTypePool.push(PlantSprites.Cactus);
        }
        
        for (let i = 0; i < numPlants; i++) {
            if (plantTypePool.length > 0) {
                const plantX = (i * (box.width() / numPlants)) + Math.random() * 3;
                const plantY = box.height() - 10;
                const PlantClass = plantTypePool[Math.floor(Math.random() * plantTypePool.length)];
                plantManager.addSprite(new PlantClass(plantX, plantY));
            }
        }

        // Add fish - build weighted pool based on percentages
        const fishTypePool: (typeof FishSprites.TropicalFish | typeof FishSprites.Goldfish | typeof FishSprites.Clownfish | 
                             typeof FishSprites.Angelfish | typeof FishSprites.NeonTetra)[] = [];
        
        if (fishTropical > 0) {
            for (let i = 0; i < fishTropical; i++) fishTypePool.push(FishSprites.TropicalFish);
        }
        if (fishGoldfish > 0) {
            for (let i = 0; i < fishGoldfish; i++) fishTypePool.push(FishSprites.Goldfish);
        }
        if (fishClownfish > 0) {
            for (let i = 0; i < fishClownfish; i++) fishTypePool.push(FishSprites.Clownfish);
        }
        if (fishAngelfish > 0) {
            for (let i = 0; i < fishAngelfish; i++) fishTypePool.push(FishSprites.Angelfish);
        }
        if (fishNeonTetra > 0) {
            for (let i = 0; i < fishNeonTetra; i++) fishTypePool.push(FishSprites.NeonTetra);
        }
        
        for (let i = 0; i < numFish; i++) {
            if (fishTypePool.length > 0) {
                const fishX = Math.random() * (box.width() - 16);
                const fishY = 2 + Math.random() * (box.height() - 16);
                const FishClass = fishTypePool[Math.floor(Math.random() * fishTypePool.length)];
                
                // Randomly spawn some fish going left (negative speedX)
                const goingLeft = Math.random() > 0.5;
                const baseSpeed = 0.08 * fishSpeedMultiplier;
                const speedX = goingLeft ? -baseSpeed : baseSpeed;
                const speedY = (Math.random() - 0.5) * 0.04 * fishSpeedMultiplier;
                
                fishManager.addSprite(new FishClass(fishX, fishY, speedX, speedY));
            }
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

        // Add environment elements - multiple types can be active simultaneously
        
        // Bubbles
        for (let i = 0; i < numBubbles; i++) {
            const x = Math.random() * box.width();
            const y = box.height() - 2 - Math.random() * 5;
            environmentManager.addSprite(new EnvironmentSprites.Bubble(x, y, bubbleSpeed));
        }
        
        // Clouds
        for (let i = 0; i < numClouds; i++) {
            const x = Math.random() * box.width();
            const y = Math.random() * (box.height() / 3);
            const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            environmentManager.addSprite(new EnvironmentSprites.Cloud(x, y, size, cloudSpeed));
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
        
        // Rain with depth layers based on user percentages
        const totalRainPercent = rainFarPercent + rainMidPercent + rainNearPercent;
        for (let i = 0; i < numRain; i++) {
            const x = Math.random() * box.width();
            const y = Math.random() * box.height();
            
            // Distribute based on user percentages
            let depth: 'far' | 'mid' | 'near' = 'mid';
            if (totalRainPercent > 0) {
                const rand = Math.random() * totalRainPercent;
                if (rand < rainFarPercent) {
                    depth = 'far';
                } else if (rand < rainFarPercent + rainMidPercent) {
                    depth = 'mid';
                } else {
                    depth = 'near';
                }
            }
            
            environmentManager.addSprite(new EnvironmentSprites.Raindrop(x, y, depth, rainSpeedMultiplier));
        }
        
        // Snow with depth layers based on user percentages
        const totalSnowPercent = snowFarPercent + snowMidPercent + snowNearPercent;
        for (let i = 0; i < numSnow; i++) {
            const x = Math.random() * box.width();
            const y = Math.random() * box.height();
            
            // Distribute based on user percentages
            let depth: 'far' | 'mid' | 'near' = 'mid';
            if (totalSnowPercent > 0) {
                const rand = Math.random() * totalSnowPercent;
                if (rand < snowFarPercent) {
                    depth = 'far';
                } else if (rand < snowFarPercent + snowMidPercent) {
                    depth = 'mid';
                } else {
                    depth = 'near';
                }
            }
            
            environmentManager.addSprite(new EnvironmentSprites.Snowflake(x, y, depth, snowSpeedMultiplier));
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

            // Render all sprites in order (background first, buildings, plants, fish, school, environment)
            backgroundManager.update(frameNr, box.width(), box.height());
            const bgPixels = backgroundManager.render();
            box.add(bgPixels);

            buildingManager.update(frameNr, box.width(), box.height());
            box.add(buildingManager.render());

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
