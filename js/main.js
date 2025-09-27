/*
 * Main Game Scene
 * Orchestrates all game systems and handles game flow
 */

import { CONFIG, ITEMS } from './config.js';
import { gameState, setPlayerPosition } from './gameState.js';
import { SpriteManager } from './sprites.js';
import { ScreenManager } from './screens.js';
import { RoomManager } from './rooms.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Initialize managers
        this.spriteManager = new SpriteManager(this);
        this.screenManager = new ScreenManager(this);
        this.roomManager = new RoomManager(this);
        this.inputManager = new InputManager(this);
        this.uiManager = new UIManager(this);

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

        // Note: GIFs are loaded as HTML elements for animation support

        // Create pixel art sprites programmatically
        this.spriteManager.createAllSprites();
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

        // Clear screen graphics and NPC sprites
        this.screenManager.clearScreens();
        this.spriteManager.clearNPCSprites();
        this.roomManager.destroyBackground();

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

    // Interaction handlers
    interactDoor() {
        if (gameState.currentRoom === 'room1') {
            if (!gameState.doorUnlocked) {
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
            } else {
                // Enter room 2
                setPlayerPosition(50, 110);
                this.switchToRoom('room2');
            }
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

    talkToNPC1() {
        if (gameState.doorUnlocked) {
            this.uiManager.showMessage("Don't mess with anything in the storage room.");
            return;
        }

        const dialogs = [
            "The boss lost a key... maybe it's in a drawer.",
            "Seriously, check the drawer near the door."
        ];

        const dialog = dialogs[Math.min(gameState.npc1DialogIndex, dialogs.length - 1)];
        gameState.npc1DialogIndex++;
        this.uiManager.showMessage(`Sarah: "${dialog}"`);
    }

    talkToNPC2() {
        if (gameState.doorUnlocked) {
            this.uiManager.showMessage("Congratulations! You've unlocked the door.");
            return;
        }

        const dialogs = [
            "Doors don't open by wishing. Find the key.",
            "Try the drawer at the desk."
        ];

        const dialog = dialogs[Math.min(gameState.npc2DialogIndex, dialogs.length - 1)];
        gameState.npc2DialogIndex++;
        this.uiManager.showMessage(`Mike: "${dialog}"`);
    }

    returnToRoom1() {
        setPlayerPosition(250, 110);
        this.switchToRoom('room1');
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
