import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import {random} from "../../utils.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Font from "../../Font.js"
import { fonts } from "../../fonts.js"
import DrawText from "../../draw/DrawText.js"
import DrawLine from "../../draw/DrawLine.js"
import Pacman from "../Components/Pacman.js"
import DrawBox from "../../draw/DrawBox.js"






export default class Eighties extends Animator {

    static category = "Basic"
    static title = "80s"
    static description = "retro style for why25"
   static max_iteration=32
    
    mandelbrot(c,px:number,py:number,width:number,height:number,zoom:number,max_iterations) {

        let REAL_SET = { start:c.cx-zoom , end:c.cx+zoom }
        let IMAGINARY_SET = { start: c.cy-zoom, end: c.cy+zoom }

        let complex = {
            x: REAL_SET.start + (px / width) * (REAL_SET.end - REAL_SET.start),
            y: IMAGINARY_SET.start + (py /height) * (IMAGINARY_SET.end - IMAGINARY_SET.start)
        }

        let z = { x: 0, y: 0 }, n=0, p, d;
        do {
            p = {
                x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
                y: 2 * z.x * z.y
            };
            z = {
                x: p.x + complex.x,
                y: p.y + complex.y
            };
            d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2));
            n += 1;
        } while (d <= 2 && n < max_iterations);
        return n
    }


    drawBackground(box:PixelBox, xOffset:number, yOffset:number,horizonHf:number,animationHeight)
    { 
        let horizonColor=new Color(255,0,255,0.7);
        let skyTopColor=new Color(255,0,0,0);
        let skyBottomColor=new Color(97,0,255,1);
        let gridColorFar=new Color(32,32,64,0.4);
        let gridColorClose=new Color(0,64,76,0.4);
        let pl=new PixelList();
        let horizonH=(animationHeight/2)*horizonHf*2
       
      


          //stars
          pl.add(this.getStars(box,xOffset,horizonH/3));


        //create sky
        for (let skyX=0; skyX<box.width(); skyX++)
        {
            pl.add(new DrawLine(skyX,0,skyX,horizonH,skyTopColor,skyBottomColor));
        }
      
        //sun
        pl.add(this.getSun(box,xOffset,horizonH))

          //create clouds
          pl.add(this.getClouds(box,xOffset,horizonH))


        //create horizon
         pl.add(new DrawLine(0,horizonH,box.width(),horizonH,horizonColor,horizonColor));
       
        let earthVh=(box.height()-horizonH)/(box.height()/3);
        let nxOffset=xOffset%(box.width()/8);
        let nyOffset=yOffset%(earthVh);

      
        //create earth

         //draw buildings
         pl.add(this.getPolder(box,xOffset,horizonH));
        
       
        for (let earthHline=0; earthHline<(box.height()-horizonH);earthHline+=earthVh)
        {
            let nGridCol=new Color(82,52,191,(earthHline/(box.height()-horizonH)));
            pl.add(new DrawLine(0,earthHline+horizonH+nyOffset,box.width(),earthHline+horizonH+nyOffset,nGridCol,nGridCol));
        }

        for (let earthVline=0; earthVline<box.width();earthVline+=(box.width()/12))
            {
                let perspectiveF=2;
                let transX=((earthVline-(box.width()/2))*perspectiveF)+(box.width()/2);
                pl.add(new DrawLine(earthVline-nxOffset,horizonH,transX-nxOffset,box.height(),gridColorFar,gridColorClose));
            }

       
        return pl;

    } 

    getSun(box:PixelBox,x,horizonY)
    {
        let pl=new PixelList();
        let radius=20+(Math.sin(horizonY/10)*10);
        let cx=box.width()/2;
        let cy=horizonY;
    
        for (let a=0;a<360;a++)
        {
            let px=(Math.sin(a)*radius)+cx
            let py=(Math.cos(a)*radius)+cy
            if (py<cy)
            {
            pl.add(new DrawLine(cx,cy,px,py,new Color(255,255,0,0.6),new Color(255,0,0,0.1)))
            }
        }
        return pl;
    }

    getStars(box:PixelBox,x,horizonY)
    {
        let pl=new PixelList();
        let starsOffset=(horizonY*2)-2;
        let xOffset=0 
        for (let c=0;c<starsOffset;c++)
            {

                    let intensity=Math.abs(Math.cos(x+c/4))/3;
                    let b=Math.abs(Math.cos(x)*50)+200
                    let color=new Color(0,0,b,intensity)

                    pl.add(new DrawLine(0,c,box.width(),c,color,color))
                   
                
        }
        return pl;
    }

    getClouds(box:PixelBox,x,horizonY)
    {
        
        let pl=new PixelList();
        let mountainHeight=10;
        let mountTopColor=new Color(255,255,255,0.6);
        let mountMidColor=new Color(100,100,100,0.5)
        let mountBotColor=new Color(0,100,200,0.1);
        for (let px=0;px<box.width();px++)
        {
            let height=(Math.sin(x+px/4)+Math.cos(box.width()-(px/6)))*(mountainHeight/2)+(mountainHeight/2)
            height=Math.abs(height);

            let midHeight=mountainHeight/2;
            pl.add(new DrawLine(px,horizonY,px,horizonY-height,mountBotColor,mountTopColor));
            if (height<midHeight)
            {
                pl.add(new DrawLine(px,horizonY,px,horizonY-height,mountBotColor,mountMidColor));
               
            }
            else
            {
                pl.add(new DrawLine(px,horizonY,px,horizonY-midHeight,mountBotColor,mountMidColor));
                pl.add(new DrawLine(px,horizonY-midHeight,px,horizonY-height,mountMidColor,mountTopColor));  
            }

        }
        return pl;
    }


    getPolder(box:PixelBox,x,horizonY)
    {
        
        let pl=new PixelList();
        let mountainHeight=15;
        let mountTopColor=new Color(0,255,0,0.7);
        let mountMidColor=new Color(0,255,255,0.6)
        let mountBotColor=new Color(0,0,255,0.5);
        for (let px=0;px<box.width();px++)
        {
            let height=(Math.cos(x+px/12)+Math.sin((x+px/15)))*(mountainHeight/2)+(mountainHeight/2)*2
            

            let midHeight=mountainHeight/2;
            pl.add(new DrawLine(px,horizonY,px,horizonY+height,mountBotColor,mountTopColor));
            if (height<midHeight)
            {
                pl.add(new DrawLine(px,horizonY,px,horizonY+height,mountBotColor,mountMidColor));
               
            }
            else
            {
                pl.add(new DrawLine(px,horizonY,px,horizonY+midHeight,mountBotColor,mountMidColor));
                pl.add(new DrawLine(px,horizonY+midHeight,px,horizonY+height,mountMidColor,mountTopColor));  
            }

        }
        return pl;
    }
   


    getSpaceinvader(x,y)
    {
        const invader1 =`
        r...r
        ry.yr
        ..r..
        `

      
            let pl=new PixelList();
           pl.add(new DrawAsciiArtColor(x,y, invader1))
            return pl
    }
    getGhost(index,x,y)
    {
        const frames = []
        frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w.bww.bw
                w..ww..w
                wwwwwwww
                wwwwwwww
                w..ww..w
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w.bww.bw
                w..ww..w
                wwwwwwww
                wwwwwwww
                ww.www.w
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w..ww..w
                w.bww.bw
                wwwwwwww
                wwwwwwww
                w..ww..w
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w..ww..w
                w.bww.bw
                wwwwwwww
                wwwwwwww
                w.w..w.w
                `))
                frames.push(new DrawAsciiArtColor(x, y, `
                ...ww...
                ..wwww..
                .wwwwww.
                w..ww..w
                w.bww.bw
                wwwwwwww
                wwwwwwww
                w..ww..w
                `));
                let framenum=(index>>2)%frames.length;
                return frames[framenum];
    }

    

    getPacman(index,x,y)
    {
        const frames = []
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyyyyy
        yyyyyyyy
        yyyyyyyy
        yyyyyyyy
        .yyyyyy.
        ..yyyy..
        `))
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyyyyy
        yyyy....
        yyy.....
        yyyy....
        .yyyyyy.
        ..yyyy..
        `))
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyy...
        yyyy....
        yyy.....
        yyyy....
        .yyyy...
        ..yyyy..
        `))
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyy...
        yyyy....
        yyy.....
        yyyy....
        .yyyy...
        ..yyyy..
        `))
        frames.push(new DrawAsciiArtColor(x, y, `
        ..yyyy..
        .yyyyyy.
        yyyyyyyy
        yyyy....
        yyy.....
        yyyy....
        .yyyyyy.
        ..yyyy..
        `))
        let framenum=(index>>2)%frames.length;
        return frames[framenum];
    }

    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const appControl=controls.group("80s theme",true)
        const secondsBetweenNumbers = appControl.value("Delay (seconds)",30, 1, 120, 1)
        const animationHeight=box.height()*2;
        let horizonFactor=0;
        let horizonIncrement=0.001
       
        const canvas=new PixelList();
        const sprites=new PixelList();
        const overlay=new PixelList();
        box.add(canvas);
        box.add(sprites);
        box.add(overlay);
       let animationNum=0;
      let font=fonts["Pixel-Gosub"];
      font.load();
       let pacmanSeq=0;
      //scheduler.setFrameTimeuS(100000)
       scheduler.interval(1, (frameNr) => {
       
            canvas.clear();
            
            let xOffset=(frameNr/20);
            let yOffset=(frameNr/animationHeight);
            horizonFactor=Math.sin(frameNr/(box.height()*30))
          
            canvas.add(this.drawBackground(box,xOffset,yOffset,horizonFactor,animationHeight));
            canvas.add(new DrawText(0,box.height()-5,font,horizonFactor.toFixed(3),new Color(128,128,128,1)))
            sprites.clear()
            let pacmanX=0;
            let pacmanY=0;
            if (horizonFactor<0.53){ 
                if (true)
                {
                    pacmanX=(pacmanSeq/15)%(box.width()*1.5);
                    pacmanY=animationHeight*(horizonFactor+1)+8;
                    sprites.add(this.getPacman(pacmanSeq,pacmanX,pacmanY-5))
                    let ghost:PixelList=this.getGhost(pacmanSeq,(pacmanX-12)%box.width(),pacmanY-5);
                    ghost.replaceColor(new Color(255,255,255,1),new Color(255,255,255,((Math.sin(frameNr/10)+1)/2)))
                    sprites.add(ghost);
                
                    for (let tx=box.width();tx>(pacmanX+4);tx=tx-4)
                    {
                        sprites.add(new Pixel(tx,pacmanY,new Color(255,255,255,0.8)))
                    }
                    pacmanSeq++;
                    if (pacmanX>box.width()-1)
                    {
                        animationNum++;
                    }
                }
            }
            if (horizonFactor>0.5)
            {
                pacmanX=(box.width()/2)+(Math.sin(frameNr/100)*(box.width()/2));
                pacmanY=1;
                sprites.add(this.getSpaceinvader(pacmanX,pacmanY));
                sprites.add(new Pixel(pacmanX+4,pacmanY+4+((frameNr/10)%animationHeight),new Color(255,255,255,1)))
            }
            
            //
        })


       
    }
}
