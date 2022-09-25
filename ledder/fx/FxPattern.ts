import Fx from "../Fx.js";
import ControlGroup from "../ControlGroup.js";
import Scheduler from "../Scheduler.js";
import PixelSet from "../PixelSet.js";

//"plays" a collection of pixelcontainers with a specfied timing pattern, by adding/removing them to the specified target container.
export default class FxPattern extends Fx {



    constructor(scheduler: Scheduler, controlGroup: ControlGroup, interval: number, intervalRandomizer=0) {
        super(scheduler, controlGroup)


    }

    run(source: PixelSet, target: PixelSet, intervals:Array<number>, startFrame=0, repeat = 0) {

        this.running = true

        let frameI = source.values()
        let prevFrame
        let intervalNr=-1

        //go to start frame and display immedeatly
        for(let i=0; i<=startFrame;i++) {
            prevFrame = frameI.next()
            intervalNr=(intervalNr+1)%intervals.length
        }
        target.add(prevFrame.value)

        this.promise = this.scheduler.interval(intervals[intervalNr], (frameNr) => {

            if (prevFrame)
                target.delete(prevFrame.value)

            let frame = frameI.next()
            intervalNr=(intervalNr+1)%intervals.length
            if (frame.done) {
                if (repeat) {
                    repeat--
                    if (repeat == 0)
                        return false
                }

                //restart
                frameI = source.values()
                frame = frameI.next()
                intervalNr=0

            }

            target.add(frame.value)
            prevFrame=frame

            if (this.running)
                return intervals[intervalNr]
            else
                return false

        })


        return (this.promise)
    }
}
