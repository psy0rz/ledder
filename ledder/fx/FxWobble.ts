import Fx from "../Fx.js";
import ControlValue from "../ControlValue.js";
import ControlGroup from "../ControlGroup.js";
import PixelList from "../PixelList.js";
import Scheduler from "../Scheduler.js";

export default class FxWobble extends Fx {

    intervalControl: ControlValue
    xControl: ControlValue
    yControl: ControlValue
    offsetControl: ControlValue


    constructor(scheduler: Scheduler, controlGroup: ControlGroup, xAmount: number, yAmount: number, interval: number, offset = 0) {
        super(scheduler, controlGroup);

        this.intervalControl = controlGroup.value("Wobble interval", interval, 1, 60, 1);
        this.offsetControl = controlGroup.value("Wobble interval offset", offset, 0, 60, 1, true);
        this.xControl = controlGroup.value("Wobble X amount", xAmount, -10, 10, 1, true)
        this.yControl = controlGroup.value("Wobble Y amount", yAmount, -10, 10, 1, true)

    }

    run(container: PixelList) {

        this.running = true

        let inverter = 1;
        this.promise = this.scheduler.intervalControlled(this.intervalControl, (frameNr) => {

                inverter = inverter * -1

                const xStep = this.xControl.value * inverter;
                const yStep = this.yControl.value * inverter;
                // for (let i = 0, n = pixelContainer.pixels.length; i < n; ++i) {

                container.forEachPixel( (p)=>{
                    p.x += xStep;
                    p.y += yStep;
                })


                return this.running

            }, this.offsetControl.value
        )

        return (this.promise)

    }
}
