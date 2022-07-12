import {Animation} from "../Animation.js";
import {Display} from "../Display.js";
import {Scheduler} from "../Scheduler.js";
import {ControlGroup} from "../ControlGroup.js";
import {Pixel} from "../Pixel.js";
import {Color} from "../Color.js";
import {PixelContainer} from "../PixelContainer.js";
import {fireColorsDoom, fireColorsBertrik, fireColorsBrainsmoke, testFirecolors} from "../ColorPatterns.js";
import Draw from "../Draw.js";
import DrawBox from "../draw/DrawBox.js";
import {colorBlack, colorRed} from "../Colors.js"

export default class Test extends Animation {
    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        // const c=controls.color("color")
        // display.add(new DrawBox(0,0,display.width, display.height, c))
       // display.add(new Pixel(display.width-1,display.height-1,new Color(255,255,255)))
        display.add(new Pixel(display.width-1,display.height-1,new Color(55,12,80)))

        display.add(new Pixel(30,display.height-1,new Color(55,12,80)))
        // display.add(new Pixel(display.width-2,display.height-2,new Color(255,255,255)))
        // display.add(new Pixel(0,0,new Color(255,0,0)))
        // display.add(new Pixel(0,0,new Color(55,12,80)))
        // display.add(new Pixel(1,0,new Color(0,0,0)))
    }
}
