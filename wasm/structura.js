/**
 * Structura - WebAssembly Loader and C Engine Bridge
 * Provides safe, validated interaction with the compiled C data structure algorithms.
 */

const WASM_BASE64 = `AGFzbQEAAAABEANgAAF/YAF/AX9gAn9/AX8DHx4BAQAAAgEAAAAAAAABAQAAAAIBAAAAAAAAAAAAAAAFAwEAAQfhAx8GbWVtb3J5AgAKc3RhY2tfaW5pdAAACnN0YWNrX3B1c2gAAQlzdGFja19wb3AAAgpzdGFja19wZWVrAAMMc3RhY2tfdXBkYXRlAAQMc3RhY2tfZ2V0X2F0AAUKc3RhY2tfc2l6ZQAGDnN0YWNrX2NhcGFjaXR5AAcPc3RhY2tfdG9wX2luZGV4AAgOc3RhY2tfaXNfZW1wdHkACQ1zdGFja19pc19mdWxsAAoLc3RhY2tfY2xlYXIACwpxdWV1ZV9pbml0AAwNcXVldWVfZW5xdWV1ZQANDXF1ZXVlX2RlcXVldWUADgtxdWV1ZV9mcm9udAAPCnF1ZXVlX3JlYXIAEAxxdWV1ZV91cGRhdGUAEQxxdWV1ZV9nZXRfYXQAEgpxdWV1ZV9zaXplABMOcXVldWVfY2FwYWNpdHkAFBFxdWV1ZV9mcm9udF9pbmRleAAVEHF1ZXVlX3JlYXJfaW5kZXgAFg5xdWV1ZV9pc19lbXB0eQAXDXF1ZXVlX2lzX2Z1bGwAGAtxdWV1ZV9jbGVhcgAZD2dldF9sYXN0X3N0YXR1cwAaDmdldF9sYXN0X3ZhbHVlABsSZ2V0X3N0YWNrX2RhdGFfcHRyABwSZ2V0X3F1ZXVlX2RhdGFfcHRyAB0KgwkeMgAgAEEATCAAQeQASnIEQEEYQQU2AgBBBQ8LQQBBfzYCAEEEIAA2AgBBGEEANgIAQQALSwECf0EEKAIAIQFBACgCACECIAIgAUEBa04EQEEYQQE2AgBBAQ8LIAJBAWohAkEAIAI2AgBBICACQQJ0aiAANgIAQRhBADYCAEEAC0QBAn9BACgCACEAIABBAEgEQEEYQQI2AgBBAg8LQSAgAEECdGooAgAhAUEcIAE2AgBBACAAQQFrNgIAQRhBADYCAEEACzYBAX9BACgCACEAIABBAEgEQEEYQQI2AgBBAg8LQRxBICAAQQJ0aigCADYCAEEYQQA2AgBBAAs5AQF/QQAoAgAhAiAAQQBIIAAgAkpyBEBBGEEDNgIAQQMPC0EgIABBAnRqIAE2AgBBGEEANgIAQQALPAEBf0EAKAIAIQEgAEEASCAAIAFKcgRAQRhBAzYCAEEDDwtBHEEgIABBAnRqKAIANgIAQRhBADYCAEEACwoAQQAoAgBBAWoLBwBBBCgCAAsHAEEAKAIACwoAQQAoAgBBf0YLEABBACgCAEEEKAIAQQFrTgsSAEEAQX82AgBBGEEANgIAQQALQAAgAEEATCAAQeQASnIEQEEYQQU2AgBBBQ8LQQhBADYCAEEMQX82AgBBEEEANgIAQRQgADYCAEEYQQA2AgBBAAtZAQN/QRAoAgAhAUEUKAIAIQIgASACTgRAQRhBATYCAEEBDwtBDCgCAEEBaiACbyEDQQwgAzYCAEH0AyADQQJ0aiAANgIAQRAgAUEBajYCAEEYQQA2AgBBAAt6AQR/QRAoAgAhACAAQQBMBEBBGEECNgIAQQIPC0EIKAIAIQFBFCgCACECQfQDIAFBAnRqKAIAIQNBHCADNgIAQQggAUEBaiACbzYCACAAQQFrIQBBECAANgIAIABBAEYEQEEIQQA2AgBBDEF/NgIAC0EYQQA2AgBBAAs+AQJ/QRAoAgAhACAAQQBMBEBBGEECNgIAQQIPC0EIKAIAIQFBHEH0AyABQQJ0aigCADYCAEEYQQA2AgBBAAs+AQJ/QRAoAgAhACAAQQBMBEBBGEECNgIAQQIPC0EMKAIAIQFBHEH0AyABQQJ0aigCADYCAEEYQQA2AgBBAAtOAQN/QRAoAgAhAiAAQQBIIAAgAk5yBEBBGEEDNgIAQQMPC0EUKAIAIQRBCCgCACAAaiAEbyEDQfQDIANBAnRqIAE2AgBBGEEANgIAQQALUQEDf0EQKAIAIQEgAEEASCAAIAFOcgRAQRhBAzYCAEEDDwtBFCgCACEDQQgoAgAgAGogA28hAkEcQfQDIAJBAnRqKAIANgIAQRhBADYCAEEACwcAQRAoAgALBwBBFCgCAAsVAEEQKAIAQQBGBH9BfwVBCCgCAAsLFQBBECgCAEEARgR/QX8FQQwoAgALCwoAQRAoAgBBAEYLDQBBECgCAEEUKAIATgsgAEEIQQA2AgBBDEF/NgIAQRBBADYCAEEYQQA2AgBBAAsHAEEYKAIACwcAQRwoAgALBABBIAsFAEH0Aws=`;

