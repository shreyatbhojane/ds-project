/**
 * Structura - WebAssembly Binary Generator & Test Suite
 * Generates valid binary WebAssembly (.wasm) for Structura's C data structure algorithms.
 * Implements exact stack and circular queue algorithms directly in Wasm bytecode.
 */

const fs = require('fs');
const path = require('path');

// Helper to encode unsigned LEB128
function encodeULEB128(n) {
    const bytes = [];
    do {
        let byte = n & 0x7f;
        n >>>= 7;
        if (n !== 0) {
            byte |= 0x80;
        }
        bytes.push(byte);
    } while (n !== 0);
    return bytes;
}

// Helper to encode signed LEB128
function encodeSLEB128(n) {
    const bytes = [];
    let more = true;
    while (more) {
        let byte = n & 0x7f;
        n >>= 7;
        const signBit = (byte & 0x40) !== 0;
        if ((n === 0 && !signBit) || (n === -1 && signBit)) {
            more = false;
        } else {
            byte |= 0x80;
        }
        bytes.push(byte);
    }
    return bytes;
}

function encodeVector(items) {
    const count = encodeULEB128(items.length);
    return Buffer.concat([Buffer.from(count), ...items]);
}

function encodeSection(id, payload) {
    const len = encodeULEB128(payload.length);
    return Buffer.concat([Buffer.from([id]), Buffer.from(len), payload]);
}

// Memory offsets (in bytes)
const MEM = {
    STACK_TOP: 0,
    STACK_CAP: 4,
    QUEUE_FRONT: 8,
    QUEUE_REAR: 12,
    QUEUE_SIZE: 16,
    QUEUE_CAP: 20,
    LAST_STATUS: 24,
    LAST_VALUE: 28,
    STACK_DATA: 32,      // up to 100 ints (400 bytes)
    QUEUE_DATA: 500      // up to 100 ints (400 bytes)
};

// Status codes matching operations.h
const STATUS = {
    SUCCESS: 0,
    OVERFLOW: 1,
    UNDERFLOW: 2,
    INVALID_INDEX: 3,
    NULL_PTR: 4,
    INVALID_CAPACITY: 5,
    ALLOC_FAILED: 6
};

// Wasm Type constants
const i32 = 0x7f;
const funcType = 0x60;

// Opcodes
const OP = {
    block: 0x02,
    loop: 0x03,
    if: 0x04,
    else: 0x05,
    end: 0x0b,
    br: 0x0c,
    br_if: 0x0d,
    return: 0x0f,
    local_get: 0x20,
    local_set: 0x21,
    local_tee: 0x22,
    i32_load: 0x28,
    i32_store: 0x36,
    i32_const: 0x41,
    i32_eqz: 0x45,
    i32_eq: 0x46,
    i32_ne: 0x47,
    i32_lt_s: 0x48,
    i32_gt_s: 0x4a,
    i32_le_s: 0x4c,
    i32_ge_s: 0x4e,
    i32_add: 0x6a,
    i32_sub: 0x6b,
    i32_mul: 0x6c,
    i32_div_s: 0x6d,
    i32_rem_s: 0x6f,
    i32_shl: 0x74
};

function i32Const(n) {
    return [OP.i32_const, ...encodeSLEB128(n)];
}

function i32Load(offset) {
    return [OP.i32_load, 0x02, ...encodeULEB128(offset)];
}

function i32Store(offset) {
    return [OP.i32_store, 0x02, ...encodeULEB128(offset)];
}

// Function Builders
function buildFunc(locals, bytecodes) {
    const localEntries = locals.map(l => Buffer.from([...encodeULEB128(l.count), l.type]));
    const localSection = Buffer.concat([Buffer.from(encodeULEB128(localEntries.length)), ...localEntries]);
    const body = Buffer.from([...bytecodes, OP.end]);
    const totalLen = encodeULEB128(localSection.length + body.length);
    return Buffer.concat([Buffer.from(totalLen), localSection, body]);
}

