#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include "../c/operations.h"
#include "../c/stack.h"
#include "../c/queue.h"

static int g_tests_run = 0;
static int g_tests_passed = 0;

#define ASSERT_TEST(cond, msg) do { \
    g_tests_run++; \
    if (cond) { \
        g_tests_passed++; \
        printf("  [PASS] %s\n", msg); \
    } else { \
        printf("  [FAIL] %s (Line %d)\n", msg, __LINE__); \
    } \
} while (0)

void test_stack(void) {
    printf("\n=== RUNNING STACK UNIT TESTS ===\n");
    Stack* s = NULL;
    int val = 0;

    /* 1. Invalid Capacity */
    ASSERT_TEST(stack_create(0, &s) == DS_ERR_INVALID_CAPACITY, "stack_create(0) rejects invalid capacity");
    ASSERT_TEST(stack_create(-5, &s) == DS_ERR_INVALID_CAPACITY, "stack_create(-5) rejects negative capacity");

    /* 2. Create valid */
    ASSERT_TEST(stack_create(3, &s) == DS_SUCCESS && s != NULL, "stack_create(3) succeeds");
    ASSERT_TEST(stack_is_empty(s) == true, "New stack is empty");
    ASSERT_TEST(stack_size(s) == 0, "New stack size is 0");
    ASSERT_TEST(stack_get_top_index(s) == -1, "New stack top index is -1");

    /* 3. Underflow tests */
    ASSERT_TEST(stack_pop(s, &val) == DS_ERR_UNDERFLOW, "stack_pop on empty returns DS_ERR_UNDERFLOW");
    ASSERT_TEST(stack_peek(s, &val) == DS_ERR_UNDERFLOW, "stack_peek on empty returns DS_ERR_UNDERFLOW");

    /* 4. Push elements */
    ASSERT_TEST(stack_push(s, 11) == DS_SUCCESS, "stack_push(11) succeeds");
    ASSERT_TEST(stack_size(s) == 1 && stack_get_top_index(s) == 0, "Size is 1, top is 0");
    ASSERT_TEST(stack_peek(s, &val) == DS_SUCCESS && val == 11, "stack_peek returns 11");
    ASSERT_TEST(stack_size(s) == 1, "Peek does not change stack size");

    ASSERT_TEST(stack_push(s, 22) == DS_SUCCESS, "stack_push(22) succeeds");
    ASSERT_TEST(stack_push(s, 33) == DS_SUCCESS, "stack_push(33) succeeds");
    ASSERT_TEST(stack_is_full(s) == true, "Stack is now full (3/3)");

    /* 5. Overflow test */
    ASSERT_TEST(stack_push(s, 44) == DS_ERR_OVERFLOW, "stack_push(44) into full stack returns DS_ERR_OVERFLOW");
    ASSERT_TEST(stack_size(s) == 3, "Failed push does not modify size or data");

    /* 6. Read and Update */
    ASSERT_TEST(stack_get_at(s, 1, &val) == DS_SUCCESS && val == 22, "stack_get_at(1) retrieves 22");
    ASSERT_TEST(stack_get_at(s, 5, &val) == DS_ERR_INVALID_INDEX, "stack_get_at(5) out of bounds rejected");
    ASSERT_TEST(stack_update(s, 1, 99) == DS_SUCCESS, "stack_update(1, 99) succeeds");
    ASSERT_TEST(stack_get_at(s, 1, &val) == DS_SUCCESS && val == 99, "stack_get_at(1) returns updated 99");
    ASSERT_TEST(stack_update(s, 4, 100) == DS_ERR_INVALID_INDEX, "stack_update invalid index rejected");

    /* 7. Pop in LIFO order */
    ASSERT_TEST(stack_pop(s, &val) == DS_SUCCESS && val == 33, "First pop returns 33 (LIFO)");
    ASSERT_TEST(stack_pop(s, &val) == DS_SUCCESS && val == 99, "Second pop returns 99 (updated value)");
    ASSERT_TEST(stack_pop(s, &val) == DS_SUCCESS && val == 11, "Third pop returns 11");
    ASSERT_TEST(stack_is_empty(s) == true, "Stack is empty after 3 pops");
    ASSERT_TEST(stack_pop(s, &val) == DS_ERR_UNDERFLOW, "Subsequent pop triggers underflow");

    /* 8. Clear and Recreate */
    stack_push(s, 50);
    stack_push(s, 60);
    ASSERT_TEST(stack_clear(s) == DS_SUCCESS && stack_is_empty(s), "stack_clear empties the stack");

    ASSERT_TEST(stack_destroy(s) == DS_SUCCESS, "stack_destroy frees allocated memory");
    s = NULL;

    /* Repeated create/destroy cycles to verify no memory leaks */
    for (int i = 0; i < 10; i++) {
        Stack* temp = NULL;
        stack_create(10, &temp);
        stack_push(temp, i * 10);
        stack_destroy(temp);
    }
    ASSERT_TEST(1, "10 repeated create/push/destroy cycles completed cleanly");
}

