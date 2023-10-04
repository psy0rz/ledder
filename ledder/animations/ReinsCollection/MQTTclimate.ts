import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import mqtt, {MqttClient} from "mqtt"
import {statusMessage} from "../../message.js"
import DrawText from "../../draw/DrawText.js"
import AnimationManager from "../../server/AnimationManager.js"
import {fonts, fontSelect} from "../../fonts.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"

const timeIcon=`
..5555..
.5...55.
5...5..5
5..5...5
5...5..5
5....5.5
.5....5.
..5555..
`

const temperatureIcon=`
..505...
..505...
..5r5...
..5r5...
..5r5...
.5rrr5..
.5rrr5..
..555...
`

const humidityIcon=`
...b....
...b....
..bbb...
..bbb...
.b5bbb..
.5bbbb..
.b5bbb..
..bbb...
`

const pressureIcon=`
...bb...
...bb...
...bb...
...bb...
...bb...
.b....b.
..b..b..
...bb...
`








export default class MQTTClimate extends Animator {
    mqttData=new Array()
    statusArr=[]

    cleanStatusMesage() {
        this.statusArr=["OK"]
    }

    processMessage(topic:string ,message:String) {
        if (topic.toString().search('Temperature')>0) { this.mqttData["temperature"]=message }
        if (topic.toString().search('Humidity')>0) { this.mqttData["humidity"]=message }
        if (topic.toString().search('Pressure')>0) { this.mqttData["pressure"]=message }
    }

    processStatus(statusMessage:String)
    {
      this.statusArr.push(statusMessage)
    }


    showAsSingleLineScroller(box,pixellist,frameNr,font,colorSettingText,y=0)
    {
        let slot=Math.round(frameNr/500)%3
        let x=box.width()-Math.round(frameNr/10)%(300+box.width())
     
        let pixelsBefore=0

        let temperatureStr=this.mqttData["temperature"]+"'C"
        pixellist.add(new DrawAsciiArtColor(x+pixelsBefore,0, temperatureIcon))
        pixellist.add(new DrawText(x+pixelsBefore+8,y,font,temperatureStr,colorSettingText));
        
        pixelsBefore=pixelsBefore+(temperatureStr.length*font.width)+8
        let humidityStr=this.mqttData["humidity"]+"%"
        pixellist.add(new DrawAsciiArtColor(x+pixelsBefore,0, humidityIcon))
        pixellist.add(new DrawText(x+pixelsBefore+8,y,font,humidityStr,colorSettingText)); 
        
        pixelsBefore=pixelsBefore+(humidityStr.length*font.width)+8
        let pressureStr=this.mqttData["pressure"]+"hPa"
        pixellist.add(new DrawAsciiArtColor(x+pixelsBefore,0, pressureIcon))
        pixellist.add(new DrawText(x+pixelsBefore+8,y,font, pressureStr,colorSettingText)); 
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup,x=0,y=0){
        this.statusArr.push("Starting")
        this.mqttData['temperature']='?'
        this.mqttData['humidity']='?'
        this.mqttData['pressure']='?'

        let font=fontSelect(controls,"Font",fonts.C64.name,0)
        font.load()
        scheduler.onCleanup(() => {
            if (mqttClient !== undefined)
                mqttClient.end(true);
        });
        const mqttHost = controls.input('MQTT host', "192.168.1.10", true);
        const mqttTopicTemperature = controls.input('MQTT temperature topic', "/HACKERSPACE/NODE1/BME280/Temperature", true);
        const mqttTopicHumidity = controls.input('MQTT humidity topic', "/HACKERSPACE/NODE1/BME280/Humidity", true);
        const mqttTopicPressure = controls.input('MQTT pressure topic', "/HACKERSPACE/NODE1/BME280/Pressure", true);
        const colorSettingText=controls.color("Text color", 128, 128, 200)
        const intervalControl = controls.value("headlines scroller interval", 1, 1, 10, 0.1)
        let childControls = controls.group('Sensors');
        this.processStatus(`Conn ${mqttHost.text}...`);
        console.log(`MQTT: Connecting ${mqttHost.text}`);
        let mqttClient = mqtt.connect("mqtt://" + mqttHost.text, {});
        //recursively send all control values to mqtt
       
        mqttClient.on('reconnect', () => {
            this.processStatus(`Reconn ${mqttHost.text}...`);
            console.log(`MQTT: Reconnecting ${mqttHost.text}`);
        });
        mqttClient.on('connect', () => {
            console.log("MQTT: Connected");
            this.cleanStatusMesage();
            this.processStatus("OK");
            mqttClient.subscribe(mqttTopicTemperature.text + '/#');
            mqttClient.subscribe(mqttTopicHumidity.text + '/#');
            mqttClient.subscribe(mqttTopicPressure.text + '/#');
        });
        mqttClient.on('error', (e) => {
            console.error("MQTT error: ", e.message);
            this.processStatus(e.message);
        });
        mqttClient.on('message', async (topic, messageBuf) => {
            let message = messageBuf.toString();
            // console.log(`MQTT ${topic}: ${message}`)
            this.processMessage(topic,message);
        });

        let display=new PixelList();
        box.add(display)

        scheduler.intervalControlled(intervalControl, (frameNr) => {
         display.clear()
        this.showAsSingleLineScroller(box,display,frameNr,font,colorSettingText,y)
                   
        })
    }
}