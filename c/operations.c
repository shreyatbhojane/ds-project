#include "operations.h"
#include "stack.h"
#include "queue.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

const char* ds_status_to_string(DS_Status status) {
    switch (status) {
        case DS_SUCCESS:
            return "Operation successful (DS_SUCCESS)";
        case DS_ERR_OVERFLOW:
            return "Error: Overflow. Capacity limit reached (DS_ERR_OVERFLOW)";
        case DS_ERR_UNDERFLOW:
            return "Error: Underflow. Data structure is empty (DS_ERR_UNDERFLOW)";
        case DS_ERR_INVALID_INDEX:
            return "Error: Invalid index out of bounds (DS_ERR_INVALID_INDEX)";
        case DS_ERR_NULL_PTR:
            return "Error: Null pointer reference (DS_ERR_NULL_PTR)";
        case DS_ERR_INVALID_CAPACITY:
            return "Error: Invalid capacity requested (DS_ERR_INVALID_CAPACITY)";
        case DS_ERR_ALLOC_FAILED:
            return "Error: Dynamic memory allocation failed (DS_ERR_ALLOC_FAILED)";
        default:
            return "Unknown status code";
    }
}

/* =========================================================================
 * Managed Instances and WASM / Bridge Interface
 * Exposes safe, validated endpoints for browser WebAssembly or FFI
 * ========================================================================= */

static Stack* g_active_stack = NULL;
static Queue* g_active_queue = NULL;
static DS_Status g_last_status = DS_SUCCESS;

/* Shared export buffers to safely transfer snapshots across the WASM boundary */
#define STRUCTURA_BUFFER_MAX 64
static int g_export_data[STRUCTURA_BUFFER_MAX];
static int g_export_occupied[STRUCTURA_BUFFER_MAX];

/* Status Query */
int structura_get_last_status(void) {
    return (int)g_last_status;
}

const char* structura_get_last_status_msg(void) {
    return ds_status_to_string(g_last_status);
}

/* ---------------- Stack WASM Bridge ---------------- */

int structura_stack_init(int capacity) {
    if (g_active_stack) {
        stack_destroy(g_active_stack);
        g_active_stack = NULL;
    }
    g_last_status = stack_create(capacity, &g_active_stack);
    return (int)g_last_status;
}

int structura_stack_push(int value) {
    if (!g_active_stack) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    g_last_status = stack_push(g_active_stack, value);
    return (int)g_last_status;
}

int structura_stack_pop(int* out_val) {
    if (!g_active_stack) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    int val = 0;
    g_last_status = stack_pop(g_active_stack, &val);
    if (out_val) *out_val = val;
    return (int)g_last_status;
}

int structura_stack_peek(int* out_val) {
    if (!g_active_stack) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    int val = 0;
    g_last_status = stack_peek(g_active_stack, &val);
    if (out_val) *out_val = val;
    return (int)g_last_status;
}

int structura_stack_update(int index, int new_val) {
    if (!g_active_stack) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    g_last_status = stack_update(g_active_stack, index, new_val);
    return (int)g_last_status;
}

int structura_stack_get_at(int index, int* out_val) {
    if (!g_active_stack) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    int val = 0;
    g_last_status = stack_get_at(g_active_stack, index, &val);
    if (out_val) *out_val = val;
    return (int)g_last_status;
}

int structura_stack_size(void) {
    return stack_size(g_active_stack);
}

int structura_stack_capacity(void) {
    return stack_capacity(g_active_stack);
}

int structura_stack_top_index(void) {
    return stack_get_top_index(g_active_stack);
}

int structura_stack_is_empty(void) {
    return stack_is_empty(g_active_stack) ? 1 : 0;
}

int structura_stack_is_full(void) {
    return stack_is_full(g_active_stack) ? 1 : 0;
}

int structura_stack_clear(void) {
    if (!g_active_stack) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    g_last_status = stack_clear(g_active_stack);
    return (int)g_last_status;
}

