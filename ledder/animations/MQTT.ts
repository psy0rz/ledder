import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animation from "../Animation.js"
import mqtt, {MqttClient} from "mqtt"
import {statusMessage} from "../message.js"
import {PresetStore} from "../server/PresetStore.js"
import DrawText from "../draw/DrawText.js"
import {random} from "../utils.js"
import {id} from "framework7/shared/utils.js"

// class test{
//     constructor() {
//
//     }
//
//     async test1()
//     {
//
//         console.log("1het is ", this.id)
//     }
//     test2()
//     {
//         this.id=random(0,1000)
//         console.log("2het is ", this.id)
//     }
//
// }
//
// let t=new test()
// t.test2()
// t.test1()


export default class MQTT extends Animation {
    private client: MqttClient
    private currentAnimation: Animation

    private box: PixelBox
    private scheduler: Scheduler
    private controls: ControlGroup
    private lastStatusMessage: DrawText

    cleanup() {
        console.log("clean", this.id)
        if (this.client !== undefined)
            this.client.end(false)

        this.animationReset()
    }

    animationReset() {
        if (this.currentAnimation !== undefined) {
            this.currentAnimation.cleanup()
            this.currentAnimation = undefined
        }
        this.scheduler.clear()
        this.box.clear()
        this.controls.clear()

    }

    async animationRun(animationName, presetName) {

        this.animationReset()

        try {
            const presetStore = new PresetStore()
            const animationClass = await presetStore.loadAnimation(animationName)
            this.currentAnimation = new animationClass()
            const presetValues = await presetStore.load(animationName, presetName)
            this.controls.load(presetValues.values)
            return this.currentAnimation.run(this.box, this.scheduler, this.controls)
        } catch (e) {
            this.statusMessage("Error: " + e.message)
        }

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
        this.id = random(0, 10000)
        console.log("IK HEB ID", this.id)
        const mqttHost = controls.input('MQTT host', "mqtt", true)
        const mqttTopic = controls.input('MQTT topic', "ledder", true)

        this.box = box
        this.scheduler = scheduler
        this.controls = controls.group('Current animation')

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
            console.log("MQTT received: ", message)

            let subTopic = topic.substring(mqttTopic.text.length + 1)
            let parts = subTopic.split('/')
            let cmd = parts[0]
            let pars = parts.slice(1)

            if (cmd == 'run') {
                console.log("MQTT: Running animation")
                try {
                    let animationName = message.match(RegExp("(^.*)/"))[1]
                    let presetName = message.match(RegExp("[^/]+$"))[0]
                    this.animationRun(animationName, presetName)

                } catch (e) {
                    console.error("MQTT error while starting animation: ", e)
                    this.statusMessage("Animation failed.")
                }
            }

        })


    }
}
