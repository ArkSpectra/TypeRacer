// ============================================================
// TypeRacer Engine - Mode Santai & Dead Reckoning Interpolation
// ============================================================

class RaceEngine {
    constructor() {
        this.targetText = '';
        this.textSource = '';
        this.userInput = '';
        this.startTime = null;
        this.isFinished = false;
        this.wpm = 0;
        this.cpm = 0;
        this.accuracy = 100;
        this.progress = 0;

        // Callback hooks
        this.onProgressChange = null;
        this.onFinish = null;

        // DOM elements cache
        this.textDisplayEl = null;
        this.inputEl = null;
        this.wpmEl = null;
        this.accEl = null;
    }

    init(textDisplayId, inputId, wpmId, accId) {
        this.textDisplayEl = document.getElementById(textDisplayId);
        this.inputEl = document.getElementById(inputId);
        this.wpmEl = document.getElementById(wpmId);
        this.accEl = document.getElementById(accId);

        if (this.inputEl) {
            this.inputEl.addEventListener('input', (e) => this.handleInput(e.target.value));
            this.inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') e.preventDefault();
            });
        }

        if (this.textDisplayEl) {
            this.textDisplayEl.addEventListener('click', () => {
                if (this.inputEl && !this.inputEl.disabled) this.inputEl.focus();
            });
        }
    }

    setText(text, source = '') {
        this.targetText = text || '';
        this.textSource = source || '';
        this.reset();
        this.renderText();
    }

    reset() {
        this.userInput = '';
        this.startTime = null;
        this.isFinished = false;
        this.wpm = 0;
        this.cpm = 0;
        this.accuracy = 100;
        this.progress = 0;

        if (this.inputEl) {
            this.inputEl.value = '';
            this.inputEl.disabled = true;
        }
        this.updateStatsUI();
    }

    start(startTimeMs = null) {
        this.startTime = startTimeMs || Date.now();
        this.isFinished = false;
        if (this.inputEl) {
            this.inputEl.disabled = false;
            this.inputEl.focus();
        }
    }

    handleInput(val) {
        if (this.isFinished || !this.targetText) return;

        // Start timer if not already running (e.g. in practice mode)
        if (!this.startTime) {
            this.startTime = Date.now();
        }

        // Mode Santai: Allow user to type freely up to max text length
        if (val.length <= this.targetText.length) {
            this.userInput = val;
            this.calculateTelemetry();
            this.renderText();
            this.updateStatsUI();

            if (this.onProgressChange) {
                this.onProgressChange(this.progress, this.wpm, this.accuracy);
            }

            // Check if 100% finished
            if (this.userInput.length >= this.targetText.length && !this.isFinished) {
                this.isFinished = true;
                if (this.inputEl) this.inputEl.disabled = true;
                const timeTakenSec = Math.max((Date.now() - this.startTime) / 1000, 0.5);

                if (this.onFinish) {
                    this.onFinish({
                        wpm: this.wpm,
                        cpm: this.cpm,
                        accuracy: this.accuracy,
                        timeTakenSec: timeTakenSec.toFixed(2)
                    });
                }
            }
        }
    }

    calculateTelemetry() {
        if (!this.startTime || this.userInput.length === 0) return;

        const timeElapsedMin = Math.max((Date.now() - this.startTime) / 1000 / 60, 0.005);
        let correctChars = 0;

        for (let i = 0; i < this.userInput.length; i++) {
            if (i < this.targetText.length && this.userInput[i] === this.targetText[i]) {
                correctChars++;
            }
        }

        // Standard WPM = (correct chars / 5) / minutes
        this.wpm = Math.round((correctChars / 5) / timeElapsedMin) || 0;
        this.cpm = Math.round(correctChars / timeElapsedMin) || 0;
        this.accuracy = this.userInput.length > 0 ? Math.round((correctChars / this.userInput.length) * 100) : 100;
        this.progress = Math.min(Math.round((this.userInput.length / this.targetText.length) * 100), 100);
    }

    renderText() {
        if (!this.textDisplayEl) return;
        const chars = this.targetText.split('');
        let html = '';

        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const isCursor = i === this.userInput.length;
            let charClass = 'char-pending';

            if (i < this.userInput.length) {
                if (this.userInput[i] === char) {
                    charClass = 'char-correct';
                } else {
                    // Mode santai error highlight
                    charClass = 'char-wrong';
                }
            }

            const cursorHtml = isCursor && !this.isFinished ? '<span class="typing-cursor"></span>' : '';
            html += `<span class="${charClass}">${cursorHtml}${escapeHtml(char)}</span>`;
        }

        this.textDisplayEl.innerHTML = html;
    }

    updateStatsUI() {
        if (this.wpmEl) this.wpmEl.textContent = this.wpm;
        if (this.accEl) this.accEl.textContent = this.accuracy + '%';
    }
}

// Helper escape
function escapeHtml(str) {
    if (str === ' ') return ' ';
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

// Global engine instance
const raceEngine = new RaceEngine();
