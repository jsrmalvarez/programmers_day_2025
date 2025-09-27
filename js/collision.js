/*
 * Collision Detection System
 * Handles walkable area detection using black/white mask images
 */

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
        if (!maskTexture || !maskTexture.source[0]) {
            console.warn(`Collision mask '${maskKey}' not found`);
            return false;
        }

        // Create a canvas to read pixel data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Get the source image
        const source = maskTexture.source[0];
        canvas.width = source.width;
        canvas.height = source.height;
        this.maskWidth = source.width;
        this.maskHeight = source.height;

        // Draw the mask image to canvas
        ctx.drawImage(source.image, 0, 0);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.maskData = imageData.data;

        return true;
    }

    isWalkable(x, y) {
        if (!this.maskData) {
            // No mask loaded, use fallback bounds
            return true;
        }

        // Clamp coordinates to mask bounds
        x = Math.floor(Math.max(0, Math.min(this.maskWidth - 1, x)));
        y = Math.floor(Math.max(0, Math.min(this.maskHeight - 1, y)));

        // Calculate pixel index (RGBA format)
        const index = (y * this.maskWidth + x) * 4;

        // Check red channel (assuming grayscale mask)
        // White (255) = walkable, Black (0) = blocked
        const red = this.maskData[index];

        return red > 128; // Threshold for walkable (white-ish pixels)
    }

    findNearestWalkablePoint(targetX, targetY, maxDistance = 20) {
        if (this.isWalkable(targetX, targetY)) {
            return { x: targetX, y: targetY };
        }

        // Spiral search for nearest walkable point
        for (let distance = 1; distance <= maxDistance; distance++) {
            for (let angle = 0; angle < 360; angle += 15) {
                const radians = (angle * Math.PI) / 180;
                const x = Math.round(targetX + Math.cos(radians) * distance);
                const y = Math.round(targetY + Math.sin(radians) * distance);

                if (this.isWalkable(x, y)) {
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
}
