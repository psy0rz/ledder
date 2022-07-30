import Fx from "../Fx.js"
import {ControlValue} from "../ControlValue.js"
import {ControlGroup} from "../ControlGroup.js"
import {PixelContainer} from "../PixelContainer.js"
import BboxInterface from "../BboxInterface.js"
import {Scheduler} from "../Scheduler.js"
import {random} from "../util.js"
import FxColorCycle from "./FxColorCycle.js"
import FxMove from "./FxMove.js"
import {Color} from "../Color.js"
import {fireColorsDoom} from "../ColorPatterns.js"


//Make pixels disappear as a bunch of flames, also removes them from container
export default class FxFlameout extends Fx {
    private flameCycle: FxColorCycle
    private mover: FxMove


    constructor(scheduler: Scheduler, controls: ControlGroup, xStep = -1, yStep = 0, interval = 2, intervalRandomizer = 0) {
        super(scheduler, controls)

        this.flameCycle = new FxColorCycle(scheduler, controls, "reverse", 15, 15, 1)
        this.mover = new FxMove(scheduler, controls, 0.4, 1, 3, 3)

    }

    //flameout the pixels in the container, and also clears the container when done
    run(container: PixelContainer, clear = true) {
        this.running = true

        let promises = []

        let moverContainers = [
            new PixelContainer(),
            new PixelContainer(),
            new PixelContainer(),
        ]

        container.forEachPixel((p, parent) => {
            const c = new Color()
            p.color = c
            moverContainers[random(0, moverContainers.length - 1)].add(p)
            promises.push(this.flameCycle.run(c,30).then(() => {
                parent.delete(p)
            }))

        })

        for (const moverContainer of moverContainers)
            promises.push(this.mover.run(moverContainer, 16))


        this.promise = Promise.allSettled(promises)

        if (clear)
            this.promise.then(() => container.clear())

        return (this.promise)
    }
}

