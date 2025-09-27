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
        WIDTH: 12,          // Player sprite width
        HEIGHT: 8,         // Player sprite height
        FEET_OFFSET: 8     // Distance from sprite center to feet (bottom collision point)
    },

    // Debug settings
    DEBUG: {
        SHOW_MASK: false,           // Toggle with 'M' key
        SHOW_SPRITES: true,         // Toggle with 'S' key
        SHOW_COLLISION_POINTS: false // Enable to see collision point debugging
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

// Screen positions for animation mode detection
export const SCREEN_POSITIONS = {
    screen1Y: 72, // Sarah's screen Y position
    screen2Y: 82  // Mike's screen Y position
};

// Screen Definitions with Dynamic Layering
export const SCREENS = {
    screen1: {
        position: { x: 95, y: 72, width: 20, height: 12 },
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 26, // Layer when player Y < threshold (NPC in front)
            belowLayer: 11  // Layer when player Y > threshold (NPC behind)
        }
    },
    screen2: {
        position: { x: 195, y: 82, width: 20, height: 12 },
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 26, // Layer when player Y < threshold (NPC in front)
            belowLayer: 11  // Layer when player Y > threshold (NPC behind)
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

// NPC Definitions
export const NPCS = {
    sarah: {
        name: 'Sarah',
        position: { x: 55, y: 106 },
        shirtColor: 0xe74c3c, // Red
        dialogs: {
            beforeDoorUnlocked: [
                "The boss lost a key... maybe it's in a drawer.",
                "Seriously, check the drawer near the door."
            ],
            afterDoorUnlocked: [
                "Don't mess with anything in the storage room."
            ]
        },
        hotspot: { x: 45, y: 96, width: 20, height: 30 },
        // Dynamic layering based on player position
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 27, // Layer when player Y < threshold (NPC in front)
            belowLayer: 12  // Layer when player Y > threshold (NPC behind)
        }
    },
    mike: {
        name: 'Mike',
        position: { x: 105, y: 106 },
        shirtColor: 0x2ecc71, // Green
        dialogs: {
            beforeDoorUnlocked: [
                "Doors don't open by wishing. Find the key.",
                "Try the drawer at the desk."
            ],
            afterDoorUnlocked: [
                "Congratulations! You've unlocked the door."
            ]
        },
        hotspot: { x: 95, y: 96, width: 20, height: 30 },
        // Dynamic layering based on player position
        layering: {
            type: 'dynamic',
            threshold: 127, // Y position threshold (NPC feet position)
            aboveLayer: 27, // Layer when player Y < threshold (NPC in front)
            belowLayer: 12  // Layer when player Y > threshold (NPC behind)
        }
    }
};

// Room Definitions with Images and Sprites
export const ROOMS = {
    room1: {
        name: 'Office',
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
                    threshold: 127, // Different threshold than desk_front
                    aboveLayer: 25, // Layer when player Y < threshold
                    belowLayer: 10  // Layer when player Y > threshold
                }
            },
            {
                 id: 'desk_front',
                 image: 'desk_front',
                 x: 9, y: 134,
                 // Dynamic layering: if player Y > threshold, desk appears behind player
                 layering: {
                     type: 'dynamic',
                     threshold: 183, // Y position threshold
                     aboveLayer: 25, // Layer when player Y < threshold
                     belowLayer: 15  // Layer when player Y > threshold
                 }
             },

            // {
            //     id: 'plant',
            //     image: 'plant_sprite',
            //     x: 250, y: 80,
            //     layer: 25 // This appears in front of player
            // }
        ],
        walkableBounds: { x: 20, y: 60, width: 280, height: 100 } // Fallback bounds
    },
    room2: {
        name: 'Storage Room',
        background: {
            image: 'room2_bg',
            mask: 'room2_mask'
        },
        sprites: [
            // Storage room sprites would go here
        ],
        walkableBounds: { x: 20, y: 60, width: 280, height: 100 }
    }
};
