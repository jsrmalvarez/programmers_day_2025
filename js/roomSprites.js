/*
 * Room Sprite Management
 * Handles layered PNG sprites within rooms
 */

import { CONFIG } from './config.js';

export class RoomSpriteManager {
    constructor(scene) {
        this.scene = scene;
        this.sprites = new Map(); // Map of sprite ID to Phaser sprite object
        this.dynamicSprites = new Map(); // Map of sprite ID to dynamic layering config
    }

    createSpritesForRoom(roomConfig) {
        // Clear existing sprites
        this.clearAllSprites();

        if (!roomConfig.sprites || roomConfig.sprites.length === 0) {
            return;
        }

        // Create each sprite defined in the room config
        for (const spriteConfig of roomConfig.sprites) {
            this.createSprite(spriteConfig);
        }

        // Apply debug visibility setting
        this.updateSpriteVisibility();
    }

    createSprite(config) {
        const { id, image, animation, x, y, layering } = config;

        let sprite;

        if (animation) {
            // Create animated sprite
            sprite = this.createAnimatedSprite(id, animation, x, y);
        } else if (image) {
            // Create static sprite
            sprite = this.scene.add.sprite(x, y, image);
        } else {
            console.warn(`Sprite ${id} has no image or animation defined`);
            return null;
        }

        sprite.setOrigin(0, 0);

        // Handle layering configuration
        if (layering) {
            if (layering.type === 'dynamic') {
                // Store dynamic layering config
                this.dynamicSprites.set(id, layering);
                // Set initial depth based on current player position
                this.updateSpriteDepth(id);
            } else if (layering.type === 'static') {
                // Static layer
                sprite.setDepth(layering.layer);
            } else {
                // Fallback for old format
                const layer = layering.layer || config.layer || 10;
                sprite.setDepth(layer);
            }
        } else {
            // Fallback for old 'layer' property
            const layer = config.layer || 10;
            sprite.setDepth(layer);
        }

        // Store reference
        this.sprites.set(id, sprite);

        return sprite;
    }

    createAnimatedSprite(id, animationConfig, x, y) {
        const { key, frames, frameRate, repeat } = animationConfig;

        // Create sprite using the first frame
        const sprite = this.scene.add.sprite(x, y, frames[0]);

        // Create animation from the frames
        this.scene.anims.create({
            key: key,
            frames: frames.map(frame => ({ key: frame })),
            frameRate: frameRate || 8,
            repeat: repeat !== undefined ? repeat : -1 // Default to infinite loop
        });

        // Start the animation
        sprite.play(key);

        return sprite;
    }

    getSprite(id) {
        return this.sprites.get(id);
    }

    removeSprite(id) {
        const sprite = this.sprites.get(id);
        if (sprite) {
            sprite.destroy();
            this.sprites.delete(id);
        }
    }

    clearAllSprites() {
        // Destroy all sprites
        for (const sprite of this.sprites.values()) {
            sprite.destroy();
        }
        this.sprites.clear();
        this.dynamicSprites.clear();
    }

    // Dynamic layering methods
    updateSpriteDepth(spriteId) {
        const sprite = this.sprites.get(spriteId);
        const layering = this.dynamicSprites.get(spriteId);

        if (!sprite || !layering) return;

        // Use player's feet position for realistic layering
        const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
        const playerFeetY = this.scene.gameState.playerY + dimensions.FEET_OFFSET;
        const threshold = layering.threshold;
        const currentDepth = sprite.depth;

        // Determine layer based on player feet position relative to threshold
        const newDepth = playerFeetY < threshold ? layering.aboveLayer : layering.belowLayer;

        // Only update and log if depth actually changes
        if (currentDepth !== newDepth) {
            sprite.setDepth(newDepth);
        }
    }

    updateAllDynamicLayers() {
        // Update all sprites with dynamic layering based on current player position
        for (const spriteId of this.dynamicSprites.keys()) {
            this.updateSpriteDepth(spriteId);
        }
    }

    // Helper method to add a sprite dynamically
    addSprite(id, imageKey, x, y, layer = 10) {
        // Remove existing sprite with same ID if it exists
        this.removeSprite(id);

        const config = {
            id: id,
            image: imageKey,
            x: x,
            y: y,
            layer: layer
        };

        return this.createSprite(config);
    }


    // Get all sprites sorted by layer (for debugging)
    getSpritesByLayer() {
        const sprites = Array.from(this.sprites.entries()).map(([id, sprite]) => ({
            id,
            sprite,
            layer: sprite.depth
        }));

        return sprites.sort((a, b) => a.layer - b.layer);
    }

    // Debug method to toggle sprite visibility
    updateSpriteVisibility() {
        for (const sprite of this.sprites.values()) {
            sprite.setVisible(CONFIG.DEBUG.SHOW_SPRITES);
        }
    }
}
