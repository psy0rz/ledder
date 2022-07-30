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
import DrawText from "../draw/DrawText.js"
import {fontSelect} from "../fonts.js"
import {colorGreen} from "../Colors.js"
import Starfield from "./Starfield.js"

export default class Template extends Animation {
    static category = "Misc"
    static title = "mqtt counter"
    static description = "blabla"
    static presetDir = "mqttcounter"

    async run(display: Display, scheduler: Scheduler, controls: ControlGroup) {

        new Starfield().run(display,scheduler, controls.group("stars"))

        const counter = new DrawCounter()
        display.add(counter)

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
            counter.update(scheduler, controls, 0,0, Number(str), 4)

        })


        display.add(new DrawText(40, 0, fontSelect(controls), "WATT", new Color(255,255,255,0.1)))

    }
}
