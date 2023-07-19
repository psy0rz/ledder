//By Rein.
//Created for a friends wedding
//Under construction...very dirty (but working) code

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
import {patternSelect} from "../../ColorPatterns.js"
import {glow, randomFloatGaussian} from "../../utils.js"
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
const heartXSMImage=`
.r.r.
rrrrr
.rrr.
..r..
`



const heartSMImage=`
.rr..rr.
rrrrrrrr
.rrrrrr.
...rr...
`

const heartMImage=`
.rr...rr.
rrrrrrrrr
.rrrrrrr.
..rrrrr..
....r....
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
............wwww........wwwww.........wwwwww....................yyyyy...............................................................................................................................5555...........................................................................................................................yyyy..............r..........................
...........wwwwwww.....wwwwwwwww.....wwwwwwwww.................yyyyyyy.................................ww........55..........................gg...gg........5........rrr.....rrr...................5wwww5................rr..rr.................yyyy...yyyy.......................................................................yyyyyy.............rr....bbb.bbb.bbb.bbb.bbb..
.........wwwwwwwwwwww.wwwwwwwwwwww..wwwwwwwwwwwwwww...........yyyyyyyyy..............................wwww.......555..........................gg...gg.......555......rrrrr...rrrrr.................5000www5..............rr....rr...............y....y.y....y.....................................................................yyyyyyyy.........rrrrrr...b....b..b.b.b....b...
.......wwwwwwwwwwwwwwwwwwwwwwwwwwww.wwwwwwwwwwwwwwwww.........yyyyyyyyy........................55555555555555555555............................ggg..........5.......rrrrrr.rrrrrr.................5000www5..............rr....rr..............y......y......y..............................ww............ww...............ww.........yyyy.........rrrrrrr..bbb..b..bbb.b....b...
........wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww........yyyyyyy........................5555wwwwww55555555wwww.........................gg.g.gg........5........rrrrrrrrrrrr.................5000www5..............rr....rr..............y......y......y..............................ww............ww...............ww...........yy.........rrrrrr.....b..b..b.b.b....b...
................................................................yyyyy..........................5555wwwwww55555555wwww........................gg.g.gg....5...5...5.....rrrrrrrrrr..................5000www5..............rr....rr...............y....y.y....y.........................................................................yyyy............rr....bbb..b..b.b.b....b...
......................................................................................................wwwwww....................................g........5..5..5........rrrrrr.....................500005................rr..rr.................yyyy...yyyy.......................................................................yyyyyy.............r..........................
........................................................................................................wwwww..................................g..........55555...........rrr.......................5555..................rrrr.....................................................................................................yyyy.........................................
`







export default class Love extends Animator {
    static category = "Misc"
    static title = "Love"
    static description = "x loves y"
    fireshow=true
    fireFull=false
    fireFunky=false
    flameDecay=1
    curDecay=10
    max_iterations=2000
    zoomfactor=0.8
    hotspotSel=0
    colors=[]
    zoom=2;
    zoomMax=5
    hotspots=[
        { cx:0.25347098330532,  cy:-0.00032872330789825,maxz:9},
        { cx:-0.81812825180059, cy:-0.19884971553421,   maxz:9},
        { cx:0.35164493860728,  cy:-0.58133391051187,   maxz:9},
        { cx: 0.43792424135946, cy:0.34189208433812 ,   maxz:9},
        { cx:0.24679672392427,  cy:0.50342253979013,    maxz:9},
        { cx:-1.1785276064604,  cy:0.30096231141302,    maxz:8},
        { cx:0.13614939178535,  cy:-0.66905589958398,   maxz:9},
        { cx:-1.0658884716107,  cy:-0.25431284056064,   maxz:9},
        { cx:-1.0657340413104,  cy:-0.25412076186408,   maxz:9},
        { cx:-1.1780691868827,  cy:0.30014031883977,    maxz:9}
    ]

