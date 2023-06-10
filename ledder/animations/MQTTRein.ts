import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animator from "../Animator.js"
import mqtt, {MqttClient} from "mqtt"
import {statusMessage} from "../message.js"
import DrawText from "../draw/DrawText.js"
import AnimationManager from "../server/AnimationManager.js"
/*
Example:

Select animimation:  topc: 'ledder/select' message: Text/Marquee/default
Get variables: -t 'ledder/get' -m ''



 */

export default class MQTTRein extends Animator {
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

        const mqttHost = controls.input('MQTT host', "192.168.1.10", true)
        const mqttTopic = controls.input('MQTT topic', "ledder", true)

        let childControls = controls.group('Current animation')



        this.animationManager = new AnimationManager(box, scheduler.child(), childControls)

        this.statusMessage(`Conn ${mqttHost.text}...`)
        console.log(`MQTT: Connecting ${mqttHost.text}`)
        let mqttClient = mqtt.connect("mqtt://" + mqttHost.text, {})

        //recursively send all control values to mqtt
        function sendControls(topic: string, controlGroup: ControlGroup) {

            for (const [name, control] of Object.entries(controlGroup.meta.controls)) {
                if (control instanceof ControlGroup) {
                    sendControls(topic + "/" + name, control)
                } else {
                    mqttClient.publish(topic + "/" + name, JSON.stringify(control.save()))
                }
            }

        }


        mqttClient.on('reconnect', () => {
            this.statusMessage(`Reconn ${mqttHost.text}...`)
            console.log(`MQTT: Reconnecting ${mqttHost.text}`)

        })

        mqttClient.on('connect', () => {
            console.log("MQTT: Connected")
            this.statusMessage(`${mqttHost.text} OK.`)
            mqttClient.subscribe(mqttTopic.text + '/#')
        })

        mqttClient.on('error', (e) => {
            console.error("MQTT error: ", e.message)
            this.statusMessage(e.message)
        })


        mqttClient.on('message', async (topic, messageBuf) => {
                let message = messageBuf.toString()
                // console.log(`MQTT ${topic}: ${message}`)
                this.statusMessage(message);

               

                

            }
        )


    }
}
