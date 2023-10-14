import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Color from "../../Color.js"
import Pixel from "../../Pixel.js"
import DrawLine from "../../draw/DrawLine.js"
import DrawText from "../../draw/DrawText.js"
import { fontSelect } from "../../fonts.js"

export class Tanklandschap
{
    heightArr=[]
    height:number
    width:number

    constructor(width:number,height:number)
    {
        this.heightArr=[]
        this.height=height
        this.width=width
        let rnd=Math.random()*60
        for (let i=0; i<width;i++)
        {   
            let bigHump=Math.sin((i+rnd)/3)*(height/10)
            let smallHump=Math.cos((i+0.5+rnd)/4)*(height/10)
            this.heightArr.push((height*0.50)+bigHump+smallHump)
        }
    }

    render()
    {
        let pl=new PixelList();
        for (let i=0;i<this.heightArr.length;i++)
        {
            pl.add(new DrawLine(i,this.heightArr[i],i,this.height,new Color(0,64,0,1),new Color(0,48,0,1)))
        }
        return pl
    }

}
export class Tankprojectile
{
    x:number
    y:number
    width:number
    xOrg:number
    yOrg:number
    ttl:number=100
    rotation:number
    energy:number
    xspeed:number
    yspeed:number
    time:number
    timer:number
    active:boolean
    color:Color

        constructor(x:number,y:number,width:number,rotation:number,energy:number,color:Color)
        {
            //energy is distance
            this.x=x
            this.y=y
            this.width=width
            this.xOrg=this.x
            this.yOrg=this.y
            this.rotation=rotation
            this.energy=Math.max(1,energy)
            this.active=true
            this.color=color
            this.time=0
            this.timer=0
           

            let targetX=(this.x+(Math.sin(this.rotation)*this.energy))
            let targetY=(this.y+(Math.cos(this.rotation)*this.energy))
            this.xspeed=(targetX-this.x)/this.energy
            this.yspeed=(targetY-this.y)/this.energy   
            //console.log(this)
        }

        update()
        {
            this.timer++
            let divisionfactor=10
            if (this.active)
            {
                    //this should be replaced by a parabole y=ax²+bx+c
                    if (this.energy>0)
                    {
                        
                        this.time=this.time+(1/divisionfactor)
                        this.x=this.xOrg+(this.xspeed*this.time)
                        this.y=this.yOrg+(this.yspeed*this.time)
                        this.energy=this.energy-(1/divisionfactor)
                        //console.log(this.x,this.y)
                    }
                    else
                    {
                        if (this.y<30)
                        {
                            this.time=this.time+(1/divisionfactor)
                            //this.yspeed=this.yspeed+0.5
                            this.y=(this.y-(this.yspeed/divisionfactor))
                            this.x=(this.x+(this.xspeed/divisionfactor))
                        }
                        else
                        {
                            this.active=false
                        }
                        //wrap x
                        if (this.x<0) { this.x=this.x+this.width}
                        if (this.x>this.width) { this.x=this.x-this.width}
                    }

                   
                   
                
            }
        }



        render(box:PixelBox)
        {
            let pl=new PixelList()
            if (this.active)
            {
               
                pl.add(new Pixel(this.x,this.y,this.color))
                this. update()
            }
            return pl
        }
}




export class Tank
{
    name:String
    x:number
    y:number 
    width:number
    rotation:number
    color:Color
    power:number
    ammopower:number
    projectile:Tankprojectile
    health:number
    timer:number

    constructor(name:String, x:number, y:number,width:number,rotation:number, color:Color, power:number,health:number)
    {
        this.name=name
        this.x=x
        this.y=y
        this.rotation=rotation
        this.color=color
        this.power=power
        this.ammopower=10
        this.health=health
        this.timer=1000
    }

    setRotation(rotation)
    {
        this.rotation=rotation
    }

    shoot(rotation:number,power:number)
    {
        this.rotation=rotation
        this.ammopower=power
       this.projectile=new Tankprojectile(this.x,this.y,this.width,this.rotation,this.ammopower,this.color)
    }

    getShot(power)
    {
        this.health=Math.max(0,this.health-power)
    }

    renderAim(x:number,y:number,rotation:number,length:number,color:Color)
    {
        let targetX=Math.round(x+Math.sin(rotation)*length)
        let targetY=y+Math.cos(rotation)*length
        let pl=new PixelList()
        pl.add(new Pixel(targetX,targetY,color))
        return pl
    }

    

    render(box:PixelBox)
    {
        let tankpl=new PixelList()
        
        tankpl.add(new Pixel(Math.round(this.x)-1,Math.round(this.y),this.color))
        tankpl.add(new Pixel(Math.round(this.x)+1,Math.round(this.y),this.color))
        tankpl.add(new Pixel(Math.round(this.x),Math.round(this.y-1),this.color))
           
        let centerX=Math.round(this.x)
        let centerY=Math.round(this.y)
        if (this.projectile && this.projectile.active)
        { 
               tankpl.add(new Pixel(centerX,centerY,new Color(255,255,255,this.health/100))) 
            }
            else
            {
                tankpl.add(new Pixel(centerX,centerY,new Color(this.color.r,this.color.g,this.color.b,this.health/100))) 
        }
        //tankpl.add(this.renderAim(centerX,centerY,this.rotation,5,this.color))
        tankpl.add(this.renderAim(centerX,centerY,this.rotation,1,new Color(100,100,100,1)))
        return tankpl
    }

}

