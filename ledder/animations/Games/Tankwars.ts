//Een quick and dirty  elkaar gehakte versie van tankwars. Als je denkt dat het beter kan doe dat dan ;-) 

import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import ControlInput from "../../ControlInput.js"
import mqtt, { MqttClient } from "mqtt"
import { statusMessage } from "../../message.js"
import Animator from "../../Animator.js"
import Color from "../../Color.js"
import Pixel from "../../Pixel.js"
import DrawLine from "../../draw/DrawLine.js"
import DrawText from "../../draw/DrawText.js"
import { fontSelect } from "../../fonts.js"
import Font from "../../Font.js"
import { random } from "../../utils.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"

const tankLogoImage = `
.............ooooooo...............
.oooooooooooooo0ooooo..............
............oooooooo...............
.........ooooooooooooooooooooooo...
........ooooooooooooooooooooooo....
.........o..oo..oo..oo..oo..oo.....
..........ooooooooooooooooooo......
`;

function degrees_to_radians(degrees: number) {
    degrees = degrees + 90
    var pi = Math.PI;
    return degrees * (pi / 180);
}


export class Explosion {
    x: number
    y: number
    ttl: number
    timer: number
    radius:number

    constructor(x: number, y: number,radius:number) {
        this.x = x
        this.y = y
        this.ttl = 10
        this.timer = 0
        this.radius=radius
    }

    render() {
        this.timer++
        let pl = new PixelList()
        if (this.ttl > 0) {
            for (let i = 0; i < Math.PI * 4; i = i + 0.5) {
                let x = (Math.sin(i) * this.radius) + this.x
                let y = (Math.cos(i) * this.radius) + this.y
                let intensity=Math.round((Math.sin(degrees_to_radians(this.timer))*32)+32)
                let a = Math.random()
                pl.add(new Pixel(x, y, new Color(0, 0, intensity, a)))
            }
            this.ttl--
        }
        return pl
    }


}

export class Tanklandschap {
    heightArr = []
    height: number
    width: number

    constructor(width: number, height: number) {
        this.heightArr = []
        this.height = height
        this.width = width
        let rnd = Math.random() * 60
        for (let i = 0; i < width; i++) {
            let bigHump = Math.sin((i + rnd) / 3) * (height / 10)
            let smallHump = Math.cos((i + 0.5 + rnd) / 4) * (height / 10)
            this.heightArr.push((height * 0.50) + bigHump + smallHump)
        }
    }

    getHeight(x: number) {
        let num = Math.round(x)
        let height = 0;
        if (this.heightArr[x]) {
            height = this.heightArr[x]
        }
        return height
    }

    render() {
        let pl = new PixelList();
        for (let i = 0; i < this.heightArr.length; i++) {
            pl.add(new DrawLine(i, this.heightArr[i], i, this.height, new Color(0, 64, 0, 1), new Color(0, 48, 0, 1)))
        }
        return pl
    }

}


export class Tankprojectile {
    tankId: number
    x: number
    y: number
    width: number
    xOrg: number
    yOrg: number
    ttl: number = 100
    rotation: number
    energy: number
    xspeed: number
    yspeed: number
    time: number
    timer: number
    active: boolean
    color: Color

    constructor(tankId: number, x: number, y: number, width: number, rotation: number, energy: number, color: Color) {
        //energy is distance
        this.tankId = tankId
        this.x = x
        this.y = y
        this.width = width
        this.xOrg = this.x
        this.yOrg = this.y
        this.rotation = rotation
        this.energy = Math.max(1, energy)
        this.active = true
        this.color = color
        this.time = 0
        this.timer = 0
        let rotationrad = degrees_to_radians(this.rotation)
        this.wrapX()
        let targetX = (this.x + (Math.sin(rotationrad) * this.energy))
        let targetY = (this.y + (Math.cos(rotationrad) * this.energy))
        this.xspeed = (targetX - this.x) / this.energy
        this.yspeed = (targetY - this.y) / this.energy
      
        //console.log(this)
    }

