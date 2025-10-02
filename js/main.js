/*
 * Main Game Scene
 * Orchestrates all game systems and handles game flow
 */

import { CONFIG, ITEMS, ROOMS } from './config.js';
import { gameState, setPlayerPosition, setPlayerOrientation } from './gameState.js';
import { SpriteManager } from './sprites.js';
import { ScreenManager } from './screens.js';
import { RoomManager } from './rooms.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';
import { NPCManager } from './npcManager.js';
import { CollisionManager } from './collision.js';
import { RoomSpriteManager } from './roomSprites.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Initialize managers
        this.spriteManager = new SpriteManager(this);
        this.screenManager = new ScreenManager(this);
        this.roomManager = new RoomManager(this);
        this.inputManager = new InputManager(this);
        this.uiManager = new UIManager(this);
        this.npcManager = new NPCManager(this);
        this.collisionManager = new CollisionManager(this);
        this.roomSpriteManager = new RoomSpriteManager(this);

        // Game objects
        this.playerSprite = null;
        this.keySprite = null;
        this.rooms = null;

        // Reference to gameState for easier access
        this.gameState = gameState;
    }

    preload() {
        // Load bitmap font for pixel-perfect text
        this.load.bitmapFont('arcade', 'assets/arcade.png', 'assets/arcade.xml');

        // Load room backgrounds and collision masks
        this.loadRoomAssets();

        // Note: GIFs are loaded as HTML elements for animation support

        // Create pixel art sprites programmatically
        this.spriteManager.createAllSprites();
    }

    loadRoomAssets() {
        // Load assets for each room defined in config
        for (const [roomId, roomConfig] of Object.entries(ROOMS)) {
            // Load background image
            if (roomConfig.background.image) {
                this.load.image(roomConfig.background.image, `assets/rooms/${roomConfig.background.image}.png`);
            }

            // Load collision mask
            if (roomConfig.background.mask) {
                this.load.image(roomConfig.background.mask, `assets/rooms/${roomConfig.background.mask}.png`);
            }

            // Load sprite images
            if (roomConfig.sprites) {
                for (const sprite of roomConfig.sprites) {
                    if (sprite.image) {
                        this.load.image(sprite.image, `assets/sprites/${sprite.image}.png`);
                    }
                }
            }
        }
    }

    create() {
        // Set up pixel perfect rendering
        this.cameras.main.setRoundPixels(true);

        // Disable texture smoothing globally for crisp pixels
        this.renderer.antialias = false;
        if (this.renderer.gl) {
            this.renderer.gl.texParameteri(this.renderer.gl.TEXTURE_2D, this.renderer.gl.TEXTURE_MAG_FILTER, this.renderer.gl.NEAREST);
            this.renderer.gl.texParameteri(this.renderer.gl.TEXTURE_2D, this.renderer.gl.TEXTURE_MIN_FILTER, this.renderer.gl.NEAREST);
        }

        // Initialize systems
        this.inputManager.setupInput();
        this.uiManager.setupUI();
        this.rooms = this.roomManager.createRooms();
        this.switchToRoom(gameState.currentRoom);

        // Update loop
        this.time.addEvent({
            delay: 16,
            callback: this.updateGame,
            callbackScope: this,
            loop: true
        });

        // Show debug help message
        console.log('🎮 Debug Controls:');
        console.log('  M - Toggle collision mask/background view');
        console.log('  S - Toggle room sprites visibility');
        console.log('  C - Toggle mouse coordinates and cursor dot');
        console.log('  H - Toggle hotspot rectangles');
    }

    updateGame() {
        this.inputManager.updateMovement();
        this.inputManager.updateAnimation();
        this.screenManager.updateScreenAnimations();
    }

    switchToRoom(roomId) {
        gameState.currentRoom = roomId;
        const room = this.rooms[roomId];

        // Clear pending interactions when switching rooms
        this.inputManager.clearPendingInteraction();

        // Clear existing sprites
        if (this.playerSprite) {
            this.playerSprite.destroy();
        }
        if (this.keySprite) {
            this.keySprite.destroy();
            this.keySprite = null;
        }

        // Clear player overlay (no longer used)
        if (this.playerOverlay) {
            if (this.playerOverlay.parentNode) {
                document.body.removeChild(this.playerOverlay);
            }
            this.playerOverlay = null;
        }

        // Clear screen graphics, NPCs, and room sprites
        this.screenManager.clearScreens();
        this.npcManager.clearAllNPCs();
        this.roomSpriteManager.clearAllSprites();
        this.roomManager.destroyBackground();
        this.collisionManager.clearMask();

        // Reset hotspots (remove key hotspot if it was added) - do this BEFORE creating background
        if (roomId === 'room1') {
            // Remove key hotspot if it exists (it would be at the beginning of the array)
            if (this.rooms.room1.hotspots.length > 0 && this.rooms.room1.hotspots[0].name === 'Office Key') {
                this.rooms.room1.hotspots.shift();
            }
        }

        // Try to create image-based room first, fallback to old system
        const roomConfig = ROOMS[roomId];
        if (roomConfig && roomConfig.background.image) {
            // Use new image-based room system
            this.roomManager.createImageBasedRoom(roomId);
        } else {
            // Fallback to old graphics-based room system
            room.background();
        }

        // Create player sprite (visible, with proper depth layering)
        this.playerSprite = this.add.sprite(gameState.playerX, gameState.playerY, 'player_front_idle');
        this.playerSprite.setDepth(20); // Layer 20 - between room sprites
        this.playerSprite.setVisible(true);

        // Apply scaling if using FAR version
        if (CONFIG.PLAYER.USE_VERSION === 'FAR') {
            const scale = CONFIG.PLAYER.FAR.HEIGHT / CONFIG.PLAYER.NEAR.HEIGHT;
            this.playerSprite.setScale(scale);
        }
    }

    // Interaction handlers
    interactDoor() {
        if (gameState.currentRoom === 'room1') {
            console.log('interacting with door in room 1');
            /*if (!gameState.doorUnlocked) {
                if (gameState.selectedItem && gameState.selectedItem === ITEMS.key) {
                    // Unlock door
                    gameState.doorUnlocked = true;
                    this.uiManager.removeFromInventoryUI(ITEMS.key);
                    this.inputManager.playSound('unlock');
                    this.switchToRoom('room1'); // Refresh room to show unlocked door
                    this.uiManager.showMessage('Door unlocked!');
                } else {
                    this.uiManager.showMessage("It's locked.");
                }
            } else {*/
                // Enter room 2
                setPlayerPosition(299, 141);
                setPlayerOrientation('left');
                this.switchToRoom('room2');
            //}
        }
        else if (gameState.currentRoom === 'room2') {
            console.log('returning to room 1');
            setPlayerPosition(97, 70);
            setPlayerOrientation('front');
            this.switchToRoom('room1');
        }
    }

    interactDrawer() {
        if (!gameState.drawerOpen) {
            gameState.drawerOpen = true;
            this.switchToRoom('room1'); // Refresh room to show open drawer
            this.uiManager.showMessage('The drawer opens, revealing a key!');
        } else {
            this.uiManager.showMessage('The drawer is already open.');
        }
    }

    takeKey() {
        if (!gameState.keyTaken) {
            gameState.keyTaken = true;
            this.uiManager.addToInventoryUI(ITEMS.key);
            this.switchToRoom('room1'); // Refresh room to remove key
            this.uiManager.showMessage('You took the office key.');
        }
    }

    talkToNPC(npcId) {
        const npc = this.npcManager.getNPC(npcId);
        if (npc) {
            npc.talk();
        }
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
        antialias: false,
        roundPixels: true,
        powerPreference: 'high-performance'
    },
    backgroundColor: '#2c3e50'
};

// Start the game
const game = new Phaser.Game(gameConfig);
