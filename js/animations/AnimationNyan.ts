import {Animation} from "../Animation.js";
import {AnimationMovingStarsL} from "./AnimationMovingStarsL.js";
import {AnimationAsciiArt} from "../AnimationAsciiArt.js";
import {AnimationMove} from "../AnimationMove.js";
import {AnimationWobbleX} from "../AnimationWobbleX.js";
import {AnimationWobbleY} from "../AnimationWobbleY.js";

//Nyancat, based on https://github.com/bertrik/nyancat/blob/master/nyancat.c

export class AnimationNyan
  extends Animation {

  static category = "Memes"
  static title = "Nyancat"
  static description = "Based on <a href='https://github.com/bertrik/nyancat/blob/master/nyancat.c'>this</a>"
  static presetDir = "Nyancat";


  constructor(matrix) {
    super(matrix);


    new AnimationMovingStarsL(matrix);

    // const background=new Color(0,0x40,0x80)
    // for (let x=0; x<matrix.width; x++)
    //   for (let y=0; y<matrix.height; y++)
    //     new Pixel(matrix, x,y, background)


    const body = new AnimationAsciiArt(matrix, 0, 7, `
      .00000000.
      0ffffpfff0
      0fpffffff0
      0fffpffpf0
      0ffffffff0
      0fpffpfff0
      .00000000.
    `)


    const head = new AnimationAsciiArt(matrix, 6, 7, `
      .00...00.
      .0500050.
      05w05w050
      050050050
      0p55555p0
      .0555550.
      ..00000..
    `)

    new AnimationWobbleY(matrix, 1, 10, 1).addPixels(body.pixels)
    new AnimationWobbleX(matrix, 1, 10, 9).addPixels(head.pixels)
    new AnimationWobbleY(matrix, 1, 10, 7).addPixels(head.pixels)

    new AnimationMove(matrix, 3, 1 ,0, true).addPixels(head.pixels).addPixels(body.pixels)

  }
}
