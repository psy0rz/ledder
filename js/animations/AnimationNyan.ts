import {Animation} from "../Animation.js";
import {AnimationMovingStarsL} from "./AnimationMovingStarsL.js";
import {AnimationAsciiArt} from "../AnimationAsciiArt.js";
import {AnimationMove} from "../AnimationMove.js";
import {AnimationWobbleX} from "../AnimationWobbleX.js";
import {AnimationWobbleY} from "../AnimationWobbleY.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {AnimationFade} from "../AnimationFade.js";

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


    const body = new AnimationAsciiArt(matrix, 6, 7, `
      .00000000.
      0ffffpfff0
      0fpffffff0
      0fffpffpf0
      0ffffffff0
      0fpffpfff0
      .00000000.
    `)


    const head = new AnimationAsciiArt(matrix, 12, 7, `
      .00...00.
      .0500050.
      05w05w050
      050050050
      0p55555p0
      .0555550.
      ..00000..
    `)


    const flyIntervalControl= matrix.preset.value("Fly interval", 3, 1, 60, 1);


    new AnimationWobbleY(matrix, 1, 10, 1).addPixels(body.pixels)
    new AnimationWobbleX(matrix, 1, 10, 9).addPixels(head.pixels)
    new AnimationWobbleY(matrix, 1, 10, 7).addPixels(head.pixels)

    new AnimationMove(matrix, flyIntervalControl.value, 1 ,0, true).addPixels(head.pixels).addPixels(body.pixels)



    //rainbow :)
    let x=6;
    let y=2;
    const black=new Color(0,0,0);

    const rainbowMover=new AnimationMove(matrix, flyIntervalControl.value, -1 ,0)

    const controlFade= matrix.preset.value("Rainbow fade speed", 10, 1, 120, 1);

    //wobble rainbow
    matrix.scheduler.interval(10, ()=>{
      y=(y+1)%2;

    })

    //draw rainbow
    matrix.scheduler.interval(flyIntervalControl.value,()=>{
      x=(x+1)%matrix.width;

      const l=new Color(0xff, 0x00, 0x00)
      const o=new Color(0xff, 0x80, 0x00)
      const yellow=new Color(0xff, 0xff, 0x00)
      const g=new Color(0x00, 0xff, 0x00)
      const b=new Color(0x00, 0x80, 0xff)
      const p=new Color(0x80, 0x00, 0xff)

      const pixels=[
        new Pixel(matrix, x,y+1, l),
        new Pixel(matrix, x,y+2, o),
        new Pixel(matrix, x,y+3, yellow),
        new Pixel(matrix, x,y+4, g),
        new Pixel(matrix, x,y+5, b),
        new Pixel(matrix, x,y+6, p),

        new Pixel(matrix, x-1,y+1, l),
        new Pixel(matrix, x-1,y+2, o),
        new Pixel(matrix, x-1,y+3, yellow),
        new Pixel(matrix, x-1,y+4, g),
        new Pixel(matrix, x-1,y+5, b),
        new Pixel(matrix, x-1,y+6, p),

      ]

      rainbowMover.addPixels(pixels)

      new AnimationFade(matrix,l, black, controlFade)
      new AnimationFade(matrix,o, black, controlFade)
      new AnimationFade(matrix,yellow, black, controlFade)
      new AnimationFade(matrix,g, black, controlFade)
      new AnimationFade(matrix,b, black, controlFade)
      new AnimationFade(matrix,p, black, controlFade).promise.then(()=>
      {
        matrix.removePixels(pixels)
      })

    })

  }
}
