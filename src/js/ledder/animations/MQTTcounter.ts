import {Animation} from "../Animation.js"
import {Display} from "../Display.js"
import {Scheduler} from "../Scheduler.js"
import {ControlGroup} from "../ControlGroup.js"
import {Pixel} from "../Pixel.js"
import {Color} from "../Color.js"
import {PixelContainer} from "../PixelContainer.js"
import DrawCounter from "../draw/DrawCounter.js"
import {request} from "https"
import mqtt from "mqtt"
import {mqttHost, mqttOpts, nodename} from "../../../../displayconf.js"

export default class Template extends Animation {
    static category = "Misc"
    static title = "mqtt counter"
    static description = "blabla"
    static presetDir = "mqttcounter"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        const counter = new DrawCounter()
        display.add(counter)
        counter.run(scheduler, controls, 0, 5)

        let mqttHost='mqtt://151.216.0.196'
        let mqttOpts={port:1025}

        const client  = mqtt.connect(mqttHost,mqttOpts)

        client.on('connect', ()=> {
            console.log("Connected to ", mqttHost)
            client.subscribe(`haxo/tent/gosund/sensor/gosund_sp112_4_power/state`, function (err) {
            })
        })

        client.on('error', (e)=>{
   console.error("MQTT error: ",e)
        });


        client.on('message', async  (topic, message) =>{
            let str=message.toString()
            console.log("MQTT received: ",str)
            counter.targetValue=Number(str)
        })




    }
}
