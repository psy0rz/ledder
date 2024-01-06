import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Font from "../../Font.js"
import { fonts } from "../../fonts.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import DrawText from "../../draw/DrawText.js"
import DrawLine from "../../draw/DrawLine.js"
import Color from "../../Color.js"
import DrawBox from "../../draw/DrawBox.js"
import { height, width } from "dom7"


export class SpriteCollection {
    sprites = []
    ground
    box

    constructor(box) {
        this.sprites = []
        this.sprites.push()
        this.box=box
        this.ground=new ParalaxBackground(box.width(),box.height(),640,64)
      
    }

    add(sprite: Sprite) {
        this.sprites.push(sprite)
    }

    update() {
        for (let s = 0; s < this.sprites.length; s++) {
            this.sprites[s].update()
            if (this.sprites[s].follow > -1) {
                let targetIndex = this.sprites[s].follow
                let x = this.sprites[s].x
                let y = this.sprites[s].y
                let targetX = this.sprites[targetIndex].x
                let targetY = this.sprites[targetIndex].y
                if (targetX > x) { this.sprites[s].xSpeed += 0.1 } else { this.sprites[s].xSpeed -= 0.1 }
                if (targetY > y) { this.sprites[s].ySpeed += 0.1 } else { this.sprites[s].ySpeed -= 0.1 }

            }
        }
    }

    render() {
        let pl = new PixelList()
        for (let x=0;x<this.box.width();x++)
        {
            pl.add(new DrawLine(x,0,x,this.box.height(),new Color(0,0,200,1), new Color(0,0,64,1)))
        }
        pl.add(this.ground.render())
        for (let s = 0; s < this.sprites.length; s++) {
            pl.add(this.sprites[s].render())
        }
        return pl
    }
}

export class ParalaxBackground
{
    height
    width
    virtualHeight
    virtualWidth
    heights=[]
    bgsprites=[]
    ttl=30
    follow=-1
    random

    constructor(width:number,height:number,virtualWidth:number,virtualHeight:number)
    {
        this.heights=[]
        this.bgsprites=[]
        this.height=height
        this.width=width
        this.virtualWidth=virtualWidth
        this.virtualHeight=virtualHeight
        this.ttl=15
        this.random=Math.round(Math.random()*100)
        this.createNew()
        
    }

    createNew()
    {
        for (let x=0;x<this.virtualWidth;x++)
        {
            let y=3+(Math.sin((x+this.random)/10)*this.virtualHeight/16)+Math.cos((x+this.random)/10)*(this.virtualHeight/32)
            this.heights.push(y)

          

           let r=Math.round(Math.random()*11)
           switch(r)
           {
             case 1:  this.bgsprites.push(new SpriteTree(x,y-8,2)); break
             default: this.bgsprites.push(new SpriteGrass(x,y-3,2));  break;
           }
        }
    }

    groundToHeight(x)
    {
        let yOffset=this.heights[9]
        let h=this.heights[x]
        let y=(this.height/2)+8+(h-yOffset)
        return y

    }

    render()
    {
        let pl=new PixelList()
        let yOffset=this.heights[9]
        for (let x=0;x<this.width;x++)
        {
            let h=this.heights[x]
            //clouds
           
           
            
    
            //ground
            let col1=new Color(0,100,0,1)
            let col2=new Color(0,64, 0,1)
            pl.add(new DrawLine(x,(this.height/2)+8+(h-yOffset),x,this.height, col1,col2))

            //bgsprites
            //let sprite=this.bgsprites[x]
            let y=this.groundToHeight(x)
            let pls=this.bgsprites[x].frames[0].copy()
            pls.move(x,y-12)
            pl.add(pls)
            
           
        }
        this.ttl--
        if (this.ttl<1) { 
            let firsth=this.heights.shift()
            let firstb=this.bgsprites.shift()
            this.heights.push(firsth)
            this.bgsprites.push(firstb)
            this.ttl=10
        }
        return pl
    }
    
}

export class Sprite {