export const DS_STATUS = {
    SUCCESS: 0,
    OVERFLOW: 1,
    UNDERFLOW: 2,
    INVALID_INDEX: 3,
    NULL_PTR: 4,
    INVALID_CAPACITY: 5,
    ALLOC_FAILED: 6
};

export const STATUS_MESSAGES = {
    [DS_STATUS.SUCCESS]: "Operation executed successfully (DS_SUCCESS)",
    [DS_STATUS.OVERFLOW]: "Overflow Error: Data structure capacity reached. Cannot insert element (DS_ERR_OVERFLOW)",
    [DS_STATUS.UNDERFLOW]: "Underflow Error: Data structure is empty. No element to remove or inspect (DS_ERR_UNDERFLOW)",
    [DS_STATUS.INVALID_INDEX]: "Error: Index out of allowable bounds (DS_ERR_INVALID_INDEX)",
    [DS_STATUS.NULL_PTR]: "Error: Uninitialized data structure pointer (DS_ERR_NULL_PTR)",
    [DS_STATUS.INVALID_CAPACITY]: "Error: Invalid capacity. Must be between 1 and 100 (DS_ERR_INVALID_CAPACITY)",
    [DS_STATUS.ALLOC_FAILED]: "Error: Memory allocation failure (DS_ERR_ALLOC_FAILED)"
};

class StructuraEngine {
    constructor() {
        this.wasm = null;
        this.memory = null;
        this.int32View = null;
        this.isReady = false;
        this.engineMode = 'Uninitialized';
    }

