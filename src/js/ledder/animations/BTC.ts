import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import DrawCounter from "../draw/DrawCounter.js"
import * as https from "https"
import DrawText from "../draw/DrawText.js"
import {fontSelect} from "../fonts.js"
import {Color} from "../Color.js"

export default class Template extends Animation {
    static category = "Misc"
    static title = "BTC"
    static description = "blabla"
    static presetDir = "BTC"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const counter = new DrawCounter()
        display.add(counter)

        display.add(new DrawText(0,0, fontSelect(controls), "BTC $", new Color()))


        function update() {
            try {
                const url = 'https://blockchain.info/ticker'
                https.get(url, (res) => {
                    // console.log(res)
                    let data = ""
                    res.on('data', (d) => {
                        data += d.toString()
                    })

                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data)
                            counter.update(scheduler, controls, 36,0,~~json.USD.last, 5)

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


    }
}
