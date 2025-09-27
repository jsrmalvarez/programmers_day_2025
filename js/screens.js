/*
 * Screen Animation System
 * Handles animated computer screens with typing and video modes
 */

import { gameState } from './gameState.js';
import { SCREEN_POSITIONS, VIDEO_COLORS, TYPING_COLORS, GAME_GIFS, SCREENS, CONFIG } from './config.js';

export class ScreenManager {
    constructor(scene) {
        this.scene = scene;
        this.screen1Graphics = null;
        this.screen2Graphics = null;
    }

    createAnimatedScreens() {
        // Clear existing screen graphics
        if (this.screen1Graphics) {
            this.screen1Graphics.destroy();
        }
        if (this.screen2Graphics) {
            this.screen2Graphics.destroy();
        }

        // Create graphics objects for both screens
        this.screen1Graphics = this.scene.add.graphics();
        this.screen2Graphics = this.scene.add.graphics();

        // Set initial depths based on dynamic layering configuration
        this.updateScreenLayers();

        // Initial screen render
        this.updateScreenGraphics();
    }

    updateScreenGraphics() {
        if (!this.screen1Graphics || !this.screen2Graphics) return;

        // Clear both screens
        this.screen1Graphics.clear();
        this.screen2Graphics.clear();


        this.renderScreen(this.screen1Graphics, 55, 86, 20, 12, gameState.screen1);
        this.renderScreen(this.screen2Graphics, 105, 86, 20, 12, gameState.screen2);
    }

