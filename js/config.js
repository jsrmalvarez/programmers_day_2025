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
            WIDTH: 20,          // Proportionally scaled from 24
            HEIGHT: 52,         // As specified
            FEET_OFFSET: 26     // Half of HEIGHT
        },
        // Tiny version (furthest from viewer)
        TINY: {
            WIDTH: 16,          // Proportionally scaled from 24
            HEIGHT: 42,         // Even smaller
            FEET_OFFSET: 21     // Half of HEIGHT
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
    key: {
        name: 'Office Key',
        sprite: 'key'
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
    /*alice: {
        name: '',
        position: { x: 60, y: 110 },
        dialogs: {
            beforeDoorUnlocked: [
                "The boss lost a key... maybe it's in a drawer.",
                "Seriously, check the drawer near the door."
            ],
            afterDoorUnlocked: [
                "Don't mess with anything in the storage room."
            ]
        },
        hotspot: { x: 50, y: 89, width: 20, height: 36 },
        // Dynamic layering based on player position
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 27, // Layer when player Y < threshold (NPC in front)
            belowLayer: 12  // Layer when player Y > threshold (NPC behind)
        }
    },*/
    bob: {
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
    charlie: {
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
    david: {
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
    eve: {
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
    frank: {
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

// Room Definitions with Images and Sprites
export const ROOMS = {
    room1: {
        name: 'Office',
        // Y position thresholds for player scaling
        nearFarThreshold: 145,  // Below this: FAR, above this: NEAR
        farTinyThreshold: 102,  // Below this: TINY, above this: FAR
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
        sprites: [
            {
                id: 'structure',
                image: 'structure',
                x: 39, y: 0,
                layering: {
                    type: 'static',
                    layer: 25
                }
            }
        ]
    }
};


export function getDialogSet(gameState, id) {
    if(gameState.progress._010_triedToOccupySeatA){

        if(id === 'alice'){
            return ["I'd gladly change the seat, but seat A has no mouse.",
                    "I need a mouse so I can work at seat A.",
                    "Last afterwork ended up with some mice running around the terrace."];
        }
        else{
            return SMALL_TALK;
        }
    }
    else{
        return SMALL_TALK;
    }
}