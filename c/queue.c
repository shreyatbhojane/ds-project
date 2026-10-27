#include "queue.h"
#include <stdlib.h>

DS_Status queue_create(int capacity, Queue** out_queue) {
    if (!out_queue) {
        return DS_ERR_NULL_PTR;
    }
    if (capacity <= 0 || capacity > 100) {
        return DS_ERR_INVALID_CAPACITY;
    }

    Queue* q = (Queue*)malloc(sizeof(Queue));
    if (!q) {
        return DS_ERR_ALLOC_FAILED;
    }

    q->data = (int*)calloc((size_t)capacity, sizeof(int));
    if (!q->data) {
        free(q);
        return DS_ERR_ALLOC_FAILED;
    }

    q->front = 0;
    q->rear = -1;
    q->size = 0;
    q->capacity = capacity;
    *out_queue = q;
    return DS_SUCCESS;
}

DS_Status queue_destroy(Queue* queue) {
    if (!queue) {
        return DS_ERR_NULL_PTR;
    }
    if (queue->data) {
        free(queue->data);
        queue->data = NULL;
    }
    queue->front = 0;
    queue->rear = -1;
    queue->size = 0;
    queue->capacity = 0;
    free(queue);
    return DS_SUCCESS;
}

DS_Status queue_clear(Queue* queue) {
    if (!queue) {
        return DS_ERR_NULL_PTR;
    }
    queue->front = 0;
    queue->rear = -1;
    queue->size = 0;
    return DS_SUCCESS;
}

DS_Status queue_enqueue(Queue* queue, int value) {
    if (!queue) {
        return DS_ERR_NULL_PTR;
    }
    if (queue_is_full(queue)) {
        return DS_ERR_OVERFLOW;
    }

    /* Advance rear circularly */
    queue->rear = (queue->rear + 1) % queue->capacity;
    queue->data[queue->rear] = value;
    queue->size++;
    return DS_SUCCESS;
}

DS_Status queue_dequeue(Queue* queue, int* out_value) {
    if (!queue) {
        return DS_ERR_NULL_PTR;
    }
    if (queue_is_empty(queue)) {
        return DS_ERR_UNDERFLOW;
    }

    if (out_value) {
        *out_value = queue->data[queue->front];
    }

    /* Advance front circularly */
    queue->front = (queue->front + 1) % queue->capacity;
    queue->size--;

    if (queue->size == 0) {
        /* Reset canonical pointers when queue becomes completely empty */
        queue->front = 0;
        queue->rear = -1;
    }

    return DS_SUCCESS;
}

DS_Status queue_front(const Queue* queue, int* out_value) {
    if (!queue || !out_value) {
        return DS_ERR_NULL_PTR;
    }
    if (queue_is_empty(queue)) {
        return DS_ERR_UNDERFLOW;
    }
    *out_value = queue->data[queue->front];
    return DS_SUCCESS;
}

DS_Status queue_rear(const Queue* queue, int* out_value) {
    if (!queue || !out_value) {
        return DS_ERR_NULL_PTR;
    }
    if (queue_is_empty(queue)) {
        return DS_ERR_UNDERFLOW;
    }
    *out_value = queue->data[queue->rear];
    return DS_SUCCESS;
}

DS_Status queue_update(Queue* queue, int logical_index, int new_value) {
    if (!queue) {
        return DS_ERR_NULL_PTR;
    }
    if (logical_index < 0 || logical_index >= queue->size) {
        return DS_ERR_INVALID_INDEX;
    }
    int physical_index = (queue->front + logical_index) % queue->capacity;
    queue->data[physical_index] = new_value;
    return DS_SUCCESS;
}

DS_Status queue_update_physical(Queue* queue, int physical_index, int new_value) {
    if (!queue) {
        return DS_ERR_NULL_PTR;
    }
    if (physical_index < 0 || physical_index >= queue->capacity) {
        return DS_ERR_INVALID_INDEX;
    }
    if (!queue_is_slot_occupied(queue, physical_index)) {
        return DS_ERR_INVALID_INDEX;
    }
    queue->data[physical_index] = new_value;
    return DS_SUCCESS;
}

DS_Status queue_get_at(const Queue* queue, int logical_index, int* out_value) {
    if (!queue || !out_value) {
        return DS_ERR_NULL_PTR;
    }
    if (logical_index < 0 || logical_index >= queue->size) {
        return DS_ERR_INVALID_INDEX;
    }
    int physical_index = (queue->front + logical_index) % queue->capacity;
    *out_value = queue->data[physical_index];
    return DS_SUCCESS;
}

DS_Status queue_get_physical_at(const Queue* queue, int physical_index, int* out_value, bool* out_occupied) {
    if (!queue || !out_value || !out_occupied) {
        return DS_ERR_NULL_PTR;
    }
    if (physical_index < 0 || physical_index >= queue->capacity) {
        return DS_ERR_INVALID_INDEX;
    }
    bool occ = queue_is_slot_occupied(queue, physical_index);
    *out_occupied = occ;
    *out_value = queue->data[physical_index];
    return DS_SUCCESS;
}

int queue_size(const Queue* queue) {
    if (!queue) return 0;
    return queue->size;
}

int queue_capacity(const Queue* queue) {
    if (!queue) return 0;
    return queue->capacity;
}

int queue_get_front_index(const Queue* queue) {
    if (!queue || queue->size == 0) return -1;
    return queue->front;
}

int queue_get_rear_index(const Queue* queue) {
    if (!queue || queue->size == 0) return -1;
    return queue->rear;
}

bool queue_is_empty(const Queue* queue) {
    if (!queue) return true;
    return queue->size == 0;
}

bool queue_is_full(const Queue* queue) {
    if (!queue) return false;
    return queue->size == queue->capacity;
}

bool queue_is_slot_occupied(const Queue* queue, int physical_index) {
    if (!queue || queue->size == 0) return false;
    if (physical_index < 0 || physical_index >= queue->capacity) return false;

    for (int i = 0; i < queue->size; i++) {
        int idx = (queue->front + i) % queue->capacity;
        if (idx == physical_index) {
            return true;
        }
    }
    return false;
}

DS_Status queue_copy_logical(const Queue* queue, int* out_buffer, int buffer_size, int* out_count) {
    if (!queue || !out_buffer || !out_count) {
        return DS_ERR_NULL_PTR;
    }
    if (buffer_size < queue->size) {
        return DS_ERR_INVALID_CAPACITY;
    }
    for (int i = 0; i < queue->size; i++) {
        out_buffer[i] = queue->data[(queue->front + i) % queue->capacity];
    }
    *out_count = queue->size;
    return DS_SUCCESS;
}

DS_Status queue_copy_physical(const Queue* queue, int* out_data, bool* out_occupied, int buffer_size) {
    if (!queue || !out_data || !out_occupied) {
        return DS_ERR_NULL_PTR;
    }
    if (buffer_size < queue->capacity) {
        return DS_ERR_INVALID_CAPACITY;
    }
    for (int p = 0; p < queue->capacity; p++) {
        out_data[p] = queue->data[p];
        out_occupied[p] = queue_is_slot_occupied(queue, p);
    }
    return DS_SUCCESS;
}
