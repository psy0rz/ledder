import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {fonts, fontSelect} from "../../fonts.js"
import DrawCounter from "../../draw/DrawCounter.js"
import DrawText from "../../draw/DrawText.js"
import {cryptoFirstLast} from "../../crypto.js"
import Fire from "../Fires/Fire.js"
import Starfield from "../Components/Starfield.js"
import Animator from "../../Animator.js"

export default class BTC extends Animator {
    static category = "Misc"
    static title = "BTC"
    static description = "Rotating bitcoin counter."

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {


        let init = true
        let counter

        const choices=[
            {
                id: "BTCUSDT",
                name: "BTC$"
            },
            {
                id: "ETHUSDT",
                name: "ETH$"
            },
        ]
        const symbolSelect=controls.select("Symbol", "BTCUSDT", choices, true )


        const percentageRange=controls.range("Burn/Moon percentages", -1,1,-5,5,0.1, true)

        fonts.C64.load()

        const firebox=new PixelBox(box)
        firebox.xMin=5
        firebox.xMax=20
        box.add(firebox)

        const starBox=new PixelBox(box)
        box.add(starBox)

        counter = new DrawCounter()
        box.add(counter)

        const y=~~box.middleY()-3
        const x=~~box.middleX()-8

        const digitCount=6


        const label=new DrawText(x-25,y+1, fontSelect(controls), symbolSelect.selected, controls.color('Text color'))
        box.add(label)

        let stopped=false
        scheduler.onCleanup(()=>{
            stopped=true
        })

        function update() {

            cryptoFirstLast(symbolSelect.selected,  (symbol, first, last) => {

                if (stopped)
                    return

                if (init) {

                    counter.run(scheduler, controls, x,y,digitCount, 0.001)

                    const percentage=((last/first)-1)*100
                    console.log("Percentage change 24h:", percentage)

                    if (percentage<=percentageRange.from)
                    {
                        const flames=new Fire()
                        flames.run(firebox, scheduler,controls)
                    }

                    if (percentage>=percentageRange.to) {
                        const stars = new Starfield()
                        stars.run(starBox, scheduler, controls.group("stars"))
                    }

                    counter.update(~~first)
                    // counter.update(0)
                    init = false
                }

                counter.update(~~last)
                // counter.update(100)
            })
        }

       update()

        scheduler.interval(30*60, () => update())

    }
}
