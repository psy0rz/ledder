import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"
import DrawRectangle from "../../draw/DrawRectangle.js"



const playerImg = `
..................
..................
wwwwwwwwww........
wwwwwwwwwwrrrr....
wwwwwwwwwwrr.rr...
wwwwwwwwwwrr..rrrr
wwwwwwwwwwrrrrrrrr
rr00rrrrrrrrrr00rr
.0550........0550.
..00..........00..
`

const AirImg = `
....................................................................................................................................................................................
.......wwwww..................................wwwwwwwwww..........wwwww...............wwwww.............yyy............wwwwwwwwww.............................wwwwww................
......wwwwwwwww.............................wwwwwwwwwwwwwwwwwwwwwwwwwwwww.........wwwwwwwwwwwww........yyyyy........wwwwwwwwwwwwwwwwwwwwwww................wwwwwwwwwwww.............
.....wwwwwwwwwwwww.......wwwwww.........wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww....wwwwwwwwwwwwwwwwwwww....yyy.......wwwwwwwwwwwwwwwwwwwwwwwwwwwwww...wwwwwwwwwwwwwwwwwwwwww...........
....wwwwwwwwwwwwwwwwwwwwwwwwwwww......wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww..........wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww.........
....................................................................................................................................................................................
....................................................................................................................................................................................
....................................................................................................................................................................................
`



const TreeImg=`
....gg.gg....
..g.ggorg.g..
.gorggogggog.
.ggoggogrogg.
..ggorogogg..
...ggooogg...
.....ooo.....
.....ooo.....
`

const TreeSmallAlt1Img=`
..ggg..
.ggggg.
..gog..
...g...
...o...
`

const TreeSmallAlt2Img=`
...g...
..ggg.
..ggg.
.ggogg.
...o...
`

const FenceSmallImg=`
...........
...........
...........
55555555555
...........
`

const FenceLargeImg=`
............
555555555555
5..........5
5..........5
`



const GrassImg=`
...............
...............
...............
...............
...............
...............
..g........g..g
g.g.gg.g.g.g.gg
ggggggggggggggg

`

const CowImg=`
..........
.b........
www.......
..www5ww..
...wwww...
...w..w...
`

const BikeImg=`
...rrr....
..ww5r....
... bb....
.wwbbbww..
w..wbw..w.
.ww...ww..
`

const SheepImg=`
..................
..www.............
....wwwwwww.......
.....wwwww........
.....w...w........
..................
`

const GrassAlt1Img=`
................g.
.g.gg.g..g.gg..ggg
gggggggggggggggggg
`


const HouseLargeImg=`
....5555.... 
...550055...
..55500555..
.5555555555.
.5005550055.
.5005550055.
.5005555555.
gggggggggggg
`

const ChurchLargeImg=`
..r......... 
.rrr........
.5y5........
.555........
.555..55555.
.505.5y5y5y5.
.50555555555.
gg0g5gggg5gg
`

const WindmillLargeImg=`
.....w..... 
.....w.....
.....w.....
.wwww0wwww.
...oowoo...
..ooowooo..
..ooowooo..
..oooo00o..
..o0ooooo..
`

const HouseSmallAlt1Img=`
..55...
.5005..
555555.
505005.
505555
`

const HouseSmallAlt2Img=`
..55...
.5005..
555555.
500505.
555505.
`

const HectometerPaalImg=`
...............
5.g5g.5.g5..5..
ttt5ttatttaaaaa
555555555555555
`


export default class Landscapescroller extends Animator {
    static category = "Gamesdemos"
    static title = "Landscapescroller"
    static description = "Just because"
    mapWidth:number=1024
    farBackgroundMap:PixelList=new PixelList()
    closeBackgroundMap:PixelList=new PixelList()
    farForegroundMap:PixelList=new PixelList()
    closeForegroundMap:PixelList=new PixelList()
    mainBox:PixelBox

    timedividerFarBackground=200
    timedividerCloseBackground=30
    timedividerFarForeground=20
    timedividerCloseForeground=10

    setMainBox(mybox)
    {
        this.mainBox=mybox;
    }


    