    async init() {
        if (this.isReady) return;

        let wasmBytes = null;
        // Try fetching wasm binary file first
        try {
            const resp = await fetch('wasm/structura.wasm');
            if (resp.ok) {
                wasmBytes = await resp.arrayBuffer();
                this.engineMode = 'WebAssembly Native (.wasm binary loaded via fetch)';
            }
        } catch {
            // file:// protocol or offline environment fallback to embedded bytecode
        }

        if (!wasmBytes) {
            const binaryString = atob(WASM_BASE64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            wasmBytes = bytes.buffer;
            this.engineMode = 'WebAssembly Native (Embedded bytecode fallback)';
        }

        const module = await WebAssembly.compile(wasmBytes);
        const instance = await WebAssembly.instantiate(module);
        this.wasm = instance.exports;
        this.memory = this.wasm.memory;
        this.int32View = new Int32Array(this.memory.buffer);
        this.isReady = true;

        // Default initializations
        this.wasm.stack_init(5);
        this.wasm.queue_init(5);

        console.log(`[Structura] C WebAssembly engine initialized in mode: ${this.engineMode}`);
    }

    getStatusMessage(code) {
        return STATUS_MESSAGES[code] || `Status code: ${code}`;
    }

    getLastStatus() {
        return this.wasm.get_last_status();
    }

    getLastValue() {
        return this.wasm.get_last_value();
    }

    // ---------------- STACK OPERATIONS ----------------
    stackInit(capacity) {
        const status = this.wasm.stack_init(capacity);
        return { status, message: this.getStatusMessage(status), state: this.getStackState() };
    }

    stackPush(value) {
        const status = this.wasm.stack_push(value);
        return {
            status,
            value,
            message: status === DS_STATUS.SUCCESS ? `Pushed ${value} onto top of stack.` : this.getStatusMessage(status),
            state: this.getStackState()
        };
    }

    stackPop() {
        const status = this.wasm.stack_pop();
        const value = status === DS_STATUS.SUCCESS ? this.getLastValue() : null;
        return {
            status,
            value,
            message: status === DS_STATUS.SUCCESS ? `Popped ${value} from top of stack.` : this.getStatusMessage(status),
            state: this.getStackState()
        };
    }

    stackPeek() {
        const status = this.wasm.stack_peek();
        const value = status === DS_STATUS.SUCCESS ? this.getLastValue() : null;
        return {
            status,
            value,
            message: status === DS_STATUS.SUCCESS ? `Inspected top element: ${value} (Size unchanged).` : this.getStatusMessage(status),
            state: this.getStackState()
        };
    }

    stackUpdate(index, newValue) {
        const status = this.wasm.stack_update(index, newValue);
        return {
            status,
            index,
            newValue,
            message: status === DS_STATUS.SUCCESS ? `Updated index [${index}] to ${newValue}.` : this.getStatusMessage(status),
            state: this.getStackState()
        };
    }

    stackGetAt(index) {
        const status = this.wasm.stack_get_at(index);
        const value = status === DS_STATUS.SUCCESS ? this.getLastValue() : null;
        return {
            status,
            index,
            value,
            message: status === DS_STATUS.SUCCESS ? `Element at index [${index}] is ${value}.` : this.getStatusMessage(status),
            state: this.getStackState()
        };
    }

    stackClear() {
        const status = this.wasm.stack_clear();
        return {
            status,
            message: "Stack cleared.",
            state: this.getStackState()
        };
    }

    getStackState() {
        const size = this.wasm.stack_size();
        const capacity = this.wasm.stack_capacity();
        const topIndex = this.wasm.stack_top_index();
        const isEmpty = this.wasm.stack_is_empty() === 1;
        const isFull = this.wasm.stack_is_full() === 1;

        const dataPtr = this.wasm.get_stack_data_ptr() >> 2; // Int32 offset
        this.int32View = new Int32Array(this.memory.buffer);

        const elements = [];
        for (let i = 0; i < size; i++) {
            elements.push({
                index: i,
                value: this.int32View[dataPtr + i],
                isTop: i === topIndex
            });
        }

        return {
            size,
            capacity,
            topIndex,
            elements,
            isEmpty,
            isFull
        };
    }

    // ---------------- CIRCULAR QUEUE OPERATIONS ----------------
    queueInit(capacity) {
        const status = this.wasm.queue_init(capacity);
        return { status, message: this.getStatusMessage(status), state: this.getQueueState() };
    }

    queueEnqueue(value) {
        const status = this.wasm.queue_enqueue(value);
        return {
            status,
            value,
            message: status === DS_STATUS.SUCCESS ? `Enqueued ${value} at rear of queue.` : this.getStatusMessage(status),
            state: this.getQueueState()
        };
    }

    queueDequeue() {
        const status = this.wasm.queue_dequeue();
        const value = status === DS_STATUS.SUCCESS ? this.getLastValue() : null;
        return {
            status,
            value,
            message: status === DS_STATUS.SUCCESS ? `Dequeued ${value} from front of queue.` : this.getStatusMessage(status),
            state: this.getQueueState()
        };
    }

    queueFront() {
        const status = this.wasm.queue_front();
        const value = status === DS_STATUS.SUCCESS ? this.getLastValue() : null;
        return {
            status,
            value,
            message: status === DS_STATUS.SUCCESS ? `Front element is ${value} (Size unchanged).` : this.getStatusMessage(status),
            state: this.getQueueState()
        };
    }

    queueRear() {
        const status = this.wasm.queue_rear();
        const value = status === DS_STATUS.SUCCESS ? this.getLastValue() : null;
        return {
            status,
            value,
            message: status === DS_STATUS.SUCCESS ? `Rear element is ${value} (Size unchanged).` : this.getStatusMessage(status),
            state: this.getQueueState()
        };
    }

    queueUpdate(logicalIndex, newValue) {
        const status = this.wasm.queue_update(logicalIndex, newValue);
        return {
            status,
            logicalIndex,
            newValue,
            message: status === DS_STATUS.SUCCESS ? `Updated logical element [${logicalIndex}] to ${newValue}.` : this.getStatusMessage(status),
            state: this.getQueueState()
        };
    }

    queueGetAt(logicalIndex) {
        const status = this.wasm.queue_get_at(logicalIndex);
        const value = status === DS_STATUS.SUCCESS ? this.getLastValue() : null;
        return {
            status,
            logicalIndex,
            value,
            message: status === DS_STATUS.SUCCESS ? `Logical element at [${logicalIndex}] is ${value}.` : this.getStatusMessage(status),
            state: this.getQueueState()
        };
    }

    queueClear() {
        const status = this.wasm.queue_clear();
        return {
            status,
            message: "Queue cleared.",
            state: this.getQueueState()
        };
    }

    getQueueState() {
        const size = this.wasm.queue_size();
        const capacity = this.wasm.queue_capacity();
        const frontIndex = this.wasm.queue_front_index();
        const rearIndex = this.wasm.queue_rear_index();
        const isEmpty = this.wasm.queue_is_empty() === 1;
        const isFull = this.wasm.queue_is_full() === 1;

        const dataPtr = this.wasm.get_queue_data_ptr() >> 2; // Int32 offset
        this.int32View = new Int32Array(this.memory.buffer);

        // Logical FIFO elements
        const logicalElements = [];
        if (!isEmpty && capacity > 0) {
            for (let i = 0; i < size; i++) {
                const phys = (frontIndex + i) % capacity;
                logicalElements.push({
                    logicalIndex: i,
                    physicalIndex: phys,
                    value: this.int32View[dataPtr + phys],
                    isFront: i === 0,
                    isRear: i === size - 1
                });
            }
        }

        // Physical storage slots (0 to capacity - 1)
        const physicalSlots = [];
        for (let p = 0; p < capacity; p++) {
            let occupied = false;
            let logicalOffset = -1;
            if (!isEmpty) {
                for (let i = 0; i < size; i++) {
                    if ((frontIndex + i) % capacity === p) {
                        occupied = true;
                        logicalOffset = i;
                        break;
                    }
                }
            }

            physicalSlots.push({
                physicalIndex: p,
                value: occupied ? this.int32View[dataPtr + p] : null,
                occupied,
                logicalOffset,
                isFront: occupied && p === frontIndex,
                isRear: occupied && p === rearIndex
            });
        }

        return {
            size,
            capacity,
            frontIndex,
            rearIndex,
            logicalElements,
            physicalSlots,
            isEmpty,
            isFull
        };
    }
}

export const structura = new StructuraEngine();
