import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {PresetStore} from "../../server/PresetStore.js"
import FxFlameout from "../fx/FxFlameout.js"
import FxPacman from "../fx/FxPacman.js"

const presetStore = new PresetStore()

export default class Template extends Animation {
    static category = "Misc"
    static title = "Cycle stuff"
    static description = ""



    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        async function show(animationName, presetName, time) {
            const subControls=controls.group(animationName)
            const animationClass=await presetStore.loadAnimation(animationName)
            const animation= new animationClass()
            if (presetName!=="") {
                const presetValues = await presetStore.load(animationClass, presetName)
                subControls.load(presetValues.values)
            }
            animation.run(display, scheduler,subControls)

            await scheduler.delay(time/display.frameMs)

            // scheduler.clear()
        }

        const fxControls=controls.group("FX")
        while(1) {
            await show("BTC", "default", 30000)
            scheduler.clear()
            await new FxFlameout(scheduler, fxControls).run(display)

            // await show("MQTTcounter", "default", 30000)
            // scheduler.clear()
            // await new FxFlameout(scheduler, fxControls).run(display)



            await show("ItsFine", "default", 8000)
            scheduler.clear()
            await new FxFlameout(scheduler, fxControls).run(display)


            show ("Starfield", "",0)
            await show("Marquee", "idiopolisstatic", 3000)
            scheduler.clear()
            await new FxFlameout(scheduler, fxControls).run(display)


            await show("Syn2cat", "default", 3000)
            scheduler.clear()
            await new FxFlameout(scheduler, fxControls).run(display)

            await show("Haxogreen", "default", 3000)
            scheduler.clear()
            await new FxFlameout(scheduler, fxControls).run(display)


            // await show("Marquee", "idiopolis", 6000)
            // await new FxFlameout(scheduler, fxControls).run(display)
            // scheduler.clear()

            // await show("BrainsmokeFire", "", 6000)
            // await new FxPacman(scheduler, fxControls).run(display, 0, display.height )
            // scheduler.clear()


            // await show("MaakPlek", "default", 3000)
            // await new FxFlameout(scheduler, fxControls).run(display)
            // scheduler.clear()

            // show("PoliceLights", "hackers", 0)
            // await scheduler.delay(6000/display.frameMs)
            // await new FxPacman(scheduler, fxControls).run(display, 0, display.height )
            // // await new FxFlameout(scheduler, fxControls).run(display)
            // scheduler.clear()

            // await show("TDVENLO", "default", 3000)
            // await new FxFlameout(scheduler, fxControls).run(display)
            // scheduler.clear()
            //
            await show("Nyancat", "", 3000)
            await new FxPacman(scheduler, fxControls).run(display, 0, display.height )
            scheduler.clear()

            // await show("TkkrLab", "default", 3000)
            // await new FxFlameout(scheduler, fxControls).run(display)
            // scheduler.clear()

            await show("HSD", "default", 4000)
            await new FxPacman(scheduler, fxControls).run(display, 0, display.height )
            // await new FxFlameout(scheduler, fxControls).run(display)
            scheduler.clear()


            // await show("Cyber", "default", 2000)
            // await new FxFlameout(scheduler, fxControls).run(display)
            // scheduler.clear()


        }
    }
}
