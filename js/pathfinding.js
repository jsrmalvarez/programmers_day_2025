/*
 * Pathfinding Manager
 * Handles pathfinding using EasyStar.js with grid-based navigation
 */

import { CONFIG } from './config.js';

export class PathfindingManager {
    constructor(scene) {
        this.scene = scene;
        this.easystar = new EasyStar.js();
        this.grid = null;
        this.gridWidth = 32;  // 320 / 10
        this.gridHeight = 20; // 200 / 10
        this.cellSize = 10;   // Each grid cell represents 10x10 pixels
        this.waypoints = [];
        this.currentWaypointIndex = 0;
    }

    // Initialize pathfinding with a mask image
    initializeFromMask(maskImage) {
        if (!maskImage) {
            console.warn('No mask image provided for pathfinding');
            return;
        }

        // Create grid from mask image
        this.createGridFromMask(maskImage);

        // Configure EasyStar
        this.easystar.setGrid(this.grid);
        this.easystar.setAcceptableTiles([0]); // 0 = walkable, 1 = blocked
        this.easystar.enableDiagonals();
        this.easystar.setIterationsPerCalculation(1000);
    }

    // Create a 32x20 grid from the 320x200 mask image
    createGridFromMask(maskImage) {
        this.grid = [];

        // Initialize grid
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = 0; // Default to walkable
            }
        }

        // Use proper collision detection for each grid position
        for (let gridY = 0; gridY < this.gridHeight; gridY++) {
            for (let gridX = 0; gridX < this.gridWidth; gridX++) {
                const worldPos = this.gridToWorld(gridX, gridY);

                // Convert grid position to player center position for collision testing
                const dimensions = CONFIG.PLAYER[CONFIG.PLAYER.USE_VERSION];
                const playerCenterX = worldPos.x;
                const playerCenterY = worldPos.y - dimensions.FEET_OFFSET;

                // Use proper collision detection to determine if this position is walkable
                const isWalkable = this.scene.collisionManager.isPlayerPositionWalkable(playerCenterX, playerCenterY);
                this.grid[gridY][gridX] = isWalkable ? 0 : 1; // 0 = walkable, 1 = blocked
            }
        }

        console.log('Pathfinding grid created with proper collision detection:', this.gridWidth, 'x', this.gridHeight);
    }


    // Convert world coordinates to grid coordinates
    worldToGrid(worldX, worldY) {
        const gridX = Math.floor(worldX / this.cellSize);
        const gridY = Math.floor(worldY / this.cellSize);
        return { x: gridX, y: gridY };
    }

    // Convert grid coordinates to world coordinates
    gridToWorld(gridX, gridY) {
        const worldX = gridX * this.cellSize + this.cellSize / 2;
        const worldY = gridY * this.cellSize + this.cellSize / 2;
        return { x: worldX, y: worldY };
    }

    // Find path from start to end
    findPath(startX, startY, endX, endY, callback) {
        if (!this.grid) {
            console.warn('Pathfinding grid not initialized');
            callback(null);
            return;
        }

        const startGrid = this.worldToGrid(startX, startY);
        const endGrid = this.worldToGrid(endX, endY);

        // Clamp coordinates to grid bounds
        startGrid.x = Math.max(0, Math.min(this.gridWidth - 1, startGrid.x));
        startGrid.y = Math.max(0, Math.min(this.gridHeight - 1, startGrid.y));
        endGrid.x = Math.max(0, Math.min(this.gridWidth - 1, endGrid.x));
        endGrid.y = Math.max(0, Math.min(this.gridHeight - 1, endGrid.y));

        this.easystar.findPath(startGrid.x, startGrid.y, endGrid.x, endGrid.y, (path) => {
            if (path && path.length > 0) {
                // Convert grid path to world coordinates
                const worldPath = path.map(point => this.gridToWorld(point.x, point.y));
                callback(worldPath);
            } else {
                callback(null);
            }
        });

        this.easystar.calculate();
    }

    // Set waypoints for movement
    setWaypoints(waypoints) {
        this.waypoints = waypoints;
        this.currentWaypointIndex = 0;

        // Trigger debug redraw if enabled
        if (this.scene.inputManager && this.scene.inputManager.drawPathfindingDebug) {
            this.scene.inputManager.drawPathfindingDebug();
        }
    }

    // Get next waypoint
    getNextWaypoint() {
        if (this.currentWaypointIndex < this.waypoints.length) {
            return this.waypoints[this.currentWaypointIndex];
        }
        return null;
    }

    // Move to next waypoint
    advanceToNextWaypoint() {
        this.currentWaypointIndex++;
    }

    // Check if all waypoints have been reached
    hasReachedAllWaypoints() {
        return this.currentWaypointIndex >= this.waypoints.length;
    }

    // Clear waypoints
    clearWaypoints() {
        this.waypoints = [];
        this.currentWaypointIndex = 0;
    }

    // Get current waypoint progress
    getWaypointProgress() {
        return {
            current: this.currentWaypointIndex,
            total: this.waypoints.length,
            hasMore: this.currentWaypointIndex < this.waypoints.length
        };
    }
}
