import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import FxMovie from "../../fx/FxMovie.js"
import Color from "../../Color.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"




const plane = `
...5w5....
....w5....
.w..ww5...
wwwwwrrww.
.w..ww5...
....w5....
...5w5....
`



const ground =`gggggggggggggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgggggggggggggggggggggggggggggggggggggggggggg
ggggggggggggggwbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbggggggggggggggggggggggggggggggggggggggg
ggggggggggggggggggggggggggggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgggggggggggggggggggggggggggbbbbbbbggggggggggggggggggggggggggggggggg
ggggggggggggggggggggggggggggggggggggggggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgggggggggggggggggggggggggggggggggggggggbbbbbggggggggggggggggggggggggggggg
gggggggggggggggggggggggggggggggggggggggggggggggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbggggbbbbbbbggggggggggggggggggggggggggggggggggggggggggggggggbbbbbbbgggggggggggggggggggggggg
ggg55555555555555555555555555555gggggggggggggggggggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgbbbbbgggggggggggggggggggrgggggggggggggggggggggggggggggggggggggggbbbbbbbgggggggggggggggggggg
ggg55555555555555555555555555555gggggggggggggggggggggggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgggggggggggggggggggggggggggbbbbbbggggggbbgggggggggggggggggggggggggwgggggggggggggggggggggggggggggggggggggbbbgggggggggggggggggggggggggg
ggg55555555555555555555555555555ggggggggggggggggggggggggbbbbbbbbbbbbbbbbbbbbbbbgggggggbbbbbbbgggggggggggggggbbbbbbggggggggggggbbggggggggggggggggggggggrwgwrggggggggggggggggggggggggggggggggbbbbbggggggggggggggggggggggggggg
ggg55ww55ww55ww55ww55ww55ww55ww5gggggggggggggggggggggggggggbbbbbbbbbbbbbbbbggggggggggggggggggbbbbbbbbbbbbbbbbggggggggggggggggggbbgggggggggggggggggggggggwgggggggggggggggggg5555555gggggggggggbbbbbbgggggggggggggggggggggggg
ggg55555555555555555555555555555ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggbbggggggggggggggggggggggrggggggggggggggg5555555555555555555555555gggggggggggggggggggggggggg
55g55555555555555555555555555555gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggbbggggggggggggggggggggggggggggg00gg00ggggggggggggggggggggg5555555555ggggg55555555555555555555555555555555555555555
55g55555555555555555555555555555gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggbbggggrrrrrrr555555555555555555555555ggggggggggggggggggggbbbbgggggggg555555555555555555555
gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg00gg00gggbbgg55rrrrrrr555555555555555555555555ggggggggggggggggggggbbbbbgggggggggg5555555ggggggggggg
ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg5555555555555555555555rrrrrrr555555555500gg00gggggggggggggggggggggggggggggggggggggggggggggbbbbbggggggggggggg555555gggggggg
gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg5555555555555555555555555555555rrrrrrr555555555ggggggggggggggggggggggggggggggggggggggggggggggggggbbbbbbbbgggggggggggggggg5555gggggg
ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg55555555ggggggggggggggggggggggggggggg00gg00ggggbbggggggbbbbgggbbbbbbbgggggggbbbbbbbggggggggbbbbgggggbbbbbbbbbbggggggggggggggggg555gggggg
gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg5555555555ggggggggggggggggggggggggggggggggggggggggggggggbbbbbbbggbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgggggggggg55ggggg
`








export default class Jetfighter extends Animator {
    static category = "Gamesdemos"
    static title = "Jetfighter"
    static description = "inspired by the vic-20 game"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
    
        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        let groundlist=new PixelList()
        let planelist=new PixelList();
        let shootinglist=new PixelList();
        let time=0  
        box.setColor(new Color(0,200,0,1)) 
        box.add(groundlist)
        box.add(planelist);
        box.add(shootinglist)
        planelist.add(new DrawAsciiArtColor(3,box.height()/2-3,  plane))
        
        

       scheduler.intervalControlled(intervalControl, (frameNr) => {
        time++
        groundlist.clear()
        shootinglist.clear()
        let bglength=200
        let groundx=Math.round((frameNr)/10)%bglength
        groundlist.add(new DrawAsciiArtColor(Math.round(1-groundx),box.height()-16, ground))
        groundlist.add(new DrawAsciiArtColor(Math.round(1-groundx)+bglength,box.height()-16, ground))
        shootinglist.add( new Pixel(((time)%100)+6,box.height()/2-3,new Color(128,128,128,1)))
        shootinglist.add( new Pixel(((time)%100)+6,box.height()/2+3,new Color(128,128,128,1)))
       });
       
    }

    
}
