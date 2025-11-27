import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { BuildingSprites } from "./BuildingSprites.js"

export class BuildingConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Buildings", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableBuildings = this.controls.switch("Enable", false);
        
        // Factory
        const factoryGroup = this.controls.group("Factory", true, true);
        const showFactory = factoryGroup.switch("Enable", false);
        const factoryX = factoryGroup.value("X Position", 10, 0, 100, 1);
        const factoryY = factoryGroup.value("Y Position", 10, 0, 100, 1);
        
        // School
        const schoolGroup = this.controls.group("School", true, true);
        const showSchool = schoolGroup.switch("Enable", false);
        const schoolX = schoolGroup.value("X Position", 10, 0, 100, 1);
        const schoolY = schoolGroup.value("Y Position", 10, 0, 100, 1);
        
        // Windmill
        const windmillGroup = this.controls.group("Windmill", true, true);
        const showWindmill = windmillGroup.switch("Enable", false);
        const windmillX = windmillGroup.value("X Position", 10, 0, 100, 1);
        const windmillY = windmillGroup.value("Y Position", 10, 0, 100, 1);
        
        // Statue of Liberty
        const libertyGroup = this.controls.group("Statue of Liberty", true, true);
        const showLiberty = libertyGroup.switch("Enable", false);
        const libertyX = libertyGroup.value("X Position", 10, 0, 100, 1);
        const libertyY = libertyGroup.value("Y Position", 10, 0, 100, 1);
        
        // Eiffel Tower
        const eiffelGroup = this.controls.group("Eiffel Tower", true, true);
        const showEiffel = eiffelGroup.switch("Enable", false);
        const eiffelX = eiffelGroup.value("X Position", 10, 0, 100, 1);
        const eiffelY = eiffelGroup.value("Y Position", 10, 0, 100, 1);
        
        // Castle
        const castleGroup = this.controls.group("Castle", true, true);
        const showCastle = castleGroup.switch("Enable", false);
        const castleX = castleGroup.value("X Position", 10, 0, 100, 1);
        const castleY = castleGroup.value("Y Position", 10, 0, 100, 1);
        
        // Church
        const churchGroup = this.controls.group("Church", true, true);
        const showChurch = churchGroup.switch("Enable", false);
        const churchX = churchGroup.value("X Position", 10, 0, 100, 1);
        const churchY = churchGroup.value("Y Position", 10, 0, 100, 1);
        
        // Tower
        const towerGroup = this.controls.group("Tower", true, true);
        const showTower = towerGroup.switch("Enable", false);
        const towerX = towerGroup.value("X Position", 10, 0, 100, 1);
        const towerY = towerGroup.value("Y Position", 10, 0, 100, 1);
        
        return {
            enableBuildings,
            showFactory,
            factoryX,
            factoryY,
            showSchool,
            schoolX,
            schoolY,
            showWindmill,
            windmillX,
            windmillY,
            showLiberty,
            libertyX,
            libertyY,
            showEiffel,
            eiffelX,
            eiffelY,
            showCastle,
            castleX,
            castleY,
            showChurch,
            churchX,
            churchY,
            showTower,
            towerX,
            towerY
        };
    }
    
    populateSprites(buildingManager: SpriteManager, box: PixelBox) {
        const config = this.config;
        
        if (!config.enableBuildings.enabled) {
            return;
        }
        
        // Add each enabled building type
        if (config.showFactory.enabled) {
            buildingManager.addSprite(new BuildingSprites.Factory(config.factoryX.value, config.factoryY.value));
        }
        if (config.showSchool.enabled) {
            buildingManager.addSprite(new BuildingSprites.School(config.schoolX.value, config.schoolY.value));
        }
        if (config.showWindmill.enabled) {
            buildingManager.addSprite(new BuildingSprites.Windmill(config.windmillX.value, config.windmillY.value));
        }
        if (config.showLiberty.enabled) {
            buildingManager.addSprite(new BuildingSprites.LibertyStatue(config.libertyX.value, config.libertyY.value));
        }
        if (config.showEiffel.enabled) {
            buildingManager.addSprite(new BuildingSprites.EiffelTower(config.eiffelX.value, config.eiffelY.value));
        }
        if (config.showCastle.enabled) {
            buildingManager.addSprite(new BuildingSprites.Castle(config.castleX.value, config.castleY.value));
        }
        if (config.showChurch.enabled) {
            buildingManager.addSprite(new BuildingSprites.Church(config.churchX.value, config.churchY.value));
        }
        if (config.showTower.enabled) {
            buildingManager.addSprite(new BuildingSprites.Tower(config.towerX.value, config.towerY.value));
        }
    }
}
