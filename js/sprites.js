/*
 * Sprite Creation and Management
 * Handles all sprite generation and texture creation
 */

import { CONFIG } from './config.js';

export class SpriteManager {
    constructor(scene) {
        this.scene = scene;
    }

    createAllSprites() {
        // Create player sprites
        this.createPlayerSprites();

        // Create NPC sprites
        this.createNPCSprites();

        this.createCorrectlySeatedNPCSprites()
    }

    createPlayerSprites() {
        const graphics = this.scene.add.graphics();

        // Always draw at NEAR size, we'll scale the sprite itself later
        const drawWidth = CONFIG.PLAYER.NEAR.WIDTH;
        const drawHeight = CONFIG.PLAYER.NEAR.HEIGHT;

        // FRONT ORIENTATION (towards player)
        // Front idle
        this.drawPlayerTexture(graphics, 0x2e71cc, false, 'front');
        graphics.generateTexture('player_front_idle', drawWidth, drawHeight);
        graphics.clear();

        // Front walk frame 1 - left foot forward
        this.drawPlayerTexture(graphics, 0x2e71cc, true, 'front', 0);
        graphics.generateTexture('player_front_walk1', drawWidth, drawHeight);
        graphics.clear();

        // Front walk frame 2 - right foot forward
        this.drawPlayerTexture(graphics, 0x2e71cc, true, 'front', 1);
        graphics.generateTexture('player_front_walk2', drawWidth, drawHeight);
        graphics.clear();

        // BACK ORIENTATION (away from player)
        // Back idle
        this.drawPlayerTexture(graphics, 0x2e71cc, false, 'back');
        graphics.generateTexture('player_back_idle', drawWidth, drawHeight);
        graphics.clear();

        // Back walk frame 1 - left foot forward
        this.drawPlayerTexture(graphics, 0x2e71cc, true, 'back', 0);
        graphics.generateTexture('player_back_walk1', drawWidth, drawHeight);
        graphics.clear();

        // Back walk frame 2 - right foot forward
        this.drawPlayerTexture(graphics, 0x2e71cc, true, 'back', 1);
        graphics.generateTexture('player_back_walk2', drawWidth, drawHeight);
        graphics.clear();

        // LEFT ORIENTATION (side view)
        // Left idle
        this.drawPlayerTexture(graphics, 0x2e71cc, false, 'left');
        graphics.generateTexture('player_left_idle', drawWidth, drawHeight);
        graphics.clear();

        // Left walk frame 1
        this.drawPlayerTexture(graphics, 0x2e71cc, true, 'left', 0);
        graphics.generateTexture('player_left_walk1', drawWidth, drawHeight);
        graphics.clear();

        // Left walk frame 2
        this.drawPlayerTexture(graphics, 0x2e71cc, true, 'left', 1);
        graphics.generateTexture('player_left_walk2', drawWidth, drawHeight);
        graphics.clear();

        // RIGHT ORIENTATION (side view, mirrored)
        // Right idle
        this.drawPlayerTexture(graphics, 0x2e71cc, false, 'right');
        graphics.generateTexture('player_right_idle', drawWidth, drawHeight);
        graphics.clear();

        // Right walk frame 1
        this.drawPlayerTexture(graphics, 0x2e71cc, true, 'right', 0);
        graphics.generateTexture('player_right_walk1', drawWidth, drawHeight);
        graphics.clear();

        // Right walk frame 2
        this.drawPlayerTexture(graphics, 0x2e71cc, true, 'right', 1);
        graphics.generateTexture('player_right_walk2', drawWidth, drawHeight);
        graphics.clear();

        graphics.destroy();
    }

    drawPlayerTexture(graphics, shirtColor, isWalking = false, orientation = 'front', walkFrame = 0) {
        if (orientation === 'front') {
            this.drawFrontOrientation(graphics, shirtColor, isWalking, walkFrame);
        } else if (orientation === 'back') {
            this.drawBackOrientation(graphics, shirtColor, isWalking, walkFrame);
        } else if (orientation === 'left') {
            this.drawLeftOrientation(graphics, shirtColor, isWalking, walkFrame);
        } else if (orientation === 'right') {
            this.drawRightOrientation(graphics, shirtColor, isWalking, walkFrame);
        }
    }

