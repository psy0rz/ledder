import {Animation} from "../Animation.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import { glow} from "./DoomFire.js";
import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {fireColorsBertrik} from "../ColorPatterns.js";

export default class BertrikFire extends Animation {
  static category = "Fire"
  static title = "Bertrik"
  static description = "Fire, based on <a href='https://github.com/bertrik/nyancat/blob/master/fire.c'>this.</a>"
  static presetDir = "BertrikFire";


  move_fire(matrix, field, height, decay, maxFlame) {
    let x, y, flame;

    // move flames up
    for (y = 0; y < height - 1; y++) {
      for (x = 0; x < matrix.width; x++) {
        // average
        if (x == 0) {
          flame = (field[y][x] + 2 * field[y + 1][x] + field[y + 1][x + 1]) / 4;
        } else if (x == (matrix.width - 1)) {
          flame = (field[y][x] + 2 * field[y + 1][x] + field[y + 1][x - 1]) / 4;
        } else {
          flame = (field[y][x] + field[y + 1][x - 1] + field[y + 1][x] + field[y + 1][x + 1]) / 4;
        }
        // decay
        if (flame > decay) {
          flame -= decay;
        } else {
          flame /= 2;
        }
        if (flame<0)
          flame=0

        if (flame>maxFlame)
          flame=maxFlame
        field[y][x] = flame;
      }
    }
  }


  save_image(matrix, field,  pixels:Array<Array<Pixel>>, colors) {
    let row, col;

      for (row = 0; row < matrix.height; row++) {
        for (col = 0; col < matrix.width; col++) {
          const intensity=field[row][col]
          pixels[row][col].color=colors[~~intensity]
        }
      }

  }

  async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

    let field = []
    let pixels =[]
    let colors = fireColorsBertrik

    //create clear field
    for (let y = 0; y < matrix.height; y++) {
      field[y] = []
      pixels[y] = []
      for (let x = 0; x < matrix.width; x++) {
        const p=new Pixel( x, matrix.height-y-1, new Color(0,0,0))
        pixels[y][x]=p
        field[y][x] = 0
        matrix.add(p)
      }
    }

    const fireintervalControl = controls.value("Fire interval", 1, 1, 10, 0.1)
    const minIntensityControl = controls.value("Fire minimum intensity", 0, 0, colors.length-1, 1);
    const maxIntensityControl = controls.value("Fire maximum intensity", colors.length-1, 0, colors.length-1, 1);
    const wildnessIntensityControl = controls.value("Fire wildness", 100, 0, colors.length-1, 1);
    const decayControl = controls.value("Fire decay", 100, 1, colors.length/2, 1)

    matrix.scheduler.intervalControlled(fireintervalControl, () => {

      //glow lower row
      for (let x = 0; x < matrix.width; x++) {
        field[matrix.height - 1][x]=glow(field[matrix.height - 1][x], minIntensityControl.value, maxIntensityControl.value, wildnessIntensityControl.value)
      }
      this.move_fire(matrix,field, matrix.height, decayControl.value, colors.length-1)
      this.save_image( matrix, field, pixels, colors)

      return true
    })

  }
}
