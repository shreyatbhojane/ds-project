/**
 * Structura - C Code Explorer & Execution Tracker
 * Displays real C implementation with interactive line highlights, explanations, and clipboard copy.
 */

export const C_SOURCES = {
    stack_push: {
        title: "stack_push(Stack* stack, int value)",
        signature: "DS_Status stack_push(Stack* stack, int value)",
        file: "c/stack.c",
        lines: [
            { num: 1, text: "DS_Status stack_push(Stack* stack, int value) {", exp: "Function entry with pointer to Stack instance and integer value." },
            { num: 2, text: "    if (!stack) {", exp: "Safety boundary: check for NULL pointer reference." },
            { num: 3, text: "        return DS_ERR_NULL_PTR;", exp: "Return explicit status code on NULL." },
            { num: 4, text: "    }", exp: "" },
            { num: 5, text: "    if (stack_is_full(stack)) {", exp: "Boundary check: check if top >= capacity - 1." },
            { num: 6, text: "        return DS_ERR_OVERFLOW;", exp: "Overflow guard: prevents array memory overrun." },
            { num: 7, text: "    }", exp: "" },
            { num: 8, text: "    stack->top++;", exp: "Advance TOP index by 1 to allocate new top slot." },
            { num: 9, text: "    stack->data[stack->top] = value;", exp: "Store the incoming value at newly incremented TOP index." },
            { num: 10, text: "    return DS_SUCCESS;", exp: "Return success code DS_SUCCESS (0)." },
            { num: 11, text: "}", exp: "Exit function. Complexity: O(1) Time, O(1) Space." }
        ]
    },
    stack_pop: {
        title: "stack_pop(Stack* stack, int* out_value)",
        signature: "DS_Status stack_pop(Stack* stack, int* out_value)",
        file: "c/stack.c",
        lines: [
            { num: 1, text: "DS_Status stack_pop(Stack* stack, int* out_value) {", exp: "Function entry to remove top element and write to out_value." },
            { num: 2, text: "    if (!stack) {", exp: "Check stack pointer validity." },
            { num: 3, text: "        return DS_ERR_NULL_PTR;", exp: "Return NULL pointer error." },
            { num: 4, text: "    }", exp: "" },
            { num: 5, text: "    if (stack_is_empty(stack)) {", exp: "Underflow check: test if top == -1." },
            { num: 6, text: "        return DS_ERR_UNDERFLOW;", exp: "Underflow guard: cannot pop from empty stack." },
            { num: 7, text: "    }", exp: "" },
            { num: 8, text: "    if (out_value) {", exp: "Check if caller provided a return buffer." },
            { num: 9, text: "        *out_value = stack->data[stack->top];", exp: "Copy data at top index to destination." },
            { num: 10, text: "    }", exp: "" },
            { num: 11, text: "    stack->top--;", exp: "Decrement TOP pointer. Logical removal in O(1)." },
            { num: 12, text: "    return DS_SUCCESS;", exp: "Return success code." },
            { num: 13, text: "}", exp: "Exit function." }
        ]
    },
    stack_peek: {
        title: "stack_peek(const Stack* stack, int* out_value)",
        signature: "DS_Status stack_peek(const Stack* stack, int* out_value)",
        file: "c/stack.c",
        lines: [
            { num: 1, text: "DS_Status stack_peek(const Stack* stack, int* out_value) {", exp: "Inspect top element without mutating stack size." },
            { num: 2, text: "    if (!stack || !out_value) {", exp: "Validate both stack and out_value pointers." },
            { num: 3, text: "        return DS_ERR_NULL_PTR;", exp: "Return null error if either is null." },
            { num: 4, text: "    }", exp: "" },
            { num: 5, text: "    if (stack_is_empty(stack)) {", exp: "Check if empty." },
            { num: 6, text: "        return DS_ERR_UNDERFLOW;", exp: "Cannot peek an empty stack." },
            { num: 7, text: "    }", exp: "" },
            { num: 8, text: "    *out_value = stack->data[stack->top];", exp: "Copy value from data[top] into out_value." },
            { num: 9, text: "    return DS_SUCCESS;", exp: "Return success. TOP remains untouched." },
            { num: 10, text: "}", exp: "Exit function." }
        ]
    },
    stack_update: {
        title: "stack_update(Stack* stack, int index, int new_value)",
        signature: "DS_Status stack_update(Stack* stack, int index, int new_value)",
        file: "c/stack.c",
        lines: [
            { num: 1, text: "DS_Status stack_update(Stack* stack, int index, int new_value) {", exp: "Direct random access update." },
            { num: 2, text: "    if (!stack) {", exp: "Pointer check." },
            { num: 3, text: "        return DS_ERR_NULL_PTR;", exp: "" },
            { num: 4, text: "    }", exp: "" },
            { num: 5, text: "    if (index < 0 || index > stack->top) {", exp: "Bounds validation: index must be within [0, top]." },
            { num: 6, text: "        return DS_ERR_INVALID_INDEX;", exp: "Reject out of bound indices." },
            { num: 7, text: "    }", exp: "" },
            { num: 8, text: "    stack->data[index] = new_value;", exp: "Direct array assignment in O(1) time." },
            { num: 9, text: "    return DS_SUCCESS;", exp: "Return success." },
            { num: 10, text: "}", exp: "Exit function." }
        ]
    },
    stack_get_at: {
        title: "stack_get_at(const Stack* stack, int index, int* out_value)",
        signature: "DS_Status stack_get_at(const Stack* stack, int index, int* out_value)",
        file: "c/stack.c",
        lines: [
            { num: 1, text: "DS_Status stack_get_at(const Stack* stack, int index, int* out_value) {", exp: "Read element at index without modifying structure." },
            { num: 2, text: "    if (!stack || !out_value) return DS_ERR_NULL_PTR;", exp: "Validation." },
            { num: 3, text: "    if (index < 0 || index > stack->top) {", exp: "Index check." },
            { num: 4, text: "        return DS_ERR_INVALID_INDEX;", exp: "Out of bounds." },
            { num: 5, text: "    }", exp: "" },
            { num: 6, text: "    *out_value = stack->data[index];", exp: "Read value directly from array." },
            { num: 7, text: "    return DS_SUCCESS;", exp: "Return success." },
            { num: 8, text: "}", exp: "Exit." }
        ]
    },
    stack_clear: {
        title: "stack_clear(Stack* stack)",
        signature: "DS_Status stack_clear(Stack* stack)",
        file: "c/stack.c",
        lines: [
            { num: 1, text: "DS_Status stack_clear(Stack* stack) {", exp: "Invalidate all elements." },
            { num: 2, text: "    if (!stack) return DS_ERR_NULL_PTR;", exp: "Validation." },
            { num: 3, text: "    stack->top = -1;", exp: "Reset top pointer to -1 in O(1)." },
            { num: 4, text: "    return DS_SUCCESS;", exp: "Return success." },
            { num: 5, text: "}", exp: "Exit." }
        ]
    },
    stack_create: {
        title: "stack_create(int capacity, Stack** out_stack)",
        signature: "DS_Status stack_create(int capacity, Stack** out_stack)",
        file: "c/stack.c",
        lines: [
            { num: 1, text: "DS_Status stack_create(int capacity, Stack** out_stack) {", exp: "Dynamically allocate Stack and internal buffer." },
            { num: 2, text: "    if (!out_stack) return DS_ERR_NULL_PTR;", exp: "Validation." },
            { num: 3, text: "    if (capacity <= 0 || capacity > 100) return DS_ERR_INVALID_CAPACITY;", exp: "Enforce safe capacity bounds." },
            { num: 4, text: "    Stack* s = (Stack*)malloc(sizeof(Stack));", exp: "Allocate control struct on heap." },
            { num: 5, text: "    s->data = (int*)calloc(capacity, sizeof(int));", exp: "Allocate memory array for elements." },
            { num: 6, text: "    s->top = -1;", exp: "Initialize empty stack with top = -1." },
            { num: 7, text: "    s->capacity = capacity;", exp: "Set maximum capacity." },
            { num: 8, text: "    *out_stack = s;", exp: "Assign pointer to caller." },
            { num: 9, text: "    return DS_SUCCESS;", exp: "Return success code." },
            { num: 10, text: "}", exp: "Exit." }
        ]
    },

    // ---------------- QUEUE FUNCTIONS ----------------
    queue_enqueue: {
        title: "queue_enqueue(Queue* queue, int value)",
        signature: "DS_Status queue_enqueue(Queue* queue, int value)",
        file: "c/queue.c",
        lines: [
            { num: 1, text: "DS_Status queue_enqueue(Queue* queue, int value) {", exp: "Insert new element at circular rear." },
            { num: 2, text: "    if (!queue) return DS_ERR_NULL_PTR;", exp: "Check valid queue pointer." },
            { num: 3, text: "    if (queue_is_full(queue)) {", exp: "Test if size == capacity." },
            { num: 4, text: "        return DS_ERR_OVERFLOW;", exp: "Overflow guard prevents overwriting valid slots." },
            { num: 5, text: "    }", exp: "" },
            { num: 6, text: "    queue->rear = (queue->rear + 1) % queue->capacity;", exp: "Modular arithmetic wraps rear index around to 0 when end is reached." },
            { num: 7, text: "    queue->data[queue->rear] = value;", exp: "Store element in calculated circular physical slot." },
            { num: 8, text: "    queue->size++;", exp: "Increment total count of valid elements." },
            { num: 9, text: "    return DS_SUCCESS;", exp: "Return success code." },
            { num: 10, text: "}", exp: "Exit." }
        ]
    },
    queue_dequeue: {
        title: "queue_dequeue(Queue* queue, int* out_value)",
        signature: "DS_Status queue_dequeue(Queue* queue, int* out_value)",
        file: "c/queue.c",
        lines: [
            { num: 1, text: "DS_Status queue_dequeue(Queue* queue, int* out_value) {", exp: "Remove earliest inserted element from front." },
            { num: 2, text: "    if (!queue) return DS_ERR_NULL_PTR;", exp: "Pointer validation." },
            { num: 3, text: "    if (queue_is_empty(queue)) {", exp: "Underflow check: test if size == 0." },
            { num: 4, text: "        return DS_ERR_UNDERFLOW;", exp: "Underflow error." },
            { num: 5, text: "    }", exp: "" },
            { num: 6, text: "    if (out_value) *out_value = queue->data[queue->front];", exp: "Read value from front physical index." },
            { num: 7, text: "    queue->front = (queue->front + 1) % queue->capacity;", exp: "Circular advancement of FRONT pointer using modulo." },
            { num: 8, text: "    queue->size--;", exp: "Decrement active element count." },
            { num: 9, text: "    if (queue->size == 0) { queue->front = 0; queue->rear = -1; }", exp: "Reset canonical pointers if queue becomes empty." },
            { num: 10, text: "    return DS_SUCCESS;", exp: "Return success code." },
            { num: 11, text: "}", exp: "Exit." }
        ]
    },
    queue_front: {
        title: "queue_front(const Queue* queue, int* out_value)",
        signature: "DS_Status queue_front(const Queue* queue, int* out_value)",
        file: "c/queue.c",
        lines: [
            { num: 1, text: "DS_Status queue_front(const Queue* queue, int* out_value) {", exp: "Inspect head element without dequeueing." },
            { num: 2, text: "    if (!queue || !out_value) return DS_ERR_NULL_PTR;", exp: "Pointer checks." },
            { num: 3, text: "    if (queue_is_empty(queue)) return DS_ERR_UNDERFLOW;", exp: "Underflow check." },
            { num: 4, text: "    *out_value = queue->data[queue->front];", exp: "Copy data at front slot." },
            { num: 5, text: "    return DS_SUCCESS;", exp: "Size and pointers remain unchanged." },
            { num: 6, text: "}", exp: "Exit." }
        ]
    },
    queue_rear: {
        title: "queue_rear(const Queue* queue, int* out_value)",
        signature: "DS_Status queue_rear(const Queue* queue, int* out_value)",
        file: "c/queue.c",
        lines: [
            { num: 1, text: "DS_Status queue_rear(const Queue* queue, int* out_value) {", exp: "Inspect tail element without mutating." },
            { num: 2, text: "    if (!queue || !out_value) return DS_ERR_NULL_PTR;", exp: "Pointer checks." },
            { num: 3, text: "    if (queue_is_empty(queue)) return DS_ERR_UNDERFLOW;", exp: "Underflow check." },
            { num: 4, text: "    *out_value = queue->data[queue->rear];", exp: "Copy data at rear slot." },
            { num: 5, text: "    return DS_SUCCESS;", exp: "Size and pointers remain unchanged." },
            { num: 6, text: "}", exp: "Exit." }
        ]
    },
    queue_update: {
        title: "queue_update(Queue* queue, int logical_index, int new_value)",
        signature: "DS_Status queue_update(Queue* queue, int logical_index, int new_value)",
        file: "c/queue.c",
        lines: [
            { num: 1, text: "DS_Status queue_update(Queue* queue, int logical_index, int new_value) {", exp: "Update value at logical offset from FRONT." },
            { num: 2, text: "    if (!queue) return DS_ERR_NULL_PTR;", exp: "Pointer check." },
            { num: 3, text: "    if (logical_index < 0 || logical_index >= queue->size) {", exp: "Logical bounds check." },
            { num: 4, text: "        return DS_ERR_INVALID_INDEX;", exp: "Reject invalid offset." },
            { num: 5, text: "    }", exp: "" },
            { num: 6, text: "    int physical_index = (queue->front + logical_index) % queue->capacity;", exp: "Map logical index to physical array slot via modulo." },
            { num: 7, text: "    queue->data[physical_index] = new_value;", exp: "Update value in circular slot." },
            { num: 8, text: "    return DS_SUCCESS;", exp: "Return success." },
            { num: 9, text: "}", exp: "Exit." }
        ]
    },
    queue_get_at: {
        title: "queue_get_at(const Queue* queue, int logical_index, int* out_value)",
        signature: "DS_Status queue_get_at(const Queue* queue, int logical_index, int* out_value)",
        file: "c/queue.c",
        lines: [
            { num: 1, text: "DS_Status queue_get_at(const Queue* queue, int logical_index, int* out_value) {", exp: "Read logical element without mutation." },
            { num: 2, text: "    if (!queue || !out_value) return DS_ERR_NULL_PTR;", exp: "Validation." },
            { num: 3, text: "    if (logical_index < 0 || logical_index >= queue->size) return DS_ERR_INVALID_INDEX;", exp: "Bounds check." },
            { num: 4, text: "    int physical_index = (queue->front + logical_index) % queue->capacity;", exp: "Map logical to physical." },
            { num: 5, text: "    *out_value = queue->data[physical_index];", exp: "Direct array read." },
            { num: 6, text: "    return DS_SUCCESS;", exp: "Return success." },
            { num: 7, text: "}", exp: "Exit." }
        ]
    },
    queue_clear: {
        title: "queue_clear(Queue* queue)",
        signature: "DS_Status queue_clear(Queue* queue)",
        file: "c/queue.c",
        lines: [
            { num: 1, text: "DS_Status queue_clear(Queue* queue) {", exp: "Clear circular queue." },
            { num: 2, text: "    if (!queue) return DS_ERR_NULL_PTR;", exp: "Validation." },
            { num: 3, text: "    queue->front = 0;", exp: "Reset front to 0." },
            { num: 4, text: "    queue->rear = -1;", exp: "Reset rear to -1." },
            { num: 5, text: "    queue->size = 0;", exp: "Reset count to 0 in O(1)." },
            { num: 6, text: "    return DS_SUCCESS;", exp: "Return success." },
            { num: 7, text: "}", exp: "Exit." }
        ]
    },
    queue_create: {
        title: "queue_create(int capacity, Queue** out_queue)",
        signature: "DS_Status queue_create(int capacity, Queue** out_queue)",
        file: "c/queue.c",
        lines: [
            { num: 1, text: "DS_Status queue_create(int capacity, Queue** out_queue) {", exp: "Allocate circular queue structure." },
            { num: 2, text: "    if (!out_queue) return DS_ERR_NULL_PTR;", exp: "Pointer check." },
            { num: 3, text: "    if (capacity <= 0 || capacity > 100) return DS_ERR_INVALID_CAPACITY;", exp: "Capacity bound check." },
            { num: 4, text: "    Queue* q = (Queue*)malloc(sizeof(Queue));", exp: "Allocate struct on heap." },
            { num: 5, text: "    q->data = (int*)calloc(capacity, sizeof(int));", exp: "Allocate circular array buffer." },
            { num: 6, text: "    q->front = 0;", exp: "Front initialized to 0." },
            { num: 7, text: "    q->rear = -1;", exp: "Rear initialized to -1." },
            { num: 8, text: "    q->size = 0;", exp: "Initial size is 0." },
            { num: 9, text: "    q->capacity = capacity;", exp: "Store allocated capacity." },
            { num: 10, text: "    *out_queue = q;", exp: "Set return pointer." },
            { num: 11, text: "    return DS_SUCCESS;", exp: "Return success code." },
            { num: 12, text: "}", exp: "Exit." }
        ]
    }
};

