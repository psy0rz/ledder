import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import PixelList from "../../PixelList.js"
import Color from "../../Color.js"
import DrawText from "../../draw/DrawText.js"
import {fonts} from "../../fonts.js"



export default class Pong extends Animator {
    static category = "Gamesdemos"
    static title = "Pong"
    static description = "inspired by the Atari game"
    

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) 
    {
    
        const intervalControl = controls.value("Animation interval", 1, 1, 10, 0.1)
        let ponglist=new PixelList() 
        box.add(ponglist)
        let dxdefault=1.0
        let dydefault=0.3141592
        let dx=dxdefault;
        let dy=dydefault;
        let ballX=3.0;
        let ballY=box.height()/2   
        let player1X=0+4;
        let player2X=box.width()-5
        let player1Y=box.height()/2
        let player2Y=box.height()/2
        let player1Score=0
        let player2Score=0
        let font=fonts.Picopixel
        

       scheduler.intervalControlled(intervalControl, (frameNr) => {
            ponglist.clear()

            //ball
            ponglist.add(new Pixel(Math.round(ballX),Math.round(ballY),new Color(255,255,255,1)))
        
            //score and game logic
            if (Math.round(ballX)>player2X)         {  dx=-1*dxdefault;  player1Score++ }
            if (Math.round(ballX)<player1X)         {  dx=dxdefault;     player2Score++ }
            if (Math.round(ballY)>=box.height()-1)  {  dy=-1*dydefault; }
            if (Math.round(ballY)<=1)               {  dy=dydefault; }

            if (Math.round(ballX)>player2X-2 && Math.abs(player2Y-ballY)<3)  {  dx=-1*dxdefault;  }
            if (Math.round(ballX)<player1X+2 && Math.abs(player1Y-ballY)<3)  {  dx=1*dxdefault;  }
        
            for (let i=0; i<3;i++)
            {
                ponglist.add(new Pixel(player1X,Math.round(player1Y-1+i),new Color(255,0,0,1)))
                ponglist.add(new Pixel(player2X,Math.round(player2Y-1+i),new Color(0,0,255,1)))
            }
            
            const  score1=new DrawText(player1X-4,1,font,player1Score.toString(),new Color(99,0,0,1))
            const  score2=new DrawText(player2X+2,1,font,player2Score.toString(),new Color(0,0,99,1))
            ponglist.add(score1)
            ponglist.add(score2)
        
            
            //move players
            ballX=ballX+dx
            ballY=ballY+dy+Math.cos(frameNr/100)/4

            if (ballX>box.width()*0.80 && dx>0) {
                if (ballY>player2Y) { player2Y++ }
                if (ballY<player2Y) { player2Y-- }
            }

            if (ballX<box.width()*0.20 && dx<0) {
                if (ballY>player1Y) { player1Y++ }
                if (ballY<player1Y) { player1Y-- }
            }

            if (player1Score>9 || player2Score>9) { player1Score=0; player2Score=0;}

       });
       
    }

    
}
