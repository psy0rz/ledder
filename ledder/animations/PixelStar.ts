import ControlValue from "../ControlValue.js";
import Pixel from "../Pixel.js";
import ColorInterface from "../ColorInterface.js";

export default class PixelStar extends Pixel {

  step: number;

  constructor(display, x, y, color: ColorInterface, delay: ControlValue) {
        super( x, y, color)

        this.step = 0;
        display.scheduler.intervalControlled(delay, () => {
            this.step = (this.step + 1) % 3;
            // return(this.keep);
        })

    }

    render(display) {
        switch (this.step) {
            case 0:
                display.setPixel(this.x, this.y, this.color);
                break;
            case 1:
                display.setPixel(this.x, this.y, this.color);
                display.setPixel(this.x - 1, this.y, this.color);
                display.setPixel(this.x + 1, this.y, this.color);
                display.setPixel(this.x, this.y - 1, this.color);
                display.setPixel(this.x, this.y + 1, this.color);
                break;
            case 2:
                display.setPixel(this.x - 1, this.y, this.color);
                display.setPixel(this.x + 1, this.y, this.color);
                display.setPixel(this.x, this.y - 1, this.color);
                display.setPixel(this.x, this.y + 1, this.color);
                break;
            case 3:
                break;


        }
    }
}
