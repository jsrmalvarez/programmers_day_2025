/*
 * Game State Management
 * Centralized state management for the entire game
 */

import { CONFIG } from './config.js';

// Game state
export let gameState = {
    currentRoom: 'room2',
    inventory: [],
    selectedItem: null,
    progress: {
        _010_triedToOccupySeatA: false,
        _020_talkedToAlice: false,
        _021_pidgeonAvoided: false,
        _022_mouseTaken: false,
        _023_mouseGivenToAlice: false,
        _030_talkedToBob: false,
        _040_talkedToEve: false,
    },
    playerX: 263,
    playerY: 186,
    targetX: 160,
    targetY: 120,
    isWalking: false,
    walkFrame: 0,
    walkTimer: 0,
    playerOrientation: 'front', // 'front', 'back', 'left', 'right'
    playerVersion: 'NEAR',    // 'NEAR', 'FAR', or 'TINY'
    // Screen animation states (independent)
    screen1: {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [], // Array of character data for current screen
        mode: 'off', // 'typing' or 'video'
        pongGame: null // Pong game state for video mode
    },
    screen2: {
        timer: 0,
        currentLine: 0,
        currentChar: 3,
        lineDelay: 0, // Start with different timing
        characters: [], // Array of character data for current screen
        mode: 'typing', // 'typing' or 'video'
        pongGame: null // Pong game state for video mode
    },
    screen3: {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [],
        mode: 'typing',
        pongGame: null
    },
    screen4: {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [],
        mode: 'off',
        pongGame: null
    },
    screen5: {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [],
        mode: 'typing',
        pongGame: null
    },
    screen6: {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [],
        mode: 'typing',
        pongGame: null
    }
};

// State management functions
export function resetGameState() {
    gameState.currentRoom = 'room1';
    gameState.inventory = [];
    gameState.selectedItem = null;
    Object.keys(gameState.progress).forEach(key => {
        gameState.progress[key] = false;
    });
    gameState.playerX = 160;
    gameState.playerY = 120;
    gameState.targetX = 160;
    gameState.targetY = 120;
    gameState.isWalking = false;
    gameState.walkFrame = 0;
    gameState.walkTimer = 0;

    // Reset screen states
    gameState.screen1 = {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [],
        mode: 'typing',
        pongGame: null
    };

    gameState.screen2 = {
        timer: 0,
        currentLine: 3,
        currentChar: 0,
        lineDelay: 20,
        characters: [],
        mode: 'typing',
        pongGame: null
    };

    gameState.screen3 = {
        timer: 0,
        currentLine: 4,
        currentChar: 3,
        lineDelay: 10,
        characters: [],
        mode: 'typing',
        pongGame: null
    };

    gameState.screen4 = {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [],
        mode: 'typing',
        pongGame: null
    };

    gameState.screen5 = {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [],
        mode: 'typing',
        pongGame: null
    };

    gameState.screen6 = {
        timer: 0,
        currentLine: 0,
        currentChar: 0,
        lineDelay: 0,
        characters: [],
        mode: 'typing',
        pongGame: null
    };
}

// Inventory management
export function addToInventory(item) {
    if (!gameState.inventory.includes(item)) {
        gameState.inventory.push(item);
    }
}

export function removeFromInventory(item) {
    gameState.inventory = gameState.inventory.filter(i => i !== item);
    if (gameState.selectedItem === item) {
        gameState.selectedItem = null;
    }
}

// Player movement state
export function setPlayerPosition(x, y) {
    gameState.playerX = x;
    gameState.playerY = y;
    gameState.targetX = x;
    gameState.targetY = y;
    gameState.isWalking = false;
}

export function setPlayerOrientation(orientation) {
    gameState.playerOrientation = orientation;
}

// Set player version and apply appropriate scale
export function setPlayerVersion(version, scene) {
    if (!['NEAR', 'FAR', 'TINY'].includes(version)) {
        console.warn('Invalid player version:', version);
        return;
    }

    gameState.playerVersion = version;
    CONFIG.PLAYER.USE_VERSION = version;

    // Apply scale if scene is provided
    if (scene && scene.playerSprite) {
        scene.playerSprite.setScale(CONFIG.PLAYER.getScale(version));
    }
}

export function setPlayerTarget(x, y) {
    gameState.targetX = x;
    gameState.targetY = y;
    gameState.isWalking = true;
}
