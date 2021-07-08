import {Animation} from "../Animation.js";
import {AnimationMovingStarsL} from "./AnimationMovingStarsL.js";

class AnimationNyan extends Animation
{
  constructor(matrix) {
    super(matrix);

    new AnimationMovingStarsL(matrix);

  }
}