    x: number
    y: number
    z: number
    xSpeed: number = 0
    ySpeed: number = 0
    frames = []
    frameSpeed = 0.1
    scale = 1
    currentFrameIndex: number = 0
    follow = -1
    sayArray = []
    sayTTL = 0
    gravity=true

    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
        this.xSpeed = 0
        this.ySpeed = 0
        this.frames = []
        this.frameSpeed = 0.1
        this.currentFrameIndex = 0
        this.scale = 1 / Math.max(1, this.z / 3)
        this.follow = -1
        this.sayArray = []
        this.sayTTL = 100
    }

    setGravity(gravity:boolean)
    {
        this.gravity=gravity
    }

    update() {
        if (this.currentFrameIndex < this.frames.length - this.frameSpeed) {
            this.currentFrameIndex += this.frameSpeed
        }
        else {
            this.currentFrameIndex = 0
        }

        if (this.follow < 0) {
            this.x = this.x + this.xSpeed
            this.y = this.y + this.ySpeed
        }

    }

    say(text) {
        this.sayArray.push(text)
        this.sayTTL=255
    }

    renderTextBalloon() {

        let pl = new PixelList()
        if (this.sayArray.length > 0) {
            let yOffset=0
            if (this.sayTTL<100)
            {
                yOffset=100-this.sayTTL
            }
            let saytext=this.sayArray[0]
            let textfont = fonts.Picopixel
            textfont.load()
            let w=textfont.width*saytext.length
            let h=textfont.height
            pl.add(new DrawLine(this.x+4,this.y-yOffset ,this.x+4,this.y/2+h-yOffset-3,new Color(0,0,0,Math.min(1,this.sayTTL/100)),new Color(0,0,255,1)))
            pl.add(new DrawText(this.x , this.y /3-yOffset, textfont, saytext, new Color(0, 0, 0, Math.min(1,this.sayTTL/100))))
            this.sayTTL--
            if (this.sayTTL<1)
            {
                this.sayArray.shift()
            }
        }
        return pl

    }

    scalePixelList(pl, scale) {

        let respl = new PixelList()
        let xOffset = 0
        let yOffset = 0
        pl.forEachPixel((pixel: Pixel) => {

            let px = (pixel.x - this.x) * scale
            let py = (pixel.y - this.y) * scale
            xOffset = Math.min(xOffset, px)
            yOffset = Math.min(yOffset, py)
            let c = pixel.color.copy()
            c.a = Math.max(1, c.a / (this.z))
            for (let s = 0; s < this.scale; s++) {
                respl.add(new Pixel(px - xOffset, py - yOffset + s, c))
                respl.add(new Pixel(px - xOffset + s, py - yOffset, c))

            }
            //this.lines.push(new CoordinateLine(this.points.length - 2, this.points.length - 1))

        })
        return respl
    }

    setFrameSpeed(framespeed: number) {
        this.frameSpeed = framespeed
    }

    setMovementSpeed(xSpeed: number, ySpeed: number) {
        this.xSpeed = xSpeed
        this.ySpeed = ySpeed
    }

    setXY(x, y) {
        this.x = x
        this.y = y
    }

    render() {

        let pl = new PixelList()
        let currentIndex = Math.round(this.currentFrameIndex)
        if (this.frames[currentIndex]) {
            pl.add(this.frames[currentIndex].copy())
        }
        else {
            pl.add(this.frames[0].copy())
        }
        if (this.scale != 1) {
            pl = this.scalePixelList(pl, this.scale)
        }
        pl.move(this.x, this.y)
        if (this.sayArray.length > 0) {
            pl.add(this.renderTextBalloon())
        }
        return pl
    }


    renderbg() {

        let pl = new PixelList()
        if (this.frames[0]) {
          pl.add(this.frames[0].copy())
        }
        if (this.scale != 1) {
            pl = this.scalePixelList(pl, this.scale)
        }
        pl.move(this.x, this.y)
        if (this.sayArray.length > 0) {
            pl.add(this.renderTextBalloon())
        }
        return pl
    }

    addFrameAsciiArtColor(asciiArtData) {
        let pl = new PixelList()
        pl.add(asciiArtData)
        this.frames.push(pl)
    }


}

export class SpritePacman extends Sprite {
    constructor(x, y, z) {
        super(x, y, z)
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
            .yyy.
            yyyyy
            yyyyy
            yyyyy
            .yyy.
            `))
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
            .yyy.
            yyyyy
            yy...
            yyyyy
            .yyy.
            `))
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
            .yyy.
            yyy..
            yy...
            yyy..
            .yyy.
            `))
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
            .yyy.
            yyyyy
            yy...
            yyyyy
            .yyy.
            `))
    }

}

