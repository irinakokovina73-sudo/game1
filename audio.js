const AudioSystem = (function () {
    let ctx = null;
    let enabled = true;

    function init() {
        if (!ctx) {
            try {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                enabled = false;
            }
        }
        if (ctx && ctx.state === 'suspended') ctx.resume();
    }

    function tone(freq, dur, type, vol) {
        if (!enabled || !ctx) return;
        try {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            g.gain.setValueAtTime(vol || 0.1, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + dur);
        } catch (e) {}
    }

    return {
        init: init,
        button: function () { init(); tone(600, 0.08, 'square', 0.05); },
        death: function () { init(); tone(200, 0.4, 'sawtooth', 0.1); tone(120, 0.5, 'sawtooth', 0.08); },
        levelComplete: function () {
            init();
            tone(523, 0.15, 'sine', 0.1);
            setTimeout(function () { tone(659, 0.15, 'sine', 0.1); }, 120);
            setTimeout(function () { tone(784, 0.3, 'sine', 0.12); }, 240);
        },
        keyPickup: function () { init(); tone(880, 0.1, 'sine', 0.08); },
        doorOpen: function () { init(); tone(300, 0.15, 'square', 0.05); },
        victory: function () {
            init();
            var notes = [523, 659, 784, 1047];
            notes.forEach(function (n, i) {
                setTimeout(function () { tone(n, 0.25, 'sine', 0.09); }, i * 150);
            });
        }
    };
})();