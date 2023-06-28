import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"



const exploding = `
...y.y...
..y.y.y..
.y.y.y.y.
..y.y.y..
...y.y...
`

const earth = `
..bb..
.bbgg.
.bbgg.
..gg..
`

const moon =`
5
`

const sun = `
...yyy...
..yyyyy..
.yyyyyyy.
..yyyyy..
...yyy...
`

const jupiter = `
..rrr..
.rryrr.
.rrrrr.
..rrr..
`

const saturnus = `
..555..
.55555.
.55555.
..555..
`

const mars = `
..gg..
.gggg.
..gg..
`

const venus = `
..mm..
.mmmm.
..mm..
`

const ghost=`
...ww...
..wwww..
.wwwwww.
w.bww.bw
w..ww..w
wwwwwwww
wwwwwwww
w..ww..w
`

const pacman=[

`
00yyyy0.
0yyyyyy.
yyyyyyyy
yyyyyyyy
yyyyyyyy
yyyyyyyy
0yyyyyy.
00yyyy0.
`,

`
00yyyy00
0yyyyyy.
yyyyyyyy
yyyy....
yyy.....
yyyy....
0yyyyyy.
00yyyy0.
`,

`
00yyyy0.
0yyyyyy.
yyyyy...
yyyy....
yyy.....
yyyy....
0yyyy...
00yyyy..
`,

`
00yyyy0.
0yyyyyy.
yyyyy...
yyyy....
yyy.....
yyyy....
0yyyy...
00yyyy..
`,

`
00yyyy0.
0yyyyyy.
yyyyy...
yyyy....
yyy.....
yyyy....
0yyyy...
00yyyy..
`,

`
00yyyy0.
0yyyyyy.
yyyyyyyy
yyyy....
yyy.....
yyyy....
0yyyyyy.
00yyyy0.
`
]



export default class Planetsgone extends Animator {
    static category = "Ledart"
    static title = "planetman"
    static description = "planetman"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        const countControl = 100
        const speedControl = controls.value("speed", 10, 1, 100, 1)
        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        let pixelList=new PixelList()
        box.add(pixelList)

    
      let time=0;

        let earthActive=1
        let marsActive=1
        let venusActive=1
        let jupiterActive=1
        let saturnusActive=1
        let explosionActive=0
        let explosionX=0
        let explosionY=0
        let explosionSize=0
        let respawnTimeout=0
        
     function explosion( x,y)
     {
      
      explosionX=x
      explosionY=y
      explosionActive=1
      explosionSize=y*2
      let explodingList=new PixelList();
      explodingList.add(new DrawAsciiArtColor(x,y,  pacman[0]))  //mouth shut
      explodingList.add(new DrawAsciiArtColor(x-2,y,  exploding))
      return explodingList
     }

     function afterExplosion()
     {
      
      let exPixelList=new PixelList();
      if (explosionActive==1)
      {
        explosionSize=explosionSize-0.1;
        if (explosionSize<0.5) { explosionActive=0;}
        exPixelList.add(new Pixel(explosionX,explosionSize,new Color(255,255,255,1)))
        exPixelList.add(new DrawAsciiArtColor(explosionX,explosionY,  exploding))
     }
     return exPixelList
    }
        

