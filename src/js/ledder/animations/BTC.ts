import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import DrawCounter from "../draw/DrawCounter.js"
import * as https from "https"
import DrawText from "../draw/DrawText.js"
import {fontSelect} from "../fonts.js"
import {Color} from "../Color.js"
import FxFlames from "../fx/FxFlames.js"
import {PixelContainer} from "../PixelContainer.js"
import Starfield from "./Starfield.js"

export default class Template extends Animation {
    static category = "Misc"
    static title = "BTC"
    static description = "blabla"
    static presetDir = "BTC"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        if (controls.group("stars").switch("enabled", false).enabled)
            new Starfield().run(display, scheduler, controls.group("stars"))

        const counter = new DrawCounter()
        display.add(counter)

        const label=new DrawText(0,0, fontSelect(controls), "BTC $", new Color(55,55,55,1))
        display.add(label)
        const flameContainer=new PixelContainer()
        display.add(flameContainer)

        let first=true
        function update() {
            try {
                const url = 'https://blockchain.info/ticker'
                https.get(url, (res) => {
                    // console.log(res)
                    let data = ""
                    res.on('data', (d) => {
                        data += d.toString()
                    })

                    res.on('end', async () => {
                        try {
                            const json = JSON.parse(data)
                            if (first) {
                                // await counter.update(scheduler, controls, 36, 0, ~~json.USD.last - 100, 5)
                                await counter.update(scheduler, controls, 36, 0, 0, 5)
                                first=false
                            }

                            await counter.update(scheduler, controls, 36,0,~~json.USD.last, 5)



                        } catch (e) {
                            console.error(e)
                        }
                    })
                })
            } catch (e) {
                console.error(e)
            }
        }

        update()

        scheduler.interval(15000 / display.frameMs, () => update())


        new FxFlames(scheduler, controls.group("Flames")).run(label, flameContainer)


    }
}
