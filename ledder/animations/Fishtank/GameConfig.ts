import type ControlGroup from "../../ControlGroup.js"
import type SpriteManager from "./SpriteManager.js"
import type PixelBox from "../../PixelBox.js"
import { GameSprites, GameSprite, ArkanoidBallSprite, ExplosionSprite } from "./GameSprites.js"

export class GameConfig {
    private controls: ControlGroup;
    private config: ReturnType<typeof this.setupControls>;
    private gameSprites: GameSprite[] = [];
    private balls: ArkanoidBallSprite[] = [];
    private explosions: ExplosionSprite[] = [];
    private boxWidth: number = 0;
    private boxHeight: number = 0;
    
    constructor(parentControls: ControlGroup) {
        this.controls = parentControls.group("Retro Games 🎮", true, false);
        this.config = this.setupControls();
    }
    
    setupControls() {
        const enableGames = this.controls.switch("Enable", false);
        
        // Galaga
        const galagaGroup = this.controls.group("Galaga", true, false);
        const enableGalaga = galagaGroup.switch("Enable", false);
        const galagaBossCount = galagaGroup.value("Boss count", 2, 0, 5, 1);
        const galagaButterflyCount = galagaGroup.value("Butterfly count", 3, 0, 8, 1);
        const galagaBeeCount = galagaGroup.value("Bee count", 3, 0, 8, 1);
        const galagaSpeed = galagaGroup.value("Speed", 0.5, 0.1, 2.0, 0.1);
        const galagaY = galagaGroup.value("Y Position %", 20, 0, 100, 1);
        
        // Space Invaders
        const invadersGroup = this.controls.group("Space Invaders", true, false);
        const enableInvaders = invadersGroup.switch("Enable", false);
        const invaderSquidCount = invadersGroup.value("Squid count", 2, 0, 6, 1);
        const invaderCrabCount = invadersGroup.value("Crab count", 2, 0, 6, 1);
        const invaderOctopusCount = invadersGroup.value("Octopus count", 2, 0, 6, 1);
        const invaderSpeed = invadersGroup.value("Speed", 0.2, 0.1, 1.0, 0.1);
        const invaderY = invadersGroup.value("Y Position %", 10, 0, 100, 1);
        
        // Arkanoid
        const arkanoidGroup = this.controls.group("Arkanoid", true, false);
        const enableArkanoid = arkanoidGroup.switch("Enable", false);
        const arkanoidPaddleCount = arkanoidGroup.value("Paddle count", 1, 0, 3, 1);
        const arkanoidBallCount = arkanoidGroup.value("Ball count", 2, 0, 5, 1);
        const arkanoidPaddleSpeed = arkanoidGroup.value("Paddle speed", 0.8, 0.1, 2.0, 0.1);
        const arkanoidBallSpeedX = arkanoidGroup.value("Ball X direction", 0.6, -2.0, 2.0, 0.1);
        const arkanoidBallSpeedY = arkanoidGroup.value("Ball Y direction", -0.8, -2.0, 2.0, 0.1);
        const arkanoidPaddleY = arkanoidGroup.value("Paddle Y %", 90, 0, 100, 1);
        
        return {
            enableGames,
            galaga: {
                enable: enableGalaga,
                bossCount: galagaBossCount,
                butterflyCount: galagaButterflyCount,
                beeCount: galagaBeeCount,
                speed: galagaSpeed,
                y: galagaY
            },
            invaders: {
                enable: enableInvaders,
                squidCount: invaderSquidCount,
                crabCount: invaderCrabCount,
                octopusCount: invaderOctopusCount,
                speed: invaderSpeed,
                y: invaderY
            },
            arkanoid: {
                enable: enableArkanoid,
                paddleCount: arkanoidPaddleCount,
                ballCount: arkanoidBallCount,
                paddleSpeed: arkanoidPaddleSpeed,
                ballSpeedX: arkanoidBallSpeedX,
                ballSpeedY: arkanoidBallSpeedY,
                paddleY: arkanoidPaddleY
            }
        };
    }
    
