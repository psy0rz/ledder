import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { BackgroundSprites } from "./BackgroundSprites.js"

export class BackgroundConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Background", true, true);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableBackground = this.controls.switch("Enable", true);
        const imageUrl = this.controls.input("Image URL", "https://github.com/psy0rz/ledder/raw/main/doc/2022-12-30_23-25.png");
        
        const imageFitChoices = [
            {id: "cover", name: "Cover"},
            {id: "contain", name: "Contain"},
            {id: "fill", name: "Fill"}
        ];
        const imageFit = this.controls.select("Fit Mode", "cover", imageFitChoices, true);
        const imageOpacity = this.controls.value("Opacity", 0.5, 0, 1, 0.1);
        
        return {
            enableBackground,
            imageUrl,
            imageFit,
            imageOpacity
        };
    }
    
    populateSprites(backgroundManager: SpriteManager, box: PixelBox) {
        const config = this.setupControls();
        
        if (!config.enableBackground.enabled || !config.imageUrl.text) {
            return;
        }
        
        const background = BackgroundSprites.createImageBackground(box.width(), box.height());
        backgroundManager.addSprite(background);
        
        // Load image asynchronously without blocking sprite creation
        background.loadImageData(config.imageUrl.text, config.imageFit.selected, config.imageOpacity.value)
            .catch(() => {}); // Silently fail - invalid URLs are user error
    }
}
