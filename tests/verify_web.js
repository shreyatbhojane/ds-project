/**
 * Structura - Frontend & Asset Verification Script
 */

const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
let errors = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`  [FAIL] ${message}`);
        errors++;
    } else {
        console.log(`  [PASS] ${message}`);
    }
}

console.log('=== STRUCTURA WEB VERIFICATION SUITE ===');

// 1. Check all required project files exist
const requiredFiles = [
    'index.html',
    'src/styles.css',
    'src/main.js',
    'src/bridge/ds-bridge.js',
    'src/ui/controls.js',
    'src/ui/code-explorer.js',
    'src/ui/toast.js',
    'src/ui/quiz.js',
    'src/visualizers/stack-visualizer.js',
    'src/visualizers/queue-visualizer.js',
    'wasm/structura.wasm',
    'wasm/structura.js',
    'c/operations.h',
    'c/operations.c',
    'c/stack.h',
    'c/stack.c',
    'c/queue.h',
    'c/queue.c',
    'c/main.c',
    'tests/test_ds.c',
    'build-wasm.js',
    'build.bat',
    'Makefile',
    'README.md'
];

requiredFiles.forEach(file => {
    const fullPath = path.join(baseDir, file);
    assert(fs.existsSync(fullPath) && fs.statSync(fullPath).size > 0, `File exists and non-empty: ${file}`);
});

// 2. Validate index.html contents
const html = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');
const requiredIds = [
    'hero',
    'topics',
    'visualizer-workspace',
    'architecture',
    'learn',
    'quiz-section',
    'faq',
    'tab-btn-stack',
    'tab-btn-queue',
    'stack-ctrl-target',
    'queue-ctrl-target',
    'stack-stage-target',
    'queue-stage-target',
    'code-explorer-target',
    'timeline-ctrl-target',
    'quiz-target'
];

requiredIds.forEach(id => {
    assert(html.includes(`id="${id}"`), `index.html contains element id="${id}"`);
});

// 3. Verify no emojis exist in source code or html
const regexEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert(!regexEmoji.test(html), 'index.html has zero emojis (uses SVGs exclusively)');

const jsFiles = [
    'src/main.js',
    'src/bridge/ds-bridge.js',
    'src/ui/controls.js',
    'src/ui/code-explorer.js',
    'src/visualizers/stack-visualizer.js',
    'src/visualizers/queue-visualizer.js'
];

jsFiles.forEach(f => {
    const content = fs.readFileSync(path.join(baseDir, f), 'utf8');
    assert(!regexEmoji.test(content), `${f} has zero emojis`);
});

// 4. Test WebAssembly module loads and runs in Node
const { pathToFileURL } = require('url');

async function testWasmRuntime() {
    const wasmJsUrl = pathToFileURL(path.join(baseDir, 'wasm', 'structura.js')).href;
    const { structura, DS_STATUS } = await import(wasmJsUrl);
    await structura.init();
    assert(structura.isReady === true, 'WebAssembly C engine initializes successfully');

    // Test Stack
    structura.stackInit(5);
    const push1 = structura.stackPush(10);
    assert(push1.status === DS_STATUS.SUCCESS && push1.state.size === 1, 'Stack push(10) updates size');
    const peek1 = structura.stackPeek();
    assert(peek1.value === 10, 'Stack peek() returns 10');
    const pop1 = structura.stackPop();
    assert(pop1.value === 10 && pop1.state.size === 0, 'Stack pop() returns 10 and empties stack');

    // Test Queue circular
    structura.queueInit(3);
    structura.queueEnqueue(1);
    structura.queueEnqueue(2);
    structura.queueEnqueue(3);
    const fullState = structura.getQueueState();
    assert(fullState.isFull === true && fullState.size === 3, 'Circular Queue full condition verified');
    structura.queueDequeue();
    structura.queueEnqueue(4); // wrapped around to slot 0
    const wrapState = structura.getQueueState();
    assert(wrapState.rearIndex === 0, 'Circular Queue wrap-around to index 0 verified');

    console.log(`\nVerification Complete! Errors encountered: ${errors}`);
    if (errors > 0) {
        process.exit(1);
    }
}

testWasmRuntime().catch(err => {
    console.error('Wasm verification error:', err);
    process.exit(1);
});
