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

        // Create new message with pixel-perfect settings
        this.messageText = this.scene.add.text(CONFIG.VIRTUAL_WIDTH / 2, 20, text, {
            fontSize: '8px',
            fill: '#ffffff',
            fontFamily: 'Courier New, monospace',
            backgroundColor: '#000000',
            padding: { x: 3, y: 1 }
        }).setOrigin(0.5).setDepth(200);

        // Apply essential pixel-perfect settings
        this.messageText.setResolution(1);
        this.messageText.setRoundPixels(true);

        // Force disable smoothing
        if (this.messageText.style) {
            this.messageText.style.smoothed = false;
        }

        // Auto-hide after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            if (this.messageText) {
                this.messageText.destroy();
                this.messageText = null;
            }
        });
    }
}