    julia(c,px:number,py:number,width:number,height:number,zoom:number)
    {
        //calculate the initial real and imaginary part of z, based on the pixel location and zoom and position values
         let newRe = 1.5 * (px - width / 2) / (0.5 * zoom * width) ;
         let newIm = (py - height / 2) / (0.5 * zoom * height);
         let oldRe=0;
         let oldIm=0
         //i will represent the number of iterations
         let n=0
         //start the iteration process
         do
         {
             //remember value of previous iteration
             oldRe = newRe;
             oldIm = newIm;
             //the actual iteration, the real and imaginary part are calculated
             newRe = oldRe * oldRe - oldIm * oldIm + c.cx
             newIm = 2 * oldRe * oldIm + c.cy
             //if the point is outside the circle with radius 2: stop
             if((newRe * newRe + newIm * newIm) > 4) break;
             n++
         } while (n<this.max_iterations)
         return n
    }

    runFractal(box:PixelBox,timer,name1:String,name2:String)
    {
        let pixelBox=new PixelBox(box);
        let hotspot=this.hotspots[this.hotspotSel]
        let counter=timer
        this.zoom=this.zoom*this.zoomfactor; 
        let zoomMax=Math.pow(10,9)
       
        
            if (this.zoom<1) { this.zoomfactor=1+0.1; this.hotspotSel=this.hotspotSel+1;} //zoom in
            if (this.zoom>zoomMax) { this.zoomfactor=1-0.1;  } //zoom out
            if (this.hotspotSel>=this.hotspots.length) {this.hotspotSel=0; }
      

        //
    
        box.clear();
        let colorIndex=0;
        
        for (let x = 0;  x< box.width(); x++) {
            for (let y = 0; y < box.height(); y++) {
               
              

             
                        colorIndex = this.julia(hotspot,x,y,box.width(),box.height(),this.zoom);
              
                        let mp=parseInt(colorIndex.toString())
                        let colornum=+(mp*11) % (this.colors.length-1)
                        let color= this.colors[colornum];
                       
                        let yo=y-(box.height()-8)/2
                        let pixel = new Pixel(x,yo,color);
                        if (pixel.color.a)
                        {
                            try
                            {
                                pixel.color.a=0.7
                            }
                            catch (e)
                            {

                            }
                        }
                        pixelBox.add(pixel);
                    
               
            }
        }
        let font=fonts["IBM bios"]
        font.load()
        let imagePixelLength=Math.round(heartImage.length/10)
        let imageX=(box.width()-imagePixelLength)/2+1
        pixelBox.add( new DrawAsciiArt(imageX,0,new Color(Math.sin(timer/10)*127+127,0,0,1), heartImage))
        pixelBox.add( new DrawText(0,2,font,name1.substring(0,1).toUpperCase(),new Color(255,255,0,1)))
        pixelBox.add( new DrawText(box.width()-8,2,font,name2.substring(0,1).toUpperCase(),new Color(255,255,0,1)))
        return pixelBox
    }

    runFire(fireBox,glower,field,pixels,colors)
    {
        if (this.flameDecay<this.curDecay) { this.curDecay=this.curDecay-0.1}
        if (this.flameDecay>this.curDecay) { this.curDecay=this.curDecay+0.1}
        const colorScale = (colors.length - 1) / 100
        for (let x = fireBox.xMin; x < fireBox.xMax; x++) {

            const percentageX = fireBox.percentageX( x)
            if (this.fireshow)
                glower[x] = glow(glower[x],
                    ~~0 * colorScale,
                    ~~100 * colorScale,
                    ~~10 * colorScale, 3)
            else
                glower[x] = 0
        }
        for (let y = 0; y < 1; y++)
            this.move_fire(fireBox, field, this.curDecay * colorScale, colors.length - 1, glower,0)

        this.save_image(fireBox, field, pixels, colors)

    }

    fireShow(state)
    {
        this.fireshow=state
       
    }

    fireSetFull(state)
    {
        this.fireFull=state
        if (state)
        {
            this.flameDecay=4
        }
        else
        {
            this.flameDecay=10
        }
    }

    fireSetFunky(state)
    {
        this.fireFunky=state
    }

