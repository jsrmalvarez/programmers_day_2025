/*
 * Collision Detection System
 * Handles walkable area detection using black/white mask images
 */

import { CONFIG } from './config.js';

export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
        this.maskData = null;
        this.maskWidth = 0;
        this.maskHeight = 0;
    }

    loadMask(maskKey) {

        // Get the mask texture from Phaser
        const maskTexture = this.scene.textures.get(maskKey);
        if (!maskTexture) {
            console.warn(`Collision mask texture '${maskKey}' not found in Phaser textures`);
            return false;
        }

        const source = maskTexture.source[0];
        if (!source) {
            console.warn(`Collision mask source not found for '${maskKey}'`);
            return false;
        }

        if (!source.image) {
            console.warn(`Collision mask image not loaded yet for '${maskKey}'`);
            // Try to load it with a delay
            this.scene.time.delayedCall(100, () => {
                this.loadMask(maskKey);
            });
            return false;
        }

        // Create a canvas to read pixel data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = source.width;
        canvas.height = source.height;
        this.maskWidth = source.width;
        this.maskHeight = source.height;

        try {
            // Draw the mask image to canvas
            ctx.drawImage(source.image, 0, 0);

            // Get pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this.maskData = imageData.data;


            return true;
        } catch (error) {
            console.error(`Error loading collision mask '${maskKey}':`, error);
            return false;
        }
    }

    isWalkable(x, y) {
        if (!this.maskData) {
            // No mask loaded, use fallback bounds
            return true;
        }

        // Clamp coordinates to mask bounds
        const clampedX = Math.floor(Math.max(0, Math.min(this.maskWidth - 1, x)));
        const clampedY = Math.floor(Math.max(0, Math.min(this.maskHeight - 1, y)));

        // Calculate pixel index (RGBA format)
        const index = (clampedY * this.maskWidth + clampedX) * 4;

        // Check red channel (assuming grayscale mask)
        // White (255) = walkable, Black (0) = blocked
        const red = this.maskData[index];
        const green = this.maskData[index + 1];
        const blue = this.maskData[index + 2];
        const alpha = this.maskData[index + 3];

        const isWalkable = red > 128; // Threshold for walkable (white-ish pixels)

        return isWalkable;
    }

    findNearestWalkablePoint(targetX, targetY, maxDistance = 20) {
        // Check if the target position is walkable for the player (using feet position)
        if (this.isPlayerPositionWalkable(targetX, targetY)) {
            return { x: targetX, y: targetY };
        }

        // Spiral search for nearest walkable point
        for (let distance = 1; distance <= maxDistance; distance++) {
            for (let angle = 0; angle < 360; angle += 15) {
                const radians = (angle * Math.PI) / 180;
                const x = Math.round(targetX + Math.cos(radians) * distance);
                const y = Math.round(targetY + Math.sin(radians) * distance);

                // Check if this position is walkable for the player (using feet position)
                if (this.isPlayerPositionWalkable(x, y)) {
                    return { x, y };
                }
            }
        }

        // If no walkable point found, return original coordinates
        return { x: targetX, y: targetY };
    }

    getWalkablePath(startX, startY, endX, endY) {
        // Simple line-of-sight check
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.ceil(distance);

        if (steps === 0) return [{ x: endX, y: endY }];

        const stepX = dx / steps;
        const stepY = dy / steps;

        // Check each step along the path
        for (let i = 0; i <= steps; i++) {
            const x = Math.round(startX + stepX * i);
            const y = Math.round(startY + stepY * i);

            if (!this.isWalkable(x, y)) {
                // Path blocked, find nearest walkable point to the blocked position
                const nearestPoint = this.findNearestWalkablePoint(x, y);
                return [nearestPoint];
            }
        }

        // Path is clear
        return [{ x: endX, y: endY }];
    }

    clearMask() {
        this.maskData = null;
        this.maskWidth = 0;
        this.maskHeight = 0;
    }

    // Helper method to get player's feet position for collision detection
    getPlayerFeetPosition(playerX, playerY) {
        return {
            x: Math.round(playerX),
            y: Math.round(playerY + CONFIG.PLAYER.FEET_OFFSET)
        };
    }

    // Check if player can be at a given position (using full feet width for collision)
    isPlayerPositionWalkable(playerX, playerY) {
        const feetY = playerY + CONFIG.PLAYER.FEET_OFFSET;
        const halfWidth = CONFIG.PLAYER.WIDTH / 2;

        // Check multiple points across the player's feet width for thorough collision detection
        // For a 12-pixel wide character, check 5 points to ensure no gaps
        const checkPoints = [
            { x: playerX - halfWidth - 1, y: feetY }, // Left edge (with 1px margin)
            { x: playerX - halfWidth/2, y: feetY },   // Left quarter
            { x: playerX, y: feetY },                 // Center
            { x: playerX + halfWidth/2, y: feetY },   // Right quarter
            { x: playerX + halfWidth + 1, y: feetY }  // Right edge (with 1px margin)
        ];

        // All points must be walkable for the position to be valid
        for (let i = 0; i < checkPoints.length; i++) {
            const point = checkPoints[i];
            const roundedX = Math.round(point.x);
            const roundedY = Math.round(point.y);

            if (!this.isWalkable(roundedX, roundedY)) {
                return false;
            }
        }

        return true;
    }
}
