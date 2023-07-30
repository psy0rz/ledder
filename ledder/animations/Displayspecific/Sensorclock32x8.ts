import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import Color from "../../Color.js"
import FxColorPattern from "../../fx/FxColorPattern.js"
import Pixel from "../../Pixel.js"
import mqtt, {MqttClient} from "mqtt"
import DrawText from "../../draw/DrawText.js"
import {fonts, fontSelect} from "../../fonts.js"


//This is a clock and sensordispay for 32x8 displays
//Fonts and icons are custom made to fit the display
//This is a work in progress, but it is 100% working
//By Rein Velt


export default class Sensorclock32x8 extends Animator {
    static category = "Displaysize"
    static title = "Sensorclock32x8"
    static description = "Clock and sensor display optimized for 32x8 display"

    reinMiniFontAsciiArtImage = [
        {
            character: 'A', width: 4, data: `
                xxx.
                x.x.
                xxx.
                x.x.
                x.x.
            `},
        {
            character: 'B', width: 4, data: `
                    xx..
                    x.x.
                    xxx.
                    x.x.
                    xxx.
                `},

        {
            character: 'C', width: 4, data: `
                        xxx.
                        x...
                        x...
                        x...
                        xxx.
                    `},

        {
            character: 'D', width: 4, data: `
                            xx..
                            x.x.
                            x.x.
                            x.x.
                            xxx.
                        `},

        {
            character: 'E', width: 4, data: `
                                xxx.
                                x...
                                xxx.
                                x...
                                xxx.
                            `},

        {
            character: 'F', width: 4, data: `
                                    xxx.
                                    x...
                                    xxx.
                                    x...
                                    x...
                                `},

        {
            character: 'G', width: 4, data: `
                                        xxx.
                                        x...
                                        x.x.
                                        x.x.
                                        xxx.
                                    `},

        {
            character: 'H', width: 4, data: `
                                            x.x.
                                            x.x.
                                            xxx.
                                            x.x.
                                            x.x.
                                        `},

        {
            character: 'I', width: 4, data: `
                                                xxx.
                                                .x..
                                                .x..
                                                .x..
                                                xxx.
                                            `},

        {
            character: 'J', width: 4, data: `
                                                    xxx.
                                                    ..x.
                                                    ..x.
                                                    ..x.
                                                    xxx.
                                                `},

        {
            character: 'K', width: 4, data: `
                                                        x.x.
                                                        x.x.
                                                        xx..
                                                        x.x.
                                                        x.x.
                                                    `},

        {
            character: 'L', width: 4, data: `
                                                            x...
                                                            x...
                                                            x...
                                                            x...
                                                            xxx.
                                                        `},

        {
            character: 'M', width: 6, data: `
                        xxxxx.
                        x.x.x.
                        x.x.x.
                        x.x.x.
                        x.x.x.
                    `},

        {
            character: 'N', width: 4, data: `
                        xxx.
                        x.x.
                        x.x.
                        x.x.
                        x.x.
                    `},

        {
            character: 'O', width: 4, data: `
                        xxx.
                        x.x.
                        x.x.
                        x.x.
                        xxx.
                    `},

        {
            character: 'P', width: 4, data: `
                        xxx.
                        x.x.
                        xxx.
                        x...
                        x...
                    `},

        {
            character: 'Q', width: 5, data: `
                xxx.
                x.x.
                x.x.
                x.x.
                xxxx
            `},

        {
            character: 'R', width: 4, data: `
                xxx.
                x.x.
                xx..
                x.x.
                x.x.
            `},

        {
            character: 'S', width: 4, data: `
                    xxx.
                    x...
                    xxx.
                    ..x.
                    xxx.
                `},

        {
            character: 'T', width: 4, data: `
                    xxx.
                    .x..
                    .x..
                    .x..
                    .x..
                `},

        {
        character: 'U', width: 4, data: `
                    x.x.
                    x.x.
                    x.x.
                    x.x.
                    xxx.
                `},

        {
            character: 'V', width: 4, data: `
                        x.x.
                        x.x.
                        x x.
                        x.x.
                        .x..
                    `},

        {
            character: 'W', width: 6, data: `
                    x.x.x.
                    x.x.x.
                    x.x.x.
                    x.x.x.
                    xxxxx.
                `},

        {
            character: 'X', width: 4, data: `
                    x.x.
                    x.x.
                    .x..
                    x.x.
                    x.x.
                `},

        {
            character: 'Y', width: 4, data: `
                    x.x.
                    x.x.
                    xxx.
                    .x..
                    .x..
                `},

        {
            character: 'Z', width: 4, data: `
                    xxx.
                    ..x.
                    .x..
                    x...
                    xxx.
                `},

        {
            character: '%', width: 6, data: `
                    x...x.
                    ...x..
                    ..x...
                    .x....
                    x...x.
                `},

        {
            character: '0', width: 4, data: `
                xxx.
                x.x.
                x.x.
                x.x.
                xxx.
            `},
        {
            character: '1', width: 4, data: `
                .x..
                xx..
                .x..
                .x..
                xxx.
            `},
        {
            character: '2', width: 4, data: `
                xxx.
                ..x.
                xxx.
                x...
                xxx.
            `},
        {
            character: '3', width: 4, data: `
                xxx.
                ..x.
                xxx.
                ..x.
                xxx.
            `},
        {
            character: '4', width: 4, data: `
                x.x.
                x.x.
                xxx.
                ..x.
                ..x.
            `},
        {
            character: '5', width: 4, data: `
                xxx.
                x...
                xxx.
                ..x.
                xxx.
            `},
        {
            character: '6', width: 4, data: `
                xxx.
                x...
                xxx.
                x.x.
                xxx.
            `},
        {
            character: '7', width: 4, data: `
                xxx.
                ..x.
                ..x.
                ..x.
                ..x.
            `},
        {
            character: '8', width: 4, data: `
                xxx.
                x.x.
                xxx.
                x.x.
                xxx.
            `}
        ,
        {
            character: '9', width: 4, data: `
                xxx.
                x.x.
                xxx.
                ..x.
                xxx.
            `},
        {
            character: '.', width: 2, data: `
                ..
                ..
                ..
                ..
                x.
                `},
        {
            character: ':', width: 2, data: `
                ..
                x.
                ..
                x.
                ..
                `},
        {
            character: '.', width: 2, data: `
                ..
                ..
                ..
                ..
                x.
                `},
        {
            character: ' ', width: 3, data: `
                ...
                ...
                ...
                ...
                ...
                `}
,
                {
                    character: '?', width: 4, data: `
                        xx..
                        ..x.
                        .x..
                        ....
                        .x..
                        `}
                        ,
                {
                    character: ';', width: 2, data: `
                        ..
                        x.
                        ..
                        x.
                        x.
                        `}

                        ,
                {
                    character: ':', width: 2, data: `
                        ..
                        x.
                        ..
                        x.
                        ..
                        `}
                    ,
                    {
                        character: '.', width: 2, data: `
                            ..
                            ..
                            ..
                            ..
                            x.
                            `}
                        ,
                        {
                            character: ',', width: 2, data: `
                                ..
                                ..
                                ..
                                x.
                                x.
                                `}
                                ,
                        {
                            character: '(', width: 3, data: `
                                x..
                                .x.
                                .x.
                                .x.
                                x..
                                `},

                                {
                                    character: ')', width: 3, data: `
                                        .x.
                                        x..
                                        x..
                                        x..
                                        .x.
                                        `}
    ]

