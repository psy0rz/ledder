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

const imgBar=          `...........
                        ww..www.www
                        w.w.w.w.w.w
                        ww..www.www
                        w.w.w.w.ww.
                        w.w.w.w.w.w
                        ww..w.w.w.w
                        ...........`

const imgCherry=       `...........
                        .......g...
                        ......gg...
                        ....gg.g...
                        .rrg...grr.
                        rrrr...rrrr
                        rrrr...rrrr
                        .rr.....rr.`

const imgLemon =       `...........
                        ...........
                        ....yyyg...
                        ..yyyyyyy..
                        .yyyyyyyyy.
                        .yyyyyyyyy.
                        ..yyyyyyy..
                        ....yyy....`

const imgSeven =       `...........
                        ..yyyyyyy..
                        .......y...
                        ......y....
                        .....y.....
                        ....y......
                        ...y.......
                        ..y........`

const imgGrape =       `...........
                        ...........
                        ....bb.....
                        ....bb.....
                        ..bb..bb...
                        ..bb..bb...
                        .bb.bb.bb..
                        .bb.bb.bb..`

const imgHSD =         `...........
                        rrr.rrr.rrr
                        rrr.rrr.rrr
                        .rrrrrrrrr.
                        .rrrrrrrrr.
                        .rrr...rrr.
                        .rrr...rrr.
                        rrrr...rrrr`

const imgIC =         `...........
                       .y.y.y.y.y.
                       y555555555y
                       .500000005.
                       y500000005y
                       .500000005.
                       y555555555y
                       .y.y.y.y.y.`

const slotImages=[]

slotImages.push( imgBar)
slotImages.push( imgCherry)
slotImages.push( imgLemon)
slotImages.push( imgSeven)
slotImages.push( imgGrape)
slotImages.push( imgHSD)
slotImages.push( imgIC)
             


export class FruitautomaatReel{

    pixellist:PixelList
    selectedItem:number
    slots:number[]
    speed:number
    status:number
    yOffset:number

    constructor(reelLength:number)
    {
        this.selectedItem=0;
        this.pixellist=new PixelList();
        this.slots=[]
        this.speed=0
        this.status=0
        this.yOffset=0
        let imageCount=slotImages.length
        let y=0
        for (let r=0;r<reelLength;r++)
        {
            let randomIndex=Math.round(Math.random()*(imageCount-1))
            this.slots.push(randomIndex)
            let slot=slotImages[randomIndex]
            
            let imgPl=new PixelList();
            imgPl.add(new DrawAsciiArtColor(0,y,slot))
            this.pixellist.add(imgPl)
            y=y+8
        }
    }
    


    render(reelIndex:number)
    {
        let xOffset=1+(reelIndex*14)
        if (this.yOffset>this.slots.length*8){ this.yOffset=0}
        let subPl=this.pixellist.copy()
        subPl.move(xOffset,-1*this.yOffset)
        return subPl
    }
}


export class Fruitautomaat{
    reels:FruitautomaatReel[]
    status:number
    score:number
    pixellist:PixelList
    timer=0

    constructor(reelCount)
    {
        this.init(reelCount)
    }

    init(reelCount) {
        this.score = 0
        this.status=0
        this.reels=[]
        this.timer=0
        this.pixellist=new PixelList();
        for (let r=0;r<reelCount;r++)
        {
            let reel=new FruitautomaatReel(10)
            this.reels.push(reel)
        }
        
    }

    update()
    {
        if (this.status<1)
        {
            this.status=1
            for (let r=0;r<this.reels.length;r++)
            {
                this.reels[r].speed=this.reels[r].slots.length
            }
        }

        if (this.status==1)
        {
            for (let r=0;r<this.reels.length;r++)
            {
                this.reels[r].yOffset+=this.reels[r].speed
                if (r==0 || (r>0 && this.reels[r-1].speed<1))
                {
                    this.reels[r].speed= this.reels[r].speed-0.1
                }
                if (this.reels[r].speed<0)
                {
                    this.reels[r].speed=0
                    this.reels[r].yOffset= Math.round(this.reels[r].yOffset/8)*8
                }
            }
            if (this.reels[this.reels.length-1].speed==0)
            {
                this.timer=0
                this.status=2
            }

          
        }
        if (this.status>1)
        {
            this.timer++
            if (this.timer>100) { this.timer=0;  this.status=0; this.init(this.reels.length)}
        }
    }

    render()
    {
        this.pixellist.clear()
        for (let r=0;r<this.reels.length;r++)
        {
            this.pixellist.add(this.reels[r].render(r))
        }
        this.update()
        return this.pixellist
    }





   
}

export default class Slotmachine extends Animator {

    static category = "Basic"
    static title = "Slotmachine"
    static description = "fruitautomaat"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const appControl=controls.group("Snow",true)
        const intervalControl = appControl.value("Animation interval", 1, 1, 10, 0.1)
      
       
        const canvas=new PixelList()
        box.add(canvas)

            
      let fruitmachine=new Fruitautomaat(3)

       scheduler.intervalControlled(intervalControl, (frameNr) => {
       
            canvas.clear();
            canvas.add(fruitmachine.render())
            canvas.centerH(box)
            canvas.crop(box)
        })


       
    }
}
