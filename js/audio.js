/**
 * Romantic Audio Engine - High Performance MP3 & Web Audio Synthesizer
 */

class RomanticAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.userHasManuallyPaused = false;
    this.currentVolume = 0.6;
    this.currentTrackIndex = 0;
    this.timerId = null;
    this.stepIndex = 0;

    // 5 Custom MP3 Tracks + Procedural Fallbacks
    this.tracks = [
      {
        id: 'option-1',
        name: 'Option 1: Romantic Melody 💖',
        path: 'assets/audio/romantic_music_1.mp3',
        type: 'file'
      },
      {
        id: 'option-2',
        name: 'Option 2: Sweet Serenade 💕',
        path: 'assets/audio/romantic_music_2.mp3',
        type: 'file'
      },
      {
        id: 'option-3',
        name: 'Option 3: Moonlight Waltz 🌸',
        path: 'assets/audio/romantic_music_3.mp3',
        type: 'file'
      },
      {
        id: 'option-4',
        name: 'Option 4: Starlight Symphony ✨',
        path: 'assets/audio/romantic_music_4.mp3',
        type: 'file'
      },
      {
        id: 'option-5',
        name: 'Option 5: Endless Love 🌹',
        path: 'assets/audio/romantic_music_5.mp3',
        type: 'file'
      },
      {
        id: 'synth-1',
        name: 'Soft Romantic Piano (Synth)',
        bpm: 65,
        type: 'piano',
        notes: [
          261.63, 329.63, 392.00, 493.88, 523.25,
          220.00, 261.63, 329.63, 392.00, 440.00,
          174.61, 220.00, 261.63, 329.63, 349.23,
          196.00, 246.94, 293.66, 392.00, 493.88
        ]
      },
      {
        id: 'synth-2',
        name: 'Romantic Acoustic Strings (Synth)',
        bpm: 50,
        type: 'strings',
        notes: [
          261.63, 329.63, 392.00, 523.25,
          220.00, 261.63, 329.63, 440.00,
          174.61, 261.63, 349.23, 523.25,
          196.00, 293.66, 392.00, 493.88
        ]
      },
      {
        id: 'synth-3',
        name: 'Midnight Lofi Serenade (Synth)',
        bpm: 58,
        type: 'lofi',
        notes: [
          130.81, 164.81, 196.00, 246.94, 329.63,
          110.00, 130.81, 164.81, 220.00, 261.63,
          174.61, 220.00, 261.63, 329.63, 392.00
        ]
      }
    ];

    // DOM Audio elements pool
    this.audioElements = {};
    document.addEventListener('DOMContentLoaded', () => {
      this.initAudioElements();
      this.attachGlobalAutoPlay();
      this.setupLifecycleMediaControls();
    });
    this.initAudioElements();
    this.attachGlobalAutoPlay();
    this.setupLifecycleMediaControls();
  }

  setupLifecycleMediaControls() {
    const stopAllMedia = () => {
      this.isPlaying = false;
      this.pause();
      document.querySelectorAll('audio, video').forEach((m) => {
        try {
          m.pause();
          m.currentTime = 0;
        } catch (e) {}
      });
    };

    window.addEventListener('pagehide', stopAllMedia);
    window.addEventListener('beforeunload', stopAllMedia);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAllMedia();
      }
    });

    window.addEventListener('pageshow', (event) => {
      const urlParams = new URLSearchParams(window.location.search);
      if (event.persisted || urlParams.get('stopMusic') === 'true' || sessionStorage.getItem('stopMusicOnReturn') === 'true') {
        stopAllMedia();
        sessionStorage.removeItem('stopMusicOnReturn');
      }
    });
  }

  attachGlobalAutoPlay() {
    const urlParams = new URLSearchParams(window.location.search);
    const isReturningFromCelebration = urlParams.get('stopMusic') === 'true' || sessionStorage.getItem('stopMusicOnReturn') === 'true';

    // Immediately clean up return flags so subsequent user clicks work freely
    sessionStorage.removeItem('stopMusicOnReturn');
    if (urlParams.get('stopMusic') === 'true') {
      try {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      } catch (e) {}
    }

    if (isReturningFromCelebration) {
      this.isPlaying = false;
      this.userHasManuallyPaused = true;
      this.pause();
      return;
    }

    const autoPlayHandler = (e) => {
      if (this.userHasManuallyPaused) return;
      if (e && e.target && e.target.closest && e.target.closest('.music-player-widget')) {
        return;
      }
      if (!this.isPlaying) {
        this.play();
      }
      ['click', 'touchstart', 'pointerdown', 'keydown', 'scroll', 'mousemove'].forEach((evt) => {
        window.removeEventListener(evt, autoPlayHandler);
      });
    };

    ['click', 'touchstart', 'pointerdown', 'keydown', 'scroll', 'mousemove'].forEach((evt) => {
      window.addEventListener(evt, autoPlayHandler, { once: true, passive: true });
    });
  }

  initAudioElements() {
    this.tracks.forEach((track, idx) => {
      if (track.type === 'file') {
        let elem = document.getElementById(`custom-audio-${idx}`);
        if (!elem) {
          elem = new Audio(track.path);
          elem.loop = false;
          elem.addEventListener('ended', () => {
            if (!this.userHasManuallyPaused) {
              this.toggleNextTrack();
            }
          });
        } else {
          elem.loop = false;
          elem.onended = () => {
            if (!this.userHasManuallyPaused) {
              this.toggleNextTrack();
            }
          };
        }
        elem.volume = this.currentVolume;
        this.audioElements[idx] = elem;
      }
    });
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playHeartChime() {
    this.initContext();
    if (!this.audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        const now = this.audioCtx.currentTime;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.3 * this.currentVolume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 1.3);
      }, idx * 110);
    });
  }

  play() {
    this.initContext();
    this.isPlaying = true;
    this.userHasManuallyPaused = false;

    // Instant audible feedback heart chime
    this.playHeartChime();

    const track = this.tracks[this.currentTrackIndex];
    let currentAudio = this.audioElements[this.currentTrackIndex];

    if (!currentAudio) {
      this.initAudioElements();
      currentAudio = this.audioElements[this.currentTrackIndex];
    }

    if (track && track.type === 'file' && currentAudio) {
      currentAudio.muted = false;
      currentAudio.volume = this.isMuted ? 0 : this.currentVolume;

      // Pause all other tracks
      Object.entries(this.audioElements).forEach(([idx, a]) => {
        if (parseInt(idx, 10) !== this.currentTrackIndex && a) {
          try { a.pause(); a.currentTime = 0; } catch (e) {}
        }
      });

      try {
        const playPromise = currentAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.updateUI();
          }).catch((err) => {
            console.warn('MP3 play failed, using procedural synth fallback:', err);
            this.playProcedural();
          });
        }
      } catch (err) {
        console.warn('MP3 play exception:', err);
        this.playProcedural();
      }

      // 400ms safety timer: If MP3 stutters or is restricted, fallback to synth
      setTimeout(() => {
        if (this.isPlaying && (currentAudio.paused || currentAudio.currentTime === 0)) {
          this.playProcedural();
        }
      }, 400);

    } else {
      this.playProcedural();
    }

    this.updateUI();
  }

  playProcedural() {
    this.initContext();
    const targetVol = this.isMuted ? 0 : this.currentVolume;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(targetVol, this.audioCtx.currentTime);
    }

    this.synthFallbackIndex = 5; // Soft Piano
    this.scheduleNotes();
  }

  pause() {
    this.isPlaying = false;
    this.userHasManuallyPaused = true;

    // Pause all custom audio elements
    Object.values(this.audioElements).forEach(audio => {
      if (audio) {
        try {
          audio.pause();
        } catch (e) {}
      }
    });

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.updateUI();
  }

  togglePlay() {
    this.initContext();
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  toggleNextTrack() {
    this.pause();
    if (this.currentTrackIndex >= 0 && this.currentTrackIndex < 4) {
      this.currentTrackIndex++;
    } else {
      this.currentTrackIndex = 0;
    }
    this.play();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const targetVol = this.isMuted ? 0 : this.currentVolume;
    const currentAudio = this.audioElements[this.currentTrackIndex];

    if (currentAudio) {
      currentAudio.volume = targetVol;
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(targetVol, this.audioCtx.currentTime);
    }
    this.updateUI();
  }

  setVolume(val) {
    this.currentVolume = Math.max(0.0, Math.min(1.0, parseFloat(val)));
    const targetVol = this.isMuted ? 0 : this.currentVolume;
    const currentAudio = this.audioElements[this.currentTrackIndex];

    if (currentAudio) {
      currentAudio.volume = targetVol;
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(targetVol, this.audioCtx.currentTime);
    }
    this.updateUI();
  }

  volumeUp() {
    const newVol = Math.min(1.0, Math.round((this.currentVolume + 0.1) * 10) / 10);
    this.setVolume(newVol);
  }

  volumeDown() {
    const newVol = Math.max(0.0, Math.round((this.currentVolume - 0.1) * 10) / 10);
    this.setVolume(newVol);
  }

  setTrack(index) {
    this.pause();

    Object.values(this.audioElements).forEach(audio => {
      if (audio) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
      }
    });

    this.currentTrackIndex = parseInt(index, 10);
    this.stepIndex = 0;

    this.play();
  }

  scheduleNotes() {
    if (!this.isPlaying) return;

    const trackIndex = (this.tracks[this.currentTrackIndex] && this.tracks[this.currentTrackIndex].type === 'file')
      ? (this.synthFallbackIndex !== undefined ? this.synthFallbackIndex : 5)
      : this.currentTrackIndex;

    const track = this.tracks[trackIndex];
    if (!track || !track.notes) return;

    const freq = track.notes[this.stepIndex % track.notes.length];
    this.playTone(freq, track.type);

    this.stepIndex++;
    const intervalMs = (60 / (track.bpm || 60)) * 1000 * 0.75;
    this.timerId = setTimeout(() => this.scheduleNotes(), intervalMs);
  }

  playTone(freq, type) {
    if (!this.audioCtx || !this.masterGain) return;

    const osc = this.audioCtx.createOscillator();
    const noteGain = this.audioCtx.createGain();

    osc.type = (type === 'strings') ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    const now = this.audioCtx.currentTime;
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.3, now + 0.12);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'lofi' ? 600 : 1800, now);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.4);
  }

  updateUI() {
    const vinylElem = document.getElementById('vinyl-disc');
    const playBtnIcon = document.getElementById('play-pause-icon');
    const muteBtnIcon = document.getElementById('mute-icon');
    const titleElem = document.getElementById('music-track-title');
    const trackSelect = document.getElementById('track-select');
    const volSlider = document.getElementById('volume-slider');

    if (titleElem && this.tracks[this.currentTrackIndex]) {
      titleElem.textContent = this.tracks[this.currentTrackIndex].name;
    }

    if (trackSelect) {
      trackSelect.value = this.currentTrackIndex;
    }

    if (volSlider) {
      volSlider.value = this.currentVolume;
    }

    if (vinylElem) {
      if (this.isPlaying) {
        vinylElem.classList.add('playing');
      } else {
        vinylElem.classList.remove('playing');
      }
    }

    if (playBtnIcon) {
      playBtnIcon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    if (muteBtnIcon) {
      muteBtnIcon.className = this.isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }
  }
}

window.audioEngine = new RomanticAudioEngine();
