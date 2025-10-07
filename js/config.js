/*
 * Game Configuration and Constants
 * Contains all game settings, dimensions, and static data
 */

// Game configuration
export const CONFIG = {
    VIRTUAL_WIDTH: 320,
    VIRTUAL_HEIGHT: 200,
    INVENTORY_HEIGHT: 40,
    SCALE_MODE: Phaser.Scale.FIT,
    PIXEL_ART: true,
    INTERACTION_DISTANCE: 30,
    APPROACH_DISTANCE: 20,

    // Player character dimensions and collision
    PLAYER: {
        // Near version (original size)
        NEAR: {
            WIDTH: 24,
            HEIGHT: 62,
            FEET_OFFSET: 31
        },
        // Far version (scaled down)
        FAR: {
            WIDTH: 22,          // Proportionally scaled from 24
            HEIGHT: 56,         // As specified
            FEET_OFFSET: 28     // Half of HEIGHT
        },
        // Tiny version (furthest from viewer)
        TINY: {
            WIDTH: 18,          // Proportionally scaled from 24
            HEIGHT: 48,         // Even smaller
            FEET_OFFSET: 24     // Half of HEIGHT
        },
        // Which version to use (NEAR, FAR, or TINY)
        USE_VERSION: 'NEAR',

        // Get scale factor for a specific version
        getScale(version) {
            if (version === 'NEAR' || !this[version]) return 1;
            return this[version].HEIGHT / this.NEAR.HEIGHT;
        },

        // Get current version's scale factor
        getCurrentScale() {
            return this.getScale(this.USE_VERSION);
        }
    },

    // Debug settings
    DEBUG: {
        SHOW_MASK: false,           // Toggle with 'M' key
        SHOW_SPRITES: true,         // Toggle with 'S' key
        SHOW_HOTSPOTS: false        // Toggle with 'H' key
    }
};

// Sound effects as base64 WAV data (minimal)
export const SOUNDS = {
    walk: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBDuBzvLZiTYIG2m98OScTgwOUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWT' +
           'wwOUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWUQ4PUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7bdiFgoqjdX1unEiBC13yO/eizEI',
    unlock: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBDuBzvLZiTYIG2m98OScTgwOUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWT' +
             'wwOUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWUQ4PUarm7bdiFgoqjdX1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7bdiFgoqjdX1unEiBC13yO/eizEI'
};

// Items definition
export const ITEMS = {
    branch: {
        name: 'Branch',
        sprite: 'branch',
        transform: {
            rotate: 35,
            scale: 0.75
        }
    },
    mouse: {
        name: 'Mouse',
        sprite: 'mouse',
        transform: {
            scale: 1.2
        }
    }
};

// Screen Definitions with Dynamic Layering
export const SCREENS = {
    screen1: {
        position: { x: 55, y: 86, width: 20, height: 12 },
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 26, // Layer when player Y < threshold (NPC in front)
            belowLayer: 11  // Layer when player Y > threshold (NPC behind)
        }
    },
    screen2: {
        position: { x: 105, y: 86, width: 20, height: 12 },
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 26, // Layer when player Y < threshold (NPC in front)
            belowLayer: 11  // Layer when player Y > threshold (NPC behind)
        }
    },
    screen3: {
        position: { x: 155, y: 86, width: 20, height: 12 },
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 26, // Layer when player Y < threshold (NPC in front)
            belowLayer: 11  // Layer when player Y > threshold (NPC behind)
        }
    },
    screen4: {
        position: { x: 42, y: 122, width: 20, height: 12, big: true }, // Big screen for close NPC
        layering: {
            type: 'dynamic',
            threshold: 181, // Y position threshold (NPC feet position)
            aboveLayer: 28, // Layer when player Y < threshold (NPC in front)
            belowLayer: 13  // Layer when player Y > threshold (NPC behind)
        }
    },
    screen5: {
        position: { x: 97, y: 122, width: 20, height: 12, big: true }, // Big screen for close NPC
        layering: {
            type: 'dynamic',
            threshold: 181, // Y position threshold (NPC feet position)
            aboveLayer: 28, // Layer when player Y < threshold (NPC in front)
            belowLayer: 13  // Layer when player Y > threshold (NPC behind)
        }
    },
    screen6: {
        position: { x: 155, y: 122, width: 20, height: 12, big: true }, // Big screen for close NPC
        layering: {
            type: 'dynamic',
            threshold: 181, // Y position threshold (NPC feet position)
            aboveLayer: 28, // Layer when player Y < threshold (NPC in front)
            belowLayer: 13  // Layer when player Y > threshold (NPC behind)
        }
    }
};

