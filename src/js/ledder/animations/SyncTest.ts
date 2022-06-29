
import {Pixel} from "../Pixel.js";
import {Animation} from "../Animation.js";
import {AnimationBlink} from "../AnimationBlink.js";
import {AnimationMove} from "../AnimationMove.js";
import {Display} from "../Display.js";
import {Color} from "../Color.js";

export default class SyncTest extends Animation {

  static title="Matrix test sync"
  static presetDir="Sync test"
  static description="Test smoothness and syncronisation of multiple matrixes"


  constructor(matrix: Display) {
        super(matrix);

      let moveX=new AnimationMove(matrix, {value: 1}, {value: 1}, {value: 0}, true );
      let moveY=new AnimationMove(matrix, {value: 4}, {value: 0}, {value: 1}, true );

      for (let x=0; x<matrix.width; x=x+32) {
          for (let y = 0; y < matrix.height; y++) {
              moveX.addPixel(new Pixel(matrix, x, y, new Color(255, 0, 0)));
          }
      }
      // for (let x=0; x<matrix.width; x++) {
      //         moveY.addPixel(new Pixel(matrix, x, 0, new Color(0, 0, 255)));
      //     }

    }

}
