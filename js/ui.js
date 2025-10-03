/*
 * User Interface Management
 * Handles inventory, messages, tooltips, and UI elements
 */

import { CONFIG } from './config.js';
import { gameState, addToInventory, removeFromInventory } from './gameState.js';

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.inventoryBg = null;
        this.inventorySlots = [];
        this.messageText = null;
        this.messageBackground = null;
        this.toggleButton = null;
        this.inventoryVisible = true;
        this.isModalOpen = false;
    }

    setupUI() {
        // Calculate inventory area dimensions
        const slotSize = 15;
        const slotSpacing = 20;
        const inventoryWidth = 7 * slotSpacing + 30; // Width for 7 slots + padding + space for button
        const inventoryHeight = slotSize + 4; // Just enough height for slots + small padding
        const inventoryX = CONFIG.VIRTUAL_WIDTH - inventoryWidth - 10; // Position from right edge
        const inventoryY = CONFIG.VIRTUAL_HEIGHT - inventoryHeight;

        // Create inventory background (only as wide as needed, positioned bottom-right)
        this.inventoryBg = this.scene.add.graphics();
        this.inventoryBg.fillStyle(0x2c3e50);
        this.inventoryBg.fillRect(inventoryX, inventoryY, inventoryWidth, inventoryHeight);
        this.inventoryBg.setDepth(100); // Above everything else

        // Create inventory slots (positioned bottom-right, moved down)
        this.inventorySlots = [];
        const slotY = inventoryY + 2; // Small padding from top of compact inventory area

        for (let i = 0; i < 7; i++) {
            const slotX = inventoryX + 5 + i * slotSpacing; // Start from inventory background + padding

            const slot = this.scene.add.graphics();
            slot.lineStyle(1, 0x34495e);
            slot.strokeRect(slotX, slotY, slotSize, slotSize);
            slot.setDepth(101);

            this.inventorySlots.push({
                x: slotX,
                y: slotY,
                width: slotSize,
                height: slotSize,
                item: null,
                sprite: null,
                highlight: null,
                graphics: slot // Store reference to slot graphics
            });
        }

        // Create toggle button (positioned relative to inventory)
        this.createToggleButton(inventoryX, inventoryY, inventoryWidth);
    }

    createToggleButton(inventoryX, inventoryY, inventoryWidth) {
        // Create toggle button graphics
        this.toggleButton = this.scene.add.graphics();
        this.toggleButton.setDepth(102); // Above inventory

        // Store inventory position and dimensions for button positioning
        this.inventoryX = inventoryX;
        this.inventoryY = inventoryY;
        this.inventoryWidth = inventoryWidth;

        // Make it clickable
        this.toggleButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, 16, 16), Phaser.Geom.Rectangle.Contains);
        this.toggleButton.on('pointerdown', () => this.toggleInventory());

        this.updateToggleButton();
    }

    updateToggleButton() {
        if (!this.toggleButton) return;

        this.toggleButton.clear();

        // Position button to the right of the slots, within the inventory background
        const buttonX = this.inventoryX + 7 * 20 + 5; // After 7 slots + small padding
        const buttonY = this.inventoryY + 2; // Align with top of compact inventory area

        // Button background
        this.toggleButton.fillStyle(0x34495e);
        this.toggleButton.fillRect(buttonX, buttonY, 16, 16);

        // Button border
        this.toggleButton.lineStyle(1, 0x2c3e50);
        this.toggleButton.strokeRect(buttonX, buttonY, 16, 16);

        // Chevron icon (up or down)
        this.toggleButton.lineStyle(1, 0xecf0f1);
        if (this.inventoryVisible) {
            // Down chevron (to hide)
            this.toggleButton.beginPath();
            this.toggleButton.moveTo(buttonX + 4, buttonY + 6);
            this.toggleButton.lineTo(buttonX + 8, buttonY + 10);
            this.toggleButton.lineTo(buttonX + 12, buttonY + 6);
            this.toggleButton.strokePath();
        } else {
            // Up chevron (to show)
            this.toggleButton.beginPath();
            this.toggleButton.moveTo(buttonX + 4, buttonY + 10);
            this.toggleButton.lineTo(buttonX + 8, buttonY + 6);
            this.toggleButton.lineTo(buttonX + 12, buttonY + 10);
            this.toggleButton.strokePath();
        }
    }

    toggleInventory() {
        this.inventoryVisible = !this.inventoryVisible;

        // Show/hide inventory background and slots
        this.inventoryBg.setVisible(this.inventoryVisible);
        this.inventorySlots.forEach(slot => {
            slot.graphics.setVisible(this.inventoryVisible); // Hide slot graphics too
            if (slot.sprite) slot.sprite.setVisible(this.inventoryVisible);
            if (slot.highlight) slot.highlight.setVisible(this.inventoryVisible);
        });

        // Toggle button should always be visible
        this.toggleButton.setVisible(true);

        // Update toggle button appearance
        this.updateToggleButton();
    }

    handleInventoryClick(x, y) {
        // Check if clicking on toggle button
        const buttonX = this.inventoryX + 7 * 20 + 5; // After 7 slots + small padding
        const buttonY = this.inventoryY + 2; // Align with top of compact inventory area
        if (x >= buttonX && x <= buttonX + 16 && y >= buttonY && y <= buttonY + 16) {
            this.toggleInventory();
            return;
        }

        // Only handle inventory slot clicks if inventory is visible
        if (!this.inventoryVisible) return;

        for (let i = 0; i < this.inventorySlots.length; i++) {
            const slot = this.inventorySlots[i];
            if (x >= slot.x && x <= slot.x + slot.width &&
                y >= slot.y && y <= slot.y + slot.height && slot.item) {

                // Deselect current item if any
                if (gameState.selectedItem) {
                    this.deselectItem();
                }

                // Select this item
                gameState.selectedItem = slot.item;
                this.highlightInventorySlot(i);
                break;
            }
        }
    }

    getInventoryTooltip(x, y) {
        // Only show tooltips if inventory is visible
        if (!this.inventoryVisible) return '';

        for (const slot of this.inventorySlots) {
            if (x >= slot.x && x <= slot.x + slot.width &&
                y >= slot.y && y <= slot.y + slot.height && slot.item) {
                return slot.item.name;
            }
        }
        return '';
    }

    highlightInventorySlot(index) {
        // Remove all existing highlights
        this.inventorySlots.forEach(slot => {
            if (slot.highlight) {
                slot.highlight.destroy();
                slot.highlight = null;
            }
        });

        // Highlight selected slot
        if (index >= 0 && index < this.inventorySlots.length) {
            const slot = this.inventorySlots[index];
            slot.highlight = this.scene.add.graphics();
            slot.highlight.lineStyle(2, 0xf1c40f);
            slot.highlight.strokeRect(slot.x, slot.y, slot.width, slot.height);
            slot.highlight.setDepth(102);
            slot.highlight.setVisible(this.inventoryVisible);
        }
    }

    deselectItem() {
        gameState.selectedItem = null;

        // Remove all highlights
        this.inventorySlots.forEach(slot => {
            if (slot.highlight) {
                slot.highlight.destroy();
                slot.highlight = null;
            }
        });
    }

    addToInventoryUI(item) {
        // Find first empty slot
        for (let i = 0; i < this.inventorySlots.length; i++) {
            const slot = this.inventorySlots[i];
            if (!slot.item) {
                slot.item = item;
                // Center the item sprite in the smaller slot
                slot.sprite = this.scene.add.sprite(slot.x + slot.width/2, slot.y + slot.height/2, item.sprite);
                slot.sprite.setDepth(100); // Below toggle button (depth 102)
                slot.sprite.setVisible(this.inventoryVisible);
                addToInventory(item);
                break;
            }
        }
    }

    removeFromInventoryUI(item) {
        // Find and remove item from slot
        for (let i = 0; i < this.inventorySlots.length; i++) {
            const slot = this.inventorySlots[i];
            if (slot.item === item) {
                slot.item = null;
                if (slot.sprite) {
                    slot.sprite.destroy();
                    slot.sprite = null;
                }
                if (slot.highlight) {
                    slot.highlight.destroy();
                    slot.highlight = null;
                }
                break;
            }
        }
        removeFromInventory(item);
    }

    showMessage(text, options = {}) {
        // Default options
        const defaults = {
            y: 20,                    // Default y position for temporary messages
            autoHide: true,          // Whether to auto-hide after 3 seconds
            modal: false,            // Whether this is a modal dialog
            buttonText: 'OK',        // Text for the modal button
            fontSize: 7,             // Font size
            lineSpacing: 10,         // Line spacing
            maxWidth: CONFIG.VIRTUAL_WIDTH - 40  // Max text width
        };
        options = { ...defaults, ...options };

        // Remove existing message and its background
        if (this.messageText) {
            if (this.messageBackground) {
                this.messageBackground.destroy();
                this.messageBackground = null;
            }
            this.messageText.destroy();
            this.messageText = null;
        }

        // Create bitmap text message - pixel perfect by default
        this.messageText = this.scene.add.bitmapText(CONFIG.VIRTUAL_WIDTH / 2, options.y, 'arcade', text)
            .setOrigin(0.5)
            .setTint(0xffffff)
            .setDepth(1000)
            .setFontSize(options.fontSize)
            .setLineSpacing(options.lineSpacing)
            .setMaxWidth(options.maxWidth);

        // Add background using graphics
        const textBounds = this.messageText.getBounds();
        this.messageBackground = this.scene.add.graphics();
        this.messageBackground.fillStyle(0x000000);

        // For modal dialogs, center vertically and add space for button
        if (options.modal) {
            this.isModalOpen = true;
            // Center text vertically
            this.messageText.y = CONFIG.VIRTUAL_HEIGHT / 2 - 20;

            // Create OK button
            const buttonText = this.scene.add.bitmapText(
                CONFIG.VIRTUAL_WIDTH / 2,
                this.messageText.y + textBounds.height + 15,
                'arcade',
                options.buttonText
            )
                .setOrigin(0.5)
                .setTint(0xffffff)
                .setDepth(1001)
                .setFontSize(options.fontSize)
                .setInteractive();

            // Add button background
            const buttonBounds = buttonText.getBounds();
            const buttonBackground = this.scene.add.graphics();
            buttonBackground.fillStyle(0x444444);
            buttonBackground.fillRect(
                buttonBounds.x - 10,
                buttonBounds.y - 4,
                buttonBounds.width + 20,
                buttonBounds.height + 8
            );
            buttonBackground.setDepth(999);

            // Update message background to include button
            const totalHeight = (buttonBounds.y + buttonBounds.height + 4) - (textBounds.y - 2);
            this.messageBackground.fillRect(
                textBounds.x - 10,
                textBounds.y - 10,
                textBounds.width + 20,
                totalHeight + 20
            );
            this.messageBackground.setDepth(998);

            // Handle button click
            buttonText.on('pointerdown', () => {
                // Clean up all elements
                this.messageText.destroy();
                this.messageText = null;
                this.messageBackground.destroy();
                this.messageBackground = null;
                buttonText.destroy();
                buttonBackground.destroy();
                this.isModalOpen = false;
            });

            // Highlight button on hover
            buttonText.on('pointerover', () => {
                buttonBackground.clear();
                buttonBackground.fillStyle(0x666666);
                buttonBackground.fillRect(
                    buttonBounds.x - 10,
                    buttonBounds.y - 4,
                    buttonBounds.width + 20,
                    buttonBounds.height + 8
                );
            });

            buttonText.on('pointerout', () => {
                buttonBackground.clear();
                buttonBackground.fillStyle(0x444444);
                buttonBackground.fillRect(
                    buttonBounds.x - 10,
                    buttonBounds.y - 4,
                    buttonBounds.width + 20,
                    buttonBounds.height + 8
                );
            });
        } else {
            // Regular message background
            this.messageBackground.fillRect(textBounds.x - 4, textBounds.y - 2, textBounds.width + 8, textBounds.height + 4);
            this.messageBackground.setDepth(999);

            // Auto-hide after 3 seconds for non-modal messages
            if (options.autoHide) {
                this.scene.time.delayedCall(3000, () => {
                    if (this.messageText) {
                        this.messageText.destroy();
                        this.messageText = null;
                    }
                    if (this.messageBackground) {
                        this.messageBackground.destroy();
                        this.messageBackground = null;
                    }
                });
            }
        }
    }

    isModalDialogOpen() {
        return this.isModalOpen;
    }
}
