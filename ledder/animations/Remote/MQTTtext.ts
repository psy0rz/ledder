import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import mqtt from "mqtt"
import DrawText, {type HorizontalAlign, type VerticalAlign} from "../../draw/DrawText.js"
import {fontSelect} from "../../fonts.js"

export default class MQTTtext extends Animator {
    static description = "Shows the text received on an MQTT topic, with its color and blinking set by two other topics"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const mqttUrl = controls.input('MQTT url', "mqtt://localhost", true)
        const textTopic = controls.input('MQTT text topic', "ledder/text", true)
        const colorTopic = controls.input('MQTT color topic', "ledder/color", true)
        const blinkTopic = controls.input('MQTT blink topic', "ledder/blink", true)


        //the color until the color topic sets one
        const defaultColorControl = controls.color("Default text color", 0x21, 0xff, 0, 1, true)
        const font = fontSelect(controls, 'Font')
        const positionControl = controls.position("Text anchor position", box, true, "center", 0, "middle", 0)
        positionControl.runAnchorMarker(scheduler, box)

        const hAlign = controls.select("Horizontal text align", "centered", [
            {id: "left", name: "Left"},
            {id: "centered", name: "Centered"},
            {id: "right", name: "Right"},
        ], true).selected as HorizontalAlign

        const vAlign = controls.select("Vertical text align", "middle", [
            {id: "top", name: "Top"},
            {id: "middle", name: "Middle"},
            {id: "bottom", name: "Bottom"},
        ], true).selected as VerticalAlign

        const textColor = defaultColorControl.copy()

        const textBox = new PixelBox(box)
        box.add(textBox)

        const showText = (text: string) => {
            textBox.clear()
            textBox.add(new DrawText(positionControl.x, positionControl.y, font, text, textColor, 1,
                undefined, hAlign, vAlign))
        }

        showText("?")

        //blinking: the text is shown for blinkOnFrames, then hidden for blinkOffFrames.
        //Without an off time it's shown all the time.
        let blinkOnFrames = 0
        let blinkOffFrames = 0
        let blinkFrameNr = 0
        scheduler.interval(1, () => {
            if (blinkOffFrames === 0) {
                box.add(textBox)
                return
            }

            blinkFrameNr = (blinkFrameNr + 1) % (blinkOnFrames + blinkOffFrames)
            if (blinkFrameNr < blinkOnFrames)
                box.add(textBox)
            else
                box.delete(textBox)
        })

        const setBlink = (blinkMessage: string) => {
            const [onSeconds, offSeconds = onSeconds] = blinkMessage.trim().split(/[\s,\/]+/).map(Number)
            if (!(onSeconds > 0 && offSeconds > 0)) {
                blinkOnFrames = 0
                blinkOffFrames = 0
                return
            }
            //at least one frame each, or a very short time would never show (or never hide) the text
            blinkOnFrames = Math.max(1, scheduler.timeToFrames(onSeconds))
            blinkOffFrames = Math.max(1, scheduler.timeToFrames(offSeconds))
            blinkFrameNr = 0
        }

        const setColor = (colorMessage: string) => {
            if (!textColor.setRgbText(colorMessage))
                console.error(`MQTT text: invalid color '${colorMessage}', use #rrggbb or r,g,b`)
        }

        console.log(`MQTT text: Connecting ${mqttUrl.text}`)
        const mqttClient = mqtt.connect(mqttUrl.text)

        scheduler.onCleanup(() => {
            mqttClient.end(true)
        })

        mqttClient.on('connect', () => {
            console.log(`MQTT text: ${mqttUrl.text} connected`)
            mqttClient.subscribe([textTopic.text, colorTopic.text, blinkTopic.text])
        })

        mqttClient.on('error', (error) => {
            console.error(`MQTT text: ${mqttUrl.text} error ${error}`)
        })

        const previousMessageByTopic = new Map<string, string>()
        mqttClient.on('message', (topic, messageBuffer) => {
            const message = messageBuffer.toString()
            if (previousMessageByTopic.get(topic) === message)
                return
            previousMessageByTopic.set(topic, message)

            console.log(`MQTT text ${topic}: ${message}`)
            if (topic === textTopic.text)
                showText(message)
            if (topic === colorTopic.text)
                setColor(message)
            if (topic === blinkTopic.text)
                setBlink(message)
        })
    }
}
