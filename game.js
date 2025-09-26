/*
 * Office Adventure - Point & Click Game
 *
 * CONTROLS:
 * - Left click to walk to a point
 * - Left click on hotspots to interact
 * - Click inventory items to select, then click hotspots to use
 *
 * HOW TO EXTEND:
 * - Add rooms in the ROOMS object
 * - Add hotspots in room.hotspots arrays
 * - Add items in the ITEMS object
 * - Modify dialog in NPC objects
 */

// Game configuration
const CONFIG = {
    VIRTUAL_WIDTH: 320,
    VIRTUAL_HEIGHT: 200,
    INVENTORY_HEIGHT: 40,
    SCALE_MODE: Phaser.Scale.FIT,
    PIXEL_ART: true
};

// Sound effects as base64 WAV data (minimal)
const SOUNDS = {
    walk: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBDuBzvLZiTYIG2m98OScTgwOUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWT' +
           'wwOUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWUQ4PUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7bdiFgoqjdX1unEiBC13yO/eizEI',
    unlock: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBDuBzvLZiTYIG2m98OScTgwOUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWT' +
             'wwOUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWUQ4PUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7bdiFgoqjdX1unEiBC13yO/eizEI'
};

// Game state
let gameState = {
    currentRoom: 'room1',
    inventory: [],
    selectedItem: null,
    doorUnlocked: false,
    drawerOpen: false,
    keyTaken: false,
    npc1DialogIndex: 0,
    npc2DialogIndex: 0,
    playerX: 160,
    playerY: 120,
    targetX: 160,
    targetY: 120,
    isWalking: false,
    walkFrame: 0,
    walkTimer: 0,
    // Screen animation states (independent)
    screen1: {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [] // Array of character data for current screen
    },
    screen2: {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 30, // Start with different timing
        characters: [] // Array of character data for current screen
    }
};