    reinIconUnitAsciiArtLibrary=[
        {
            name:"time" , 
            iconAsciiArtColor:`
            ......
            ......
            ......
            ......
            ......
            ......
            ......
            ......
        `},
        {
            name:"temperature" , 
            iconAsciiArtColor:`
                .505..
                .505..
                .5r5..
                .5r5..
                .5r5..
                5rrr5.
                5rrr5.
                055500
        `,
        suffixAsciiArt:`
              x.xxx.
              ..x...
              ..x...
              ..x...
              ..xxx.
            `,
            suffixWidth:6
        }, 
        
        {
            name:"humidity" , 
            iconAsciiArtColor:`
                ..b...
                ..b...
                .bbb..
                .bbb..
                b5bbb.
                5bbbb.
                b5bbb.
                0bbb00
        `,
        suffixAsciiArt:`
              x...x.
              ...x..
              ..x...
              .x....
              x...x.
            `,
            suffixWidth:6
        },
        {
            name:"pressure" , 
            iconAsciiArtColor:`
                bbbbb.
                bbbbb.
                ......
                .bbb..
                .bbb..
                bbbbb.
                .bbb..
                00b000
            `,
            suffixAsciiArt:`
                ....xxx..
                x...x.x..
                x...xxx..
                xxx.x....
                x.x.x....
                `,
            suffixWidth:12
        }]

       

