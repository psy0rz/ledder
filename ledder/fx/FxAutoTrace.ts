import Fx from "../Fx.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import FxTrace from "./FxTrace.js"
import PixelList from "../PixelList.js"
import {random} from "../utils.js"
import ControlRange from "../ControlRange.js"

//automaticly start FxTrace on random traces from the specified container. (look at hackerhotel.ts for example)
export default class FxAutoTrace extends Fx {
    private traceFx: FxTrace
    private intervalControl: ControlRange

    constructor(scheduler: Scheduler, controls: ControlGroup) {

        super(scheduler, controls)

        this.intervalControl=controls.range("Start interval range", 10,60,0,240)
        this.traceFx = new FxTrace(scheduler, controls)


    }

    run(traces: PixelList, targetList: PixelList) {
        return this.scheduler.interval(1, ()=>{
            const trace = traces.random()
            if (trace instanceof PixelList) {
                this.traceFx.run(trace, targetList)

            }
            return random(this.intervalControl.from, this.intervalControl.to)
            // return 60

        })

    }

}