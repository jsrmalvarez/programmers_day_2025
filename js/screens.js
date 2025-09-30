/*
 * Screen Animation System
 * Handles animated computer screens with typing and video modes
 */

import { gameState } from './gameState.js';
import { TYPING_COLORS, SCREENS, CONFIG } from './config.js';

export class ScreenManager {
    constructor(scene) {
        this.scene = scene;
        this.screen1Graphics = null;
        this.screen2Graphics = null;
        this.screen3Graphics = null;
    }

    createAnimatedScreens() {
        // Clear existing screen graphics
        if (this.screen1Graphics) {
            this.screen1Graphics.destroy();
        }
        if (this.screen2Graphics) {
            this.screen2Graphics.destroy();
        }

        if (this.screen3Graphics) {
            this.screen3Graphics.destroy();
        }

        // Create graphics objects for both screens
        this.screen1Graphics = this.scene.add.graphics();
        this.screen2Graphics = this.scene.add.graphics();
        this.screen3Graphics = this.scene.add.graphics();
        // Set initial depths based on dynamic layering configuration
        this.updateScreenLayers();

        // Initial screen render
        this.updateScreenGraphics();
    }

    updateScreenGraphics() {
        if (!this.screen1Graphics || !this.screen2Graphics || !this.screen3Graphics) return;

        // Clear both screens
        this.screen1Graphics.clear();
        this.screen2Graphics.clear();
        this.screen3Graphics.clear();

        // Render screens using SCREENS configuration
        const screen1Pos = SCREENS.screen1.position;
        const screen2Pos = SCREENS.screen2.position;
        const screen3Pos = SCREENS.screen3.position;

        this.renderScreen(this.screen1Graphics, screen1Pos.x, screen1Pos.y, screen1Pos.width, screen1Pos.height, gameState.screen1);
        this.renderScreen(this.screen2Graphics, screen2Pos.x, screen2Pos.y, screen2Pos.width, screen2Pos.height, gameState.screen2);
        this.renderScreen(this.screen3Graphics, screen3Pos.x, screen3Pos.y, screen3Pos.width, screen3Pos.height, gameState.screen3);
    }

    renderScreen(graphics, x, y, width, height, screenState) {
        // Dark screen background - completely clear the screen
        graphics.fillStyle(0x001100);
        graphics.fillRect(x, y, width, height);

        // Blue screen border/glow
        graphics.lineStyle(1, 0x3498db);
        graphics.strokeRect(x, y, width, height);

        if (screenState.mode === 'typing') {
            this.renderTypingMode(graphics, x, y, width, height, screenState);
        } else if (screenState.mode === 'video') {
            this.renderVideoMode(graphics, x, y, width, height, screenState);
        }
    }

    renderTypingMode(graphics, x, y, width, height, screenState) {
        // Character rendering parameters
        const charWidth = 1;
        const charHeight = 1;
        const charSpacingX = 1;
        const charSpacingY = 1;
        const lineHeight = charHeight + charSpacingY;

        const maxCharsPerLine = Math.floor((width - 2) / charSpacingX);
        const maxLines = Math.floor((height - 2) / lineHeight);

        // Render each character
        for (const char of screenState.characters) {
            if (char.line >= maxLines) continue; // Skip if outside screen bounds

            const charX = x + 1 + char.col * charSpacingX;
            const charY = y + 1 + char.line * lineHeight;

            // Only render if character is visible (not a space)
            if (char.visible) {
                graphics.fillStyle(TYPING_COLORS[char.colorIndex]);
                graphics.fillRect(charX, charY, charWidth, charHeight);
            }
        }

        // Render cursor on current typing position
        if (screenState.currentLine < maxLines) {
            const cursorX = x + 1 + screenState.currentChar * charSpacingX;
            const cursorY = y + 1 + screenState.currentLine * lineHeight;

            // Blinking cursor effect
            if (Math.floor(Date.now() / 500) % 2 === 0) {
                graphics.fillStyle(0x00ffff);
                graphics.fillRect(cursorX, cursorY, charWidth, charHeight);
            }
        }
    }

