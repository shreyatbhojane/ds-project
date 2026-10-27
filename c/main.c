#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "operations.h"
#include "stack.h"
#include "queue.h"

static void print_banner(void) {
    printf("===============================================================\n");
    printf("  STRUCTURA -- C Data Structures Engine (CLI Mode)             \n");
    printf("  Core Algorithms: LIFO Stack & Circular FIFO Queue            \n");
    printf("===============================================================\n");
}

static void print_stack_state(const Stack* s) {
    printf("\n--- CURRENT STACK (Top to Bottom) ---\n");
    if (!s || stack_is_empty(s)) {
        printf("  [Empty Stack] (Size: 0, Capacity: %d, TOP: -1)\n", s ? stack_capacity(s) : 0);
        return;
    }
    printf("  Capacity: %d | Size: %d | TOP Index: %d\n", stack_capacity(s), stack_size(s), stack_get_top_index(s));
    for (int i = s->top; i >= 0; i--) {
        int val = 0;
        stack_get_at(s, i, &val);
        if (i == s->top) {
            printf("  [%d] = %4d  <--- [TOP]\n", i, val);
        } else {
            printf("  [%d] = %4d\n", i, val);
        }
    }
    printf("-------------------------------------\n");
}

static void print_queue_state(const Queue* q) {
    printf("\n--- CURRENT CIRCULAR QUEUE ---\n");
    if (!q || queue_is_empty(q)) {
        printf("  [Empty Queue] (Size: 0, Capacity: %d, FRONT: %d, REAR: %d)\n",
               q ? queue_capacity(q) : 0,
               q ? queue_get_front_index(q) : -1,
               q ? queue_get_rear_index(q) : -1);
        return;
    }
    printf("  Capacity: %d | Size: %d | FRONT: %d | REAR: %d\n",
           queue_capacity(q), queue_size(q), queue_get_front_index(q), queue_get_rear_index(q));

    printf("  Logical Order (FIFO): ");
    for (int i = 0; i < queue_size(q); i++) {
        int val = 0;
        queue_get_at(q, i, &val);
        printf("%d%s", val, (i == queue_size(q) - 1) ? "" : " -> ");
    }
    printf("\n  Physical Slots: [ ");
    for (int p = 0; p < queue_capacity(q); p++) {
        int val = 0;
        bool occ = false;
        queue_get_physical_at(q, p, &val, &occ);
        if (occ) {
            printf("%d:%d", p, val);
            if (p == queue_get_front_index(q)) printf("(F)");
            if (p == queue_get_rear_index(q)) printf("(R)");
        } else {
            printf("%d:[empty]", p);
        }
        if (p < queue_capacity(q) - 1) printf(" | ");
    }
    printf(" ]\n");
    printf("------------------------------\n");
}

int main(void) {
    print_banner();

    Stack* s = NULL;
    Queue* q = NULL;
    DS_Status st;

    printf("\n[1] Initializing Stack of capacity 5...\n");
    st = stack_create(5, &s);
    printf("    Result: %s\n", ds_status_to_string(st));

    printf("\n[2] Pushing elements: 10, 20, 30, 40...\n");
    stack_push(s, 10);
    stack_push(s, 20);
    stack_push(s, 30);
    stack_push(s, 40);
    print_stack_state(s);

    int peeked = 0;
    stack_peek(s, &peeked);
    printf("    Peeked value: %d (Size unchanged: %d)\n", peeked, stack_size(s));

    int popped = 0;
    stack_pop(s, &popped);
    printf("    Popped value: %d\n", popped);
    print_stack_state(s);

    printf("\n[3] Initializing Circular Queue of capacity 4...\n");
    st = queue_create(4, &q);
    printf("    Result: %s\n", ds_status_to_string(st));

    printf("\n[4] Enqueuing 100, 200, 300...\n");
    queue_enqueue(q, 100);
    queue_enqueue(q, 200);
    queue_enqueue(q, 300);
    print_queue_state(q);

    int deq = 0;
    queue_dequeue(q, &deq);
    printf("    Dequeued value: %d (Notice FRONT advanced circularly)\n", deq);
    print_queue_state(q);

    printf("\n[5] Enqueuing 400, 500 (Testing Circular Wrap-around)...\n");
    queue_enqueue(q, 400);
    queue_enqueue(q, 500);
    print_queue_state(q);

    printf("\n[6] Testing Queue Overflow Prevention...\n");
    st = queue_enqueue(q, 600);
    printf("    Attempting enqueue into full queue: %s\n", ds_status_to_string(st));

    printf("\n[7] Cleaning up allocated resources...\n");
    stack_destroy(s);
    queue_destroy(q);
    printf("    All C memory cleanly freed. Done.\n");

    return 0;
}