    renderScreen(graphics, x, y, width, height, screenState) {
        // Dark screen background
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
        // If no GIF is selected, select one randomly
        if (!screenState.selectedGif) {
            screenState.selectedGif = GAME_GIFS[Math.floor(Math.random() * GAME_GIFS.length)];
        }

        // Create or update animated GIF element
        if (!screenState.gifElement) {
            this.createAnimatedGif(screenState, x, y, width, height);
        }

        // Update GIF element position and size
        if (screenState.gifElement) {
            this.updateGifPosition(screenState.gifElement, x, y, width, height);
        }

        // Add vignette effect around the edges
        this.renderVignette(graphics, x, y, width, height);
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

    createAnimatedGif(screenState, x, y, width, height) {
        // Create HTML img element for animated GIF
        const img = document.createElement('img');
        img.src = `assets/games_gif/${screenState.selectedGif.replace('_gif', '.gif')}`;
        img.style.position = 'absolute';
        img.style.imageRendering = 'pixelated'; // Maintain pixel art look
        img.style.imageRendering = 'crisp-edges'; // Firefox fallback
        img.style.zIndex = '5'; // Above canvas but below NPCs and UI
        img.style.pointerEvents = 'none'; // Don't interfere with game input

        // Add to DOM
        document.body.appendChild(img);
        screenState.gifElement = img;

        // Position and size the GIF
        this.updateGifPosition(img, x, y, width, height);
    }

    updateGifPosition(gifElement, screenX, screenY, screenWidth, screenHeight) {
        // Get canvas position and scale
        const canvas = this.scene.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this.scene.game.config.width;
        const scaleY = canvasRect.height / this.scene.game.config.height;

        // Calculate screen position in actual pixels
        const actualX = canvasRect.left + (screenX * scaleX);
        const actualY = canvasRect.top + (screenY * scaleY);
        const actualWidth = (screenWidth - 2) * scaleX; // -2 for border
        const actualHeight = (screenHeight - 2) * scaleY; // -2 for border

        // Position the GIF element
        gifElement.style.left = `${actualX + scaleX}px`; // +1 pixel for border
        gifElement.style.top = `${actualY + scaleY}px`; // +1 pixel for border
        gifElement.style.width = `${actualWidth}px`;
        gifElement.style.height = `${actualHeight}px`;
        gifElement.style.objectFit = 'contain'; // Maintain aspect ratio
    }

    updateScreenAnimations() {
        // Only update screens if we're in room1 and screens exist
        if (gameState.currentRoom !== 'room1' || !this.screen1Graphics || !this.screen2Graphics) {
            return;
        }

        // Update screen modes based on player Y position
        const newScreen1Mode = gameState.playerY + CONFIG.PLAYER.FEET_OFFSET > SCREEN_POSITIONS.screen1Y ? 'typing' : 'video';
        const newScreen2Mode = gameState.playerY + CONFIG.PLAYER.FEET_OFFSET > SCREEN_POSITIONS.screen2Y ? 'typing' : 'video';

        // Reset screen state if mode changed
        if (gameState.screen1.mode !== newScreen1Mode) {
            gameState.screen1.mode = newScreen1Mode;
            this.resetScreenForMode(gameState.screen1);
        }

        if (gameState.screen2.mode !== newScreen2Mode) {
            gameState.screen2.mode = newScreen2Mode;
            this.resetScreenForMode(gameState.screen2);
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

        // Only redraw if something changed
        if (needsUpdate) {
            this.updateScreenGraphics();
        }

        // Update GIF positions in case canvas moved/resized
        if (gameState.screen1.mode === 'video' && gameState.screen1.gifElement) {
            this.updateGifPosition(gameState.screen1.gifElement, 95, 72, 20, 12);
        }
        if (gameState.screen2.mode === 'video' && gameState.screen2.gifElement) {
            this.updateGifPosition(gameState.screen2.gifElement, 195, 82, 20, 12);
        }

    }

    resetScreenForMode(screenState) {
        if (screenState.mode === 'typing') {
            // Clean up video mode elements
            if (screenState.gifElement) {
                document.body.removeChild(screenState.gifElement);
                screenState.gifElement = null;
            }
            screenState.selectedGif = null;

            // Reset typing mode
            screenState.characters = [];
            screenState.currentLine = 0;
            screenState.currentChar = 0;
            screenState.lineDelay = 0;
            screenState.videoPixels = [];
        } else if (screenState.mode === 'video') {
            // Clean up typing mode elements
            screenState.characters = [];
            screenState.videoPixels = [];

            // Select a new random GIF for this video session
            screenState.selectedGif = null; // Will be selected in renderVideoMode

            // GIF element will be created in renderVideoMode
        }
    }

    getRandomVideoColor() {
        return VIDEO_COLORS[Math.floor(Math.random() * VIDEO_COLORS.length)];
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

        // Update video pixels every 2-4 frames for smooth animation
        const updateSpeed = 2 + Math.random() * 2;
        if (screenState.timer >= updateSpeed) {
            screenState.timer = 0;

            // Randomly change some pixels
            const changeCount = Math.floor(Math.random() * 5) + 1; // 1-5 pixels per update

            for (let i = 0; i < changeCount; i++) {
                const randomIndex = Math.floor(Math.random() * screenState.videoPixels.length);
                if (screenState.videoPixels[randomIndex]) {
                    screenState.videoPixels[randomIndex].color = this.getRandomVideoColor();
                }
            }

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

        // Clean up GIF elements
        if (gameState.screen1.gifElement) {
            if (gameState.screen1.gifElement.parentNode) {
                document.body.removeChild(gameState.screen1.gifElement);
            }
            gameState.screen1.gifElement = null;
        }
        if (gameState.screen2.gifElement) {
            if (gameState.screen2.gifElement.parentNode) {
                document.body.removeChild(gameState.screen2.gifElement);
            }
            gameState.screen2.gifElement = null;
        }

        // Reset GIF selection
        gameState.screen1.selectedGif = null;
        gameState.screen2.selectedGif = null;
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
                console.log(`Screen1: Player feet Y=${playerFeetY}, Threshold=${threshold}, Depth: ${this.screen1Graphics.depth} → ${newDepth}`);
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
                console.log(`Screen2: Player feet Y=${playerFeetY}, Threshold=${threshold}, Depth: ${this.screen2Graphics.depth} → ${newDepth}`);
            }
        }
    }
}
