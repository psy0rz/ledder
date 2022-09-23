import Animation  from "../Animation.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import DrawCounter from "../draw/DrawCounter.js"
import DrawText from "../draw/DrawText.js"
import {fonts} from "../fonts.js"
import Starfield from "./Starfield.js"
import {random} from "../util.js"
import BertrikFire from "./BertrikFire.js"
import PixelBox from "../PixelBox.js"
import { cryptoFirstLast} from "../crypto.js"

export default class BTC extends Animation {
    static category = "Misc"
    static title = "BTC"
    static description = "blabla"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        let init = true
        let counter

        const percentageRange=controls.range("Burn/Moon percentages", -1,1,-20,20,0.1)

        fonts.C64.load()

        function update() {

            cryptoFirstLast('BTCUSDT',  (symbol, first, last) => {

                if (init) {

                    const percentage=((last/first)-1)*100
                    console.log("Percentage change 24h:", percentage)

                    if (percentage<=percentageRange.from)
                    {
                        const flames=new BertrikFire()
                        flames.run(box, scheduler,controls)
                    }

                    if (percentage>=percentageRange.to) {
                        const stars = new Starfield()
                        stars.run(box, scheduler, controls.group("stars"))
                    }

                    counter = new DrawCounter()
                    box.add(counter)

                    const y=~~box.middleY()-3
                    const digitCount=6
                    counter.run(scheduler, controls, box.xMax-(digitCount*7),y,digitCount, 0.001)


                    const label=new DrawText(0,y, fonts.C64, "BTC$", controls.color('Text color'))
                    box.add(label)
                    counter.update(~~first)
                    init = false
                }

                counter.update(~~last)
            })
        }

        update()

        scheduler.interval(30*60, () => update())

    }
}
