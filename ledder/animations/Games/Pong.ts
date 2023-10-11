import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"
import DrawText from "../../draw/DrawText.js"
import {fonts} from "../../fonts.js"
import mqtt, {MqttClient} from "mqtt"
import {statusMessage} from "../../message.js"
import ControlInput from "../../ControlInput.js"
import {mapRange} from "../../utils.js"


export default class Pong extends Animator {
    static category = "Gamesdemos"
    static title = "Pong"
    static description = "inspired by the Atari game"
    private lastStatusMessage: any
    private box: PixelBox
    private mqttHost: ControlInput
    private mqttTopic: ControlInput
    private mqttClient: MqttClient

    cleanStatusMesage() {
        if (this.lastStatusMessage)
            this.box.delete(this.lastStatusMessage)
    }

    statusMessage(text: string) {
        this.cleanStatusMesage()
        if (text)
            this.lastStatusMessage = statusMessage(this.box, text)
    }

    mqttConnect() {
        this.statusMessage(`Conn ${this.mqttHost.text}...`)
        console.log(`MQTT: Connecting ${this.mqttHost.text}`)
        this.mqttClient = mqtt.connect("mqtt://" + this.mqttHost.text, {})

        this.mqttClient.on('reconnect', () => {
            this.statusMessage(`Reconn ${this.mqttHost.text}...`)
            console.log(`MQTT: Reconnecting ${this.mqttHost.text}`)

        })

        this.mqttClient.on('connect', () => {
            console.log("MQTT: Connected")
            // this.statusMessage(`${this.mqttHost.text} connected.`)
            this.cleanStatusMesage()
            this.mqttClient.subscribe(this.mqttTopic.text + '/#')
            console.log(this.mqttTopic.text + '/#')
        })

        this.mqttClient.on('error', (e) => {
            console.error("MQTT error: ", e.message)
            this.statusMessage(e.message)
        })

    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        this.box = box

        this.mqttHost = controls.input('MQTT host', "mqtt.hackerspace-drenthe.nl:11883", true)
        this.mqttTopic = controls.input('MQTT topic', "joysticks/1", true)
        this.mqttConnect()
        scheduler.onCleanup(() => {
            if (this.mqttClient !== undefined)
               this.mqttClient.end(true)

        })


        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        let ponglist = new PixelList()
        box.add(ponglist)

        let dxdefault = 1.0
        let dydefault = 0.3141592
        let dx = dxdefault
        let dy = dydefault
        // let ballX = 5.0
        // let ballY = box.height() / 2
        let player1X = 0 + 4
        let player2X = box.width() - 5
        let player1Y = box.height() / 2
        let player2Y = box.height() / 2
        let player1Score = 0
        let player2Score = 0

        let font = fonts.Picopixel
        font.load()

        const scores = new PixelList()
        box.add(scores)

        function updateScores() {
            scores.clear()
            scores.add(new DrawText(player1X - 4, 1, font, player1Score.toString(), new Color(99, 0, 0, 1)))
            scores.add(new DrawText(player2X + 2, 1, font, player2Score.toString(), new Color(0, 0, 99, 1)))
        }

        updateScores()


        const ball = new Pixel(box.width() / 2, box.height() / 2, new Color(255, 255, 255, 1))
        box.add(ball)


        this.mqttClient.on('message', (topic, messageBuf) => {
            let message = messageBuf.toString()

            let subTopic = topic.substring(this.mqttTopic.text.length + 1)
            let parts = subTopic.split('/')
            let control = parts[0]

            if (control == 'a') {
                let paddlePos = Number(message)
                player1Y=~~mapRange(paddlePos, 0, 100, 1, box.height() - 1)
                // console.log(paddlePos, player1Y)

            }

            if (control == 'b') {
                let paddlePos = Number(message)
                player2Y=~~mapRange(paddlePos, 0, 100, 1, box.height() - 1)
                // console.log(paddlePos, player1Y)

            }

        })


        scheduler.intervalControlled(intervalControl, (frameNr) => {
            ponglist.clear()

            //ball

            //score and game logic
            if (Math.round(ball.x) > player2X) {
                dx = -1 * dxdefault
                player1Score++
                updateScores()
            }
            if (Math.round(ball.x) < player1X) {
                dx = dxdefault
                player2Score++
                updateScores()
            }
            if (Math.round(ball.y) >= box.height() - 1) {
                dy = -1 * dydefault
            }
            if (Math.round(ball.y) <= 1) {
                dy = dydefault
            }

            if (Math.round(ball.x) > player2X - 2 && Math.abs(player2Y - ball.y) < 3) {
                dx = -1 * dxdefault
            }
            if (Math.round(ball.x) < player1X + 2 && Math.abs(player1Y - ball.y) < 3) {
                dx = 1 * dxdefault
            }

            for (let i = 0; i < 3; i++) {
                ponglist.add(new Pixel(player1X, Math.round(player1Y - 1 + i), new Color(255, 0, 0, 1)))
                ponglist.add(new Pixel(player2X, Math.round(player2Y - 1 + i), new Color(0, 0, 255, 1)))
            }


            //move players
            ball.x = ball.x + dx
            ball.y = ball.y + dy + Math.cos(frameNr / 100) / 4

            // if (ball.x > box.width() * 0.80 && dx > 0) {
            //     if (ball.y > player2Y) {
            //         player2Y++
            //     }
            //     if (ball.y < player2Y) {
            //         player2Y--
            //     }
            // }

            // if (ball.x < box.width() * 0.20 && dx < 0) {
            //     if (ball.y > player1Y) {
            //         player1Y++
            //     }
            //     if (ball.y < player1Y) {
            //         player1Y--
            //     }
            // }

            if (player1Score > 9 || player2Score > 9) {
                player1Score = 0
                player2Score = 0
                updateScores()
            }

        })

    }


}
