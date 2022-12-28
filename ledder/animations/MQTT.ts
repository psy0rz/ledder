import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animation from "../Animation.js"
import mqtt, {MqttClient} from "mqtt"
import {config} from "../server/config.js"
import {statusMessage} from "../message.js"


export default class MQTT extends Animation {
    private client: MqttClient

    cleanup() {
        if (this.client !== undefined)
            this.client.end(true)
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const mqttHost = controls.input('MQTT host', "", true)

        statusMessage(box, `Conn ${mqttHost.text}...`)
        console.log(`MQTT: Connecting ${mqttHost.text}`)
        this.client = mqtt.connect("mqtt://"+mqttHost.text, {})


        this.client.on('connect', (e) => {
            console.log("MQTT: Connected")
            statusMessage(box, "Conn OK")
            this.client.subscribe(`/HACKERSPACE/${config.nodename}/run`, function (err) {
            })
        })

        this.client.on('error', (e) => {
            console.error("MQTT error: ", e)
            statusMessage(box, e.message)
        })


        this.client.on('message', async (topic, message) => {
            let str = message.toString()
            console.log("MQTT received: ", str)
            let pars = str.split('/', 2)

            // for (const runner of runners) {
            //     await runner.runName(pars[0], pars[1])
            // }
        })


    }
}
