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
        const mqttHost = controls.input('MQTT host', "mqtt", true)
        const mqttTopic=controls.input('MQTT topic', "/ledder", true)

        statusMessage(box, `Conn ${mqttHost.text}...`)
        console.log(`MQTT: Connecting ${mqttHost.text}`)
        this.client = mqtt.connect("mqtt://" + mqttHost.text, {})

        this.client.on('reconnect', (e) => {
            statusMessage(box, `Reconn ${mqttHost.text}...`)
            console.log(`MQTT: Reconnecting ${mqttHost.text}`)

        })

        this.client.on('connect', (e) => {
            console.log("MQTT: Connected")
            statusMessage(box, "Conn OK")
            this.client.subscribe(mqttTopic.text)
            // function (err) {
            //     console.log("MQTT error: ", err)
            //     statusMessage(box,err.message)
            // })
        })

        this.client.on('error', (e) => {
            console.error("MQTT error: ", e.message)
            statusMessage(box, e.message)
        })


        this.client.on('message', async (topic, message) => {
            let str = message.toString()
            console.log("MQTT received: ", str)
            statusMessage(box, str)
            let pars = str.split('/', 2)

            // for (const runner of runners) {
            //     await runner.runName(pars[0], pars[1])
            // }
        })


    }
}