// Items definition
const ITEMS = {
    key: {
        name: 'Office Key',
        sprite: 'key'
    }
};

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.tooltip = null;
        this.pendingInteraction = null;
    }

    preload() {
        // Create pixel art sprites programmatically
        this.createSprites();
    }

    create() {
        // Set up pixel perfect rendering
        this.cameras.main.setRoundPixels(true);

        // Initialize systems
        this.setupInput();
        this.setupUI();
        this.createRooms();
        this.switchToRoom(gameState.currentRoom);

        // Get tooltip element
        this.tooltip = document.getElementById('tooltip');

        // Update loop
        this.time.addEvent({
            delay: 16,
            callback: this.updateGame,
            callbackScope: this,
            loop: true
        });
    }

    createSprites() {
        // Create player sprite (simple rectangle with animation frames)
        const playerGraphics = this.add.graphics();

        // Player idle frame
        playerGraphics.fillStyle(0x4a90e2);
        playerGraphics.fillRect(0, 0, 12, 16);
        playerGraphics.fillStyle(0xf5a623);
        playerGraphics.fillRect(2, 2, 8, 6); // head
        playerGraphics.generateTexture('player_idle', 12, 16);
        playerGraphics.clear();

        // Player walk frame 1
        playerGraphics.fillStyle(0x4a90e2);
        playerGraphics.fillRect(0, 0, 12, 16);
        playerGraphics.fillStyle(0xf5a623);
        playerGraphics.fillRect(2, 2, 8, 6); // head
        playerGraphics.fillStyle(0x333333);
        playerGraphics.fillRect(1, 14, 3, 2); // left foot forward
        playerGraphics.fillRect(8, 15, 3, 1); // right foot back
        playerGraphics.generateTexture('player_walk1', 12, 16);
        playerGraphics.clear();

        // Player walk frame 2
        playerGraphics.fillStyle(0x4a90e2);
        playerGraphics.fillRect(0, 0, 12, 16);
        playerGraphics.fillStyle(0xf5a623);
        playerGraphics.fillRect(2, 2, 8, 6); // head
        playerGraphics.fillStyle(0x333333);
        playerGraphics.fillRect(8, 14, 3, 2); // right foot forward
        playerGraphics.fillRect(1, 15, 3, 1); // left foot back
        playerGraphics.generateTexture('player_walk2', 12, 16);

        // Create key sprite
        playerGraphics.clear();
        playerGraphics.fillStyle(0xf1c40f);
        playerGraphics.fillRect(0, 4, 8, 2);
        playerGraphics.fillRect(6, 2, 2, 6);
        playerGraphics.fillRect(8, 3, 2, 1);
        playerGraphics.fillRect(8, 5, 2, 1);
        playerGraphics.generateTexture('key', 10, 8);

        // Create NPC sprites
        this.createNPCTextures(playerGraphics);

        playerGraphics.destroy();
    }

    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            const x = Math.floor(pointer.x * CONFIG.VIRTUAL_WIDTH / this.cameras.main.width);
            const y = Math.floor(pointer.y * CONFIG.VIRTUAL_HEIGHT / this.cameras.main.height);

            this.handleClick(x, y);
        });

        this.input.on('pointermove', (pointer) => {
            const x = Math.floor(pointer.x * CONFIG.VIRTUAL_WIDTH / this.cameras.main.width);
            const y = Math.floor(pointer.y * CONFIG.VIRTUAL_HEIGHT / this.cameras.main.height);

            this.handleMouseMove(x, y);
        });
    }

    setupUI() {
        // Create inventory background
        this.inventoryBg = this.add.graphics();
        this.inventoryBg.fillStyle(0x2c3e50);
        this.inventoryBg.fillRect(0, CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT, CONFIG.VIRTUAL_WIDTH, CONFIG.INVENTORY_HEIGHT);
        this.inventoryBg.setDepth(100);

        // Inventory slots
        this.inventorySlots = [];
        for (let i = 0; i < 8; i++) {
            const slotX = 10 + i * 35;
            const slotY = CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT + 5;

            const slot = this.add.graphics();
            slot.lineStyle(1, 0x34495e);
            slot.strokeRect(slotX, slotY, 30, 30);
            slot.setDepth(101);

            this.inventorySlots.push({
                x: slotX,
                y: slotY,
                width: 30,
                height: 30,
                item: null,
                sprite: null
            });
        }
    }

    createRooms() {
        this.rooms = {
            room1: {
                name: 'Office',
                background: this.createOfficeBackground.bind(this),
                hotspots: [
                    {
                        name: 'Door',
                        x: 280, y: 80, width: 30, height: 60,
                        action: this.interactDoor.bind(this)
                    },
                    {
                        name: 'Drawer',
                        x: 50, y: 100, width: 40, height: 20,
                        action: this.interactDrawer.bind(this)
                    },
                    {
                        name: 'Sarah',
                        x: 100, y: 80, width: 20, height: 30,
                        action: this.talkToNPC1.bind(this)
                    },
                    {
                        name: 'Mike',
                        x: 200, y: 90, width: 20, height: 30,
                        action: this.talkToNPC2.bind(this)
                    }
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
                        action: this.returnToRoom1.bind(this)
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

        this.backgroundGraphics = this.add.graphics();
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
        g.fillStyle(gameState.doorUnlocked ? 0x27ae60 : 0x8b4513);
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
        g.fillStyle(gameState.drawerOpen ? 0x654321 : 0x8b4513);
        g.fillRect(50, 100, 40, 20);
        if (!gameState.drawerOpen) {
            g.fillStyle(0x2c3e50);
            g.fillCircle(70, 110, 2);
        }

        // Computers/desks for NPCs
        g.fillStyle(0x34495e);
        g.fillRect(90, 70, 30, 20); // Sarah's computer
        g.fillRect(190, 80, 30, 20); // Mike's computer

        // Computer screens - will be animated separately
        this.createAnimatedScreens();

        // Create NPCs as sprites (higher layer than screens)
        this.createNPCSprites();

        // Key in drawer (if drawer is open and key not taken)
        if (gameState.drawerOpen && !gameState.keyTaken) {
            this.keySprite = this.add.sprite(70, 110, 'key');
            this.keySprite.setDepth(50); // Higher depth to be above everything

            // Add key hotspot with larger area for easier clicking
            // Insert at the beginning so it gets checked first (higher priority than drawer)
            this.rooms.room1.hotspots.unshift({
                name: 'Office Key',
                x: 60, y: 105, width: 20, height: 15,
                action: this.takeKey.bind(this)
            });
        }
    }

    createNPCTextures(graphics) {
        // Create Sarah (red shirt)
        graphics.clear();
        this.drawNPCTexture(graphics, 0xe74c3c); // Red
        graphics.generateTexture('npc_sarah', 16, 24);

        // Create Mike (green shirt)
        graphics.clear();
        this.drawNPCTexture(graphics, 0x2ecc71); // Green
        graphics.generateTexture('npc_mike', 16, 24);
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

    createNPCSprites() {
        // Clear existing NPC sprites
        if (this.sarahSprite) {
            this.sarahSprite.destroy();
        }
        if (this.mikeSprite) {
            this.mikeSprite.destroy();
        }

        // Create Sarah sprite
        this.sarahSprite = this.add.sprite(110, 89, 'npc_sarah');
        this.sarahSprite.setDepth(20); // Same as player, above screens

        // Create Mike sprite
        this.mikeSprite = this.add.sprite(210, 99, 'npc_mike');
        this.mikeSprite.setDepth(20); // Same as player, above screens
    }

    createStorageBackground() {
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
        }

        this.backgroundGraphics = this.add.graphics();
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

        // Success message
        this.add.text(CONFIG.VIRTUAL_WIDTH / 2, 30, 'Store room unlocked. You did it!', {
            fontSize: '12px',
            fill: '#2ecc71',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
    }

    switchToRoom(roomId) {
        gameState.currentRoom = roomId;
        const room = this.rooms[roomId];

        // Clear pending interactions when switching rooms
        this.pendingInteraction = null;

        // Clear existing sprites
        if (this.playerSprite) {
            this.playerSprite.destroy();
        }
        if (this.keySprite) {
            this.keySprite.destroy();
            this.keySprite = null;
        }

        // Clear screen graphics
        if (this.screen1Graphics) {
            this.screen1Graphics.destroy();
            this.screen1Graphics = null;
        }
        if (this.screen2Graphics) {
            this.screen2Graphics.destroy();
            this.screen2Graphics = null;
        }

        // Clear NPC sprites
        if (this.sarahSprite) {
            this.sarahSprite.destroy();
            this.sarahSprite = null;
        }
        if (this.mikeSprite) {
            this.mikeSprite.destroy();
            this.mikeSprite = null;
        }

        // Reset hotspots (remove key hotspot if it was added) - do this BEFORE creating background
        if (roomId === 'room1') {
            // Remove key hotspot if it exists (it would be at the beginning of the array)
            if (this.rooms.room1.hotspots.length > 0 && this.rooms.room1.hotspots[0].name === 'Office Key') {
                this.rooms.room1.hotspots.shift();
            }
        }

        // Create background (this will add key hotspot if needed)
        room.background();

        // Create player sprite
        this.playerSprite = this.add.sprite(gameState.playerX, gameState.playerY, 'player_idle');
        this.playerSprite.setDepth(20);
    }

    handleClick(x, y) {
        // Check inventory clicks first
        if (y >= CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT) {
            this.handleInventoryClick(x, y);
            return;
        }

        // Check hotspot clicks
        const room = this.rooms[gameState.currentRoom];
        for (const hotspot of room.hotspots) {
            if (x >= hotspot.x && x <= hotspot.x + hotspot.width &&
                y >= hotspot.y && y <= hotspot.y + hotspot.height) {

                // Check if player is close enough to interact
                if (this.isPlayerNearHotspot(hotspot)) {
                    hotspot.action();
                } else {
                    // Move player closer to the hotspot, then interact when close
                    this.movePlayerToHotspot(hotspot);
                }
                return;
            }
        }

        // Move player
        this.movePlayerTo(x, y);
    }

    handleMouseMove(x, y) {
        let tooltipText = '';

        // Check hotspots
        if (y < CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT) {
            const room = this.rooms[gameState.currentRoom];
            for (const hotspot of room.hotspots) {

                if (x >= hotspot.x && x <= hotspot.x + hotspot.width &&
                    y >= hotspot.y && y <= hotspot.y + hotspot.height) {
                    tooltipText = hotspot.name;
                    if (gameState.selectedItem) {
                        tooltipText = `Use ${gameState.selectedItem.name} with ${hotspot.name}`;
                    }
                    break;
                }
            }
        } else {
            // Check inventory
            for (const slot of this.inventorySlots) {
                if (x >= slot.x && x <= slot.x + slot.width &&
                    y >= slot.y && y <= slot.y + slot.height && slot.item) {
                    tooltipText = slot.item.name;
                    break;
                }
            }
        }

        this.showTooltip(tooltipText, x, y);
    }

    showTooltip(text, x, y) {
        if (text) {
            this.tooltip.textContent = text;
            this.tooltip.style.display = 'block';
            this.tooltip.style.left = (x * this.cameras.main.width / CONFIG.VIRTUAL_WIDTH) + 'px';
            this.tooltip.style.top = (y * this.cameras.main.height / CONFIG.VIRTUAL_HEIGHT - 25) + 'px';
        } else {
            this.tooltip.style.display = 'none';
        }
    }

    handleInventoryClick(x, y) {
        for (let i = 0; i < this.inventorySlots.length; i++) {
            const slot = this.inventorySlots[i];
            if (x >= slot.x && x <= slot.x + slot.width &&
                y >= slot.y && y <= slot.y + slot.height && slot.item) {

                // Deselect previously selected item
                if (gameState.selectedItem) {
                    this.deselectItem();
                }

                // Select this item
                gameState.selectedItem = slot.item;
                this.highlightInventorySlot(i);
                break;
            }
        }
    }

    highlightInventorySlot(index) {
        // Remove previous highlights
        this.inventorySlots.forEach(slot => {
            if (slot.highlight) {
                slot.highlight.destroy();
                slot.highlight = null;
            }
        });

        // Add highlight to selected slot
        if (index >= 0 && index < this.inventorySlots.length) {
            const slot = this.inventorySlots[index];
            slot.highlight = this.add.graphics();
            slot.highlight.lineStyle(2, 0xf1c40f);
            slot.highlight.strokeRect(slot.x, slot.y, slot.width, slot.height);
            slot.highlight.setDepth(102);
        }
    }

    deselectItem() {
        gameState.selectedItem = null;
        this.inventorySlots.forEach(slot => {
            if (slot.highlight) {
                slot.highlight.destroy();
                slot.highlight = null;
            }
        });
    }

    isPlayerNearHotspot(hotspot) {
        const INTERACTION_DISTANCE = 30; // pixels

        // Calculate center of hotspot
        const hotspotCenterX = hotspot.x + hotspot.width / 2;
        const hotspotCenterY = hotspot.y + hotspot.height / 2;

        // Calculate distance from player to hotspot center
        const dx = gameState.playerX - hotspotCenterX;
        const dy = gameState.playerY - hotspotCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= INTERACTION_DISTANCE;
    }

    movePlayerToHotspot(hotspot) {
        // Calculate a good position near the hotspot for interaction
        const hotspotCenterX = hotspot.x + hotspot.width / 2;
        const hotspotCenterY = hotspot.y + hotspot.height / 2;

        // Move to a position close to the hotspot
        const APPROACH_DISTANCE = 20;
        let targetX, targetY;

        // Calculate the closest walkable position to the hotspot
        const room = this.rooms[gameState.currentRoom];
        const bounds = room.walkableBounds;

        // Try to approach from the bottom (most natural for most objects)
        targetX = Math.max(bounds.x + 10, Math.min(bounds.x + bounds.width - 10, hotspotCenterX));
        targetY = Math.max(bounds.y + 10, Math.min(bounds.y + bounds.height - 10, hotspot.y + hotspot.height + APPROACH_DISTANCE));

        // If that puts us outside walkable bounds, try from the side
        if (targetY > bounds.y + bounds.height - 10) {
            targetY = hotspotCenterY;
            if (gameState.playerX < hotspotCenterX) {
                targetX = Math.max(bounds.x + 10, hotspot.x - APPROACH_DISTANCE);
            } else {
                targetX = Math.min(bounds.x + bounds.width - 10, hotspot.x + hotspot.width + APPROACH_DISTANCE);
            }
        }

        // Store the hotspot for auto-interaction when we arrive
        this.pendingInteraction = hotspot;

        this.movePlayerTo(targetX, targetY);
    }

    movePlayerTo(x, y) {
        const room = this.rooms[gameState.currentRoom];
        const bounds = room.walkableBounds;

        // Clamp to walkable area
        x = Math.max(bounds.x, Math.min(bounds.x + bounds.width, x));
        y = Math.max(bounds.y, Math.min(bounds.y + bounds.height, y));

        gameState.targetX = x;
        gameState.targetY = y;
        gameState.isWalking = true;

        // Play walk sound
        this.playSound('walk');
    }

    playSound(soundName) {
        if (SOUNDS[soundName]) {
            const audio = new Audio(SOUNDS[soundName]);
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore play errors
        }
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
        this.screen1Graphics = this.add.graphics();
        this.screen2Graphics = this.add.graphics();

        // Set depth to be above background but below NPCs and UI
        this.screen1Graphics.setDepth(10);
        this.screen2Graphics.setDepth(10);

        // Initial screen render
        this.updateScreenGraphics();
    }

    updateScreenGraphics() {
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
                // Different shades for variety
                const colors = [0x00ff00, 0x00dd00, 0x00bb00, 0x00ff44];
                graphics.fillStyle(colors[char.colorIndex]);
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

    updateScreenAnimations() {
        // Only update screens if we're in room1 and screens exist
        if (gameState.currentRoom !== 'room1' || !this.screen1Graphics || !this.screen2Graphics) {
            return;
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

    updateSingleScreen(screenState) {
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
                colorIndex: Math.floor(Math.random() * 4) // Random color variation
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

    updateGame() {
        this.updatePlayerMovement();
        this.updatePlayerAnimation();
        this.updateScreenAnimations();
    }

    updatePlayerMovement() {
        if (!gameState.isWalking) return;

        const dx = gameState.targetX - gameState.playerX;
        const dy = gameState.targetY - gameState.playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
            gameState.playerX = gameState.targetX;
            gameState.playerY = gameState.targetY;
            gameState.isWalking = false;

            // Check if we have a pending interaction to execute
            if (this.pendingInteraction) {
                const hotspot = this.pendingInteraction;
                this.pendingInteraction = null;

                // Double-check that we're close enough (in case of pathfinding issues)
                if (this.isPlayerNearHotspot(hotspot)) {
                    hotspot.action();
                } else {
                    this.showMessage("Can't reach that from here.");
                }
            }
        } else {
            const speed = 1;
            gameState.playerX += (dx / distance) * speed;
            gameState.playerY += (dy / distance) * speed;
        }

        if (this.playerSprite) {
            this.playerSprite.x = gameState.playerX;
            this.playerSprite.y = gameState.playerY;
        }
    }

    updatePlayerAnimation() {
        if (gameState.isWalking) {
            gameState.walkTimer++;
            if (gameState.walkTimer >= 15) {
                gameState.walkTimer = 0;
                gameState.walkFrame = (gameState.walkFrame + 1) % 2;
                if (this.playerSprite) {
                    this.playerSprite.setTexture(gameState.walkFrame === 0 ? 'player_walk1' : 'player_walk2');
                }
            }
        } else {
            if (this.playerSprite) {
                this.playerSprite.setTexture('player_idle');
            }
        }
    }

    addToInventory(item) {
        for (let i = 0; i < this.inventorySlots.length; i++) {
            const slot = this.inventorySlots[i];
            if (!slot.item) {
                slot.item = item;
                slot.sprite = this.add.sprite(slot.x + 15, slot.y + 15, item.sprite);
                slot.sprite.setDepth(103);
                gameState.inventory.push(item);
                break;
            }
        }
    }

    removeFromInventory(item) {
        for (let i = 0; i < this.inventorySlots.length; i++) {
            const slot = this.inventorySlots[i];
            if (slot.item === item) {
                slot.item = null;
                if (slot.sprite) {
                    slot.sprite.destroy();
                    slot.sprite = null;
                }
                if (slot.highlight) {
                    slot.highlight.destroy();
                    slot.highlight = null;
                }
                break;
            }
        }
        gameState.inventory = gameState.inventory.filter(i => i !== item);
        if (gameState.selectedItem === item) {
            gameState.selectedItem = null;
        }
    }

    // Interaction handlers
    interactDoor() {
        if (gameState.currentRoom === 'room1') {
            if (!gameState.doorUnlocked) {
                if (gameState.selectedItem && gameState.selectedItem === ITEMS.key) {
                    // Unlock door
                    gameState.doorUnlocked = true;
                    this.removeFromInventory(ITEMS.key);
                    this.playSound('unlock');
                    this.switchToRoom('room1'); // Refresh room to show unlocked door
                    this.showMessage('Door unlocked!');
                } else {
                    this.showMessage("It's locked.");
                }
            } else {
                // Enter room 2
                gameState.playerX = 50;
                gameState.playerY = 110;
                this.switchToRoom('room2');
            }
        }
    }

    interactDrawer() {
        if (!gameState.drawerOpen) {
            gameState.drawerOpen = true;
            this.switchToRoom('room1'); // Refresh room to show open drawer
            this.showMessage('The drawer opens, revealing a key!');
        } else {
            this.showMessage('The drawer is already open.');
        }
    }

    takeKey() {
        if (!gameState.keyTaken) {
            gameState.keyTaken = true;
            this.addToInventory(ITEMS.key);
            this.switchToRoom('room1'); // Refresh room to remove key
            this.showMessage('You took the office key.');
        }
    }

    talkToNPC1() {

        if(gameState.doorUnlocked) {
            this.showMessage("Don't mess with anything in the storage room.");
            return;
        }

        const dialogs = [
            "The boss lost a key... maybe it's in a drawer.",
            "Seriously, check the drawer near the door."
        ];

        const dialog = dialogs[Math.min(gameState.npc1DialogIndex, dialogs.length - 1)];
        gameState.npc1DialogIndex++;
        this.showMessage(`Sarah: "${dialog}"`);
    }

    talkToNPC2() {
        if(gameState.doorUnlocked) {
            this.showMessage("Congratulations! You've unlocked the door.");
            return;
        }

        const dialogs = [
            "Doors don't open by wishing. Find the key.",
            "Try the drawer at the desk."
        ];

        const dialog = dialogs[Math.min(gameState.npc2DialogIndex, dialogs.length - 1)];
        gameState.npc2DialogIndex++;
        this.showMessage(`Mike: "${dialog}"`);
    }

    returnToRoom1() {
        gameState.playerX = 250;
        gameState.playerY = 110;
        this.switchToRoom('room1');
    }

    showMessage(text) {
        // Remove existing message
        if (this.messageText) {
            this.messageText.destroy();
        }

        // Create new message
        this.messageText = this.add.text(CONFIG.VIRTUAL_WIDTH / 2, 20, text, {
            fontSize: '10px',
            fill: '#ffffff',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setDepth(200);

        // Auto-remove after 3 seconds
        this.time.delayedCall(6000, () => {
            if (this.messageText) {
                this.messageText.destroy();
                this.messageText = null;
            }
        });
    }
}

// Phaser game configuration
const gameConfig = {
    type: Phaser.WEBGL,
    width: CONFIG.VIRTUAL_WIDTH,
    height: CONFIG.VIRTUAL_HEIGHT,
    canvas: document.getElementById('game-canvas'),
    scene: GameScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: true,
        antialias: false
    },
    backgroundColor: '#2c3e50'
};

// Start the game
const game = new Phaser.Game(gameConfig);
