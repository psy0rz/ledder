import PixelBox from "../../PixelBox.js"
import PixelList from "../../PixelList.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import {fonts, fontSelect} from "../../fonts.js"
import DrawCounter from "../../draw/DrawCounter.js"
import DrawText from "../../draw/DrawText.js"
import Fire from "../Fires/Fire.js"
import Starfield from "../Components/Starfield.js"
import Animator from "../../Animator.js"
import {getRssFeedData} from "../../hsdfeed.js"
import FxMovie from "../../fx/FxMovie.js"
import FxRotate from "../../fx/FxRotate.js"
import Color from "../../Color.js"


export default class Headlines extends Animator {
    static category = "Misc"
    static title = "RSS HEadlines"
    static description = "scroller"
    public headlinesArray=[]
    public headLinesIndex=0
    public scrollcounter=0

    async runScroller(box: PixelBox, scheduler: Scheduler, controls: ControlGroup,x:number,y:number,headlinesJSON)
    {
        let xOffset=10 //box.width()
        let headlineIndex=0
        let font=fonts.C64
        font.load()
      
       
        let scrollList=new PixelList()
        box.add(scrollList)
        let headlinesArr=JSON.parse(headlinesJSON)
        //box.add(new DrawText(0,8,font,"NEWSFEED",new Color(255,255,255,1)))
       
        const intervalControl = controls.value("headlines scroller interval", 1, 1, 10, 0.1)
        console.log("runscroller data: ",headlinesArr)
        scheduler.intervalControlled(intervalControl, (frameNr) => {
           
           scrollList.clear()
            xOffset=xOffset-0.3
            let headlineTitle=headlinesArr[headlineIndex]
            if (xOffset<(-1*headlineTitle.length*font.width)){ headlineIndex++; xOffset=box.width()+2}
            if (headlineIndex>headlinesArr.length-1) { headlineIndex=0;}
            scrollList.add(new DrawText(x+xOffset,y,font,headlineTitle,new Color(255,255,255,1)))
           
        });
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup,headlinesArray=[]) {
        console.log("headlinesArray=",headlinesArray)
      
        this.headlinesArray=headlinesArray
        let init = true
        let counter



        fonts.C64.load()

        const firebox=new PixelBox(box)
        //firebox.xMin=5
        //firebox.xMax=20
        box.add(firebox)

        const starBox=new PixelBox(box)
        box.add(starBox)

        counter = new DrawCounter()
        box.add(counter)

       
        let stopped=false
        scheduler.onCleanup(()=>{
            stopped=true
        })

        function update() {

            getRssFeedData("HSDNEWS",  (symbol, headlinesArray) => {

                if (stopped)
                    return

                if (init) {

                       

                    const scroller=new Headlines()
                        scroller.runScroller(box,scheduler, controls, 0,0, headlinesArray)
                       
                   
                        const flames=new Fire()
                        flames.run(firebox, scheduler,controls)
                
                    

                        const stars = new Starfield()
                        stars.run(starBox, scheduler, controls.group("stars"))

                       

                    //counter.update(~~first)
                    // counter.update(0)
                    init = false
                }

                //counter.update(~~last)
                // counter.update(100)
            })
        }

       update()

        scheduler.interval(30*60, () => update())

    }
}