export class SpriteGrass extends Sprite {
    constructor(x, y, z) {
        super(x, y, z)
        let pl=new PixelList()
        pl.add(new Pixel(0,0,new Color(0,0,0,0)))
        this.frames.push(pl)
    }

}


export class SpriteTree extends Sprite {
    constructor(x, y, z) {
        super(x, y, z)
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `

            ..ggggggggggggg..
            .ggtgtgtgtgtgtgg.
            gggtgggtgggtgggg
            ggggtggtggtggggg
            ggggggtgtgtgggg.
            .ggt.gtttgg.ggg.
            ..ggttttt..tgg..
            .....tttt.tt....
            ......ttttt.....
            ......tttt......
            ......ttt.......
            ......ttt.......
            ......ttt.......
            ......ttt.......
            .....gttgttg....
            `))
           
    }

}

export class SpriteSun extends Sprite {
    constructor(x, y, z) {
        super(x, y, z)
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
            .yy.
            yyyy
            yyyy
            .yy.
            `))
    }

}

export class SpriteDog extends Sprite {
    constructor(x, y, z) {
        super(x, y, z)
    
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
            .w...www
            .wwwww..
            .wwww...
            ..w.w...
            `))
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
            .w...www
            .wwwww..
            .wwww...
            .w...w...
            `))
    }

}



export class SpriteHuman extends Sprite {
    constructor(x, y, z) {
        super(x, y, z)
        //this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
        ..oooo..
        ..o5b55.
        ..5555..
        ..rrrrr.
        ..rrrr..
        ..bbbb..
        ...bb...
        ...ooo..
        `))
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
        ..oooo..
        ..o5b55.
        ..5555..
        ..rrrrrr
        ..rrrr..
        ..bbbb..
        ..b.b...
        ..oo.oo.
        `))
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
        ..oooo..
        ..o5b55.
        ..5555..
        ..rrrrrr
        ..rrrr..
        ..bbbb..
        ..b..b..
        ..oo.oo.
        `))
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
        ..oooo..
        ..o5b55.
        ..5555..
        ..rrrrrr
        ..rrrr..
        ..bbbb..
        ..b.b...
        ..oo.oo.
        `))
    }

}


export class SpriteSpaceship extends Sprite {
    constructor(x, y, z) {
        super(x, y, z)
        //this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
        this.addFrameAsciiArtColor(new DrawAsciiArtColor(0, 0, `
       ....w....
       ...rrr...
       ...rwr...
       ...rwr...
       ..rwwwr..
       .rrrrrrr.
       rrrrrrrrr

        `))
    }

}

export default class Sprites extends Animator {
    static category = "Misc"
    static title = "Sprites"
    static description = "blabla"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const intervalControl = controls.value("Clock interval", 1, 1, 10, 0.1, true)
        //let font = fontSelect(controls, "Font", fonts.C64.name, 0)

        //let controlsArr = { interval: intervalControl.value, wireframe: true, perspective: 0.8, font: font }



        let canvas = new PixelBox(box)
        box.add(canvas)

        let sprites = new SpriteCollection(canvas)
        let human = new SpriteHuman(4, box.height() /2, 1)
        human.setGravity(false)
        let dog=new SpriteDog(human.x+12, box.height() /2, 1)
        let pacman=new SpritePacman(box.width()-12,box.height()-8+2,1)
        let sun=new SpriteSun(box.width()*0.5,0,1)
        //human.setGravity(true)
        sprites.add(human)
        sprites.add(dog)
        sprites.add(pacman)
        //sprites.add(sun)




        scheduler.intervalControlled(intervalControl, (frameNr) => {
            canvas.clear()
            //pacman.scale=1.001+Math.sin(frameNr/100)
            let pacmanY= sprites.ground.groundToHeight(pacman.x)
            pacman.setXY(pacman.x,pacmanY-5)
            let dogY= sprites.ground.groundToHeight(dog.x+3)
            dog.setXY(dog.x,dogY-4)
           // pacman.scale=0.7
            sprites.update()
            if (frameNr == 200) { human.say("hello world") }

            if (frameNr%1000==0){ human.say("hi") }
            if (frameNr%1300==0){ pacman.say("ai") }
            if (frameNr%500==0){ dog.say("woof")}

            canvas.add(sprites.render())
            //canvas.crop(canvas)


        })

    }
}
