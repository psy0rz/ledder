import PixelBox from "../PixelBox.js"
import Pixel from "../Pixel.js"
import Scheduler from "../Scheduler.js"
import Color from "../Color.js"
import ControlGroup from "../ControlGroup.js"
import Animator from "../Animator.js"
import mqtt from "mqtt"
import Counter from "./Counter.js"
import Text from "./Text.js"
import DrawBox from "../draw/DrawBox.js"
import {colorBlack, colorRed} from "../Colors.js"


export default class TicketCounter extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const mqttHost = controls.input('MQTT host', 'mqtt://mqtt.why2025.org')
        const mqttTopic = controls.input('MQTT topic', 'why2025/ticketshop/quotas/Event Visitors/paid_orders')
        const xPad=8
        const textAnimation=new Text()
        const counterX=box.width()/2 - (7*2)




        let textBox=new PixelBox(box)
        box.add(textBox)

        textAnimation.run(textBox, scheduler, controls.group("Marquee"))


        // box.add(new DrawBox(counterX-3, 0, box.xMax-counterX+xPad, box.height(), colorBlack ))


        //the counter draws from the top left of the box it gets, so put that corner where we want it
        const counterBox=new PixelBox(box)
        counterBox.xMin=counterX
        counterBox.yMin=(box.height()/2)-12
        box.add(counterBox)

        let counter = new Counter()
        counter.run(counterBox, scheduler, controls, 4, 0.001)

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
