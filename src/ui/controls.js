/**
 * Structura - Interactive Controls & Timeline Player
 * Connects user input to data structure operations and playback timeline.
 */

import { bridge } from '../bridge/ds-bridge.js';

export class ControlsManager {
    constructor(stackPanelId, queuePanelId, timelinePanelId) {
        this.stackPanel = document.getElementById(stackPanelId);
        this.queuePanel = document.getElementById(queuePanelId);
        this.timelinePanel = document.getElementById(timelinePanelId);

        this.initStackControls();
        this.initQueueControls();
        this.initTimelineControls();
    }

    initStackControls() {
        if (!this.stackPanel) return;

        this.stackPanel.innerHTML = `
            <div class="control-box-group">
                <h4 class="ctrl-group-title">Primary Operations (LIFO)</h4>
                
                <!-- Push -->
                <div class="ctrl-row">
                    <div class="input-with-btn">
                        <label for="stack-push-val" class="sr-only">Value to push</label>
                        <input type="number" id="stack-push-val" class="ctrl-input" placeholder="e.g. 42" value="42" min="-9999" max="9999" />
                        <button id="btn-stack-push" class="ctrl-btn btn-primary" title="Push value onto stack">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="12" y1="19" x2="12" y2="5"></line>
                                <polyline points="5 12 12 5 19 12"></polyline>
                            </svg>
                            Push
                        </button>
                    </div>
                </div>

                <!-- Pop & Peek -->
                <div class="ctrl-row ctrl-row-dual">
                    <button id="btn-stack-pop" class="ctrl-btn btn-danger" title="Pop top element">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                        Pop
                    </button>
                    <button id="btn-stack-peek" class="ctrl-btn btn-secondary" title="Peek top element">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Peek
                    </button>
                </div>

                <!-- Update & Read -->
                <h4 class="ctrl-group-title mt-4">Inspection & Update (Random Access)</h4>
                <div class="ctrl-row ctrl-row-update">
                    <div class="input-field-compact">
                        <label class="ctrl-sublabel">Index</label>
                        <input type="number" id="stack-update-idx" class="ctrl-input-sm" value="0" min="0" max="10" />
                    </div>
                    <div class="input-field-compact">
                        <label class="ctrl-sublabel">New Val</label>
                        <input type="number" id="stack-update-val" class="ctrl-input-sm" value="99" min="-9999" max="9999" />
                    </div>
                    <button id="btn-stack-update" class="ctrl-btn btn-secondary" title="Update element at index">Update</button>
                </div>

                <div class="ctrl-row mt-2">
                    <div class="input-with-btn">
                        <label for="stack-read-idx" class="sr-only">Read index</label>
                        <input type="number" id="stack-read-idx" class="ctrl-input" placeholder="Index (0..N-1)" value="0" min="0" max="10" />
                        <button id="btn-stack-read" class="ctrl-btn btn-secondary">Read [i]</button>
                    </div>
                </div>

                <!-- Structure Configuration -->
                <h4 class="ctrl-group-title mt-4">Capacity & Presets</h4>
                <div class="ctrl-row ctrl-row-config">
                    <label for="stack-cap-select" class="ctrl-sublabel">Capacity:</label>
                    <select id="stack-cap-select" class="ctrl-select">
                        <option value="3">3 Slots</option>
                        <option value="4">4 Slots</option>
                        <option value="5" selected>5 Slots (Default)</option>
                        <option value="6">6 Slots</option>
                        <option value="8">8 Slots</option>
                    </select>
                    <button id="btn-stack-recreate" class="ctrl-btn btn-outline" title="Reallocate stack memory">Apply</button>
                </div>

                <!-- Clear & Reset Presets -->
                <div class="ctrl-row ctrl-row-dual mt-3">
                    <button id="btn-stack-preset" class="ctrl-btn btn-outline">Load Preset</button>
                    <button id="btn-stack-clear" class="ctrl-btn btn-outline-danger">Clear</button>
                </div>
            </div>
        `;

        this.bindStackEvents();
    }

