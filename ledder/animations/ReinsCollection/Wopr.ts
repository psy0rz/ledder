import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import Animator from "../../Animator.js"
import PixelList from "../../PixelList.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import Font from "../../Font.js"
import {fonts, fontSelect} from "../../fonts.js"
import DrawLine from "../../draw/DrawLine.js"
import { patternSelect } from "../../ColorPatterns.js"
import DrawRectangle from "../../draw/DrawRectangle.js"
import DrawCircle from "../../draw/DrawCircle.js"
import DrawText from "../../draw/DrawText.js"
import DrawAsciiArtColor from "../../draw/DrawAsciiArtColor.js"




class TicTacToeCell
{
    id:number
    inUse:boolean
    owner

    constructor(id:number)
    {
        this.inUse=false
        this.owner=''
        this.id=id
    }

    setOwner(playerId)
    {
        this.inUse=true
        this.owner=playerId
    }


    render(xOffset,yOffset,width,height)
    {
        const cross=`
        b.b
        .b.
        b.b
        `
        const circle=`
        rrr
        r.r
        rrr
        `
        let pl=new PixelList()
        //pl.add(new DrawRectangle(xOffset,yOffset,width,height,new Color(64,64,64,1)))

        let xOff=xOffset+1
        let yOff=yOffset+1
        let w=width-2
        let h=height-2
        let cx=xOff+w/2
        let cy=yOff+w/2

        if (this.owner=='x') { 
           pl.add(new DrawAsciiArtColor(cx-1,cy-1, cross))
    
        } 
        if (this.owner=='o') { 
            pl.add(new DrawAsciiArtColor(cx-1,cy-1, circle))
        } 
        return pl
    }

    rendermini(xOffset,yOffset)
    {
       
        let pl=new PixelList()
        //pl.add(new DrawRectangle(xOffset,yOffset,width,height,new Color(64,64,64,1)))

        let cx=xOffset
        let cy=yOffset

        if (this.owner=='x') { 
           pl.add(new Pixel(cx,cy,new Color(0,0,255,1)))
    
        } 
        if (this.owner=='o') { 
            pl.add(new Pixel(cx,cy,new Color(255,0,0,1)))
        } 
        return pl
    }


}








