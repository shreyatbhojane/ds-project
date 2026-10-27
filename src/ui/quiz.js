/**
 * Structura - Interactive Data Structure Quiz & Knowledge Check
 * Self-assessment module for Stack & Queue fundamentals.
 */

export const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "Which algorithmic principle governs how a Stack operates?",
        options: [
            { text: "FIFO (First In, First Out)", correct: false },
            { text: "LIFO (Last In, First Out)", correct: true },
            { text: "Random access without order", correct: false },
            { text: "Priority based indexing", correct: false }
        ],
        explanation: "Stack strictly follows LIFO (Last In, First Out): the most recently pushed element is the first one removed by a pop operation."
    },
    {
        id: 2,
        question: "Why does a Circular Queue use modular arithmetic (index % capacity)?",
        options: [
            { text: "To encrypt the array elements in memory", correct: false },
            { text: "To automatically double the size of the array", correct: false },
            { text: "To reuse freed array positions after earlier elements have been dequeued", correct: true },
            { text: "To convert FIFO ordering into LIFO ordering", correct: false }
        ],
        explanation: "Modular arithmetic allows the rear and front pointers to wrap back to index 0 after reaching the end of the array, preventing memory waste."
    },
    {
        id: 3,
        question: "What is the worst-case time complexity of Stack Push and Queue Enqueue in these array implementations?",
        options: [
            { text: "O(N) linear time", correct: false },
            { text: "O(log N) logarithmic time", correct: false },
            { text: "O(1) constant time", correct: true },
            { text: "O(N^2) quadratic time", correct: false }
        ],
        explanation: "Both Push and Enqueue perform direct pointer advancement and single array index assignment, taking strict O(1) constant time."
    },
    {
        id: 4,
        question: "What error occurs if you attempt to pop an element from an empty Stack?",
        options: [
            { text: "Stack Overflow (DS_ERR_OVERFLOW)", correct: false },
            { text: "Stack Underflow (DS_ERR_UNDERFLOW)", correct: true },
            { text: "Segmentation Fault", correct: false },
            { text: "Type Mismatch", correct: false }
        ],
        explanation: "Popping or peeking when top == -1 results in a Stack Underflow error, handled safely in our C code without undefined behavior."
    },
    {
        id: 5,
        question: "When a Circular Queue with capacity 5 dequeues an element from physical slot 4, where does the FRONT pointer move next?",
        options: [
            { text: "Slot 5 (out of bounds)", correct: false },
            { text: "Slot 0 (via (4 + 1) % 5 = 0)", correct: true },
            { text: "Slot 3 (decrements)", correct: false },
            { text: "Remains at Slot 4", correct: false }
        ],
        explanation: "With circular modular arithmetic: (4 + 1) % 5 = 0. The FRONT pointer cleanly wraps around to index 0."
    }
];

export class QuizManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentIdx = 0;
        this.score = 0;
        this.userAnswers = {};
        this.render();
    }

    render() {
        if (!this.container) return;

        if (this.currentIdx >= QUIZ_QUESTIONS.length) {
            this.renderScoreSummary();
            return;
        }

        const q = QUIZ_QUESTIONS[this.currentIdx];
        const answered = this.userAnswers[q.id] !== undefined;
        const selectedOptIdx = this.userAnswers[q.id];

        this.container.innerHTML = `
            <div class="quiz-card">
                <div class="quiz-header">
                    <span class="quiz-progress-pill">Question ${this.currentIdx + 1} of ${QUIZ_QUESTIONS.length}</span>
                    <span class="quiz-score-pill">Score: ${this.score} / ${QUIZ_QUESTIONS.length}</span>
                </div>

                <h3 class="quiz-question-text">${q.question}</h3>

                <div class="quiz-options-list">
                    ${q.options.map((opt, i) => {
                        let optClass = 'quiz-option-btn';
                        if (answered) {
                            if (opt.correct) optClass += ' opt-correct';
                            else if (i === selectedOptIdx) optClass += ' opt-wrong';
                            else optClass += ' opt-dimmed';
                        }
                        return `
                            <button class="${optClass}" data-idx="${i}" ${answered ? 'disabled' : ''}>
                                <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
                                <span class="opt-text">${opt.text}</span>
                                ${answered && opt.correct ? `
                                    <svg class="opt-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                ` : ''}
                                ${answered && !opt.correct && i === selectedOptIdx ? `
                                    <svg class="opt-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FB7185" stroke-width="3">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                ` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>

                ${answered ? `
                    <div class="quiz-feedback-box">
                        <div class="feedback-badge ${q.options[selectedOptIdx]?.correct ? 'fb-correct' : 'fb-incorrect'}">
                            ${q.options[selectedOptIdx]?.correct ? 'Correct Answer!' : 'Incorrect'}
                        </div>
                        <p class="feedback-text">${q.explanation}</p>
                        <button class="quiz-next-btn" id="quiz-next-btn">
                            ${this.currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Final Score'}
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const optionBtns = this.container.querySelectorAll('.quiz-option-btn');
        optionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                this.selectAnswer(idx);
            });
        });

        const nextBtn = this.container.querySelector('#quiz-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentIdx++;
                this.render();
            });
        }
    }

    selectAnswer(optIdx) {
        const q = QUIZ_QUESTIONS[this.currentIdx];
        if (this.userAnswers[q.id] !== undefined) return;

        this.userAnswers[q.id] = optIdx;
        if (q.options[optIdx].correct) {
            this.score++;
        }
        this.render();
    }

    renderScoreSummary() {
        const percent = Math.round((this.score / QUIZ_QUESTIONS.length) * 100);
        this.container.innerHTML = `
            <div class="quiz-summary-card">
                <div class="summary-icon-wrap" aria-hidden="true">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <h3 class="summary-title">Assessment Completed!</h3>
                <p class="summary-subtitle">You scored <strong>${this.score} out of ${QUIZ_QUESTIONS.length}</strong> (${percent}%)</p>
                <div class="summary-progress-bar">
                    <div class="summary-progress-fill" style="width: ${percent}%"></div>
                </div>
                <p class="summary-msg">
                    ${percent >= 80 ? 'Mastery demonstrated! You have an excellent grasp of Stack and Circular Queue mechanics.' : 'Good effort! Review the C Code Explorer and interactive visualizers to reinforce tricky boundary concepts.'}
                </p>
                <button class="quiz-restart-btn" id="quiz-restart-btn">Retake Quiz</button>
            </div>
        `;

        this.container.querySelector('#quiz-restart-btn')?.addEventListener('click', () => {
            this.currentIdx = 0;
            this.score = 0;
            this.userAnswers = {};
            this.render();
        });
    }
}