    bindStackEvents() {
        const pushBtn = document.getElementById('btn-stack-push');
        const pushInput = document.getElementById('stack-push-val');
        const popBtn = document.getElementById('btn-stack-pop');
        const peekBtn = document.getElementById('btn-stack-peek');
        const updateBtn = document.getElementById('btn-stack-update');
        const updateIdx = document.getElementById('stack-update-idx');
        const updateVal = document.getElementById('stack-update-val');
        const readBtn = document.getElementById('btn-stack-read');
        const readIdx = document.getElementById('stack-read-idx');
        const recreateBtn = document.getElementById('btn-stack-recreate');
        const capSelect = document.getElementById('stack-cap-select');
        const clearBtn = document.getElementById('btn-stack-clear');
        const presetBtn = document.getElementById('btn-stack-preset');

        pushBtn?.addEventListener('click', () => {
            const val = parseInt(pushInput.value, 10);
            if (isNaN(val)) return;
            bridge.executeStackPush(val);
            pushInput.value = Math.floor(Math.random() * 90 + 10);
        });

        pushInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') pushBtn.click();
        });

        popBtn?.addEventListener('click', () => bridge.executeStackPop());
        peekBtn?.addEventListener('click', () => bridge.executeStackPeek());

        updateBtn?.addEventListener('click', () => {
            const idx = parseInt(updateIdx.value, 10);
            const val = parseInt(updateVal.value, 10);
            if (isNaN(idx) || isNaN(val)) return;
            bridge.executeStackUpdate(idx, val);
        });

        readBtn?.addEventListener('click', () => {
            const idx = parseInt(readIdx.value, 10);
            if (isNaN(idx)) return;
            bridge.executeStackGetAt(idx);
        });

        recreateBtn?.addEventListener('click', () => {
            const cap = parseInt(capSelect.value, 10);
            bridge.executeStackRecreate(cap);
        });

        clearBtn?.addEventListener('click', () => bridge.executeStackClear());

        presetBtn?.addEventListener('click', () => {
            bridge.executeStackClear();
            bridge.executeStackPush(15);
            bridge.executeStackPush(28);
            bridge.executeStackPush(45);
        });
    }

    initQueueControls() {
        if (!this.queuePanel) return;

        this.queuePanel.innerHTML = `
            <div class="control-box-group">
                <h4 class="ctrl-group-title">Primary Operations (FIFO)</h4>
                
                <!-- Enqueue -->
                <div class="ctrl-row">
                    <div class="input-with-btn">
                        <label for="queue-enq-val" class="sr-only">Value to enqueue</label>
                        <input type="number" id="queue-enq-val" class="ctrl-input" placeholder="e.g. 100" value="100" min="-9999" max="9999" />
                        <button id="btn-queue-enq" class="ctrl-btn btn-primary" title="Enqueue element at rear">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                            Enqueue
                        </button>
                    </div>
                </div>

                <!-- Dequeue, Front & Rear -->
                <div class="ctrl-row ctrl-row-tri">
                    <button id="btn-queue-deq" class="ctrl-btn btn-danger" title="Dequeue front element">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Dequeue
                    </button>
                    <button id="btn-queue-front" class="ctrl-btn btn-secondary" title="Inspect FRONT pointer">Front</button>
                    <button id="btn-queue-rear" class="ctrl-btn btn-secondary" title="Inspect REAR pointer">Rear</button>
                </div>

                <!-- Update & Read -->
                <h4 class="ctrl-group-title mt-4">Inspection & Update</h4>
                <div class="ctrl-row ctrl-row-update">
                    <div class="input-field-compact">
                        <label class="ctrl-sublabel">Logical Idx</label>
                        <input type="number" id="queue-update-idx" class="ctrl-input-sm" value="0" min="0" max="10" />
                    </div>
                    <div class="input-field-compact">
                        <label class="ctrl-sublabel">New Val</label>
                        <input type="number" id="queue-update-val" class="ctrl-input-sm" value="777" min="-9999" max="9999" />
                    </div>
                    <button id="btn-queue-update" class="ctrl-btn btn-secondary">Update</button>
                </div>

                <div class="ctrl-row mt-2">
                    <div class="input-with-btn">
                        <label for="queue-read-idx" class="sr-only">Read logical index</label>
                        <input type="number" id="queue-read-idx" class="ctrl-input" placeholder="Logical (0..N-1)" value="0" min="0" max="10" />
                        <button id="btn-queue-read" class="ctrl-btn btn-secondary">Read [i]</button>
                    </div>
                </div>

                <!-- Capacity Configuration -->
                <h4 class="ctrl-group-title mt-4">Circular Capacity & Presets</h4>
                <div class="ctrl-row ctrl-row-config">
                    <label for="queue-cap-select" class="ctrl-sublabel">Slots:</label>
                    <select id="queue-cap-select" class="ctrl-select">
                        <option value="3">3 Slots</option>
                        <option value="4">4 Slots</option>
                        <option value="5" selected>5 Slots (Default)</option>
                        <option value="6">6 Slots</option>
                        <option value="8">8 Slots</option>
                    </select>
                    <button id="btn-queue-recreate" class="ctrl-btn btn-outline">Apply</button>
                </div>

                <!-- Clear & Reset Presets -->
                <div class="ctrl-row ctrl-row-dual mt-3">
                    <button id="btn-queue-preset" class="ctrl-btn btn-outline">Load Preset</button>
                    <button id="btn-queue-clear" class="ctrl-btn btn-outline-danger">Clear</button>
                </div>
            </div>
        `;

        this.bindQueueEvents();
    }

    bindQueueEvents() {
        const enqBtn = document.getElementById('btn-queue-enq');
        const enqInput = document.getElementById('queue-enq-val');
        const deqBtn = document.getElementById('btn-queue-deq');
        const frontBtn = document.getElementById('btn-queue-front');
        const rearBtn = document.getElementById('btn-queue-rear');
        const updateBtn = document.getElementById('btn-queue-update');
        const updateIdx = document.getElementById('queue-update-idx');
        const updateVal = document.getElementById('queue-update-val');
        const readBtn = document.getElementById('btn-queue-read');
        const readIdx = document.getElementById('queue-read-idx');
        const recreateBtn = document.getElementById('btn-queue-recreate');
        const capSelect = document.getElementById('queue-cap-select');
        const clearBtn = document.getElementById('btn-queue-clear');
        const presetBtn = document.getElementById('btn-queue-preset');

        enqBtn?.addEventListener('click', () => {
            const val = parseInt(enqInput.value, 10);
            if (isNaN(val)) return;
            bridge.executeQueueEnqueue(val);
            enqInput.value = (val + 10) % 1000;
        });

        enqInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') enqBtn.click();
        });

        deqBtn?.addEventListener('click', () => bridge.executeQueueDequeue());
        frontBtn?.addEventListener('click', () => bridge.executeQueueFront());
        rearBtn?.addEventListener('click', () => bridge.executeQueueRear());

        updateBtn?.addEventListener('click', () => {
            const idx = parseInt(updateIdx.value, 10);
            const val = parseInt(updateVal.value, 10);
            if (isNaN(idx) || isNaN(val)) return;
            bridge.executeQueueUpdate(idx, val);
        });

        readBtn?.addEventListener('click', () => {
            const idx = parseInt(readIdx.value, 10);
            if (isNaN(idx)) return;
            bridge.executeQueueGetAt(idx);
        });

        recreateBtn?.addEventListener('click', () => {
            const cap = parseInt(capSelect.value, 10);
            bridge.executeQueueRecreate(cap);
        });

        clearBtn?.addEventListener('click', () => bridge.executeQueueClear());

        presetBtn?.addEventListener('click', () => {
            bridge.executeQueueClear();
            bridge.executeQueueEnqueue(110);
            bridge.executeQueueEnqueue(220);
            bridge.executeQueueEnqueue(330);
        });
    }

    initTimelineControls() {
        if (!this.timelinePanel) return;

        this.timelinePanel.innerHTML = `
            <div class="timeline-bar-wrap">
                <!-- Status & Step Explanation -->
                <div class="timeline-status-info">
                    <div class="status-badge-row">
                        <span class="step-op-pill" id="tl-op-pill">READY</span>
                        <span class="complexity-pill" id="tl-complexity-pill">O(1) Time</span>
                    </div>
                    <p class="step-desc-text" id="tl-step-desc">Awaiting your data structure operation.</p>
                </div>

                <!-- Playback Buttons -->
                <div class="timeline-controls-cluster">
                    <button id="tl-btn-restart" class="tl-btn" title="Restart timeline from initial state" aria-label="Restart">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                    </button>
                    <button id="tl-btn-prev" class="tl-btn" title="Step Back (Undo)" aria-label="Step Back">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polygon points="19 20 9 12 19 4 19 20"></polygon>
                            <line x1="5" y1="19" x2="5" y2="5"></line>
                        </svg>
                    </button>
                    <button id="tl-btn-play" class="tl-btn tl-btn-play" title="Play / Pause step replay" aria-label="Play">
                        <svg class="icon-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <svg class="icon-pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:none">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                    </button>
                    <button id="tl-btn-next" class="tl-btn" title="Step Forward (Redo)" aria-label="Step Forward">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polygon points="5 4 15 12 5 20 5 4"></polygon>
                            <line x1="19" y1="5" x2="19" y2="19"></line>
                        </svg>
                    </button>

                    <!-- Speed Toggle -->
                    <div class="speed-toggle-wrap">
                        <button class="speed-btn active" data-speed="1000">1x</button>
                        <button class="speed-btn" data-speed="500">2x</button>
                    </div>
                </div>
            </div>
        `;

        this.bindTimelineEvents();
    }

    bindTimelineEvents() {
        const prevBtn = document.getElementById('tl-btn-prev');
        const nextBtn = document.getElementById('tl-btn-next');
        const playBtn = document.getElementById('tl-btn-play');
        const restartBtn = document.getElementById('tl-btn-restart');
        const speedBtns = this.timelinePanel.querySelectorAll('.speed-btn');

        prevBtn?.addEventListener('click', () => bridge.stepBack());
        nextBtn?.addEventListener('click', () => bridge.stepForward());

        playBtn?.addEventListener('click', () => {
            if (bridge.isPlaying) {
                bridge.pause();
            } else {
                bridge.play();
            }
        });

        restartBtn?.addEventListener('click', () => bridge.restart());

        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const spd = parseInt(btn.getAttribute('data-speed'), 10);
                bridge.setSpeed(spd);
            });
        });
    }

    updateTimelineDisplay(step, playback) {
        if (!this.timelinePanel) return;

        const opPill = document.getElementById('tl-op-pill');
        const compPill = document.getElementById('tl-complexity-pill');
        const descText = document.getElementById('tl-step-desc');
        const playBtn = document.getElementById('tl-btn-play');
        const prevBtn = document.getElementById('tl-btn-prev');
        const nextBtn = document.getElementById('tl-btn-next');

        if (opPill && step) {
            opPill.textContent = step.opName || 'OPERATION';
            opPill.className = `step-op-pill op-${(step.opName || '').toLowerCase()}`;
        }

        if (compPill && step && step.complexity) {
            compPill.textContent = `${step.complexity.time} Time | ${step.complexity.space} Space`;
        }

        if (descText && step) {
            descText.textContent = step.description || '';
        }

        if (playBtn) {
            const playIcon = playBtn.querySelector('.icon-play');
            const pauseIcon = playBtn.querySelector('.icon-pause');
            if (playIcon && pauseIcon) {
                if (playback.isPlaying) {
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'block';
                } else {
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                }
            }
        }

        if (prevBtn) {
            prevBtn.disabled = !playback.canStepBack;
        }
        if (nextBtn) {
            nextBtn.disabled = !playback.canStepForward;
        }
    }
}