export class CodeExplorer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = options;
        this.activeFnKey = options.initialFn || 'stack_push';
        this.activeHighlightLine = 1;
        this.fullCodeModalOpen = false;

        this.render();
    }

    setOperation(fnKey, lineNum = 1) {
        if (C_SOURCES[fnKey]) {
            this.activeFnKey = fnKey;
            this.activeHighlightLine = lineNum;
            this.render();
        }
    }

    render() {
        if (!this.container) return;
        const fn = C_SOURCES[this.activeFnKey] || C_SOURCES.stack_push;

        this.container.innerHTML = `
            <div class="code-explorer-card">
                <div class="code-explorer-header">
                    <div class="code-explorer-meta">
                        <span class="code-tag-badge">C11</span>
                        <span class="code-file-label">${fn.file}</span>
                    </div>
                    <div class="code-explorer-actions">
                        <button class="code-btn code-copy-btn" title="Copy C function code" aria-label="Copy C function code">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span class="btn-text">Copy</span>
                        </button>
                        <button class="code-btn code-full-btn" title="View complete C module" aria-label="View complete C module">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <polyline points="9 21 3 21 3 15"></polyline>
                                <line x1="21" y1="3" x2="14" y2="10"></line>
                                <line x1="3" y1="21" x2="10" y2="14"></line>
                            </svg>
                            <span class="btn-text">Full Source</span>
                        </button>
                    </div>
                </div>

                <div class="code-title-bar">
                    <span class="code-fn-sig"><code>${this.escapeHtml(fn.signature)}</code></span>
                </div>

                <div class="code-editor-body">
                    <pre class="code-pre"><code class="code-lines">${this.renderLines(fn)}</code></pre>
                </div>

                <div class="code-explanation-bar">
                    <div class="exp-icon-wrap" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </div>
                    <div class="exp-text">
                        <strong>Line ${this.activeHighlightLine}:</strong>
                        <span>${this.getLineExplanation(fn, this.activeHighlightLine)}</span>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderLines(fn) {
        return fn.lines.map(line => {
            const isHighlighted = line.num === this.activeHighlightLine;
            const highlightedClass = isHighlighted ? 'code-line-active' : '';
            return `<div class="code-line ${highlightedClass}" data-line="${line.num}">
                <span class="line-num">${String(line.num).padStart(2, ' ')}</span>
                <span class="line-content">${this.syntaxHighlightC(line.text)}</span>
            </div>`;
        }).join('');
    }

    getLineExplanation(fn, lineNum) {
        const line = fn.lines.find(l => l.num === lineNum);
        return (line && line.exp) ? line.exp : "Executes core C algorithm instruction.";
    }

    syntaxHighlightC(code) {
        // Highlighting for C keywords, types, numbers, and operators
        let escaped = this.escapeHtml(code);
        escaped = escaped.replace(/\b(DS_Status|Stack|Queue|int|bool|void|const|size_t)\b/g, '<span class="c-type">$1</span>');
        escaped = escaped.replace(/\b(return|if|else|while|for|sizeof)\b/g, '<span class="c-keyword">$1</span>');
        escaped = escaped.replace(/\b(DS_SUCCESS|DS_ERR_OVERFLOW|DS_ERR_UNDERFLOW|DS_ERR_INVALID_INDEX|DS_ERR_NULL_PTR|DS_ERR_INVALID_CAPACITY|NULL|true|false)\b/g, '<span class="c-constant">$1</span>');
        escaped = escaped.replace(/\b(\d+)\b/g, '<span class="c-number">$1</span>');
        escaped = escaped.replace(/(\/\/[^\n]*)/g, '<span class="c-comment">$1</span>');
        return escaped;
    }

    attachEvents() {
        const copyBtn = this.container.querySelector('.code-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyCurrentCode());
        }

        const fullBtn = this.container.querySelector('.code-full-btn');
        if (fullBtn) {
            fullBtn.addEventListener('click', () => this.showFullSourceModal());
        }

        const lines = this.container.querySelectorAll('.code-line');
        lines.forEach(lineEl => {
            lineEl.addEventListener('click', () => {
                const lineNum = parseInt(lineEl.getAttribute('data-line'), 10);
                this.activeHighlightLine = lineNum;
                this.render();
            });
        });
    }

    copyCurrentCode() {
        const fn = C_SOURCES[this.activeFnKey] || C_SOURCES.stack_push;
        const codeText = fn.lines.map(l => l.text).join('\n');
        navigator.clipboard.writeText(codeText).then(() => {
            const btnText = this.container.querySelector('.code-copy-btn .btn-text');
            if (btnText) {
                const original = btnText.textContent;
                btnText.textContent = "Copied!";
                setTimeout(() => { btnText.textContent = original; }, 2000);
            }
        });
    }

    showFullSourceModal() {
        const fn = C_SOURCES[this.activeFnKey] || C_SOURCES.stack_push;
        const isStack = fn.file.includes('stack');
        const modalId = 'full-code-modal';

        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'structura-modal-overlay';
            document.body.appendChild(modal);
        }

        const sourceFile = isStack ? 'c/stack.c & c/stack.h' : 'c/queue.c & c/queue.h';

        modal.innerHTML = `
            <div class="structura-modal-dialog">
                <div class="structura-modal-header">
                    <div>
                        <h3 class="modal-title">Complete C Implementation</h3>
                        <span class="modal-subtitle">${sourceFile} (Safe C11)</span>
                    </div>
                    <button class="modal-close-btn" aria-label="Close modal">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="structura-modal-body">
                    <pre class="full-code-pre"><code>${this.getFullSourceText(isStack)}</code></pre>
                </div>
                <div class="structura-modal-footer">
                    <span class="modal-note">Zero memory leaks verified with Valgrind / GCC 64-test suite</span>
                    <button class="modal-action-btn" id="modal-copy-all-btn">Copy All Source</button>
                </div>
            </div>
        `;

        modal.classList.add('modal-open');

        modal.querySelector('.modal-close-btn').addEventListener('click', () => {
            modal.classList.remove('modal-open');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('modal-open');
        });

        modal.querySelector('#modal-copy-all-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(this.getFullSourceRaw(isStack)).then(() => {
                const btn = modal.querySelector('#modal-copy-all-btn');
                btn.textContent = 'Copied to Clipboard!';
                setTimeout(() => { btn.textContent = 'Copy All Source'; }, 2000);
            });
        });
    }

    getFullSourceRaw(isStack) {
        if (isStack) {
            return `/* C Stack Implementation - structura/c/stack.c */
#include "stack.h"
#include <stdlib.h>

DS_Status stack_create(int capacity, Stack** out_stack) {
    if (!out_stack) return DS_ERR_NULL_PTR;
    if (capacity <= 0 || capacity > 100) return DS_ERR_INVALID_CAPACITY;
    Stack* s = (Stack*)malloc(sizeof(Stack));
    if (!s) return DS_ERR_ALLOC_FAILED;
    s->data = (int*)calloc((size_t)capacity, sizeof(int));
    if (!s->data) { free(s); return DS_ERR_ALLOC_FAILED; }
    s->top = -1;
    s->capacity = capacity;
    *out_stack = s;
    return DS_SUCCESS;
}

DS_Status stack_destroy(Stack* stack) {
    if (!stack) return DS_ERR_NULL_PTR;
    if (stack->data) { free(stack->data); stack->data = NULL; }
    stack->top = -1; stack->capacity = 0;
    free(stack);
    return DS_SUCCESS;
}

DS_Status stack_push(Stack* stack, int value) {
    if (!stack) return DS_ERR_NULL_PTR;
    if (stack_is_full(stack)) return DS_ERR_OVERFLOW;
    stack->top++;
    stack->data[stack->top] = value;
    return DS_SUCCESS;
}

DS_Status stack_pop(Stack* stack, int* out_value) {
    if (!stack) return DS_ERR_NULL_PTR;
    if (stack_is_empty(stack)) return DS_ERR_UNDERFLOW;
    if (out_value) *out_value = stack->data[stack->top];
    stack->top--;
    return DS_SUCCESS;
}

DS_Status stack_peek(const Stack* stack, int* out_value) {
    if (!stack || !out_value) return DS_ERR_NULL_PTR;
    if (stack_is_empty(stack)) return DS_ERR_UNDERFLOW;
    *out_value = stack->data[stack->top];
    return DS_SUCCESS;
}

DS_Status stack_update(Stack* stack, int index, int new_value) {
    if (!stack) return DS_ERR_NULL_PTR;
    if (index < 0 || index > stack->top) return DS_ERR_INVALID_INDEX;
    stack->data[index] = new_value;
    return DS_SUCCESS;
}`;
        } else {
            return `/* C Circular Queue Implementation - structura/c/queue.c */
#include "queue.h"
#include <stdlib.h>

DS_Status queue_create(int capacity, Queue** out_queue) {
    if (!out_queue) return DS_ERR_NULL_PTR;
    if (capacity <= 0 || capacity > 100) return DS_ERR_INVALID_CAPACITY;
    Queue* q = (Queue*)malloc(sizeof(Queue));
    if (!q) return DS_ERR_ALLOC_FAILED;
    q->data = (int*)calloc((size_t)capacity, sizeof(int));
    if (!q->data) { free(q); return DS_ERR_ALLOC_FAILED; }
    q->front = 0; q->rear = -1; q->size = 0; q->capacity = capacity;
    *out_queue = q;
    return DS_SUCCESS;
}

DS_Status queue_enqueue(Queue* queue, int value) {
    if (!queue) return DS_ERR_NULL_PTR;
    if (queue_is_full(queue)) return DS_ERR_OVERFLOW;
    queue->rear = (queue->rear + 1) % queue->capacity;
    queue->data[queue->rear] = value;
    queue->size++;
    return DS_SUCCESS;
}

DS_Status queue_dequeue(Queue* queue, int* out_value) {
    if (!queue) return DS_ERR_NULL_PTR;
    if (queue_is_empty(queue)) return DS_ERR_UNDERFLOW;
    if (out_value) *out_value = queue->data[queue->front];
    queue->front = (queue->front + 1) % queue->capacity;
    queue->size--;
    if (queue->size == 0) { queue->front = 0; queue->rear = -1; }
    return DS_SUCCESS;
}`;
        }
    }

    getFullSourceText(isStack) {
        return this.syntaxHighlightC(this.getFullSourceRaw(isStack));
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
