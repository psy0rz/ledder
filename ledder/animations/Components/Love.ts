import PixelBox from "../../PixelBox.js"
import Color from "../../Color.js"
import Fire from "../Fires/Fire.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawText from "../../draw/DrawText.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import DrawAsciiArt from "../../draw/DrawAsciiArt.js"
import {fonts, fontSelect} from "../../fonts.js"
import Starfield from "./Starfield.js"
import Pixel from "../../Pixel.js"

const heartImage=`
..rrrr....rrrr..
.rrrrrr..rrrrrr.
rrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrr
rrrrrrrrrrrrrrrr
.rrrrrrrrrrrrrr.
..rrrrrrrrrrrr..
...rrrrrrrrrr...
.....rrrrrr.....
.......rr.......
`


const heartoutlineImage=`
..yyyy....yyyy..
.y....y..y....y.
y......yy......y
y..............y
y..............y
.y............y.
..y..........y..
...y........y...
.....y....y.....
.......yy.......
`

const figureMale1Image=`
..555...
..5wbw..
..wwr...
..yyy5..
.y.yy.y.
...bb...
...bb...
..g..g..
`

const figureMale2Image=`
..555...
..5wbw..
..wwr...
..yyy5..
.y.yy.y.
...bb...
...bb...
...gg...
`

const figureFemale1Image=`
...ooo..
.wbwooo.
..wwwo..
...ffo..
.ffff...
...ff...
...ff...
...gg...
`
const figureFemale2Image=`
...ooo..
.wbwooo.
..wwwo..
...ffo..
.ffff...
...ff...
...ff...
..g.g...
`



const bgImage=`
..yyyy.yyyy..0000000000000000000000000000000000000000000000000000000000000000000000000000rrr00000rrr0000000000000000000000000000000000000000000000000000000000000wow00000000000000000000000gbbg00000000000000000000000000000000
.y....y....y.00000000000000000000000000000000000000ww00000000000000000000g00000000000000rrrrr000rrrrr0w0000000000000w0000000000000000yyyy0000000000w0000000000000wow0000000000000y00000000bbbggb00000000000000000yyyyyyy0000000
y....y.y....y00000000000000000000000www0ww0000000wwww00000000w0w0000000000000000000000wrrrrrrrrrrrrrrr000ww0000000000000000000000000yyyyyy00000000000000000t00000woww000000000000000000000bbbggg0000000000000000000000000000000
y....y.y....y000000w000000000000000wwwwwwwww000wwwwwww000000w0w0w0000000000000000000wwwrrrrrrrrrrrrrwwwww000000b000000000y00000000yyyyyyyy00000000b0000000000000wwowww000000y00000000000000bggb0000000500000000bbbbbbbbbbb00000
y....y.y....y00000000000050000000000wwwwwwwwwwwwwwwwwww00000000000000000b0000000000wwwwwwwrrrrrrrrrwwwwwwwww00000000000000000000000yyyyyyyy00000000000000p00000wwwowwww00000000000000000000000000000000000000000000000000000000
y....y.y....y000000000000000000000000wwwwwwwwwwwwwwwwww000000000y00000000000000000wwwwwwwwwwrrrrrwwwwwwwwwwwww00000000g000000000000yyyyyyyy0000g00000000000000wwwwowwwww00000000b00000000000y0000000000000000ggggggggggggggg000
.y....y....y.0000000ggggggg0000000000000000000000000000000000000000000000ggggggggg00000000000rrr000ggggggggggg00000000000000gggggggggyyyy0000000000000000000000000owwwwww000000000000000000000000000000000000000000000000000000
..yyyy.yyyy..gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggrgggggggggggggggggggggggggggggggggggggggggggggggggggggggaaaaarrrrrrrrrrrrrrrraaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00rrrrrrrrrrrrrrrrrrrr
`





export default class Love extends Animator {
    static category = "Misc"
    static title = "Love"
    static description = "x loves y"

   

    drawMale(x:number,y:number,timer:number,isWalking:boolean)
    {
        if (x%2<1 || !isWalking)
        {
            return new DrawAsciiArtColor(x,y, figureMale1Image);
        }
        else
        {
            return new DrawAsciiArtColor(x,y, figureMale2Image)
        }
    }

    drawFemale(x,y,timer,isWalking)
    {
        if (x%2<1 || !isWalking)
        {
            return new DrawAsciiArtColor(x,y, figureFemale1Image);
        }
        else
        {
            return new DrawAsciiArtColor(x,y, figureFemale2Image)
        }
    }

