/*
 * NPC Management System
 * Handles creation, interaction, and management of all NPCs
 */

import { NPCS } from './config.js';
import { gameState } from './gameState.js';

export class NPC {
    constructor(id, config, scene) {
        this.id = id;
        this.name = config.name;
        this.position = config.position;
        this.shirtColor = config.shirtColor;
        this.dialogs = config.dialogs;
        this.hotspot = config.hotspot;
        this.scene = scene;

        // Individual dialog state
        this.dialogIndex = 0;

        // Phaser sprite (for game logic)
        this.sprite = null;

        // HTML overlay (for rendering)
        this.overlay = null;
    }

    create() {
        // Create Phaser sprite for game logic/interactions
        this.sprite = this.scene.add.sprite(this.position.x, this.position.y, `npc_${this.id}`);
        this.sprite.setDepth(20);
        this.sprite.setVisible(false); // Hidden, using HTML overlay for rendering

        // Create HTML overlay for rendering
        this.createOverlay();
    }

    createOverlay() {
        // Create canvas element for NPC
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 24;
        canvas.style.position = 'absolute';
        canvas.style.imageRendering = 'pixelated';
        canvas.style.imageRendering = 'crisp-edges';
        canvas.style.zIndex = '10'; // Above GIF screens (z-index 5) but below player
        canvas.style.pointerEvents = 'none';
        canvas.style.border = 'none';
        canvas.style.outline = 'none';
        canvas.style.boxSizing = 'border-box';

        // Draw NPC on canvas
        const ctx = canvas.getContext('2d');
        this.drawOnCanvas(ctx);

        // Add to DOM and store reference
        document.body.appendChild(canvas);
        this.overlay = canvas;

        // Position the overlay
        this.updateOverlayPosition();
    }

    drawOnCanvas(ctx) {
        // Convert hex color to RGB
        const r = (this.shirtColor >> 16) & 255;
        const g = (this.shirtColor >> 8) & 255;
        const b = this.shirtColor & 255;
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

    updateOverlayPosition() {
        if (!this.overlay) return;

        // Get canvas position and scale
        const gameCanvas = this.scene.game.canvas;
        const canvasRect = gameCanvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this.scene.game.config.width;
        const scaleY = canvasRect.height / this.scene.game.config.height;

        // Calculate NPC position in actual pixels
        const actualX = canvasRect.left + (this.position.x * scaleX);
        const actualY = canvasRect.top + (this.position.y * scaleY);
        const actualWidth = 16 * scaleX;
        const actualHeight = 24 * scaleY;

        // Position the NPC overlay (centered on sprite position)
        this.overlay.style.left = `${actualX - actualWidth/2}px`;
        this.overlay.style.top = `${actualY - actualHeight/2}px`;
        this.overlay.style.width = `${actualWidth}px`;
        this.overlay.style.height = `${actualHeight}px`;
    }

    talk() {
        // Determine which dialog set to use
        const dialogSet = gameState.doorUnlocked ?
            this.dialogs.afterDoorUnlocked :
            this.dialogs.beforeDoorUnlocked;

        // Get current dialog
        const dialog = dialogSet[Math.min(this.dialogIndex, dialogSet.length - 1)];
        this.dialogIndex++;

        // Show message
        this.scene.uiManager.showMessage(`${this.name}: "${dialog}"`);
    }

    getHotspot() {
        return {
            name: this.name,
            x: this.hotspot.x,
            y: this.hotspot.y,
            width: this.hotspot.width,
            height: this.hotspot.height,
            action: () => this.talk()
        };
    }

    destroy() {
        // Clean up Phaser sprite
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }

        // Clean up HTML overlay
        if (this.overlay) {
            if (this.overlay.parentNode) {
                document.body.removeChild(this.overlay);
            }
            this.overlay = null;
        }
    }
}

export class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.npcs = new Map();
    }

    createAllNPCs() {
        // Clear existing NPCs
        this.clearAllNPCs();

        // Create NPCs from config
        for (const [id, config] of Object.entries(NPCS)) {
            const npc = new NPC(id, config, this.scene);
            npc.create();
            this.npcs.set(id, npc);
        }
    }

    updateAllOverlayPositions() {
        for (const npc of this.npcs.values()) {
            npc.updateOverlayPosition();
        }
    }

    getAllHotspots() {
        const hotspots = [];
        for (const npc of this.npcs.values()) {
            hotspots.push(npc.getHotspot());
        }
        return hotspots;
    }

    clearAllNPCs() {
        for (const npc of this.npcs.values()) {
            npc.destroy();
        }
        this.npcs.clear();
    }

    // Helper method to get NPC by ID
    getNPC(id) {
        return this.npcs.get(id);
    }

    // Helper method to add a new NPC dynamically
    addNPC(id, config) {
        if (this.npcs.has(id)) {
            this.npcs.get(id).destroy();
        }

        const npc = new NPC(id, config, this.scene);
        npc.create();
        this.npcs.set(id, npc);

        return npc;
    }

    // Helper method to remove an NPC
    removeNPC(id) {
        const npc = this.npcs.get(id);
        if (npc) {
            npc.destroy();
            this.npcs.delete(id);
        }
    }
}
