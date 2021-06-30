export class Matrix {
    constructor(width, height) {
        this.width = width;
        this.height = height;
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
    //make sure this is called every frame by your matrix subclass
    loop() {
        this.frameNr++;
        for (let i = 0, n = this.animations.length; i < n; ++i) {
            const animation = this.animations[i];
            if (animation.nextFrame && this.frameNr >= animation.nextFrame) {
                animation.loop(this, this.frameNr);
                animation.nextFrame = this.frameNr + animation.intervalFrames;
            }
        }
        this.render();
    }
}
//# sourceMappingURL=Matrix.js.map