// Video colors for screen animation
export const VIDEO_COLORS = [
    0xff0000, 0x00ff00, 0x0000ff, // Primary colors
    0xffff00, 0xff00ff, 0x00ffff, // Secondary colors
    0xff8000, 0x8000ff, 0x00ff80, // Tertiary colors
    0xff4080, 0x4080ff, 0x80ff40, // Mixed colors
    0xffffff, 0xcccccc, 0x888888  // Grays
];

// Typing colors for screen animation
export const TYPING_COLORS = [
    0x00ff00, 0x00dd00, 0x00bb00, 0x00ff44
];

// Available game GIFs for video mode
export const GAME_GIFS = [
    'arkanoid_gif',
    'doom_gif',
    'dott_gif',
    'sim_city_2000_gif'
];

const SMALL_TALK = [
    "Good morning.",
    "It is a nice day.",
    "When are you bringing engordaciones?",
    "It is good to be an ERNIan.",
    "Traffic is horrible.",
    "I'm not sure what you're talking about."
];

// NPC Definitions
export const NPCS = {
    eve: {
        name: 'Eve',
        position: { x: 112, y: 110 },
        dialogs: {
            beforeDoorUnlocked: [
                "Doors don't open by wishing. Find the key.",
                "Try the drawer at the desk."
            ],
            afterDoorUnlocked: [
                "Congratulations! You've unlocked the door."
            ]
        },
        hotspot: { x: 102, y: 89, width: 20, height: 36 },
        // Dynamic layering based on player position
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 27, // Layer when player Y < threshold (NPC in front)
            belowLayer: 12  // Layer when player Y > threshold (NPC behind)
        }
    },
    david: {
        name: 'David',
        position: { x: 172, y: 110 },
        dialogs: {
            beforeDoorUnlocked: [
                "Door? I'm not sure what you're talking about.",
                "Key? I don't have one."
            ],
            afterDoorUnlocked: [
                "I'm not sure what you're talking about."
            ]
        },
        hotspot: { x: 162, y: 89, width: 20, height: 36 },
        // Dynamic layering based on player position
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 27, // Layer when player Y < threshold (NPC in front)
            belowLayer: 12  // Layer when player Y > threshold (NPC behind)
        }
    },
    charlie: {
        name: 'Charlie',
        position: { x: 52, y: 155 },
        dialogs: {
            beforeDoorUnlocked: [
                "The boss lost a key... maybe it's in a drawer.",
                "Seriously, check the drawer near the door."
            ],
            afterDoorUnlocked: [
                "Don't mess with anything in the storage room."
            ]
        },
        hotspot: { x: 40, y: 125, width: 25, height: 56 },
        // Dynamic layering based on player position
        layering: {
            type: 'dynamic',
            threshold: 181, // Y position threshold (NPC feet position)
            aboveLayer: 29, // Layer when player Y < threshold (NPC in front)
            belowLayer: 14  // Layer when player Y > threshold (NPC behind)
        }
    },
    bob: {
        name: 'Bob',
        position: { x: 110, y: 155 },
        dialogs: {
            beforeDoorUnlocked: [
                "Doors don't open by wishing. Find the key.",
                "Try the drawer at the desk."
            ],
            afterDoorUnlocked: [
                "Congratulations! You've unlocked the door."
            ]
        },
        hotspot: { x: 98, y: 125, width: 25, height: 56 },
        // Dynamic layering based on player position
        layering: {
            type: 'dynamic',
            threshold: 181, // Y position threshold (NPC feet position)
            aboveLayer: 29, // Layer when player Y < threshold (NPC in front)
            belowLayer: 14  // Layer when player Y > threshold (NPC behind)
        }
    },
    alice: {
        name: 'Alice',
        position: { x: 175, y: 155 },
        dialogs: {
            beforeTryingToOccupySeatA: [
                "Good morning.",
                "It is a nice day."
            ],
            afterDoorUnlocked: [
                "I'm not sure what you're talking about."
            ]
        },
        hotspot: { x: 162, y: 125, width: 25, height: 56 },
        // Dynamic layering based on player position
        layering: {
            type: 'dynamic',
            threshold: 181, // Y position threshold (NPC feet position)
            aboveLayer: 29, // Layer when player Y < threshold (NPC in front)
            belowLayer: 14  // Layer when player Y > threshold (NPC behind)
        }
    }
};

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

