import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animator from "../Animator.js"

import SpriteManager from "../fishtank/SpriteManager.js"
import { BubbleConfig } from "../fishtank/BubbleConfig.js"
import { PlantConfig } from "../fishtank/PlantConfig.js"
import { FishConfig } from "../fishtank/FishConfig.js"

export default class Fishtank extends Animator {
    static description = "An aquarium with fish, plants and bubbles. Use layers to add anything else."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        //one manager per layer, rendered back to front in this order
        const bubbleManager = new SpriteManager();
        const plantManager = new SpriteManager();
        const fishManager = new SpriteManager();
        const schoolManager = new SpriteManager();
        const layerManagers = [bubbleManager, plantManager, fishManager, schoolManager];

        //creating a config also creates its controls, so this determines the order in the GUI as well
        new BubbleConfig(controls).populateSprites(bubbleManager, box);
        new PlantConfig(controls).populateSprites(plantManager, box);
        new FishConfig(controls).populateSprites(fishManager, schoolManager, box);

        const boxWidth = box.width();
        const boxHeight = box.height();

        scheduler.intervalControlled(controls.value("Speed", 1, 0.1, 5, 0.1), (frameNr) => {
            box.clear();

            for (const layerManager of layerManagers) {
                layerManager.update(frameNr, boxWidth, boxHeight);
                if (layerManager.count() > 0)
                    box.add(layerManager.render());
            }
        });
    }
}
