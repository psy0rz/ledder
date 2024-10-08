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

Select animimation:  topic: 'ledder/select' message: Text/Marquee/default
Get variables: -t 'ledder/get' -m ''



 */

export default class MQTT extends Animator {
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

        const mqttHost = controls.input('MQTT host', "localhost", true)
        const mqttTopic = controls.input('MQTT topic', "ledder", true)

        let childControls = controls.group('Current animation')



        this.animationManager = new AnimationManager(box, scheduler.child(), childControls)

        this.statusMessage(`conn ${mqttHost.text}`)
        console.log(`MQTT: Connecting ${mqttHost.text}`)
        let mqttClient = mqtt.connect("mqtt://" + mqttHost.text, {})

        mqttClient.on('connect', ()=>{
            console.log(`MQTT: ${mqttHost.text} connected`)
            this.statusMessage("conn ok")
            mqttClient.subscribe(mqttTopic.text+"/#")
        })

        mqttClient.on('disconnect', ()=>{
            console.error(`MQTT: ${mqttHost.text} disconnected`)
            this.statusMessage("disc.")
        })

        mqttClient.on('error', (e)=>{
            console.error(`MQTT: ${mqttHost.text} error ${e}`)
            this.statusMessage("error")
        })


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
                        console.log(`MQTT select ${message}`)

                            await this.animationManager.select(message, false).catch((e) => {
                                this.animationManager.stop(false)
                                this.statusMessage((e.message))
                                console.error(e.message)

                            })

                        break
                    case 'stop':
                        console.log("MQTT stop")
                        this.animationManager.stop(false)
                        break
                    case 'get':
                        console.log("MQTT get")

                        sendControls(mqttTopic.text + "/state", childControls)
                        break
                    case 'set':
                        const path = pars
                        console.log("MQTT set: ", path, message)
                        childControls.updateValue(path, JSON.parse(message))
                        break


                }

            }
        )


    }
}