    populateSprites(gameManager: SpriteManager, box: PixelBox) {
        const config = this.config;
        
        this.boxWidth = box.width();
        this.boxHeight = box.height();
        this.gameSprites = [];
        this.balls = [];
        this.explosions = [];
        
        if (!config.enableGames.enabled) {
            return;
        }
        
        // Galaga sprites
        if (config.galaga.enable.enabled) {
            const galagaY = Math.floor((box.height() * config.galaga.y.value) / 100);
            
            // Add Boss aliens
            for (let i = 0; i < config.galaga.bossCount.value; i++) {
                const x = (box.width() / (config.galaga.bossCount.value + 1)) * (i + 1);
                const sprite = new GameSprites.GalagaBoss(x, galagaY, config.galaga.speed.value);
                this.gameSprites.push(sprite);
                gameManager.addSprite(sprite);
            }
            
            // Add Butterfly aliens
            for (let i = 0; i < config.galaga.butterflyCount.value; i++) {
                const x = (box.width() / (config.galaga.butterflyCount.value + 1)) * (i + 1);
                const y = galagaY + 8;
                const sprite = new GameSprites.GalagaButterfly(x, y, config.galaga.speed.value * 0.8);
                this.gameSprites.push(sprite);
                gameManager.addSprite(sprite);
            }
            
            // Add Bee aliens
            for (let i = 0; i < config.galaga.beeCount.value; i++) {
                const x = (box.width() / (config.galaga.beeCount.value + 1)) * (i + 1);
                const y = galagaY + 14;
                const sprite = new GameSprites.GalagaBee(x, y, config.galaga.speed.value * 1.2);
                this.gameSprites.push(sprite);
                gameManager.addSprite(sprite);
            }
        }
        
        // Space Invaders sprites
        if (config.invaders.enable.enabled) {
            const invaderY = Math.floor((box.height() * config.invaders.y.value) / 100);
            
            // Add Squid invaders (top row)
            for (let i = 0; i < config.invaders.squidCount.value; i++) {
                const x = (box.width() / (config.invaders.squidCount.value + 1)) * (i + 1);
                const sprite = new GameSprites.SpaceInvaderSquid(x, invaderY, config.invaders.speed.value);
                this.gameSprites.push(sprite);
                gameManager.addSprite(sprite);
            }
            
            // Add Crab invaders (middle row)
            for (let i = 0; i < config.invaders.crabCount.value; i++) {
                const x = (box.width() / (config.invaders.crabCount.value + 1)) * (i + 1);
                const y = invaderY + 8;
                const sprite = new GameSprites.SpaceInvaderCrab(x, y, config.invaders.speed.value);
                this.gameSprites.push(sprite);
                gameManager.addSprite(sprite);
            }
            
            // Add Octopus invaders (bottom row)
            for (let i = 0; i < config.invaders.octopusCount.value; i++) {
                const x = (box.width() / (config.invaders.octopusCount.value + 1)) * (i + 1);
                const y = invaderY + 16;
                const sprite = new GameSprites.SpaceInvaderOctopus(x, y, config.invaders.speed.value);
                this.gameSprites.push(sprite);
                gameManager.addSprite(sprite);
            }
        }
        
        // Arkanoid sprites
        if (config.arkanoid.enable.enabled) {
            const paddleY = Math.floor((box.height() * config.arkanoid.paddleY.value) / 100);
            
            // Add paddles
            for (let i = 0; i < config.arkanoid.paddleCount.value; i++) {
                const x = (box.width() / (config.arkanoid.paddleCount.value + 1)) * (i + 1);
                const sprite = new GameSprites.ArkanoidPaddle(x, paddleY, config.arkanoid.paddleSpeed.value);
                gameManager.addSprite(sprite);
            }
            
            // Add balls
            for (let i = 0; i < config.arkanoid.ballCount.value; i++) {
                const x = Math.random() * box.width();
                const y = Math.random() * (box.height() / 2);
                const speedX = config.arkanoid.ballSpeedX.value;
                const speedY = config.arkanoid.ballSpeedY.value;
                const ball = new GameSprites.ArkanoidBall(x, y, speedX, speedY);
                this.balls.push(ball);
                gameManager.addSprite(ball);
            }
        }
    }
    
    updateCollisions(gameManager: SpriteManager) {
        // Check collisions between balls and game sprites
        for (const ball of this.balls) {
            if (!ball.isAlive) continue;
            
            for (const sprite of this.gameSprites) {
                if (!sprite.isAlive) continue;
                
                if (ball.checkCollision(sprite)) {
                    // Create explosion at sprite position
                    const pos = sprite.getPosition();
                    const explosion = new ExplosionSprite(pos.x, pos.y);
                    this.explosions.push(explosion);
                    gameManager.addSprite(explosion);
                    
                    // Kill the sprite
                    sprite.explode();
                    
                    // Respawn at random position if configured
                    if (sprite.shouldRespawn) {
                        setTimeout(() => {
                            const newX = Math.random() * this.boxWidth;
                            const newY = Math.random() * (this.boxHeight / 2);
                            sprite.respawn(newX, newY);
                        }, 2000);
                    }
                }
            }
        }
        
        // Remove finished explosions
        this.explosions = this.explosions.filter(explosion => {
            if (explosion.isFinished()) {
                gameManager.removeSprite(explosion);
                return false;
            }
            return true;
        });
    }
}