    move_fire(firebox: PixelBox, field, decay, maxFlame, glower, moveFactor) {
        let x, y, flame

        // move flames up
        for (y = firebox.yMax; y >= firebox.yMin; y--) {
            for (x = firebox.xMin; x <= firebox.xMax; x++) {
                let self, left, middle, right

                self = field[y][x]
                if (y > firebox.yMin) {
                    middle = field[y - 1][x]
                    if (x > firebox.xMin)
                        left = field[y - 1][x - 1]
                    else
                        //wrap around
                        left = field[y - 1][firebox.xMax]

                    if (x < firebox.xMax)
                        right = field[y - 1][x + 1]
                    else
                        //wrap around
                        right = field[y - 1][firebox.xMin]
                } else {
                    //bottom row uses glower as input
                    middle = glower[x]
                    if (x > firebox.xMin)
                        left = glower[x - 1]
                    else
                        left = glower[firebox.xMax]

                    if (x < firebox.xMax)
                        right = glower[x + 1]
                    else
                        right = left
                }

                flame = (self + left + middle + right) / (4 - randomFloatGaussian(moveFactor / 2, moveFactor))

                // decay
                if (flame > decay) {
                    flame -= decay
                } else {
                    flame /= 2
                }
                if (flame < 0)
                    flame = 0

                if (flame > maxFlame)
                    flame = maxFlame
                field[y][x] = flame
            }
        }
    }


    save_image(firebox: PixelBox, field, pixels: Array<Array<Pixel>>, colors) {
        let row, col

        for (row = firebox.yMin; row <= firebox.yMax; row++) {
            for (col = firebox.xMin; col <= firebox.xMax; col++) {
                const intensity = field[row][col]
                pixels[firebox.height()-row-1][col].color = colors[~~intensity]
            }
        }
    }

    drawSmallHeart(box:PixelBox,timer)
    {
        let count=5
        let pl=new PixelList();
        let width=box.width()
        let height=box.height()
        let distance=width/count
        for (let i=1;i<count+1;i++)
        {
            pl.add(new DrawAsciiArtColor(Math.cos(timer/100+i)*(width/2)+width/2-8,Math.sin(timer/100+i)*(height/2)+(height/2)-5, heartXSMImage))
        }

        return pl
    }

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

    drawFadingNames(box,font,name1,name2,timer)
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
        if (timer<100) { this.fireShow(true) } 
        //put the heart in the center with a glowing outline
       let titlefont=fonts["IBM bios"]
       titlefont.load()

       let subfont=fonts["Tiny 3x3"]
       subfont.load()
       
        if (timer<200)
        {
            frame1.add(new DrawText(((box.width()-(titlefont.width*4))/2),0,titlefont,"LOVE",new Color(255,0,0)))
        }

        if (timer==190) { this.fireShow(true); this.fireSetFull(true)}
        if (timer==210){ this.fireSetFull(false)}

        if (timer>200 && timer<300)
        {
            frame1.add(new DrawText(8,box.height()*0-2,subfont,"THE",new Color(0,255,0)))
            frame1.add(new DrawText(8,box.height()*0.3-2,subfont,"STORY",new Color(0,255,0)))
            frame1.add(new DrawText(8,box.height()*0.6-2,subfont,"OF",new Color(0,255,0)))
        }


