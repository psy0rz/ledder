import PixelBox from "../PixelBox.js"
import Pixel from "../Pixel.js"
import Scheduler from "../Scheduler.js"
import Color from "../Color.js"
import ControlGroup from "../ControlGroup.js"
import Animator from "../Animator.js"
import mqtt from "mqtt"
import DrawCounter from "../draw/DrawCounter.js"
import Text from "./Text.js"
import DrawBox from "../draw/DrawBox.js"
import {colorBlack, colorRed} from "../Colors.js"


export default class TicketCounter extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const mqttHost = controls.input('MQTT host', 'mqtt://mqtt.why2025.org')
        const mqttTopic = controls.input('MQTT topic', 'why2025/ticketshop/quotas/Event Visitors/paid_orders')
        const digitCount=controls.value('Digits', 4)

        const xPad=8
        const textAnimation=new Text()
        const counterX=box.width()/2 - (7*2)




        let textBox=new PixelBox(box)
        box.add(textBox)

        textAnimation.run(textBox, scheduler, controls.group("Marquee"))


        // box.add(new DrawBox(counterX-3, 0, box.xMax-counterX+xPad, box.height(), colorBlack ))


        let counter = new DrawCounter()
        counter.run(scheduler, controls,counterX , (box.height()/2)-12, 4, 0.001)
        box.add(counter)

        const mqttClient = mqtt.connect(mqttHost.text)

        mqttClient.on('connect', () => {
            console.log(`MQTT: ${mqttHost.text} connected`)

            mqttClient.subscribe(mqttTopic.text)
            mqttClient.subscribe('why2025/ticketshop/quotas/Event Visitors/pending_orders')
        })

        let paidCount=undefined
        let pendingCount=undefined
        mqttClient.on('message', async (topic, messageBuf) => {


            let message = messageBuf.toString()

            if (topic==='why2025/ticketshop/quotas/Event Visitors/paid_orders')
                paidCount=Number(message)

            if (topic==='why2025/ticketshop/quotas/Event Visitors/pending_orders')
                pendingCount=Number(message)

            if (paidCount !==undefined && pendingCount!==undefined)
                counter.update(paidCount+pendingCount)
        })
    }
}
