/**
 * Romantic Ambient Particle System & Cursor Love Trail Engine
 * Modes:
 * Mode 1: Magical (Heart/Sparkle/Petal Cursor Trail + Ambient Hearts/Petals)
 * Mode 2: Minimalist (Effects OFF)
 * Mode 3: Floating Photos (Mixed Small/Large Background Photo Bubbles + Photo Cursor Trail!)
 */

class RomanticEffectsEngine {
  constructor() {
    this.ambientCanvas = document.getElementById('ambient-canvas');
    this.trailCanvas = document.getElementById('love-trail-canvas');
    this.ambientCtx = this.ambientCanvas ? this.ambientCanvas.getContext('2d') : null;
    this.trailCtx = this.trailCanvas ? this.trailCanvas.getContext('2d') : null;

    this.ambientParticles = [];
    this.miniPhotoParticles = [];
    this.trailParticles = [];
    this.sparkles = [];
    this.currentMode = 1; // 1: Default Magical, 2: Minimal, 3: Floating Photos
    this.lastTrailTime = 0;

    // Pre-load floating background & cursor trail photos (assets/images/bubble_photos/)
    this.miniPhotoImages = [];
    [
      'assets/images/bubble_photos/bubble1.jpeg',
      'assets/images/bubble_photos/bubble2.jpeg',
      'assets/images/bubble_photos/bubble3.jpeg',
      'assets/images/bubble_photos/bubble4.jpeg',
      'assets/images/bubble_photos/bubble5.jpeg',
      'assets/images/bubble_photos/bubble6.jpeg',
      'assets/images/bubble_photos/bubble7.jpeg'
    ].forEach(src => {
      const img = new Image();
      img.src = src;
      this.miniPhotoImages.push(img);
    });

    this.init();
  }

