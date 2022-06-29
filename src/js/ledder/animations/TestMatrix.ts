import {Pixel} from "../Pixel.js";
import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Color} from "../Color.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import FxBlink from "../fx/FxBlink.js";
import FxRotate from "../fx/FxRotate.js";
import {PixelContainer} from "../PixelContainer.js";

export default class TestMatrix extends Animation {

    static title = "Matrix test screen"
    static presetDir = "Matrix test"
    static description = "To verify correct orientation and color configuration of a matrix"


    /**
     * Test matrix orientation, border limit, colors and smoothness.
     */
    async run(matrix: Display, scheduler: Scheduler, controls: ControlGroup) {

        //color bar
        for (let x = 0; x < matrix.width; x++) {
            const c = 255 / matrix.width * (x + 1);
            matrix.add(new Pixel(x, 4, new Color(c, 0, 0)));
            matrix.add(new Pixel(x, 3, new Color(0, c, 0)));
            matrix.add(new Pixel(x, 2, new Color(0, 0, c)));
            matrix.add(new Pixel(x, 1, new Color(c, c, c)));
        }

        //corners
        matrix.add(new Pixel(0, 0, new Color(255, 255, 0)));
        matrix.add(new Pixel(matrix.width - 1, matrix.height - 1, new Color(255, 0, 255)));
        matrix.add(new Pixel(0, matrix.height - 1, new Color(255, 0, 255)));
        matrix.add(new Pixel(matrix.width - 1, 0, new Color(255, 0, 255)));

        //blinkers to test update rate (the first one should almost look static and half brightness)
        for (let x = 1; x < 4; x++) {
            const p = new Pixel(x - 1, 5, new Color(100, 100, 0))
            new FxBlink(scheduler, controls.group("blinker" + x), x, x).run(p, matrix);
        }

        //rounding test. pixel on float coordinates, should be 3 white pixels on xy 5 6 7
        matrix.add(new Pixel(5.1, 5.1, new Color(0, 100, 100)));
        matrix.add(new Pixel(6.5, 6.5, new Color(0, 100, 100)));
        matrix.add(new Pixel(7.9, 7.9, new Color(0, 100, 100)));


        //mover to test smoothness
        const moveContainer=new PixelContainer()
        matrix.add(moveContainer)
        moveContainer.add( new Pixel(0, 6, new Color(255, 255, 255)));
        new FxRotate(scheduler, controls, 1, 0, 1).run(moveContainer, matrix)
    }

}
