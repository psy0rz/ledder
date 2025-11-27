import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { PlantSprites } from "./PlantSprites.js"

export class PlantConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Plants & Vegetation", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enablePlants = this.controls.switch("Enable", true);
        
        // Plant type distribution - each with its own subgroup
        const tallPlantGroup = this.controls.group("Tall Plants", true, true);
        const plantTall = tallPlantGroup.value("Count (0=disabled)", 2, 0, 20, 1);
        
        const shortPlantGroup = this.controls.group("Short Plants", true, true);
        const plantShort = shortPlantGroup.value("Count (0=disabled)", 2, 0, 20, 1);
        
        const bushGroup = this.controls.group("Bushes", true, true);
        const plantBush = bushGroup.value("Count (0=disabled)", 3, 0, 20, 1);
        
        const grassGroup = this.controls.group("Grass", true, true);
        const plantGrass = grassGroup.value("Count (0=disabled)", 4, 0, 20, 1);
        
        const flowerGroup = this.controls.group("Flowers", true, true);
        const plantFlower = flowerGroup.value("Count (0=disabled)", 3, 0, 20, 1);
        
        const fernGroup = this.controls.group("Ferns", true, true);
        const plantFern = fernGroup.value("Count (0=disabled)", 2, 0, 20, 1);
        
        const treeGroup = this.controls.group("Trees", true, true);
        const plantTree = treeGroup.value("Count (0=disabled)", 2, 0, 20, 1);
        
        const cactusGroup = this.controls.group("Cactus", true, true);
        const plantCactus = cactusGroup.value("Count (0=disabled)", 2, 0, 20, 1);
        
        return {
            enablePlants,
            plantTall,
            plantShort,
            plantBush,
            plantGrass,
            plantFlower,
            plantFern,
            plantTree,
            plantCactus
        };
    }
    
    populateSprites(plantManager: SpriteManager, box: PixelBox) {
        const config = this.config;
        
        if (!config.enablePlants.enabled) {
            return;
        }
        
        // Add each plant type directly based on count
        const addPlant = (PlantClass: any, count: number) => {
            for (let i = 0; i < count; i++) {
                const plantX = Math.random() * box.width();
                const plantY = box.height() - 10;
                plantManager.addSprite(new PlantClass(plantX, plantY));
            }
        };
        
        addPlant(PlantSprites.TallPlant, config.plantTall.value);
        addPlant(PlantSprites.ShortPlant, config.plantShort.value);
        addPlant(PlantSprites.Bush, config.plantBush.value);
        addPlant(PlantSprites.SmallBush, config.plantBush.value);
        addPlant(PlantSprites.Grass, config.plantGrass.value);
        addPlant(PlantSprites.Flower, config.plantFlower.value);
        addPlant(PlantSprites.Fern, config.plantFern.value);
        addPlant(PlantSprites.PineTree, config.plantTree.value);
        addPlant(PlantSprites.SmallPine, config.plantTree.value);
        addPlant(PlantSprites.OakTree, config.plantTree.value);
        addPlant(PlantSprites.SmallOak, config.plantTree.value);
        addPlant(PlantSprites.Cactus, config.plantCactus.value);
    }
}
