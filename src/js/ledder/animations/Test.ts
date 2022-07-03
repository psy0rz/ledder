import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";
import {fireColorsDoom, fireColorsBertrik, fireColorsBrainsmoke, testFirecolors} from "../ColorPatterns.js";
import DrawBox from "../draw/DrawBox.js";

export default class Test extends Animation {
    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        // testFirecolors(display)
        display.add(new DrawBox(0,0,display.width, display.height, controls.color("c")))
    }
}