export class TicTacToe
{
    origBoard
    player0='x'
    player1='o'
    winCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [6, 4, 2]
    ]

    cells=[]
    gameStatus="start"
    gameId=0
    animationTimer=0
    pastGames=[]
   


    constructor()
    {
        
        this.startGame()
        this.pastGames=[]
        this.gameId=0
       
    }

    startGame()
    {
        this.cells=[
            new TicTacToeCell(0), new TicTacToeCell(1), new TicTacToeCell(2),
            new TicTacToeCell(3), new TicTacToeCell(4), new TicTacToeCell(5),
            new TicTacToeCell(6), new TicTacToeCell(7), new TicTacToeCell(8)
        ]
        this.origBoard = Array.from(Array(9).keys());
        this.gameId++
    }

    turn(squareId, player) {
        this.origBoard[squareId] = player;
        if (this.cells[squareId])
        {
            this.cells[squareId].setOwner(player)
        }
        this.gameStatus=player+squareId
        let gameWon = this.checkWin(this.origBoard, player)
        if (gameWon) this.gameOver(gameWon)
    }

    checkWin(board, player) {
        let plays = board.reduce((a, e, i) =>
            (e === player) ? a.concat(i) : a, []);
        let gameWon = null;
        for (let [index, win] of this.winCombos.entries()) {
            if (win.every(elem => plays.indexOf(elem) > -1)) {
                gameWon = { index: index, player: player };
                break;
            }
        }
        return gameWon;
    }

    gameOver(gameWon) {
        this.declareWinner(gameWon.player+" win!");
    }

    declareWinner(who) {
       this.gameStatus=who
       this.startGame()
    }

    emptySquares() {
        return this.origBoard.filter(s => typeof s == 'number')
    }

    bestSpot(player) {
        return this.minimax(this.origBoard, player).index;
    }

    checkTie() {
        if (this.emptySquares().length == 0) {
            this.declareWinner("Tie Game!")
            return true;
        }
        return false;
    }


    minimax(newBoard, player) {
        var availSpots = this.emptySquares();
        if (this.checkWin(newBoard,this.player0)) {
            return { score: -10 }
        } else if (this.checkWin(newBoard, this.player1)) {
            return { score: 10 }
        } else if (availSpots.length === 0) {
            return { score: 0 }
        }
        var moves = [];
        for (var i = 0; i < availSpots.length; i++) {
            var move = {index:-999,score:-999}
            move.index = newBoard[availSpots[i]]
            newBoard[availSpots[i]] = player
    
            if (player == this.player1) {
                var result = this.minimax(newBoard, this.player0);
                move.score = result.score
            } else {
                var result = this.minimax(newBoard, this.player1);
                move.score = result.score
            }
    
            newBoard[availSpots[i]] = move.index;
    
            moves.push(move)
        }
    
        var bestMove;
        if (player === this.player1) {
            var bestScore = -10000;
            for (var i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score
                    bestMove = i
                }
            }
        } else {
            var bestScore = 10000;
            for (var i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score
                    bestMove = i
                }
            }
        }
    
        return moves[bestMove];
    }



    update(turn:number)
    {
        if (this.emptySquares().length>0)
        {
            let playerId=turn%2
          
    
                if (playerId==0)
                {
                
                    let bestSpot0=this.bestSpot(this.player0)
                    if (this.emptySquares().length>8){ bestSpot0=Math.round(Math.random()*9)}
                    this.turn(bestSpot0,this.player0)
                }
                else
                {
                    let bestSpot1=this.bestSpot(this.player1)
                    if (this.emptySquares().length>8){ bestSpot1=Math.round(Math.random()*9)}
                    this.turn(bestSpot1,this.player1)
                }
            
        }
        else
        {
            this.pastGames.unshift(this.cells)
            if (this.pastGames.length>32){ this.pastGames.pop()}
            this.startGame()
        }
        
    }

    render(xOffset,yOffset,width,height)
    {
        let rstruct=[
            [0,0],[1,0],[2,0],
            [0,1],[1,1],[2,1],
            [0,2],[1,2],[2,2]
        ]

       
        width=Math.trunc(width/3)*3
        height=Math.min(15,Math.trunc(height/3)*3)
        
        let cellWidth=Math.trunc(((height)/3))
        let cellHeight=Math.trunc(((height)/3))

        let pl=new PixelList()
        for (let g=0;g<this.cells.length;g++)
        {
            let cxOffset=xOffset+(rstruct[g][0]*cellWidth)
            let cyOffset=yOffset+(rstruct[g][1]*cellHeight)
            pl.add(this.cells[g].render(cxOffset,cyOffset,cellWidth,cellHeight))
        }
        pl.add(new DrawRectangle(xOffset,yOffset,height,height,new Color(64,64,64,1)))

        //show past
        let nrOfitems=30
      
        cellWidth=1
        cellHeight=1
        for (let i=0;i<nrOfitems;i++)
        {
            if (this.pastGames[i])
            {
                //pl.add(new DrawRectangle(xOffset+height+((i)*5),yOffset,5,5,new Color(64,64,64,1)))
                for (let g=0;g<this.pastGames[i].length;g++)
                {
                    let x=i%10
                    let y=Math.trunc(i/10)
                    let cxOffset=1+xOffset+height+ (((x)*5)+(rstruct[g][0]*cellWidth))
                    let cyOffset=1+yOffset+(y*5)+(rstruct[g][1]*cellHeight) 
                    
                    pl.add(this.pastGames[i][g].rendermini(cxOffset,cyOffset))
                }
               
            }
        }
       
     
        return pl
    }

    renderIntro(box, timer)
    {
        let text="Greetings professor Falken.      Shall we play a game?                              Y/n                                            "
        let pl=new PixelList()
         pl.add(this.renderTypeWriterText(box,text,this.animationTimer))
        this.animationTimer++
        return pl
    }

    renderTypeWriterText(box,text, timer)
    {
        let pl=new PixelList()
        let font=fonts.C64
        font.load()
        let maxcharsToShow=box.width()/font.width
        let substr=text.substr(0,Math.round(timer))
        if (substr.length>maxcharsToShow) { substr=substr.substr(substr.length-maxcharsToShow,maxcharsToShow)}
        pl.add(new DrawText(0,0,font,substr,new Color(0,128,0,1)))
        return pl
    }

}

    



export default class Wopr extends Animator {

   //Greetings professor Falken.
   //Shall we play a game?
  

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

      
       const colorPaletteControl           = patternSelect(controls, 'Color Palette', 'DimmedReinbow')    
       const intervalControl=controls.value("Refresh interval ms",1,1,100,1,true)  
        let imgBox=new PixelBox(box)
        box.add(imgBox)

        let wopr=new TicTacToe()
        let turn=0
        let delaycounter=0
        let delay=0
        let pl
        let xOffset=0
        scheduler.intervalControlled(intervalControl, (frameNr) => {
            
            if (frameNr<1000)
            {
                imgBox.clear()
                imgBox.add(wopr.renderIntro(box,frameNr))
            }
            else
            {
                
                   
                    if (xOffset>box.width() ) { imgBox.clear() ; xOffset=0}
                    imgBox.clear()
                    wopr.update(turn)
                    pl=wopr.render(0,0,box.width(),box.height())
                    imgBox.add(pl)
                    turn++
                
                
            }

          
        
        })
    }
}

