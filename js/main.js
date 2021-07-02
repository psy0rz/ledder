import { MatrixCanvas } from "./MatrixCanvas.js";
import { AnimationTest } from "./AnimationTest.js";
//schedules updates for animations, based on frame-updates from the matrix.
class Scheduler {
    constructor() {
        this.frameNr = 0;
        this.animations = [];
    }
    addAnimation(animation) {
        animation.setup(this);
        this.animations.push(animation);
        //note that setup has to schedule something, otherwise the animation is done and the added pixels are static
    }
    interval(animation, frames) {
        animation.intervalFrames = frames;
        animation.nextFrame = this.frameNr + animation.intervalFrames;
    }
    //called by matrix for every frame.
    update() {
        this.frameNr++;
        for (let i = 0, n = this.animations.length; i < n; ++i) {
            const animation = this.animations[i];
            if (animation.nextFrame && this.frameNr >= animation.nextFrame) {
                animation.loop(this, this.frameNr);
                animation.nextFrame = this.frameNr + animation.intervalFrames;
            }
        }
    }
}
let matrix = new MatrixCanvas(37, 8, '#matrix', 5, 16);
matrix.addAnimation(new AnimationTest());
matrix.run();
//# sourceMappingURL=main.js.map