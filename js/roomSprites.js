/*
 * Room Sprite Management
 * Handles layered PNG sprites within rooms
 */

export class RoomSpriteManager {
    constructor(scene) {
        this.scene = scene;
        this.sprites = new Map(); // Map of sprite ID to Phaser sprite object
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
    }

    createSprite(config) {
        const { id, image, x, y, layer = 10 } = config;

        // Create Phaser sprite
        const sprite = this.scene.add.sprite(x, y, image);
        sprite.setDepth(layer);
        sprite.setOrigin(0, 0);

        // Store reference
        this.sprites.set(id, sprite);

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

    // Helper method to change sprite layer
    setSpriteLayer(id, layer) {
        const sprite = this.sprites.get(id);
        if (sprite) {
            sprite.setDepth(layer);
        }
    }

    // Helper method to move sprite
    moveSprite(id, x, y) {
        const sprite = this.sprites.get(id);
        if (sprite) {
            sprite.setPosition(x, y);
        }
    }

    // Helper method to show/hide sprite
    setSpriteVisible(id, visible) {
        const sprite = this.sprites.get(id);
        if (sprite) {
            sprite.setVisible(visible);
        }
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
}
