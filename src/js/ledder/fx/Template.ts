import Fx from "../Fx.js";
import {ControlValue} from "../ControlValue.js";
import {ControlGroup} from "../ControlGroup.js";
import {PixelContainer} from "../PixelContainer.js";
import BboxInterface from "../BboxInterface.js";
import {Scheduler} from "../Scheduler.js";
import {random} from "../util.js";
import FxColorCycle from "./FxColorCycle.js";
import FxMove from "./FxMove.js";
import {Color} from "../Color.js";


export default class FxTemplate extends Fx {


    constructor(scheduler: Scheduler, controls: ControlGroup) {
        super(scheduler, controls)


    }

    run(container: PixelContainer) {
        this.running = true

        //this.promise=...

        return (this.promise)
    }
}