        if (timer>0 && timer<1000)
        {
           
            //scene 1 figure and scrolling names
            let scrollXpos=(timer%500)/2.5
            if (timer<500)
            {
                let p1x=scrollXpos-100
                frame1.add(this.drawSmallHeart(box,timer))
                frame1.add(this.drawMale(p1x,0, timer,true))
                frame1.add(new DrawText(p1x-(name1PixelLength-8),1,font,name1,new Color(0,0,255)))
            }
            else
            {
                frame1.add(this.drawSmallHeart(box,timer))
                let p2x=box.width()-scrollXpos+name2PixelLength
                frame1.add(this.drawFemale(p2x,0, timer, true))
                frame1.add(new DrawText(p2x+8,1,font,name2,new Color(255,0,255)))
            }

           
            if (timer>450 && timer<700)
            {
                //frame1.add(this.drawSmallHeart(box,timer))
                frame1.add(new DrawText(((box.width()-8)/2),(Math.sin(timer/10)*3+3),font,"&",new Color(255,255,0)))
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
        if (timer==1600) { this.fireShow(true)}
        //if (timer>1697) { this.fireShow(false)}
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
            frame1.add(this.drawSmallHeart(box,timer))
            frame1.add(this.drawMale(Math.round(box.width()/2-6)+xOffset,0, timer, true))
            frame1.add(this.drawFemale(Math.round(box.width()/2)+xOffset,0, timer, true))
        } 


        //dancing with scrolling background
        if (timer>2500 && timer<4000)
        {
            this.fireShow(true)
            frame1.add(new DrawAsciiArtColor(box.width()-(timer-2500)/3,0, bgImage))
            //frame1.add(this.drawSmallHeart(box,timer))
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

        if (timer>3600 && timer<4000)
        {
            this.fireSetFull(true);
           
         
         
            this.fireShow(true)
        }

        if (timer>4000 && timer<6000)
        {
            this.fireShow(false)
            frame1.add(this.runFractal(box,timer,name1,name2))
            frame1.add(this.drawSmallHeart(box,timer))
        }
        

       
        if (timer>6000 && timer<7000)
        {
            let subtimerWalk=timer-6000
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

        
       
         if (box.height()>8) { frame1.move(0,(box.height()-8)/2) } 
           
        
        //frame1.add(new DrawText(imagePixelLength+x+name1PixelLength+name2PixelLength,y,font,".",new Color(0,255,255)))
        frames.add(frame1)
        return frames

    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {
        let controlGroup=controls.group("LOVE controls")
        let font=fontSelect(controlGroup,"Font",fonts.C64.name,0)
        let name1Control=controlGroup.input("name1","I",true)
        let name2Control=controlGroup.input("name2","leds",true)
        let starControl=controlGroup.group("stars")
        const intervalControl = controlGroup.value("speed", 1, 1, 10, 0.1)
        font.load()
        let stars=new Starfield();
        let fireBox=new PixelBox(box);
        let animationBox=new PixelBox(box)
        let starBox=new PixelBox(box);
        box.add(fireBox)
        box.add(starBox)
        box.add(animationBox)
        
        this.fireShow(false)
        let pixels = box.raster(fireBox, new Color(0, 0, 0, 0), true, false, false)
        let field = []
        let colors = patternSelect(controlGroup, 'Fire colors', 'Bertrik fire')
        this.colors = patternSelect(controlGroup, 'Fractal colors', 'DimmedReinbow')


        //glower
        let glower = []
        for (let x = fireBox.xMin; x <= fireBox.xMax; x++) {
            glower[x] = 0
        }


        //create clear field
        for (let y = fireBox.yMin; y <= fireBox.yMax; y++) {
            field[y] = []
            for (let x = fireBox.xMin; x <= fireBox.xMax; x++) {
                field[y][x] = 0
            }
        }

       

      
        const colorScale = (colors.length - 1) / 100
        let newColors=[]
        let funkyColors=[]
        for (let c=0;c<colors.length;c++)
        {
            newColors.push(new Color(colors[c].r,colors[c].g,colors[c].b,0.3))
            let fb=Math.round(Math.sin(c/30)*127+127)
            let fg=Math.round(Math.cos(c/30)*127+127)
            let fr=Math.round((fb+fg)/2)
            funkyColors.push(new Color(fr,fg,fb,0.5))
        }
        stars.run(starBox,scheduler,starControl)
       
        let timer=0
        scheduler.intervalControlled(intervalControl, (frameNr) => {
            animationBox.clear()
            timer++

            //glower
           
            if (this.fireFull)
            {
                this.runFire(fireBox,glower,field,pixels,colors)
            }
            else
            {
              this.runFire(fireBox,glower,field,pixels,newColors)
              //this.runFire(fireBox,glower,field,pixels,funkyColors)
            }

            

           
           //box.add(this.drawHeart(box,300-(frameNr%300)-150,y,font,name1Control.text.toUpperCase(),name2Control.text.toUpperCase()))
           if (timer<7200)
           {
           
                animationBox.add(this.drawFadingNames(animationBox,font,name1Control.text.toUpperCase(),name2Control.text.toUpperCase(),timer))
           }  
           else
           {
                timer=0
                
               
         
           }




        })
    }
}