        //FUNCTION DEFINITIONS
    
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
    
        
        showAsSingleLineScroller(box:PixelBox,colorSettingText,colorSettingUnit,x=0,y=0)
        {
           
            let displayTime=300
            let slotCount=4
            let pixellist=new PixelList();
            let pixelsBefore=0
            let textLength=0;
           
            
            if (this.slotTimer>=displayTime)
            {
                this.slotTimer=0
                if (this.slotActive<slotCount-1)
                {
                    this.slotActive++
                }
                else
                {
                    this.slotActive=0;
                }
            }
            else
            {
                this.slotTimer++
            }

           
            let slotpercent=(this.slotTimer/displayTime)
            //console.log(this.slotActive,slotpercent)
            let iconPixelLength=8
            pixellist.add(this.drawPagination(box,4,this.slotActive,slotpercent))
            switch (this.slotActive){
                case 0:
                    let iconTimeSource = this.reinIconUnitAsciiArtLibrary.find(element => element.name === "time");
                    pixellist.add(new DrawAsciiArtColor(x,0, iconTimeSource.iconAsciiArtColor))
                    pixellist.add(this.drawTime(new Date(),x+iconPixelLength-6,y,1));
                    break;
                case 1:
                    let temperatureStr=this.mqttData["temperature"]
                    let iconTemperatureSource = this.reinIconUnitAsciiArtLibrary.find(element => element.name === "temperature");
                    pixellist.add(new DrawAsciiArtColor(x+pixelsBefore,0, iconTemperatureSource.iconAsciiArtColor))
                    pixellist.add(this.drawString(x+iconPixelLength,y,temperatureStr,colorSettingText));
                    textLength=this.getPixelLength(temperatureStr);
                    pixellist.add(new DrawAsciiArt(x+textLength+iconPixelLength+1,y, colorSettingUnit, iconTemperatureSource.suffixAsciiArt))
                    break;
                case 2:
                    let humidityStr=this.mqttData["humidity"]
                    let iconHumiditySource = this.reinIconUnitAsciiArtLibrary.find(element => element.name === "humidity");
                    pixellist.add(new DrawAsciiArtColor(x+pixelsBefore,0, iconHumiditySource.iconAsciiArtColor))
                    pixellist.add(this.drawString(x+iconPixelLength,y,humidityStr,colorSettingText)); 
                    textLength=this.getPixelLength(humidityStr);
                    pixellist.add(new DrawAsciiArt(x+textLength+iconPixelLength+1,y,colorSettingUnit, iconHumiditySource.suffixAsciiArt))
                    break;
                case 3:
                    let pressureStr=parseInt(this.mqttData["pressure"]).toString()
                    let iconPressureSource = this.reinIconUnitAsciiArtLibrary.find(element => element.name === "pressure");
                    pixellist.add(new DrawAsciiArtColor(x,0, iconPressureSource.iconAsciiArtColor))
                    pixellist.add(this.drawString(x+iconPixelLength,y, pressureStr,colorSettingText));
                    textLength=this.getPixelLength(pressureStr);
                    pixellist.add(new DrawAsciiArt(x+textLength+iconPixelLength+1,y,colorSettingUnit, iconPressureSource.suffixAsciiArt))
                    break;
                default:
                    pixellist.add(this.drawTime(new Date(),x+5,y,1));
                    break;

            } 
           
            return pixellist
        }

    drawPagination(box,total,num,slotfactor)
    {
        let pl=new PixelList();
        let xOffset=0
        let pagerWidth=32-xOffset
        let pageDotWidth=(pagerWidth)/total
        for (let i=0;i<total;i++)
        {
            for (let j=0;j<pageDotWidth;j++)
            {
               if (i==num)
                {
                    pl.add(new Pixel(xOffset+(i*pageDotWidth)+j,7,new Color(255,255,255,0.5)))
                }
                else
                {
                    pl.add(new Pixel(xOffset+(i*pageDotWidth)+j,7,new Color(255,255,255,0.3)))
                }
               
            }
            
        }
        pl.add(new Pixel(xOffset+(num*pageDotWidth)+(pageDotWidth*slotfactor),7,new Color(255,255,255,0.7)))
        return pl

    }

    drawString(x: number, y: number, numberString: String, color: Color) {
        let charPixelWidth = 4
        let pl = new PixelList();
        let oldX = x
        for (let i = 0; i < numberString.length; i++) {
            let digitChar = numberString.substring(i, i + 1).toUpperCase()
            let digitImageSource = this.reinMiniFontAsciiArtImage.find(element => element.character === digitChar);
            if (digitImageSource!==undefined)
            {
                let charPixelWidth = digitImageSource.width
                const imageData = digitImageSource.data
                let pixeldigit = new DrawAsciiArt(oldX, y, color, imageData, false)
                oldX = oldX + (charPixelWidth)
                pl.add(pixeldigit)
            }
        }
        return pl
    }

