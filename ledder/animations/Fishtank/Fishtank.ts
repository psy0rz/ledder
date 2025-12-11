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
import { FractalConfig } from "./FractalConfig.js"
import { FishConfig } from "./FishConfig.js"
import { PlantConfig } from "./PlantConfig.js"
import { EnvironmentConfig } from "./EnvironmentConfig.js"
import { BackgroundConfig } from "./BackgroundConfig.js"
import { BuildingConfig } from "./BuildingConfig.js"
import { TextConfig } from "./TextConfig.js"
import { XmasConfig } from "./XmasConfig.js"
import { GameConfig } from "./GameConfig.js"
import { LogoConfig } from "./LogoConfig.js"
import { PostFXConfig } from "./PostFXConfig.js"
import { TextPostFXConfig } from "./TextPostFXConfig.js"

export default class Fishtank extends Animator {
    static category = "Compositions"
    static title = "Fishtank"
    static description = "Dynamic scene composition with fish, plants, weather, buildings, and text"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        // Create sprite managers (in layer order: back to front)
        const fractalManager = new SpriteManager();
        const backgroundManager = new SpriteManager();
        const environmentManager = new SpriteManager();
        const plantManager = new SpriteManager();
        const buildingManager = new SpriteManager();
        const fishManager = new SpriteManager();
        const schoolManager = new SpriteManager();
        const gameManager = new SpriteManager();
        const xmasManager = new SpriteManager();
        const logoManager = new SpriteManager();
        const textManager = new SpriteManager();

        // Create and populate sprites using config classes (in layer order)
        const fractalConfig = new FractalConfig(controls);
        fractalConfig.populateSprites(fractalManager, box);
        
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
        
        const logoConfig = new LogoConfig(controls);
        await logoConfig.populateSprites(logoManager, box);
        
        const textConfig = new TextConfig(controls);
        textConfig.populateSprites(textManager, box);
        
        // Post-processing effects (at the end)
        const postFXConfig = new PostFXConfig(controls);
        const postFX = new PostFX();
        
        // Text-specific PostFX system
        const textPostFXConfig = new TextPostFXConfig(controls);
        const textPostFX = new TextPostFX();


        // Cache dimensions
        const boxW = box.width();
        const boxH = box.height();
        
        // Main animation loop
        scheduler.intervalControlled(controls.value("Speed", 1, 0.1, 5, 0.1), (frameNr) => {
            box.clear();

            // Batch all sprite updates first (better CPU cache utilization)
            fractalManager.update(frameNr, boxW, boxH);
            backgroundManager.update(frameNr, boxW, boxH);
            environmentManager.update(frameNr, boxW, boxH);
            plantManager.update(frameNr, boxW, boxH);
            buildingManager.update(frameNr, boxW, boxH);
            fishManager.update(frameNr, boxW, boxH);
            schoolManager.update(frameNr, boxW, boxH);
            gameManager.update(frameNr, boxW, boxH);
            gameConfig.updateCollisions(gameManager);
            xmasManager.update(frameNr, boxW, boxH);
            logoManager.update(frameNr, boxW, boxH);
            
            // Collect all layers except text in a combined pixel list for post-FX
            const combinedPixels = new PixelList();
            
            // Render all layers in order (back to front)
            // Skip empty managers for performance
            if (fractalManager.count() > 0) combinedPixels.add(fractalManager.render());
            if (backgroundManager.count() > 0) combinedPixels.add(backgroundManager.render());
            if (environmentManager.count() > 0) combinedPixels.add(environmentManager.render());
            if (plantManager.count() > 0) combinedPixels.add(plantManager.render());
            if (buildingManager.count() > 0) combinedPixels.add(buildingManager.render());
            if (fishManager.count() > 0) combinedPixels.add(fishManager.render());
            if (schoolManager.count() > 0) combinedPixels.add(schoolManager.render());
            if (gameManager.count() > 0) combinedPixels.add(gameManager.render());
            if (xmasManager.count() > 0) combinedPixels.add(xmasManager.render());
            
            // Add logo to combined pixels if PostFX enabled for it
            if (logoManager.count() > 0 && logoConfig.shouldApplyPostFX()) {
                combinedPixels.add(logoManager.render());
            }
            
            // Apply post-processing effects to all layers except text
            const processedPixels = postFX.apply(
                combinedPixels,
                box.width(),
                box.height(),
                postFXConfig.getOptions()
            );
            box.add(processedPixels);

            // 9. Logo (foreground overlay - without post-FX if disabled)
            if (logoManager.count() > 0 && !logoConfig.shouldApplyPostFX()) {
                box.add(logoManager.render());
            }

            // 10. Text (foreground overlay - with text-specific post-FX)
            if (textManager.count() > 0) {
                textManager.update(frameNr, boxW, boxH);
                const textPixels = textManager.render();
                
                // Apply text-specific effects
                const processedTextPixels = textPostFX.apply(
                    textPixels,
                    boxW,
                    boxH,
                    textPostFXConfig.getOptions()
                );
                box.add(processedTextPixels);
            }
        });
    }
}
