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
import { NPCManager } from './npcManager.js';

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

        // Clear player overlay
        if (this.playerOverlay) {
            if (this.playerOverlay.parentNode) {
                document.body.removeChild(this.playerOverlay);
            }
            this.playerOverlay = null;
        }

        // Clear screen graphics and NPCs
        this.screenManager.clearScreens();
        this.npcManager.clearAllNPCs();
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

        // Create player sprite (invisible, for game logic)
        this.playerSprite = this.add.sprite(gameState.playerX, gameState.playerY, 'player_idle');
        this.playerSprite.setDepth(20);
        this.playerSprite.setVisible(false);

        // Create player HTML overlay (for rendering above NPCs)
        this.createPlayerOverlay();
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

    talkToNPC(npcId) {
        const npc = this.npcManager.getNPC(npcId);
        if (npc) {
            npc.talk();
        }
    }

    returnToRoom1() {
        setPlayerPosition(250, 110);
        this.switchToRoom('room1');
    }

    createPlayerOverlay() {
        // Clean up existing overlay
        if (this.playerOverlay) {
            if (this.playerOverlay.parentNode) {
                document.body.removeChild(this.playerOverlay);
            }
        }

        // Create canvas element for player
        const canvas = document.createElement('canvas');
        canvas.width = 12;
        canvas.height = 16;
        canvas.style.position = 'absolute';
        canvas.style.imageRendering = 'pixelated';
        canvas.style.imageRendering = 'crisp-edges';
        canvas.style.zIndex = '20'; // Above NPCs (z-index 10) and GIFs (z-index 5)
        canvas.style.pointerEvents = 'none';
        canvas.style.border = 'none';
        canvas.style.outline = 'none';
        canvas.style.boxSizing = 'border-box';

        // Add to DOM and store reference
        document.body.appendChild(canvas);
        this.playerOverlay = canvas;

        // Draw initial player state and position
        this.updatePlayerOverlay();
    }

    updatePlayerOverlay() {
        if (!this.playerOverlay) return;

        // Clear canvas
        const ctx = this.playerOverlay.getContext('2d');
        ctx.clearRect(0, 0, 12, 16);

        // Draw player based on current state
        this.drawPlayerOnCanvas(ctx);

        // Update position
        this.updatePlayerOverlayPosition();
    }

    drawPlayerOnCanvas(ctx) {
        // Player body (blue shirt)
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(0, 0, 12, 16);

        // Player head (skin color)
        ctx.fillStyle = '#f5a623';
        ctx.fillRect(2, 2, 8, 6);

        // Add walk animation if walking
        if (gameState.isWalking) {
            ctx.fillStyle = '#333333';
            if (gameState.walkFrame === 0) {
                ctx.fillRect(1, 14, 3, 2); // left foot forward
                ctx.fillRect(8, 15, 3, 1); // right foot back
            } else {
                ctx.fillRect(8, 14, 3, 2); // right foot forward
                ctx.fillRect(1, 15, 3, 1); // left foot back
            }
        }
    }

    updatePlayerOverlayPosition() {
        if (!this.playerOverlay) return;

        // Get canvas position and scale
        const gameCanvas = this.game.canvas;
        const canvasRect = gameCanvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this.game.config.width;
        const scaleY = canvasRect.height / this.game.config.height;

        // Calculate player position in actual pixels
        const actualX = canvasRect.left + (gameState.playerX * scaleX);
        const actualY = canvasRect.top + (gameState.playerY * scaleY);
        const actualWidth = 12 * scaleX;
        const actualHeight = 16 * scaleY;

        // Position the player overlay (centered on sprite position)
        this.playerOverlay.style.left = `${actualX - actualWidth/2}px`;
        this.playerOverlay.style.top = `${actualY - actualHeight/2}px`;
        this.playerOverlay.style.width = `${actualWidth}px`;
        this.playerOverlay.style.height = `${actualHeight}px`;
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