  init() {
    this.resizeCanvases();
    window.addEventListener('resize', () => this.resizeCanvases());

    // Cursor / Touch Trail Event Listeners
    window.addEventListener('mousemove', (e) => this.addTrailParticle(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.addTrailParticle(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Populate ambient particles & mixed small/large photo particles
    this.createAmbientParticles();
    this.createMiniPhotoParticles();

    // Start 60 FPS animation loop
    this.startLoop();
  }

  resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.ambientCanvas) {
      this.ambientCanvas.width = w;
      this.ambientCanvas.height = h;
    }
    if (this.trailCanvas) {
      this.trailCanvas.width = w;
      this.trailCanvas.height = h;
    }
  }

  setMode(modeNum) {
    this.currentMode = parseInt(modeNum, 10);
    this.updateUI();
  }

  createAmbientParticles() {
    this.ambientParticles = [];
    const count = 45;

    const types = ['heart', 'petal', 'star', 'butterfly', 'sparkle'];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      this.ambientParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 12 + 10,
        speedY: type === 'petal' ? (Math.random() * 0.8 + 0.4) : -(Math.random() * 0.7 + 0.3),
        speedX: (Math.random() - 0.5) * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.7 + 0.3,
        type: type,
        char: type === 'heart' ? '💖' : (type === 'petal' ? '🌸' : (type === 'butterfly' ? '🦋' : '✨'))
      });
    }
  }

  createMiniPhotoParticles() {
    this.miniPhotoParticles = [];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const imgIndex = i % this.miniPhotoImages.length;
      // Mixed small (45px) to large (95px) sizes
      const size = Math.floor(Math.random() * 50) + 45;

      this.miniPhotoParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: size,
        speedY: -(Math.random() * 0.7 + 0.3),
        speedX: (Math.random() - 0.5) * 0.6,
        rotation: (Math.random() - 0.5) * 0.2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        opacity: 0.9,
        img: this.miniPhotoImages[imgIndex]
      });
    }
  }

  addTrailParticle(x, y) {
    // Mode 2: Minimalist (Cursor trail OFF)
    if (this.currentMode === 2) return;

    const now = Date.now();
    const interval = 22;
    if (now - this.lastTrailTime < interval) return;
    this.lastTrailTime = now;

    if (this.currentMode === 3) {
      // MODE 3 ONLY: Photo Cursor Trail (Mini photo bubbles follow cursor)
      const imgIndex = Math.floor(Math.random() * this.miniPhotoImages.length);
      const isPhotoTrail = Math.random() < 0.65;

      if (isPhotoTrail) {
        this.trailParticles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8 - 1.2,
          size: Math.random() * 12 + 28,
          opacity: 1,
          decay: Math.random() * 0.02 + 0.015,
          type: 'photo',
          img: this.miniPhotoImages[imgIndex]
        });
      } else {
        this.trailParticles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 1.0,
          size: Math.random() * 8 + 12,
          opacity: 1,
          decay: Math.random() * 0.025 + 0.015,
          type: 'char',
          char: Math.random() < 0.5 ? '✨' : '💖'
        });
      }
    } else if (this.currentMode === 1) {
      // MODE 1 ONLY: Magical Hearts & Sparkles Cursor Trail
      const trailChars = ['💖', '✨', '🌸', '💕', '⭐'];
      const char = trailChars[Math.floor(Math.random() * trailChars.length)];
      this.trailParticles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 1.0,
        size: Math.random() * 10 + 12,
        opacity: 1,
        decay: Math.random() * 0.025 + 0.015,
        type: 'char',
        char: char
      });
    }
  }

  spawnSparkleBurst(x, y) {
    if (this.currentMode === 2) return;

    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 / 24) * i;
      const speed = Math.random() * 4 + 2;
      const imgIndex = i % this.miniPhotoImages.length;
      
      this.sparkles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 12 + 24,
        opacity: 1,
        decay: Math.random() * 0.03 + 0.02,
        type: (this.currentMode === 3 && i % 2 === 0) ? 'photo' : 'char',
        img: this.miniPhotoImages[imgIndex],
        char: '✨'
      });
    }
  }

  startLoop() {
    const render = () => {
      this.renderAmbient();
      this.renderTrail();
      requestAnimationFrame(render);
    };
    render();
  }

  renderAmbient() {
    if (!this.ambientCtx || !this.ambientCanvas) return;
    const w = this.ambientCanvas.width;
    const h = this.ambientCanvas.height;

    this.ambientCtx.clearRect(0, 0, w, h);

    // Mode 2: Minimalist (Turn off background ambient particles)
    if (this.currentMode === 2) return;

    // Mode 1: Render default rising hearts, petals, stars
    if (this.currentMode === 1) {
      this.ambientParticles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.01) * 0.4;
        p.rotation += p.rotSpeed;

        if (p.speedY < 0 && p.y < -30) p.y = h + 30;
        if (p.speedY > 0 && p.y > h + 30) p.y = -30;
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;

        this.ambientCtx.save();
        this.ambientCtx.translate(p.x, p.y);
        this.ambientCtx.rotate(p.rotation);
        this.ambientCtx.globalAlpha = p.opacity;
        this.ambientCtx.font = `${p.size}px sans-serif`;
        this.ambientCtx.textAlign = 'center';
        this.ambientCtx.textBaseline = 'middle';
        this.ambientCtx.fillText(p.char, 0, 0);
        this.ambientCtx.restore();
      });
    }

    // Mode 3: Render Mixed Small & Large Floating Background Photo Bubbles (45px to 95px)
    if (this.currentMode === 3) {
      // 1. Render subtle background hearts & sparkles
      this.ambientParticles.forEach((p, idx) => {
        if (idx % 2 === 0) {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.y * 0.01) * 0.4;
          if (p.y < -30) p.y = h + 30;

          this.ambientCtx.save();
          this.ambientCtx.translate(p.x, p.y);
          this.ambientCtx.globalAlpha = 0.5;
          this.ambientCtx.font = `${p.size * 0.9}px sans-serif`;
          this.ambientCtx.textAlign = 'center';
          this.ambientCtx.textBaseline = 'middle';
          this.ambientCtx.fillText(p.char, 0, 0);
          this.ambientCtx.restore();
        }
      });

      // 2. Render mixed small & large floating photo bubbles
      this.miniPhotoParticles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.008) * 0.5;
        p.rotation += p.rotSpeed;

        if (p.y < -p.size - 25) {
          p.y = h + p.size + 25;
          p.x = Math.random() * w;
        }
        if (p.x < -p.size) p.x = w + p.size;
        if (p.x > w + p.size) p.x = -p.size;

        this.ambientCtx.save();
        this.ambientCtx.translate(p.x, p.y);
        this.ambientCtx.rotate(p.rotation);

        // Glowing white/rose gold border
        this.ambientCtx.shadowColor = 'rgba(255, 117, 140, 0.75)';
        this.ambientCtx.shadowBlur = 15;
        this.ambientCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ambientCtx.beginPath();
        this.ambientCtx.arc(0, 0, p.size / 2 + 3, 0, Math.PI * 2);
        this.ambientCtx.fill();

        // Clip circular photo
        if (p.img && p.img.complete && p.img.naturalWidth > 0) {
          this.ambientCtx.beginPath();
          this.ambientCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ambientCtx.clip();
          this.ambientCtx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          this.ambientCtx.fillStyle = '#ff4b72';
          this.ambientCtx.beginPath();
          this.ambientCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ambientCtx.fill();
        }

        this.ambientCtx.restore();

        // Heart badge on top of photo bubble
        this.ambientCtx.save();
        this.ambientCtx.font = `${Math.floor(p.size * 0.3)}px sans-serif`;
        this.ambientCtx.fillText('💖', p.x + p.size / 2 - 2, p.y - p.size / 2 + 2);
        this.ambientCtx.restore();
      });
    }
  }

  renderTrail() {
    if (!this.trailCtx || !this.trailCanvas) return;
    const w = this.trailCanvas.width;
    const h = this.trailCanvas.height;

    this.trailCtx.clearRect(0, 0, w, h);

    // Render trail particles
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.opacity -= p.decay;

      if (p.opacity <= 0) {
        this.trailParticles.splice(i, 1);
        continue;
      }

      if (p.type === 'photo' && p.img && p.img.complete && p.img.naturalWidth > 0) {
        this.trailCtx.save();
        this.trailCtx.translate(p.x, p.y);
        this.trailCtx.globalAlpha = p.opacity;

        this.trailCtx.shadowColor = 'rgba(255, 117, 140, 0.8)';
        this.trailCtx.shadowBlur = 10;
        this.trailCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.trailCtx.beginPath();
        this.trailCtx.arc(0, 0, p.size / 2 + 2, 0, Math.PI * 2);
        this.trailCtx.fill();

        this.trailCtx.beginPath();
        this.trailCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.trailCtx.clip();
        this.trailCtx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
        this.trailCtx.restore();
      } else {
        this.trailCtx.save();
        this.trailCtx.globalAlpha = p.opacity;
        this.trailCtx.font = `${p.size}px sans-serif`;
        this.trailCtx.textAlign = 'center';
        this.trailCtx.textBaseline = 'middle';
        this.trailCtx.fillText(p.char || '💖', p.x, p.y);
        this.trailCtx.restore();
      }
    }

    // Render sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.opacity -= s.decay;

      if (s.opacity <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }

      if (s.type === 'photo' && s.img && s.img.complete && s.img.naturalWidth > 0) {
        this.trailCtx.save();
        this.trailCtx.translate(s.x, s.y);
        this.trailCtx.globalAlpha = s.opacity;

        this.trailCtx.shadowColor = 'rgba(255, 224, 130, 0.8)';
        this.trailCtx.shadowBlur = 10;
        this.trailCtx.fillStyle = '#fff';
        this.trailCtx.beginPath();
        this.trailCtx.arc(0, 0, s.size / 2 + 2, 0, Math.PI * 2);
        this.trailCtx.fill();

        this.trailCtx.beginPath();
        this.trailCtx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
        this.trailCtx.clip();
        this.trailCtx.drawImage(s.img, -s.size / 2, -s.size / 2, s.size, s.size);
        this.trailCtx.restore();
      } else {
        this.trailCtx.save();
        this.trailCtx.globalAlpha = s.opacity;
        this.trailCtx.font = `${s.size}px sans-serif`;
        this.trailCtx.textAlign = 'center';
        this.trailCtx.textBaseline = 'middle';
        this.trailCtx.fillText(s.char || '✨', s.x, s.y);
        this.trailCtx.restore();
      }
    }
  }

  updateUI() {
    document.querySelectorAll('.mode-toggle-btn').forEach((btn) => {
      const mode = parseInt(btn.dataset.mode, 10);
      if (mode === this.currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

window.effectsEngine = new RomanticEffectsEngine();
