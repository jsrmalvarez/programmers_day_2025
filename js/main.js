/*
 * Main Game Scene
 * Orchestrates all game systems and handles game flow
 */

import { CONFIG, ITEMS, ROOMS } from './config.js';
import { gameState, setPlayerPosition, setPlayerOrientation, setPlayerVersion } from './gameState.js';
import { SpriteManager } from './sprites.js';
import { ScreenManager } from './screens.js';
import { RoomManager } from './rooms.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';
import { NPCManager } from './npcManager.js';
import { CollisionManager } from './collision.js';
import { RoomSpriteManager } from './roomSprites.js';
import { PathfindingManager } from './pathfinding.js';

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
        this.pathfindingManager = new PathfindingManager(this);

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
                    } else if (sprite.animation) {
                        // Load animation frames
                        for (const frame of sprite.animation.frames) {
                            this.load.image(frame, `assets/sprites/${frame}.png`);
                        }
                    }
                    /*else if (sprite.graphics) {
                        sprite.graphics(this.add.graphics());
                    }*/
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
        console.log('  P - Toggle pathfinding grid (cyan, walkable positions) and waypoints (red)');

        this.uiManager.showMessage('Welcome to ERNI MAD Office.\n\nYou booked for seat F in the Desk Reservation App.\n\nFind your place and have a productive day!', {
            autoHide: false,
            modal: true,
            buttonText: 'OK',
            fontSize: 7,
            lineSpacing: 10,
            maxWidth: CONFIG.VIRTUAL_WIDTH - 40
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

        // Apply current version's scale
        this.playerSprite.setScale(CONFIG.PLAYER.getCurrentScale());
    }

    // Interaction handlers
    interactDoor() {
        if (gameState.currentRoom === 'room1') {
            console.log('interacting with door in room 1');
            setPlayerPosition(299, 143);
            setPlayerOrientation('left');
            setPlayerVersion('NEAR', this);
            this.switchToRoom('room2');
        }
        else if (gameState.currentRoom === 'room2') {
            console.log('returning to room 1');
            setPlayerPosition(97, 78);
            setPlayerOrientation('front');
            setPlayerVersion('TINY', this);
            this.switchToRoom('room1');
        }
    }

    interactDrawer() {
        if(!gameState.progress._070_coffeMachineManualTaken) {
            gameState.progress._070_coffeMachineManualTaken = true;
            this.uiManager.addToInventoryUI(ITEMS.users_manual);
            this.uiManager.showMessage("You found the coffee machine manual.");
        }
    }

    interactSeatA() {
        gameState.progress._010_triedToOccupySeatA = true;
        this.uiManager.showMessage("I will not sit in there.\nI booked for seat F.");
    }

    interactSeatF(){
        this.uiManager.showMessage("You did it, you reached the seat you booked for!\n\nCongratulations!\n\nNow, let's work a bit.\n\n        -jsrmalvarez", {
            autoHide: false,
            modal: true,
            buttonText: 'OK',
            fontSize: 7,
            lineSpacing: 10,
            maxWidth: CONFIG.VIRTUAL_WIDTH - 40
        });
    }

    interactCoffeeMachine() {
        if(!gameState.progress._080_coffeMachineFixed) {
            if (gameState.selectedItem && gameState.selectedItem === ITEMS.users_manual) {
                this.uiManager.removeFromInventoryUI(ITEMS.users_manual);
                this.uiManager.showMessage("Fixed! It was just a matter of plugging in the cord.");
                gameState.progress._080_coffeMachineFixed = true;
            }
            else{
                this.uiManager.showMessage("The coffee machine is not working.");
            }
        }
        else {
            if(gameState.progress._060_talkedToCharlie) {
                if(!gameState.progress._081_coffeTaken) {
                    gameState.progress._081_coffeTaken = true;
                    this.uiManager.addToInventoryUI(ITEMS.coffee);
                    this.uiManager.showMessage("Ouch... burning hot!.");
                }
                else {
                    this.uiManager.showMessage("That would be too much coffee.");
                }
            }
            else{
                this.uiManager.showMessage("I don't like coffee.");
            }
        }
    }

    takeBranch() {
        if(!gameState.progress._023_branchTaken) {
            gameState.progress._023_branchTaken = true;
            this.uiManager.addToInventoryUI(ITEMS.branch);
            this.roomSpriteManager.hideBranchSprite(); // Hide the branch sprite
            this.uiManager.showMessage("You took the branch.");
        }
    }

    takeMouse() {
        if(!gameState.progress._022_mouseTaken) {
            gameState.progress._022_mouseTaken = true;
            this.uiManager.addToInventoryUI(ITEMS.mouse);
            this.roomSpriteManager.hideMouseSprite(); // Hide the mouse sprite
            this.uiManager.showMessage("You took the mouse.");
        }
    }

    giveMouseToAlice() {
        if(gameState.progress._022_mouseTaken && !gameState.progress._025_mouseGivenToAlice) {
            gameState.progress._025_mouseGivenToAlice = true;
            this.uiManager.removeFromInventoryUI(ITEMS.mouse);
            this.uiManager.showMessage("You gave the mouse to Alice.");
        }
    }

    giveCoffeeToCharlie() {
        if(gameState.progress._081_coffeTaken && !gameState.progress._090_coffeGivenToCharlie) {
            gameState.progress._090_coffeGivenToCharlie = true;
            this.uiManager.removeFromInventoryUI(ITEMS.coffee);
            this.uiManager.showMessage("You gave the coffee to Charlie.\nHe is now awake and ready to change seats with David.\nNow everyone is in their seats and ready to work.", {
                autoHide: false,
                modal: true,
                buttonText: 'OK',
                fontSize: 7,
                lineSpacing: 10,
                maxWidth: CONFIG.VIRTUAL_WIDTH - 40
            });
        }
    }

    talkToNPC(npcId) {
        const npc = this.npcManager.getNPC(npcId);
        if (npc) {
            npc.talk();
        }
    }


    interactPidgeon() {
        if (gameState.selectedItem && gameState.selectedItem === ITEMS.branch) {
            gameState.progress._024_branchUsedOnPidgeon = true;
            this.roomManager.checkTriggers();
            this.uiManager.removeFromInventoryUI(ITEMS.branch);
            this.uiManager.showMessage("Go away, you aerial rat!");
        }
        else {
            this.uiManager.showMessage("That will not work.");
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