    getPixelLength(myString:String)
    {
        let charDefaultPixelWidth = 4
        let pixelwidth:number = 0
        for (let i = 0; i < myString.length; i++) {
            let digitChar =myString.substring(i, i + 1)
            let digitImageSource = this.reinMiniFontAsciiArtImage.find(element => element.character === digitChar);
           
            let charPixelWidth   = digitImageSource.width
            pixelwidth = pixelwidth + (charPixelWidth) 
        }
        return pixelwidth
    }

    drawTime(time:Date, x: number = 0, y: number = 0,alpha:number) {
        let pl = new PixelList()
        let hoursString          = this.prependZero(time.getHours())
        let minutesString        = this.prependZero(time.getMinutes())
        let secondsString        = this.prependZero(time.getSeconds())
        let hoursPixelLength     = this.getPixelLength(hoursString)
        let minutesPixelLength   = this.getPixelLength(minutesString)
        let delimeterPixelLength = this.getPixelLength(":")
        let hoursAlpha=1
        let minutesAlpha=1
        let secondsAlpha=1
        let delimeterAlpha=1
        if (time.getSeconds()>58) { minutesAlpha=alpha }
        if (time.getMinutes()>58) { hoursAlpha=alpha }
        secondsAlpha=alpha 
        pl.add(this.drawString(x, y, hoursString, new Color(255, 0, 0, hoursAlpha)))
        pl.add(this.drawString(x+hoursPixelLength, y, ":", new Color(255, 255, 0, delimeterAlpha)))
        pl.add(this.drawString(x+hoursPixelLength+delimeterPixelLength, y, minutesString, new Color(0,255, 0, minutesAlpha)))
        pl.add(this.drawString(x+hoursPixelLength+delimeterPixelLength+minutesPixelLength, y, ":", new Color(255, 255, 0, delimeterAlpha)))
        pl.add(this.drawString(x+hoursPixelLength+delimeterPixelLength+minutesPixelLength+delimeterPixelLength, y, secondsString, new Color(0, 0, 255, secondsAlpha)))
        return pl
    }

    drawAni(box:PixelBox)
    {
        let w=box.width()
        let hw=w/2
        let h=box.height()
        let hh=h/2
        let d=new Date()
        let pl=new PixelList()
        let x=0
        let y=0

        x=Math.cos((d.getSeconds()/10)+90)*hw+hw
        y=Math.sin((d.getSeconds()/10)+90)*hh+hh  
        pl.add(new Pixel(x,y,new Color(100,100,255,1)))

       
      
        return pl


    }

   


    prependZero(myNumber: number) {
        let numberString = ""
        if (myNumber < 10) { numberString = "0" + myNumber.toString() } else { numberString = myNumber.toString() }
        return numberString
    }


    //END FUNCTION DEFINITIONS

    slotActive=0
    slotTimer=0
    mqttData=new Array()
    statusArr=[]

  

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        const mainControls = controls.group("Main controls");
        const intervalControl = mainControls.value("Animation interval", 1, 1, 10, 0.1)
        const mqttControls=mainControls.group("MQTT (remote sensors)")

        this.statusArr.push("Starting")
        this.mqttData['temperature']='00.00'
        this.mqttData['humidity']='00.00'
        this.mqttData['pressure']='00.00'

       
        scheduler.onCleanup(() => {

            if (mqttClient !== undefined)
                mqttClient.end(true);
        });
        const mqttHost              = mqttControls.input('MQTT host', "mqtt.hackerspace-drenthe.nl", true);
        const mqttTopicTemperature  = mqttControls.input('MQTT temperature topic', "/HACKERSPACE/NODE1/BME280/Temperature", true);
        const mqttTopicHumidity     = mqttControls.input('MQTT humidity topic', "/HACKERSPACE/NODE1/BME280/Humidity", true);
        const mqttTopicPressure     = mqttControls.input('MQTT pressure topic', "/HACKERSPACE/NODE1/BME280/Pressure", true);
        const colorSettingValue     = mainControls.color("Sensor value color", 255, 255, 255)
        const colorSettingUnit      = mainControls.color("Sensor unit color", 255,255, 0)
       
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
            console.log(`MQTT ${topic}: ${message}`)
            this.processMessage(topic,message);
        });

        

        

        scheduler.intervalControlled(intervalControl, (frameNr) => {
            box.clear()


            box.add(this.showAsSingleLineScroller(box,colorSettingValue,colorSettingUnit,0,1))
                          
             

            

        });


    }
}
