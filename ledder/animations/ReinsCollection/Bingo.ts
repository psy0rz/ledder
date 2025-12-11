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



export class Bingo
{
    lowest:number=1
    highest:number=64
    numbersTodo:number[]
    numbersDone:number[]
    drawDelay:number=10
    counter:number

    constructor()
    {
        this.numbersTodo=[]
        this.numbersDone=[]
        this.drawDelay=10
        this.counter=0
        for (let i=this.lowest;i<this.highest+1;i++)
        {
            this.numbersTodo.push(i)
        }
    }

    drawNumber()
    {
        let numbersTodoCount=this.numbersTodo.length
        if (numbersTodoCount>0)
        {
            let randomIndex=Math.round(Math.random()*numbersTodoCount)
            let randomNumber=this.numbersTodo.splice(randomIndex,1)
            this.numbersDone.push(randomNumber.shift())
            this.counter=0;
            
        }
    }

    setDrawDelay(seconds:number)
    {
        this.drawDelay=seconds
    }

    getLastNumber()
    {
        let numbersDoneCount=this.numbersDone.length
        return this.numbersDone[numbersDoneCount-1].toString()
    }

    render(box)
    {
        this.counter++
        if (this.counter>this.drawDelay) { this.drawNumber()}
        let font=fonts["C64 mono"]
        font.load()
        let pl=new PixelList();
        pl.add(new DrawText(box.width()/2-8,(box.height()-8)/2,font,this.getLastNumber(),new Color(128,128,128,1)))
        let delayBarWidth=(box.width()/this.drawDelay)*this.counter
        for (let d=0;d<delayBarWidth;d++)
        {
            pl.add(new Pixel(d,box.height()-1,new Color(0,255,0,1)))
        }
        // console.log(this.counter,this.drawDelay,delayBarWidth)
        return pl

    }

}

export default class Slotmachine extends Animator {

    static category = "Basic"
    static title = "Slotmachine"
    static description = "fruitautomaat"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const appControl=controls.group("Snow",true)
        const secondsBetweenNumbers = appControl.value("Delay (seconds)",30, 1, 120, 1)
      
       
        const canvas=new PixelList()
        box.add(canvas)

            
      let bingo=new Bingo()
      bingo.setDrawDelay(secondsBetweenNumbers.value*10)
      bingo.drawNumber();
      scheduler.setFrameTimeuS(100000)
       scheduler.interval(1, (frameNr) => {
       
            canvas.clear();
            canvas.add(bingo.render(box))
            canvas.crop(box)
        })


       
    }
}
