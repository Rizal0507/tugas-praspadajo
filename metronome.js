/**
 * metronome.js
 * Modul terpusat untuk menghasilkan suara metronome (Web Audio API)
 * Digunakan oleh anggota.html dan pelatih.html
 */

const Metronome = (function() {
    let audioCtx = null;
    let masterGain = null;
    let isMuted = false;

    // Inisialisasi Audio Context (harus dipanggil setelah user berinteraksi)
    function init() {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            audioCtx = new Ctx();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = isMuted ? 0 : 1;
            masterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // 1) CLICK - metronome digital tajam
    function playClick(isAccent, when) {
        const ctx = audioCtx;
        const time = when || ctx.currentTime;
        
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.008), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * Math.pow(1 - i/data.length, 3);
        const noiseSrc = ctx.createBufferSource(); noiseSrc.buffer = buf;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3500;
        const ng = ctx.createGain(); ng.gain.value = isAccent ? 0.35 : 0.22;
        noiseSrc.connect(hp); hp.connect(ng); ng.connect(masterGain); noiseSrc.start(time);

        const osc = ctx.createOscillator(); const og = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(isAccent ? 2200 : 1500, time);
        osc.frequency.exponentialRampToValueAtTime(isAccent ? 1400 : 900, time + 0.015);
        og.gain.setValueAtTime(0, time);
        og.gain.linearRampToValueAtTime(isAccent ? 0.28 : 0.18, time + 0.001);
        og.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
        osc.connect(og); og.connect(masterGain); osc.start(time); osc.stop(time + 0.03);
    }

    // 2) BEEP - sine murni bersih
    function playBeep(isAccent, when) {
        const ctx = audioCtx;
        const time = when || ctx.currentTime;
        
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = isAccent ? 1600 : 1000;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(isAccent ? 0.4 : 0.28, time + 0.003);
        g.gain.setValueAtTime(isAccent ? 0.4 : 0.28, time + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
        osc.connect(g); g.connect(masterGain); osc.start(time); osc.stop(time + 0.1);
    }

    // 3) TICK - jarum jam (noise pendek)
    function playTick(isAccent, when) {
        const ctx = audioCtx;
        const time = when || ctx.currentTime;
        
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.012), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * Math.pow(1 - i/data.length, 5);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.value = isAccent ? 4500 : 2800; bp.Q.value = 6;
        const g = ctx.createGain(); g.gain.value = isAccent ? 0.55 : 0.4;
        src.connect(bp); bp.connect(g); g.connect(masterGain); src.start(time);
    }

    // 4) WOODBLOCK - tok kayu (triangle + noise)
    function playWoodblock(isAccent, when) {
        const ctx = audioCtx;
        const time = when || ctx.currentTime;
        
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.015), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * Math.pow(1 - i/data.length, 4);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
        const ng = ctx.createGain(); ng.gain.value = isAccent ? 0.5 : 0.32;
        src.connect(bp); bp.connect(ng); ng.connect(masterGain); src.start(time);

        const osc = ctx.createOscillator(); const og = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isAccent ? 1700 : 1100, time);
        osc.frequency.exponentialRampToValueAtTime(isAccent ? 800 : 550, time + 0.04);
        og.gain.setValueAtTime(0, time);
        og.gain.linearRampToValueAtTime(isAccent ? 0.6 : 0.4, time + 0.002);
        og.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.connect(og); og.connect(masterGain); osc.start(time); osc.stop(time + 0.08);
    }

    return {
        // Fungsi untuk memutar suara berdasarkan tipe
        play: function(soundType, isAccent, when) {
            try {
                init();
                if (soundType === 'beep') playBeep(isAccent, when);
                else if (soundType === 'tick') playTick(isAccent, when);
                else if (soundType === 'woodblock') playWoodblock(isAccent, when);
                else playClick(isAccent, when);
            } catch(e) { console.error('Metronome error:', e); }
        },
        
        // Fungsi untuk tes 4 ketukan (dipakai di pelatih.html)
        test: function(soundType, bpm) {
            init();
            const interval = 60000 / bpm;
            let beat = 0;
            const playBeat = () => {
                if (beat >= 4) return;
                this.play(soundType, beat === 0);
                beat++;
                if (beat < 4) setTimeout(playBeat, interval);
            };
            playBeat();
        },

        // Fungsi untuk mute/unmute (dipakai di anggota.html)
        setMute: function(muted) {
            isMuted = muted;
            if (masterGain) masterGain.gain.value = muted ? 0 : 1;
        },

        // Mendapatkan status mute
        isMuted: function() { return isMuted; }
    };
})();
