import Fx from "../Fx.js";
import ControlValue from "../ControlValue.js";
import ControlGroup from "../ControlGroup.js";
import PixelList from "../PixelList.js";
import Scheduler from "../Scheduler.js";

export default class FxWobble extends Fx {

    xFreq: ControlValue
    xAmplitude: ControlValue
    yFreq: ControlValue
    yAmplitude: ControlValue
    phaseShift: ControlValue

    //actual moving offsets, can be read from outside and used
    xOffset: number
    yOffset: number


    constructor(scheduler: Scheduler, controlGroup: ControlGroup, xFreq:number=1, xAmplitude:number=5, yFreq:number=1, yAmplitude:number=5, phaseShift:number=0) {
        super(scheduler, controlGroup);

        this.xOffset=0
        this.yOffset=0


        this.xFreq =    controlGroup.value("X frequency (hz)", xFreq, 0, 5, 0.1, true);
        this.xAmplitude = controlGroup.value("X amplitude", xAmplitude, -10, 10, 1, true);
        this.yFreq = controlGroup.value("Y frequency (hz)", yFreq, 0, 5, 0.1, true);
        this.yAmplitude = controlGroup.value("Y amplitude", yAmplitude, -10, 10, 1, true);
        this.phaseShift=controlGroup.value("Phase shift", phaseShift, -360, 360, 1, true);

    }

    async run(container: PixelList) {

        this.running = true

        this.scheduler.interval(1, (frameNr) => {

            //current number of radians in our cycle (2pi per second)
            let xRadians=frameNr/60*Math.PI*2*this.xFreq.value;
            let yRadians=frameNr/60*Math.PI*2*this.yFreq.value;

            //apply phase shift
            yRadians+=this.phaseShift.value * Math.PI / 180;

            //offset the pixels should have
            let xOffsetWanted=Math.round(Math.sin(xRadians)*this.xAmplitude.value)
            let yOffsetWanted=Math.round(Math.sin(yRadians)*this.yAmplitude.value)

            //NOTE: work with intergers to prevent acculating rounding errors
            let xDelta=xOffsetWanted-this.xOffset
            let yDelta=yOffsetWanted-this.yOffset

            if (xDelta!=0 || yDelta!=0)
            {
                container.forEachPixel((p) => {
                    p.x += xDelta
                    p.y += yDelta
                })
                this.xOffset=xOffsetWanted
                this.yOffset=yOffsetWanted

            }

           return this.running
        })
    }
}
