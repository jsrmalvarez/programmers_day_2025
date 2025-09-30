/*
 * Sprite Creation and Management
 * Handles all sprite generation and texture creation
 */

export class SpriteManager {
    constructor(scene) {
        this.scene = scene;
    }

    createAllSprites() {
        // Create player sprites
        this.createPlayerSprites();

        // Create item sprites
        this.createItemSprites();

        // Create NPC sprites
        this.createNPCSprites();
    }

    createPlayerSprites() {
        const graphics = this.scene.add.graphics();

        // Player idle frame
        graphics.fillStyle(0x4a90e2);
        graphics.fillRect(0, 0, 12, 16);
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(2, 2, 8, 6); // head
        graphics.generateTexture('player_idle', 12, 16);
        graphics.clear();

        // Player walk frame 1
        graphics.fillStyle(0x4a90e2);
        graphics.fillRect(0, 0, 12, 16);
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(2, 2, 8, 6); // head
        graphics.fillStyle(0x333333);
        graphics.fillRect(1, 14, 3, 2); // left foot forward
        graphics.fillRect(8, 15, 3, 1); // right foot back
        graphics.generateTexture('player_walk1', 12, 16);
        graphics.clear();

        // Player walk frame 2
        graphics.fillStyle(0x4a90e2);
        graphics.fillRect(0, 0, 12, 16);
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(2, 2, 8, 6); // head
        graphics.fillStyle(0x333333);
        graphics.fillRect(8, 14, 3, 2); // right foot forward
        graphics.fillRect(1, 15, 3, 1); // left foot back
        graphics.generateTexture('player_walk2', 12, 16);
        graphics.clear();

        graphics.destroy();
    }

    createItemSprites() {
        const graphics = this.scene.add.graphics();

        // Create key sprite
        graphics.fillStyle(0xf1c40f);
        graphics.fillRect(0, 4, 8, 2);
        graphics.fillRect(6, 2, 2, 6);
        graphics.fillRect(8, 3, 2, 1);
        graphics.fillRect(8, 5, 2, 1);
        graphics.generateTexture('key', 10, 8);
        graphics.clear();

        graphics.destroy();
    }

    createNPCSprites() {
        const graphics = this.scene.add.graphics();

        graphics.clear();
        this.drawNPCTexture(graphics, 0xe74c3c);
        graphics.generateTexture('npc_alice', 16, 36);

        graphics.clear();
        this.drawNPCTexture(graphics, 0x2ecc71);
        graphics.generateTexture('npc_bob', 16, 36);

        graphics.clear();
        this.drawNPCTexture(graphics, 0x2e71cc);
        graphics.generateTexture('npc_charlie', 16, 36);

        graphics.destroy();
    }

    drawNPCTexture(graphics, shirtColor) {

        graphics.fillStyle(shirtColor);
        graphics.fillRect(2, 8, 12, 16);

        // Head
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(4, 0, 8, 8);

        // Arms
        graphics.fillStyle(shirtColor);
        graphics.fillRect(0, 12, 4, 8); // Left arm
        graphics.fillRect(12, 12, 4, 8); // Right arm

        // Legs
        graphics.fillStyle(0x023252);
        graphics.fillRect(2, 24, 5, 12); // Left leg
        graphics.fillRect(9, 24, 5, 12); // Right leg

        // Chair
        graphics.fillStyle(0x5a5a5a);
        graphics.fillRect(1, 14, 14, 14);
    }

    createNPCSpritesInScene() {
        // Clear existing NPC sprites and overlays
        this.clearNPCSprites();

        this.scene.sarahSprite = this.scene.add.sprite(110, 89, 'npc_alice');
        this.scene.sarahSprite.setDepth(15); // Below player (depth 20)
        this.scene.sarahSprite.setVisible(true);

        this.scene.mikeSprite = this.scene.add.sprite(210, 99, 'npc_bob');
        this.scene.mikeSprite.setDepth(15); // Below player (depth 20)
        this.scene.mikeSprite.setVisible(true);

        this.scene.mikeSprite = this.scene.add.sprite(120, 99, 'npc_charlie');
        this.scene.mikeSprite.setDepth(15); // Below player (depth 20)
        this.scene.mikeSprite.setVisible(true);
    }



    clearNPCSprites() {
        // Clear Phaser sprites
        if (this.scene.sarahSprite) {
            this.scene.sarahSprite.destroy();
            this.scene.sarahSprite = null;
        }
        if (this.scene.mikeSprite) {
            this.scene.mikeSprite.destroy();
            this.scene.mikeSprite = null;
        }
    }
}