    drawFrontOrientation(graphics, shirtColor, isWalking, walkFrame) {
        // Head with nose (front view)
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(6, 0, 12, 12);

        // Minimalistic nose
        graphics.fillStyle(0xf5b643);
        graphics.fillRect(11, 5, 1, 3);
        graphics.fillStyle(0xc59613);
        graphics.fillRect(11, 8, 2, 1);


        // Waist
        graphics.fillStyle(0x023252);
        graphics.fillRect(3, 36, 18, 6);

        // Legs (longer than NPC since standing)
        graphics.fillStyle(0x023252);
        if (isWalking) {
            if (walkFrame === 0) {
                graphics.fillRect(3, 36, 7, 28);
                graphics.fillRect(14, 36, 7, 22);
            } else {
                graphics.fillRect(3, 36, 7, 22);
                graphics.fillRect(14, 36, 7, 28);
            }
        } else {
            // Both legs straight (idle)
            graphics.fillRect(3, 36, 7, 28);
            graphics.fillRect(14, 36, 7, 28);
        }

        // Body
        graphics.fillStyle(shirtColor);
        graphics.fillRect(3, 12, 18, 24);


        // Collar
        graphics.fillStyle(0xAAAAAA);
        graphics.fillRect(8, 12, 8, 4);

        // Buttons
        graphics.fillStyle(0xAAAAAA);
        graphics.fillRect(11, 20, 2, 2);
        graphics.fillRect(11, 28, 2, 2);


        // Arms (same as big NPC)
        graphics.fillStyle(shirtColor);
        graphics.fillRect(0, 18, 6, 12);
        graphics.fillRect(18, 18, 6, 12);


        // Hands
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(0, 30, 6, 4);
        graphics.fillRect(18, 30, 6, 4);
    }

    drawBackOrientation(graphics, shirtColor, isWalking, walkFrame) {
        // Head with nose (front view)
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(6, 0, 12, 12);

        // Waist
        graphics.fillStyle(0x023252);
        graphics.fillRect(3, 36, 18, 6);

        // Legs (longer than NPC since standing)
        graphics.fillStyle(0x023252);
        if (isWalking) {
            if (walkFrame === 0) {
                graphics.fillRect(3, 36, 7, 28);
                graphics.fillRect(14, 36, 7, 22);
            } else {
                graphics.fillRect(3, 36, 7, 22);
                graphics.fillRect(14, 36, 7, 28);
            }
        } else {
            // Both legs straight (idle)
            graphics.fillRect(3, 36, 7, 28);
            graphics.fillRect(14, 36, 7, 28);
        }

        // Body
        graphics.fillStyle(shirtColor);
        graphics.fillRect(3, 12, 18, 24);

        // Arms (same as big NPC)
        graphics.fillStyle(shirtColor);
        graphics.fillRect(0, 18, 6, 12);
        graphics.fillRect(18, 18, 6, 12);


        // Hands
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(0, 30, 6, 4);
        graphics.fillRect(18, 30, 6, 4);
    }

    drawLeftOrientation(graphics, shirtColor, isWalking, walkFrame) {
        // Head (no nose, side view)
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(6, 0, 12, 12);

        // Nose
        graphics.fillStyle(0xf5b643);
        graphics.fillRect(5, 5, 1, 3);
        graphics.fillRect(4, 6, 2, 3);


        // Body (taller than NPC since standing)
        graphics.fillStyle(shirtColor);
        graphics.fillRect(5, 12, 14, 24);

        // Arms (same as big NPC)
        graphics.fillStyle(shirtColor);
        graphics.fillRect(9, 18, 6, 12);
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(9, 30, 6, 4);

        // Legs (side view - only one leg visible when idle, simple animation when walking)
        graphics.fillStyle(0x023252);
        if (isWalking) {
            // Simple leg animation - alternating visibility
            if (walkFrame === 0) {
                graphics.fillStyle(0x022242);
                graphics.fillRect(9, 36, 8, 22);
                graphics.fillStyle(0x023252);
                graphics.fillRect(6, 36, 8, 28);
            } else {
                graphics.fillStyle(0x022242);
                graphics.fillRect(6, 36, 8, 22);
                graphics.fillStyle(0x023252);
                graphics.fillRect(9, 36, 8, 28);
            }
        } else {
            // Idle - only one leg visible
            graphics.fillRect(8, 36, 8, 28);
        }
    }

