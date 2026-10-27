/**
 * Structura - Data Structure Bridge & Execution Controller
 * Bridges UI visualizers with the underlying C WebAssembly runtime.
 * Manages operation snapshots for step-by-step replay and inspection.
 */

import { structura, DS_STATUS } from '../../wasm/structura.js';
import { toast } from '../ui/toast.js';

export class DataStructureBridge {
    constructor() {
        this.engine = structura;
        this.listeners = new Set();

        // Active context: 'stack' or 'queue'
        this.activeDS = 'stack';

        // Snapshots history for step-by-step debugging
        this.stackHistory = [];
        this.stackHistoryIndex = -1;

        this.queueHistory = [];
        this.queueHistoryIndex = -1;

        // Playback state
        this.isPlaying = false;
        this.playbackTimer = null;
        this.playbackSpeed = 1000; // ms per step

        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        await this.engine.init();
        this.isInitialized = true;

        // Record initial states
        this.recordStackStep({
            opName: 'INIT',
            description: 'Stack initialized with capacity 5.',
            cFunction: 'stack_create',
            cLine: 1,
            cCodeSnippet: `DS_Status stack_create(int capacity, Stack** out_stack);`,
            complexity: { time: 'O(1)', space: 'O(N)' },
            status: DS_STATUS.SUCCESS,
            state: this.engine.getStackState()
        });

        this.recordQueueStep({
            opName: 'INIT',
            description: 'Circular Queue initialized with capacity 5.',
            cFunction: 'queue_create',
            cLine: 1,
            cCodeSnippet: `DS_Status queue_create(int capacity, Queue** out_queue);`,
            complexity: { time: 'O(1)', space: 'O(N)' },
            status: DS_STATUS.SUCCESS,
            state: this.engine.getQueueState()
        });

        this.notify();
    }

