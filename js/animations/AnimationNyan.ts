import {Animation} from "../Animation.js";
import {Color} from "../Color.js";
import {AnimationMovingStarsL} from "./AnimationMovingStarsL.js";
import {AnimationAsciiArt} from "../AnimationAsciiArt.js";

//Nyancat, based on https://github.com/bertrik/nyancat/blob/master/nyancat.c

export class AnimationNyan extends Animation {
  constructor(matrix) {
    super(matrix);

    // new AnimationMovingStarsL(matrix);

    const head = new AnimationAsciiArt(matrix, 0, 7, `
      .00...00.
      .0500050.
      05w05w050
      050050050
      0f55555f0
      .0555550.
      ..00000..
    `)


  }
}
