import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"


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


export default class Planets extends Animator {
    static category = "Ledart"
    static title = "planetarium"
    static description = "planetarium"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
        const countControl = 100
        const speedControl = controls.value("speed", 10, 1, 100, 1)
        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        let pixelList=new PixelList()
        box.add(pixelList)
      
      let time=0;
      
        

       scheduler.intervalControlled(intervalControl, (frameNr) => {
        pixelList.clear()
        time=time+speedControl.value;
        let centerX=box.xMax/2
        let centerY=box.yMax/2

        let sunX=centerX
        let sunY=centerY

        let earthOrbit=0.6
        let earthTimescale=365
        let earthX=Math.sin(time/earthTimescale)*(centerX*earthOrbit)+centerX
        let earthY=Math.cos(time/earthTimescale)*(centerY*earthOrbit)+centerY

        let moonOrbit=0.6
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

        let jupiterMoonOrbit=1.3
        let jupiterMoonTimescale=100
        let jupiterMoon1X=Math.sin(90+(time/jupiterMoonTimescale))*(3)+jupiterX+3
        let jupiterMoon1Y=Math.cos(90+(time/jupiterMoonTimescale))*(3)+jupiterY+2

        let jupiterMoon2X=Math.sin(0+(time/jupiterMoonTimescale))*(3)+jupiterX+3
        let jupiterMoon2Y=Math.cos(0+(time/jupiterMoonTimescale))*(3)+jupiterY+2

        pixelList.add(new DrawAsciiArtColor(sunX-3,sunY-1,  sun))
       
        
        pixelList.add(new DrawAsciiArtColor(marsX,marsY,  mars))
        pixelList.add(new DrawAsciiArtColor(venusX,venusY,  venus))
        pixelList.add(new DrawAsciiArtColor(jupiterX,jupiterY,  jupiter))
        pixelList.add(new DrawAsciiArtColor(jupiterMoon1X,jupiterMoon1Y,  moon))
        pixelList.add(new DrawAsciiArtColor(jupiterMoon2X,jupiterMoon2Y,  moon))
        pixelList.add(new DrawAsciiArtColor(saturnusX,saturnusY,  saturnus))
        pixelList.add(new DrawAsciiArtColor(earthX,earthY,  earth))
        pixelList.add(new DrawAsciiArtColor(moonX,moonY, moon))

    
       });
       
    }

    
}
