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
        this.screen4Graphics = null;
        this.screen5Graphics = null;
        this.screen6Graphics = null;
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
        if (this.screen4Graphics) {
            this.screen4Graphics.destroy();
        }
        if (this.screen5Graphics) {
            this.screen5Graphics.destroy();
        }
        if (this.screen6Graphics) {
            this.screen6Graphics.destroy();
        }

        // Create graphics objects for all screens
        this.screen1Graphics = this.scene.add.graphics();
        this.screen2Graphics = this.scene.add.graphics();
        this.screen3Graphics = this.scene.add.graphics();
        this.screen4Graphics = this.scene.add.graphics();
        this.screen5Graphics = this.scene.add.graphics();
        this.screen6Graphics = this.scene.add.graphics();

        // Set room-specific screen modes
        this.setRoomSpecificScreenModes();

        // Set initial depths based on dynamic layering configuration
        this.updateScreenLayers();

        // Initial screen render
        this.updateScreenGraphics();
    }

    setRoomSpecificScreenModes() {
        // Set different screen modes based on the current room
        if (gameState.currentRoom === 'room3') {
            // In room3 (everyone seated correctly), customize screen modes
            gameState.screen1.mode = 'typing';
            gameState.screen2.mode = 'typing';
            gameState.screen3.mode = 'typing';
            gameState.screen4.mode = 'typing';
            gameState.screen5.mode = 'typing';
            gameState.screen6.mode = 'off';

            // Reset all screen states for the new modes
            this.resetScreenForMode(gameState.screen1);
            this.resetScreenForMode(gameState.screen2);
            this.resetScreenForMode(gameState.screen3);
            this.resetScreenForMode(gameState.screen4);
            this.resetScreenForMode(gameState.screen5);
            this.resetScreenForMode(gameState.screen6);
        }
        // For room1, use the default modes from gameState (already set)
    }

    updateScreenGraphics() {
        if (!this.screen1Graphics || !this.screen2Graphics || !this.screen3Graphics ||
            !this.screen4Graphics || !this.screen5Graphics || !this.screen6Graphics) return;

        // Clear all screens
        this.screen1Graphics.clear();
        this.screen2Graphics.clear();
        this.screen3Graphics.clear();
        this.screen4Graphics.clear();
        this.screen5Graphics.clear();
        this.screen6Graphics.clear();

        // Render screens using SCREENS configuration
        const screen1Pos = SCREENS.screen1.position;
        const screen2Pos = SCREENS.screen2.position;
        const screen3Pos = SCREENS.screen3.position;
        const screen4Pos = SCREENS.screen4.position;
        const screen5Pos = SCREENS.screen5.position;
        const screen6Pos = SCREENS.screen6.position;

        this.renderScreen(this.screen1Graphics, screen1Pos.x, screen1Pos.y, screen1Pos.width, screen1Pos.height, gameState.screen1, screen1Pos.big);
        this.renderScreen(this.screen2Graphics, screen2Pos.x, screen2Pos.y, screen2Pos.width, screen2Pos.height, gameState.screen2, screen2Pos.big);
        this.renderScreen(this.screen3Graphics, screen3Pos.x, screen3Pos.y, screen3Pos.width, screen3Pos.height, gameState.screen3, screen3Pos.big);
        this.renderScreen(this.screen4Graphics, screen4Pos.x, screen4Pos.y, screen4Pos.width, screen4Pos.height, gameState.screen4, screen4Pos.big);
        this.renderScreen(this.screen5Graphics, screen5Pos.x, screen5Pos.y, screen5Pos.width, screen5Pos.height, gameState.screen5, screen5Pos.big);
        this.renderScreen(this.screen6Graphics, screen6Pos.x, screen6Pos.y, screen6Pos.width, screen6Pos.height, gameState.screen6, screen6Pos.big);
    }

    renderScreen(graphics, x, y, width, height, screenState, isBig = false) {
        // Scale dimensions if big mode
        const scale = isBig ? 1.5 : 1;
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        // Dark screen background - completely clear the screen
        graphics.fillStyle(0x001100);
        graphics.fillRect(x, y, scaledWidth, scaledHeight);

        // Blue screen border/glow
        graphics.lineStyle(1, 0x3498db);
        graphics.strokeRect(x, y, scaledWidth, scaledHeight);

        if (screenState.mode === 'off') {
            this.renderOffMode(graphics, x, y, scaledWidth, scaledHeight, screenState, isBig);
        }
        else if (screenState.mode === 'typing') {
            this.renderTypingMode(graphics, x, y, scaledWidth, scaledHeight, screenState, isBig);
        } else if (screenState.mode === 'video') {
            this.renderVideoMode(graphics, x, y, scaledWidth, scaledHeight, screenState, isBig);
        }
    }

    renderOffMode(graphics, x, y, width, height, screenState, isBig = false) {
        // Dark screen background - completely clear the screen
        graphics.fillStyle(0x001100);
        graphics.fillRect(x, y+1, width-1, height-1);
    }

    renderTypingMode(graphics, x, y, width, height, screenState, isBig = false) {
        // Character rendering parameters - scale if big mode
        const scale = isBig ? 1.5 : 1;
        const charWidth = 1 * scale;
        const charHeight = 1 * scale;
        const charSpacingX = 1 * scale;
        const charSpacingY = 1 * scale;
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

    renderVideoMode(graphics, x, y, width, height, screenState, isBig = false) {
        // Initialize Pong game state if not exists
        if (!screenState.pongGame) {
            this.initPongGame(screenState, width, height, isBig);
        }

        // Render Pong game
        this.renderPongGame(graphics, x, y, width, height, screenState, isBig);

        // Add vignette effect around the edges
        //this.renderVignette(graphics, x, y, width, height);
    }

    initPongGame(screenState, width, height, isBig = false) {
        // Initialize bouncing ball game state
        const scale = isBig ? 1.5 : 1;
        screenState.pongGame = {
            // Ball properties
            ballX: Math.floor((width - 2) / 2),
            ballY: Math.floor((height - 2) / 2),
            ballVelX: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4) * scale,
            ballVelY: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3) * scale,
            ballSize: 1 * scale,

            // Game area
            gameWidth: width - 2, // Account for borders
            gameHeight: height - 2
        };
    }

    renderPongGame(graphics, x, y, width, height, screenState, isBig = false) {
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


    // Helper function to determine screen mode based on player position and orientation
    getScreenMode(screenConfig) {

        const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
        const playerFeetY = gameState.playerY + dimensions.FEET_OFFSET;
        const playerLeftX = gameState.playerX - dimensions.WIDTH / 2;
        const playerRightX = gameState.playerX + dimensions.WIDTH / 2;
        const screenLeftX = screenConfig.position.x;
        const screenRightX = screenConfig.position.x + screenConfig.position.width;

        // Check if player is behind screen (Y-based)
        const isBehindScreen = playerFeetY <= screenConfig.layering.threshold;

        // Check if player is looking away from screen (X-based)
        const isLookingAway = (
            // Player is to the left of screen and looking left
            (playerRightX < screenLeftX && gameState.playerOrientation === 'left') ||
            // Player is to the right of screen and looking right
            (playerLeftX > screenRightX && gameState.playerOrientation === 'right')
        );
        /*console.log(screenConfig);
        if(screenConfig.position.x === 55) {
        console.log(gameState.playerOrientation);
        console.log('islookingaway', isLookingAway);
        }*/

        // Switch to video mode if player is behind screen OR looking away
        return (isBehindScreen || isLookingAway) ? 'video' : 'typing';
    }

    updateScreenAnimations() {
        // Only update screens if we're in room1 or room3 and screens exist
        if ((gameState.currentRoom !== 'room1' && gameState.currentRoom !== 'room3') ||
            !this.screen1Graphics || !this.screen2Graphics ||
            !this.screen3Graphics || !this.screen4Graphics || !this.screen5Graphics || !this.screen6Graphics) {
            return;
        }

        // Update screen modes based on player position and orientation
        // Video mode when: player is behind screen OR looking away from screen
        // Typing mode when: player is in front of screen AND looking at screen

        // Get new modes based on current gameState modes and player position
        const newScreen1Mode = gameState.screen1.mode === 'off' ? 'off' : this.getScreenMode(SCREENS.screen1);
        const newScreen2Mode = gameState.screen2.mode === 'off' ? 'off' : this.getScreenMode(SCREENS.screen2);
        const newScreen3Mode = gameState.screen3.mode === 'off' ? 'off' : this.getScreenMode(SCREENS.screen3);
        const newScreen4Mode = gameState.screen4.mode === 'off' ? 'off' : this.getScreenMode(SCREENS.screen4);
        const newScreen5Mode = gameState.screen5.mode === 'off' ? 'off' : this.getScreenMode(SCREENS.screen5);
        const newScreen6Mode = gameState.screen6.mode === 'off' ? 'off' : this.getScreenMode(SCREENS.screen6);

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

        if (gameState.screen4.mode !== newScreen4Mode) {
            gameState.screen4.mode = newScreen4Mode;
            this.resetScreenForMode(gameState.screen4);
        }

        if (gameState.screen5.mode !== newScreen5Mode) {
            gameState.screen5.mode = newScreen5Mode;
            this.resetScreenForMode(gameState.screen5);
        }

        if (gameState.screen6.mode !== newScreen6Mode) {
            gameState.screen6.mode = newScreen6Mode;
            this.resetScreenForMode(gameState.screen6);
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

        // Update Screen 4
        if (this.updateSingleScreen(gameState.screen4)) {
            needsUpdate = true;
        }

        // Update Screen 5
        if (this.updateSingleScreen(gameState.screen5)) {
            needsUpdate = true;
        }

        // Update Screen 6
        if (this.updateSingleScreen(gameState.screen6)) {
            needsUpdate = true;
        }

        // Only redraw if something changed
        if (needsUpdate) {
            this.updateScreenGraphics();
        }

        // No GIF position updates needed - using Phaser graphics for Pong game

    }

    resetScreenForMode(screenState) {
        if (screenState.mode === 'typing' || screenState.mode === 'off') {
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
        if(screenState.mode === 'off') {
            return false;
        }

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
        if (this.screen3Graphics) {
            this.screen3Graphics.destroy();
            this.screen3Graphics = null;
        }
        if (this.screen4Graphics) {
            this.screen4Graphics.destroy();
            this.screen4Graphics = null;
        }
        if (this.screen5Graphics) {
            this.screen5Graphics.destroy();
            this.screen5Graphics = null;
        }
        if (this.screen6Graphics) {
            this.screen6Graphics.destroy();
            this.screen6Graphics = null;
        }

        // Reset Pong game states
        gameState.screen1.pongGame = null;
        gameState.screen2.pongGame = null;
        gameState.screen3.pongGame = null;
        gameState.screen4.pongGame = null;
        gameState.screen5.pongGame = null;
        gameState.screen6.pongGame = null;
    }

    // Update screen depths based on player position
    updateScreenLayers() {
        if (!this.screen1Graphics || !this.screen2Graphics || !this.screen3Graphics ||
            !this.screen4Graphics || !this.screen5Graphics || !this.screen6Graphics) return;

        // Update screen1 depth
        const screen1Config = SCREENS.screen1;
        if (screen1Config.layering.type === 'dynamic') {
            const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
            const playerFeetY = gameState.playerY + dimensions.FEET_OFFSET;
            const threshold = screen1Config.layering.threshold;
            const newDepth = playerFeetY < threshold ? screen1Config.layering.aboveLayer : screen1Config.layering.belowLayer;

            if (this.screen1Graphics.depth !== newDepth) {
                this.screen1Graphics.setDepth(newDepth);
            }
        }

        // Update screen2 depth
        const screen2Config = SCREENS.screen2;
        if (screen2Config.layering.type === 'dynamic') {
            const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
            const playerFeetY = gameState.playerY + dimensions.FEET_OFFSET;
            const threshold = screen2Config.layering.threshold;
            const newDepth = playerFeetY < threshold ? screen2Config.layering.aboveLayer : screen2Config.layering.belowLayer;

            if (this.screen2Graphics.depth !== newDepth) {
                this.screen2Graphics.setDepth(newDepth);
            }
        }

        // Update screen3 depth
        const screen3Config = SCREENS.screen3;
        if (screen3Config.layering.type === 'dynamic') {
            const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
            const playerFeetY = gameState.playerY + dimensions.FEET_OFFSET;
            const threshold = screen3Config.layering.threshold;
            const newDepth = playerFeetY < threshold ? screen3Config.layering.aboveLayer : screen3Config.layering.belowLayer;

            if (this.screen3Graphics.depth !== newDepth) {
                this.screen3Graphics.setDepth(newDepth);
            }

        }

        // Update screen4 depth
        const screen4Config = SCREENS.screen4;
        if (screen4Config.layering.type === 'dynamic') {
            const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
            const playerFeetY = gameState.playerY + dimensions.FEET_OFFSET;
            const threshold = screen4Config.layering.threshold;
            const newDepth = playerFeetY < threshold ? screen4Config.layering.aboveLayer : screen4Config.layering.belowLayer;

            if (this.screen4Graphics.depth !== newDepth) {
                this.screen4Graphics.setDepth(newDepth);
            }
        }

        // Update screen5 depth
        const screen5Config = SCREENS.screen5;
        if (screen5Config.layering.type === 'dynamic') {
            const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
            const playerFeetY = gameState.playerY + dimensions.FEET_OFFSET;
            const threshold = screen5Config.layering.threshold;
            const newDepth = playerFeetY < threshold ? screen5Config.layering.aboveLayer : screen5Config.layering.belowLayer;

            if (this.screen5Graphics.depth !== newDepth) {
                this.screen5Graphics.setDepth(newDepth);
            }
        }

        // Update screen6 depth
        const screen6Config = SCREENS.screen6;
        if (screen6Config.layering.type === 'dynamic') {
            const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
            const playerFeetY = gameState.playerY + dimensions.FEET_OFFSET;
            const threshold = screen6Config.layering.threshold;
            const newDepth = playerFeetY < threshold ? screen6Config.layering.aboveLayer : screen6Config.layering.belowLayer;

            if (this.screen6Graphics.depth !== newDepth) {
                this.screen6Graphics.setDepth(newDepth);
            }
        }
    }
}
