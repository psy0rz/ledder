import Fx from "../Fx.js";
import ControlGroup from "../ControlGroup.js";
import PixelContainer from "../PixelContainer.js";
import Scheduler from "../Scheduler.js";


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

