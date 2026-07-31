/**
 * App Controller & Interactive Story Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Photos configuration for floating background bubbles (assets/images/bubble_photos/)
  const romanticPhotos = [
    { src: 'assets/images/floating_photos/float1.jpeg', title: 'Floating Moment ✨', note: 'Holding your hand feels like finding home in a world of starlight.' },
    { src: 'assets/images/floating_photos/float2.jpeg', title: 'Golden Sunset 🌅', note: 'Your smile lights up my world brighter than the golden hour.' },
    { src: 'assets/images/floating_photos/float3.jpeg', title: 'Blossom Dream 🌸', note: 'Every path walked with you is filled with sweet magic and bliss.' },
    { src: 'assets/images/floating_photos/float4.jpeg', title: 'Starry Embrace 🌌', note: 'Under the infinite stars, my heart will always choose you.' },
    { src: 'assets/images/floating_photos/float5.jpeg', title: 'Pure Serenade 💕', note: 'In your laughter, I hear the sweetest melody ever written.' },
    { src: 'assets/images/floating_photos/float6.jpeg', title: 'Sweet Magic 🌹', note: 'Every quiet second beside you is a treasure I keep in my soul.' },
    { src: 'assets/images/floating_photos/float7.jpeg', title: 'Forever Us 💍✨', note: 'My favorite place in the entire universe is right next to you.' },
    { src: 'assets/images/floating_photos/float8.jpeg', title: 'Moonlight Whisper 🌙', note: 'Whispering sweet dreams to the stars, knowing you are mine.' },
    { src: 'assets/images/floating_photos/float9.jpeg', title: 'Radiant Smile 💖', note: 'Your happiness is the sunshine that brightens my darkest days.' },
    { src: 'assets/images/floating_photos/float10.jpeg', title: 'Endless Joy 🥂', note: 'Celebrating every laugh and memory we build together.' },
    { src: 'assets/images/floating_photos/float11.jpeg', title: 'Warm Hugs 🫂✨', note: 'Wrapped in your arms is where I am safest and happiest.' },
    { src: 'assets/images/floating_photos/float12.jpeg', title: 'Starlight Romance 🌌', note: 'A love story written across infinite galaxies.' },
    { src: 'assets/images/floating_photos/float13.jpeg', title: 'Precious Smile 🥰', note: 'Capturing the beauty of your soul in every picture.' },
    { src: 'assets/images/floating_photos/float14.jpeg', title: 'Eternal Bond 💍🌹', note: 'Bound by heart and soul for all of time.' }
  ];

  // Initialize Photo Bubbles globally
  window.photoEngine = new PhotoBubbleEngine('bubbles-realm', romanticPhotos);

  // Set Option 1 as default track
  if (window.audioEngine) {
    window.audioEngine.currentTrackIndex = 0;
    window.audioEngine.updateUI();
  }

  // Loading Screen & Auto-play on Landing
  const loadingScreen = document.getElementById('loading-screen');
  const loadingStartBtn = document.getElementById('loading-start-btn');
  const startBtn = document.getElementById('start-story-btn');

  // Single click event listeners matching vinyl play button behavior
  if (loadingStartBtn) {
    loadingStartBtn.addEventListener('click', (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      if (window.audioEngine) window.audioEngine.play();

      // Default selected section on landing is 'hero' (Story)
      switchDeckSlide('hero');

      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.pointerEvents = 'none';
        setTimeout(() => {
          loadingScreen.style.visibility = 'hidden';
        }, 1000);
      }
    });
  }

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      if (window.audioEngine) window.audioEngine.play();

      // Advancing from Hero section goes to Little Us (childhood)
      switchDeckSlide('childhood');
    });
  }

  // Compact Story Deck Tab Switcher
  const deckTabBtns = document.querySelectorAll('.deck-tab-btn');
  const deckSlides = document.querySelectorAll('.deck-slide');

  function switchDeckSlide(targetId) {
    deckSlides.forEach((slide) => slide.classList.remove('active'));
    deckTabBtns.forEach((btn) => btn.classList.remove('active'));

    const activeSlide = document.getElementById(`deck-${targetId}`);
    const activeBtn = document.querySelector(`.deck-tab-btn[data-deck-target="${targetId}"]`);

    if (activeSlide) activeSlide.classList.add('active');
    if (activeBtn) {
      activeBtn.classList.add('active');
      try {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } catch (err) {}
    }

    // Refresh photo bubble physics whenever switching to bubbles section
    if (targetId === 'bubbles' && window.photoEngine) {
      setTimeout(() => {
        window.photoEngine.init();
      }, 60);
    }

    // Smoothly align viewport so section title has clean breathing space below tabbar
    const navBar = document.querySelector('.compact-deck-nav');
    if (navBar) {
      const navRect = navBar.getBoundingClientRect();
      if (navRect.top < 0 || navRect.top > 120) {
        navBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  deckTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.deckTarget;
      switchDeckSlide(target);
    });
  });

  const shuffleBtn = document.getElementById('shuffle-bubbles-btn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      if (window.photoEngine && window.photoEngine.photos) {
        window.photoEngine.photos.sort(() => Math.random() - 0.5);
        window.photoEngine.init();
      }
      if (window.effectsEngine) {
        const rect = shuffleBtn.getBoundingClientRect();
        window.effectsEngine.spawnSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });
  }

  // Music Player UI Controls
  const playPauseBtn = document.getElementById('music-play-btn');
  const muteBtn = document.getElementById('music-mute-btn');
  const volDownBtn = document.getElementById('vol-down-btn');
  const volUpBtn = document.getElementById('vol-up-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const trackSelector = document.getElementById('track-select');
  const quickTrackToggleBtn = document.getElementById('quick-track-toggle');
  const musicTogglePanelBtn = document.getElementById('music-toggle-panel');
  const musicControlsPanel = document.getElementById('music-controls-panel');
  // 3 Visual Experience Mode Toggler Buttons
  const modeToggleBtns = document.querySelectorAll('.mode-toggle-btn');
  modeToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = parseInt(btn.dataset.mode, 10);
      if (window.effectsEngine) {
        window.effectsEngine.setMode(mode);
      }
    });
  });

  if (volDownBtn) {
    volDownBtn.addEventListener('click', () => window.audioEngine && window.audioEngine.volumeDown());
  }

  if (volUpBtn) {
    volUpBtn.addEventListener('click', () => window.audioEngine && window.audioEngine.volumeUp());
  }

  if (quickTrackToggleBtn) {
    quickTrackToggleBtn.addEventListener('click', () => window.audioEngine && window.audioEngine.toggleNextTrack());
  }

  // Interactive 5 Music Option Grid Buttons
  const musicOptionBtns = document.querySelectorAll('.music-option-btn');
  musicOptionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.trackIndex, 10);
      if (window.audioEngine) {
        window.audioEngine.setTrack(idx);
        if (!window.audioEngine.isPlaying) {
          window.audioEngine.play();
        }
      }
      if (window.effectsEngine) {
        const rect = btn.getBoundingClientRect();
        window.effectsEngine.spawnSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });
  });

  const vinylDisc = document.getElementById('vinyl-disc');
  const togglePlayHandler = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (window.audioEngine) {
      window.audioEngine.togglePlay();
    }
  };

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlayHandler);
    playPauseBtn.addEventListener('touchend', togglePlayHandler);
  }

  if (vinylDisc) {
    vinylDisc.addEventListener('click', togglePlayHandler);
    vinylDisc.addEventListener('touchend', togglePlayHandler);
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => window.audioEngine && window.audioEngine.toggleMute());
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => window.audioEngine && window.audioEngine.setVolume(e.target.value));
  }

  if (trackSelector) {
    trackSelector.addEventListener('change', (e) => window.audioEngine && window.audioEngine.setTrack(e.target.value));
  }

  if (musicTogglePanelBtn && musicControlsPanel) {
    musicTogglePanelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      musicControlsPanel.classList.toggle('active');
    });
    document.addEventListener('click', () => {
      musicControlsPanel.classList.remove('active');
    });
    musicControlsPanel.addEventListener('click', (e) => e.stopPropagation());
  }

  const effectsToggleBtn = document.getElementById('effects-toggle-btn');
  if (effectsToggleBtn) {
    effectsToggleBtn.addEventListener('click', () => window.effectsEngine && window.effectsEngine.toggleEffects());
  }

  // Album Card Lightbox Click Listener
  const albumCards = document.querySelectorAll('.album-card');
  albumCards.forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.dataset.img;
      const title = card.dataset.title;
      const note = card.dataset.note;

      const modal = document.getElementById('lightbox-modal');
      const modalImg = document.getElementById('lightbox-img');
      const modalTitle = document.getElementById('lightbox-title');
      const modalSub = document.getElementById('lightbox-sub');

      if (modal && modalImg) {
        modalImg.src = img;
        if (modalTitle) modalTitle.textContent = title;
        if (modalSub) modalSub.textContent = note;
        modal.classList.add('active');
      }

      if (window.effectsEngine) {
        const rect = card.getBoundingClientRect();
        window.effectsEngine.spawnSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });
  });

  // Lightbox Close Handler (Click, Touch & Escape key)
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');

  const closeLightbox = (e) => {
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
    }
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
    }
  };

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxClose.addEventListener('touchend', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      const content = document.querySelector('.lightbox-content');
      if (!content || !content.contains(e.target) || e.target === lightboxClose) {
        closeLightbox(e);
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox(e);
    }
  });

  // Playful "No" Button Sequence
  const btnNo = document.getElementById('btn-no');
  const noToast = document.getElementById('no-toast');
  let dodgeCount = 0;
  let toastTimer = null;

  const playfulMessages = [
    "Wrong button! 😜",
    "Think again! 🥺",
    "Nice try! 💖",
    "Only YES is allowed! 🥰",
    "Are you sure? 🥺",
    "You can't escape my love! 🌹",
    "Nope! Try the heart above! 💖",
    "My heart says YES! 🥰",
    "Nice dodge attempt! 😉",
    "Just click YES! 💍✨",
    "Are you playing hard to get? 🙈",
    "Nope, that's illegal! 🚫💖",
    "Error 404: 'No' option not found! 💻✨",
    "My heart refuses this click! 💓",
    "Permission denied! 🔒💕",
    "Nice try, speedrunner! ⚡😜",
    "Did your finger slip? 😉",
    "I see what you did there! 😏💖",
    "Look up! The big YES button is waiting! 👆🌹",
    "System Overload: Too much love! 💥😍",
    "Not an option in this universe! 🌌✨",
    "Nice reflex, but YES is forever! 🏃‍♂️💨",
    "You're stuck with me! 💍🥰",
    "Try again with 100% more YES! 💖",
    "Bribe me with a kiss first! 💋",
    "Warning: Clicking No causes extra hugs! 🫂✨",
    "Denied by the Love Court! ⚖️💖",
    "Are you sure about that? 🧐💕",
    "Can't catch me! 🏃‍♀️✨",
    "Just say YES already! 👑💖",
    "Plot twist: There is no NO! 🎬💖",
    "Nice attempt, but I'm faster! 🏎️💨",
    "Are you testing my developer skills? 👨‍💻😜",
    "This button is powered by pure love! ⚡🥰",
    "Access Granted: Only for YES! 🔑✨",
    "Nice try, cutie! 😉🌹",
    "Your finger is heading the wrong way! 🧭💖",
    "I knew you'd try to click No! 🔮😜",
    "You're getting warmer... to YES! 🔥🥰",
    "Infinity dodges activated! ♾️💖",
    "My love is unclickable-ly strong! 💪🌹",
    "Did you really think No was possible? 🙈✨",
    "Try again, my love! 💕",
    "Resistance is futile! 🤖💖",
    "Press YES to claim your reward! 🎁💍"
  ];

  if (btnNo) {
    const moveNoButton = () => {
      dodgeCount++;

      if (dodgeCount <= 42) {
        const group = document.querySelector('.proposal-btn-group');
        const rect = group ? group.getBoundingClientRect() : { width: 300, height: 100 };

        const randomX = (Math.random() - 0.5) * (rect.width * 1.5);
        const randomY = (Math.random() - 0.5) * 80;

        btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;

        // Show playful toast message with 3.5s display duration
        if (noToast) {
          if (toastTimer) clearTimeout(toastTimer);
          noToast.textContent = playfulMessages[(dodgeCount - 1) % playfulMessages.length];
          noToast.style.opacity = '1';
          noToast.style.visibility = 'visible';
          noToast.style.transform = 'scale(1)';
          noToast.classList.add('show');
          toastTimer = setTimeout(() => {
            noToast.classList.remove('show');
            noToast.style.opacity = '0';
          }, 3500);
        }

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(20);
      } else {
        // After 42 attempts, hide the No button completely forever!
        btnNo.style.display = 'none';
        if (noToast) {
          if (toastTimer) clearTimeout(toastTimer);
          noToast.textContent = "Oops! The 'No' button ran away forever! Only YES remains! 💖✨";
          noToast.style.opacity = '1';
          noToast.style.visibility = 'visible';
          noToast.style.transform = 'scale(1)';
          noToast.classList.add('show');
        }
      }
    };

    const handleNoInteraction = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      moveNoButton();
    };

    btnNo.addEventListener('mouseover', moveNoButton);
    btnNo.addEventListener('click', handleNoInteraction);
    btnNo.addEventListener('touchstart', handleNoInteraction, { passive: false });
  }

  // "Yes" Button Direct Link Redirection
  const btnYes = document.getElementById('btn-yes');
  if (btnYes) {
    const handleYesClick = (e) => {
      e.preventDefault();
      if (window.audioEngine) window.audioEngine.playHeartChime();
      window.location.href = 'celebration.html';
    };
    btnYes.addEventListener('click', handleYesClick);
    btnYes.addEventListener('touchend', handleYesClick);
  }

  function triggerProposalSuccess() {
    // Play chime sound & celebration burst
    if (window.audioEngine) {
      window.audioEngine.playHeartChime();
    }

    // Burst massive sparkles across screen
    if (window.effectsEngine) {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          window.effectsEngine.spawnSparkleBurst(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight * 0.8
          );
        }, i * 150);
      }
    }

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Redirect to dedicated celebration.html page
    setTimeout(() => {
      window.location.href = 'celebration.html';
    }, 800);
  }

  // Interactive Love Letter Toggle
  const loveLetterBtn = document.getElementById('love-letter-btn');
  if (loveLetterBtn) {
    loveLetterBtn.addEventListener('click', () => {
      loveLetterBtn.classList.toggle('open');
      if (window.audioEngine) {
        window.audioEngine.playHeartChime();
      }
    });
  }

  // Fireworks Burst Trigger Button
  const fireworksBtn = document.getElementById('fireworks-burst-btn');
  if (fireworksBtn) {
    fireworksBtn.addEventListener('click', () => {
      if (window.audioEngine) window.audioEngine.playHeartChime();
      if (window.effectsEngine) {
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            window.effectsEngine.spawnSparkleBurst(
              Math.random() * window.innerWidth,
              Math.random() * window.innerHeight * 0.8
            );
          }, i * 150);
        }
      }
    });
  }

  // Celebration Modal Close / Replay Our Story
  const closeCelebrationBtn = document.getElementById('close-celebration-btn');
  if (closeCelebrationBtn) {
    closeCelebrationBtn.addEventListener('click', () => {
      const modal = document.getElementById('celebration-modal');
      if (modal) modal.classList.remove('active');
      switchDeckSlide('hero');
    });
  }

  // 1. Intersection Observer Scroll Reveal Animation
  const revealElements = document.querySelectorAll('.glass-card, .section-title, .section-subtitle');
  revealElements.forEach((el) => el.classList.add('reveal-on-scroll'));

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));

  // 2. Interactive 3D Card Tilt & Shimmer Effect on Mouse Move
  const tiltCards = document.querySelectorAll('.timeline-card, .album-card, .countdown-box');
  tiltCards.forEach((card) => {
    card.classList.add('shimmer-card');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (centerY - y) / 14;
      const rotateY = (x - centerX) / 14;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
});
