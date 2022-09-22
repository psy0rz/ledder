import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import DrawCounter from "../draw/DrawCounter.js"
import DrawText from "../draw/DrawText.js"
import {fontSelect} from "../fonts.js"
import Starfield from "./Starfield.js"
import {cryptoFirstLast, random} from "../util.js"
// curl -H "X-CMC_PRO_API_KEY: ..." -H "Accept: application/json" -d "" -G https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH
//https://cryptingup.com/api/markets
//https://api2.binance.com/api/v3/ticker/24hr

export default class BTC extends Animation {
    static category = "Misc"
    static title = "BTC"
    static description = "blabla"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {
        // if (controls.group("stars").switch("enabled", false).enabled)

        // const flames=new BertrikFire()
        // flames.run(display, scheduler,controls)

        const stars=new Starfield()
        stars.run(display, scheduler, controls.group("stars"))

        const counter = new DrawCounter()
        display.add(counter)

        const y=~~(display.height/2)-4
        const digitCount=6
        counter.run(scheduler, controls, display.width-(digitCount*7),y,digitCount, 0.001)


        const label=new DrawText(0,y, fontSelect(controls), "BTC$", controls.color('Text color'))
        display.add(label)




        let init = true
        function update() {

            cryptoFirstLast('BTCUSDT', async (symbol, first, last) => {

                if (init) {
                    counter.update(~~first)
                    init = false
                }

                counter.update(~~last)
            })
        }

        update()

        scheduler.interval(30000 / display.frameMs, () => update())

    }
}
