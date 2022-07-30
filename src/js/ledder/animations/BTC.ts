import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import DrawCounter from "../draw/DrawCounter.js"
import * as https from "https"

export default class Template extends Animation {
    static category = "Misc"
    static title = "Template for new animations"
    static description = "blabla"
    static presetDir = "Misc"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const counter = new DrawCounter()
        display.add(counter)


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
                            counter.update(scheduler, controls, ~~json.USD.last, 5)

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

        scheduler.interval(30000 / display.frameMs, () => update())


    }
}
