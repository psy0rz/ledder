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
        const ballSize = gameGroup.value("Ball size", 1, 1, 5, 1)
        
        // Visual settings
        const visualGroup = controls.group("Visual")
        const player1Color = controls.color("Player 1 color", 0, 0, 0)
        const player2Color = controls.color("Player 2 color", 255, 255, 255)
        const player1BallColor = controls.color("Player 1 ball color", 0, 0, 0)
        const player2BallColor = controls.color("Player 2 ball color", 255, 255, 255)
        const antialiasing = visualGroup.value("Territory antialiasing", 0.3, 0, 1, 0.1)
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
        // Uses subpixel positioning for smooth movement
        function drawBall(ball: any, centerColor: Color, outlineColor: Color) {
            const cx = ball.x  // Keep as float for subpixel accuracy
            const cy = ball.y
            const radius = ballSize.value
            
            // Draw circle using midpoint circle algorithm with subpixel blending
            for (let dy = -radius - 1; dy <= radius + 1; dy++) {
                for (let dx = -radius - 1; dx <= radius + 1; dx++) {
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    const x = Math.floor(cx + dx)
                    const y = Math.floor(cy + dy)
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        if (distance <= radius + 0.5) {
                            // Determine base color
                            let color: Color
                            if (distance > radius - 0.5) {
                                color = outlineColor
                            } else {
                                color = centerColor
                            }
                            
                            // Calculate subpixel alpha for smooth edges
                            let alpha = 1.0
                            if (distance > radius) {
                                // Smooth falloff beyond radius
                                alpha = Math.max(0, 1 - (distance - radius) * 2)
                            } else if (distance > radius - 1) {
                                // Blend outline/center transition
                                alpha = 1.0
                            }
                            
                            if (alpha > 0.05) {
                                pixels[y][x].color = new Color(color.r, color.g, color.b, color.a * alpha)
                            }
                        }
                    }
                }
            }
        }
        
        // Helper function to clear ball (now needs to clear circle area)
        function clearBall(ball: any) {
            const cx = ball.x  // Use float position
            const cy = ball.y
            const radius = ballSize.value + 1  // Clear slightly larger area
            
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const x = Math.floor(cx + dx)
                    const y = Math.floor(cy + dy)
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
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
            
            // Render territory with antialiasing
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const currentOwner = territory[y][x]
                    let baseColor: Color
                    
                    if (currentOwner === 1) {
                        baseColor = player1Color
                    } else if (currentOwner === 2) {
                        baseColor = player2Color
                    } else {
                        baseColor = emptyColor
                    }
                    
                    // Apply nearest neighbor antialiasing at boundaries
                    if (antialiasing.value > 0 && currentOwner !== 0) {
                        // Check 8 neighbors
                        let neighborCount = 0
                        let diffNeighborCount = 0
                        let neighborR = 0, neighborG = 0, neighborB = 0
                        
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue
                                const nx = x + dx
                                const ny = y + dy
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    neighborCount++
                                    const neighborOwner = territory[ny][nx]
                                    if (neighborOwner !== currentOwner) {
                                        diffNeighborCount++
                                        // Get neighbor color
                                        if (neighborOwner === 1) {
                                            neighborR += player1Color.r
                                            neighborG += player1Color.g
                                            neighborB += player1Color.b
                                        } else if (neighborOwner === 2) {
                                            neighborR += player2Color.r
                                            neighborG += player2Color.g
                                            neighborB += player2Color.b
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Blend with neighbors if at boundary
                        if (diffNeighborCount > 0) {
                            const blendFactor = (diffNeighborCount / neighborCount) * antialiasing.value
                            neighborR /= diffNeighborCount
                            neighborG /= diffNeighborCount
                            neighborB /= diffNeighborCount
                            
                            const blendedR = Math.round(baseColor.r * (1 - blendFactor) + neighborR * blendFactor)
                            const blendedG = Math.round(baseColor.g * (1 - blendFactor) + neighborG * blendFactor)
                            const blendedB = Math.round(baseColor.b * (1 - blendFactor) + neighborB * blendFactor)
                            
                            pixels[y][x].color = new Color(blendedR, blendedG, blendedB, baseColor.a)
                        } else {
                            pixels[y][x].color = baseColor
                        }
                    } else {
                        pixels[y][x].color = baseColor
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
