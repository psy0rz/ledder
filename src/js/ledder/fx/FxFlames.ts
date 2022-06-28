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



    constructor(scheduler: Scheduler, controls: ControlGroup, xStep = -1, yStep = 0, interval = 2, intervalRandomizer=0) {
        super(scheduler, controls)

        this.flameCycle=new FxColorCycle(scheduler, controls, "reverse",15,15,1)
        this.mover = new FxMove(scheduler, controls, 0.4, 1, 5, 3)

    }

    //create flames for pixels from source into target
    //(they can be the same container if you dont use any other effects on the source)
    run(sourceContainer: PixelContainer, targetContainer:PixelContainer) {
        this.running = true

        //collect the pixels we need
        const burningPixels=new PixelContainer()
        const bbox=sourceContainer.bbox()

        sourceContainer.forEachPixel( (p)=>{
            if (p.y> bbox.yMax-3)
            {
                burningPixels.add(p)
            }
        })

        this.promise=this.scheduler.interval(1, () => {
            for (let i = 0; i < 1; i++) {
                const p = burningPixels.randomPixel()

                const newP = p.copy(true)
                let skip = ~~(((bbox.yMax - newP.y) / (bbox.yMax - bbox.yMin)) * fireColors.length)

                    targetContainer.add(newP)

                    this.flameCycle.run(fireColors, newP.color, skip).then(() => targetContainer.delete(newP))
                    this.mover.run(newP, 20)
            }

            return (this.running)

        }).then( ()=>
        {


        })



        return (this.promise)
    }
}