/* Returns pointer to internal buffer of stack values [0 .. size-1] */
int* structura_stack_export_elements(int* out_count) {
    if (!g_active_stack) {
        if (out_count) *out_count = 0;
        return NULL;
    }
    int count = 0;
    g_last_status = stack_copy_data(g_active_stack, g_export_data, STRUCTURA_BUFFER_MAX, &count);
    if (out_count) *out_count = count;
    return g_export_data;
}

/* ---------------- Queue WASM Bridge ---------------- */

int structura_queue_init(int capacity) {
    if (g_active_queue) {
        queue_destroy(g_active_queue);
        g_active_queue = NULL;
    }
    g_last_status = queue_create(capacity, &g_active_queue);
    return (int)g_last_status;
}

int structura_queue_enqueue(int value) {
    if (!g_active_queue) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    g_last_status = queue_enqueue(g_active_queue, value);
    return (int)g_last_status;
}

int structura_queue_dequeue(int* out_val) {
    if (!g_active_queue) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    int val = 0;
    g_last_status = queue_dequeue(g_active_queue, &val);
    if (out_val) *out_val = val;
    return (int)g_last_status;
}

int structura_queue_front(int* out_val) {
    if (!g_active_queue) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    int val = 0;
    g_last_status = queue_front(g_active_queue, &val);
    if (out_val) *out_val = val;
    return (int)g_last_status;
}

int structura_queue_rear(int* out_val) {
    if (!g_active_queue) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    int val = 0;
    g_last_status = queue_rear(g_active_queue, &val);
    if (out_val) *out_val = val;
    return (int)g_last_status;
}

int structura_queue_update(int logical_index, int new_val) {
    if (!g_active_queue) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    g_last_status = queue_update(g_active_queue, logical_index, new_val);
    return (int)g_last_status;
}

int structura_queue_update_physical(int physical_index, int new_val) {
    if (!g_active_queue) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    g_last_status = queue_update_physical(g_active_queue, physical_index, new_val);
    return (int)g_last_status;
}

int structura_queue_get_at(int logical_index, int* out_val) {
    if (!g_active_queue) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    int val = 0;
    g_last_status = queue_get_at(g_active_queue, logical_index, &val);
    if (out_val) *out_val = val;
    return (int)g_last_status;
}

int structura_queue_size(void) {
    return queue_size(g_active_queue);
}

int structura_queue_capacity(void) {
    return queue_capacity(g_active_queue);
}

int structura_queue_front_index(void) {
    return queue_get_front_index(g_active_queue);
}

int structura_queue_rear_index(void) {
    return queue_get_rear_index(g_active_queue);
}

int structura_queue_is_empty(void) {
    return queue_is_empty(g_active_queue) ? 1 : 0;
}

int structura_queue_is_full(void) {
    return queue_is_full(g_active_queue) ? 1 : 0;
}

int structura_queue_clear(void) {
    if (!g_active_queue) {
        g_last_status = DS_ERR_NULL_PTR;
        return (int)g_last_status;
    }
    g_last_status = queue_clear(g_active_queue);
    return (int)g_last_status;
}

int* structura_queue_export_logical(int* out_count) {
    if (!g_active_queue) {
        if (out_count) *out_count = 0;
        return NULL;
    }
    int count = 0;
    g_last_status = queue_copy_logical(g_active_queue, g_export_data, STRUCTURA_BUFFER_MAX, &count);
    if (out_count) *out_count = count;
    return g_export_data;
}

int* structura_queue_export_physical_data(void) {
    if (!g_active_queue) return NULL;
    bool occ[STRUCTURA_BUFFER_MAX];
    g_last_status = queue_copy_physical(g_active_queue, g_export_data, occ, STRUCTURA_BUFFER_MAX);
    for (int i = 0; i < g_active_queue->capacity; i++) {
        g_export_occupied[i] = occ[i] ? 1 : 0;
    }
    return g_export_data;
}

int* structura_queue_export_physical_occupied(void) {
    return g_export_occupied;
}
