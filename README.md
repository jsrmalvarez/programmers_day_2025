# Office Adventure - Point & Click Game

A classic point-and-click adventure game built with Phaser 3 that runs locally in any modern browser.

## How to Play

1. **Double-click `index.html`** to open the game in your browser
2. **Left-click** anywhere to walk to that location
3. **Left-click** on objects and NPCs to interact with them
4. **Click** inventory items to select them, then click objects to use them
5. **Hover** over objects to see their names

## Game Objective

You're stuck in an office and need to get into the storage room. The door is locked, so you'll need to:

1. Talk to your colleagues Sarah and Mike for hints
2. Find the key hidden in the office
3. Use the key to unlock the door
4. Enter the storage room to win!

## Controls

- **Mouse**: Click to move and interact
- **Inventory**: Bottom bar shows collected items
- **Tooltips**: Hover over objects to see what they are

## Technical Features

- **Resolution**: 320×200 virtual resolution with pixel-perfect scaling
- **Graphics**: Retro 256-color aesthetic using canvas-drawn pixel art
- **Sound**: Embedded WAV audio for walking and unlocking sounds
- **No Server Required**: Runs entirely offline from a single folder
- **CORS-Free**: All assets embedded or generated at runtime

## Game Structure

### Room 1: Office
- **NPCs**: Sarah (red shirt) and Mike (green shirt) who give hints
- **Hotspots**: Door (locked), Drawer (contains key), NPCs for dialog
- **Furniture**: Desks, computers with glowing screens

### Room 2: Storage Room
- **Purpose**: Success state - reaching this room completes the game
- **Contents**: Storage boxes and equipment
- **Exit**: Door back to the office

## Code Structure

The game is organized into clear modules:

- **GameScene**: Main game class handling all logic
- **Room System**: Manages room backgrounds and hotspots
- **Input Handler**: Click-to-move and interaction system
- **Inventory System**: Item management with visual slots
- **Dialog System**: NPC conversations with progressive hints
- **Animation System**: Player walk cycle and sprite management

## Extending the Game

To add new content:

1. **New Rooms**: Add entries to the `rooms` object in `createRooms()`
2. **New Items**: Add to the `ITEMS` object and create sprites
3. **New Hotspots**: Add to room `hotspots` arrays with action functions
4. **New Dialogs**: Modify NPC dialog arrays in talk functions
5. **New Graphics**: Use the canvas drawing system in background functions

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- Web Audio API (for sounds)

Tested in Chrome, Firefox, Safari, and Edge.

## File Structure

```
office-adventure/
├── index.html          # Main entry point
├── game.js            # Complete game logic
└── README.md          # This file
```

No external dependencies except Phaser 3 loaded via CDN.

## Credits

Built with Phaser 3 game framework. All art and code created specifically for this project using canvas primitives and embedded assets to ensure offline compatibility.
