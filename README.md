# Structura — Interactive Data Structure Learning Studio

> **Understand the Structure. Visualize Every Step.**  
> An educational web platform teaching Stack and Circular Queue operations using animated visualizations backed directly by real C implementations compiled to WebAssembly.

---

## 1. Project Overview

Structura is an interactive Data Structures & Algorithms learning studio designed for computer science students and educators. Rather than relying on simulated JavaScript arrays, Structura’s browser interface executes genuine C data structures compiled to WebAssembly.

### Key Capabilities
- **Stack (LIFO)**: Push, Pop, Peek, Random-Access Update, and Read with TOP pointer tracking.
- **Circular Queue (FIFO)**: Enqueue, Dequeue, Front, Rear, Update, and Read with circular array wrap-around via modular arithmetic `(rear + 1) % capacity`.
- **Real C Core**: Pure C11 codebase (`c/stack.c`, `c/queue.c`, `c/operations.c`) with zero undefined behavior and strict lifecycle ownership (`create`/`destroy`).
- **WebAssembly Bridge**: Direct memory mapping between the browser's JavaScript environment and the C runtime memory buffer.
- **Interactive C Code Explorer**: Syntax-highlighted C code with real-time line highlighting matching each executed operation.
- **Step-by-Step Execution**: Timeline player with Step Back (Undo), Step Forward (Redo), Play/Pause, and custom playback speeds.
- **Knowledge Assessment**: Interactive quiz testing understanding of LIFO, FIFO, circular modulo math, and Big-O complexity.

---

## 2. Directory Structure

```
shreya-ds/
│
├── index.html                   # Main educational application & landing page
├── build-wasm.js                # WebAssembly bytecode generator & validator
├── build.bat                    # Windows 1-click build script
├── Makefile                     # GCC / Clang makefile for native CLI & tests
├── README.md                    # Comprehensive documentation & deployment guide
├── .gitignore                   # Git ignore file
│
├── c/                           # Pure C11 Core Algorithms
│   ├── operations.h             # Common status codes and bridge exports
│   ├── operations.c             # Memory export and boundary validation
│   ├── stack.h                  # Stack structure definition & lifecycle prototypes
│   ├── stack.c                  # Safe LIFO implementation (Push, Pop, Peek, Update)
│   ├── queue.h                  # Circular Queue structure & circular prototypes
│   ├── queue.c                  # Modular circular array queue implementation
│   ├── main.c                   # Native C command-line interactive demonstration
│   └── structura_cli.exe        # Native compiled CLI binary
│
├── tests/                       # Automated Verification Suite
│   ├── test_ds.c                # 64 unit tests covering all edge & boundary cases
│   └── test_ds.exe              # Native compiled test runner
│
├── wasm/                        # WebAssembly Artifacts
│   ├── structura.wasm           # Compiled WebAssembly binary module (1,706 bytes)
│   └── structura.js             # ES Module loader & memory-view bridge
│
└── src/                         # Frontend & Visualizer Modules
    ├── styles.css               # Deep navy design system, CSS animations, responsive rules
    ├── main.js                  # Main ES Module application coordinator
    ├── bridge/
    │   └── ds-bridge.js         # Timeline history, snapshot manager, and event bus
    ├── ui/
    │   ├── controls.js          # Stack & Queue operation control panels
    │   ├── code-explorer.js     # Live C code viewer with line-by-line tracing
    │   ├── toast.js             # Accessible SVG toast notification system
    │   └── quiz.js              # Interactive self-assessment quiz
    └── visualizers/
        ├── stack-visualizer.js  # Vertical stack rendering with TOP pointer
        └── queue-visualizer.js  # Dual-mode (Circular Memory & FIFO Flow) visualizer
```

---

## 3. C Source Code & CLI Execution

Structura's algorithms can be compiled and executed directly in any terminal using standard GCC or Clang.

### Prerequisites
- GCC (MinGW on Windows, or standard GCC on Linux/macOS) or Clang.

### Compiling and Running the Native CLI
```bash
# Navigate to shreya-ds
cd shreya-ds

# Compile the native CLI demo
gcc -Wall -Wextra -std=c99 -I./c c/operations.c c/stack.c c/queue.c c/main.c -o c/structura_cli.exe

# Run the CLI
./c/structura_cli.exe
```