export class Tankwarsgame
{
    width:number
    height:number
    landschap:Tanklandschap
    players 
    timer:number
    statuslog

    constructor(box,players)
    {
        this.timer=0
        this.statuslog=[]
        this.width=box.width()
        this.height=box.height()
        this.landschap=new Tanklandschap(box.width(),box.height())
        this.players=[]
        let px=box.width()/players.length
        for (let p=0;p<players.length;p++)
        {
            let x=Math.round(px*p+2)
            let colors=[
                new Color(128,0,0,1),
                new Color(0,0,128,1),
                new Color(128,128,0,1),
                new Color(0,255,255,1),
                new Color(255,128,128,1),
                new Color(128,128,255,1)
            ]
            this.players.push(new Tank(players[p],x,this.width,this.landschap.heightArr[x]-1,-180,colors[p],100,100))
        }
    }
    

    updateCollissions()
    {

        for (let p=0;p<this.players.length;p++)
        {
            let oldY=Math.round(this.players[p].y)%this.width
            let localheight=this.landschap.heightArr[Math.round(this.players[p].x)]
            this.players[p].y=localheight
            this.landschap.heightArr[Math.round(this.players[p].x-2)]=localheight
            this.landschap.heightArr[Math.round(this.players[p].x-1)]=localheight
            this.landschap.heightArr[Math.round(this.players[p].x)]=localheight
            this.landschap.heightArr[Math.round(this.players[p].x+1)]=localheight
            this.landschap.heightArr[Math.round(this.players[p].x+2)]=localheight
            if (oldY!=Math.round(this.players[p].y))
            {
                this.statuslog.push("player "+this.players[p].name+" hit")
            }

           

            if (this.players[p].projectile && this.players[p].projectile.active && this.players[p].projectile.timer>20 )
            {
                let bomx=Math.round(this.players[p].projectile.x)%this.width
                let bomy=Math.round(this.players[p].projectile.y)
            
                    if (this.landschap.heightArr[bomx]<bomy-1)
                    {
                        this.landschap.heightArr[bomx]++
                        this.players[p].projectile.active=false
                    }
                
            }

            if (this.players[p].y>this.height)
            {
                this.statuslog.push("player "+this.players[p].name+" lost")
            }

        }

    }

    shoot(playerIndex:number,rotation=180,power=15)
    {
        if (this.players[playerIndex])
        {
            this.players[playerIndex].shoot(rotation,power);
        }
    }

    render(box:PixelBox,progress)
    {
        this.timer++
        this.updateCollissions()
        let tankspl=new PixelList()
        tankspl.wrapX(box)
        tankspl.add(this.landschap.render())
        for (let p=0;p<this.players.length;p++)
        {
           
            tankspl.add(this.players[p].render(box))
            if (this.players[p].projectile && this.players[p].projectile.active) { tankspl.add(this.players[p].projectile.render(box)) } 
            tankspl.add(new Pixel(box.width()*progress,box.height()-1,new Color(0,0,255,1)))
        }
        tankspl.wrapX(box)
        return tankspl
    }

}



export default class Tankwars extends Animator {
    static category = "Games"
    static title = "Tankwars"
    static description = "multiplayer mqtt controlled game"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        //do config shizzles
        const gameControls=controls.group("Game")
        const gameIntervalControl = gameControls.value("Clock interval", 1, 1, 10, 0.1,true)
        const gameShootIntervalControl = gameControls.value("Shoot interval", 300, 300, 500, 1,true)
        const gameFont = fontSelect(gameControls, 'Font')
        
        let gamePixellist=new PixelList()
        box.add(gamePixellist)
        

        let players=["truus","piet","arie","jaap","gerrit"]
      
       
        let game=new Tankwarsgame(box,players)
        let nextPlayerShoot:number=0
        console.log(game)

        scheduler.intervalControlled(gameIntervalControl, (frameNr) => {
            gamePixellist.clear()
            let progress=(1/gameShootIntervalControl.value)*(frameNr%gameShootIntervalControl.value)
            gamePixellist.add(game.render(box,progress))

            if (game.players.length<2)
            {
                //start new game if 1 player left
                game=new Tankwarsgame(box,players) 
            }
            else
            {
                //shoot a bullet every 500 timeintervals
                if (frameNr%gameShootIntervalControl.value==0)
                {
                    //shoot
                    if (game.players[nextPlayerShoot])
                    {
                        game.shoot(nextPlayerShoot,game.players[nextPlayerShoot].rotation,game.players[nextPlayerShoot].ammopower)
                    }
                    nextPlayerShoot++ //select next player to shoot
                    if (nextPlayerShoot==game.players.length)
                    {
                        nextPlayerShoot=0
                    }
                }
               
               
            }
            let lastStatusLine=game.statuslog[game.statuslog.length-1]
            gamePixellist.add(new DrawText(0,0,gameFont,lastStatusLine,new Color(128,128,128,0.5)))
          
        })

    }
}
