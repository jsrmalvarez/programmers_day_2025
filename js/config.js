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
    APPROACH_DISTANCE: 20
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