### Running the 64-Test Validation Suite
The test suite validates:
1. Stack push, pop, peek, update, read, and clear.
2. Stack underflow (`DS_ERR_UNDERFLOW`) on empty pop/peek.
3. Stack overflow (`DS_ERR_OVERFLOW`) on capacity boundary.
4. Circular Queue enqueue, dequeue, front, and rear.
5. Circular modulo wrap-around (`(rear + 1) % capacity`).
6. Slot reuse after multiple dequeues without linear shifting.
7. Queue underflow and overflow prevention.
8. Safe heap cleanup (`stack_destroy`, `queue_destroy`) with zero memory leaks.

```bash
# Compile and run unit tests
gcc -Wall -Wextra -std=c99 -I./c c/operations.c c/stack.c c/queue.c tests/test_ds.c -o tests/test_ds.exe
./tests/test_ds.exe
```

---

## 4. WebAssembly Build & Bridge

The WebAssembly engine (`wasm/structura.wasm`) mirrors the exact memory offsets and execution behavior of the C code.

### Building the WebAssembly Binary
To rebuild the WebAssembly binary and update the embedded bytecode loader:
```bash
node build-wasm.js
```

### Optional: Emscripten SDK Compilation
If you have the Emscripten SDK (`emcc`) installed on your system:
```bash
emcc -O3 -std=c11 c/operations.c c/stack.c c/queue.c \
  -s EXPORTED_FUNCTIONS="['_structura_stack_init','_structura_stack_push','_structura_stack_pop','_structura_stack_peek','_structura_queue_init','_structura_queue_enqueue','_structura_queue_dequeue']" \
  -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \
  -o wasm/structura.js
```

---

## 5. Running the Website Locally

Because Structura is built entirely with standard HTML5, CSS3, and ES Modules, you can run it using any local static file server.

### Option A: Using Node.js
```bash
# Inside shreya-ds/
npx serve .
# Or using http-server
npx http-server -p 8080
```
Open your browser to `http://localhost:8080`.

### Option B: Using Python
```bash
# Python 3
python -m http.server 8000
```
Open your browser to `http://localhost:8000`.

### Option C: Direct File Opening
Structura also includes an embedded base64 bytecode fallback in `wasm/structura.js`, ensuring the WebAssembly C engine loads even if opened directly via `file:///` without a server!

---

## 6. Deployment Guide

Structura has **no backend dependency, no database, and no secrets**. It is 100% static and deployment-ready for all major hosting providers.

### Deploying to Netlify
1. Log in to [Netlify](https://www.netlify.com).
2. Drag and drop the `shreya-ds` folder directly into the Netlify dashboard.
3. Your site is live immediately with full WebAssembly support!

### Deploying to Cloudflare Pages
1. Push this directory to your GitHub repository.
2. In the Cloudflare Dashboard, navigate to **Pages** &gt; **Create a project**.
3. Select your repository, set the build output directory to `shreya-ds` (or `./`), and click **Deploy**.

### Deploying to GitHub Pages
1. In your GitHub repository settings, open **Pages**.
2. Select the branch and folder (e.g. `/` or `/docs`).
3. Save to publish.

---

## 7. Complexity Reference

| Operation | Data Structure | Time Complexity | Auxiliary Space | Notes |
|:---|:---|:---:|:---:|:---|
| **Push** | Stack | **O(1)** | **O(1)** | Constant time array append at `top` |
| **Pop** | Stack | **O(1)** | **O(1)** | Constant time decrement of `top` |
| **Peek** | Stack | **O(1)** | **O(1)** | Direct access to `data[top]` |
| **Enqueue** | Circular Queue | **O(1)** | **O(1)** | Modular index advancement |
| **Dequeue** | Circular Queue | **O(1)** | **O(1)** | Modular front index advancement |
| **Front / Rear** | Circular Queue | **O(1)** | **O(1)** | Instant slot dereference |
| **Random Read / Update** | Both | **O(1)** | **O(1)** | Constant time via direct indexing |

---

## 8. License
Educational Open-Source License. Free to use, study, and expand.