    drawFadingNames(box,font,name1,name2,timer,fireBox:PixelBox)
    {
        const frames = new PixelList()
        const frame1=new PixelList();
       
        let name1PixelLength=name1.length*font.width
        let name2PixelLength=name2.length*font.width
        let imagePixelLength=Math.round(heartImage.length/10)
        let imageX=(box.width()-imagePixelLength)/2+1
        let name1X=imageX-name1PixelLength
        let name2X=imageX+imagePixelLength
        let heartColor=new Color(Math.round(Math.sin(timer/30)*50)+200,0,0,1)
        let glowColor=new Color(Math.round(Math.sin(timer/60)*127)+127,Math.round(-1*Math.sin(timer/60)*127)+127,Math.round(Math.cos(timer/60)*127)+127,1)
        if (timer==10) { fireBox.move(0,-1*box.height()) } 
        //put the heart in the center with a glowing outline
       
        if (timer>0 && timer<1000)
        {
            //scene 1 figure and scrolling names
            let scrollXpos=(timer%500)/2.5
            if (timer<500)
            {
                let p1x=scrollXpos-100
                frame1.add(this.drawMale(p1x,0, timer,true))
                frame1.add(new DrawText(p1x-(name1PixelLength-8),1,font,name1,new Color(0,0,255)))
            }
            else
            {
                let p2x=box.width()-scrollXpos+name2PixelLength
                frame1.add(this.drawFemale(p2x,0, timer, true))
                frame1.add(new DrawText(p2x+8,1,font,name2,new Color(255,0,255)))
            }

            if (timer>450 && timer<700)
            {
                frame1.add(new DrawText(((box.width()-8)/2),(Math.sin(timer/10)*3+3),font,"&",new Color(255,0,0)))
            }
        }


        //standling left and right from heart
        if (timer>1000 && timer<1300)
        {
            let scrollXpos=8
            let p1x=scrollXpos-8
            let p2x=box.width()-scrollXpos
            frame1.add(this.drawMale(p1x,0, timer, false))
            frame1.add(this.drawFemale(p2x,0, timer, false))
            
            frame1.add(new DrawAsciiArt(imageX,0,new Color(Math.sin(timer/10)*127+127,0,0,1), heartImage))
        }
        
        
        //move to heart
        if (timer==1310) { fireBox.move(0,1*box.height())}
        if (timer==1690) { fireBox.move(0,-1*box.height())}
        if (timer>1300 && timer<1700)
        {
            let subtimerWalk=timer-1300
            let xPos=subtimerWalk/10
            let figureMaleX=0+xPos 
            let figureFemaleX=box.width()-8-xPos
            frame1.add(new DrawAsciiArt(imageX,0,heartColor, heartImage))
            frame1.add(new DrawAsciiArt(imageX,0,glowColor, heartoutlineImage))
            if (figureMaleX<figureFemaleX)
            {
               
                    frame1.add(this.drawMale(figureMaleX,0, timer, true))
                    frame1.add(this.drawFemale(figureFemaleX,0, timer, true))
              
            }
            else
            {
              
                frame1.randomPixel().color.r=255
                frame1.add(this.drawMale(Math.round(box.width()/2-8)+3,0, timer, false))
                frame1.add(this.drawFemale(Math.round(box.width()/2)-3,0, timer, false))
            }
        } 

        

        //rings

        if (timer>1700 && timer<2500)
        {
           let subtimerWalk=timer-1700
            let xPos=subtimerWalk/10
            let figureMaleX=box.width()/2+xPos 
            let figureFemaleX=box.width()/2-xPos
            let xOffset=Math.round(Math.sin(timer/30)*3+3)
            //frame1.add(new DrawAsciiArt(imageX,0,heartColor, heartImage))
            frame1.add(this.drawMale(Math.round(box.width()/2-6)+xOffset,0, timer, true))
            frame1.add(this.drawFemale(Math.round(box.width()/2)+xOffset,0, timer, true))
        } 


        if (timer>2500 && timer<3500)
        {
           
            if (timer==2510) { fireBox.move(0,1*box.height())}
            if (timer==3490) { fireBox.move(0,-1*box.height())}
          
            frame1.add(new DrawAsciiArtColor(box.width()-(timer-2500)/3,0, bgImage))
            
           let subtimerWalk=timer-2500
            let xPos=subtimerWalk/10
            let figureMaleX=box.width()/2+xPos 
            let figureFemaleX=box.width()/2-xPos
            let xOffset=Math.round(Math.sin(timer/30)*3+3)
            //frame1.add(new DrawAsciiArt(imageX,0,heartColor, heartImage))
            frame1.add(this.drawMale(Math.round(box.width()/2-6)+xOffset,0, timer, true))
            frame1.add(this.drawFemale(Math.round(box.width()/2)+xOffset,0, timer, true))
            let radius=(timer-2500)/50
            let x=(box.width()/2)+Math.sin(timer/10)*radius+radius
            let y=(box.width()/2)+Math.cos(timer/10)*radius+radius
           
            //frame1.add(pl)
        } 


        
       
         if (box.height()>8) { frame1.centerV(box) } 
           
        
        //frame1.add(new DrawText(imagePixelLength+x+name1PixelLength+name2PixelLength,y,font,".",new Color(0,255,255)))
        frames.add(frame1)
        return frames

    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {
        let font=fontSelect(controls,"Font",fonts.C64.name,0)
        let name1Control=controls.input("name1","I",true)
        let name2Control=controls.input("name2","leds",true)
        const intervalControl = controls.value("speed", 1, 1, 10, 0.1)
        font.load()
        let fire=new Fire();
        let stars=new Starfield();
        let fireBox=new PixelBox(box);
        let animationBox=new PixelBox(box)
        let starBox=new PixelBox(box);
        box.add(starBox)
        box.add(fireBox)
        box.add(animationBox)
        fire.run(fireBox,scheduler,controls)
       
        stars.run(starBox,scheduler,controls)
        //let frames=this.drawHeart(box,x,y,font,name1Control.text,name2Control.text)
        //frames.centerV(box)
        //fireBox.move(0,-1*box.height(),true)
        let timer=0
        scheduler.intervalControlled(intervalControl, (frameNr) => {
            animationBox.clear()
            timer++
           
           //box.add(this.drawHeart(box,300-(frameNr%300)-150,y,font,name1Control.text.toUpperCase(),name2Control.text.toUpperCase()))
           if (timer<3500)
           {
           
                animationBox.add(this.drawFadingNames(box,font,name1Control.text.toUpperCase(),name2Control.text.toUpperCase(),timer,fireBox))
           }  
           else
           {
                timer=0
                
                fire.run(fireBox,scheduler,controls)
         
           }

        })
    }
}
