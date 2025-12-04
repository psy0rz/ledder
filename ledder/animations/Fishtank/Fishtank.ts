import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"

// Import sprite framework
import SpriteManager from "./SpriteManager.js"
import { PostFX } from "./PostFX.js"
import { TextPostFX } from "./TextPostFX.js"

// Import configuration classes
import { FishConfig } from "./FishConfig.js"
import { PlantConfig } from "./PlantConfig.js"
import { EnvironmentConfig } from "./EnvironmentConfig.js"
import { BackgroundConfig } from "./BackgroundConfig.js"
import { BuildingConfig } from "./BuildingConfig.js"
import { TextConfig } from "./TextConfig.js"
import { XmasConfig } from "./XmasConfig.js"
import { GameConfig } from "./GameConfig.js"
import { PostFXConfig } from "./PostFXConfig.js"
import { TextPostFXConfig } from "./TextPostFXConfig.js"

export default class Fishtank extends Animator {
    static category = "Aquarium"
    static title = "Fishtank Composition"
    static description = "Modular fishtank using sprite framework"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        try {
        // Create sprite managers (in layer order: back to front)
        const backgroundManager = new SpriteManager();
        const environmentManager = new SpriteManager();
        const plantManager = new SpriteManager();
        const buildingManager = new SpriteManager();
        const fishManager = new SpriteManager();
        const schoolManager = new SpriteManager();
        const gameManager = new SpriteManager();
        const xmasManager = new SpriteManager();
        const textManager = new SpriteManager();

        // Create and populate sprites using config classes (in layer order)
        const backgroundConfig = new BackgroundConfig(controls);
        backgroundConfig.populateSprites(backgroundManager, box);
        
        const environmentConfig = new EnvironmentConfig(controls);
        environmentConfig.populateSprites(environmentManager, box);
        
        const plantConfig = new PlantConfig(controls);
        plantConfig.populateSprites(plantManager, box);
        
        const buildingConfig = new BuildingConfig(controls);
        buildingConfig.populateSprites(buildingManager, box);
        
        const fishConfig = new FishConfig(controls);
        fishConfig.populateSprites(fishManager, schoolManager, box);
        
        const gameConfig = new GameConfig(controls);
        gameConfig.populateSprites(gameManager, box);
        
        const xmasConfig = new XmasConfig(controls);
        xmasConfig.populateSprites(xmasManager, box);
        
        const textConfig = new TextConfig(controls);
        textConfig.populateSprites(textManager, box);
        
        // Post-processing effects (at the end)
        const postFXConfig = new PostFXConfig(controls);
        const postFX = new PostFX();
        
        // Text-specific PostFX system
        const textPostFXConfig = new TextPostFXConfig(controls);
        const textPostFX = new TextPostFX();


        // Main animation loop
        scheduler.intervalControlled(controls.value("Speed", 1, 0.1, 5, 0.1), (frameNr) => {
            box.clear();

            // Render all sprites in correct layer order (back to front):
            // Collect all layers except text in a combined pixel list for post-FX
            const combinedPixels = new PixelList();
            
            // 1. Background (furthest back)
            backgroundManager.update(frameNr, box.width(), box.height());
            combinedPixels.add(backgroundManager.render());

            // 2. Environment (weather effects, clouds, etc.)
            environmentManager.update(frameNr, box.width(), box.height());
            combinedPixels.add(environmentManager.render());

            // 3. Plants (aquatic plants, seaweed)
            plantManager.update(frameNr, box.width(), box.height());
            combinedPixels.add(plantManager.render());

            // 4. Buildings (structures)
            buildingManager.update(frameNr, box.width(), box.height());
            combinedPixels.add(buildingManager.render());

            // 5. Fish (individual fish)
            fishManager.update(frameNr, box.width(), box.height());
            combinedPixels.add(fishManager.render());

            // 6. Fish schools (grouped fish)
            schoolManager.update(frameNr, box.width(), box.height());
            combinedPixels.add(schoolManager.render());

            // 7. Game sprites (arcade game characters)
            gameManager.update(frameNr, box.width(), box.height());
            gameConfig.updateCollisions(gameManager);
            combinedPixels.add(gameManager.render());
            
            // 8. Christmas sprites (Santa, reindeer)
            xmasManager.update(frameNr, box.width(), box.height());
            combinedPixels.add(xmasManager.render());
            
            // Apply post-processing effects to all layers except text
            const processedPixels = postFX.apply(
                combinedPixels,
                box.width(),
                box.height(),
                postFXConfig.getOptions()
            );
            box.add(processedPixels);

            // 9. Text (foreground overlay - with text-specific post-FX)
            textManager.update(frameNr, box.width(), box.height());
            const textPixels = textManager.render();
            
            // Apply text-specific effects
            const processedTextPixels = textPostFX.apply(
                textPixels,
                box.width(),
                box.height(),
                textPostFXConfig.getOptions()
            );
            box.add(processedTextPixels);
        });
        
        } catch (error) {
            console.error("=== Fishtank error ===", error);
            throw error;
        }
    }
}
