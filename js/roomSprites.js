/*
 * Room Sprite Management
 * Handles layered PNG sprites within rooms
 */

import { CONFIG } from './config.js';
import { gameState } from './gameState.js';

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

        // Handle conditional visibility for items that can be taken
        if (id === 'mouse' && gameState.progress._022_mouseTaken) {
            sprite.setVisible(false);
        }

        if(id === 'branch' && gameState.progress._023_branchTaken) {
            sprite.setVisible(false);
        }

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
        const { key, frames, frameRate, frameDurations, framePositions, repeat, autoStart } = animationConfig;

        // Create sprite with the first frame texture
        const sprite = this.scene.add.sprite(x, y, frames[0]);

        // If autoStart is false, make it invisible immediately
        if (autoStart === false) {
            sprite.setVisible(false);
            sprite.setAlpha(0); // Also set alpha to 0 to ensure it's completely invisible
        }

        // Check if we need custom animation system
        const hasDynamicDurations = frameDurations && frameDurations.some(duration => typeof duration === 'function');
        const hasFramePositions = framePositions && framePositions.length > 0;

        if (hasDynamicDurations || hasFramePositions) {
            // Use custom animation system for dynamic durations or frame positioning
            this.createCustomAnimatedSprite(sprite, id, animationConfig);
        } else {
            // Use standard Phaser animation for static durations
            const animationFrames = frames.map((frame, index) => {
                const frameConfig = { key: frame };

                // Check if we have frame-specific durations
                if (frameDurations && frameDurations[index] !== undefined) {
                    frameConfig.duration = frameDurations[index];
                }

                return frameConfig;
            });

            // Create animation from the frames
            this.scene.anims.create({
                key: key,
                frames: animationFrames,
                frameRate: frameRate || 8,
                repeat: repeat !== undefined ? repeat : -1
            });

            // Start the animation
            sprite.play(key);
        }

        return sprite;
    }

    createCustomAnimatedSprite(sprite, id, animationConfig) {
        const { key, frames, frameRate, frameDurations, framePositions, translation, autoStart, repeat } = animationConfig;

        // Store original position for reference
        const originalX = sprite.x;
        const originalY = sprite.y;

        // Store animation state on the sprite
        sprite.animationState = {
            frames: frames,
            frameDurations: frameDurations,
            framePositions: framePositions,
            translation: translation,
            frameRate: frameRate || 8,
            repeat: repeat !== undefined ? repeat : -1,
            currentFrame: 0,
            frameStartTime: 0,
            isPlaying: autoStart === true, // Only true if explicitly set to true
            loopCount: 0,
            originalX: originalX,
            originalY: originalY,
            currentX: originalX,
            currentY: originalY,
            // Independent translation timing
            translationRate: translation?.rate || 100, // Default 100ms
            lastTranslationTime: 0
        };


        // Set initial visibility based on autoStart
        if (autoStart === false) {
            sprite.setVisible(false);
        }

        // Only set up animation if it should be playing
        if (sprite.animationState.isPlaying) {
            // Set initial frame
            sprite.setTexture(frames[0]);
            sprite.animationState.frameStartTime = this.scene.time.now;
            sprite.animationState.lastTranslationTime = this.scene.time.now;

            // Apply initial frame positioning if available
            if (framePositions && framePositions[0]) {
                const framePos = framePositions[0];
                sprite.x = originalX + framePos.x;
                sprite.y = originalY + framePos.y;
            }
        } else {
            // Don't set texture or position if not playing
        }

        // Create update function that will be called each frame
        const updateAnimation = () => {
            if (!sprite.animationState || !sprite.animationState.isPlaying) {
                return;
            }

            const now = this.scene.time.now;
            const state = sprite.animationState;

            // Calculate current frame duration
            let frameDuration;
            if (state.frameDurations && state.frameDurations[state.currentFrame] !== undefined) {
                const duration = state.frameDurations[state.currentFrame];
                if (typeof duration === 'function') {
                    frameDuration = duration();
                } else {
                    frameDuration = duration;
                }
            } else {
                frameDuration = 1000 / state.frameRate; // Convert FPS to milliseconds
            }

            // Handle independent translation timing
            if (state.translation && now - state.lastTranslationTime >= state.translationRate) {
                state.currentX += state.translation.x;
                state.currentY += state.translation.y;
                state.lastTranslationTime = now;
            }

            // Check if it's time to advance to next frame
            if (now - state.frameStartTime >= frameDuration) {
                state.currentFrame++;

                // Check if we've reached the end of the animation
                if (state.currentFrame >= state.frames.length) {
                    state.loopCount++;

                    // Check if we should stop or loop
                    if (state.repeat !== -1 && state.loopCount >= state.repeat) {
                        state.isPlaying = false;
                        return;
                    }

                    // Loop back to start
                    state.currentFrame = 0;
                }

                // Update sprite texture
                sprite.setTexture(state.frames[state.currentFrame]);

                // Apply frame-specific positioning if available
                if (state.framePositions && state.framePositions[state.currentFrame]) {
                    const framePos = state.framePositions[state.currentFrame];
                    sprite.x = state.currentX + framePos.x;
                    sprite.y = state.currentY + framePos.y;
                } else {
                    // Use translated position if no frame position specified
                    sprite.x = state.currentX;
                    sprite.y = state.currentY;
                }

                state.frameStartTime = now;
            }
        };

        // Store update function reference for cleanup
        sprite.animationUpdate = updateAnimation;

        // Add to scene update loop
        this.scene.events.on('update', updateAnimation);

        // Store reference for cleanup
        if (!this.customAnimations) {
            this.customAnimations = new Map();
        }
        this.customAnimations.set(id, sprite);
    }

    getSprite(id) {
        return this.sprites.get(id);
    }

    // Animation control methods
    startAnimation(id) {
        const sprite = this.sprites.get(id);
        if (sprite && sprite.animationState) {
            sprite.animationState.isPlaying = true;
            sprite.setVisible(true);
            sprite.setAlpha(1); // Restore full opacity

            // Initialize the sprite if it wasn't set up initially
            if (!sprite.animationState.frameStartTime) {
                sprite.setTexture(sprite.animationState.frames[0]);
                sprite.animationState.frameStartTime = this.scene.time.now;
                sprite.animationState.lastTranslationTime = this.scene.time.now;

                // Apply initial frame positioning if available
                if (sprite.animationState.framePositions && sprite.animationState.framePositions[0]) {
                    const framePos = sprite.animationState.framePositions[0];
                    sprite.x = sprite.animationState.originalX + framePos.x;
                    sprite.y = sprite.animationState.originalY + framePos.y;
                }
            } else {
                // Just set the texture if it was already initialized but not playing
                sprite.setTexture(sprite.animationState.frames[0]);
            }
        } else if (sprite) {
            // For sprites without animationState (static sprites), just make them visible
            sprite.setVisible(true);
        }
    }

    stopAnimation(id) {
        const sprite = this.sprites.get(id);
        if (sprite && sprite.animationState) {
            sprite.animationState.isPlaying = false;
            sprite.setVisible(false); // Hide the sprite when stopping animation
            sprite.setAlpha(0); // Also set alpha to 0 for complete invisibility
        } else if (sprite) {
            // For sprites without animationState (static sprites), just hide them
            sprite.setVisible(false);
        }
    }

    hideSprite(id) {
        const sprite = this.sprites.get(id);
        if (sprite) {
            sprite.setVisible(false);
        }
    }

    hideMouseSprite() {
        const mouseSprite = this.sprites.get('mouse');
        if (mouseSprite) {
            mouseSprite.setVisible(false);
        }
    }

    hideBranchSprite() {
        const branchSprite = this.sprites.get('branch');
        const plant_wo_branch = this.sprites.get('plant_wo_branch');
        if (branchSprite) {
            branchSprite.setVisible(false);
        }
        if (plant_wo_branch) {
            plant_wo_branch.setVisible(true);
        }
    }

    showSprite(id) {
        const sprite = this.sprites.get(id);
        if (sprite) {
            sprite.setVisible(true);
        }
    }

    resetSpritePosition(id) {
        const sprite = this.sprites.get(id);
        if (sprite && sprite.animationState) {
            sprite.animationState.currentX = sprite.animationState.originalX;
            sprite.animationState.currentY = sprite.animationState.originalY;
            sprite.x = sprite.animationState.originalX;
            sprite.y = sprite.animationState.originalY;
        }
    }

    removeSprite(id) {
        const sprite = this.sprites.get(id);
        if (sprite) {
            // Clean up custom animation if it exists
            if (sprite.animationUpdate) {
                this.scene.events.off('update', sprite.animationUpdate);
                sprite.animationUpdate = null;
            }

            // Remove from custom animations map
            if (this.customAnimations) {
                this.customAnimations.delete(id);
            }

            sprite.destroy();
            this.sprites.delete(id);
        }
    }

    clearAllSprites() {
        // Destroy all sprites
        for (const sprite of this.sprites.values()) {
            // Clean up custom animation if it exists
            if (sprite.animationUpdate) {
                this.scene.events.off('update', sprite.animationUpdate);
                sprite.animationUpdate = null;
            }
            sprite.destroy();
        }
        this.sprites.clear();
        this.dynamicSprites.clear();

        // Clear custom animations map
        if (this.customAnimations) {
            this.customAnimations.clear();
        }
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
        for (const [id, sprite] of this.sprites.entries()) {
            // Special handling for mouse sprite - respect the taken state
            if (id === 'mouse' && gameState.progress._022_mouseTaken) {
                sprite.setVisible(false);
                sprite.setAlpha(0);
            } else {
                sprite.setVisible(CONFIG.DEBUG.SHOW_SPRITES);
            }

            if(id === 'branch' && gameState.progress._023_branchTaken) {
                sprite.setVisible(false);
                sprite.setAlpha(0);
            }
            else {
                sprite.setVisible(CONFIG.DEBUG.SHOW_SPRITES);
            }
        }
    }
}
