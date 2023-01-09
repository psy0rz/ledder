import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animation from "../Animation.js"
import mqtt, {MqttClient} from "mqtt"
import {statusMessage} from "../message.js"
import {PresetStore} from "../server/PresetStore.js"
import DrawText from "../draw/DrawText.js"
import AnimationManager from "../server/AnimationManager.js"


export default class MQTT extends Animation {
    private client: MqttClient
    private currentAnimation: Animation

    private box: PixelBox
    private scheduler: Scheduler
    private controls: ControlGroup
    private lastStatusMessage: DrawText
    private animationManager: AnimationManager


    animationReset() {
        this.scheduler.clear()
        this.box.clear()
        this.controls.clear()

    }


    cleanStatusMesage() {
        if (this.lastStatusMessage)
            this.box.delete(this.lastStatusMessage)
    }

    statusMessage(text: string) {
        this.cleanStatusMesage()
        this.lastStatusMessage = statusMessage(this.box, text)
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        scheduler.onCleanup(() => {
            console.log("DISCONNEC")
            if (this.client !== undefined)
                this.client.end(true)

        })

        this.box = box

        const mqttHost = controls.input('MQTT host', "mqtt", true)
        const mqttTopic = controls.input('MQTT topic', "ledder", true)


        let childControls = controls.group('Current animation')
        this.animationManager = new AnimationManager(box, scheduler.child(), childControls)

        this.statusMessage(`Conn ${mqttHost.text}...`)
        console.log(`MQTT: Connecting ${mqttHost.text}`)
        this.client = mqtt.connect("mqtt://" + mqttHost.text, {})


        this.client.on('reconnect', (e) => {
            this.statusMessage(`Reconn ${mqttHost.text}...`)
            console.log(`MQTT: Reconnecting ${mqttHost.text}`)

        })

        this.client.on('connect', (e) => {
            console.log("MQTT: Connected")
            this.statusMessage("Conn OK")
            this.client.subscribe(mqttTopic.text + '/#')
        })

        this.client.on('error', (e) => {
            console.error("MQTT error: ", e.message)
            this.statusMessage(e.message)
        })


        this.client.on('message', async (topic, messageBuf) => {
                let message = messageBuf.toString()
                console.log(`MQTT ${topic}: ${message}`)

                let subTopic = topic.substring(mqttTopic.text.length + 1)
                let parts = subTopic.split('/')
                let cmd = parts[0]
                let pars = parts.slice(1)

                switch (cmd) {
                    case 'select':
                        console.log(`MQTT: Running animation ${message}`)
                        try {
                            this.animationManager.select(message, false)

                        } catch (e) {
                            console.error("MQTT error while starting animation: ", e)
                            this.statusMessage("Animation failed.")
                        }
                        break
                    case 'stop':
                        this.animationManager.stop(false)
                        break

                }

            }
        )


    }
}
