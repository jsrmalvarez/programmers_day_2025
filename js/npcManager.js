/*
 * NPC Management System
 * Handles creation, interaction, and management of all NPCs
 */

import { NPCS, CONFIG, getDialogSet } from './config.js';
import { gameState } from './gameState.js';

export class NPC {
    constructor(id, config, scene) {
        this.id = id;
        this.name = config.name;
        this.position = config.position;
        this.shirtColor = config.shirtColor;
        this.dialogs = config.dialogs;
        this.hotspot = config.hotspot;
        this.layering = config.layering; // Dynamic layering configuration
        this.scene = scene;

        // Phaser sprite (for game logic and rendering)
        this.sprite = null;
    }

    create() {
        // Create visible Phaser sprite with dynamic depth layering
        this.sprite = this.scene.add.sprite(this.position.x, this.position.y, `npc_${this.id}`);
        this.sprite.setVisible(true);

        // Set initial depth based on layering configuration
        this.updateDepth();
    }

    updateDepth() {
        if (!this.sprite || !this.layering) return;

        if (this.layering.type === 'dynamic') {
            // Use player's feet position for realistic layering
            const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
            const playerFeetY = gameState.playerY + dimensions.FEET_OFFSET;
            const threshold = this.layering.threshold;
            const newDepth = playerFeetY < threshold ? this.layering.aboveLayer : this.layering.belowLayer;

            if (this.sprite.depth !== newDepth) {
                this.sprite.setDepth(newDepth);
            }
        } else {
            // Static layering fallback
            this.sprite.setDepth(this.layering.layer || 15);
        }
    }


    talk() {
        // Determine which dialog set to use
        const dialogSet = getDialogSet(gameState, this.id);

        let dialogIndex = Math.round(Math.random() * dialogSet.length);
        if(dialogIndex == dialogSet.length){
            dialogIndex--;
        }
        const dialog = dialogSet[dialogIndex];

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

    // Update all NPC depths based on current player position
    updateAllNPCLayers() {
        for (const npc of this.npcs.values()) {
            npc.updateDepth();
        }
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
