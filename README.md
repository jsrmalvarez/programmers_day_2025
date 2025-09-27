# Office Adventure - Point & Click Game

A classic point-and-click adventure game built with Phaser 3, featuring pixel-perfect graphics and retro aesthetics.

## 🎮 Game Features

- **Pixel Art Style**: 320x200 virtual resolution with crisp, pixel-perfect scaling
- **Interactive NPCs**: Talk to Sarah and Mike for hints
- **Puzzle Solving**: Find the key to unlock the storage room
- **Animated Screens**: Dynamic computer screens that respond to player position
- **Classic Adventure Mechanics**: Click-to-move, inventory system, hotspot interactions

## 🕹️ How to Play

### Controls
- **Left Click**: Walk to location or interact with objects
- **Inventory**: Click items to select, then click objects to use them
- **Tooltips**: Hover over objects to see their names

### Objective
Find the office key and unlock the storage room door.

## 🚀 Local Development

### Option 1: Python HTTP Server (Recommended)
```bash
# Navigate to project directory
cd programmers_day

# Start local server
python3 -m http.server 8080

# Open browser to http://localhost:8080
```

### Option 2: Any HTTP Server
The game uses ES6 modules and requires HTTP serving (won't work with `file://` URLs).

## 📁 Project Structure

```
programmers_day/
├── index.html          # Main game page
├── js/
│   ├── main.js         # Main game scene and configuration
│   ├── config.js       # Game settings and constants
│   ├── gameState.js    # State management
│   ├── sprites.js      # Sprite creation and management
│   ├── screens.js      # Animated screen system
│   ├── rooms.js        # Room definitions and backgrounds
│   ├── input.js        # Input handling and player movement
│   └── ui.js           # User interface management
└── README.md
```

## 🌐 GitHub Pages Deployment

1. **Enable GitHub Pages** in your repository settings
2. **Select Source**: Deploy from main branch
3. **Access**: Your game will be available at `https://username.github.io/repository-name/`

The modular ES6 structure works perfectly with GitHub Pages' HTTP serving.

## 🎨 Technical Features

- **Modular Architecture**: Clean separation of concerns across multiple files
- **Pixel-Perfect Rendering**: No antialiasing, crisp pixel scaling
- **Dynamic Animations**: Screen content changes based on player position
- **Proximity Interactions**: Characters must walk near objects to interact
- **Sound Effects**: Base64-encoded WAV files for offline compatibility

## 🔧 Customization

### Adding New Rooms
1. Add room definition in `js/rooms.js`
2. Create background function
3. Define hotspots and walkable bounds

### Adding New Items
1. Add item to `ITEMS` in `js/config.js`
2. Create sprite texture in `js/sprites.js`
3. Implement interaction logic

### Modifying Graphics
All graphics are generated programmatically using Phaser's graphics API. No external image files needed!

## 📝 Credits

Built with:
- **Phaser 3** - HTML5 game framework
- **ES6 Modules** - Modern JavaScript architecture
- **Pixel Art** - Nostalgic retro aesthetics

---

🎮 **Ready to play?** Start the local server and begin your office adventure!