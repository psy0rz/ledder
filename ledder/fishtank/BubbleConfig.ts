import type ControlGroup from "../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../PixelBox.js"
import { BubbleSprite } from "./BubbleSprite.js"

export class BubbleConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;

    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Bubbles", true, true);
        this.config = this.setupControls();
    }

    setupControls() {
        const enableBubbles = this.controls.switch("Enable", true);
        const bubbleCount = this.controls.value("Count", 5, 0, 30, 1, true);
        const riseSpeed = this.controls.value("Rise speed", 0.4, 0.1, 2.0, 0.1, true);

        return {
            enableBubbles,
            bubbleCount,
            riseSpeed
        };
    }

    populateSprites(bubbleManager: SpriteManager, box: PixelBox) {
        const config = this.config;

        if (!config.enableBubbles.enabled) {
            return;
        }

        //spread over the whole height, so they dont all start as one clump at the bottom
        for (let i = 0; i < config.bubbleCount.value; i++) {
            const x = Math.random() * box.width();
            const y = Math.random() * box.height();
            bubbleManager.addSprite(new BubbleSprite(x, y, config.riseSpeed.value));
        }
    }
}
