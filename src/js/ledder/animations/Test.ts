import {Animation} from "../Animation.js";
import {Matrix} from "../Matrix.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";
import {fireColorsDoom, fireColorsBertrik, fireColorsBrainsmoke, testFirecolors} from "../ColorPatterns.js";

export default class Test extends Animation {
    async run(matrix: Matrix, scheduler: Scheduler, controls: ControlGroup) {

        testFirecolors(matrix)
    }
}
