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
        let headlineIndex=1
        let font=fontSelect(controls,"Rss scroller font",fonts.C64.name,0)
        font.load()
      
       
        let scrollList=new PixelList()
        box.add(scrollList)
        let headlinesArr=headlinesJSON
        const rssfeedControl =controls.input("rssFeedUrl","https://www.hackerspace-drenthe.nl/feed/",true)
        const enableDescriptionControl=controls.switch("Show RSS feed descriptions",false,true)
        const intervalControl = controls.value("headlines scroller interval", 1, 1, 10, 0.1)
        const colorSettingTitle=controls.color("Title text color", 128, 128, 200)
        const colorSettingDescription=controls.color("Description text color", 128, 128, 200)
        const enableFXFireControl=controls.switch("Enabled Fire FX",false,true)
        const enableFXStarsControl=controls.switch("Enabled Stars FX",false,true)
        scheduler.intervalControlled(intervalControl, (frameNr) => {
           
            let headlineTitle=""
            let headlineDescription=""
           scrollList.clear()
           xOffset=xOffset-1
           //console.log("headlinesarr:",headlinesArr)
           if (headlinesArr.length>0)
           {
            
            //console.log("headlines",headlinesArr)
            headlineTitle=headlinesArr[headlineIndex].title[0].toString()
            headlineDescription=headlinesArr[headlineIndex].description[0].toString()
           }
           else
           {
            headlineTitle="RSS HEADLINES"
            headlineDescription="loading..."
           }
           let titlePixelX=headlineTitle.length*font.width
           if (enableDescriptionControl.enabled)
           {
                //show items and descriptions
                if (xOffset<(-1*(headlineTitle.length+headlineDescription.length)*font.width)){ headlineIndex++; xOffset=box.width()+2}
                if (headlineIndex>headlinesArr.length-1) { headlineIndex=0;}
                scrollList.add(new DrawText(x+xOffset,y,font,headlineTitle,colorSettingTitle))
                scrollList.add(new DrawText(x+xOffset+font.width+titlePixelX,y,font,headlineDescription,colorSettingDescription))
           }
           else
           {
                //show titles only
                if (xOffset<(-1*(headlineTitle.length)*font.width)){ headlineIndex++; xOffset=box.width()+2}
                if (headlineIndex>headlinesArr.length-1) { headlineIndex=0;}
                scrollList.add(new DrawText(x+xOffset,y,font,headlineTitle,colorSettingTitle))

           }
          
        });
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup,headlinesArray=[]) {
        const rssfeedControl =controls.input("rssFeedUrl","https://www.hackerspace-drenthe.nl/feed/",true)
        const enableDescriptionControl=controls.switch("Show RSS feed descriptions",false,true)
        const intervalControl = controls.value("headlines scroller interval", 1, 1, 10, 0.1)
        const colorSettingTitle=controls.color("Title text color", 128, 128, 200)
        const colorSettingDescription=controls.color("Description text color", 128, 128, 200)
        const enableFXFireControl=controls.switch("Enabled Fire FX",false,true)
        const enableFXStarsControl=controls.switch("Enabled Stars FX",false,true)
        
  
        this.headlinesArray=headlinesArray
        let init = true

        const firebox=new PixelBox(box)
        //firebox.xMin=5
        //firebox.xMax=20
        box.add(firebox)

        const starBox=new PixelBox(box)
        box.add(starBox)

        const scrollerBox=new PixelBox(box)
        box.add(scrollerBox)

       
        let stopped=false
        scheduler.onCleanup(()=>{
            stopped=true
        })

        function update() {

            let rssFeedUrlStr=rssfeedControl.text
            getRssFeedData(rssFeedUrlStr,(rssFeedUrl, titles) => {

                if (stopped)
                    return

                if (init) {
                    const scroller=new Headlines()
                    scroller.runScroller(scrollerBox,scheduler, controls, 0,0, titles)
                       
                    if (enableFXFireControl.enabled)
                    {
                        const flames=new Fire()
                        flames.run(firebox, scheduler,controls)
                    }

                    if (enableFXStarsControl.enabled)
                    {
                        const stars = new Starfield()
                        stars.run(starBox, scheduler, controls.group("stars"))
                    }
                    init = false
                }
            })
        }

       update()

        scheduler.interval(30*60, () => update())

    }
}
