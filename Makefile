CC ?= gcc
CFLAGS = -Wall -Wextra -std=c99 -I./c -O2

C_SRCS = c/operations.c c/stack.c c/queue.c
CLI_SRCS = $(C_SRCS) c/main.c
TEST_SRCS = $(C_SRCS) tests/test_ds.c

.PHONY: all test cli wasm clean

all: test cli wasm

test: tests/test_ds.exe
	./tests/test_ds.exe

tests/test_ds.exe: $(TEST_SRCS)
	$(CC) $(CFLAGS) $(TEST_SRCS) -o tests/test_ds.exe

cli: c/structura_cli.exe
	./c/structura_cli.exe

c/structura_cli.exe: $(CLI_SRCS)
	$(CC) $(CFLAGS) $(CLI_SRCS) -o c/structura_cli.exe

wasm:
	node build-wasm.js

clean:
	rm -f tests/test_ds.exe c/structura_cli.exe
