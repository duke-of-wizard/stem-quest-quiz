// STEM Quest Sound System
// Procedural audio via Web Audio API — zero audio files

const SoundSystem = {
    ctx: null,
    enabled: true,
    initialized: false,

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            // Restore mute state
            const saved = localStorage.getItem('stemquest_sound');
            if (saved !== null) this.enabled = saved !== 'false';
        } catch (e) {
            this.enabled = false;
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('stemquest_sound', this.enabled);
        return this.enabled;
    },

    _tone(freq, duration, type = 'sine', volume = 0.15) {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    },

    click() {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
        }

        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        gain.gain.value = 0.06;

        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();
    },

    correct() {
        // Two-note ascending chime: C5 -> E5
        this._tone(523, 0.15, 'sine', 0.12);
        setTimeout(() => this._tone(659, 0.2, 'sine', 0.12), 100);
    },

    wrong() {
        // Low descending buzz
        this._tone(300, 0.15, 'triangle', 0.1);
        setTimeout(() => this._tone(220, 0.2, 'triangle', 0.1), 80);
    },

    streak() {
        // Three-note ascending arpeggio: C5 -> E5 -> G5
        this._tone(523, 0.12, 'sine', 0.1);
        setTimeout(() => this._tone(659, 0.12, 'sine', 0.1), 80);
        setTimeout(() => this._tone(784, 0.25, 'sine', 0.12), 160);
    },

    levelUp() {
        // Ascending fanfare
        this._tone(440, 0.1, 'sine', 0.1);
        setTimeout(() => this._tone(554, 0.1, 'sine', 0.1), 100);
        setTimeout(() => this._tone(659, 0.1, 'sine', 0.1), 200);
        setTimeout(() => this._tone(880, 0.3, 'sine', 0.12), 300);
    },

    complete() {
        // Victory jingle
        this._tone(523, 0.15, 'sine', 0.1);
        setTimeout(() => this._tone(659, 0.15, 'sine', 0.1), 120);
        setTimeout(() => this._tone(784, 0.15, 'sine', 0.1), 240);
        setTimeout(() => this._tone(1047, 0.4, 'sine', 0.12), 360);
    }
};
