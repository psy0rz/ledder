import {ControlGroup} from "./ControlGroup.js";
import {Scheduler} from "./Scheduler.js";



//an effect can be applied to pixelcontainers or colors  (via run() )
export default class Fx {
    static title = "Untitled"

    //every FX should have one promise that can be awaits for completion of the effect.
    promise: Promise<any>
    running: boolean
    scheduler: Scheduler
    controls: ControlGroup


    constructor(scheduler: Scheduler, controlGroup: ControlGroup) {
        this.scheduler = scheduler
        this.controls=controlGroup

        this.running=false
    }

    //Run fx on pixels. Should return promise and NOT use async keyword in function defintion.
    //Can be called multiple times. Use stop() to stop all running schedulers of this effect.
    //Note that stop() only returns the last promise.
    //Run should set this.running to True and it should end when this.running becomes false.
    run(...any):Promise<any>
    {
        console.error("Error: This fx has no run() function?")
        return (new Promise( undefined))
    }

    //stops the effect. (promise will be fullfilled after stopping)
    async stop()
    {
        this.running=false
        return (this.promise)
    }


}

