#ifndef STRUCTURA_STACK_H
#define STRUCTURA_STACK_H

#include "operations.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Stack structure representation using dynamic fixed-capacity array.
 * LIFO: Last In, First Out.
 */
typedef struct Stack {
    int* data;          /* Heap-allocated buffer holding elements */
    int top;            /* Index of top element (-1 when empty) */
    int capacity;       /* Maximum allowable elements */
} Stack;

/* Lifecycle */
DS_Status stack_create(int capacity, Stack** out_stack);
DS_Status stack_destroy(Stack* stack);
DS_Status stack_clear(Stack* stack);

/* Core LIFO Operations */
DS_Status stack_push(Stack* stack, int value);
DS_Status stack_pop(Stack* stack, int* out_value);
DS_Status stack_peek(const Stack* stack, int* out_value);

/* Inspection and CRUD */
DS_Status stack_update(Stack* stack, int index, int new_value);
DS_Status stack_get_at(const Stack* stack, int index, int* out_value);
int       stack_size(const Stack* stack);
int       stack_capacity(const Stack* stack);
int       stack_get_top_index(const Stack* stack);
bool      stack_is_empty(const Stack* stack);
bool      stack_is_full(const Stack* stack);

/* Memory snapshot for UI / WASM bridge */
DS_Status stack_copy_data(const Stack* stack, int* out_buffer, int buffer_size, int* out_count);

#ifdef __cplusplus
}
#endif

#endif /* STRUCTURA_STACK_H */
