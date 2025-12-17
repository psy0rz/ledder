import Animator from "../../Animator.js"
import Color from "../../Color.js"
import Scheduler from "../../Scheduler.js"
import ControlGroup from "../../ControlGroup.js"
import PixelBox from "../../PixelBox.js"


export default class Landjepik extends Animator {
    static category = "Gamesdemos"
    static title = "Landjepik"
    static description = "Two AI players battle for territory with bouncing balls"

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {
        
        // Game settings
        const gameGroup = controls.group("Game Settings")
        const gameSpeed = gameGroup.value("Game speed", 3, 1, 10, 0.5)
        const ballSpeed = gameGroup.value("Ball speed", 0.8, 0.5, 1, 0.05)
        
        // Visual settings
        const visualGroup = controls.group("Visual")
        const player1Color = visualGroup.color("Player 1 color", 0, 0, 0)
        const player2Color = visualGroup.color("Player 2 color", 255, 255, 255)
        const player1BallColor = visualGroup.color("Player 1 ball color", 0, 0, 0)
        const player2BallColor = visualGroup.color("Player 2 ball color", 255, 255, 255)
        const emptyColor = new Color(0, 0, 0, 0, true)

        const width = box.width()
        const height = box.height()
        
        // Create pixel raster for territory and game elements
        let pixels = box.raster(box, emptyColor, true, false, false)
        
        // Territory ownership: 0 = empty, 1 = player1, 2 = player2
        let territory: number[][] = []
        for (let y = 0; y < height; y++) {
            territory[y] = []
            for (let x = 0; x < width; x++) {
                // Initialize: left half for player 1, right half for player 2
                if (x < width / 2) {
                    territory[y][x] = 1
                    pixels[y][x].color = player1Color
                } else {
                    territory[y][x] = 2
                    pixels[y][x].color = player2Color
                }
            }
        }
        
        // Player 1 (left side)
        let player1 = {
            score: 0,
            ball: {
                x: 5,
                y: Math.floor(height / 2),
                dx: 1,
                dy: 0.5,
                active: true
            }
        }
        
        // Player 2 (right side)
        let player2 = {
            score: 0,
            ball: {
                x: width - 6,
                y: Math.floor(height / 2),
                dx: -1,
                dy: -0.5,
                active: true
            }
        }
        
        // Helper function to draw ball as circle with center color and inverted outline
        function drawBall(ball: any, centerColor: Color, outlineColor: Color) {
            const cx = Math.floor(ball.x)
            const cy = Math.floor(ball.y)
            const radius = 1
            
            // Draw circle using midpoint circle algorithm
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    const x = cx + dx
                    const y = cy + dy
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        if (distance <= radius) {
                            // Use outline color for edge (distance > radius - 1)
                            // Use center color for inner pixels
                            if (distance > radius - 1) {
                                pixels[y][x].color = outlineColor
                            } else {
                                pixels[y][x].color = centerColor
                            }
                        }
                    }
                }
            }
        }
        
        // Helper function to clear ball (now needs to clear circle area)
        function clearBall(ball: any) {
            const cx = Math.floor(ball.x)
            const cy = Math.floor(ball.y)
            const radius = 1
            
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    const x = cx + dx
                    const y = cy + dy
                    
                    if (x >= 0 && x < width && y >= 0 && y < height && distance <= radius) {
                        // Restore territory color
                        if (territory[y][x] === 1) {
                            pixels[y][x].color = player1Color
                        } else if (territory[y][x] === 2) {
                            pixels[y][x].color = player2Color
                        } else {
                            pixels[y][x].color = emptyColor
                        }
                    }
                }
            }
        }

        scheduler.intervalControlled(gameSpeed, (frameNr) => {
            
            // Update Player 1's ball
            if (player1.ball.active) {
                clearBall(player1.ball)
                
                player1.ball.x += player1.ball.dx * ballSpeed.value
                player1.ball.y += player1.ball.dy * ballSpeed.value
                
                const ballX = Math.floor(player1.ball.x)
                const ballY = Math.floor(player1.ball.y)
                
                // Bounce off top/bottom
                if (ballY <= 0 || ballY >= height - 1) {
                    player1.ball.dy = -player1.ball.dy
                    player1.ball.y = Math.max(0, Math.min(height - 1, player1.ball.y))
                }
                
                // Check if ball hit enemy territory - capture and bounce
                if (ballX >= 0 && ballX < width && ballY >= 0 && ballY < height) {
                    if (territory[ballY][ballX] === 2) {
                        // Player 1 captures this pixel
                        territory[ballY][ballX] = 1
                        player1.score++
                        // Bounce the ball
                        player1.ball.dx = -player1.ball.dx
                        // Add slight randomness to dy
                        player1.ball.dy += (Math.random() - 0.5) * 0.3
                    }
                }
                
                // Reset ball if it goes out of bounds (left or right)
                if (ballX < 0 || ballX >= width) {
                    player1.ball.x = 5
                    player1.ball.y = Math.floor(height / 2)
                    player1.ball.dx = 1
                    player1.ball.dy = (Math.random() - 0.5) * 2
                }
            }
            
            // Update Player 2's ball
            if (player2.ball.active) {
                clearBall(player2.ball)
                
                player2.ball.x += player2.ball.dx * ballSpeed.value
                player2.ball.y += player2.ball.dy * ballSpeed.value
                
                const ballX = Math.floor(player2.ball.x)
                const ballY = Math.floor(player2.ball.y)
                
                // Bounce off top/bottom
                if (ballY <= 0 || ballY >= height - 1) {
                    player2.ball.dy = -player2.ball.dy
                    player2.ball.y = Math.max(0, Math.min(height - 1, player2.ball.y))
                }
                
                // Check if ball hit enemy territory - capture and bounce
                if (ballX >= 0 && ballX < width && ballY >= 0 && ballY < height) {
                    if (territory[ballY][ballX] === 1) {
                        // Player 2 captures this pixel
                        territory[ballY][ballX] = 2
                        player2.score++
                        // Bounce the ball
                        player2.ball.dx = -player2.ball.dx
                        // Add slight randomness to dy
                        player2.ball.dy += (Math.random() - 0.5) * 0.3
                    }
                }
                
                // Reset ball if it goes out of bounds (left or right)
                if (ballX < 0 || ballX >= width) {
                    player2.ball.x = width - 6
                    player2.ball.y = Math.floor(height / 2)
                    player2.ball.dx = -1
                    player2.ball.dy = (Math.random() - 0.5) * 2
                }
            }
            
            // Render territory
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (territory[y][x] === 1) {
                        pixels[y][x].color = player1Color
                    } else if (territory[y][x] === 2) {
                        pixels[y][x].color = player2Color
                    } else {
                        pixels[y][x].color = emptyColor
                    }
                }
            }
            
            // Draw balls with center color and inverted outline
            if (player1.ball.active) {
                const centerColor = new Color(player1BallColor.r, player1BallColor.g, player1BallColor.b, player1BallColor.a)
                const outlineColor = new Color(255 - player1BallColor.r, 255 - player1BallColor.g, 255 - player1BallColor.b, player1BallColor.a)
                drawBall(player1.ball, centerColor, outlineColor)
            }
            if (player2.ball.active) {
                const centerColor = new Color(player2BallColor.r, player2BallColor.g, player2BallColor.b, player2BallColor.a)
                const outlineColor = new Color(255 - player2BallColor.r, 255 - player2BallColor.g, 255 - player2BallColor.b, player2BallColor.a)
                drawBall(player2.ball, centerColor, outlineColor)
            }

            return true
        })
    }
}
