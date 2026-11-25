(() => {
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const state = { on: false, track: 0, step: 0, next: 0, timer: null, origin: 0 };
  let ac = null;
  let master = null;
  let echo = null;
  let echoFeedback = null;
  let noise = null;

  function init() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = 0;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master.connect(comp).connect(ac.destination);

    echo = ac.createDelay(2);
    echoFeedback = ac.createGain();
    echoFeedback.gain.value = 0.35;
    const tone = ac.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2400;
    echo.connect(tone).connect(echoFeedback).connect(echo);
    tone.connect(master);

    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  function tone(t, { type = "sawtooth", freq, len, peak, cutoff = 2000, q = 1, sweep = 0, send = 0, detune = 0, attack = 0.005 }) {
    const osc = ac.createOscillator();
    const filt = ac.createBiquadFilter();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    filt.type = "lowpass";
    filt.Q.value = q;
    filt.frequency.setValueAtTime(cutoff + sweep, t);
    filt.frequency.exponentialRampToValueAtTime(Math.max(60, cutoff), t + Math.max(0.03, len * 0.8));
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(peak, t + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + len);
    osc.connect(filt).connect(amp).connect(master);
    if (send) {
      const s = ac.createGain();
      s.gain.value = send;
      amp.connect(s).connect(echo);
    }
    osc.start(t);
    osc.stop(t + len + 0.05);
  }

  function kick(t, punch = 1, decay = 0.32) {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.frequency.setValueAtTime(150 * punch, t);
    osc.frequency.exponentialRampToValueAtTime(44, t + 0.12);
    amp.gain.setValueAtTime(0.9, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.connect(amp).connect(master);
    osc.start(t);
    osc.stop(t + decay + 0.02);
  }

  function hiss(t, { len, peak, hp = 7000, bp = 0, send = 0 }) {
    const src = ac.createBufferSource();
    const filt = ac.createBiquadFilter();
    const amp = ac.createGain();
    src.buffer = noise;
    filt.type = bp ? "bandpass" : "highpass";
    filt.frequency.value = bp || hp;
    if (bp) filt.Q.value = 1.2;
    amp.gain.setValueAtTime(peak, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(filt).connect(amp).connect(master);
    if (send) {
      const s = ac.createGain();
      s.gain.value = send;
      amp.connect(s).connect(echo);
    }
    src.start(t, Math.random() * 0.5);
    src.stop(t + len + 0.02);
  }

  function clap(t, send = 0.2) {
    for (const d of [0, 0.011, 0.022]) hiss(t + d, { len: 0.12, peak: 0.28, bp: 1400, send });
  }

  const tracks = [
    {
      name: "potrero.lu",
      style: "acid techno",
      bpm: 128,
      echo: 0.75,
      play(i, t, L) {
        const s = i % 16;
        const bar = Math.floor(i / 16);
        if (s % 4 === 0) kick(t);
        if (s % 4 === 2) hiss(t, { len: 0.11, peak: 0.13 });
        else if (s % 2 === 1) hiss(t, { len: 0.03, peak: 0.05 });
        if (s === 4 || s === 12) clap(t, 0.15);
        const line = [0, null, 12, 0, 3, null, 15, 0, null, 7, 0, 10, 0, 12, 3, null];
        const accent = [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0];
        const n = line[s];
        if (n !== null) {
          const lfo = 0.5 + 0.5 * Math.sin((bar / 8) * Math.PI * 2);
          tone(t, { freq: hz(33 + n), len: L * 0.9, peak: accent[s] ? 0.2 : 0.13, cutoff: 180 + lfo * 900, sweep: accent[s] ? 1800 : 700, q: 13, send: 0.08 });
        }
        if (bar % 8 === 7 && s >= 12) hiss(t, { len: L, peak: 0.08 + (s - 12) * 0.03, hp: 3000 });
      },
    },
    {
      name: "fog_city.lu",
      style: "dub techno",
      bpm: 122,
      echo: 0.75,
      play(i, t, L) {
        const s = i % 16;
        if (s % 4 === 0) {
          kick(t, 0.9, 0.42);
          tone(t + L * 2, { type: "sine", freq: 46, len: L * 1.6, peak: 0.12, cutoff: 200 });
        }
        if (s % 4 === 2) hiss(t, { len: 0.16, peak: 0.07, hp: 6000 });
        if (s % 4 === 3) hiss(t + L * 0.15, { len: 0.03, peak: 0.04 });
        if (s === 12) hiss(t, { len: 0.2, peak: 0.12, bp: 1800, send: 0.4 });
        if (s === 6 || s === 14) {
          for (const n of [57, 60, 64, 67]) tone(t, { freq: hz(n), len: 0.18, peak: 0.05, cutoff: 900, sweep: 600, q: 2, send: 0.7, detune: n % 2 ? 6 : -6 });
        }
      },
    },
    {
      name: "bay_lights.lu",
      style: "peak-time techno",
      bpm: 132,
      echo: 0.5,
      play(i, t, L) {
        const s = i % 16;
        const bar = Math.floor(i / 16);
        if (s % 4 === 0) kick(t, 1.1, 0.28);
        hiss(t, { len: 0.035, peak: s % 4 === 2 ? 0.1 : 0.045 });
        if (s % 4 === 2) hiss(t, { len: 0.22, peak: 0.05, hp: 9000 });
        if (s === 4 || s === 12) {
          clap(t, 0.1);
          hiss(t, { len: 0.16, peak: 0.12, bp: 2600 });
        }
        if (s % 4 !== 0) tone(t, { freq: hz([45, 45, 52, 45][Math.floor(s / 4)]), len: L * 0.8, peak: 0.13, cutoff: 500, sweep: 400, q: 4 });
        if (s % 2 === 0) {
          const arp = [69, 72, 76, 79, 76, 72, 69, 64];
          tone(t, { type: "square", freq: hz(arp[(i / 2) % 8]), len: L * 1.2, peak: 0.035, cutoff: 1400 + 900 * Math.sin(bar / 4), q: 5, send: 0.3 });
        }
        if (bar % 16 === 0 && s === 0) hiss(t, { len: 1.6, peak: 0.12, hp: 5000 });
      },
    },
    {
      name: "sunset.lu",
      style: "synthwave",
      bpm: 92,
      echo: 0.75,
      play(i, t, L) {
        const s = i % 16;
        const bar = Math.floor(i / 16) % 4;
        const chords = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
        const roots = [45, 41, 48, 43];
        const chord = chords[bar];
        if (s === 0) for (const n of chord) for (const d of [-7, 7]) tone(t, { freq: hz(n), len: L * 16, peak: 0.03, cutoff: 900, attack: 0.4, detune: d });
        if (s % 2 === 0) tone(t, { freq: hz(roots[bar] - 12 + (s % 4 === 2 ? 12 : 0)), len: L * 1.6, peak: 0.12, cutoff: 420 });
        tone(t, { type: "triangle", freq: hz(chord[[0, 1, 2, 1, 2, 0, 1, 2][s % 8]] + 12), len: L * 0.9, peak: 0.05, cutoff: 3000, send: 0.35 });
        if (s % 4 === 0) kick(t, 0.9);
        if (s === 4 || s === 12) hiss(t, { len: 0.18, peak: 0.16, bp: 1200, send: 0.3 });
        if (s % 2 === 1) hiss(t, { len: 0.04, peak: 0.04 });
      },
    },
  ];

  const stepLen = () => 60 / tracks[state.track].bpm / 4;

  function pump() {
    const track = tracks[state.track];
    const L = stepLen();
    while (state.next < ac.currentTime + 0.12) {
      track.play(state.step, state.next, L);
      state.next += L;
      state.step++;
    }
  }

  function begin() {
    const track = tracks[state.track];
    echo.delayTime.setValueAtTime((60 / track.bpm) * track.echo, ac.currentTime);
    state.step = 0;
    state.next = ac.currentTime + 0.08;
    state.origin = state.next;
    clearInterval(state.timer);
    state.timer = setInterval(pump, 25);
    pump();
  }

  function announce() {
    document.dispatchEvent(new CustomEvent("track", { detail: window.synthwave.now }));
  }

  const files = Array.isArray(window.TRACKS) ? window.TRACKS.filter((t) => t && t.src) : [];
  if (files.length) {
    const audio = new Audio();
    audio.preload = "auto";
    let analyser = null;
    let level = null;
    let bins = null;
    let slow = 0;
    let env = 0;
    const fileState = { on: false, track: 0 };
    const info = (i) => ({ name: files[i].title, style: files[i].artist || "", bpm: files[i].bpm || null });

    const ensure = () => {
      if (ac) return;
      ac = new (window.AudioContext || window.webkitAudioContext)();
      analyser = ac.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      bins = new Uint8Array(analyser.frequencyBinCount);
      level = ac.createGain();
      ac.createMediaElementSource(audio).connect(level).connect(analyser).connect(ac.destination);
    };

    const announceFile = () => document.dispatchEvent(new CustomEvent("track", { detail: window.synthwave.now }));

    audio.addEventListener("ended", () => window.synthwave.next());

    window.synthwave = {
      tracks: files.map((_, i) => info(i)),
      get playing() {
        return fileState.on;
      },
      get now() {
        return { index: fileState.track, ...info(fileState.track), playing: fileState.on };
      },
      beat() {
        if (!fileState.on || !analyser) return 0;
        analyser.getByteFrequencyData(bins);
        const top = Math.max(2, Math.round((150 / (ac.sampleRate / 2)) * bins.length));
        let sum = 0;
        for (let i = 0; i < top; i++) sum += bins[i];
        const level = sum / top / 255;
        const track = files[fileState.track];
        if (track.bpm && typeof track.offset === "number") {
          slow = Math.max(level, slow * 0.9995);
          const gate = slow > 0.05 ? Math.max(0, Math.min(1, (level / slow - 0.55) * 3)) : 1;
          const beatLen = 60 / track.bpm;
          const phase = ((((audio.currentTime - track.offset) % beatLen) + beatLen) % beatLen) / beatLen;
          return Math.exp(-phase * 7) * gate;
        }
        slow += (level - slow) * 0.05;
        const hit = Math.max(0, Math.min(1, (level - slow * 1.05) * 6));
        env = Math.max(hit, env * 0.82);
        return env;
      },
      async play(index = fileState.track) {
        ensure();
        const next = ((index % files.length) + files.length) % files.length;
        if (next !== fileState.track || !audio.src) audio.src = files[next].src;
        fileState.track = next;
        fileState.on = true;
        level.gain.setValueAtTime(files[next].gain ?? 1, ac.currentTime);
        document.body.classList.add("playing");
        await ac.resume();
        try {
          await audio.play();
        } catch (e) {
          fileState.on = false;
          document.body.classList.remove("playing");
        }
        announceFile();
        return this.now;
      },
      stop() {
        audio.pause();
        fileState.on = false;
        document.body.classList.remove("playing");
        announceFile();
        return this.now;
      },
      toggle() {
        if (fileState.on) this.stop();
        else this.play();
        return fileState.on;
      },
      next() {
        audio.src = "";
        return this.play(fileState.track + 1);
      },
      prev() {
        audio.src = "";
        return this.play(fileState.track - 1);
      },
    };
    return;
  }

  window.synthwave = {
    tracks: tracks.map(({ name, style, bpm }) => ({ name, style, bpm })),
    get playing() {
      return state.on;
    },
    get now() {
      const { name, style, bpm } = tracks[state.track];
      return { index: state.track, name, style, bpm, playing: state.on };
    },
    beat() {
      if (!state.on || !ac) return 0;
      const beatLen = 60 / tracks[state.track].bpm;
      const phase = (((ac.currentTime - state.origin) % beatLen) + beatLen) % beatLen / beatLen;
      return Math.exp(-phase * 7);
    },
    async play(index = state.track) {
      if (!ac) init();
      state.track = ((index % tracks.length) + tracks.length) % tracks.length;
      state.on = true;
      document.body.classList.add("playing");
      await ac.resume();
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setTargetAtTime(0.55, ac.currentTime, 0.3);
      begin();
      announce();
      return this.now;
    },
    stop() {
      if (!ac) return this.now;
      state.on = false;
      document.body.classList.remove("playing");
      clearInterval(state.timer);
      master.gain.setTargetAtTime(0, ac.currentTime, 0.12);
      setTimeout(() => {
        if (!state.on) ac.suspend();
      }, 800);
      announce();
      return this.now;
    },
    toggle() {
      if (state.on) this.stop();
      else this.play();
      return state.on;
    },
    next() {
      return this.play(state.track + 1);
    },
    prev() {
      return this.play(state.track - 1);
    },
  };
})();
