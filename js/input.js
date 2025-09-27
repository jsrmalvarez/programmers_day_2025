/*
 * Input Management and Player Interaction
 * Handles mouse input, player movement, and hotspot interactions
 */

import { CONFIG, SOUNDS } from './config.js';
import { gameState, setPlayerTarget } from './gameState.js';

export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.tooltip = null;
        this.pendingInteraction = null;
    }

    setupInput() {
        // Mouse click handler
        this.scene.input.on('pointerdown', (pointer) => {
            const x = Math.floor(pointer.x * CONFIG.VIRTUAL_WIDTH / this.scene.cameras.main.width);
            const y = Math.floor(pointer.y * CONFIG.VIRTUAL_HEIGHT / this.scene.cameras.main.height);

            this.handleClick(x, y);
        });

        // Mouse move handler for tooltips
        this.scene.input.on('pointermove', (pointer) => {
            const x = Math.floor(pointer.x * CONFIG.VIRTUAL_WIDTH / this.scene.cameras.main.width);
            const y = Math.floor(pointer.y * CONFIG.VIRTUAL_HEIGHT / this.scene.cameras.main.height);

            this.handleMouseMove(x, y);
        });

        // Get tooltip element from DOM
        this.tooltip = document.getElementById('tooltip');
    }

    handleClick(x, y) {
        // Check if clicking in inventory area
        if (y >= CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT) {
            this.scene.uiManager.handleInventoryClick(x, y);
            return;
        }

        // Check hotspots
        const room = this.scene.rooms[gameState.currentRoom];
        for (const hotspot of room.hotspots) {
            if (x >= hotspot.x && x <= hotspot.x + hotspot.width &&
                y >= hotspot.y && y <= hotspot.y + hotspot.height) {

                // Check if player is near enough to interact
                if (this.isPlayerNearHotspot(hotspot)) {
                    hotspot.action();
                } else {
                    // Move player to hotspot first
                    this.movePlayerToHotspot(hotspot);
                }
                return;
            }
        }

        // No hotspot clicked, just move player
        this.movePlayerTo(x, y);
    }

    handleMouseMove(x, y) {
        let tooltipText = '';

        if (y < CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT) {
            // Check room hotspots
            const room = this.scene.rooms[gameState.currentRoom];
            for (const hotspot of room.hotspots) {
                if (x >= hotspot.x && x <= hotspot.x + hotspot.width &&
                    y >= hotspot.y && y <= hotspot.y + hotspot.height) {
                    tooltipText = hotspot.name;

                    // Show "Use X with Y" if item is selected
                    if (gameState.selectedItem) {
                        tooltipText = `Use ${gameState.selectedItem.name} with ${hotspot.name}`;
                    }
                    break;
                }
            }
        } else {
            // Check inventory tooltips
            tooltipText = this.scene.uiManager.getInventoryTooltip(x, y);
        }

        this.showTooltip(tooltipText, x, y);
    }

    showTooltip(text, x, y) {
        if (text) {
            this.tooltip.textContent = text;
            this.tooltip.style.display = 'block';

            // Position tooltip relative to canvas
            this.tooltip.style.left = (x * this.scene.cameras.main.width / CONFIG.VIRTUAL_WIDTH) + 'px';
            this.tooltip.style.top = (y * this.scene.cameras.main.height / CONFIG.VIRTUAL_HEIGHT - 25) + 'px';
        } else {
            this.tooltip.style.display = 'none';
        }
    }

    isPlayerNearHotspot(hotspot) {
        const hotspotCenterX = hotspot.x + hotspot.width / 2;
        const hotspotCenterY = hotspot.y + hotspot.height / 2;

        const dx = gameState.playerX - hotspotCenterX;
        const dy = gameState.playerY - hotspotCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= CONFIG.INTERACTION_DISTANCE;
    }

    movePlayerToHotspot(hotspot) {
        // Calculate a good position near the hotspot
        const hotspotCenterX = hotspot.x + hotspot.width / 2;
        const hotspotCenterY = hotspot.y + hotspot.height / 2;

        const room = this.scene.rooms[gameState.currentRoom];
        const bounds = room.walkableBounds;

        // Try to approach from below (most common for adventure games)
        let targetX = Math.max(bounds.x + 10, Math.min(bounds.x + bounds.width - 10, hotspotCenterX));
        let targetY = Math.max(bounds.y + 10, Math.min(bounds.y + bounds.height - 10, hotspot.y + hotspot.height + CONFIG.APPROACH_DISTANCE));

        // If can't approach from below, try from the side
        if (targetY > bounds.y + bounds.height - 10) {
            targetY = hotspotCenterY;
            if (gameState.playerX < hotspotCenterX) {
                targetX = Math.max(bounds.x + 10, hotspot.x - CONFIG.APPROACH_DISTANCE);
            } else {
                targetX = Math.min(bounds.x + bounds.width - 10, hotspot.x + hotspot.width + CONFIG.APPROACH_DISTANCE);
            }
        }

        // Store the interaction to execute when player reaches target
        this.pendingInteraction = hotspot;
        this.movePlayerTo(targetX, targetY);
    }

    movePlayerTo(x, y) {
        // Clamp to walkable bounds
        const room = this.scene.rooms[gameState.currentRoom];
        const bounds = room.walkableBounds;

        x = Math.max(bounds.x, Math.min(bounds.x + bounds.width, x));
        y = Math.max(bounds.y, Math.min(bounds.y + bounds.height, y));

        setPlayerTarget(x, y);
        this.playSound('walk');
    }

    playSound(soundName) {
        if (SOUNDS[soundName]) {
            const audio = new Audio(SOUNDS[soundName]);
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignore audio errors (user interaction required)
            });
        }
    }

    updateMovement() {
        if (!gameState.isWalking) return;

        const dx = gameState.targetX - gameState.playerX;
        const dy = gameState.targetY - gameState.playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
            // Reached target
            gameState.playerX = gameState.targetX;
            gameState.playerY = gameState.targetY;
            gameState.isWalking = false;

            // Execute pending interaction if any
            if (this.pendingInteraction) {
                const hotspot = this.pendingInteraction;
                this.pendingInteraction = null;

                // Double-check player is close enough
                if (this.isPlayerNearHotspot(hotspot)) {
                    hotspot.action();
                } else {
                    this.scene.uiManager.showMessage("Can't reach that from here.");
                }
            }
        } else {
            // Move towards target
            const speed = 1;
            gameState.playerX += (dx / distance) * speed;
            gameState.playerY += (dy / distance) * speed;
        }

        // Update player sprite position
        if (this.scene.playerSprite) {
            this.scene.playerSprite.x = gameState.playerX;
            this.scene.playerSprite.y = gameState.playerY;
        }
    }

    updateAnimation() {
        if (gameState.isWalking) {
            gameState.walkTimer++;
            if (gameState.walkTimer >= 15) { // Change frame every 0.25 seconds at 60fps
                gameState.walkTimer = 0;
                gameState.walkFrame = (gameState.walkFrame + 1) % 2;

                // Update sprite texture
                if (this.scene.playerSprite) {
                    this.scene.playerSprite.setTexture(gameState.walkFrame === 0 ? 'player_walk1' : 'player_walk2');
                }
            }
        } else {
            // Use idle texture when not walking
            if (this.scene.playerSprite) {
                this.scene.playerSprite.setTexture('player_idle');
            }
        }
    }

    clearPendingInteraction() {
        this.pendingInteraction = null;
    }
}
