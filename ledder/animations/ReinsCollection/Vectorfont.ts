import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import DrawLine from "../../draw/DrawLine.js"
import Animator from "../../Animator.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import Color from "../../Color.js"
import Pixel from "../../Pixel.js"
import {numberCheck, random} from "../../utils.js"
import {patternSelect} from "../../ColorPatterns.js"



/*onst ledderBM="
L....EEEE.DDD..DDD..EEEE.RRR.
L....E....D..D.D..D.E....R..R
L....EEE..D..D.D..D.EEE..RRR.
L....E....D..D.D..D.E....RR..
LLLL.EEEE.DDDD.DDDD.EEEE.R.R.
"*/

const ledderVL=[
    {
        'name':'L',
        'lines':[
            {'x1':0,'y1':0,'x2':0,'y2':4},
            {'x1':0,'y1':4,'x2':3,'y2':4},
        ],
        'transformation':{'rotate':90, 'translate':{'x':0,'y':0}, 'scale':2}
    },
    {
        'name':'E',
        'lines':[
            {'x1':0,'y1':0,'x2':0,'y2':4},
            {'x1':0,'y1':0,'x2':3,'y2':0},
            {'x1':0,'y1':2,'x2':3,'y2':2},
            {'x1':0,'y1':4,'x2':3,'y2':4},
        ],
        'transformation':{'rotate':90, 'translate':{'x':0,'y':0}, 'scale':2}
    },
    {
        'name':'D',
        'lines':[
            {'x1':0,'y1':0,'x2':0,'y2':4},
            {'x1':0,'y1':0,'x2':2,'y2':0},
            {'x1':0,'y1':4,'x2':2,'y2':4},
            {'x1':3,'y1':1,'x2':3,'y2':4},
        ],
        'transformation':{'rotate':90, 'translate':{'x':0,'y':0}, 'scale':2}
    },
    {
        'name':'R',
        'lines':[
            {'x1':0,'y1':0,'x2':0,'y2':4},  // |
            {'x1':0,'y1':0,'x2':3,'y2':0},  //-
            {'x1':0,'y1':2,'x2':3,'y2':2}, //-
            {'x1':0,'y1':3,'x2':3,'y2':4.1},  // \
            {'x1':3,'y1':0,'x2':3,'y2':2}, //|
        ],
        'transformation':{'rotate':90, 'translate':{'x':0,'y':0}, 'scale':2}
    },

]

class VectorTransformation {

    rotate:number
    translate:object
    scale:number

    constructor(transformation={'rotate':0,'translate':{'x':0,'y':0},'scale':1})
    {
        this.rotate=transformation.rotate
        this.translate=transformation.translate
        this.scale=transformation.scale
    }
}

class VectorLineTransformed {
    x1:number
    y1:number
    x2:number
    y2:number
   
    constructor(x1:number,y1:number,x2:number,y2:number)
    {
      this.x1=x1
      this.y1=y1
      this.x2=x2
      this.y2=y2
    }
}

class VectorLine {
    x1:number
    y1:number
    x2:number
    y2:number
    transformed:VectorLineTransformed

    constructor(x1:number,y1:number,x2:number,y2:number)
    {
      this.x1=x1
      this.y1=y1
      this.x2=x2
      this.y2=y2
    }
}

class VectorImage {
    name:String
    transformation: VectorTransformation
    lines=[]

    constructor(charname:String)
    {
        let data=ledderVL.find(({ name }) => name === charname)
        let dataObj=JSON.parse(JSON.stringify(data)) //make copy, no reference
        this.name=dataObj.name
        this.transformation=new VectorTransformation(dataObj.transformation)
        for (let i=0;i<dataObj.lines.length;i++)
        {
            let p=dataObj.lines[i]
            this.lines.push(new VectorLine(p.x1,p.y1,p.x2,p.y2))
        }
        this.transformation=new VectorTransformation()
        
    }

    transform()
    {

        if (this.transformation.rotate!=0)
        {
            this.rotate(this.transformation.rotate)
        }
        return this
    }

    scale(scale)
    {
        for (let s=0;s<this.lines.length;s++)
        {

        }
    }

    rotate(rotation)
    {

    }

    translate(x,y)
    {
        this.transformation.translate={'x':x,'y':y}

    }
}

class VectorComposition {
    x:number
    y:number
    pl:PixelList
    vectorImages=[]
   
   
   
     constructor()
     {
        this.pl=new PixelList();
        this.vectorImages=[]
     }


     init(x:number,y:number)
     {
        this.x=x; 
        this.y=y; 
        let text="LEDDER"
        let charWidth:number=4
        let charHeight=6
        let charSpaceAfter:number=1
        let charSpaceBelow=1
        let xOffset=0
        //get defs per character
        for (let i=0;i<text.length;i++)
        {
            let name=text[i]
            let vectorImage=new VectorImage(name)
            vectorImage.translate((i*(charWidth+charSpaceAfter))+x,y)
            this.vectorImages.push(vectorImage)
        }
        // console.log(this.vectorImages)
     }

   

     translateCharacter(obj:VectorImage,xOffset:number=0,yOffset:number=0)
     {
       obj.transformation.translate={x:xOffset,y:yOffset}
     }

     scaleCharacter(obj:VectorImage,scale:number)
     {
        obj.transformation.scale=scale
     }

     rotateCharacter(obj:VectorImage,rotation:number)
     {
        obj.transformation.rotate=rotation
     }

     

     

     show(color:Color)
     {
        this.pl.clear()
        for (let i=0;i<this.vectorImages.length;i++)
        {
            //console.log(this.vectorImages[i])
            let vector=this.vectorImages[i]
            let transformedVector=this.vectorImages[i].transform()
           
            for (let j=0; j<this.vectorImages[i].lines.length;j++)
            {
                let xOffset=this.vectorImages[i].transformation.translate.x
                let yOffset=this.vectorImages[i].transformation.translate.y
                let line=this.vectorImages[i].lines[j]

                this.pl.add(new DrawLine(line.x1+xOffset,line.y1+yOffset,line.x2+xOffset,line.y2+yOffset,color,color))
            }

        }
        return this.pl

       
     }
}

export default class Ledder extends Animator {
    static category = "Misc"
    static title = "vector"
    static description = "blabla"


    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup, x = 0, y = 0) {

        const dnaControls=controls.group("Dna")
        const dnaIntervalControl = dnaControls.value("Clock interval", 1, 1, 10, 0.1,true)
        const bufferControl = dnaControls.value("Buffer size", 1, 1, 64, 1,true)
        let framebuffer:PixelList=new PixelList()
        box.add(framebuffer)
        let ledderVector=new VectorComposition()
        ledderVector.init(3,1)
        framebuffer.add(ledderVector.show(new Color(255,0,0,1)))
        scheduler.intervalControlled(dnaIntervalControl, (frameNr) => {
             framebuffer.clear()
             framebuffer.add(ledderVector.show(new Color(frameNr%255,0,0,1)))
           // for (let u=0;u<ledderVector.vectorImages.length;u++)
           // {
               //ledderVector.vectors[u].lines=ledderVector.rotateCharacter(ledderVector.vectors[u],(frameNr/10)%360,0.5)
           // }
           
        })
        

    }
}
