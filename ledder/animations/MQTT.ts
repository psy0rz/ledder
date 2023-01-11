import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animation from "../Animation.js"
import mqtt, {MqttClient} from "mqtt"
import {statusMessage} from "../message.js"
import DrawText from "../draw/DrawText.js"
import AnimationManager from "../server/AnimationManager.js"


export default class MQTT extends Animation {
    // private client: MqttClient

    private box: PixelBox
    private lastStatusMessage: DrawText
    private animationManager: AnimationManager



    cleanStatusMesage() {
        if (this.lastStatusMessage)
            this.box.delete(this.lastStatusMessage)
    }

    statusMessage(text: string) {
        this.cleanStatusMesage()
        if (text)
            this.lastStatusMessage = statusMessage(this.box, text)
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        scheduler.onCleanup(() => {
            if (mqttClient !== undefined)
                mqttClient.end(true)

        })

        this.box = box

        const mqttHost = controls.input('MQTT host', "mqtt", true)
        const mqttTopic = controls.input('MQTT topic', "ledder", true)


        let childControls = controls.group('Current animation')
        this.animationManager = new AnimationManager(box, scheduler.child(), childControls)

        this.statusMessage(`Conn ${mqttHost.text}...`)
        console.log(`MQTT: Connecting ${mqttHost.text}`)
        let mqttClient = mqtt.connect("mqtt://" + mqttHost.text, {})

        //recursively send all controls to mqtt
        function sendControls(topic:string, controlGroup:ControlGroup)
        {
            for (const [name, control] of Object.entries(controlGroup)) {
                if (control.meta.controls!==undefined) {
                    console.log("INSTANCE", control)
                    sendControls(topic + "/" + name, control)
                }
                else {
                    console.log("NEEN", control)

                    mqttClient.publish(topic + "/" + control.name, JSON.stringify(control))
                }
            }

        }


        mqttClient.on('reconnect', () => {
            this.statusMessage(`Reconn ${mqttHost.text}...`)
            console.log(`MQTT: Reconnecting ${mqttHost.text}`)

        })

        mqttClient.on('connect', () => {
            console.log("MQTT: Connected")
            this.statusMessage(`${mqttHost.text} connected.`)
            mqttClient.subscribe(mqttTopic.text + '/#')
        })

        mqttClient.on('error', (e) => {
            console.error("MQTT error: ", e.message)
            this.statusMessage(e.message)
        })


        mqttClient.on('message', async (topic, messageBuf) => {
                let message = messageBuf.toString()
                console.log(`MQTT ${topic}: ${message}`)
                this.statusMessage("")

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
                    case 'get':
                        sendControls( mqttTopic.text,childControls)
                        break

                }

            }
        )


    }
}