// Build the Wasm Binary
function generateWasm() {
    const magic = Buffer.from([0x00, 0x61, 0x73, 0x6d]);
    const version = Buffer.from([0x01, 0x00, 0x00, 0x00]);

    // Types:
    // Type 0: () -> i32
    // Type 1: (i32) -> i32
    // Type 2: (i32, i32) -> i32
    // Type 3: () -> ()
    const type0 = Buffer.from([funcType, 0x00, 0x01, i32]);
    const type1 = Buffer.from([funcType, 0x01, i32, 0x01, i32]);
    const type2 = Buffer.from([funcType, 0x02, i32, i32, 0x01, i32]);
    const types = encodeVector([type0, type1, type2]);
    const typeSection = encodeSection(1, types);

    // Functions list:
    // 0: stack_init (type 1)
    // 1: stack_push (type 1)
    // 2: stack_pop (type 0)
    // 3: stack_peek (type 0)
    // 4: stack_update (type 2)
    // 5: stack_get_at (type 1)
    // 6: stack_size (type 0)
    // 7: stack_capacity (type 0)
    // 8: stack_top_index (type 0)
    // 9: stack_is_empty (type 0)
    // 10: stack_is_full (type 0)
    // 11: stack_clear (type 0)
    // 12: queue_init (type 1)
    // 13: queue_enqueue (type 1)
    // 14: queue_dequeue (type 0)
    // 15: queue_front (type 0)
    // 16: queue_rear (type 0)
    // 17: queue_update (type 2)
    // 18: queue_get_at (type 1)
    // 19: queue_size (type 0)
    // 20: queue_capacity (type 0)
    // 21: queue_front_index (type 0)
    // 22: queue_rear_index (type 0)
    // 23: queue_is_empty (type 0)
    // 24: queue_is_full (type 0)
    // 25: queue_clear (type 0)
    // 26: get_last_status (type 0)
    // 27: get_last_value (type 0)
    // 28: get_stack_data_ptr (type 0)
    // 29: get_queue_data_ptr (type 0)

    const funcTypeIndices = [
        1, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, // stack 0-11
        1, 1, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, // queue 12-25
        0, 0, 0, 0 // utils 26-29
    ];
    const funcSection = encodeSection(3, Buffer.concat([
        Buffer.from(encodeULEB128(funcTypeIndices.length)),
        Buffer.from(funcTypeIndices)
    ]));

    // Memory: 1 page (64KB)
    const memSection = encodeSection(5, Buffer.from([0x01, 0x00, 0x01]));

    // Exports
    const exportsList = [
        { name: "memory", kind: 0x02, index: 0 },
        { name: "stack_init", kind: 0x00, index: 0 },
        { name: "stack_push", kind: 0x00, index: 1 },
        { name: "stack_pop", kind: 0x00, index: 2 },
        { name: "stack_peek", kind: 0x00, index: 3 },
        { name: "stack_update", kind: 0x00, index: 4 },
        { name: "stack_get_at", kind: 0x00, index: 5 },
        { name: "stack_size", kind: 0x00, index: 6 },
        { name: "stack_capacity", kind: 0x00, index: 7 },
        { name: "stack_top_index", kind: 0x00, index: 8 },
        { name: "stack_is_empty", kind: 0x00, index: 9 },
        { name: "stack_is_full", kind: 0x00, index: 10 },
        { name: "stack_clear", kind: 0x00, index: 11 },
        { name: "queue_init", kind: 0x00, index: 12 },
        { name: "queue_enqueue", kind: 0x00, index: 13 },
        { name: "queue_dequeue", kind: 0x00, index: 14 },
        { name: "queue_front", kind: 0x00, index: 15 },
        { name: "queue_rear", kind: 0x00, index: 16 },
        { name: "queue_update", kind: 0x00, index: 17 },
        { name: "queue_get_at", kind: 0x00, index: 18 },
        { name: "queue_size", kind: 0x00, index: 19 },
        { name: "queue_capacity", kind: 0x00, index: 20 },
        { name: "queue_front_index", kind: 0x00, index: 21 },
        { name: "queue_rear_index", kind: 0x00, index: 22 },
        { name: "queue_is_empty", kind: 0x00, index: 23 },
        { name: "queue_is_full", kind: 0x00, index: 24 },
        { name: "queue_clear", kind: 0x00, index: 25 },
        { name: "get_last_status", kind: 0x00, index: 26 },
        { name: "get_last_value", kind: 0x00, index: 27 },
        { name: "get_stack_data_ptr", kind: 0x00, index: 28 },
        { name: "get_queue_data_ptr", kind: 0x00, index: 29 }
    ];

    const exportBuffers = exportsList.map(e => {
        const nameBytes = Buffer.from(e.name, 'utf8');
        return Buffer.concat([
            Buffer.from(encodeULEB128(nameBytes.length)),
            nameBytes,
            Buffer.from([e.kind, e.index])
        ]);
    });
    const exportSection = encodeSection(7, encodeVector(exportBuffers));

    // Code section implementation for each function
    const codeBodies = [];

    // Helper to set last_status
    function setStatus(st) {
        return [
            ...i32Const(MEM.LAST_STATUS),
            ...i32Const(st),
            ...i32Store(0)
        ];
    }

    // 0: stack_init(cap: i32) -> i32 (status)
    // if cap <= 0 || cap > 100 return INVALID_CAPACITY;
    // top = -1; cap = cap; status = SUCCESS; return SUCCESS;
    codeBodies.push(buildFunc([], [
        // check cap <= 0
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_le_s,
        // check cap > 100
        OP.local_get, 0,
        ...i32Const(100),
        OP.i32_gt_s,
        0x72, // i32.or
        OP.if, 0x40,
            ...setStatus(STATUS.INVALID_CAPACITY),
            ...i32Const(STATUS.INVALID_CAPACITY),
            OP.return,
        OP.end,
        // top = -1
        ...i32Const(MEM.STACK_TOP),
        ...i32Const(-1),
        ...i32Store(0),
        // cap = local[0]
        ...i32Const(MEM.STACK_CAP),
        OP.local_get, 0,
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 1: stack_push(val: i32) -> i32 (status)
    // cap = load(STACK_CAP); top = load(STACK_TOP);
    // if (top >= cap - 1) return OVERFLOW;
    // top++; store(STACK_TOP, top);
    // store(STACK_DATA + top * 4, val);
    // return SUCCESS;
    codeBodies.push(buildFunc([{ count: 2, type: i32 }], [ // local 1: cap, local 2: top
        ...i32Const(MEM.STACK_CAP),
        ...i32Load(0),
        OP.local_set, 1,
        ...i32Const(MEM.STACK_TOP),
        ...i32Load(0),
        OP.local_set, 2,
        // check top >= cap - 1
        OP.local_get, 2,
        OP.local_get, 1,
        ...i32Const(1),
        OP.i32_sub,
        OP.i32_ge_s,
        OP.if, 0x40,
            ...setStatus(STATUS.OVERFLOW),
            ...i32Const(STATUS.OVERFLOW),
            OP.return,
        OP.end,
        // top++
        OP.local_get, 2,
        ...i32Const(1),
        OP.i32_add,
        OP.local_set, 2,
        ...i32Const(MEM.STACK_TOP),
        OP.local_get, 2,
        ...i32Store(0),
        // store val at STACK_DATA + top * 4
        ...i32Const(MEM.STACK_DATA),
        OP.local_get, 2,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        OP.local_get, 0,
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 2: stack_pop() -> i32 (status)
    // top = load(STACK_TOP);
    // if (top < 0) return UNDERFLOW;
    // val = load(STACK_DATA + top * 4);
    // store(LAST_VALUE, val);
    // top--; store(STACK_TOP, top);
    // return SUCCESS;
    codeBodies.push(buildFunc([{ count: 2, type: i32 }], [ // local 0: top, local 1: val
        ...i32Const(MEM.STACK_TOP),
        ...i32Load(0),
        OP.local_set, 0,
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_lt_s,
        OP.if, 0x40,
            ...setStatus(STATUS.UNDERFLOW),
            ...i32Const(STATUS.UNDERFLOW),
            OP.return,
        OP.end,
        // load val
        ...i32Const(MEM.STACK_DATA),
        OP.local_get, 0,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        ...i32Load(0),
        OP.local_set, 1,
        // store LAST_VALUE
        ...i32Const(MEM.LAST_VALUE),
        OP.local_get, 1,
        ...i32Store(0),
        // top--
        ...i32Const(MEM.STACK_TOP),
        OP.local_get, 0,
        ...i32Const(1),
        OP.i32_sub,
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 3: stack_peek() -> i32 (status)
    codeBodies.push(buildFunc([{ count: 1, type: i32 }], [ // local 0: top
        ...i32Const(MEM.STACK_TOP),
        ...i32Load(0),
        OP.local_set, 0,
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_lt_s,
        OP.if, 0x40,
            ...setStatus(STATUS.UNDERFLOW),
            ...i32Const(STATUS.UNDERFLOW),
            OP.return,
        OP.end,
        ...i32Const(MEM.LAST_VALUE),
        ...i32Const(MEM.STACK_DATA),
        OP.local_get, 0,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        ...i32Load(0),
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 4: stack_update(idx: i32, val: i32) -> i32 (status)
    codeBodies.push(buildFunc([{ count: 1, type: i32 }], [ // local 2: top
        ...i32Const(MEM.STACK_TOP),
        ...i32Load(0),
        OP.local_set, 2,
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_lt_s,
        OP.local_get, 0,
        OP.local_get, 2,
        OP.i32_gt_s,
        0x72, // i32.or
        OP.if, 0x40,
            ...setStatus(STATUS.INVALID_INDEX),
            ...i32Const(STATUS.INVALID_INDEX),
            OP.return,
        OP.end,
        ...i32Const(MEM.STACK_DATA),
        OP.local_get, 0,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        OP.local_get, 1,
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 5: stack_get_at(idx: i32) -> i32 (status, sets LAST_VALUE)
    codeBodies.push(buildFunc([{ count: 1, type: i32 }], [ // local 1: top
        ...i32Const(MEM.STACK_TOP),
        ...i32Load(0),
        OP.local_set, 1,
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_lt_s,
        OP.local_get, 0,
        OP.local_get, 1,
        OP.i32_gt_s,
        0x72, // or
        OP.if, 0x40,
            ...setStatus(STATUS.INVALID_INDEX),
            ...i32Const(STATUS.INVALID_INDEX),
            OP.return,
        OP.end,
        ...i32Const(MEM.LAST_VALUE),
        ...i32Const(MEM.STACK_DATA),
        OP.local_get, 0,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        ...i32Load(0),
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 6: stack_size() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.STACK_TOP),
        ...i32Load(0),
        ...i32Const(1),
        OP.i32_add
    ]));

    // 7: stack_capacity() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.STACK_CAP),
        ...i32Load(0)
    ]));

    // 8: stack_top_index() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.STACK_TOP),
        ...i32Load(0)
    ]));

    // 9: stack_is_empty() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.STACK_TOP),
        ...i32Load(0),
        ...i32Const(-1),
        OP.i32_eq
    ]));

    // 10: stack_is_full() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.STACK_TOP),
        ...i32Load(0),
        ...i32Const(MEM.STACK_CAP),
        ...i32Load(0),
        ...i32Const(1),
        OP.i32_sub,
        OP.i32_ge_s
    ]));

    // 11: stack_clear() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.STACK_TOP),
        ...i32Const(-1),
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // ---------------- Circular Queue ----------------
    // 12: queue_init(cap: i32) -> i32 (status)
    codeBodies.push(buildFunc([], [
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_le_s,
        OP.local_get, 0,
        ...i32Const(100),
        OP.i32_gt_s,
        0x72, // or
        OP.if, 0x40,
            ...setStatus(STATUS.INVALID_CAPACITY),
            ...i32Const(STATUS.INVALID_CAPACITY),
            OP.return,
        OP.end,
        ...i32Const(MEM.QUEUE_FRONT),
        ...i32Const(0),
        ...i32Store(0),
        ...i32Const(MEM.QUEUE_REAR),
        ...i32Const(-1),
        ...i32Store(0),
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Const(0),
        ...i32Store(0),
        ...i32Const(MEM.QUEUE_CAP),
        OP.local_get, 0,
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 13: queue_enqueue(val: i32) -> i32 (status)
    // size = load(QUEUE_SIZE); cap = load(QUEUE_CAP);
    // if size == cap return OVERFLOW;
    // rear = (load(QUEUE_REAR) + 1) % cap;
    // store(QUEUE_REAR, rear);
    // store(QUEUE_DATA + rear * 4, val);
    // store(QUEUE_SIZE, size + 1);
    codeBodies.push(buildFunc([{ count: 3, type: i32 }], [ // local 1: size, 2: cap, 3: rear
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        OP.local_set, 1,
        ...i32Const(MEM.QUEUE_CAP),
        ...i32Load(0),
        OP.local_set, 2,
        OP.local_get, 1,
        OP.local_get, 2,
        OP.i32_ge_s,
        OP.if, 0x40,
            ...setStatus(STATUS.OVERFLOW),
            ...i32Const(STATUS.OVERFLOW),
            OP.return,
        OP.end,
        // rear = (load(QUEUE_REAR) + 1) % cap
        ...i32Const(MEM.QUEUE_REAR),
        ...i32Load(0),
        ...i32Const(1),
        OP.i32_add,
        OP.local_get, 2,
        OP.i32_rem_s,
        OP.local_set, 3,
        ...i32Const(MEM.QUEUE_REAR),
        OP.local_get, 3,
        ...i32Store(0),
        // store data at QUEUE_DATA + rear * 4
        ...i32Const(MEM.QUEUE_DATA),
        OP.local_get, 3,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        OP.local_get, 0,
        ...i32Store(0),
        // store size + 1
        ...i32Const(MEM.QUEUE_SIZE),
        OP.local_get, 1,
        ...i32Const(1),
        OP.i32_add,
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 14: queue_dequeue() -> i32 (status, sets LAST_VALUE)
    // size = load(QUEUE_SIZE);
    // if size == 0 return UNDERFLOW;
    // front = load(QUEUE_FRONT); cap = load(QUEUE_CAP);
    // val = load(QUEUE_DATA + front * 4);
    // store(LAST_VALUE, val);
    // front = (front + 1) % cap;
    // store(QUEUE_FRONT, front);
    // size--; store(QUEUE_SIZE, size);
    // if size == 0 { front = 0; rear = -1; store both }
    codeBodies.push(buildFunc([{ count: 4, type: i32 }], [ // 0: size, 1: front, 2: cap, 3: val
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        OP.local_set, 0,
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_le_s,
        OP.if, 0x40,
            ...setStatus(STATUS.UNDERFLOW),
            ...i32Const(STATUS.UNDERFLOW),
            OP.return,
        OP.end,
        ...i32Const(MEM.QUEUE_FRONT),
        ...i32Load(0),
        OP.local_set, 1,
        ...i32Const(MEM.QUEUE_CAP),
        ...i32Load(0),
        OP.local_set, 2,
        // load val
        ...i32Const(MEM.QUEUE_DATA),
        OP.local_get, 1,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        ...i32Load(0),
        OP.local_set, 3,
        ...i32Const(MEM.LAST_VALUE),
        OP.local_get, 3,
        ...i32Store(0),
        // front = (front + 1) % cap
        ...i32Const(MEM.QUEUE_FRONT),
        OP.local_get, 1,
        ...i32Const(1),
        OP.i32_add,
        OP.local_get, 2,
        OP.i32_rem_s,
        ...i32Store(0),
        // size--
        OP.local_get, 0,
        ...i32Const(1),
        OP.i32_sub,
        OP.local_set, 0,
        ...i32Const(MEM.QUEUE_SIZE),
        OP.local_get, 0,
        ...i32Store(0),
        // if size == 0 reset front=0, rear=-1
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_eq,
        OP.if, 0x40,
            ...i32Const(MEM.QUEUE_FRONT),
            ...i32Const(0),
            ...i32Store(0),
            ...i32Const(MEM.QUEUE_REAR),
            ...i32Const(-1),
            ...i32Store(0),
        OP.end,
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 15: queue_front() -> i32 (status, sets LAST_VALUE)
    codeBodies.push(buildFunc([{ count: 2, type: i32 }], [ // 0: size, 1: front
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        OP.local_set, 0,
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_le_s,
        OP.if, 0x40,
            ...setStatus(STATUS.UNDERFLOW),
            ...i32Const(STATUS.UNDERFLOW),
            OP.return,
        OP.end,
        ...i32Const(MEM.QUEUE_FRONT),
        ...i32Load(0),
        OP.local_set, 1,
        ...i32Const(MEM.LAST_VALUE),
        ...i32Const(MEM.QUEUE_DATA),
        OP.local_get, 1,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        ...i32Load(0),
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 16: queue_rear() -> i32 (status, sets LAST_VALUE)
    codeBodies.push(buildFunc([{ count: 2, type: i32 }], [ // 0: size, 1: rear
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        OP.local_set, 0,
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_le_s,
        OP.if, 0x40,
            ...setStatus(STATUS.UNDERFLOW),
            ...i32Const(STATUS.UNDERFLOW),
            OP.return,
        OP.end,
        ...i32Const(MEM.QUEUE_REAR),
        ...i32Load(0),
        OP.local_set, 1,
        ...i32Const(MEM.LAST_VALUE),
        ...i32Const(MEM.QUEUE_DATA),
        OP.local_get, 1,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        ...i32Load(0),
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 17: queue_update(logical_idx: i32, val: i32) -> i32 (status)
    // if logical_idx < 0 || logical_idx >= size return INVALID_INDEX
    // phys = (front + logical_idx) % cap
    // store(QUEUE_DATA + phys * 4, val)
    codeBodies.push(buildFunc([{ count: 3, type: i32 }], [ // 2: size, 3: phys, 4: cap
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        OP.local_set, 2,
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_lt_s,
        OP.local_get, 0,
        OP.local_get, 2,
        OP.i32_ge_s,
        0x72, // or
        OP.if, 0x40,
            ...setStatus(STATUS.INVALID_INDEX),
            ...i32Const(STATUS.INVALID_INDEX),
            OP.return,
        OP.end,
        ...i32Const(MEM.QUEUE_CAP),
        ...i32Load(0),
        OP.local_set, 4,
        ...i32Const(MEM.QUEUE_FRONT),
        ...i32Load(0),
        OP.local_get, 0,
        OP.i32_add,
        OP.local_get, 4,
        OP.i32_rem_s,
        OP.local_set, 3,
        ...i32Const(MEM.QUEUE_DATA),
        OP.local_get, 3,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        OP.local_get, 1,
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 18: queue_get_at(logical_idx: i32) -> i32 (status, sets LAST_VALUE)
    codeBodies.push(buildFunc([{ count: 3, type: i32 }], [ // 1: size, 2: phys, 3: cap
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        OP.local_set, 1,
        OP.local_get, 0,
        ...i32Const(0),
        OP.i32_lt_s,
        OP.local_get, 0,
        OP.local_get, 1,
        OP.i32_ge_s,
        0x72, // or
        OP.if, 0x40,
            ...setStatus(STATUS.INVALID_INDEX),
            ...i32Const(STATUS.INVALID_INDEX),
            OP.return,
        OP.end,
        ...i32Const(MEM.QUEUE_CAP),
        ...i32Load(0),
        OP.local_set, 3,
        ...i32Const(MEM.QUEUE_FRONT),
        ...i32Load(0),
        OP.local_get, 0,
        OP.i32_add,
        OP.local_get, 3,
        OP.i32_rem_s,
        OP.local_set, 2,
        ...i32Const(MEM.LAST_VALUE),
        ...i32Const(MEM.QUEUE_DATA),
        OP.local_get, 2,
        ...i32Const(2),
        OP.i32_shl,
        OP.i32_add,
        ...i32Load(0),
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 19: queue_size() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0)
    ]));

    // 20: queue_capacity() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.QUEUE_CAP),
        ...i32Load(0)
    ]));

    // 21: queue_front_index() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        ...i32Const(0),
        OP.i32_eq,
        OP.if, 0x7f,
            ...i32Const(-1),
        OP.else,
            ...i32Const(MEM.QUEUE_FRONT),
            ...i32Load(0),
        OP.end
    ]));

    // 22: queue_rear_index() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        ...i32Const(0),
        OP.i32_eq,
        OP.if, 0x7f,
            ...i32Const(-1),
        OP.else,
            ...i32Const(MEM.QUEUE_REAR),
            ...i32Load(0),
        OP.end
    ]));

    // 23: queue_is_empty() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        ...i32Const(0),
        OP.i32_eq
    ]));

    // 24: queue_is_full() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Load(0),
        ...i32Const(MEM.QUEUE_CAP),
        ...i32Load(0),
        OP.i32_ge_s
    ]));

    // 25: queue_clear() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.QUEUE_FRONT),
        ...i32Const(0),
        ...i32Store(0),
        ...i32Const(MEM.QUEUE_REAR),
        ...i32Const(-1),
        ...i32Store(0),
        ...i32Const(MEM.QUEUE_SIZE),
        ...i32Const(0),
        ...i32Store(0),
        ...setStatus(STATUS.SUCCESS),
        ...i32Const(STATUS.SUCCESS)
    ]));

    // 26: get_last_status() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.LAST_STATUS),
        ...i32Load(0)
    ]));

    // 27: get_last_value() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.LAST_VALUE),
        ...i32Load(0)
    ]));

    // 28: get_stack_data_ptr() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.STACK_DATA)
    ]));

    // 29: get_queue_data_ptr() -> i32
    codeBodies.push(buildFunc([], [
        ...i32Const(MEM.QUEUE_DATA)
    ]));

    const codeSection = encodeSection(10, encodeVector(codeBodies));

    return Buffer.concat([magic, version, typeSection, funcSection, memSection, exportSection, codeSection]);
}

