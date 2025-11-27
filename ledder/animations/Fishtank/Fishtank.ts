import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"

// Import sprite framework
import SpriteManager from "./SpriteManager.js"

// Import configuration classes
import { FishConfig } from "./FishConfig.js"
import { PlantConfig } from "./PlantConfig.js"
import { EnvironmentConfig } from "./EnvironmentConfig.js"
import { BackgroundConfig } from "./BackgroundConfig.js"
import { BuildingConfig } from "./BuildingConfig.js"
import { TextConfig } from "./TextConfig.js"

export default class Fishtank extends Animator {
    static category = "Aquarium"
    static title = "Fishtank Composition"
    static description = "Modular fishtank using sprite framework"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        try {
        // Create sprite managers
        const backgroundManager = new SpriteManager();
        const buildingManager = new SpriteManager();
        const fishManager = new SpriteManager();
        const plantManager = new SpriteManager();
        const textManager = new SpriteManager();
        const environmentManager = new SpriteManager();
        const schoolManager = new SpriteManager();

        // Create and populate sprites using config classes
        const fishConfig = new FishConfig(controls);
        fishConfig.populateSprites(fishManager, schoolManager, box);
        
        const plantConfig = new PlantConfig(controls);
        plantConfig.populateSprites(plantManager, box);
        
        const environmentConfig = new EnvironmentConfig(controls);
        environmentConfig.populateSprites(environmentManager, box);
        
        const backgroundConfig = new BackgroundConfig(controls);
        backgroundConfig.populateSprites(backgroundManager, box);
        
        const buildingConfig = new BuildingConfig(controls);
        buildingConfig.populateSprites(buildingManager, box);
        
        const textConfig = new TextConfig(controls);
        textConfig.populateSprites(textManager, box);


        // Main animation loop
        scheduler.intervalControlled(controls.value("Speed", 1, 0.1, 5, 0.1), (frameNr) => {
            box.clear();

            // Render all sprites in order (background first, buildings, plants, fish, school, environment, text)
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

            textManager.update(frameNr, box.width(), box.height());
            box.add(textManager.render());
        });
        
        } catch (error) {
            console.error("=== Fishtank error ===", error);
            throw error;
        }
    }
}
