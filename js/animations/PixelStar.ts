import { ControlValue } from "../ControlValue.js";
import {Pixel} from "../Pixel.js";
import {ColorInterface} from "../ColorInterface.js";

export class PixelStar extends Pixel {

  step: number;

  constructor(matrix, x, y, color: ColorInterface, delay: ControlValue) {
        super(matrix, x, y, color);

        this.step = 0;
        matrix.scheduler.intervalControlled(delay, () => {
            this.step = (this.step + 1) % 3;
            return(this.keep);
        })

    }

    render(matrix) {
        switch (this.step) {
            case 0:
                matrix.setPixel(this.x, this.y, this.color);
                break;
            case 1:
                matrix.setPixel(this.x, this.y, this.color);
                matrix.setPixel(this.x - 1, this.y, this.color);
                matrix.setPixel(this.x + 1, this.y, this.color);
                matrix.setPixel(this.x, this.y - 1, this.color);
                matrix.setPixel(this.x, this.y + 1, this.color);
                break;
            case 2:
                matrix.setPixel(this.x - 1, this.y, this.color);
                matrix.setPixel(this.x + 1, this.y, this.color);
                matrix.setPixel(this.x, this.y - 1, this.color);
                matrix.setPixel(this.x, this.y + 1, this.color);
                break;
            case 3:
                break;


        }
    }
}
