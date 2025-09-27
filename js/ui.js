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
    }

    setupUI() {
        // Create inventory background
        this.inventoryBg = this.scene.add.graphics();
        this.inventoryBg.fillStyle(0x2c3e50);
        this.inventoryBg.fillRect(0, CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT, CONFIG.VIRTUAL_WIDTH, CONFIG.INVENTORY_HEIGHT);
        this.inventoryBg.setDepth(100); // Above everything else

        // Create inventory slots
        this.inventorySlots = [];
        for (let i = 0; i < 8; i++) {
            const slotX = 10 + i * 35;
            const slotY = CONFIG.VIRTUAL_HEIGHT - CONFIG.INVENTORY_HEIGHT + 5;

            const slot = this.scene.add.graphics();
            slot.lineStyle(1, 0x34495e);
            slot.strokeRect(slotX, slotY, 30, 30);
            slot.setDepth(101);

            this.inventorySlots.push({
                x: slotX,
                y: slotY,
                width: 30,
                height: 30,
                item: null,
                sprite: null,
                highlight: null
            });
        }
    }

    handleInventoryClick(x, y) {
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
                slot.sprite = this.scene.add.sprite(slot.x + 15, slot.y + 15, item.sprite);
                slot.sprite.setDepth(103);
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

    showMessage(text) {
        // Remove existing message
        if (this.messageText) {
            this.messageText.destroy();
        }

        // Create bitmap text message - pixel perfect by default
        this.messageText = this.scene.add.bitmapText(CONFIG.VIRTUAL_WIDTH / 2, 20, 'arcade', text)
            .setOrigin(0.5)
            .setTint(0xffffff)
            .setDepth(200)
            .setFontSize(7)
            .setLineSpacing(10)
            .setMaxWidth(CONFIG.VIRTUAL_WIDTH - 40);

        // Add background using graphics
        const textBounds = this.messageText.getBounds();
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000);
        bg.fillRect(textBounds.x - 4, textBounds.y - 2, textBounds.width + 8, textBounds.height + 4);
        bg.setDepth(199);

        // Store background reference for cleanup
        this.messageText.background = bg;

        // Auto-hide after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            if (this.messageText) {
                if (this.messageText.background) {
                    this.messageText.background.destroy();
                }
                this.messageText.destroy();
                this.messageText = null;
            }
        });
    }
}
