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

        // Debug features
        this.debugCoords = false;
        this.debugDot = null;
        this.debugText = null;
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
            this.updateCoordsDebug(x, y);
        });

        // Keyboard input for debug toggles
        this.scene.input.keyboard.on('keydown-M', () => {
            this.toggleMaskDebug();
        });

        this.scene.input.keyboard.on('keydown-S', () => {
            this.toggleSpriteDebug();
        });

        this.scene.input.keyboard.on('keydown-C', () => {
            this.toggleCoordsDebug();
        });

        this.scene.input.keyboard.on('keydown-H', () => {
            this.toggleHotspotDebug();
        });

        this.scene.input.keyboard.on('keydown-P', () => {
            this.togglePathfindingDebug();
        });

        // Get tooltip element from DOM
        this.tooltip = document.getElementById('tooltip');
    }

    handleClick(x, y) {
        // Don't process clicks when modal dialog is open
        if (this.scene.uiManager.isModalDialogOpen()) {
            return;
        }

        // Check if clicking in inventory area (only when inventory is visible)
        if(this.scene.uiManager.handleInventoryClick(x, y)){
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

        // No hotspot clicked, move player so feet end up at clicked position
        this.movePlayerTo(x, y);
    }

    handleMouseMove(x, y) {
        // Don't show tooltips when modal dialog is open
        if (this.scene.uiManager.isModalDialogOpen()) {
            if (this.tooltip) {
                this.tooltip.style.display = 'none';
            }
            return;
        }

        let tooltipText = '';

        // Check if mouse is in inventory area (only when inventory is visible)
        let isInInventoryArea = false;
        if (this.scene.uiManager.inventoryVisible) {

            isInInventoryArea = y >= this.scene.uiManager.inventoryY && y <= CONFIG.VIRTUAL_HEIGHT &&
                               x >= this.scene.uiManager.inventoryX - 25 && x <= this.scene.uiManager.inventoryX + this.scene.uiManager.inventoryWidth + 25;
        }

        if (!isInInventoryArea) {
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
        // Calculate target position at the lower edge of the hotspot
        const hotspotCenterX = hotspot.x + hotspot.width / 2;
        const targetX = hotspotCenterX; // Center horizontally on the hotspot
        const targetY = hotspot.y + hotspot.height + CONFIG.APPROACH_DISTANCE; // Below the hotspot

        // Store the interaction to execute when player reaches target
        this.pendingInteraction = hotspot;
        // movePlayerTo will automatically adjust so feet end up at (targetX, targetY)
        this.movePlayerTo(targetX, targetY);
    }

    movePlayerTo(x, y) {
        // Calculate player center position so that feet end up at clicked coordinates
        // We need to subtract the feet offset from the Y coordinate
        const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
        const targetCenterX = x;
        const targetCenterY = y - dimensions.FEET_OFFSET;

        // Use pathfinding if available, otherwise fall back to collision detection
        if (this.scene.pathfindingManager && this.scene.pathfindingManager.grid) {
            // Get player feet position for pathfinding
            const playerFeet = this.scene.collisionManager.getPlayerFeetPosition(gameState.playerX, gameState.playerY);

            // Calculate target feet position (where we want the player's feet to end up)
            const targetFeetX = x;
            const targetFeetY = y;

            // Use pathfinding to find waypoints (using feet positions)
            this.scene.pathfindingManager.findPath(
                playerFeet.x,
                playerFeet.y,
                targetFeetX,
                targetFeetY,
                (waypoints) => {
                    if (waypoints && waypoints.length > 0) {
                        // Convert waypoints from feet coordinates to center coordinates
                        const centerWaypoints = waypoints.map(waypoint => ({
                            x: waypoint.x,
                            y: waypoint.y - dimensions.FEET_OFFSET
                        }));

                        // Set waypoints for movement
                        this.scene.pathfindingManager.setWaypoints(centerWaypoints);

                        // Start moving to first waypoint
                        const firstWaypoint = this.scene.pathfindingManager.getNextWaypoint();
                        if (firstWaypoint) {
                            setPlayerTarget(firstWaypoint.x, firstWaypoint.y);
                            gameState.isWalking = true;
                        }
                    } else {
                        // No path found, try to find nearest walkable point
                        const walkablePoint = this.scene.collisionManager.findNearestWalkablePoint(targetCenterX, targetCenterY);
                        setPlayerTarget(walkablePoint.x, walkablePoint.y);
                    }
                    this.playSound('walk');
                }
            );
        } else if (this.scene.collisionManager.maskData) {
            // Fallback to collision detection
            const walkablePoint = this.scene.collisionManager.findNearestWalkablePoint(targetCenterX, targetCenterY);
            setPlayerTarget(walkablePoint.x, walkablePoint.y);
            this.playSound('walk');
        } else {
            // Fallback to bounds-based movement
            const room = this.scene.rooms[gameState.currentRoom];
            const bounds = room.walkableBounds;

            const clampedX = Math.max(bounds.x, Math.min(bounds.x + bounds.width, targetCenterX));
            const clampedY = Math.max(bounds.y, Math.min(bounds.y + bounds.height, targetCenterY));

            setPlayerTarget(clampedX, clampedY);
            this.playSound('walk');
        }
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

        // Safety check to ensure scene exists
        if (!this.scene) return;

        const dx = gameState.targetX - gameState.playerX;
        const dy = gameState.targetY - gameState.playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 2) {
            // Reached current target
            gameState.playerX = gameState.targetX;
            gameState.playerY = gameState.targetY;

            // Check if we have more waypoints to follow
            if (this.scene.pathfindingManager && !this.scene.pathfindingManager.hasReachedAllWaypoints()) {
                // Move to next waypoint
                this.scene.pathfindingManager.advanceToNextWaypoint();
                const nextWaypoint = this.scene.pathfindingManager.getNextWaypoint();

                if (nextWaypoint) {
                    // Continue to next waypoint
                    setPlayerTarget(nextWaypoint.x, nextWaypoint.y);

                    // Update pathfinding debug visualization
                    if (CONFIG.DEBUG.SHOW_PATHFINDING) {
                        this.drawPathfindingDebug();
                    }

                    return; // Continue movement
                }
            }

            // No more waypoints, stop movement
            gameState.isWalking = false;

            // Execute pending interaction if any
            if (this.pendingInteraction) {
                const hotspot = this.pendingInteraction;
                this.pendingInteraction = null;

                // Double-check player is close enough
                if (this.isPlayerNearHotspot(hotspot)) {
                    hotspot.action();
                } else if (this.scene.uiManager) {
                    this.scene.uiManager.showMessage("Can't reach that from here.");
                }
            }
        } else {
            // Calculate next position
            const speed = 1;
            const nextX = gameState.playerX + (dx / distance) * speed;
            const nextY = gameState.playerY + (dy / distance) * speed;

            // Check if next position is walkable (if collision system is available)
            if (this.scene.collisionManager.maskData) {
                // Check collision using proper player feet position
                if (this.scene.collisionManager.isPlayerPositionWalkable(nextX, nextY)) {
                    // Safe to move
                    gameState.playerX = nextX;
                    gameState.playerY = nextY;
                } else {
                    // Hit a wall, stop movement
                    const feet = this.scene.collisionManager.getPlayerFeetPosition(nextX, nextY);
                    gameState.isWalking = false;

                    // Clear any pending interaction since we couldn't reach the target
                    if (this.pendingInteraction) {
                        this.pendingInteraction = null;
                        if (this.scene.uiManager) {
                            this.scene.uiManager.showMessage("Can't reach that from here.");
                        }
                    }
                }
            } else {
                // No collision, move normally
                gameState.playerX = nextX;
                gameState.playerY = nextY;
            }
        }

        // Update player sprite position and version based on Y position
        if (this.scene.playerSprite) {

            this.scene.playerSprite.x = gameState.playerX;
            this.scene.playerSprite.y = gameState.playerY;

            // Update player version based on Y position and room thresholds
            const currentRoom = this.scene.rooms[gameState.currentRoom];

            if (currentRoom && currentRoom.nearFarThreshold && currentRoom.farTinyThreshold) {
                let newVersion;
                if (gameState.playerY < currentRoom.farTinyThreshold) {
                    newVersion = 'TINY';
                } else if (gameState.playerY < currentRoom.nearFarThreshold) {
                    newVersion = 'FAR';
                } else {
                    newVersion = 'NEAR';
                }

                if (CONFIG.PLAYER.USE_VERSION !== newVersion) {
                    CONFIG.PLAYER.USE_VERSION = newVersion;
                    // Apply new version's scale
                    this.scene.playerSprite.setScale(CONFIG.PLAYER.getScale(newVersion));
                }
            }
        }

        // Update all dynamic layering based on new player position
        if (this.scene.roomSpriteManager) {
            this.scene.roomSpriteManager.updateAllDynamicLayers();
        }
        if (this.scene.npcManager) {
            this.scene.npcManager.updateAllNPCLayers();
        }
        if (this.scene.screenManager) {
            this.scene.screenManager.updateScreenLayers();
        }

        // Check position triggers
        if (this.scene.roomManager) {
            this.scene.roomManager.checkTriggers();
        }
    }

    updateAnimation() {
        // Safety check to ensure scene and playerSprite exist
        if (!this.scene || !this.scene.playerSprite) {
            return;
        }

        // Determine orientation based on movement direction
        this.updatePlayerOrientation();

        if (gameState.isWalking) {
            gameState.walkTimer++;
            if (gameState.walkTimer >= 15) { // Change frame every 0.25 seconds at 60fps
                gameState.walkTimer = 0;
                gameState.walkFrame = (gameState.walkFrame + 1) % 2;

                // Update sprite texture based on orientation
                const walkTexture = gameState.walkFrame === 0 ?
                    `player_${gameState.playerOrientation}_walk1` :
                    `player_${gameState.playerOrientation}_walk2`;
                this.scene.playerSprite.setTexture(walkTexture);
            }
        } else {
            // Use idle texture when not walking
            this.scene.playerSprite.setTexture(`player_${gameState.playerOrientation}_idle`);
        }
    }

    updatePlayerOrientation() {
        if (!gameState.isWalking) return; // Don't change orientation when not moving

        const deltaX = gameState.targetX - gameState.playerX;
        const deltaY = gameState.targetY - gameState.playerY;

        // Determine orientation based on movement direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal movement is dominant
            gameState.playerOrientation = deltaX > 0 ? 'right' : 'left';
        } else {
            // Vertical movement is dominant
            gameState.playerOrientation = deltaY > 0 ? 'front' : 'back';
        }
    }

    clearPendingInteraction() {
        this.pendingInteraction = null;
    }

    // Debug toggle methods
    toggleMaskDebug() {
        CONFIG.DEBUG.SHOW_MASK = !CONFIG.DEBUG.SHOW_MASK;
        // Refresh the current room to apply the change
        this.scene.roomManager.refreshCurrentRoom();
    }

    toggleSpriteDebug() {
        CONFIG.DEBUG.SHOW_SPRITES = !CONFIG.DEBUG.SHOW_SPRITES;
        // Update sprite visibility
        this.scene.roomSpriteManager.updateSpriteVisibility();
    }

    toggleHotspotDebug() {
        CONFIG.DEBUG.SHOW_HOTSPOTS = !CONFIG.DEBUG.SHOW_HOTSPOTS;
        // Trigger a redraw to show/hide hotspot rectangles
        this.scene.roomManager.refreshCurrentRoom();
    }

    toggleCoordsDebug() {
        this.debugCoords = !this.debugCoords;

        if (this.debugCoords) {
            // Create debug dot and text
            this.debugDot = this.scene.add.graphics();
            this.debugDot.setDepth(1000); // Very high depth to be on top of everything

            this.debugText = this.scene.add.bitmapText(10, 10, 'arcade', '', 7);
            this.debugText.setDepth(1001);
            this.debugText.setTint(0x00ff00); // Green color for visibility

        } else {
            // Clean up debug elements
            if (this.debugDot) {
                this.debugDot.destroy();
                this.debugDot = null;
            }
            if (this.debugText) {
                this.debugText.destroy();
                this.debugText = null;
            }
        }
    }

    updateCoordsDebug(x, y) {
        if (!this.debugCoords || !this.debugDot || !this.debugText) return;

        // Update debug dot position
        this.debugDot.clear();
        this.debugDot.fillStyle(0xff0000); // Red dot
        this.debugDot.fillRect(x, y, 1, 1); // Single pixel dot at cursor position

        // Update coordinates text
        this.debugText.setText(`X: ${x}, Y: ${y}`);
    }

    togglePathfindingDebug() {
        CONFIG.DEBUG.SHOW_PATHFINDING = !CONFIG.DEBUG.SHOW_PATHFINDING;

        if (CONFIG.DEBUG.SHOW_PATHFINDING) {
            // Create pathfinding debug graphics
            this.pathfindingDebugGraphics = this.scene.add.graphics();
            this.pathfindingDebugGraphics.setDepth(999); // High depth to be visible
            this.drawPathfindingDebug();
        } else {
            // Clean up pathfinding debug elements
            if (this.pathfindingDebugGraphics) {
                this.pathfindingDebugGraphics.destroy();
                this.pathfindingDebugGraphics = null;
            }
        }
    }

    drawPathfindingDebug() {
        if (!CONFIG.DEBUG.SHOW_PATHFINDING || !this.pathfindingDebugGraphics) return;

        this.pathfindingDebugGraphics.clear();

        // Draw the 32x20 grid in cyan (only on walkable positions)
        if (this.scene.pathfindingManager && this.scene.pathfindingManager.grid) {
            const cellSize = this.scene.pathfindingManager.cellSize;

            // Draw grid points only where the player can actually stand
            this.pathfindingDebugGraphics.fillStyle(0x00ffff, 0.7); // Cyan with transparency
            for (let y = 0; y < this.scene.pathfindingManager.gridHeight; y++) {
                for (let x = 0; x < this.scene.pathfindingManager.gridWidth; x++) {
                    const worldPos = this.scene.pathfindingManager.gridToWorld(x, y);

                    // Convert grid position to player center position for collision testing
                    const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
                    const playerCenterX = worldPos.x;
                    const playerCenterY = worldPos.y - dimensions.FEET_OFFSET;

                    // Only draw grid points where the player can actually stand
                    if (this.scene.collisionManager.isPlayerPositionWalkable(playerCenterX, playerCenterY)) {
                        this.pathfindingDebugGraphics.fillRect(worldPos.x - 1, worldPos.y - 1, 2, 2);
                    }
                }
            }
        }

        // Draw pathfinding path if player is walking
        if (gameState.isWalking && this.scene.pathfindingManager && this.scene.pathfindingManager.waypoints.length > 0) {
            // Get player feet position for proper positioning
            const playerFeet = this.scene.collisionManager.getPlayerFeetPosition(gameState.playerX, gameState.playerY);

            // Draw starting point in red (at feet position)
            this.pathfindingDebugGraphics.fillStyle(0xff0000, 0.8); // Red
            this.pathfindingDebugGraphics.fillRect(playerFeet.x - 2, playerFeet.y - 2, 4, 4);

            // Only draw lines if there are waypoints to connect
            if (this.scene.pathfindingManager.waypoints.length > 0) {
                // Draw waypoints and lines
                this.pathfindingDebugGraphics.lineStyle(2, 0xff0000, 0.8); // Red lines

                // Start from the current waypoint index (skip already reached waypoints)
                const currentWaypointIndex = this.scene.pathfindingManager.currentWaypointIndex;
                let lastX = playerFeet.x;
                let lastY = playerFeet.y;

                for (let i = currentWaypointIndex; i < this.scene.pathfindingManager.waypoints.length; i++) {
                    const waypoint = this.scene.pathfindingManager.waypoints[i];

                    // Convert waypoint from center coordinates back to feet coordinates for display
                    const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
                    const waypointFeetX = waypoint.x;
                    const waypointFeetY = waypoint.y + dimensions.FEET_OFFSET;

                    // Draw waypoint
                    this.pathfindingDebugGraphics.fillStyle(0xff0000, 0.8);
                    this.pathfindingDebugGraphics.fillRect(waypointFeetX - 2, waypointFeetY - 2, 4, 4);

                    // Only draw line if this is not the first waypoint from current position
                    if (i > currentWaypointIndex) {
                        this.pathfindingDebugGraphics.lineBetween(lastX, lastY, waypointFeetX, waypointFeetY);
                    }

                    lastX = waypointFeetX;
                    lastY = waypointFeetY;
                }

                // Draw line to final target only if there are waypoints
                const targetFeet = this.scene.collisionManager.getPlayerFeetPosition(gameState.targetX, gameState.targetY);
                this.pathfindingDebugGraphics.lineBetween(lastX, lastY, targetFeet.x, targetFeet.y);
            }

            // Draw final target point (at feet position)
            const targetFeet = this.scene.collisionManager.getPlayerFeetPosition(gameState.targetX, gameState.targetY);
            this.pathfindingDebugGraphics.fillStyle(0xff0000, 0.8);
            this.pathfindingDebugGraphics.fillRect(targetFeet.x - 2, targetFeet.y - 2, 4, 4);
        }
    }
}
