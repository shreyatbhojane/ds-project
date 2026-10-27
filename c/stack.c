#include "stack.h"
#include <stdlib.h>

DS_Status stack_create(int capacity, Stack** out_stack) {
    if (!out_stack) {
        return DS_ERR_NULL_PTR;
    }
    if (capacity <= 0 || capacity > 100) {
        return DS_ERR_INVALID_CAPACITY;
    }

    Stack* s = (Stack*)malloc(sizeof(Stack));
    if (!s) {
        return DS_ERR_ALLOC_FAILED;
    }

    s->data = (int*)calloc((size_t)capacity, sizeof(int));
    if (!s->data) {
        free(s);
        return DS_ERR_ALLOC_FAILED;
    }

    s->top = -1;
    s->capacity = capacity;
    *out_stack = s;
    return DS_SUCCESS;
}

DS_Status stack_destroy(Stack* stack) {
    if (!stack) {
        return DS_ERR_NULL_PTR;
    }
    if (stack->data) {
        free(stack->data);
        stack->data = NULL;
    }
    stack->top = -1;
    stack->capacity = 0;
    free(stack);
    return DS_SUCCESS;
}

DS_Status stack_clear(Stack* stack) {
    if (!stack) {
        return DS_ERR_NULL_PTR;
    }
    stack->top = -1;
    return DS_SUCCESS;
}

DS_Status stack_push(Stack* stack, int value) {
    if (!stack) {
        return DS_ERR_NULL_PTR;
    }
    if (stack_is_full(stack)) {
        return DS_ERR_OVERFLOW;
    }
    stack->top++;
    stack->data[stack->top] = value;
    return DS_SUCCESS;
}

DS_Status stack_pop(Stack* stack, int* out_value) {
    if (!stack) {
        return DS_ERR_NULL_PTR;
    }
    if (stack_is_empty(stack)) {
        return DS_ERR_UNDERFLOW;
    }
    if (out_value) {
        *out_value = stack->data[stack->top];
    }
    stack->top--;
    return DS_SUCCESS;
}

DS_Status stack_peek(const Stack* stack, int* out_value) {
    if (!stack || !out_value) {
        return DS_ERR_NULL_PTR;
    }
    if (stack_is_empty(stack)) {
        return DS_ERR_UNDERFLOW;
    }
    *out_value = stack->data[stack->top];
    return DS_SUCCESS;
}

DS_Status stack_update(Stack* stack, int index, int new_value) {
    if (!stack) {
        return DS_ERR_NULL_PTR;
    }
    if (index < 0 || index > stack->top) {
        return DS_ERR_INVALID_INDEX;
    }
    stack->data[index] = new_value;
    return DS_SUCCESS;
}

DS_Status stack_get_at(const Stack* stack, int index, int* out_value) {
    if (!stack || !out_value) {
        return DS_ERR_NULL_PTR;
    }
    if (index < 0 || index > stack->top) {
        return DS_ERR_INVALID_INDEX;
    }
    *out_value = stack->data[index];
    return DS_SUCCESS;
}

int stack_size(const Stack* stack) {
    if (!stack) return 0;
    return stack->top + 1;
}

int stack_capacity(const Stack* stack) {
    if (!stack) return 0;
    return stack->capacity;
}

int stack_get_top_index(const Stack* stack) {
    if (!stack) return -1;
    return stack->top;
}

bool stack_is_empty(const Stack* stack) {
    if (!stack) return true;
    return stack->top == -1;
}

bool stack_is_full(const Stack* stack) {
    if (!stack) return false;
    return stack->top >= stack->capacity - 1;
}

DS_Status stack_copy_data(const Stack* stack, int* out_buffer, int buffer_size, int* out_count) {
    if (!stack || !out_buffer || !out_count) {
        return DS_ERR_NULL_PTR;
    }
    int count = stack_size(stack);
    if (buffer_size < count) {
        return DS_ERR_INVALID_CAPACITY;
    }
    for (int i = 0; i < count; i++) {
        out_buffer[i] = stack->data[i];
    }
    *out_count = count;
    return DS_SUCCESS;
}