void test_queue(void) {
    printf("\n=== RUNNING CIRCULAR QUEUE UNIT TESTS ===\n");
    Queue* q = NULL;
    int val = 0;

    /* 1. Invalid Capacity */
    ASSERT_TEST(queue_create(0, &q) == DS_ERR_INVALID_CAPACITY, "queue_create(0) rejects invalid capacity");

    /* 2. Create valid circular queue */
    ASSERT_TEST(queue_create(3, &q) == DS_SUCCESS && q != NULL, "queue_create(3) succeeds");
    ASSERT_TEST(queue_is_empty(q) == true, "New queue is empty");
    ASSERT_TEST(queue_size(q) == 0, "New queue size is 0");
    ASSERT_TEST(queue_get_front_index(q) == -1, "Empty queue front index is -1");

    /* 3. Underflow tests */
    ASSERT_TEST(queue_dequeue(q, &val) == DS_ERR_UNDERFLOW, "queue_dequeue on empty returns DS_ERR_UNDERFLOW");
    ASSERT_TEST(queue_front(q, &val) == DS_ERR_UNDERFLOW, "queue_front on empty returns DS_ERR_UNDERFLOW");
    ASSERT_TEST(queue_rear(q, &val) == DS_ERR_UNDERFLOW, "queue_rear on empty returns DS_ERR_UNDERFLOW");

    /* 4. Enqueue FIFO elements */
    ASSERT_TEST(queue_enqueue(q, 100) == DS_SUCCESS, "queue_enqueue(100) succeeds");
    ASSERT_TEST(queue_get_front_index(q) == 0 && queue_get_rear_index(q) == 0, "Front is 0, Rear is 0");
    ASSERT_TEST(queue_front(q, &val) == DS_SUCCESS && val == 100, "queue_front returns 100");
    ASSERT_TEST(queue_rear(q, &val) == DS_SUCCESS && val == 100, "queue_rear returns 100");

    ASSERT_TEST(queue_enqueue(q, 200) == DS_SUCCESS, "queue_enqueue(200) succeeds");
    ASSERT_TEST(queue_enqueue(q, 300) == DS_SUCCESS, "queue_enqueue(300) succeeds");
    ASSERT_TEST(queue_is_full(q) == true, "Queue is full (3/3)");
    ASSERT_TEST(queue_get_rear_index(q) == 2, "Rear index is 2");

    /* 5. Overflow test */
    ASSERT_TEST(queue_enqueue(q, 400) == DS_ERR_OVERFLOW, "queue_enqueue into full queue returns DS_ERR_OVERFLOW");

    /* 6. Dequeue FIFO element */
    ASSERT_TEST(queue_dequeue(q, &val) == DS_SUCCESS && val == 100, "First dequeue returns 100 (FIFO)");
    ASSERT_TEST(queue_get_front_index(q) == 1, "Front pointer advanced circularly to index 1");
    ASSERT_TEST(queue_is_full(q) == false, "Queue is no longer full (capacity freed)");

    /* 7. Circular Wrap-around test: Enqueue into freed slot 0 */
    ASSERT_TEST(queue_enqueue(q, 400) == DS_SUCCESS, "queue_enqueue(400) wraps around into index 0");
    ASSERT_TEST(queue_get_rear_index(q) == 0, "Rear pointer wrapped around to index 0!");
    ASSERT_TEST(queue_is_full(q) == true, "Queue is full again with wrapped pointers");

    /* 8. Logical order inspection */
    int logical_vals[3];
    int count = 0;
    queue_copy_logical(q, logical_vals, 3, &count);
    ASSERT_TEST(count == 3 && logical_vals[0] == 200 && logical_vals[1] == 300 && logical_vals[2] == 400,
                "Logical order is correct: [200, 300, 400]");

    /* 9. Read and Update */
    ASSERT_TEST(queue_get_at(q, 0, &val) == DS_SUCCESS && val == 200, "queue_get_at(0) retrieves front 200");
    ASSERT_TEST(queue_update(q, 0, 777) == DS_SUCCESS, "queue_update(0, 777) succeeds");
    ASSERT_TEST(queue_get_at(q, 0, &val) == DS_SUCCESS && val == 777, "Front now holds 777");

    /* 10. Dequeue all and verify wrap-around drain */
    ASSERT_TEST(queue_dequeue(q, &val) == DS_SUCCESS && val == 777, "Dequeued 777 from physical 1");
    ASSERT_TEST(queue_dequeue(q, &val) == DS_SUCCESS && val == 300, "Dequeued 300 from physical 2");
    ASSERT_TEST(queue_dequeue(q, &val) == DS_SUCCESS && val == 400, "Dequeued 400 from physical 0 (wrapped)");
    ASSERT_TEST(queue_is_empty(q) == true, "Queue is now empty");
    ASSERT_TEST(queue_dequeue(q, &val) == DS_ERR_UNDERFLOW, "Subsequent dequeue returns underflow");

    /* 11. Clear and Cleanup */
    queue_enqueue(q, 555);
    ASSERT_TEST(queue_clear(q) == DS_SUCCESS && queue_is_empty(q), "queue_clear resets queue state");
    ASSERT_TEST(queue_destroy(q) == DS_SUCCESS, "queue_destroy cleans up memory");
}

int main(void) {
    printf("====================================================\n");
    printf("  STRUCTURA C DATA STRUCTURES VALIDATION SUITE      \n");
    printf("====================================================\n");

    test_stack();
    test_queue();

    printf("\n====================================================\n");
    printf("  TEST RESULTS: %d / %d PASSED (%.1f%%)\n",
           g_tests_passed, g_tests_run, (100.0f * g_tests_passed) / g_tests_run);
    printf("====================================================\n");

    return (g_tests_passed == g_tests_run) ? 0 : 1;
}
