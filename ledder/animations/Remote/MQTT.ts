import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import mqtt from "mqtt"
import {statusMessage} from "../../message.js"
import DrawText, {type HorizontalAlign, type VerticalAlign} from "../../draw/DrawText.js"
import {fonts} from "../../fonts.js"
import Color from "../../Color.js"
import PixelList from "../../PixelList.js"
import AnimationManager from "../../server/AnimationManager.js"

/*
Remote control of the running animation via MQTT.

Connects to "MQTT url" and listens for commands under "MQTT topic" (default: ledder).
The selected animation runs inside this one, and its controls show up in the "Current animation" group.
Commands are handled one at a time, in the order they arrive.

Commands:

  ledder/select              Select and start an animation, and load one of its presets.
                             Payload: "<animation path>/<preset name>", e.g. "Text/default"

  ledder/stop                Stop the current animation and clear its controls.
                             Payload: ignored

  ledder/get                 Publish the current value of every control of the current animation,
                             one message per control, under ledder/state/<control path>.
                             Payload: ignored
                             Publishes e.g.: ledder/state/Text = {"text":"hello"}

  ledder/set/<control path>  Change one control of the current animation. The control path is the name of
                             the control, preceded by the names of the groups it is in, separated by "/".
                             Payload: the control's value as JSON, in the same format "get" publishes it:
                               value/range:  {"value": 3}
                               input:        {"text": "hello"}
                               switch/group: {"enabled": true}
                             E.g.: ledder/set/Text = {"text":"hello"}

  ledder/text/<text id>      Show a simple drawText on top of the current animation, or replace the text with this id.
                             There can be many texts at once, each with its own id. They stay when another
                             animation is selected or stopped.
                             Payload: the DrawText parameters as JSON. Only "text" is required:
                               text:      the text to show, "\n" starts a new line
                               x, y:      anchor position (default 0, 0)
                               font:      one of the font names in fonts.ts (default "C64")
                               color:     "#rrggbb" or "r,g,b" (default "#ffffff")
                               scale:     font scale (default 1)
                               wrapWidth: wrap lines wider than this (default: never wrap)
                               hAlign:    "left", "centered" or "right" (default "left")
                               vAlign:    "top", "middle" or "bottom" (default "top")
                             An empty payload removes the text with this id.
                             E.g.: ledder/text/clock = {"text":"12:00","x":10,"y":4,"color":"#ff0000"}

Status and errors (connecting, disconnected, an invalid name or JSON) are shown in red in the top left
corner of the display, until the next command arrives.

Example with mosquitto:
  mosquitto_pub -t ledder/select -m 'Text/default'
  mosquitto_pub -t ledder/set/Text -m '{"text":"hello"}'
  mosquitto_sub -t 'ledder/state/#' & mosquitto_pub -t ledder/get -m ''
  mosquitto_pub -t ledder/text/clock -m '{"text":"12:00","x":10,"y":4,"hAlign":"centered"}'
  mosquitto_pub -t ledder/text/clock -m ''
*/


export default class MQTT extends Animator {
    static description = "Controls which animation is running via MQTT: select or stop an animation, and get or set its controls. See the <a href='https://github.com/psy0rz/ledder/wiki/MQTT'>MQTT wiki page</a> for the topics and messages."

    private box: PixelBox
    private statusMessageText: DrawText
    private animationManager: AnimationManager


    clearStatusMessage() {
        if (this.statusMessageText)
            this.box.delete(this.statusMessageText)
    }