       scheduler.intervalControlled(intervalControl, (frameNr) => {
        pixelList.clear()
        time=time+speedControl.value;
        respawnTimeout++;
        let pacmanframeNr=Math.round(frameNr/5);
        let centerX=box.xMax/2
        let centerY=box.yMax/2

        let sunX=centerX
        let sunY=centerY

        let earthOrbit=0.6
        let earthTimescale=365
        let earthX=Math.sin(time/earthTimescale)*(centerX*earthOrbit)+centerX
        let earthY=Math.cos(time/earthTimescale)*(centerY*earthOrbit)+centerY

        let moonTimescale=30
        let moonX=Math.sin(time/moonTimescale)*(3)+earthX+3
        let moonY=Math.cos(time/moonTimescale)*(3)+earthY+2

        let marsOrbit=0.5
        let marsTimescale=300
        let marsX=Math.sin(90+(time/marsTimescale))*(centerX*marsOrbit)+centerX
        let marsY=Math.cos(90+(time/marsTimescale))*(centerY*marsOrbit)+centerY

        let venusOrbit=0.4
        let venusTimescale=260
        let venusX=Math.sin(90+(time/venusTimescale))*(centerX*venusOrbit)+centerX
        let venusY=Math.cos(90+(time/venusTimescale))*(centerY*venusOrbit)+centerY

        let saturnusOrbit=1.0
        let saturnusTimescale=500
        let saturnusX=Math.sin(90+(time/saturnusTimescale))*(centerX*saturnusOrbit)+centerX
        let saturnusY=Math.cos(90+(time/saturnusTimescale))*(centerY*saturnusOrbit)+centerY

        let jupiterOrbit=1.3
        let jupiterTimescale=600
        let jupiterX=Math.sin(90+(time/jupiterTimescale))*(centerX*jupiterOrbit)+centerX
        let jupiterY=Math.cos(90+(time/jupiterTimescale))*(centerY*jupiterOrbit)+centerY
        let jupiterMoonTimescale=100

        let jupiterMoon1X=Math.sin(90+(time/jupiterMoonTimescale))*(3)+jupiterX+3
        let jupiterMoon1Y=Math.cos(90+(time/jupiterMoonTimescale))*(3)+jupiterY+2

        let jupiterMoon2X=Math.sin(0+(time/jupiterMoonTimescale))*(3)+jupiterX+3
        let jupiterMoon2Y=Math.cos(0+(time/jupiterMoonTimescale))*(3)+jupiterY+2

      
       
        
          pixelList.add(new DrawAsciiArtColor(sunX-3,sunY-1,  sun))
          if (marsActive==1)  { pixelList.add(new DrawAsciiArtColor(marsX,marsY,  mars))}
          if (venusActive==1) { pixelList.add(new DrawAsciiArtColor(venusX,venusY,  venus)) }
          if (jupiterActive==1)  
          {
            pixelList.add(new DrawAsciiArtColor(jupiterX,jupiterY,  jupiter))
            pixelList.add(new DrawAsciiArtColor(jupiterMoon1X,jupiterMoon1Y,  moon))
            pixelList.add(new DrawAsciiArtColor(jupiterMoon2X,jupiterMoon2Y,  moon))
          }
          if (saturnusActive==1)  {pixelList.add(new DrawAsciiArtColor(saturnusX,saturnusY,  saturnus))}
          if (earthActive==1) 
          { 
            pixelList.add(new DrawAsciiArtColor(earthX,earthY,  earth))
            pixelList.add(new DrawAsciiArtColor(moonX,moonY, moon) )
          }
        
          let pacmanX=((frameNr/5)%(box.xMax))
          let pacmanY=Math.sin(time/600)*box.yMax/2+centerY
        if (time>5000)
        {
         
          let pacmanFrame=pacman[(Math.round(frameNr/5))%5]
          pixelList.add(new DrawAsciiArtColor(pacmanX,pacmanY, pacmanFrame))

          if (marsY<centerY && Math.abs(pacmanX-marsX)<1 && Math.abs(pacmanY-marsY)<1) { pixelList.add(explosion(marsX,marsY)); marsActive=0 }
          if (venusY<centerY && Math.abs(pacmanX-venusX)<1 && Math.abs(pacmanY-venusY)<1) { pixelList.add(explosion(venusX,venusY)); venusActive=0 }
          if (jupiterY<centerY && Math.abs(pacmanX-jupiterX)<2 && Math.abs(pacmanY-jupiterY)<2) { pixelList.add(explosion(jupiterX,jupiterY)); jupiterActive=0 }
          if (earthY<centerY && Math.abs(pacmanX-earthX)<1 && Math.abs(pacmanY-earthY)<1) { pixelList.add(explosion(earthX,earthY)); earthActive=0 }
          if (saturnusY<centerY && Math.abs(pacmanX-saturnusX)<2 && Math.abs(pacmanY-saturnusY)<2) {pixelList.add(explosion(saturnusX,saturnusY));  saturnusActive=0 }
        }


        if (time>10000)
        {
          let ghostX=((frameNr/6)%(box.xMax))
          let ghostY=Math.sin(time/500)*box.yMax/2+centerY
          let ghostFrame=ghost
          pixelList.add(new DrawAsciiArtColor(ghostX,ghostY, ghostFrame))
          if ( Math.abs(pacmanX-ghostX)<2 && Math.abs(pacmanY-ghostY)<2) {earthActive=1; venusActive=1; marsActive=1; jupiterActive=1; saturnusActive=1; respawnTimeout=0; time=0; }

        }

        //if (respawnTimeout>8000) {earthActive=1; venusActive=1; marsActive=1; jupiterActive=1; saturnusActive=1; respawnTimeout=0}

        pixelList.add(afterExplosion())
        

    
       });
       
    }

    
}