    renderVideoMode(graphics, x, y, width, height, screenState) {
        // Initialize Pong game state if not exists
        if (!screenState.pongGame) {
            this.initPongGame(screenState, width, height);
        }

        // Render Pong game
        this.renderPongGame(graphics, x, y, width, height, screenState);

        // Add vignette effect around the edges
        //this.renderVignette(graphics, x, y, width, height);
    }

    initPongGame(screenState, width, height) {
        // Initialize bouncing ball game state
        screenState.pongGame = {
            // Ball properties
            ballX: Math.floor((width - 2) / 2),
            ballY: Math.floor((height - 2) / 2),
            ballVelX: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4),
            ballVelY: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3),
            ballSize: 1,

            // Game area
            gameWidth: width - 2, // Account for borders
            gameHeight: height - 2
        };
    }

    renderPongGame(graphics, x, y, width, height, screenState) {
        const game = screenState.pongGame;
        if (!game) return;

        // Game area offset (account for border)
        const gameX = x + 1;
        const gameY = y + 1;

        // Render paddles (follow ball Y position)
        graphics.fillStyle(0xffffff); // White paddles
        const paddleHeight = 2;
        const paddleWidth = 1;

        // Left paddle - follow ball Y, keep within bounds
        const leftPaddleY = Math.max(0, Math.min(game.gameHeight - paddleHeight, game.ballY - paddleHeight/2));
        graphics.fillRect(gameX, gameY + leftPaddleY, paddleWidth, paddleHeight);

        // Right paddle - follow ball Y, keep within bounds
        const rightPaddleY = Math.max(0, Math.min(game.gameHeight - paddleHeight, game.ballY - paddleHeight/2));
        graphics.fillRect(gameX + game.gameWidth - paddleWidth, gameY + rightPaddleY, paddleWidth, paddleHeight);

        // Render ball
        graphics.fillStyle(0xffffff); // White ball
        graphics.fillRect(gameX + game.ballX, gameY + game.ballY, game.ballSize, game.ballSize);

        // Render center line (dashed vertical line)
        graphics.fillStyle(0x444444);
        for (let i = 0; i < game.gameHeight; i += 2) {
            graphics.fillRect(gameX + Math.floor(game.gameWidth / 2), gameY + i, 1, 1);
        }
    }

    updatePongGame(screenState) {
        const game = screenState.pongGame;
        if (!game) return;

        // Update ball position
        game.ballX += game.ballVelX;
        game.ballY += game.ballVelY;

        // Ball collision with top/bottom walls
        if (game.ballY <= 0) {
            game.ballVelY = Math.abs(game.ballVelY);
            game.ballY = 0;
        } else if (game.ballY >= game.gameHeight - game.ballSize) {
            game.ballVelY = -Math.abs(game.ballVelY);
            game.ballY = game.gameHeight - game.ballSize;
        }

        // Ball collision with left paddle
        const paddleHeight = 2;
        const paddleWidth = 1;
        const leftPaddleY = Math.max(0, Math.min(game.gameHeight - paddleHeight, game.ballY - paddleHeight/2));

        if (game.ballX <= paddleWidth &&
            game.ballY + game.ballSize > leftPaddleY &&
            game.ballY < leftPaddleY + paddleHeight) {
            game.ballVelX = Math.abs(game.ballVelX);
            game.ballX = paddleWidth;
        }

        // Ball collision with right paddle
        const rightPaddleY = Math.max(0, Math.min(game.gameHeight - paddleHeight, game.ballY - paddleHeight/2));

        if (game.ballX + game.ballSize >= game.gameWidth - paddleWidth &&
            game.ballY + game.ballSize > rightPaddleY &&
            game.ballY < rightPaddleY + paddleHeight) {
            game.ballVelX = -Math.abs(game.ballVelX);
            game.ballX = game.gameWidth - paddleWidth - game.ballSize;
        }

        // Ball out of bounds - reset to center
        if (game.ballX < 0 || game.ballX > game.gameWidth) {
            this.resetBall(game);
        }

        // Limit ball velocity
        game.ballVelX = Math.max(-1.0, Math.min(1.0, game.ballVelX));
        game.ballVelY = Math.max(-1.0, Math.min(1.0, game.ballVelY));
    }

    resetBall(game) {
        game.ballX = Math.floor(game.gameWidth / 2);
        game.ballY = Math.floor(game.gameHeight / 2);
        game.ballVelX = (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.3);
        game.ballVelY = (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3);

        // Ensure ball stays within bounds
        game.ballX = Math.max(0, Math.min(game.gameWidth - game.ballSize, game.ballX));
        game.ballY = Math.max(0, Math.min(game.gameHeight - game.ballSize, game.ballY));
    }

    renderVignette(graphics, x, y, width, height) {
        // Create a subtle vignette effect by darkening the edges
        const vignetteColor = 0x000000;
        const vignetteAlpha = 0.3;

        // Top and bottom edges
        graphics.fillStyle(vignetteColor);
        graphics.fillRect(x + 1, y + 1, width - 2, 1); // Top
        graphics.fillRect(x + 1, y + height - 2, width - 2, 1); // Bottom

        // Left and right edges
        graphics.fillRect(x + 1, y + 1, 1, height - 2); // Left
        graphics.fillRect(x + width - 2, y + 1, 1, height - 2); // Right

        // Corner darkening for more realistic CRT effect
        graphics.fillRect(x + 2, y + 2, 1, 1); // Top-left corner
        graphics.fillRect(x + width - 3, y + 2, 1, 1); // Top-right corner
        graphics.fillRect(x + 2, y + height - 3, 1, 1); // Bottom-left corner
        graphics.fillRect(x + width - 3, y + height - 3, 1, 1); // Bottom-right corner
    }


    updateScreenAnimations() {
        // Only update screens if we're in room1 and screens exist
        if (gameState.currentRoom !== 'room1' || !this.screen1Graphics || !this.screen2Graphics) {
            return;
        }

        // Update screen modes based on player position relative to layering thresholds
        // When player is "behind" screen: video mode
        // When player is "in front" of screen: typing mode

        const newScreen1Mode = gameState.playerY + CONFIG.PLAYER.FEET_OFFSET > SCREENS.screen1.layering.threshold ? 'typing' : 'video';
        const newScreen2Mode = gameState.playerY + CONFIG.PLAYER.FEET_OFFSET > SCREENS.screen2.layering.threshold ? 'typing' : 'video';
        const newScreen3Mode = gameState.playerY + CONFIG.PLAYER.FEET_OFFSET > SCREENS.screen3.layering.threshold ? 'typing' : 'video';

        // Reset screen state if mode changed
        if (gameState.screen1.mode !== newScreen1Mode) {
            gameState.screen1.mode = newScreen1Mode;
            this.resetScreenForMode(gameState.screen1);
        }

        if (gameState.screen2.mode !== newScreen2Mode) {
            gameState.screen2.mode = newScreen2Mode;
            this.resetScreenForMode(gameState.screen2);
        }

        if (gameState.screen3.mode !== newScreen3Mode) {
            gameState.screen3.mode = newScreen3Mode;
            this.resetScreenForMode(gameState.screen3);
        }

        let needsUpdate = false;

        // Update Screen 1
        if (this.updateSingleScreen(gameState.screen1)) {
            needsUpdate = true;
        }

        // Update Screen 2
        if (this.updateSingleScreen(gameState.screen2)) {
            needsUpdate = true;
        }

        // Update Screen 3
        if (this.updateSingleScreen(gameState.screen3)) {
            needsUpdate = true;
        }

        // Only redraw if something changed
        if (needsUpdate) {
            this.updateScreenGraphics();
        }

        // No GIF position updates needed - using Phaser graphics for Pong game

    }

    resetScreenForMode(screenState) {
        if (screenState.mode === 'typing') {
            // Clean up video mode elements
            screenState.pongGame = null;

            // Reset typing mode
            screenState.characters = [];
            screenState.currentLine = 0;
            screenState.currentChar = 0;
            screenState.lineDelay = 0;
        } else if (screenState.mode === 'video') {
            // Clean up typing mode elements completely
            screenState.characters = [];
            screenState.currentLine = 0;
            screenState.currentChar = 0;
            screenState.lineDelay = 0;

            // Reset Pong game state
            screenState.pongGame = null;
        }

        // Force immediate screen redraw to clear any remnants
        this.updateScreenGraphics();
    }


    updateSingleScreen(screenState) {
        if (screenState.mode === 'typing') {
            return this.updateTypingMode(screenState);
        } else if (screenState.mode === 'video') {
            return this.updateVideoMode(screenState);
        }

        return false;
    }

    updateTypingMode(screenState) {
        let changed = false;

        // Handle line delay (pause between lines or screen clear)
        if (screenState.lineDelay > 0) {
            screenState.lineDelay--;
            return false;
        }

        screenState.timer++;

        // Type characters (every 3-5 frames for realistic typing speed)
        const typingSpeed = 3 + Math.random() * 2;
        if (screenState.timer >= typingSpeed) {
            screenState.timer = 0;
            changed = true;

            // Calculate screen dimensions
            const maxCharsPerLine = 18; // 20 width - 2 for borders
            const maxLines = 5; // 12 height / 2 (char + spacing)

            // Add a new character
            const isSpace = Math.random() < (1/6); // 1/6 probability of space
            const newChar = {
                line: screenState.currentLine,
                col: screenState.currentChar,
                visible: !isSpace,
                colorIndex: Math.floor(Math.random() * TYPING_COLORS.length)
            };

            screenState.characters.push(newChar);
            screenState.currentChar++;

            // Check if line is complete
            if (screenState.currentChar >= maxCharsPerLine) {
                screenState.currentChar = 0;
                screenState.currentLine++;

                // Short delay between lines
                screenState.lineDelay = 5 + Math.random() * 15; // 0.1-0.3 seconds

                // Check if screen is full
                if (screenState.currentLine >= maxLines) {
                    // Clear screen and start over
                    screenState.characters = [];
                    screenState.currentLine = 0;
                    screenState.currentChar = 0;

                    // Longer delay before starting new "page"
                    screenState.lineDelay = 60 + Math.random() * 120; // 1-3 seconds
                }
            }
        }

        return changed;
    }

    updateVideoMode(screenState) {
        screenState.timer++;

        // Update Pong game every frame for smooth animation
        if (screenState.timer >= 1) {
            screenState.timer = 0;
            this.updatePongGame(screenState);
            return true; // Always needs update in video mode
        }

        return false;
    }

    clearScreens() {
        // Clean up screen graphics
        if (this.screen1Graphics) {
            this.screen1Graphics.destroy();
            this.screen1Graphics = null;
        }
        if (this.screen2Graphics) {
            this.screen2Graphics.destroy();
            this.screen2Graphics = null;
        }

        // Reset Pong game states
        gameState.screen1.pongGame = null;
        gameState.screen2.pongGame = null;
    }

    // Update screen depths based on player position
    updateScreenLayers() {
        if (!this.screen1Graphics || !this.screen2Graphics) return;

        // Update screen1 depth
        const screen1Config = SCREENS.screen1;
        if (screen1Config.layering.type === 'dynamic') {
            const playerFeetY = gameState.playerY + CONFIG.PLAYER.FEET_OFFSET;
            const threshold = screen1Config.layering.threshold;
            const newDepth = playerFeetY < threshold ? screen1Config.layering.aboveLayer : screen1Config.layering.belowLayer;

            if (this.screen1Graphics.depth !== newDepth) {
                this.screen1Graphics.setDepth(newDepth);
            }
        }

        // Update screen2 depth
        const screen2Config = SCREENS.screen2;
        if (screen2Config.layering.type === 'dynamic') {
            const playerFeetY = gameState.playerY + CONFIG.PLAYER.FEET_OFFSET;
            const threshold = screen2Config.layering.threshold;
            const newDepth = playerFeetY < threshold ? screen2Config.layering.aboveLayer : screen2Config.layering.belowLayer;

            if (this.screen2Graphics.depth !== newDepth) {
                this.screen2Graphics.setDepth(newDepth);
            }
        }

        // Update screen3 depth
        const screen3Config = SCREENS.screen3;
        if (screen3Config.layering.type === 'dynamic') {
            const playerFeetY = gameState.playerY + CONFIG.PLAYER.FEET_OFFSET;
            const threshold = screen3Config.layering.threshold;
            const newDepth = playerFeetY < threshold ? screen3Config.layering.aboveLayer : screen3Config.layering.belowLayer;

            if (this.screen3Graphics.depth !== newDepth) {
                this.screen3Graphics.setDepth(newDepth);
            }
        }
    }
}