    createCloseBackgroundMap(width,height)
    {
       
        let objectCount=width/4
        let pl=new PixelList();
        for (let i=0;i<objectCount;i++)
        {
            let rand=Math.round(Math.random()*10)
            let randX=Math.round(Math.random()*width)
            let halfheight=this.mainBox.height()/2
            let randY=halfheight-1-(Math.sin(i))
            switch(rand)
            {
                case 0: pl.add(new DrawAsciiArtColor(randX,randY,TreeSmallAlt1Img)); break
                case 1: pl.add(new DrawAsciiArtColor(randX,randY,HouseSmallAlt1Img)); break
                case 2: pl.add(new DrawAsciiArtColor(randX,randY,HouseSmallAlt2Img)); break
                case 3: pl.add(new DrawAsciiArtColor(randX,randY,TreeSmallAlt2Img+1)); break
                case 4: pl.add(new DrawAsciiArtColor(randX,randY,TreeSmallAlt2Img+2)); break
                case 5: pl.add(new DrawAsciiArtColor(randX,randY,FenceSmallImg+2)); break
                //case 6: pl.add(new DrawAsciiArtColor(randX,randY-4,MountainImg)); break;
               
               
            }
        }
        this.closeBackgroundMap=pl
    }

    createFarBackgroundMap(width,height)
    {
       
        let objectCount=width/10
        let pl=new PixelList();
        for (let i=0;i<objectCount;i++)
        {
            let rand=Math.round(Math.random()*10)
            let randX=Math.round(Math.random()*width)
            let halfheight=this.mainBox.height()/2
            let randY=0
            switch(rand)
            {
                //case 0: pl.add(new DrawAsciiArtColor(randX,randY,MountainImg)); break;
                //case 1: pl.add(new DrawAsciiArtColor(randX,randY,MountainImg)); break
                //case 2: pl.add(new DrawAsciiArtColor(randX,randY,MountainImg)); break
              
               
            }
        }
        this.farBackgroundMap=pl
    }

    createFarForegroundMap(width,height)
    {
     
        let objectCount=width/10
        let pl=new PixelList();
        for (let i=0;i<objectCount;i++)
        {
            let rand=Math.round(Math.random()*60)
            let randX=Math.round(Math.random()*width)
            let halfheight=this.mainBox.height()/2
            let randY=Math.round(halfheight+(Math.random()*halfheight/4))
            switch(rand)
            {
               
                case 0: pl.add(new DrawAsciiArtColor(randX,randY,GrassAlt1Img)); break
                case 1: pl.add(new DrawAsciiArtColor(randX,randY,GrassAlt1Img)); break
                case 2: pl.add(new DrawAsciiArtColor(randX,randY,HouseLargeImg)); break
                case 3: pl.add(new DrawAsciiArtColor(randX,randY,TreeImg)); break
                case 4: pl.add(new DrawAsciiArtColor(randX,randY,FenceLargeImg)); break
                case 8: pl.add(new DrawAsciiArtColor(randX,randY,ChurchLargeImg)); break
                case 9: pl.add(new DrawAsciiArtColor(randX,randY,TreeImg)); break
                case 10: pl.add(new DrawAsciiArtColor(randX,randY,TreeImg)); break
                case 11: pl.add(new DrawAsciiArtColor(randX,randY,TreeImg)); break
                case 12: pl.add(new DrawAsciiArtColor(randX,randY,TreeImg)); break
                case 12: pl.add(new DrawAsciiArtColor(randX,randY,TreeImg)); break
                case 13: pl.add(new DrawAsciiArtColor(randX,randY,WindmillLargeImg)); break
                default: pl.add(new DrawAsciiArtColor(randX,randY,GrassImg)); break
            }
        }

        for (let i=0;i<width;i=i+8)
        {
            pl.add(new DrawAsciiArtColor(i,this.mainBox.height()-4,HectometerPaalImg));
        }
        this.farForegroundMap=pl
    }


