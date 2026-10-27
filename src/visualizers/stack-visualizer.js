/**
 * Structura - Animated Stack Visualizer
 * Renders vertical LIFO elements, TOP pointer, memory indexes, and animated transitions.
 */

import { bridge } from '../bridge/ds-bridge.js';

export class StackVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.animatingIndex = -1;
        this.highlightType = null; // 'push' | 'pop' | 'peek' | 'update'
    }

    render(stepData, options = {}) {
        if (!this.container) return;

        const state = stepData.state || {
            size: 0,
            capacity: 5,
            topIndex: -1,
            elements: [],
            isEmpty: true,
            isFull: false
        };

        const capacity = state.capacity || 5;
        const size = state.size || 0;
        const topIndex = state.topIndex;
        const elements = state.elements || [];
        const percentFull = Math.round((size / capacity) * 100);

        this.container.innerHTML = `
            <div class="stack-visualizer-wrap">
                <!-- Stack Header Metric Bar -->
                <div class="ds-meta-bar">
                    <div class="meta-item">
                        <span class="meta-label">TOP Pointer</span>
                        <span class="meta-val meta-val-highlight">${topIndex >= 0 ? `Index [${topIndex}]` : 'NULL (-1)'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Active Size</span>
                        <span class="meta-val">${size} / ${capacity}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Status</span>
                        <span class="meta-val ${state.isFull ? 'status-full' : (state.isEmpty ? 'status-empty' : 'status-active')}">
                            ${state.isFull ? 'FULL' : (state.isEmpty ? 'EMPTY' : 'READY')}
                        </span>
                    </div>
                    <div class="meta-meter-wrap" title="${percentFull}% utilized">
                        <div class="meta-meter-bar" style="width: ${percentFull}%"></div>
                    </div>
                </div>

                <!-- Main Vertical Stack Container -->
                <div class="stack-display-stage">
                    <div class="stack-column-frame" style="min-height: ${Math.max(280, capacity * 54 + 40)}px">
                        ${state.isEmpty ? this.renderEmptyState() : this.renderSlots(elements, capacity, topIndex, options)}
                    </div>
                </div>

                <!-- Footer Summary of Structure -->
                <div class="stack-legend">
                    <div class="legend-item"><span class="legend-dot dot-top"></span> TOP Pointer (LIFO Head)</div>
                    <div class="legend-item"><span class="legend-dot dot-occupied"></span> Occupied Memory Slot</div>
                    <div class="legend-item"><span class="legend-dot dot-empty"></span> Free Capacity Slot</div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state-card" aria-label="Stack is empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-dasharray="4 3">
                    <path d="M4 19h16"></path>
                    <path d="M4 15h16"></path>
                    <path d="M4 11h16"></path>
                    <path d="M4 7h16"></path>
                </svg>
                <span class="empty-title">Stack is Empty</span>
                <span class="empty-subtitle">TOP pointer is at -1. Push an integer to begin.</span>
            </div>
        `;
    }

    renderSlots(elements, capacity, topIndex, options) {
        // Render from top of capacity down to 0
        const rows = [];
        for (let i = capacity - 1; i >= 0; i--) {
            const isOccupied = i < elements.length;
            const element = isOccupied ? elements[i] : null;
            const isTop = i === topIndex;

            let animClass = '';
            if (options.highlightIndex === i) {
                if (options.actionType === 'push') animClass = 'anim-block-push';
                if (options.actionType === 'pop') animClass = 'anim-block-pop';
                if (options.actionType === 'peek') animClass = 'anim-block-peek';
                if (options.actionType === 'update') animClass = 'anim-block-update';
            }

            rows.push(`
                <div class="stack-slot-row ${isOccupied ? 'slot-occupied' : 'slot-unallocated'}" data-index="${i}">
                    <!-- Memory Address / Index Label -->
                    <div class="slot-index-col">
                        <span class="slot-idx-badge">[${i}]</span>
                    </div>

                    <!-- Visual Block -->
                    <div class="stack-block ${isTop ? 'block-is-top' : ''} ${animClass}">
                        ${isOccupied ? `
                            <span class="block-value">${element.value}</span>
                            <span class="block-type-tag">i32</span>
                        ` : `
                            <span class="block-empty-placeholder">unallocated</span>
                        `}
                    </div>

                    <!-- Pointer Indicator -->
                    <div class="slot-pointer-col">
                        ${isTop ? `
                            <div class="pointer-badge pointer-top" aria-label="Top pointer">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                                <span>TOP</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `);
        }
        return rows.join('');
    }

    triggerErrorShake() {
        if (!this.container) return;
        const frame = this.container.querySelector('.stack-column-frame');
        if (frame) {
            frame.classList.remove('shake-error');
            void frame.offsetWidth;
            frame.classList.add('shake-error');
        }
    }
}
