import {Animation} from "../Animation.js";
import AnimationMovingStarsL from "./AnimationMovingStarsL.js";
import {AnimationAsciiArt} from "../AnimationAsciiArt.js";
import {AnimationMove} from "../AnimationMove.js";
import {AnimationWobbleX} from "../AnimationWobbleX.js";
import {AnimationWobbleY} from "../AnimationWobbleY.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";


import {AnimationFadeOut} from "../AnimationFadeOut.js";
import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";

//Nyancat, based on https://github.com/bertrik/nyancat/blob/master/nyancat.c

export default class Nyancat extends Animation {

    static category = "Memes"
    static title = "Nyancat"
    static description = "Based on <a href='https://github.com/bertrik/nyancat/blob/master/nyancat.c'>this</a>"
    static presetDir = "Nyancat";


    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        let stars=new AnimationMovingStarsL(matrix);
        stars.run(matrix,scheduler, controls.group("Stars"))


        const body = new AnimationAsciiArt(matrix, 6, 7, `
      .00000000.
      0ffffpfff0
      0fpffffff0
      0fffpffpf0
      0ffffffff0
      0fpffpfff0
      .00000000.
    `)

        const head = new AnimationAsciiArt(matrix, 12, 8, `
      .00...00.
      .0500050.
      05w05w050
      050050050
      0p55555p0
      .0555550.
      ..00000..
    `)


        const moveIntervalControl = controls.value("Nyan move interval", 3, 1, 20, 0.1);
        const wobbleIntervalControl = controls.value("Nyan wobble interval", 15, 1, 20, 0.1);


        new AnimationWobbleY(matrix, {value: 1}, wobbleIntervalControl, 0).addPixels(body.pixels)
        new AnimationWobbleY(matrix, {value: -1}, wobbleIntervalControl, wobbleIntervalControl.value * 1 / 2).addPixels(head.pixels)
        new AnimationWobbleX(matrix, {value: 1}, wobbleIntervalControl, wobbleIntervalControl.value * 1 / 3).addPixels(head.pixels)

        new AnimationMove(matrix, moveIntervalControl, {value: 1}, {value: 0}, true).addPixels(head.pixels).addPixels(body.pixels)


        //rainbow :)
        let x = 6;
        let y = 2;
        const black = new Color(0, 0, 0);

        const controlFade = controls.value("Rainbow fade speed", 30, 1, 120, 1);
        const controlFadeRnd = controls.value("Rainbow fade randomizer", 0.1, 0, 0.5, 0.01);

        //wobble rainbow
        matrix.scheduler.intervalControlled(wobbleIntervalControl, () => {
            y = (y + 1) % 2;
            return true
        })


        //draw rainbow
        matrix.scheduler.intervalControlled(moveIntervalControl, () => {
            x = (x + 1) % matrix.width;

            const colors = [
                new Color(0xff, 0x00, 0x00),
                new Color(0xff, 0x80, 0x00),
                new Color(0xff, 0xff, 0x00),
                new Color(0x00, 0xff, 0x00),
                new Color(0x00, 0x80, 0xff),
                new Color(0x80, 0x00, 0xff)
            ]

            for (let c = 0; c < 6; c++) {
                new AnimationFadeOut(matrix, colors[c], controlFade, controlFadeRnd, true)
                    .addPixel(new Pixel(matrix, x, c + y + 1, colors[c]))
            }
            return true

        })

    }
}
