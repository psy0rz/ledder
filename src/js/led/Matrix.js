import { PixelContainer } from "./PixelContainer.js";
import { PresetControl } from "./PresetControl.js";
/**
 * The matrix is the display and shows the list of pixels. The subclasses are actual implementations for different display types.
 * Usually its enough to just implement run() and setPixel.
 * run() should call this.scheduler.update() and render() with the prefrerred framerate. (should be 60fps)
 * render() will in turn call setpixel() to set the actual pixels. (there its usually stored in a buffer)
 * run is then reponsible for sending the rendered buffer to the actual display.
 *
 * Pixels() will ddd themself to the matrix.
 */
export class Matrix extends PixelContainer {
    constructor(scheduler, width, height) {
        super();
        this.scheduler = scheduler;
        //note: named preset instead of presetControl to make it more friendly for enduser
        this.preset = new PresetControl();
        this.fpsControl = this.preset.value("FPS", 60, 1, 120, 1);
        this.width = width;
        this.height = height;
        this.runScheduler = true; //make false if another matrix is running the scheduler.
    }
    render() {
        //render all pixels (pixels render() function wil call our setPixel one or more times)
        for (let i = 0, n = this.pixels.length; i < n; ++i) {
            const p = this.pixels[i];
            p.render(this);
        }
    }
    status() {
        console.log("Matrix pixels: ", this.pixels.length);
    }
    /**
     * Clear all pixels and running intervals
     */
    reset(keepPresets = false) {
        if (!keepPresets) {
            this.preset.clear();
            this.fpsControl = this.preset.value("FPS", 60, 1, 120, 1);
        }
        if (this.runScheduler)
            this.scheduler.clear();
        super.reset();
    }
}
//# sourceMappingURL=Matrix.js.map