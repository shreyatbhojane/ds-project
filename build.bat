@echo off
echo ===================================================
echo   STRUCTURA -- Building C Core & WebAssembly Engine
echo ===================================================

echo.
echo [1/3] Compiling C Unit Tests...
gcc -Wall -Wextra -std=c99 -I./c c/operations.c c/stack.c c/queue.c tests/test_ds.c -o tests/test_ds.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to compile test_ds.exe
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Running 64 C Unit Tests...
tests\test_ds.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Tests failed!
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Building WebAssembly Module and Bridge...
node build-wasm.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate WebAssembly module!
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo   BUILD SUCCESSFUL!
echo   All C tests passed and WebAssembly engine ready.
echo ===================================================
pause
