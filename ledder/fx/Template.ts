import Fx from "../Fx.js";
import ControlGroup from "../ControlGroup.js";
import PixelList from "../PixelList.js";
import Scheduler from "../Scheduler.js";


export default class FxTemplate extends Fx {


    constructor(scheduler: Scheduler, controls: ControlGroup) {
        super(scheduler, controls)


    }

    run(container: PixelList) {
        this.running = true

        //this.promise=...

        return (this.promise)
    }
}

