/*
 * Sprite Creation and Management
 * Handles all sprite generation and texture creation
 */

export class SpriteManager {
    constructor(scene) {
        this.scene = scene;
    }

    createAllSprites() {
        // Create player sprites
        this.createPlayerSprites();

        // Create item sprites
        this.createItemSprites();

        // Create NPC sprites
        this.createNPCSprites();
    }

    createPlayerSprites() {
        const graphics = this.scene.add.graphics();

        // Player idle frame
        graphics.fillStyle(0x4a90e2);
        graphics.fillRect(0, 0, 12, 16);
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(2, 2, 8, 6); // head
        graphics.generateTexture('player_idle', 12, 16);
        graphics.clear();

        // Player walk frame 1
        graphics.fillStyle(0x4a90e2);
        graphics.fillRect(0, 0, 12, 16);
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(2, 2, 8, 6); // head
        graphics.fillStyle(0x333333);
        graphics.fillRect(1, 14, 3, 2); // left foot forward
        graphics.fillRect(8, 15, 3, 1); // right foot back
        graphics.generateTexture('player_walk1', 12, 16);
        graphics.clear();

        // Player walk frame 2
        graphics.fillStyle(0x4a90e2);
        graphics.fillRect(0, 0, 12, 16);
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(2, 2, 8, 6); // head
        graphics.fillStyle(0x333333);
        graphics.fillRect(8, 14, 3, 2); // right foot forward
        graphics.fillRect(1, 15, 3, 1); // left foot back
        graphics.generateTexture('player_walk2', 12, 16);
        graphics.clear();

        graphics.destroy();
    }

    createItemSprites() {
        const graphics = this.scene.add.graphics();

        // Create key sprite
        graphics.fillStyle(0xf1c40f);
        graphics.fillRect(0, 4, 8, 2);
        graphics.fillRect(6, 2, 2, 6);
        graphics.fillRect(8, 3, 2, 1);
        graphics.fillRect(8, 5, 2, 1);
        graphics.generateTexture('key', 10, 8);
        graphics.clear();

        graphics.destroy();
    }

    createNPCSprites() {
        const graphics = this.scene.add.graphics();

        // Create Sarah (red shirt)
        graphics.clear();
        this.drawNPCTexture(graphics, 0xe74c3c); // Red
        graphics.generateTexture('npc_sarah', 16, 24);

        // Create Mike (green shirt)
        graphics.clear();
        this.drawNPCTexture(graphics, 0x2ecc71); // Green
        graphics.generateTexture('npc_mike', 16, 24);

        graphics.destroy();
    }

    drawNPCTexture(graphics, shirtColor) {
        // Body (centered in 16x24 texture)
        graphics.fillStyle(shirtColor);
        graphics.fillRect(2, 8, 12, 16);

        // Head
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(4, 0, 8, 8);

        // Arms
        graphics.fillStyle(shirtColor);
        graphics.fillRect(0, 12, 4, 8); // Left arm
        graphics.fillRect(12, 12, 4, 8); // Right arm
    }

    createNPCSpritesInScene() {
        // Clear existing NPC sprites and overlays
        this.clearNPCSprites();

        // Create Sarah sprite (keep for game logic/interactions)
        this.scene.sarahSprite = this.scene.add.sprite(110, 89, 'npc_sarah');
        this.scene.sarahSprite.setDepth(20); // Same as player, above screens
        this.scene.sarahSprite.setVisible(false); // Hide Phaser sprite, use HTML overlay

        // Create Mike sprite (keep for game logic/interactions)
        this.scene.mikeSprite = this.scene.add.sprite(210, 99, 'npc_mike');
        this.scene.mikeSprite.setDepth(20); // Same as player, above screens
        this.scene.mikeSprite.setVisible(false); // Hide Phaser sprite, use HTML overlay

        // Create HTML overlays for NPCs (above GIF screens)
        this.createNPCOverlay('sarah', 110, 89, 0xe74c3c); // Red shirt
        this.createNPCOverlay('mike', 210, 99, 0x2ecc71); // Green shirt
    }

    createNPCOverlay(name, gameX, gameY, shirtColor) {
        // Create canvas element for NPC
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 24;
        canvas.style.position = 'absolute';
        canvas.style.imageRendering = 'pixelated';
        canvas.style.imageRendering = 'crisp-edges';
        canvas.style.zIndex = '15'; // Above GIF screens (z-index 5) but below UI
        canvas.style.pointerEvents = 'none';
        canvas.style.border = 'none';
        canvas.style.outline = 'none';
        canvas.style.boxSizing = 'border-box';

        // Draw NPC on canvas
        const ctx = canvas.getContext('2d');
        this.drawNPCOnCanvas(ctx, shirtColor);

        // Add to DOM and store reference
        document.body.appendChild(canvas);
        this.scene[`${name}Overlay`] = canvas;

        // Position the overlay
        this.updateNPCOverlayPosition(canvas, gameX, gameY);
    }

    drawNPCOnCanvas(ctx, shirtColor) {
        // Convert hex color to RGB
        const r = (shirtColor >> 16) & 255;
        const g = (shirtColor >> 8) & 255;
        const b = shirtColor & 255;
        const shirtRGB = `rgb(${r}, ${g}, ${b})`;

        // Body (centered in 16x24 canvas)
        ctx.fillStyle = shirtRGB;
        ctx.fillRect(2, 8, 12, 16);

        // Head (skin color)
        ctx.fillStyle = '#f5a623';
        ctx.fillRect(4, 0, 8, 8);

        // Arms
        ctx.fillStyle = shirtRGB;
        ctx.fillRect(0, 12, 4, 8); // Left arm
        ctx.fillRect(12, 12, 4, 8); // Right arm
    }

    updateNPCOverlayPosition(canvas, gameX, gameY) {
        // Get canvas position and scale
        const gameCanvas = this.scene.game.canvas;
        const canvasRect = gameCanvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this.scene.game.config.width;
        const scaleY = canvasRect.height / this.scene.game.config.height;

        // Calculate NPC position in actual pixels
        const actualX = canvasRect.left + (gameX * scaleX);
        const actualY = canvasRect.top + (gameY * scaleY);
        const actualWidth = 16 * scaleX;
        const actualHeight = 24 * scaleY;

        // Position the NPC overlay (centered on sprite position)
        canvas.style.left = `${actualX - actualWidth/2}px`;
        canvas.style.top = `${actualY - actualHeight/2}px`;
        canvas.style.width = `${actualWidth}px`;
        canvas.style.height = `${actualHeight}px`;
    }

    clearNPCSprites() {
        // Clear Phaser sprites
        if (this.scene.sarahSprite) {
            this.scene.sarahSprite.destroy();
            this.scene.sarahSprite = null;
        }
        if (this.scene.mikeSprite) {
            this.scene.mikeSprite.destroy();
            this.scene.mikeSprite = null;
        }

        // Clear HTML overlays
        if (this.scene.sarahOverlay) {
            if (this.scene.sarahOverlay.parentNode) {
                document.body.removeChild(this.scene.sarahOverlay);
            }
            this.scene.sarahOverlay = null;
        }
        if (this.scene.mikeOverlay) {
            if (this.scene.mikeOverlay.parentNode) {
                document.body.removeChild(this.scene.mikeOverlay);
            }
            this.scene.mikeOverlay = null;
        }
    }
}
