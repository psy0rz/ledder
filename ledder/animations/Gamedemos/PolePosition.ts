import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"




const car = `
..rrrrr
..rrrrr..
.00rrr00.
.00...00.
`


const sky =`
....www...................ww.................yyy.........................................................
...wwwww.wwww...........wwwwww....wwwwww....yyyyy...wwww.....wwww..................www....ww....wwwww....
...wwwwwwwwwww...........wwwwwwwwwwwwww.....yyyyy...wwwww...wwwwwww..............wwwwww.wwwww.wwwwwwww...
....wwwwwwwwwwww..........wwwwwwwwwwwwwww....yyy.....wwwwwwwwwwwwwww...........wwwwwwwwwwwwwwwwwwwwww....
`

const horiz = `
........g.........ggg..........o...9.oo....oo...............o...........5555.......b....oo.........o...
......o.o.o...o....o.o.o....o.o...5.ooo...ooooo...oooo.oo...o.o.o.o.o.o.5555.r.g.t.r.o.ooooo.....o.o...
`






export default class Planetsgone extends Animator {
    static category = "Gamesdemos"
    static title = "Pole position"
    static description = "inspired by the game"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        const countControl = 100
        const speedControl = controls.value("speed", 10, 1, 100, 1)
        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        let bglist=new PixelList()
        let skylist=new PixelList();
        let horizonlist=new PixelList();
        let carpixelList=new PixelList()
        let roadpixelList=new PixelList()
        box.add(bglist)
        box.add(skylist);
        box.add(horizonlist);
        box.add(roadpixelList)
        box.add(carpixelList)
        skylist.wrapX(box)
        let horizonY=(box.height()/3)
    
    
        for (let i=0;i<box.height();i++)
        {
          let color=new Color(0,0,255,1)
          for (let j=0; j<box.width();j++)
          {
              if (i<horizonY) { color=new Color(0,0,255,1); }
              if (i>horizonY) { color=new Color(0,255,0,1); }
              bglist.add(new Pixel(j,i,color))
          }
        }
      let time=0;

     

       let road=[0,0,0,0,-1,-1,-1,0,0,0,0,0,1,2,3,2,3,3,2,3,4,4,4,4,5,5,5,5,6,7,8,9,10,11,12,13,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6,-7,-8,-9,-10,-11,-12,-13,-14,-15,-16,-17,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,-0,-1,-1,-1,-1,-1,1,1,0,0,0,-1,1,-1,1,0,0,0,0,0,0,0,0,0,0,0,0,0]


        

       scheduler.intervalControlled(intervalControl, (frameNr) => {
        carpixelList.clear()
        roadpixelList.clear()
        skylist.clear()
        horizonlist.clear()
        time=time+speedControl.value;
      
        
        let centerX=box.xMax/2
        let centerY=box.yMax/2

        let width=box.xMax;
        let roadwidth=width/3;
        for (let i=0;i<box.yMax-horizonY;i++)
        {
          //draw road
          let r=Math.round((frameNr+i)/10)%road.length
            for (let k=centerX-roadwidth+road[r];k<centerX+roadwidth+road[r];k++)
            {
              roadpixelList.add(new Pixel(k,box.yMax-i,new Color(100,100,100,1)))
            }
           
            roadwidth=(roadwidth)*0.9
            roadpixelList.add(new Pixel(centerX-roadwidth+road[r]-2,box.yMax-i,new Color(200,200,200,1))) //left side road striping
            roadpixelList.add(new Pixel(centerX-roadwidth+road[r]-3,box.yMax-i,new Color(200,200,200,1))) //left side road striping
            roadpixelList.add(new Pixel(centerX+roadwidth+road[r]+1,box.yMax-i,new Color(200,200,200,1))) //right side road striping
            roadpixelList.add(new Pixel(centerX+roadwidth+road[r]+2,box.yMax-i,new Color(200,200,200,1))) //right side road striping
            if (((frameNr/10)+i)%4>2) 
            { 
              //draw road centerline
              roadpixelList.add(new Pixel(centerX+road[r],box.yMax-i,new Color(200,200,200,1-(1/(i+1)))))
            }
           
        }


        let skyx=Math.round((frameNr)/10)%road.length
        skylist.add(new DrawAsciiArtColor(Math.round(road[skyx]*-0.2-40),0,  sky))
        horizonlist.add(new DrawAsciiArtColor(road[skyx]*-0.5,horizonY-1,  horiz))
        
        let carX=centerX-3
        let carY=box.height()-5;
        carpixelList.add(new DrawAsciiArtColor(carX+(road[skyx]/2),carY,  car))


        



    
       });
       
    }

    
}