    subscribe(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    notify(payload = {}) {
        this.listeners.forEach(fn => fn({
            activeDS: this.activeDS,
            stackState: this.getStackCurrent(),
            queueState: this.getQueueCurrent(),
            playback: {
                isPlaying: this.isPlaying,
                canStepBack: this.canStepBack(),
                canStepForward: this.canStepForward(),
                speed: this.playbackSpeed
            },
            ...payload
        }));
    }

    // ---------------- STACK OPERATIONS ----------------

    executeStackPush(value) {
        this.stopPlayback();
        const res = this.engine.stackPush(value);
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'PUSH',
            value,
            description: isSuccess
                ? `Pushed integer value ${value} onto top of the stack (Index ${res.state.topIndex}).`
                : `Overflow Error: Capacity ${res.state.capacity} reached. Push failed.`,
            cFunction: 'stack_push',
            cLine: isSuccess ? 10 : 6,
            cCodeSnippet: isSuccess
                ? `stack->top++;\nstack->data[stack->top] = value;\nreturn DS_SUCCESS;`
                : `if (stack_is_full(stack)) {\n    return DS_ERR_OVERFLOW;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state,
            affectedIndex: res.state.topIndex
        };

        this.recordStackStep(step);
        if (isSuccess) {
            toast.show(`Pushed ${value} onto stack (TOP index: ${res.state.topIndex})`, 'success');
        } else {
            toast.show(res.message, 'error');
        }
        this.notify({ lastAction: 'stack_push', step });
        return res;
    }

    executeStackPop() {
        this.stopPlayback();
        const prevTop = this.getStackCurrent().state.topIndex;
        const res = this.engine.stackPop();
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'POP',
            value: res.value,
            description: isSuccess
                ? `Popped top element ${res.value} from stack (TOP moved to index ${res.state.topIndex}).`
                : `Underflow Error: Stack is empty. No elements to pop.`,
            cFunction: 'stack_pop',
            cLine: isSuccess ? 11 : 6,
            cCodeSnippet: isSuccess
                ? `*out_value = stack->data[stack->top];\nstack->top--;\nreturn DS_SUCCESS;`
                : `if (stack_is_empty(stack)) {\n    return DS_ERR_UNDERFLOW;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state,
            affectedIndex: prevTop
        };

        this.recordStackStep(step);
        if (isSuccess) {
            toast.show(`Popped element ${res.value} from stack`, 'info');
        } else {
            toast.show(res.message, 'error');
        }
        this.notify({ lastAction: 'stack_pop', step });
        return res;
    }

    executeStackPeek() {
        this.stopPlayback();
        const res = this.engine.stackPeek();
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'PEEK',
            value: res.value,
            description: isSuccess
                ? `Inspected top element: ${res.value} at index ${res.state.topIndex}. Size remains ${res.state.size}.`
                : `Underflow Error: Cannot peek into an empty stack.`,
            cFunction: 'stack_peek',
            cLine: isSuccess ? 9 : 6,
            cCodeSnippet: isSuccess
                ? `*out_value = stack->data[stack->top];\nreturn DS_SUCCESS;`
                : `if (stack_is_empty(stack)) {\n    return DS_ERR_UNDERFLOW;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state,
            affectedIndex: res.state.topIndex
        };

        this.recordStackStep(step);
        if (isSuccess) {
            toast.show(`TOP element is ${res.value}`, 'info');
        } else {
            toast.show(res.message, 'warning');
        }
        this.notify({ lastAction: 'stack_peek', step });
        return res;
    }

    executeStackUpdate(index, newValue) {
        this.stopPlayback();
        const res = this.engine.stackUpdate(index, newValue);
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'UPDATE',
            index,
            value: newValue,
            description: isSuccess
                ? `Updated element at index [${index}] to new value ${newValue}.`
                : `Invalid Index Error: Index [${index}] is outside valid range [0 .. ${res.state.topIndex}].`,
            cFunction: 'stack_update',
            cLine: isSuccess ? 8 : 5,
            cCodeSnippet: isSuccess
                ? `stack->data[index] = new_value;\nreturn DS_SUCCESS;`
                : `if (index < 0 || index > stack->top) {\n    return DS_ERR_INVALID_INDEX;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state,
            affectedIndex: index
        };

        this.recordStackStep(step);
        if (isSuccess) {
            toast.show(`Updated stack index [${index}] to ${newValue}`, 'success');
        } else {
            toast.show(res.message, 'error');
        }
        this.notify({ lastAction: 'stack_update', step });
        return res;
    }

    executeStackGetAt(index) {
        this.stopPlayback();
        const res = this.engine.stackGetAt(index);
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'READ',
            index,
            value: res.value,
            description: isSuccess
                ? `Inspected value at index [${index}]: ${res.value}. (Direct array offset indexing O(1)).`
                : `Invalid Index Error: Index [${index}] is outside valid range.`,
            cFunction: 'stack_get_at',
            cLine: isSuccess ? 8 : 5,
            cCodeSnippet: isSuccess
                ? `*out_value = stack->data[index];\nreturn DS_SUCCESS;`
                : `if (index < 0 || index > stack->top) {\n    return DS_ERR_INVALID_INDEX;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state,
            affectedIndex: index
        };

        this.recordStackStep(step);
        if (isSuccess) {
            toast.show(`Stack[${index}] = ${res.value}`, 'info');
        } else {
            toast.show(res.message, 'warning');
        }
        this.notify({ lastAction: 'stack_get_at', step });
        return res;
    }

    executeStackClear() {
        this.stopPlayback();
        const res = this.engine.stackClear();
        const step = {
            opName: 'CLEAR',
            description: 'Stack cleared (all active elements invalidated, TOP reset to -1).',
            cFunction: 'stack_clear',
            cLine: 4,
            cCodeSnippet: `stack->top = -1;\nreturn DS_SUCCESS;`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state
        };

        this.recordStackStep(step);
        toast.show('Stack cleared', 'info');
        this.notify({ lastAction: 'stack_clear', step });
        return res;
    }

    executeStackRecreate(capacity) {
        this.stopPlayback();
        const res = this.engine.stackInit(capacity);
        const step = {
            opName: 'CREATE',
            capacity,
            description: `Recreated stack with custom capacity ${capacity}.`,
            cFunction: 'stack_create',
            cLine: 8,
            cCodeSnippet: `Stack* s = (Stack*)malloc(sizeof(Stack));\ns->data = (int*)calloc(capacity, sizeof(int));\ns->top = -1;\ns->capacity = capacity;`,
            complexity: { time: 'O(1)', space: 'O(N)' },
            status: res.status,
            state: res.state
        };

        this.stackHistory = [];
        this.stackHistoryIndex = -1;
        this.recordStackStep(step);
        toast.show(`Stack reinitialized with capacity ${capacity}`, 'success');
        this.notify({ lastAction: 'stack_create', step });
        return res;
    }

    // ---------------- QUEUE OPERATIONS ----------------

    executeQueueEnqueue(value) {
        this.stopPlayback();
        const res = this.engine.queueEnqueue(value);
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'ENQUEUE',
            value,
            description: isSuccess
                ? `Enqueued ${value} at circular REAR position (Index ${res.state.rearIndex}).`
                : `Overflow Error: Circular queue capacity ${res.state.capacity} reached. Enqueue rejected.`,
            cFunction: 'queue_enqueue',
            cLine: isSuccess ? 8 : 5,
            cCodeSnippet: isSuccess
                ? `queue->rear = (queue->rear + 1) % queue->capacity;\nqueue->data[queue->rear] = value;\nqueue->size++;\nreturn DS_SUCCESS;`
                : `if (queue_is_full(queue)) {\n    return DS_ERR_OVERFLOW;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state,
            affectedPhysical: res.state.rearIndex
        };

        this.recordQueueStep(step);
        if (isSuccess) {
            toast.show(`Enqueued ${value} (REAR index: ${res.state.rearIndex})`, 'success');
        } else {
            toast.show(res.message, 'error');
        }
        this.notify({ lastAction: 'queue_enqueue', step });
        return res;
    }

    executeQueueDequeue() {
        this.stopPlayback();
        const prevFront = this.getQueueCurrent().state.frontIndex;
        const res = this.engine.queueDequeue();
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'DEQUEUE',
            value: res.value,
            description: isSuccess
                ? `Dequeued earliest element ${res.value} from FRONT (Index ${prevFront}). FRONT now advances circularly.`
                : `Underflow Error: Queue is empty. No elements to dequeue.`,
            cFunction: 'queue_dequeue',
            cLine: isSuccess ? 10 : 5,
            cCodeSnippet: isSuccess
                ? `*out_value = queue->data[queue->front];\nqueue->front = (queue->front + 1) % queue->capacity;\nqueue->size--;\nreturn DS_SUCCESS;`
                : `if (queue_is_empty(queue)) {\n    return DS_ERR_UNDERFLOW;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state,
            affectedPhysical: prevFront
        };

        this.recordQueueStep(step);
        if (isSuccess) {
            toast.show(`Dequeued ${res.value} from queue front`, 'info');
        } else {
            toast.show(res.message, 'error');
        }
        this.notify({ lastAction: 'queue_dequeue', step });
        return res;
    }

    executeQueueFront() {
        this.stopPlayback();
        const res = this.engine.queueFront();
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'FRONT',
            value: res.value,
            description: isSuccess
                ? `Inspected FRONT element: ${res.value} at physical slot ${res.state.frontIndex}. (FIFO head).`
                : `Underflow Error: Queue is empty. No FRONT element available.`,
            cFunction: 'queue_front',
            cLine: isSuccess ? 8 : 5,
            cCodeSnippet: isSuccess
                ? `*out_value = queue->data[queue->front];\nreturn DS_SUCCESS;`
                : `if (queue_is_empty(queue)) {\n    return DS_ERR_UNDERFLOW;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state,
            affectedPhysical: res.state.frontIndex
        };

        this.recordQueueStep(step);
        if (isSuccess) {
            toast.show(`FRONT element is ${res.value}`, 'info');
        } else {
            toast.show(res.message, 'warning');
        }
        this.notify({ lastAction: 'queue_front', step });
        return res;
    }

    executeQueueRear() {
        this.stopPlayback();
        const res = this.engine.queueRear();
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'REAR',
            value: res.value,
            description: isSuccess
                ? `Inspected REAR element: ${res.value} at physical slot ${res.state.rearIndex}. (FIFO tail).`
                : `Underflow Error: Queue is empty. No REAR element available.`,
            cFunction: 'queue_rear',
            cLine: isSuccess ? 8 : 5,
            cCodeSnippet: isSuccess
                ? `*out_value = queue->data[queue->rear];\nreturn DS_SUCCESS;`
                : `if (queue_is_empty(queue)) {\n    return DS_ERR_UNDERFLOW;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state,
            affectedPhysical: res.state.rearIndex
        };

        this.recordQueueStep(step);
        if (isSuccess) {
            toast.show(`REAR element is ${res.value}`, 'info');
        } else {
            toast.show(res.message, 'warning');
        }
        this.notify({ lastAction: 'queue_rear', step });
        return res;
    }

    executeQueueUpdate(logicalIndex, newValue) {
        this.stopPlayback();
        const res = this.engine.queueUpdate(logicalIndex, newValue);
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'UPDATE',
            logicalIndex,
            value: newValue,
            description: isSuccess
                ? `Updated logical element [${logicalIndex}] to ${newValue} via circular index mapping.`
                : `Invalid Index Error: Logical index ${logicalIndex} is invalid for current size ${res.state.size}.`,
            cFunction: 'queue_update',
            cLine: isSuccess ? 8 : 5,
            cCodeSnippet: isSuccess
                ? `int physical_index = (queue->front + logical_index) % queue->capacity;\nqueue->data[physical_index] = new_value;\nreturn DS_SUCCESS;`
                : `if (logical_index < 0 || logical_index >= queue->size) {\n    return DS_ERR_INVALID_INDEX;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state
        };

        this.recordQueueStep(step);
        if (isSuccess) {
            toast.show(`Updated queue logical item [${logicalIndex}] to ${newValue}`, 'success');
        } else {
            toast.show(res.message, 'error');
        }
        this.notify({ lastAction: 'queue_update', step });
        return res;
    }

    executeQueueGetAt(logicalIndex) {
        this.stopPlayback();
        const res = this.engine.queueGetAt(logicalIndex);
        const isSuccess = res.status === DS_STATUS.SUCCESS;

        const step = {
            opName: 'READ',
            logicalIndex,
            value: res.value,
            description: isSuccess
                ? `Inspected logical item [${logicalIndex}]: ${res.value}. Physical storage index: ${(this.getQueueCurrent().state.frontIndex + logicalIndex) % this.getQueueCurrent().state.capacity}.`
                : `Invalid Index Error: Logical index ${logicalIndex} is outside bounds.`,
            cFunction: 'queue_get_at',
            cLine: isSuccess ? 8 : 5,
            cCodeSnippet: isSuccess
                ? `int physical_index = (queue->front + logical_index) % queue->capacity;\n*out_value = queue->data[physical_index];\nreturn DS_SUCCESS;`
                : `if (logical_index < 0 || logical_index >= queue->size) {\n    return DS_ERR_INVALID_INDEX;\n}`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state
        };

        this.recordQueueStep(step);
        if (isSuccess) {
            toast.show(`Queue[${logicalIndex}] = ${res.value}`, 'info');
        } else {
            toast.show(res.message, 'warning');
        }
        this.notify({ lastAction: 'queue_get_at', step });
        return res;
    }

    executeQueueClear() {
        this.stopPlayback();
        const res = this.engine.queueClear();
        const step = {
            opName: 'CLEAR',
            description: 'Queue cleared (FRONT reset to 0, REAR reset to -1, size reset to 0).',
            cFunction: 'queue_clear',
            cLine: 5,
            cCodeSnippet: `queue->front = 0;\nqueue->rear = -1;\nqueue->size = 0;\nreturn DS_SUCCESS;`,
            complexity: { time: 'O(1)', space: 'O(1)' },
            status: res.status,
            state: res.state
        };

        this.recordQueueStep(step);
        toast.show('Queue cleared', 'info');
        this.notify({ lastAction: 'queue_clear', step });
        return res;
    }

    executeQueueRecreate(capacity) {
        this.stopPlayback();
        const res = this.engine.queueInit(capacity);
        const step = {
            opName: 'CREATE',
            capacity,
            description: `Recreated circular queue with capacity ${capacity}.`,
            cFunction: 'queue_create',
            cLine: 9,
            cCodeSnippet: `Queue* q = (Queue*)malloc(sizeof(Queue));\nq->data = (int*)calloc(capacity, sizeof(int));\nq->front = 0;\nq->rear = -1;\nq->size = 0;\nq->capacity = capacity;`,
            complexity: { time: 'O(1)', space: 'O(N)' },
            status: res.status,
            state: res.state
        };

        this.queueHistory = [];
        this.queueHistoryIndex = -1;
        this.recordQueueStep(step);
        toast.show(`Queue reinitialized with capacity ${capacity}`, 'success');
        this.notify({ lastAction: 'queue_create', step });
        return res;
    }

    // ---------------- HISTORY & PLAYBACK ----------------

    recordStackStep(step) {
        // Truncate any forward history if branch was made
        if (this.stackHistoryIndex < this.stackHistory.length - 1) {
            this.stackHistory = this.stackHistory.slice(0, this.stackHistoryIndex + 1);
        }
        this.stackHistory.push(step);
        this.stackHistoryIndex = this.stackHistory.length - 1;
    }

    recordQueueStep(step) {
        if (this.queueHistoryIndex < this.queueHistory.length - 1) {
            this.queueHistory = this.queueHistory.slice(0, this.queueHistoryIndex + 1);
        }
        this.queueHistory.push(step);
        this.queueHistoryIndex = this.queueHistory.length - 1;
    }

    getStackCurrent() {
        return this.stackHistory[this.stackHistoryIndex] || {
            opName: 'IDLE',
            description: 'Ready for operations.',
            cFunction: 'stack_create',
            cLine: 1,
            cCodeSnippet: '// Structura C Stack Runtime',
            complexity: { time: 'O(1)', space: 'O(1)' },
            state: this.engine.getStackState()
        };
    }

    getQueueCurrent() {
        return this.queueHistory[this.queueHistoryIndex] || {
            opName: 'IDLE',
            description: 'Ready for operations.',
            cFunction: 'queue_create',
            cLine: 1,
            cCodeSnippet: '// Structura C Circular Queue Runtime',
            complexity: { time: 'O(1)', space: 'O(1)' },
            state: this.engine.getQueueState()
        };
    }

    canStepBack() {
        const idx = this.activeDS === 'stack' ? this.stackHistoryIndex : this.queueHistoryIndex;
        return idx > 0;
    }

    canStepForward() {
        const hist = this.activeDS === 'stack' ? this.stackHistory : this.queueHistory;
        const idx = this.activeDS === 'stack' ? this.stackHistoryIndex : this.queueHistoryIndex;
        return idx < hist.length - 1;
    }

    stepBack() {
        if (!this.canStepBack()) return;
        if (this.activeDS === 'stack') {
            this.stackHistoryIndex--;
        } else {
            this.queueHistoryIndex--;
        }
        this.notify({ isTimelineNav: true });
    }

    stepForward() {
        if (!this.canStepForward()) return;
        if (this.activeDS === 'stack') {
            this.stackHistoryIndex++;
        } else {
            this.queueHistoryIndex++;
        }
        this.notify({ isTimelineNav: true });
    }

    restart() {
        if (this.activeDS === 'stack') {
            this.stackHistoryIndex = 0;
        } else {
            this.queueHistoryIndex = 0;
        }
        this.notify({ isTimelineNav: true });
    }

    play() {
        if (this.isPlaying) return;
        if (!this.canStepForward()) {
            this.restart();
        }
        this.isPlaying = true;
        this.playbackTimer = setInterval(() => {
            if (this.canStepForward()) {
                this.stepForward();
            } else {
                this.pause();
            }
        }, this.playbackSpeed);
        this.notify();
    }

    pause() {
        this.isPlaying = false;
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
        this.notify();
    }

    stopPlayback() {
        if (this.isPlaying) {
            this.pause();
        }
    }

    setSpeed(ms) {
        this.playbackSpeed = ms;
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }

    setActiveDS(ds) {
        this.stopPlayback();
        this.activeDS = ds;
        this.notify({ dsChanged: true });
    }
}

export const bridge = new DataStructureBridge();