// Room Definitions with Images and Sprites
export const ROOMS = {
    room1: {
        name: 'Office',
        // Y position thresholds for player scaling
        nearFarThreshold: 145,  // Below this: FAR, above this: NEAR
        farTinyThreshold: 112,  // Below this: TINY, above this: FAR
        background: {
            image: 'room1_bg', // PNG background image
            mask: 'room1_mask'  // Black/white collision mask
        },
        sprites: [
            // Dynamic layering system: sprites can change depth based on player position
            // This simulates perspective - objects appear behind/in front based on relative distance
            {
                id: 'desk_back',
                image: 'desk_back',
                x: 35, y: 92,
                // Dynamic layering: different threshold for this sprite
                layering: {
                    type: 'dynamic',
                    threshold: 127, // Y threshold for far desk
                    aboveLayer: 25, // Just below far screens (26)
                    belowLayer: 10  // Just below far screens (11)
                }
            },
            {
                 id: 'desk_front',
                 image: 'desk_front',
                 x: 9, y: 134,
                 // Dynamic layering: if player Y > threshold, desk appears behind player
                 layering: {
                     type: 'dynamic',
                     threshold: 181, // Y threshold for near desk
                    aboveLayer: 27, // Just below near screens (28)
                    belowLayer: 12  // Just below near screens (13)
                 }
            },
            {
                id: 'seat_a',
                image: 'seat_a',
                x: 49, y: 106,
                layering: {
                    type: 'dynamic',
                    threshold: 127, // Y threshold for near desk
                    aboveLayer: 27, // Just below near screens (28)
                    belowLayer: 12  // Just below near screens (13)
                }
            },
            {
                id: 'plant_wo_branch',
                image: 'plant_wo_branch',
                x: 280, y: 98,
                visible: false,
                // Dynamic layering: if player Y > threshold, desk appears behind player
                layering: {
                    type: 'dynamic',
                    threshold: 172, // Y threshold for near desk
                   aboveLayer: 27, // Just below near screens (28)
                   belowLayer: 12  // Just below near screens (13)
                }
            },
            {
                id: 'branch',
                image: 'branch',
                x: 275, y: 131,
                layering: {
                    type: 'dynamic',
                    threshold: 172, // Y threshold for near desk
                   aboveLayer: 27, // Just below near screens (28)
                   belowLayer: 12  // Just below near screens (13)
                }
            },

        ]
    },
    room2: {
        name: 'Terrace',
        // Y position thresholds for player scaling
        nearFarThreshold: 1,  // Below this: FAR, above this: NEAR
        farTinyThreshold: 1,  // Below this: TINY, above this: FAR
        background: {
            image: 'room2_bg',
            mask: 'room2_mask'
        },
        triggers: [
            {
                id: 'flying_pidgeon_trigger',
                condition: (gameState) => gameState.progress._024_branchUsedOnPidgeon,
                action: (scene) => {
                    // Start flying pigeon animation
                    if (scene.roomSpriteManager) {
                        scene.roomSpriteManager.startAnimation('flying_pidgeon');
                        // Stop regular pigeon animation
                        scene.roomSpriteManager.stopAnimation('pidgeon');
                    }
                },
                oneTime: true // Only trigger once
            },
            {
                id: 'refuse_to_come_closer_to_pidgeon_trigger',
                condition: (gameState) => !gameState.progress._024_branchUsedOnPidgeon && gameState.playerX < 178,
                action: (scene) => {
                    // stop walking using scene's gameState reference
                    scene.gameState.isWalking = false;
                    scene.gameState.walkTimer = 0;
                    scene.gameState.walkFrame = 0;
                    scene.gameState.playerX = scene.gameState.playerX + 2;
                    // message that you can't come closer to the pidgeon
                    const refusalMessages = ["I refuse to come closer to that filthy pidgeon.",
                                            "Pidgeons live on trash.",
                                            "Pidgeons are pests, I won't come closer."];
                    const randomMessage = refusalMessages[Math.floor(Math.random() * refusalMessages.length)];
                    scene.uiManager.showMessage(randomMessage);
                },
                oneTime: false
            }
        ],
        sprites: [
            {
                id: 'structure',
                image: 'structure',
                x: 39, y: 0,
                layering: {
                    type: 'static',
                    layer: 25
                }
            },
            {
                id: 'mouse',
                image: 'mouse',
                x: 72, y: 128,
                layering: {
                    type: 'static',
                    layer: 25
                }
            },
            {
                id: 'food_scraps',
                image: 'food_scraps',
                x: 138, y: 127,
                layering: {
                    type: 'static',
                    layer: 25
                }
            },
            {
                id: 'pidgeon',
                animation: {
                    key: 'pidgeon',
                    frames: ['pidgeon000', 'pidgeon001'], // Add more frames as needed
                    frameRate: 8, // Default frames per second (used when no frame-specific duration)
                    frameDurations: [
                        () => Math.max(100, gaussianRandom(2000, 1000)),
                        () => Math.max(100, gaussianRandom(1000, 1000)),
                    ],
                    framePositions: [
                        { x: 0, y: 0 }, // No offset for first frame
                        { x: -1, y: 0 } // Slight offset for second frame
                    ],
                    autoStart: true,
                    repeat: -1
                },
                x: 144, y: 119,
                layering: {
                    type: 'static',
                    layer: 26
                }
            },
            {
                id: 'flying_pidgeon',
                animation: {
                    key: 'flying_pidgeon',
                    frames: ['flying_pidgeon000', 'flying_pidgeon001'], // Add more frames as needed
                    frameRate: 8, // Default frames per second (used when no frame-specific duration)
                    frameDurations: [
                        200,//() => Math.max(50, gaussianRandom(2000, 750)),
                        200,//50
                    ],
                    framePositions: [
                        { x: 0, y: 0 }, // No offset for first frame
                        { x: -2, y: 3 } // Slight offset for second frame
                    ],

                    translation: {
                        x: -2,
                        y: -1,
                        rate: 50 // Translation every 100ms (independent of frame timing)
                    },
                    autoStart: false,
                    isPlaying: false,
                    repeat: 15
                },
                x: 144, y: 119,
                layering: {
                    type: 'static',
                    layer: 26
                }
            }
        ]
    }
};


