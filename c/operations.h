#ifndef STRUCTURA_OPERATIONS_H
#define STRUCTURA_OPERATIONS_H

#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Explicit error and status codes for all Structura data structure operations.
 */
typedef enum {
    DS_SUCCESS              = 0,
    DS_ERR_OVERFLOW         = 1,
    DS_ERR_UNDERFLOW        = 2,
    DS_ERR_INVALID_INDEX    = 3,
    DS_ERR_NULL_PTR         = 4,
    DS_ERR_INVALID_CAPACITY = 5,
    DS_ERR_ALLOC_FAILED     = 6
} DS_Status;

/**
 * Returns a human-readable English description of a status code.
 */
const char* ds_status_to_string(DS_Status status);

#ifdef __cplusplus
}
#endif

#endif /* STRUCTURA_OPERATIONS_H */
