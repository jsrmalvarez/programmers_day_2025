/*
 * Room Definitions and Backgrounds
 * Manages room layouts, backgrounds, and hotspots
 */

import { CONFIG } from './config.js';

export class RoomManager {
    constructor(scene) {
        this.scene = scene;
        this.backgroundGraphics = null;
    }

    createRooms() {
        return {
            room1: {
                name: 'Office',
                background: this.createOfficeBackground.bind(this),
                hotspots: [
                    {
                        name: 'Door',
                        x: 280, y: 80, width: 30, height: 60,
                        action: this.scene.interactDoor.bind(this.scene)
                    },
                    {
                        name: 'Drawer',
                        x: 50, y: 100, width: 40, height: 20,
                        action: this.scene.interactDrawer.bind(this.scene)
                    }
                    // NPC hotspots will be added dynamically after NPCs are created
                ],
                walkableBounds: { x: 20, y: 60, width: 280, height: 100 }
            },
            room2: {
                name: 'Storage Room',
                background: this.createStorageBackground.bind(this),
                hotspots: [
                    {
                        name: 'Door',
                        x: 20, y: 80, width: 30, height: 60,
                        action: this.scene.returnToRoom1.bind(this.scene)
                    }
                ],
                walkableBounds: { x: 20, y: 60, width: 280, height: 100 }
            }
        };
    }

    createOfficeBackground() {
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
        }

        this.backgroundGraphics = this.scene.add.graphics();
        const g = this.backgroundGraphics;

        // Floor
        g.fillStyle(0x8e8e8e);
        g.fillRect(0, 0, CONFIG.VIRTUAL_WIDTH, CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT);

        // Walls
        g.fillStyle(0xd4d4d4);
        g.fillRect(0, 0, CONFIG.VIRTUAL_WIDTH, 50);
        g.fillRect(0, 0, 20, CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT);
        g.fillRect(CONFIG.VIRTUAL_WIDTH - 20, 0, 20, CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT);

        // Door
        const doorColor = this.scene.gameState.doorUnlocked ? 0x27ae60 : 0x8b4513;
        g.fillStyle(doorColor);
        g.fillRect(280, 80, 30, 60);
        g.fillStyle(0x2c3e50);
        g.fillRect(285, 85, 20, 50);

        // Door handle
        g.fillStyle(0xf1c40f);
        g.fillCircle(290, 110, 2);

        // Desk with drawer
        g.fillStyle(0x8b4513);
        g.fillRect(40, 90, 60, 40);

        // Drawer
        const drawerColor = this.scene.gameState.drawerOpen ? 0x654321 : 0x8b4513;
        g.fillStyle(drawerColor);
        g.fillRect(50, 100, 40, 20);
        if (!this.scene.gameState.drawerOpen) {
            g.fillStyle(0x2c3e50);
            g.fillCircle(70, 110, 2);
        }

        // Computers/desks for NPCs
        g.fillStyle(0x34495e);
        g.fillRect(90, 70, 30, 20); // Sarah's computer
        g.fillRect(190, 80, 30, 20); // Mike's computer

        // Create animated screens
        this.scene.screenManager.createAnimatedScreens();

        // Create NPCs using new NPC management system
        this.scene.npcManager.createAllNPCs();

        // Add NPC hotspots to the room after NPCs are created
        const npcHotspots = this.scene.npcManager.getAllHotspots();
        this.scene.rooms.room1.hotspots.push(...npcHotspots);

        // Key in drawer (if drawer is open and key not taken)
        if (this.scene.gameState.drawerOpen && !this.scene.gameState.keyTaken) {
            this.scene.keySprite = this.scene.add.sprite(70, 110, 'key');
            this.scene.keySprite.setDepth(50); // Higher depth to be above everything

            // Add key hotspot with larger area for easier clicking
            // Insert at the beginning so it gets checked first (higher priority than drawer)
            this.scene.rooms.room1.hotspots.unshift({
                name: 'Office Key',
                x: 60, y: 105, width: 20, height: 15,
                action: this.scene.takeKey.bind(this.scene)
            });
        }
    }

    createStorageBackground() {
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
        }

        this.backgroundGraphics = this.scene.add.graphics();
        const g = this.backgroundGraphics;

        // Floor
        g.fillStyle(0x7f8c8d);
        g.fillRect(0, 0, CONFIG.VIRTUAL_WIDTH, CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT);

        // Walls
        g.fillStyle(0xbdc3c7);
        g.fillRect(0, 0, CONFIG.VIRTUAL_WIDTH, 50);
        g.fillRect(0, 0, 20, CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT);
        g.fillRect(CONFIG.VIRTUAL_WIDTH - 20, 0, 20, CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT);

        // Door back to room 1
        g.fillStyle(0x27ae60);
        g.fillRect(20, 80, 30, 60);
        g.fillStyle(0x2c3e50);
        g.fillRect(25, 85, 20, 50);

        // Storage boxes
        g.fillStyle(0x8b4513);
        g.fillRect(80, 70, 40, 30);
        g.fillRect(140, 80, 35, 25);
        g.fillRect(200, 65, 45, 35);

        // Success message using bitmap font - pixel perfect
        const successText = this.scene.add.bitmapText(CONFIG.VIRTUAL_WIDTH / 2, 30, 'arcade', 'YOU DID IT!')
            .setOrigin(0.5)
            .setTint(0x2ecc71)
            .setFontSize(7)
            .setLineSpacing(10);
    }

    destroyBackground() {
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
            this.backgroundGraphics = null;
        }
    }
}
