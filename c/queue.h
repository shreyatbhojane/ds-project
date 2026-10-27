#ifndef STRUCTURA_QUEUE_H
#define STRUCTURA_QUEUE_H

#include "operations.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Circular Queue structure representation using a fixed-capacity circular buffer.
 * FIFO: First In, First Out.
 * Uses modular arithmetic: (index + 1) % capacity.
 */
typedef struct Queue {
    int* data;          /* Heap-allocated buffer holding circular slots */
    int front;          /* Physical index of front element (0 to capacity-1) */
    int rear;           /* Physical index of rear element (0 to capacity-1) */
    int size;           /* Current count of valid elements in queue */
    int capacity;       /* Fixed allocated capacity of the array */
} Queue;

/* Lifecycle */
DS_Status queue_create(int capacity, Queue** out_queue);
DS_Status queue_destroy(Queue* queue);
DS_Status queue_clear(Queue* queue);

/* Core FIFO Operations */
DS_Status queue_enqueue(Queue* queue, int value);
DS_Status queue_dequeue(Queue* queue, int* out_value);
DS_Status queue_front(const Queue* queue, int* out_value);
DS_Status queue_rear(const Queue* queue, int* out_value);

/* Inspection and CRUD */
DS_Status queue_update(Queue* queue, int logical_index, int new_value);
DS_Status queue_update_physical(Queue* queue, int physical_index, int new_value);
DS_Status queue_get_at(const Queue* queue, int logical_index, int* out_value);
DS_Status queue_get_physical_at(const Queue* queue, int physical_index, int* out_value, bool* out_occupied);

int       queue_size(const Queue* queue);
int       queue_capacity(const Queue* queue);
int       queue_get_front_index(const Queue* queue);
int       queue_get_rear_index(const Queue* queue);
bool      queue_is_empty(const Queue* queue);
bool      queue_is_full(const Queue* queue);

/* Physical slot occupied check */
bool      queue_is_slot_occupied(const Queue* queue, int physical_index);

/* Snapshot copies for UI and testing */
DS_Status queue_copy_logical(const Queue* queue, int* out_buffer, int buffer_size, int* out_count);
DS_Status queue_copy_physical(const Queue* queue, int* out_data, bool* out_occupied, int buffer_size);

#ifdef __cplusplus
}
#endif

#endif /* STRUCTURA_QUEUE_H */