    statusMessage(text: string) {
        this.clearStatusMessage()
        if (text)
            this.statusMessageText = statusMessage(this.box, text)
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        this.box = box

        const mqttUrl = controls.input('MQTT url', "mqtt://localhost", true)
        const baseTopic = controls.input('MQTT topic', "ledder", true)

        const selectedAnimationControls = controls.group('Current animation')

        //in a box of its own, so the texts below stay on top of it: the manager re-adds its child box at the end on every restart
        const animationBox = new PixelBox(box)
        box.add(animationBox)
        this.animationManager = new AnimationManager(animationBox, scheduler, selectedAnimationControls)

        this.statusMessage(`conn ${mqttUrl.text}`)
        console.log(`MQTT: Connecting ${mqttUrl.text}`)
        const mqttClient = mqtt.connect(mqttUrl.text, {})

        let isCleanedUp = false
        scheduler.onCleanup(() => {
            isCleanedUp = true
            mqttClient.end(true)
            //also closes its autoreload file watcher, which would otherwise keep reloading the animation
            this.animationManager.stop(true)
        })

        mqttClient.on('connect', () => {
            console.log(`MQTT: ${mqttUrl.text} connected`)
            this.statusMessage("connection ok")
            //only the commands: the state topics are published by ourself
            mqttClient.subscribe([
                baseTopic.text + "/select",
                baseTopic.text + "/stop",
                baseTopic.text + "/get",
                baseTopic.text + "/set/#",
                baseTopic.text + "/text/#",
            ])
        })

        mqttClient.on('close', () => {
            if (isCleanedUp)
                return
            console.error(`MQTT: ${mqttUrl.text} disconnected`)

            this.animationManager.stop(false)
            this.statusMessage("disconnected")

        })

        mqttClient.on('reconnect', () => {
            console.log(`MQTT: Reconnecting ${mqttUrl.text}`)
            this.statusMessage(`connected`)
        })

        mqttClient.on('error', (e) => {
            console.error(`error: ${e}`)
            this.statusMessage("error")
        })


        //the texts of the "text" command, on top of the animation
        const textsContainer = new PixelList()
        box.add(textsContainer)
        const textsById = new Map<string, DrawText>()

        const removeText = (textId: string) => {
            const existingText = textsById.get(textId)
            if (existingText !== undefined) {
                textsContainer.delete(existingText)
                textsById.delete(textId)
            }
        }

        const showText = (textId: string, payload: string) => {
            if (textId === "")
                throw new Error("Text id missing")

            if (payload.trim() === "") {
                removeText(textId)
                return
            }

            const textParameters = JSON.parse(payload)

            if (typeof textParameters.text !== "string")
                throw new Error("Text missing")

            const fontName = textParameters.font ?? "C64"
            const font = fonts[fontName]
            if (font === undefined)
                throw new Error(`Unknown font: ${fontName}`)
            font.load()

            const textColor = new Color()
            if (textParameters.color !== undefined && !textColor.setRgbText(String(textParameters.color)))
                throw new Error(`Invalid color: ${textParameters.color}`)

            const hAlign: HorizontalAlign = textParameters.hAlign ?? "left"
            if (!["left", "centered", "right"].includes(hAlign))
                throw new Error(`Invalid hAlign: ${hAlign}`)

            const vAlign: VerticalAlign = textParameters.vAlign ?? "top"
            if (!["top", "middle", "bottom"].includes(vAlign))
                throw new Error(`Invalid vAlign: ${vAlign}`)

            const drawText = new DrawText(
                Number(textParameters.x ?? 0),
                Number(textParameters.y ?? 0),
                font,
                textParameters.text,
                textColor,
                Number(textParameters.scale ?? 1),
                textParameters.wrapWidth === undefined ? undefined : Number(textParameters.wrapWidth),
                hAlign,
                vAlign)

            //only replaced once the new one was created without errors
            removeText(textId)
            textsById.set(textId, drawText)
            textsContainer.add(drawText)
        }


        //recursively publish all control values to mqtt
        function publishControlValues(topic: string, controlGroup: ControlGroup) {

            for (const [name, control] of Object.entries(controlGroup.meta.controls)) {
                if (control instanceof ControlGroup) {
                    publishControlValues(topic + "/" + name, control)
                } else {
                    mqttClient.publish(topic + "/" + name, JSON.stringify(control.save()))
                }
            }

        }

        const handleCommand = async (command: string, commandParameters: string[], payload: string) => {
            switch (command) {
                case 'select':
                    console.log(`MQTT select ${payload}`)
                    //AnimationManager.select() only logs an invalid name, so check it here to show it on the display
                    if (!/^.+\/[^/]+$/.test(payload))
                        throw new Error(`Invalid name: ${payload}`)

                    await this.animationManager.select(payload, false).catch((e) => {
                        this.animationManager.stop(false)
                        throw e
                    })
                    break
                case 'stop':
                    console.log("MQTT stop")
                    this.animationManager.stop(false)
                    break
                case 'get':
                    console.log("MQTT get")
                    publishControlValues(baseTopic.text + "/state", selectedAnimationControls)
                    break
                case 'set':
                    console.log("MQTT set: ", commandParameters, payload)
                    selectedAnimationControls.updateValue(commandParameters, JSON.parse(payload))
                    break
                case 'text': {
                    //the id may contain slashes itself
                    const textId = commandParameters.join("/")
                    console.log(`MQTT text ${textId}: ${payload}`)
                    showText(textId, payload)
                    break
                }
            }
        }

        //handle commands one by one: mqtt doesnt wait for an async handler, and a select that starts
        //while the previous one is still loading would mix up the animation and preset of both.
        let commandQueue = Promise.resolve()

        mqttClient.on('message', (topic, payloadBuffer) => {
            const payload = payloadBuffer.toString()
            console.log(`MQTT ${topic}: ${payload}`)

            const commandTopic = topic.substring(baseTopic.text.length + 1)
            const commandTopicParts = commandTopic.split('/')
            const command = commandTopicParts[0]
            const commandParameters = commandTopicParts.slice(1)

            commandQueue = commandQueue.then(async () => {
                if (isCleanedUp)
                    return

                this.statusMessage("")
                try {
                    await handleCommand(command, commandParameters, payload)
                } catch (e) {
                    console.error(`MQTT ${command}: ${e.message}`)
                    this.statusMessage(e.message)
                }
            })
        })


    }
}
