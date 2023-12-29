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
            scheduler.__clear()
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

            await show("Fires/Fire", "big", 8000)

            await show("ReinsCollection/Dna", "default", 8000)

            await show("Memes/Nyancat", "Turbo cat", 8000)
            // await new FxPacman(scheduler, fxControls).run(box, 0, box.height )
            // scheduler.__clear()
            // await new FxFlameout(scheduler, fxControls).run(box)


            await show("Logos/HSD", "default", 0)

            await show("Text/Marquee", "drink", 8000)

            await show("WallieOnline/RhodoneaRoseDemo", "big", 8000)

            await show("ReinsCollection/Prisma", "default", 8000)

            await show("ReinsCollection/Xmas", "hsnl2", 8000)


            await show("Ledart/Rainbowsquare", "default", 2000)

            await show("ReinsCollection/Cubevec3", "default", 8000)

            await show("Memes/ItsFine", "default", 8000)

            await show("Text/Marquee", "hsnlgroot", 8000)

            await show("Logos/Hackerhotel", "default", 8000)

            await show("Text/Marquee", "github", 16000)

            await show("Text/Marquee", "hsnl", 8000)

            await show("Logos/divd", "default", 8000)

            // await show("Logos/HSD", "default", 0)
            await show("Logos/HSD64W20H", "default", 8000)


            // await show("Text/BTC", "default", 8000)
            // scheduler.clear()
            // await new FxFlameout(scheduler, fxControls).run(box)


            // // await new FxFlameout(scheduler, fxControls).run(box)





            // await show("Cyber", "default", 2000)
            // await new FxFlameout(scheduler, fxControls).run(display)
            // scheduler.clear()


        }
    }
}