    update() {
        this.timer++
        if (this.timer>500) { this.y+=0.03}
        let divisionfactor = 6
        if (this.active) {
            this.wrapX()
            //poormans parabole
            //this should be replaced by a real parabole y=ax²+bx+c
            if (this.energy > 0) {

                this.time = this.time + (1 / divisionfactor)
                this.x = this.xOrg + (this.xspeed * this.time)
                this.y = this.yOrg + (this.yspeed * this.time)
                this.wrapX()
                this.energy = this.energy - (1 / divisionfactor)
                //console.log(this.x,this.y)
            }
            else {
                if (this.y < 30) {
                    this.time = this.time + (1 / divisionfactor)
                    this.y = (this.y - (this.yspeed / divisionfactor))
                    this.x = (this.x + (this.xspeed / divisionfactor))
                    this.wrapX()
                }
                else {
                    this.active = false
                }
            }
        }
    }

    wrapX()
    {   
        if (this.x < 0) { this.x = this.width+this.x }
        if (this.x > this.width) { this.x = this.x - this.width }
    }


    render(box: PixelBox) {
        let pl = new PixelList()
        if (this.active) {
           this.wrapX()
            pl.add(new Pixel(this.x, this.y, this.color))
            this.update()
            pl.add(new Pixel(this.x, this.y, this.color))
        }

        return pl
    }
}




export class Tank {
    id: number
    name: String
    x: number
    y: number
    width: number
    rotation: number
    color: Color
    power: number
    ammopower: number
    projectile: Tankprojectile
    health: number
    timer: number
    isDead: boolean

    constructor(id: number, name: String, x: number, y: number, width: number, rotation: number, color: Color, power: number, health: number) {
        this.id = id
        this.name = name
        this.x = x
        this.y = y
        this.width=width
        this.rotation = rotation
        this.color = color
        this.power = power
        this.ammopower = 15
        this.health = health
        this.timer = 1000
        this.isDead = false
    }

    setRotation(rotation) {
        this.rotation = rotation
    }

    shoot(rotation: number, power: number) {
        if (this.isDead == false) {
            this.rotation = rotation
            this.ammopower = power
            this.projectile = new Tankprojectile(this.id, this.x, this.y, this.width, this.rotation, this.ammopower, this.color)
        }
    }

    getShot(power) {
        this.health = Math.max(0, this.health - power)
    }

    renderAim(x: number, y: number, rotation: number, length: number, color: Color) {
        let rotationrad = degrees_to_radians(rotation)
        let targetX = Math.round(x + Math.sin(rotationrad) * length)
        let targetY = Math.round(y + Math.cos(rotationrad) * length)
        let pl = new PixelList()
        pl.add(new Pixel(targetX, targetY, color))
        return pl
    }



    render(box: PixelBox) {
        let tankpl = new PixelList()
        //if (this.health < 0) { this.isDead = true }
        if (this.x < 0) { this.x = this.x + this.width }
        if (this.x > this.width - 1) { this.x = this.x - this.width }
        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
        if (!this.isDead) {
            tankpl.add(new Pixel(Math.round(this.x) - 1, Math.round(this.y), this.color))
            tankpl.add(new Pixel(Math.round(this.x) + 1, Math.round(this.y), this.color))
            tankpl.add(new Pixel(Math.round(this.x), Math.round(this.y - 1), this.color))
            tankpl.add(new Pixel(this.x, this.y, new Color(this.color.r, this.color.g, this.color.b, this.health / 100)))
            tankpl.add(this.renderAim(this.x, this.y, this.rotation, 1, this.color))
        }
        else {
            tankpl.add(new Pixel(this.x, 0, new Color(this.color.r, this.color.g, this.color.b, 0.5)))
        }
        return tankpl
    }

}

