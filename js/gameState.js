/*
 * Game State Management
 * Centralized state management for the entire game
 */

// Game state
export let gameState = {
    currentRoom: 'room1',
    inventory: [],
    selectedItem: null,
    doorUnlocked: false,
    drawerOpen: false,
    keyTaken: false,
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
        characters: [], // Array of character data for current screen
        mode: 'typing', // 'typing' or 'video'
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
    }
};

// State management functions
export function resetGameState() {
    gameState.currentRoom = 'room1';
    gameState.inventory = [];
    gameState.selectedItem = null;
    gameState.doorUnlocked = false;
    gameState.drawerOpen = false;
    gameState.keyTaken = false;
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

export function setPlayerTarget(x, y) {
    gameState.targetX = x;
    gameState.targetY = y;
    gameState.isWalking = true;
}
