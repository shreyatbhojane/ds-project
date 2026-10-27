/**
 * Structura - Animated Circular Queue Visualizer
 * Supports dual views:
 *  1. Logical FIFO view (order of arrival)
 *  2. Physical Circular Buffer view (modulo wrapping in memory)
 */

export class QueueVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.viewMode = 'circular'; // 'circular' (physical array) | 'logical' (FIFO train)
    }

    setViewMode(mode) {
        this.viewMode = mode;
    }

    render(stepData, options = {}) {
        if (!this.container) return;

        const state = stepData.state || {
            size: 0,
            capacity: 5,
            frontIndex: -1,
            rearIndex: -1,
            logicalElements: [],
            physicalSlots: [],
            isEmpty: true,
            isFull: false
        };

        const capacity = state.capacity || 5;
        const size = state.size || 0;
        const frontIndex = state.frontIndex;
        const rearIndex = state.rearIndex;
        const percentFull = Math.round((size / capacity) * 100);

        this.container.innerHTML = `
            <div class="queue-visualizer-wrap">
                <!-- Queue Metric Header -->
                <div class="ds-meta-bar">
                    <div class="meta-item">
                        <span class="meta-label">FRONT Pointer</span>
                        <span class="meta-val meta-val-front">${frontIndex >= 0 ? `Slot [${frontIndex}]` : 'NULL (-1)'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">REAR Pointer</span>
                        <span class="meta-val meta-val-rear">${rearIndex >= 0 ? `Slot [${rearIndex}]` : 'NULL (-1)'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Active Size</span>
                        <span class="meta-val">${size} / ${capacity}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Buffer State</span>
                        <span class="meta-val ${state.isFull ? 'status-full' : (state.isEmpty ? 'status-empty' : 'status-active')}">
                            ${state.isFull ? 'FULL' : (state.isEmpty ? 'EMPTY' : 'READY')}
                        </span>
                    </div>
                    <div class="meta-meter-wrap" title="${percentFull}% utilized">
                        <div class="meta-meter-bar" style="width: ${percentFull}%"></div>
                    </div>
                </div>

                <!-- View Mode Toggle -->
                <div class="queue-view-toggle-bar">
                    <span class="view-toggle-label">Visualization Mode:</span>
                    <div class="view-toggle-buttons">
                        <button class="view-toggle-btn ${this.viewMode === 'circular' ? 'active' : ''}" data-mode="circular">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                            </svg>
                            Circular Memory Array
                        </button>
                        <button class="view-toggle-btn ${this.viewMode === 'logical' ? 'active' : ''}" data-mode="logical">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                            Logical FIFO Flow
                        </button>
                    </div>
                </div>

                <!-- Main Display Stage -->
                <div class="queue-display-stage">
                    ${state.isEmpty ? this.renderEmptyState() : (
                        this.viewMode === 'circular'
                            ? this.renderCircularPhysicalView(state.physicalSlots, options)
                            : this.renderLogicalFifoView(state.logicalElements, options)
                    )}
                </div>

                <!-- Circular Wrap Notice -->
                ${rearIndex >= 0 && frontIndex > rearIndex ? `
                    <div class="circular-wrap-alert">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" stroke-width="2">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                        </svg>
                        <span><strong>Circular Wrap Active:</strong> REAR (Slot ${rearIndex}) wrapped back to the start using <code>(rear + 1) % ${capacity}</code>!</span>
                    </div>
                ` : ''}

                <!-- Legend -->
                <div class="queue-legend">
                    <div class="legend-item"><span class="legend-dot dot-front"></span> FRONT Pointer (Dequeue Head)</div>
                    <div class="legend-item"><span class="legend-dot dot-rear"></span> REAR Pointer (Enqueue Tail)</div>
                    <div class="legend-item"><span class="legend-dot dot-occupied"></span> Occupied Slot</div>
                    <div class="legend-item"><span class="legend-dot dot-empty"></span> Free Array Slot</div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderEmptyState() {
        return `
            <div class="empty-state-card" aria-label="Queue is empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-dasharray="4 3">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="empty-title">Queue is Empty</span>
                <span class="empty-subtitle">FRONT is at 0, REAR is at -1. Enqueue an integer to begin.</span>
            </div>
        `;
    }

    renderCircularPhysicalView(slots, options) {
        return `
            <div class="queue-horizontal-track">
                ${slots.map((slot) => {
                    const isFront = slot.isFront;
                    const isRear = slot.isRear;
                    const isOccupied = slot.occupied;

                    let animClass = '';
                    if (options.highlightPhysical === slot.physicalIndex) {
                        if (options.actionType === 'enqueue') animClass = 'anim-block-push';
                        if (options.actionType === 'dequeue') animClass = 'anim-block-pop';
                        if (options.actionType === 'front' || options.actionType === 'rear') animClass = 'anim-block-peek';
                        if (options.actionType === 'update') animClass = 'anim-block-update';
                    }

                    return `
                        <div class="queue-slot-node ${isOccupied ? 'slot-occupied' : 'slot-unallocated'}" data-slot="${slot.physicalIndex}">
                            <!-- Pointers Above -->
                            <div class="slot-ptr-header">
                                ${isFront ? `
                                    <div class="pointer-badge pointer-front">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                        <span>FRONT</span>
                                    </div>
                                ` : ''}
                                ${isRear ? `
                                    <div class="pointer-badge pointer-rear">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                        <span>REAR</span>
                                    </div>
                                ` : ''}
                            </div>

                            <!-- The Data Box -->
                            <div class="queue-box ${isOccupied ? 'box-occupied' : ''} ${animClass}">
                                ${isOccupied ? `
                                    <span class="box-value">${slot.value}</span>
                                    <span class="box-order-tag">#${slot.logicalOffset + 1}</span>
                                ` : `
                                    <span class="box-empty-label">empty</span>
                                `}
                            </div>

                            <!-- Physical Index Label -->
                            <div class="slot-footer-label">
                                <span class="slot-idx-badge">Slot [${slot.physicalIndex}]</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderLogicalFifoView(logicalElements, options) {
        return `
            <div class="queue-logical-flow">
                <div class="flow-marker flow-entry">
                    <span>FRONT (Next Out)</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" stroke-width="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </div>

                <div class="flow-items-row">
                    ${logicalElements.map((item, idx) => {
                        return `
                            <div class="flow-item-card" data-idx="${item.logicalIndex}">
                                <div class="flow-pos-badge">Item #${idx + 1}</div>
                                <div class="flow-val-box">
                                    <span class="val-num">${item.value}</span>
                                </div>
                                <div class="flow-sub-label">Stored at Slot [${item.physicalIndex}]</div>
                            </div>
                            ${idx < logicalElements.length - 1 ? `
                                <div class="flow-connector-arrow">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </div>
                            ` : ''}
                        `;
                    }).join('')}
                </div>

                <div class="flow-marker flow-exit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                    <span>REAR (Last In)</span>
                </div>
            </div>
        `;
    }

    attachEvents() {
        const toggleButtons = this.container.querySelectorAll('.view-toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.setViewMode(mode);
                // Trigger re-render with current state
                bridge.notify({ keepOptions: true });
            });
        });
    }

    triggerErrorShake() {
        if (!this.container) return;
        const track = this.container.querySelector('.queue-display-stage');
        if (track) {
            track.classList.remove('shake-error');
            void track.offsetWidth;
            track.classList.add('shake-error');
        }
    }
}