export class Tankwarsgame {
    width: number
    height: number
    landschap: Tanklandschap
    players
    timer: number
    explosions
    font: Font
    statuslog
    introtimer: number
    outrotimer: 0
    servername: String
    topic: String
    status: number = 0   //0=intro  1=game  2=outro

    constructor(box, players, font, serverName, topic) {
        this.timer = 0
        this.statuslog = []
        this.width = box.width()
        this.height = box.height()
        this.landschap = new Tanklandschap(box.width(), box.height())
        this.players = []
        this.explosions = []
        this.font = font
        this.servername = serverName
        this.topic = topic
        this.status = 0
        this.introtimer = 0
        this.outrotimer = 0
        let px = box.width() / players.length
        let colors = [
            new Color(128, 0, 0, 1),
            new Color(0, 0, 128, 1),
            new Color(128, 128, 0, 1),
            new Color(0, 128, 128, 1),
            new Color(128, 128, 128, 1),
            new Color(0, 0, 255, 1),
            new Color(128, 0, 0, 1),
            new Color(0, 0, 128, 1),
            new Color(128, 128, 0, 1),
            new Color(0, 128, 128, 1),
            new Color(128, 128, 128, 1),
            new Color(0, 0, 255, 1),
            new Color(128, 0, 0, 1),
            new Color(0, 0, 128, 1),
            new Color(128, 128, 0, 1),
            new Color(0, 128, 128, 1),
            new Color(128, 128, 128, 1),
            new Color(0, 0, 255, 1)
        ] //this colorshizzle  should go to a different file because is will be handy for other usecase to have some visual unique colors...or as a color palette
        //anyways...it should go away from here
        for (let p = 0; p < players.length; p++) {
            let x = Math.round(px * p + 2)
            this.players.push(new Tank(p, players[p], x, this.landschap.getHeight(x), this.width, 0, colors[p], 100, 100))
        }
    }

    intro(box, servername, topic) {
        this.introtimer++
        let pl = new PixelList();
        let titletime = 500
        let totalintrotime = 10000
        if (this.introtimer > totalintrotime) { this.introtimer = 0 }
        if (this.introtimer % totalintrotime < titletime) {
            //INTRO PART 1 - SHOW TITLE
            pl.centerH(box)
            pl.centerV(box)
            pl.add(new DrawAsciiArtColor(box.width()-(this.introtimer/2)+32, 0, tankLogoImage));
            pl.add(new DrawText(0, 0, this.font, "TANKWARS", new Color(255, 0, 0, 1)))
            pl.centerH(box)
            pl.centerV(box)
        }
        else {
            if (this.introtimer < 3500) {
                //INTRO PART 2 -  SHOW HELP
                pl.centerV(box)
                let string = "usage: mosquitto_pub -h " + servername + " -t '" + topic + "/USERID/shoot' -m 'ANGLE'      /**  USERID=[0.." + Number(this.players.length - 1) + "].  ANGLE=[0..180].  Shoot to start the game. **/"
                pl.add(new DrawText((this.width) - (((this.introtimer - (titletime)) / 3) % (this.font.width * string.length)), 0, this.font, string, new Color(0, 0, 255, 1)))
                pl.add(new DrawAsciiArtColor(((this.width) - (((this.introtimer - (titletime)) / 3)))-32, 0, tankLogoImage));
                pl.centerV(box)
            }
            else {

                //INTRO PART 3 -  SHOW GAME DEMO
                this.timer++
                this.updateCollissions()
                pl.add(this.landschap.render())
                for (let p = 0; p < this.players.length; p++) {
                    pl.add(this.players[p].render(box))
                    if (this.players[p].projectile && this.players[p].projectile.active) { pl.add(this.players[p].projectile.render(box)) }

                }
                for (let e = 0; e < this.explosions.length; e++) {
                    let expl = this.explosions[e]
                    pl.add(this.explosions[e].render())
                    if (this.explosions[e].ttl < 0) {
                        this.explosions.splice(e, 1)
                    }
                }
                if (this.timer % 100 == 0) { this.shoot(random(0, this.players.length - 1), random(0, 180), random(5, 15)) }
            }
        }
        return pl
    }

