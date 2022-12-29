import PixelBox from "../PixelBox.js"
import Scheduler from "../Scheduler.js"
import ControlGroup from "../ControlGroup.js"
import Animation from "../Animation.js"
import mqtt, {MqttClient} from "mqtt"
import {config} from "../server/config.js"
import {statusMessage} from "../message.js"
import {PresetStore} from "../server/PresetStore.js"
import controls from "../../src/pages/controls.svelte"
import {nameAndPreset} from "../../src/pages/animationrunner.svelte"


export default class MQTT extends Animation {
    private client: MqttClient
    private currentAnimation: Animation

    private box: PixelBox
    private scheduler: Scheduler
    private controls: ControlGroup

    cleanup() {
        if (this.client !== undefined)
            this.client.end(true)
    }

    async animationReset() {
        if (this.currentAnimation !== undefined) {
            this.currentAnimation.cleanup()
            this.currentAnimation == undefined
        }
        this.scheduler.clear()
        this.box.clear()
        this.controls.clear()

    }

    async animationRun(animationName, presetName) {
        this.animationReset()

        const presetStore = new PresetStore()
        const animationClass = await presetStore.loadAnimation(animationName)
        const animation = new animationClass()
        const presetValues = await presetStore.load(animationName, presetName)
        this.controls.load(presetValues.values)
        return animation.run(this.box, this.scheduler, this.controls)

    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const mqttHost = controls.input('MQTT host', "mqtt", true)
        const mqttTopic = controls.input('MQTT topic', "ledder", true)

        this.box = box
        this.scheduler = scheduler
        this.controls = controls.group('Current animation')

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
            this.client.subscribe(mqttTopic.text + '/#')
        })

        this.client.on('error', (e) => {
            console.error("MQTT error: ", e.message)
            statusMessage(box, e.message)
        })


        this.client.on('message', async (topic, messageBuf) => {
            let message = messageBuf.toString()
            console.log("MQTT received: ", message)

            let subTopic = topic.substring(mqttTopic.text.length + 1)
            let parts = subTopic.split('/')
            let cmd = parts[0]
            let pars = parts.slice(1)

            if (cmd == 'run') {
                let animationName = message.match(RegExp("(^.*)/"))[1]
                let presetName = message.match(RegExp("[^/]+$"))[0]
                this.animationRun(animationName, presetName)
            }

        })


    }
}
