import PixelBox from "../../PixelBox.js"
import Clock from "../Components/Clock.js"
import Julibrot from "../Fractals/Julibrot.js"
import Rainbowcross from "../Ledart/Rainbowcross.js"
import Rainbowsquare from "../Ledart/Rainbowsquare.js"
import Rainbowsinus from "../Ledart/Rainbowsinus.js"
import Rainbowzero from "../Ledart/Rainbowzero.js"
import Fire from "../Fires/Fire.js"
import Starfield from "../Components/Starfield.js"
import FxPacman from "../../fx/FxPacman.js"
import Pacman from "../Components/Pacman.js"
import Wandelaar from "../Components/Wandelaar.js"
import Wandelaarster from "../Components/Wandelaarster.js"
import Cyber from "../Memes/Cyber.js"
import Nyancat from "../Memes/Nyancat.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import FxFlameout from "../../fx/FxFlameout.js"

import {PresetStore} from "../../server/PresetStore.js"
import {FxFadeMask} from "../../fx/FxFadeMask.js"


const presetStore = new PresetStore()

export default class Cycle extends Animator {
    static category = "Compositions"
    static title = "Demo"
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
            const animationClass=await presetStore.loadAnimation(animationName)
            const animation= new animationClass()
            if (presetName!=="") {
                const presetValues = await presetStore.load(animationName, presetName)
                subControls.load(presetValues.values)
            }

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
            await show("Logos/HSD", "default", 5000)
           
            await show("Components/Clock", "default", 5000)
            scheduler.clear()
           
            await show("Ledart/Rainbowsinus", "default", 30000)
            scheduler.clear()
           
           
            await show("Ledart/Rainbowcross", "default", 15000)
            scheduler.clear()
        

            await show("Ledart/Rainbowzero", "default", 50000)
            scheduler.clear()
           
           
            await show("Ledart/Rainbowsquare", "default", 30000)
            scheduler.clear()

           
            await show("Fractals/Julibrot", "default", 60000)
            scheduler.clear()
           




         


        }
    }
}