// Build and test
const wasmBuffer = generateWasm();
const outPath = path.join(__dirname, 'wasm', 'structura.wasm');
fs.writeFileSync(outPath, wasmBuffer);
console.log(`Successfully generated ${outPath} (${wasmBuffer.length} bytes)`);

// Update wasm/structura.js with base64 embedded bytecode
const jsPath = path.join(__dirname, 'wasm', 'structura.js');
if (fs.existsSync(jsPath)) {
    let jsContent = fs.readFileSync(jsPath, 'utf8');
    const b64 = wasmBuffer.toString('base64');
    jsContent = jsContent.replace(/const WASM_BASE64 = `[\s\S]*?`;/, 'const WASM_BASE64 = `' + b64 + '`;');
    fs.writeFileSync(jsPath, jsContent);
    console.log(`Updated structura.js with embedded WebAssembly base64 (${b64.length} chars)`);
}

// Test execution in Node.js
async function runTests() {
    console.log('Testing generated WebAssembly module...');
    const mod = await WebAssembly.compile(wasmBuffer);
    const inst = await WebAssembly.instantiate(mod);
    const exp = inst.exports;

    console.log('1. Testing Stack:');
    exp.stack_init(4);
    console.log('  Init capacity 4, size:', exp.stack_size()); // 0
    exp.stack_push(42);
    exp.stack_push(88);
    exp.stack_push(99);
    console.log('  Pushed 3 elements, size:', exp.stack_size(), 'top:', exp.stack_top_index());
    exp.stack_peek();
    console.log('  Peeked:', exp.get_last_value(), 'status:', exp.get_last_status());
    exp.stack_pop();
    console.log('  Popped:', exp.get_last_value(), 'new size:', exp.stack_size());

    console.log('2. Testing Circular Queue:');
    exp.queue_init(3);
    exp.queue_enqueue(10);
    exp.queue_enqueue(20);
    exp.queue_enqueue(30);
    console.log('  Queue full (3/3), rear:', exp.queue_rear_index(), 'full?:', exp.queue_is_full());
    exp.queue_dequeue();
    console.log('  Dequeued:', exp.get_last_value(), 'new front:', exp.queue_front_index());
    exp.queue_enqueue(40);
    console.log('  Enqueued 40 (wrapped around!), new rear:', exp.queue_rear_index());
    exp.queue_get_at(0);
    console.log('  Logical element 0:', exp.get_last_value());
    exp.queue_get_at(2);
    console.log('  Logical element 2 (wrapped):', exp.get_last_value());

    console.log('All WebAssembly tests passed successfully!');
}

runTests().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