    rendermessage(box) {
        this.outrotimer++
        if (this.outrotimer > 20) { this.outrotimer = 0; this.statuslog.splice(0, 1) }
        let pl = new PixelList();
        if (this.statuslog.length > 0) {
            pl.add(new DrawText(1, 2, this.font, this.statuslog[0], new Color(0, 255, 0, 1)))
        }
        return pl
    }

    doesHitPlayer(x, y) //unused?
    {
        let isHit: boolean = false
        for (let p = 0; p < this.players.length; p++) {
            if (!this.players[p].isDead) {
                let dx = Math.abs(x - this.players[p].x)
                let dy = Math.abs(y - this.players[p].y)
                if (dx + dy < 2) {
                    isHit = true
                    this.players[p].y++
                    this.players[p].health--
                }
            }
        }
        return isHit
    }

    updateCollissions() {
        for (let p = 0; p < this.players.length; p++) {
            if (this.players[p].isDead == false) {
                //MOVE PLAYERS TO GROUND/BOTTOM AND FLATTEN GROUND BELOW TANKS
                let playerY = Math.round(this.players[p].y)
                let groundY = Math.round(this.landschap.getHeight(this.players[p].x))

                //flatten landscape if tank moves on it
                //this.landschap.heightArr[Math.round(this.players[p].x - 2)] = Math.max(localheight, this.landschap.heightArr[Math.round(this.players[p].x - 2)])
                //this.landschap.heightArr[Math.round(this.players[p].x - 1)] = Math.max(localheight, this.landschap.heightArr[Math.round(this.players[p].x - 1)])
                //this.landschap.heightArr[Math.round(this.players[p].x)] = Math.max(localheight, this.landschap.heightArr[Math.round(this.players[p].x)])
                //this.landschap.heightArr[Math.round(this.players[p].x + 1)] = Math.max(localheight, this.landschap.heightArr[Math.round(this.players[p].x + 1)])
                //this.landschap.heightArr[Math.round(this.players[p].x + 2)] = Math.max(localheight, this.landschap.heightArr[Math.round(this.players[p].x + 2)])

                if (playerY < groundY - 1) {
                    this.explosions.push(new Explosion(this.players[p].x, this.players[p].y,2))
                    this.players[p].health = this.players[p].health - 10
                    this.players[p].y = groundY
                }
                if (this.players[p].projectile && this.players[p].projectile.active && this.players[p].projectile.timer > 5) {
                    let bomx = Math.round(this.players[p].projectile.x) % this.width
                    let bomy = Math.round(this.players[p].projectile.y)

                    if (this.landschap.heightArr[bomx] < bomy - 1) {
                        // projectile impact
                        this.landschap.heightArr[bomx]++
                        if (this.landschap.heightArr[bomx - 1]) {
                            this.landschap.heightArr[bomx - 1]++
                        }
                        if (this.landschap.heightArr[bomx + 1]) {
                            this.landschap.heightArr[bomx + 1]++
                        }
                        //disarm
                        this.explosions.push(new Explosion(bomx, bomy - 1,1))
                        this.players[p].projectile.active = false
                    }
                }
                if (this.players[p].y > this.height && this.players[p].power > 0) {
                    this.statuslog.push(this.players[p].name + " lost")
                    this.players[p].isDead = true
                }
            }

        }

    }

    shoot(playerIndex: number, rotation = 90, power = 15) {
        if (this.players[playerIndex]) {
            this.players[playerIndex].shoot(rotation, power);
        }
    }

