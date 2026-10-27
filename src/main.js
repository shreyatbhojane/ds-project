/**
 * Structura — Main Application Entry Point
 * Orchestrates WebAssembly C runtime, visualizers, controls, and landing page interactions.
 */

import { bridge } from './bridge/ds-bridge.js';
import { StackVisualizer } from './visualizers/stack-visualizer.js';
import { QueueVisualizer } from './visualizers/queue-visualizer.js';
import { CodeExplorer } from './ui/code-explorer.js';
import { ControlsManager } from './ui/controls.js';
import { QuizManager } from './ui/quiz.js';

class StructuraApp {
    constructor() {
        this.stackViz = null;
        this.queueViz = null;
        this.codeExplorer = null;
        this.controls = null;
        this.quiz = null;
        this.activeTab = 'stack'; // 'stack' | 'queue'
    }

    async init() {
        console.log('[Structura] Initializing application...');

        // 1. Initialize UI visualizers
        this.stackViz = new StackVisualizer('stack-stage-target');
        this.queueViz = new QueueVisualizer('queue-stage-target');
        this.codeExplorer = new CodeExplorer('code-explorer-target');

        // 2. Initialize controls & timeline player
        this.controls = new ControlsManager(
            'stack-ctrl-target',
            'queue-ctrl-target',
            'timeline-ctrl-target'
        );

        // 3. Initialize knowledge check / quiz
        this.quiz = new QuizManager('quiz-target');

        // 4. Connect bridge and subscribe to updates
        bridge.subscribe((data) => this.handleBridgeUpdate(data));

        // 5. Initialize C WebAssembly bridge
        await bridge.init();

        // 6. Bind interactive landing page tabs, mobile nav, and FAQ
        this.setupNavigation();
        this.setupStudioTabs();
        this.setupFaqAccordion();
        this.setupHeroDemo();

        // Update runtime engine badge
        const engineLabel = document.getElementById('engine-mode-label');
        if (engineLabel && bridge.engine) {
            engineLabel.textContent = 'C Engine (WebAssembly)';
        }

        console.log('[Structura] Ready.');
    }

    handleBridgeUpdate(data) {
        const isStack = bridge.activeDS === 'stack';
        const currentStep = isStack ? data.stackState : data.queueState;

        // Determine action type and highlight index
        let actionType = null;
        let highlightIndex = null;
        let highlightPhysical = null;

        if (currentStep) {
            const op = (currentStep.opName || '').toLowerCase();
            actionType = op;
            highlightIndex = currentStep.affectedIndex !== undefined ? currentStep.affectedIndex : null;
            highlightPhysical = currentStep.affectedPhysical !== undefined ? currentStep.affectedPhysical : null;
        }

        // Render Stack
        if (this.stackViz) {
            this.stackViz.render(data.stackState, {
                actionType: isStack ? actionType : null,
                highlightIndex: isStack ? highlightIndex : null
            });
            if (isStack && currentStep && currentStep.status !== 0 && currentStep.status !== undefined) {
                this.stackViz.triggerErrorShake();
            }
        }

        // Render Queue
        if (this.queueViz) {
            this.queueViz.render(data.queueState, {
                actionType: !isStack ? actionType : null,
                highlightPhysical: !isStack ? highlightPhysical : null
            });
            if (!isStack && currentStep && currentStep.status !== 0 && currentStep.status !== undefined) {
                this.queueViz.triggerErrorShake();
            }
        }

        // Update Code Explorer
        if (this.codeExplorer && currentStep) {
            this.codeExplorer.setOperation(currentStep.cFunction || 'stack_push', currentStep.cLine || 1);
        }

        // Update Timeline Bar
        if (this.controls && currentStep) {
            this.controls.updateTimelineDisplay(currentStep, data.playback || {});
        }
    }

    setupStudioTabs() {
        const stackTabBtn = document.getElementById('tab-btn-stack');
        const queueTabBtn = document.getElementById('tab-btn-queue');
        const stackCtrls = document.getElementById('stack-ctrl-target');
        const queueCtrls = document.getElementById('queue-ctrl-target');
        const stackStage = document.getElementById('stack-stage-target');
        const queueStage = document.getElementById('queue-stage-target');

        const switchTab = (tab) => {
            this.activeTab = tab;
            bridge.setActiveDS(tab);

            if (tab === 'stack') {
                stackTabBtn?.classList.add('active');
                queueTabBtn?.classList.remove('active');
                if (stackCtrls) stackCtrls.style.display = 'block';
                if (queueCtrls) queueCtrls.style.display = 'none';
                if (stackStage) stackStage.style.display = 'flex';
                if (queueStage) queueStage.style.display = 'none';
            } else {
                queueTabBtn?.classList.add('active');
                stackTabBtn?.classList.remove('active');
                if (stackCtrls) stackCtrls.style.display = 'none';
                if (queueCtrls) queueCtrls.style.display = 'block';
                if (stackStage) stackStage.style.display = 'none';
                if (queueStage) queueStage.style.display = 'flex';
            }
        };

        stackTabBtn?.addEventListener('click', () => switchTab('stack'));
        queueTabBtn?.addEventListener('click', () => switchTab('queue'));

        // Default to stack tab
        switchTab('stack');

        // External triggers for tabs
        document.querySelectorAll('[data-switch-tab]').forEach(el => {
            el.addEventListener('click', (e) => {
                const targetTab = el.getAttribute('data-switch-tab');
                switchTab(targetTab);
                const visualizerSection = document.getElementById('visualizer-workspace');
                if (visualizerSection) {
                    visualizerSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');
        const mobileToggle = document.getElementById('mobile-nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        // Mobile menu toggle
        mobileToggle?.addEventListener('click', () => {
            navMenu?.classList.toggle('mobile-open');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu?.classList.remove('mobile-open');
            });
        });

        // Scrollspy for active nav link
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (window.scrollY >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    setupFaqAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const btn = item.querySelector('.faq-question-btn');
            btn?.addEventListener('click', () => {
                const isOpen = item.classList.contains('faq-open');
                faqItems.forEach(i => i.classList.remove('faq-open'));
                if (!isOpen) {
                    item.classList.add('faq-open');
                }
            });
        });
    }

    setupHeroDemo() {
        // Animate mini preview blocks subtly on hero section
        const heroBlocks = document.querySelectorAll('.hero-mini-stack .mini-block');
        heroBlocks.forEach((block, idx) => {
            block.style.opacity = '0';
            block.style.transform = 'translateY(10px)';
            setTimeout(() => {
                block.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                block.style.opacity = '1';
                block.style.transform = 'translateY(0)';
            }, 300 + idx * 150);
        });
    }
}

// Start app once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new StructuraApp();
    app.init().catch(err => {
        console.error('[Structura] Initialization error:', err);
    });
});
