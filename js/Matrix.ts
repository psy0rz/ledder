import {Animation} from "./Animation.js";

export abstract class Matrix {
  width: number;
  height: number;
  frameNr: number;
  animations: Array<Animation>;

  protected constructor(width, height) {
    this.width = width;
    this.height = height;
    this.frameNr = 0;
    this.animations=[];
  }

  addAnimation(animation: Animation) {
    animation.setup(this);
    this.animations.push(animation);
    //note that setup has to schedule something, otherwise the animation is done and the added pixels are static
  }

  interval(animation: Animation, frames) {
    animation.intervalFrames = frames;
    animation.nextFrame = this.frameNr + animation.intervalFrames;
  }


  //make sure this is called every frame by your matrix subclass
  loop() {
    this.frameNr++;

    for (let i = 0, n = this.animations.length; i < n; ++i) {
      const animation = this.animations[i];
      if (this.frameNr >= animation.nextFrame) {
        animation.loop(this, this.frameNr);
        animation.nextFrame = this.frameNr + animation.intervalFrames;
      }
    }

    this.render();

  }


  abstract render();
  abstract run();
  abstract setPixel(x, y, r, g, b, a);
}


