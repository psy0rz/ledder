import Scheduler from "../Scheduler.js"
import FxFlameout from "../fx/FxFlameout.js"
import FxPacman from "../fx/FxPacman.js"
import ControlGroup from "../ControlGroup.js"
import {PresetStore} from "../server/PresetStore.js"
import Animator from "../Animator.js"
import {FxFadeMask} from "../fx/FxFadeMask.js"


const presetStore = new PresetStore()

export default class Cycle extends Animator {
    static category = "Misc"
    static title = "Cycle stuff"
    static description = ""



    async run(box, scheduler: Scheduler, controls: ControlGroup) {

        const fader=new FxFadeMask(scheduler,controls)

        async function show(animationName, presetName, time) {


            //fade out and stop animation
            if (box.size>0)
                await fader.run(box, true, 30)
            scheduler.clear()
            box.clear()


            const subControls=controls.group(animationName)

            //doing external async stuff
            scheduler.stop()

            const animationClass=await presetStore.loadAnimation(animationName)
            const animation= new animationClass()

            if (presetName!=="") {
                const presetValues = await presetStore.load(animationName, presetName)
                subControls.load(presetValues.values)
            }
            scheduler.resume()

            const promise=animation.run(box, scheduler, subControls)
            await fader.run(box, false, 30)

            if (time)

                await scheduler.delay(time/16.6)
            else
                await promise

            // scheduler.clear()
        }

        const fxControls=controls.group("FX")
        while(1) {
            await show("Logos/HSD", "default", 0)


            await show("Text/BTC", "default", 8000)
            // scheduler.clear()
            // await new FxFlameout(scheduler, fxControls).run(box)


            // await show("Memes/ItsFine", "default", 5000)
            // // await new FxFlameout(scheduler, fxControls).run(box)

            await show("Memes/Nyancat", "default", 3000)
            // await new FxPacman(scheduler, fxControls).run(box, 0, box.height )
            scheduler.clear()
            await new FxFlameout(scheduler, fxControls).run(box)




            // await show("Cyber", "default", 2000)
            // await new FxFlameout(scheduler, fxControls).run(display)
            // scheduler.clear()


        }
    }
}