let firstTimeAliceAnd_010_triedToOccupySeatA = true;
export function getDialogSet(gameState, id) {

    // Charlie's dialogs
    if(id == 'charlie'){
        if(gameState.progress._050_talkedToDavid){
            return ["ZZZ...Coffeee....", "I'm veeeryy tireed.", "So tired... I cannot stand up.", "ZZZ...I need coffee."];
        }
        else{
            return ["...ZZzzzzz...", "...Snore..."];
        }
    }

    // David's dialogs
    if(id == 'david'){
        if(gameState.progress._040_talkedToEve){
            return ["I'd change seats with Charlie if you convince him."];
        }
        else{
            return SMALL_TALK;
        }
    }

    // Eve's dialogs
    if(id == 'eve'){
        if(gameState.progress._030_talkedToBob){
            return ["I'd gladly change seats with Bob, but I need to work closely with David."];
        }
        else{
            return SMALL_TALK;
        }
    }

    // Bob's dialogs
    if(id == 'bob'){
        if(gameState.progress._025_mouseGivenToAlice){
            return ["I'd gladly move to seat B, but there's Eve."];
        }
        else{
            return SMALL_TALK;
        }
    }

    // Alice's dialogs
    if(id === 'alice'){
        if(gameState.progress._025_mouseGivenToAlice){
            return ["I will move to seat A if Bob moves to seat B, because we need to work together."];
        }
        else if(gameState.progress._010_triedToOccupySeatA){
            if(firstTimeAliceAnd_010_triedToOccupySeatA){
                firstTimeAliceAnd_010_triedToOccupySeatA = false;
                return ["I'd gladly change the seat, but seat A has no mouse."];
            }
            else{
                return ["I need a mouse so I can work at seat A.",
                    "Last afterwork ended up with some mice running around the terrace."];
            }
        }
        else{
            return SMALL_TALK;
        }
    }

    // Default small talk for other NPCs
    return SMALL_TALK;
}