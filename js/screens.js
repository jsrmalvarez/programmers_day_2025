/*
 * Screen Animation System
 * Handles animated computer screens with typing and video modes
 */

import { gameState } from './gameState.js';
import { SCREEN_POSITIONS, VIDEO_COLORS, TYPING_COLORS } from './config.js';

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

        // Set depth to be above background but below NPCs and UI
        this.screen1Graphics.setDepth(10);
        this.screen2Graphics.setDepth(10);

        // Initial screen render
        this.updateScreenGraphics();
    }

    updateScreenGraphics() {
        if (!this.screen1Graphics || !this.screen2Graphics) return;

        // Clear both screens
        this.screen1Graphics.clear();
        this.screen2Graphics.clear();

        // Screen 1 (Sarah's computer) - 95, 72, 20x12
        this.renderScreen(this.screen1Graphics, 95, 72, 20, 12, gameState.screen1);

        // Screen 2 (Mike's computer) - 195, 82, 20x12
        this.renderScreen(this.screen2Graphics, 195, 82, 20, 12, gameState.screen2);
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
        // Render colorful video pixels
        for (const pixel of screenState.videoPixels) {
            const pixelX = x + 1 + pixel.x;
            const pixelY = y + 1 + pixel.y;

            // Make sure pixel is within screen bounds
            if (pixelX < x + width - 1 && pixelY < y + height - 1) {
                graphics.fillStyle(pixel.color);
                graphics.fillRect(pixelX, pixelY, 1, 1);
            }
        }
    }

    updateScreenAnimations() {
        // Only update screens if we're in room1 and screens exist
        if (gameState.currentRoom !== 'room1' || !this.screen1Graphics || !this.screen2Graphics) {
            return;
        }

        // Update screen modes based on player Y position
        const newScreen1Mode = gameState.playerY > SCREEN_POSITIONS.screen1Y ? 'typing' : 'video';
        const newScreen2Mode = gameState.playerY > SCREEN_POSITIONS.screen2Y ? 'typing' : 'video';

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
    }

    resetScreenForMode(screenState) {
        if (screenState.mode === 'typing') {
            // Reset typing mode
            screenState.characters = [];
            screenState.currentLine = 0;
            screenState.currentChar = 0;
            screenState.lineDelay = 0;
            screenState.videoPixels = [];
        } else if (screenState.mode === 'video') {
            // Initialize video mode with random colored rectangles
            screenState.videoPixels = [];
            screenState.characters = [];

            // Create initial random video pixels
            const maxPixelsX = 18; // Screen width - borders
            const maxPixelsY = 10; // Screen height - borders

            for (let y = 0; y < maxPixelsY; y++) {
                for (let x = 0; x < maxPixelsX; x++) {
                    screenState.videoPixels.push({
                        x: x,
                        y: y,
                        color: this.getRandomVideoColor()
                    });
                }
            }
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
        if (this.screen1Graphics) {
            this.screen1Graphics.destroy();
            this.screen1Graphics = null;
        }
        if (this.screen2Graphics) {
            this.screen2Graphics.destroy();
            this.screen2Graphics = null;
        }
    }
}
