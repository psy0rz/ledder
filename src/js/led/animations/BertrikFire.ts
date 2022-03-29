import {Animation} from "../Animation.js";
import {random} from "../util.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import { glow} from "./DoomFire.js";

export class BertrikFire extends Animation {
  static category = "Fire"
  static title = "Bertrik"
  static description = "A more realistic fire, based on <a href='https://github.com/bertrik/nyancat/blob/master/fire.c'>this.</a>"
  static presetDir = "BertrikFire";

  //note: i just kept it mostly the way it was without optimizing

  create_palette(palet) {
    let i;
    let k = 0;
    let r = 0, g = 0, b = 0;

    // black to red
    for (i = 0; i < 15; i++) {
      palet[k++] = (r << 20) + (g << 12) + ((b / 4) << 4);
      r++;
    }

    // red to yellow
    for (i = 0; i < 15; i++) {
      palet[k++] = (r << 20) + (g << 12) + (b << 4);
      g++;
    }

    // yellow to white
    for (i = 0; i < 15; i++) {
      palet[k++] = (r << 20) + (g << 12) + (b << 4);
      b++;
    }
    // just white
    for (i = 0; i < 30; i++) {
      palet[k++] = (r << 20) + (g << 12) + (b << 4);
    }
    return k;
  }

  move_fire(field, height, decay) {
    let x, y, flame;

    // move flames up
    for (y = 0; y < height - 1; y++) {
      for (x = 0; x < this.matrix.width; x++) {
        // average
        if (x == 0) {
          flame = (field[y][x] + 2 * field[y + 1][x] + field[y + 1][x + 1]) / 4;
        } else if (x == (this.matrix.width - 1)) {
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
        field[y][x] = flame;
      }
    }
  }


  save_image(field, palet) {
    let row, col;
    let rgb;
    let b;

      for (row = 0; row < this.matrix.height; row++) {
        for (col = 0; col < this.matrix.width; col++) {
          rgb = palet[field[row][col]];

          const pixelNr=col + (row*this.matrix.width)

          this.pixels[pixelNr].color.r= (rgb >> 16) & 0xFF;
          this.pixels[pixelNr].color.g= (rgb >> 8) & 0xFF;
          this.pixels[pixelNr].color.b= (rgb >> 0) & 0xFF;
        }
      }
  }

  constructor(matrix) {
    super(matrix);

    let field = []
    let palet = []
    let numcol = this.create_palette(palet)

    //create clear field
    for (let y = 0; y < matrix.height; y++) {
      field[y] = new Uint8ClampedArray(matrix.width)
      for (let x = 0; x < matrix.width; x++) {
        field[y][x] = 0
        this.addPixel(new Pixel(matrix, x, matrix.height-y-1, new Color(0, 0, 0)))
      }
    }

    const fireintervalControl = matrix.preset.value("Fire interval", 3, 1, 10, 0.1)
    const minIntensityControl = matrix.preset.value("Fire minimum intensity", 20, 0, palet.length-1, 1);
    const maxIntensityControl = matrix.preset.value("Fire maximum intensity", 74, 0, palet.length-1, 1);
    const wildnessIntensityControl = matrix.preset.value("Fire wildness", 10, 0, palet.length-1, 1);
    const decayControl = matrix.preset.value("Fire decay", 4, 1, 10, 1)


    matrix.scheduler.intervalControlled(fireintervalControl, () => {

      //glow lower row
      for (let x = 0; x < this.matrix.width; x++) {
        field[matrix.height - 1][x]=glow(field[matrix.height - 1][x], minIntensityControl.value, maxIntensityControl.value, wildnessIntensityControl.value)
      }

      this.move_fire(field, this.matrix.height, decayControl.value)
      this.save_image(field, palet)

    })

  }
}