    drawRightOrientation(graphics, shirtColor, isWalking, walkFrame) {
        // Head (no nose, side view) - mirrored
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(6, 0, 12, 12);

        // Nose - mirrored (right side of head)
        graphics.fillStyle(0xf5b643);
        graphics.fillRect(18, 5, 1, 3);
        graphics.fillRect(18, 6, 2, 3);

        // Body (taller than NPC since standing) - mirrored
        graphics.fillStyle(shirtColor);
        graphics.fillRect(5, 12, 14, 24);

        // Arms (same as big NPC) - mirrored
        graphics.fillStyle(shirtColor);
        graphics.fillRect(9, 18, 6, 12);
        graphics.fillStyle(0xf5a623);
        graphics.fillRect(9, 30, 6, 4);

        // Legs (side view - only one leg visible when idle, simple animation when walking) - mirrored
        graphics.fillStyle(0x023252);
        if (isWalking) {
            // Simple leg animation - alternating visibility - mirrored
            if (walkFrame === 0) {
                graphics.fillStyle(0x022242);
                graphics.fillRect(7, 36, 8, 22);
                graphics.fillStyle(0x023252);
                graphics.fillRect(10, 36, 8, 28);
            } else {
                graphics.fillStyle(0x022242);
                graphics.fillRect(10, 36, 8, 22);
                graphics.fillStyle(0x023252);
                graphics.fillRect(7, 36, 8, 28);
            }
        } else {
            // Idle - only one leg visible - mirrored
            graphics.fillRect(8, 36, 8, 28);
        }
    }


    createNPCSprites() {
        const graphics = this.scene.add.graphics();



        graphics.clear();
        this.drawNPCTexture(graphics, 0x2ecc71);
        graphics.generateTexture('npc_eve', 16, 36);

        graphics.clear();
        this.drawNPCTexture(graphics, 0xee712e);
        graphics.generateTexture('npc_david', 16, 36);

        graphics.clear();
        this.drawNPCTexture(graphics, 0x4c3ce7, true);
        graphics.generateTexture('npc_charlie', 24, 54);

        graphics.clear();
        this.drawNPCTexture(graphics, 0x3ce74c, true);
        graphics.generateTexture('npc_bob', 24, 54);

        graphics.clear();
        this.drawNPCTexture(graphics, 0xe74c3c, true);
        graphics.generateTexture('npc_alice', 24, 54);

        graphics.destroy();
    }

    createCorrectlySeatedNPCSprites() {
        const graphics = this.scene.add.graphics();

        graphics.clear();
        this.drawNPCTexture(graphics, 0xe74c3c);
        graphics.generateTexture('npc_correctly_seated_alice', 16, 36);

        graphics.clear();
        this.drawNPCTexture(graphics, 0x3ce74c);
        graphics.generateTexture('npc_correctly_seated_bob', 16, 36);

        graphics.clear();
        this.drawNPCTexture(graphics, 0x4c3ce7);
        graphics.generateTexture('npc_correctly_seated_charlie', 16, 36);

        graphics.clear();
        this.drawNPCTexture(graphics, 0xee712e, true);
        graphics.generateTexture('npc_correctly_seated_david', 24, 54);

        graphics.clear();
        this.drawNPCTexture(graphics, 0x2ecc71, true);
        graphics.generateTexture('npc_correctly_seated_eve', 24, 54);





        graphics.destroy();
    }

    drawNPCTexture(graphics, shirtColor, big = false) {

        if(big == false) {
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
        else {
            graphics.fillStyle(shirtColor);
            graphics.fillRect(3, 12, 18, 24);

            // Head
            graphics.fillStyle(0xf5a623);
            graphics.fillRect(6, 0, 12, 12);

            // Arms
            graphics.fillStyle(shirtColor);
            graphics.fillRect(0, 18, 6, 12);
            graphics.fillRect(18, 18, 6, 12);

            // Legs
            graphics.fillStyle(0x023252);
            graphics.fillRect(3, 36, 7, 18);
            graphics.fillRect(14, 36, 7, 18);

            // Chair
            graphics.fillStyle(0x5a5a5a);
            graphics.fillRect(2, 21, 20, 21);
        }
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
