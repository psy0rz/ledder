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
    static title = "RSS Headlines"
    static description = "scroller"
    public headlinesArray=[]
    public headLinesIndex=0
    public scrollcounter=0

    async runScroller(box: PixelBox, scheduler: Scheduler, controls: ControlGroup,x:number,y:number,width:number,height:number,headlinesJSON,showDescriptions=false)
    {
        let xOffset=10 //box.width()
        let headlineIndex=1
        const headlinesdisplayControl=controls.group("headlines display")
        let font=fontSelect(headlinesdisplayControl,"Headline scroller font",fonts.C64.name,0)
        font.load()
      
       
        let scrollList=new PixelList()
        box.add(scrollList)
        let headlinesArr=headlinesJSON
       
        const intervalControl = headlinesdisplayControl.value("headlines scroller interval", 1, 1, 10, 0.1)
        const colorSettingTitle=headlinesdisplayControl.color("Title text color", 128, 128, 200)
        const colorSettingDescription=headlinesdisplayControl.color("Description text color", 128, 128, 200)
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
           let titlePixelX=(headlineTitle.length*font.width)+16
           if (showDescriptions)
           {
                //show items and descriptions
                if (xOffset<(-1*(headlineTitle.length+headlineDescription.length)*font.width)){ headlineIndex++; xOffset=width+2}
                if (headlineIndex>headlinesArr.length-1) { headlineIndex=0;}
                scrollList.add(new DrawText(x+xOffset,y,font,headlineTitle.toUpperCase(),colorSettingTitle))
                scrollList.add(new DrawText(x+xOffset+font.width+titlePixelX,y,font,headlineDescription.toUpperCase(),colorSettingDescription))
                scrollList.crop(box)
           }
           else
           {
                //show titles only
                if (xOffset<(-1*(headlineTitle.length)*font.width)){ headlineIndex++; xOffset=width+2}
                if (headlineIndex>headlinesArr.length-1) { headlineIndex=0;}
                scrollList.add(new DrawText(x+xOffset,y,font,headlineTitle.toUpperCase(),colorSettingTitle))
                scrollList.crop(box)
           }
          
        });
    }

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup,x:number=0, y:number=Math.round((box.height()-8)/2),width:number=box.width(),height:number=box.height(),headlinesArray=[]) {
        const rssControl=controls.group("headlines")
        const rssfeedControl =rssControl.input("rssFeedUrl","https://www.hackerspace-drenthe.nl/feed/",true)
        const enableDescriptionControl=rssControl.switch("Show RSS feed descriptions",false,true)
        const FXControl=controls.group("FX")
        const enableFXFireControl=FXControl.switch("Enabled Fire FX",false,true)
        const enableFXStarsControl=FXControl.switch("Enabled Stars FX",false,true)
        if (enableDescriptionControl.enabled) { enableFXFireControl.enabled=false}
        
  
        this.headlinesArray=headlinesArray
        let init = true

        let headlinesPixelbox=new PixelBox(box)
        box.add(headlinesPixelbox)
        headlinesPixelbox.crop(box)

        const firebox=new PixelBox(headlinesPixelbox)
        firebox.crop(box)
        headlinesPixelbox.add(firebox)


        const starBox=new PixelBox(headlinesPixelbox)
        starBox.crop(box)
        headlinesPixelbox.add(starBox)

        const scrollerBox=new PixelBox(headlinesPixelbox)
        scrollerBox.crop(box)
        headlinesPixelbox.add(scrollerBox)

       
    



       
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
                  
                       
                    if (enableFXFireControl.enabled)
                    {
                        const flames=new Fire()
                        flames.run(firebox, scheduler,controls)
                    }

                    if (enableFXStarsControl.enabled)
                    {
                        const stars = new Starfield()
                        stars.run(starBox, scheduler, controls.group("stars"),)
                    }

                    const scroller=new Headlines()
                    scroller.runScroller(scrollerBox,scheduler, controls.group("headlines"), x,y,width,height, titles, enableDescriptionControl.enabled)

                    init = false
                }
            })
        }

       update()

        scheduler.interval(30*60, () => update())

    }
}