    createCloseForegroundMap(width,height)
    {
     
        let objectCount=width/10
        let pl=new PixelList();
        for (let i=0;i<objectCount;i++)
        {
            let rand=Math.round(Math.random()*20)
            let randX=Math.round(Math.random()*width)
            let halfheight=this.mainBox.height()/2
            let randY=Math.min(this.mainBox.height()-5,Math.round(halfheight+4+(Math.random()*(halfheight/2))-4))
            switch(rand)
            {
               
                case 0: pl.add(new DrawAsciiArtColor(randX,randY,GrassAlt1Img)); break
                case 1: pl.add(new DrawAsciiArtColor(randX,randY,BikeImg)); break
                case 5: pl.add(new DrawAsciiArtColor(randX,randY,GrassImg)); break
                case 6: pl.add(new DrawAsciiArtColor(randX,randY,CowImg)); break
                case 7: pl.add(new DrawAsciiArtColor(randX,randY,SheepImg)); break
                case 15: pl.add(new DrawAsciiArtColor(randX,randY,GrassImg)); break
                default: pl.add(new DrawAsciiArtColor(randX,randY,GrassImg)); break
            }
        }
        this.closeForegroundMap=pl
    }
    

        drawPlayer()
        {
            let x=0 //(this.mainBox.width()-7)/2
            let y=this.mainBox.height()-10 //(this.mainBox.height()-7)/2
            let plVisor=new PixelList();
            //plVisor.add(new DrawAsciiArtColor(x,y,playerImg))
            return plVisor

        }

        drawBackgroundColors()
        {
            let half=Math.round(this.mainBox.height()/2)
            let pl=new PixelList()
            for (let l=0;l<(half/2)+1;l++)
            {
                for (let x=0;x<this.mainBox.width();x++)
                {
                    pl.add(new Pixel(x,l,new Color(0,0,100)))
                }
            }
            for (let l=(half/2)+1;l<this.mainBox.height()+1;l++)
            {
                for (let x=0;x<this.mainBox.width();x++)
                {
                    pl.add(new Pixel(x,l,new Color(50,90,0)))
                }
            }
            pl.crop(this.mainBox)
            return pl
        }

        drawCloseBackground(x)
        {
            x=((x/this.timedividerCloseBackground)%360)
            let pl=this.closeBackgroundMap.copy(true)
            pl.move(-1*x%this.mapWidth,0)
            pl.crop(this.mainBox)
            return pl
        }

        drawFarBackground(x)
        {
            x=((x/this.timedividerFarBackground)%180)*-1
            let w=180
            let y=0
            let plAir=new PixelList()
            plAir.add(new DrawAsciiArtColor(x-180,y, AirImg))
            plAir.add(new DrawAsciiArtColor(x,y-1, AirImg))
            plAir.add(new DrawAsciiArtColor(x+180,y, AirImg))
            //plAir.crop(this.mainBox)
            return plAir
        }

        drawCloseForeground(x)
        {
            let pl=this.closeForegroundMap.copy(true)
            pl.move(-1*(x/this.timedividerCloseForeground)%this.mapWidth,0)
            pl.crop(this.mainBox)
            return pl
        }

        drawFarForeground(x)
        {
            let pl=this.farForegroundMap.copy(true)
            pl.move(-1*(x/this.timedividerFarForeground)%this.mapWidth,0)
            pl.crop(this.mainBox)
            return pl
        }

        

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
    
        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        let groundlist=new PixelList()
        let playerlist=new PixelList();
      
        let time=0  
        this.setMainBox(box)
        box.setColor(new Color(0,200,0,1)) 
      
        this.createFarBackgroundMap(this.mapWidth,box.height()/2)
        this.createCloseBackgroundMap(this.mapWidth,box.height()/2)
        this.createFarForegroundMap(this.mapWidth,box.height()/2)
        this.createCloseForegroundMap(this.mapWidth,box.height()/2)


       scheduler.intervalControlled(intervalControl, (frameNr) => {
           
            time++
            this.setMainBox(box)
            box.clear()
           

            box.add(groundlist)
            groundlist.clear()
            groundlist.add(this.drawBackgroundColors())
            groundlist.add(this.drawFarBackground(time))
            groundlist.add(this.drawCloseBackground(time))
            groundlist.add(this.drawFarForeground(time))
            groundlist.add(this.drawCloseForeground(time))

            box.add(playerlist);
            playerlist.clear()
            playerlist.add(this.drawPlayer())
            box.crop(box)

       
       });

      
       
    }

    
}
