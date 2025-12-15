import PixelBox from "../../PixelBox.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelList from "../../PixelList.js"
import Animator from "../../Animator.js"
import Pixel from "../../Pixel.js"
import Color from "../../Color.js"
import Font from "../../Font.js"
import { fonts } from "../../fonts.js"
import DrawText from "../../draw/DrawText.js"

enum GameState {
    INTRO,
    COUNTDOWN,
    PLAYING,
    GAME_OVER
}

export default class Bingo extends Animator {
    static category = "ReinsCollection"
    static title = "Bingo"
    static description = "Bingo number drawer with intro and countdown"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        const appControl = controls.group("Bingo Settings", true)
        const delayBetweenNumbers = appControl.value("Delay Between Numbers (sec)", 5, 1, 60, 1)
        const delayBetweenGames = appControl.value("Delay Between Games (sec)", 10, 3, 120, 1)
        const countdownDuration = appControl.value("Countdown Duration (sec)", 3, 1, 10, 1)
        const lowestNumber = appControl.value("Lowest Number", 1, 1, 50, 1)
        const highestNumber = appControl.value("Highest Number", 75, 10, 100, 1)
        
        const canvas = new PixelList()
        box.add(canvas)
        
        let state: GameState = GameState.INTRO
        let numbersTodo: number[] = []
        let numbersDone: number[] = []
        let frameCounter = 0
        let stateStartFrame = 0
        let countdownValue = 0
        let currentNumber = 0
        
        const font = fonts["C64 mono"]
        font.load()
        const smallFont = fonts["Pixel-Gosub"]
        smallFont.load()
        
        const resetGame = () => {
            numbersTodo = []
            numbersDone = []
            for (let i = lowestNumber.value; i <= highestNumber.value; i++) {
                numbersTodo.push(i)
            }
        }
        
        const drawNumber = () => {
            if (numbersTodo.length > 0) {
                const randomIndex = Math.floor(Math.random() * numbersTodo.length)
                const drawnNumber = numbersTodo.splice(randomIndex, 1)[0]
                numbersDone.push(drawnNumber)
                currentNumber = drawnNumber
                return drawnNumber
            }
            return null
        }
        
        const setState = (newState: GameState) => {
            state = newState
            stateStartFrame = frameCounter
            if (newState === GameState.COUNTDOWN) {
                countdownValue = countdownDuration.value
            } else if (newState === GameState.PLAYING) {
                resetGame()
                const firstNum = drawNumber()
                currentNumber = firstNum !== null ? firstNum : 0
            }
        }
        
        setState(GameState.INTRO)
        scheduler.setFrameTimeuS(100000)
        
        scheduler.interval(1, (frameNr) => {
            frameCounter++
            canvas.clear()
            
            const framesInState = frameCounter - stateStartFrame
            const centerX = Math.floor(box.width() / 2)
            const centerY = Math.floor(box.height() / 2)
            
            if (state === GameState.INTRO) {
                // Show "BINGO" text
                const text = "BINGO"
                const textWidth = text.length * 6
                canvas.add(new DrawText(centerX - textWidth / 2, centerY - 4, font, text, new Color(255, 200, 0, 1)))
                
                // Pulsing effect
                const pulse = Math.abs(Math.sin(frameCounter * 0.1))
                for (let i = 0; i < box.width(); i++) {
                    if (pulse > 0.5) {
                        canvas.add(new Pixel(i, 0, new Color(255, 200, 0, pulse * 0.5)))
                        canvas.add(new Pixel(i, box.height() - 1, new Color(255, 200, 0, pulse * 0.5)))
                    }
                }
                
                if (framesInState >= 30) setState(GameState.COUNTDOWN)
                
            } else if (state === GameState.COUNTDOWN) {
                // Countdown display
                const secondsElapsed = Math.floor(framesInState / 10)
                const currentCountdown = countdownDuration.value - secondsElapsed
                
                if (currentCountdown > 0) {
                    const countText = currentCountdown.toString()
                    const scale = 2 + Math.sin(framesInState * 0.3) * 0.5
                    canvas.add(new DrawText(centerX - 3, centerY - 4, font, countText, new Color(255, 100, 100, 1)))
                    
                    // Circle animation
                    const progress = (framesInState % 10) / 10
                    const radius = Math.floor(8 * (1 - progress))
                    for (let angle = 0; angle < 360; angle += 30) {
                        const rad = angle * Math.PI / 180
                        const x = Math.floor(centerX + Math.cos(rad) * radius)
                        const y = Math.floor(centerY + Math.sin(rad) * radius)
                        if (x >= 0 && x < box.width() && y >= 0 && y < box.height()) {
                            canvas.add(new Pixel(x, y, new Color(255, 200, 0, 1 - progress)))
                        }
                    }
                } else {
                    setState(GameState.PLAYING)
                }
                
            } else if (state === GameState.PLAYING) {
                // Main game - show current number
                const numText = currentNumber.toString()
                const textWidth = numText.length * 6
                canvas.add(new DrawText(centerX - textWidth / 2, centerY - 4, font, numText, new Color(255, 255, 255, 1)))
                
                // Show count
                const countText = `${numbersDone.length}/${highestNumber.value - lowestNumber.value + 1}`
                canvas.add(new DrawText(2, 2, smallFont, countText, new Color(128, 128, 128, 1)))
                
                // Progress bar for next number
                const delayFrames = delayBetweenNumbers.value * 10
                const progressFrames = framesInState % delayFrames
                const barWidth = Math.floor((box.width() / delayFrames) * progressFrames)
                for (let d = 0; d < barWidth; d++) {
                    canvas.add(new Pixel(d, box.height() - 1, new Color(0, 255, 0, 1)))
                }
                
                // Draw new number when timer expires
                if (progressFrames === 0 && framesInState > 0) {
                    const nextNum = drawNumber()
                    if (nextNum === null) {
                        setState(GameState.GAME_OVER)
                    } else {
                        currentNumber = nextNum
                    }
                }
                
            } else if (state === GameState.GAME_OVER) {
                // Game over screen
                const gameOverText = "DONE"
                const textWidth = gameOverText.length * 6
                canvas.add(new DrawText(centerX - textWidth / 2, centerY - 8, font, gameOverText, new Color(255, 100, 100, 1)))
                
                const totalText = `${numbersDone.length} Numbers`
                const totalWidth = totalText.length * 6
                canvas.add(new DrawText(centerX - totalWidth / 2, centerY + 2, font, totalText, new Color(200, 200, 200, 1)))
                
                // Restart countdown bar
                const restartFrames = delayBetweenGames.value * 10
                const restartProgress = Math.min(framesInState, restartFrames)
                const restartBarWidth = Math.floor((box.width() / restartFrames) * restartProgress)
                for (let d = 0; d < restartBarWidth; d++) {
                    canvas.add(new Pixel(d, box.height() - 1, new Color(255, 200, 0, 1)))
                }
                
                if (framesInState >= restartFrames) {
                    setState(GameState.INTRO)
                }
            }
            
            canvas.crop(box)
        })
    }
}
