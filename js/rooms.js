/*
 * Room Definitions and Backgrounds
 * Manages room layouts, backgrounds, and hotspots
 */

import { CONFIG, ROOMS } from './config.js';
import { gameState } from './gameState.js';

export class RoomManager {
    constructor(scene) {
        this.scene = scene;
        this.backgroundGraphics = null;
        this.backgroundSprite = null;
    }

    createRooms() {
        // Start with the room configurations from config
        const rooms = JSON.parse(JSON.stringify(ROOMS));

        // Add runtime properties to room1
        rooms.room1 = {
            ...rooms.room1,
            background: this.createOfficeBackground.bind(this),
            hotspots: [
                {
                    name: 'Door',
                    x: 79, y: 26, width: 40, height: 65,
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
        };

        // Add runtime properties to room2
        rooms.room2 = {
            ...rooms.room2,
            background: this.createTerraceBackground.bind(this),
            hotspots: [
                {
                    name: 'Door',
                    x: 312, y: 85, width: 15, height: 75,
                    action: this.scene.interactDoor.bind(this.scene)
                }
            ],
            walkableBounds: { x: 20, y: 60, width: 280, height: 100 }
        };

        return rooms;
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

    createTerraceBackground() {
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
        }

        this.backgroundGraphics = this.scene.add.graphics();
        const g = this.backgroundGraphics;

        // Clear existing NPCs
        this.scene.npcManager.clearAllNPCs();

    }

    createImageBasedRoom(roomId) {
        const roomConfig = ROOMS[roomId];
        if (!roomConfig) {
            console.warn(`Room config not found for: ${roomId}`);
            return;
        }

        // Clear existing background
        this.destroyBackground();

        // Create background sprite if image is defined (or mask if debug mode is on)
        if (roomConfig.background.image) {
            if (CONFIG.DEBUG.SHOW_MASK && roomConfig.background.mask) {
                // Show mask instead of background for debugging
                this.backgroundSprite = this.scene.add.sprite(0, 0, roomConfig.background.mask);
            } else {
                // Show normal background
                this.backgroundSprite = this.scene.add.sprite(0, 0, roomConfig.background.image);
            }
            this.backgroundSprite.setOrigin(0, 0); // Top-left origin
            this.backgroundSprite.setDepth(0); // Background layer
        }

        // Load collision mask
        if (roomConfig.background.mask) {
            this.scene.collisionManager.loadMask(roomConfig.background.mask);
        }

        // Initialize hotspot debug rendering
        this.renderHotspotDebug();

        // Create room sprites with layers
        this.scene.roomSpriteManager.createSpritesForRoom(roomConfig);

        // Update dynamic layering based on current player position
        this.scene.roomSpriteManager.updateAllDynamicLayers();

        if (roomId === 'room1') {
            // Create NPCs using new NPC management system
            this.scene.npcManager.createAllNPCs();

            // Add NPC hotspots to the room after NPCs are created
            const npcHotspots = this.scene.npcManager.getAllHotspots();
            this.scene.rooms[roomId].hotspots.push(...npcHotspots);

            // Create animated screens

            this.scene.screenManager.createAnimatedScreens();
        }

        // Update all dynamic layering based on current player position
        this.scene.roomSpriteManager.updateAllDynamicLayers();

        if (roomId === 'room1') {
            this.scene.npcManager.updateAllNPCLayers();
            this.scene.screenManager.updateScreenLayers();
        }

        // Handle special room elements (key, etc.)
        this.createSpecialElements(roomId);
    }

    createSpecialElements(roomId) {
        if (roomId === 'room1') {
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
        } else if (roomId === 'room2') {
            // Success message using bitmap font - pixel perfect
         /*   const successText = this.scene.add.bitmapText(CONFIG.VIRTUAL_WIDTH / 2, 30, 'arcade', 'YOU DID IT!')
                .setOrigin(0.5)
                .setTint(0x2ecc71)
                .setFontSize(7)
                .setLineSpacing(10);*/
        }
    }

    destroyBackground() {
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
            this.backgroundGraphics = null;
        }
        if (this.backgroundSprite) {
            this.backgroundSprite.destroy();
            this.backgroundSprite = null;
        }
    }

    // Debug method to refresh current room (for mask/background toggle)
    refreshCurrentRoom() {
        const currentRoom = this.scene.gameState.currentRoom;
        const roomConfig = ROOMS[currentRoom];

        if (roomConfig && roomConfig.background.image) {
            // Destroy current background
            this.destroyBackground();

            // Create new background based on debug setting
            if (CONFIG.DEBUG.SHOW_MASK && roomConfig.background.mask) {
                // Show mask instead of background
                this.backgroundSprite = this.scene.add.sprite(0, 0, roomConfig.background.mask);
                this.backgroundSprite.setOrigin(0, 0);
                this.backgroundSprite.setDepth(0);
            } else {
                // Show normal background
                this.backgroundSprite = this.scene.add.sprite(0, 0, roomConfig.background.image);
                this.backgroundSprite.setOrigin(0, 0);
                this.backgroundSprite.setDepth(0);
            }
        }

        // Update hotspot debug rendering
        this.updateHotspotDebug();
    }

    renderHotspotDebug() {
        // Create graphics object for hotspot debug rectangles
        if (!this.hotspotDebugGraphics) {
            this.hotspotDebugGraphics = this.scene.add.graphics();
            this.hotspotDebugGraphics.setDepth(100); // High depth to show on top
        }

        this.updateHotspotDebug();
    }

    updateHotspotDebug() {
        if (!this.hotspotDebugGraphics) return;

        // Clear previous hotspot rectangles
        this.hotspotDebugGraphics.clear();

        if (CONFIG.DEBUG.SHOW_HOTSPOTS) {
            // Draw red rectangles for all hotspots in current room
            this.hotspotDebugGraphics.lineStyle(1, 0xff0000); // Red outline
            this.hotspotDebugGraphics.fillStyle(0xff0000, 0.2); // Semi-transparent red fill

            const room = this.scene.rooms[gameState.currentRoom];
            for (const hotspot of room.hotspots) {
                this.hotspotDebugGraphics.fillRect(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
                this.hotspotDebugGraphics.strokeRect(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
            }
        }
    }
}
