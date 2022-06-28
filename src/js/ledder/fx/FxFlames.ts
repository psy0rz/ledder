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
import {fireColors} from "../ColorPatterns.js";
import FxRotate from "./FxRotate.js";
import {Pixel} from "../Pixel.js";


//Add flames to the top pixels of a container
export default class FxFlames extends Fx {
    private flameCycle: FxColorCycle;
    private mover: FxMove;


    constructor(scheduler: Scheduler, controls: ControlGroup, xStep = -1, yStep = 0, interval = 2, intervalRandomizer = 0) {
        super(scheduler, controls)

        this.flameCycle = new FxColorCycle(scheduler, controls, "reverse", 30, 15, 1)
        //this.mover = new FxMove(scheduler, controls, 0.4, 1, 5, 3)

    }

    //create flames for pixels from source into target
    //target should be empty and unused
    run(sourceContainer: PixelContainer, targetContainer: PixelContainer) {
        this.running = true

        //collect the pixels we need
        const burningPixels = new PixelContainer()
        const bbox = sourceContainer.bbox()

        sourceContainer.forEachPixel((p) => {
            if (p.y > bbox.yMax - 3) {
                burningPixels.add(p)
            }
        })


        this.promise = this.scheduler.interval(1, () => {

            const heads=new PixelContainer()

            for (let i = 0; i < 1; i++) {
                const p = burningPixels.randomPixel()

                let skip = ~~(((bbox.yMax - p.y) / (bbox.yMax - bbox.yMin)) * fireColors.length)
                skip=0

                //start a new trail
                const newTrail = new PixelContainer()
                const head=new PixelContainer()
                head.add(p)
                head.add(newTrail)
                heads.add(head)

                targetContainer.add(newTrail)
                const flameHead=p.copy(true)

                this.flameCycle.run(fireColors, flameHead.color, skip).then(() =>
                {
                    targetContainer.delete(newTrail)
                    heads.delete(head)
                })

                //extend all the trails
                for (const trail of targetContainer) {
                    if (trail instanceof PixelContainer) {
                        const p = trail.values().next().value
                        trail.add(p.copy())
                        p.move(0.1, 0.2)

                    }
                }
            }

            return (this.running)

        }).then(() => {


        })


        return (this.promise)
    }
}

