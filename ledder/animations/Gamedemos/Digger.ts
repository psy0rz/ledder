import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"




const playerImg = `
wwww.......
w55b5......
5555.......
rrrrrr.....
rrr........
bbb........
bb.........
oooo.......
`

const playerFallImg = `
.....rrrr.....
..rrrrrrrrrr..
.rrrrrrrrrrrr.
.......5......
.......5......
wwww...5......
w55b5..5......
5555...5......
rrrrrr55......
rrr...........
bbb...........
bb............
oooo..........
`

const playerHak1Img = `
wwww........
w55b5.......
5555........
rrrrrr5yyyw.
rrr....y....
bbb.........
bb..........
oooo........
`

const playerHak2Img = `
wwww........
w55b5.......
5555........
rrrrrrr5yyyr
rrr.....y...
bbb.........
bb..........
oooo........
`

const playerGraaf1Img = `
wwww.......
w55b5......
5555.......
rrrrrr.y...
rrr....y...
bbb....y...
bb.....y...
oooo...w...
...........
`

const playerGraaf2Img = `
wwww.......
w55b5......
5555.......
rrrrrr.....
rrr...ry...
bbb....y...
bb.....y...
oooo...y...
.......r...
`



const ground =`
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbwwwwwwbbbbbbbbbbwwwwwwwwbbbbbbyyybbbbbbbbbbbbbbbbbbbbbbbbwwwwwwwwwwwwwbbbbbbbbbbbbbwwwwbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbwwwwwwwwwbbbbbbwwwwwwwwwwwwbbbyyyyybbbbbbbbbbbbbbbbbbbbbbwwwwwwwwwwwwwwwwwbbbbbbbbbbwwwwwwwbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbwwwwwwwwwwbbbwwwwwwwwwwwwwwbbyyyyybbbbbbbbbbbbbbbbbbbbbbwwwwwwwbbwwwwwwwwwbbbbbbbbwwwwwwwwwwbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbyyybbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbgggbgggbgggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbgggoggogggoggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbggggogoggogggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbggggoogogggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbgggooogggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbbbbbbooobbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
b5bbb5bbbbbbbbbbbbbbooobbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
b55555bbbbbbbbbbbbbbooobbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
t5...5bbtttttttttttttttttttttttttttttaaaaaaaaaaaaaatttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt
.5...5..5555555555555555555555555555555aaaaaaaaaa55555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555
.55555..oooooooooooooooooooooooooooooooooaaoooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
.5...5..ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt
.5...5....ooooooooooooooooooooooooooooooo................................................................................oooooooooooooooooooo
.55555......ttttttttttttttttttttttttt......................................................................................oooooooooooooooooo
.5...5.......................................................................................................................oooooooooooooooo
.5...5..........................................................................................................................ooooooooooooo
.55555..........................................................................................................................ooooooooooooo
.5...5...........................................................................................................................oooooooooooo
.5...5.............................................................................................................................oooooooooo
.55555...............................................................................................................................oooooooo
.5...5...........................................tttttttttttoooooooooooooooooooooooooooooooooooooooooottt.............................ooooooo
.5...5.......ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo.........................oooooo
oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo............oo...........oooooo
ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt.............oo.............oooo
`








export default class Digger extends Animator {
    static category = "Gamesdemos"
    static title = "Digger"
    static description = "inspired by the vic-20 game"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
    
        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        let groundlist=new PixelList()
        let playerlist=new PixelList();
        //let shootinglist=new PixelList();
        let time=0  
        box.setColor(new Color(0,200,0,1)) 
        box.add(groundlist)
        box.add(playerlist);
      
   
        function playerStand(counter)
        {
            return new DrawAsciiArtColor(8,2,  playerImg)
        }

        function playerVal(counter)
        {
            return new DrawAsciiArtColor(8,(box.height()-10)/2+Math.sin(counter/30)*2,  playerFallImg)
        }

        function playerGraaf(counter)
        {
            if (counter%20<10)
            {
                return new DrawAsciiArtColor(8,2,  playerGraaf1Img)
            }
            else
            {
                return new DrawAsciiArtColor(8,2,  playerGraaf2Img)
            }
        }

        function playerHak(counter)
        {

            if (counter%20<10)
            {
                return new DrawAsciiArtColor(8,2,  playerHak1Img)
            }
            else
            {
                return new DrawAsciiArtColor(8,2,  playerHak2Img)
            }
        }
        

       scheduler.intervalControlled(intervalControl, (frameNr) => {
        time=time+0.5
        groundlist.clear()
        playerlist.clear()
        let bglength=30
        let groundy=Math.round((time)/10)%bglength
        //groundlist.add(new DrawAsciiArtColor(0,1-groundy,  ground))
        if (time<160)
        {
            groundlist.add(new DrawAsciiArtColor(8,1-(time/10),  ground))
            playerlist.add(playerVal(time))

        }

        if (time>160 && time<200)
        {
            groundlist.add(new DrawAsciiArtColor(8,-16,  ground))
            playerlist.add(playerStand(time))

        }

        if (time>200 && time<1000)
        {
            groundlist.add(new DrawAsciiArtColor(1-(time-200)/10,-16,  ground))
            playerlist.add(playerHak(time))
        }

        if (time>1000 && time<1200)
        {
            groundlist.add(new DrawAsciiArtColor(-80,-16-((time-1000)/10),  ground))
            playerlist.add(playerGraaf(time))
        }

        if (time>1200) {time=0}
        //shootinglist.add( new Pixel(((time)%100)+6,box.height()/2-3,new Color(128,128,128,1)))
        //shootinglist.add( new Pixel(((time)%100)+6,box.height()/2+3,new Color(128,128,128,1)))
       });

      
       
    }

    
}
