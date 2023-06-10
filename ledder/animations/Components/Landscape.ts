import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import {random} from "../../utils.js"
import PixelList from "../../PixelList.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import FxMovie from "../../fx/FxMovie.js"


export default class Landscape extends Animator {
    static category = "Misc"
    static title = "Landscape"
    static description = "blabla"

    drawPlayer(x:number, y:number)
    {
        const frames = new PixelList()
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy0.
        0yyyyyy.
        yyyyyyyy
        yyyyyyyy
        yyyyyyyy
        yyyyyyyy
        0yyyyyy.
        00yyyy0.
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy00
        0yyyyyy.
        yyyyyyyy
        yyyy....
        yyy.....
        yyyy....
        0yyyyyy.
        00yyyy0.
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy0.
        0yyyyyy.
        yyyyy...
        yyyy....
        yyy.....
        yyyy....
        0yyyy...
        00yyyy..
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy0.
        0yyyyyy.
        yyyyy...
        yyyy....
        yyy.....
        yyyy....
        0yyyy...
        00yyyy..
        `))
        frames.add(new DrawAsciiArtColor(x, y, `
        00yyyy0.
        0yyyyyy.
        yyyyyyyy
        yyyy....
        yyy.....
        yyyy....
        0yyyyyy.
        00yyyy0.
        `))
        return frames
    }

    drawBoom1(x:number,y:number)
    {
        const boom = new PixelList()
        boom.add(new DrawAsciiArtColor(x, y, `
        ...o...
        ...o...
        ..ooo..
        .ooooo.
        ...t...
        `))
        return boom
    }

    drawBoom2(x:number,y:number)
    {
        const boom = new PixelList()
        boom.add(new DrawAsciiArtColor(x, y, `
        ...g...
        ..ggg..
        .ggggg.
        ..ggg.
        ...t...
        `))
        return boom
    }

    drawHuis(x:number,y:number)
    {
        const huis = new PixelList()
        huis.add(new DrawAsciiArtColor(x, y, `
        ...5...
        ..585..
        .55555.
        .58855.
        .58855.
        `))
        return huis
    }


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        let seed=0;
        let width=box.width();
        let height=box.height();
        let xoffset=0

      

  
        scheduler.intervalControlled(controls.value("Creation interval", 5), (frameNr) => {
           
            xoffset=frameNr/10;
            let y=0;
            let s=0;
            let t=0


            box.clear();

            //background an dsky
            for (let x=-7;x<width;x++)
            {
                s=Math.abs(  Math.round(  (height)-  Math.sin((xoffset/10+x)/15) *(height/3) )  )
                for (y=0;y<height;y++)
                {
                    //sky and mountains / background
                    let intensity=y*(255/height)
                    if (y>s)
                    {
                        box.add(new Pixel(x,y,new Color(0,0,Math.round(intensity/2),1))) //ground
                    }
                    else
                    { 
                        box.add(new Pixel(x,y,new Color(0,0,intensity,1))) //sky
                    }

                 

                }
            }

             //background 2
             for (let x=-7;x<width;x++)
             {
                 s=Math.round((height*0.9)+Math.sin((xoffset/5+x)*2))
                 for (y=0;y<height;y++)
                 {
                     //sky and mountains / background
                     let intensity=y*(255/height)
                     if (y>s)
                     {
                         box.add(new Pixel(x,y,new Color(0,Math.round(intensity/4),0,1))) //ground
                     }
                     else
                     { 
                         //box.add(new Pixel(x,y,new Color(intensity,intensity,intensity,Math.abs(Math.sin(xoffset+x+y))))) //sky
                     }
 
                  
 
                 }
             }

            //middleground
            for (let x=0;x<width;x++)
            {
                s=Math.round((height-2)+Math.sin((xoffset+x)/5)*2)
                for (y=0;y<height;y++)
                {
                    let intensity=y*(255/height)
                    //middleground
                    let t=Math.round((height-2)+Math.sin((xoffset+x)/18.0))
                    if (y>t)
                    {
                        box.add(new Pixel(x,y,new Color(Math.round(intensity/4),32,32,1))) //ground
                    }

                   

                }
            }

            y=Math.round((height-2)+Math.sin((xoffset)/18.0))-4
            let wandelaarbox = new PixelBox(box)
            box.add(wandelaarbox)
            let pl=this.drawPlayer(-1,y-3)
            new FxMovie(scheduler, controls, 4, 0).run(pl,  wandelaarbox)
            

            //attributes
            for (let x=0;x<width;x++)
            {
                //buildings
                y=Math.round((height-2)+Math.sin((xoffset+x)/18.0))-4
                let seed=x+xoffset
               
                //if (seed%84==1) { box.add(this.drawHuis(x,y) ) }
                //if (seed%10==1) { box.add(this.drawBoom1(x,y) ) }
                //if (seed%15==5) { box.add(this.drawBoom2(x,y) ) }
          
            }

           

        })

    }
}
