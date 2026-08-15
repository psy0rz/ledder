import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import {fonts, fontSelect} from "../fonts.js"
import Counter from "./Counter.js"
import DrawText from "../draw/DrawText.js"
import {cryptoTicker24h} from "../crypto.js"
import Animator from "../Animator.js"

export default class Crypto extends Animator {
    static description = "Rotating bitcoin counter."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        let init = true
        let counter

        const symbolInput=controls.input("Symbol", "BTCUSDT", true)
        const labelInput=controls.input("Label", "BTC", true)

        fonts.C64.load()

        counter = new Counter()


        const digitCount=6

        //the counter draws from the top left of the box it gets, so put that corner where we want it
        const counterBox=new PixelBox(box)
        box.add(counterBox)

        const position=controls.position("Label position", box)
        const label=new DrawText(position.x,position.y, fontSelect(controls), labelInput.text, controls.color('Text color'))
        box.add(label)

        let stopped=false
        scheduler.onCleanup(()=>{
            stopped=true
        })

        const update = async () => {

            let ticker
            try {
                ticker = await cryptoTicker24h(symbolInput.text)
            } catch (e) {
                console.error("BTC:", e)
                return
            }

            if (stopped)
                return

            if (init) {

                counter.run(counterBox, scheduler, controls, digitCount, 0.001)

                counter.update(~~ticker.openPrice)
                init = false
            }

            counter.update(~~ticker.lastPrice)
        }

       void update()

        //not awaited: the interval only kicks off the next update, it never waits for it
        scheduler.interval(30*60, () => { void update() })

    }
}