    render(box: PixelBox, progress) {
        let tankspl = new PixelList()
        if (this.status == 0) {
            tankspl.add(this.intro(box, this.servername, this.topic))
        }
        if (this.status == 1) {
            this.timer++
            this.updateCollissions()
            let activeplayers = 0
            tankspl.add(this.landschap.render())
            for (let p = 0; p < this.players.length; p++) {
                tankspl.add(this.players[p].render(box))
                if (this.players[p].projectile && this.players[p].projectile.active) { tankspl.add(this.players[p].projectile.render(box)) }
                //tankspl.add(new Pixel(box.width() * progress, box.height() - 1, new Color(0, 16, 0, 0.5)))
                if (!this.players[p].isDead) { activeplayers++ }
            }
            for (let e = 0; e < this.explosions.length; e++) {
                let expl = this.explosions[e]
                tankspl.add(this.explosions[e].render())
                if (this.explosions[e].ttl < 0) {
                    this.explosions.splice(e, 1)
                }
            }
            if (activeplayers < 2) { this.status = 2 }
        }
        if (this.status == 2) {
            this.status = 3
        }
        //tankspl.add(this.rendermessage(box))
        return tankspl
    }

}



export default class Tankwars extends Animator {
    static category = "Games"
    static title = "Tankwars"
    static description = "multiplayer mqtt controlled game"
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
        this.statusMessage(`?`)
        console.log(`MQTT: Connecting ${this.mqttHost.text}`)
        this.mqttClient = mqtt.connect("mqtt://" + this.mqttHost.text, {})

        this.mqttClient.on('reconnect', () => {
            this.statusMessage(`!`)
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
        //do config shizzles
        this.mqttHost = controls.input('MQTT host', "mqtt.hackerspace-drenthe.nl", true)
        this.mqttTopic = controls.input('MQTT topic', "tankwars", true)
        const gameControls = controls.group("Game")
        const gameIntervalControl = gameControls.value("Clock interval", 1, 1, 10, 0.1, true)
        //const gameShootIntervalControl = gameControls.value("Shoot interval", 300, 300, 500, 1, true)
        const gameFont = fontSelect(gameControls, 'Font')
        const gamePlayerCount = gameControls.value("Number of players", 3, 2, 16, 1, true)
        let gameplayerControl = []
        let players = []
        for (let p = 0; p < gamePlayerCount.value; p++) {
            players.push("P" + (p + 1))
        }
        this.box = box
        this.mqttConnect()
        scheduler.onCleanup(() => {
            if (this.mqttClient !== undefined)
                this.mqttClient.end(true)

        })

        let gamePixellist = new PixelList()
        box.add(gamePixellist)
        let game = new Tankwarsgame(box, players, gameFont, this.mqttHost.text, this.mqttTopic.text)

        this.mqttClient.on('message', (topic, messageBuf) => {
            let message = messageBuf.toString()

            let subTopic = topic.substring(this.mqttTopic.text.length + 1)
            let parts = subTopic.split('/')
            let userindex = Math.round(Number(parts[0]))
            let userCommand = parts[1]

            if (game.status<1) {  game = new Tankwarsgame(box, players, gameFont, this.mqttHost, this.mqttTopic) }
            if (game.players[userindex]) {
                if (game.status < 1) { game.status = 1 }
                if (userCommand == "shoot") {
                    let rotation = Number(message)
                    game.players[userindex].rotation = rotation
                    game.shoot(userindex, rotation)
                }

                if (userCommand == "move") {
                    //moving cost damage
                    let move = Math.sign(Number(message))
                    let x = Math.round(game.players[userindex].x + move) % (game.landschap.heightArr.length - 1)
                    let y = game.landschap.heightArr[x]
                    game.players[userindex].x = x % box.width()
                    game.players[userindex].y = y
                }
            }

        })


        scheduler.intervalControlled(gameIntervalControl, (frameNr) => {
            gamePixellist.clear()
            let progress = (frameNr / 10) % box.width()
            gamePixellist.add(game.render(box, progress))
            if (game.status > 2) {
                //start new game if outro page has timeout
                game = new Tankwarsgame(box, players, gameFont, this.mqttHost, this.mqttTopic)
            }
        })

    }
}
