/**
 * Dreamy Soft Photo Bubble Physics Engine
 * Delivers buttery smooth 60/120 FPS floating motion, gentle harmonic repulsion (zero jerking),
 * organic fluid wave drift, soft boundary steering, and ethereal soap bubble aesthetics.
 */

class PhotoBubbleEngine {
  constructor(containerId, photos) {
    this.container = document.getElementById(containerId);
    this.photos = photos;
    this.bubbles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMouseOver = false;
    this.animId = null;
    this.running = false;
    this.lastTime = 0;
    this.shuffling = false;
    this.listenersAttached = false;

    this.init();
  }

  init() {
    if (!this.container) return;

    // Fail-safe width and height resolution handling hidden tabs
    const rect = this.container.getBoundingClientRect();
    const parentW = this.container.parentElement ? this.container.parentElement.clientWidth : 0;

    const width = rect.width > 200 ? rect.width : (parentW > 200 ? parentW : (window.innerWidth ? Math.min(window.innerWidth - 40, 960) : 880));
    const height = rect.height > 200 ? rect.height : 520;

    // Track mouse & touch position relative to container
    if (!this.listenersAttached) {
      window.addEventListener('mousemove', (e) => {
        if (!this.container) return;
        const cRect = this.container.getBoundingClientRect();
        this.mouseX = e.clientX - cRect.left;
        this.mouseY = e.clientY - cRect.top;
        this.isMouseOver = (
          e.clientX >= cRect.left && e.clientX <= cRect.right &&
          e.clientY >= cRect.top && e.clientY <= cRect.bottom
        );
      });

      window.addEventListener('touchmove', (e) => {
        if (!this.container) return;
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          const cRect = this.container.getBoundingClientRect();
          this.mouseX = touch.clientX - cRect.left;
          this.mouseY = touch.clientY - cRect.top;
          this.isMouseOver = (
            touch.clientX >= cRect.left && touch.clientX <= cRect.right &&
            touch.clientY >= cRect.top && touch.clientY <= cRect.bottom
          );
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isMouseOver = false;
      }, { passive: true });

      // Pause when browser tab loses focus to prevent physics drift
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });

      this.listenersAttached = true;
    }

    // Clear any previous bubbles cleanly
    this.container.innerHTML = '';
    this.bubbles = [];

    // Responsive Bubble Density & Sizing
    // Prevents cramped gridlock which caused collision vibration/jerking
    const isMobile = window.innerWidth < 768 || width < 768;
    const maxBubbles = isMobile ? (width < 450 ? 5 : 6) : (width < 1050 ? 8 : 9);
    const displayPhotos = this.photos.slice(0, maxBubbles);
    const baseSize = isMobile ? 74 : 104;

    displayPhotos.forEach((photo) => {
      // Gentle size variance for realistic natural depth
      const size = Math.floor(Math.random() * 14) + baseSize;
      const radius = size / 2;

      // Safe initial spawn coordinates with generous margins
      const padX = radius + 25;
      const padY = radius + 25;
      const maxSpawnX = Math.max(padX + 20, width - padX);
      const maxSpawnY = Math.max(padY + 20, height - padY - 50);

      let x = Math.random() * (maxSpawnX - padX) + padX;
      let y = Math.random() * (maxSpawnY - padY) + padY;

      // Find non-overlapping spawn spot
      let attempts = 0;
      while (this.checkInitialOverlap(x, y, radius) && attempts < 150) {
        x = Math.random() * (maxSpawnX - padX) + padX;
        y = Math.random() * (maxSpawnY - padY) + padY;
        attempts++;
      }

      // Create Bubble DOM Element
      const bubbleElem = document.createElement('div');
      bubbleElem.className = 'bubble-item interactive';
      bubbleElem.style.width = `${size}px`;
      bubbleElem.style.height = `${size}px`;

      // Soft Photo Element inside bubble
      const imgElem = document.createElement('img');
      imgElem.src = photo.src;
      imgElem.alt = photo.title || 'Romantic Memory';
      imgElem.loading = 'eager';

      imgElem.onerror = () => {
        imgElem.style.display = 'none';
        bubbleElem.style.background = 'radial-gradient(circle at 35% 35%, #ff8fa3 0%, #ff4b72 100%)';
        bubbleElem.style.display = 'flex';
        bubbleElem.style.alignItems = 'center';
        bubbleElem.style.justifyContent = 'center';
        bubbleElem.innerHTML = `<span style="font-size:2rem; filter: drop-shadow(0 0 8px rgba(255,255,255,0.7));">💖</span>`;
      };

      bubbleElem.appendChild(imgElem);
      this.container.appendChild(bubbleElem);

      // Gentle initial velocity (0.2 - 0.42 px/frame for peaceful float)
      const angle = Math.random() * Math.PI * 2;
      const initialSpeed = Math.random() * 0.22 + 0.2;

      const bubble = {
        element: bubbleElem,
        x: x,
        y: y,
        vx: Math.cos(angle) * initialSpeed,
        vy: Math.sin(angle) * initialSpeed,
        radius: radius,
        mass: radius * radius,
        photo: photo,
        // Individual harmonic wave parameters for natural organic floating drift
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        freqX: Math.random() * 0.0006 + 0.0008,
        freqY: Math.random() * 0.0006 + 0.0009,
        ampX: Math.random() * 6 + 6,
        ampY: Math.random() * 7 + 7,
        // Smoothed lerp offsets for mouse repulsion & hover scale
        currentOffsetX: 0,
        currentOffsetY: 0,
        currentScale: 1.0,
        isHovered: false
      };

      // Hover interaction with JS interpolation (avoids CSS/JS transform conflict)
      bubbleElem.addEventListener('mouseenter', () => {
        bubble.isHovered = true;
        bubbleElem.style.zIndex = '35';
      });
      bubbleElem.addEventListener('mouseleave', () => {
        bubble.isHovered = false;
        bubbleElem.style.zIndex = '10';
      });

      // Tap / Click Handler to open Lightbox
      bubbleElem.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openLightbox(photo);
        if (window.effectsEngine) {
          window.effectsEngine.spawnSparkleBurst(e.clientX, e.clientY);
        }
      });

      this.bubbles.push(bubble);
    });

    // Start 60/120 FPS animation loop
    this.startLoop();
  }

  checkInitialOverlap(x, y, radius) {
    for (let b of this.bubbles) {
      const dx = x - b.x;
      const dy = y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < radius + b.radius + 20) {
        return true;
      }
    }
    return false;
  }

  startLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.running = true;
    this.lastTime = performance.now();

    const update = (timestamp) => {
      if (!this.running) return;
      const dt = Math.min((timestamp - this.lastTime) / 16.67, 1.8) || 1.0;
      this.lastTime = timestamp;

      this.updatePhysics(dt, timestamp);
      this.animId = requestAnimationFrame(update);
    };

    this.animId = requestAnimationFrame(update);
  }

  pause() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  resume() {
    if (!this.running) {
      this.startLoop();
    }
  }

  updatePhysics(dt, timestamp) {
    if (!this.container || this.bubbles.length === 0) return;

    const containerW = this.container.clientWidth;
    const containerH = this.container.clientHeight;

    const width = containerW > 200 ? containerW : 880;
    const height = containerH > 200 ? containerH : 520;

    // 1. Soft Inter-Bubble Harmonic Repulsion (Zero Jerking)
    const len = this.bubbles.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const b1 = this.bubbles[i];
        const b2 = this.bubbles[j];

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const minDist = b1.radius + b2.radius + 14;

        if (dist < minDist) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Gentle spring acceleration proportional to overlap
          const force = (overlap / minDist) * 0.038 * dt;

          b1.vx -= nx * force;
          b1.vy -= ny * force;
          b2.vx += nx * force;
          b2.vy += ny * force;

          // Gentle soft relaxation nudge (no teleporting)
          const relax = overlap * 0.045 * dt;
          b1.x -= nx * relax;
          b1.y -= ny * relax;
          b2.x += nx * relax;
          b2.y += ny * relax;
        }
      }
    }

    // 2. Bubble Integration, Soft Boundary Steering & Organic Floating Drift
    const now = timestamp || performance.now();

    this.bubbles.forEach((b) => {
      // Soft boundary cushioning (smooth curve away instead of hard bounce)
      const padLeft = b.radius + 16;
      const padRight = width - b.radius - 16;
      const padTop = b.radius + 16;
      const padBottom = height - b.radius - 50; // Clearance for bottom UI

      if (b.x < padLeft) {
        b.vx += (padLeft - b.x) * 0.0035 * dt;
        if (b.x < b.radius + 4) {
          b.x = b.radius + 4;
          b.vx = Math.abs(b.vx) * 0.5;
        }
      } else if (b.x > padRight) {
        b.vx -= (b.x - padRight) * 0.0035 * dt;
        if (b.x > width - b.radius - 4) {
          b.x = width - b.radius - 4;
          b.vx = -Math.abs(b.vx) * 0.5;
        }
      }

      if (b.y < padTop) {
        b.vy += (padTop - b.y) * 0.0035 * dt;
        if (b.y < b.radius + 4) {
          b.y = b.radius + 4;
          b.vy = Math.abs(b.vy) * 0.5;
        }
      } else if (b.y > padBottom) {
        b.vy -= (b.y - padBottom) * 0.0035 * dt;
        if (b.y > height - b.radius - 35) {
          b.y = height - b.radius - 35;
          b.vy = -Math.abs(b.vy) * 0.5;
        }
      }

      // Air resistance damping (prevents speed runaway)
      b.vx *= Math.pow(0.993, dt);
      b.vy *= Math.pow(0.993, dt);

      // Maintain serene floating speed (0.22 - 0.62 px/frame)
      const speed = Math.hypot(b.vx, b.vy);
      const minSpeed = 0.22;
      const maxSpeed = 0.62;

      if (speed < minSpeed) {
        const dir = Math.atan2(b.vy, b.vx) || (Math.random() * Math.PI * 2);
        b.vx += Math.cos(dir) * 0.015 * dt;
        b.vy += Math.sin(dir) * 0.015 * dt;
      } else if (speed > maxSpeed) {
        const factor = maxSpeed / speed;
        b.vx *= factor;
        b.vy *= factor;
      }

      // Position update
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Mouse Proximity Soft Glide (Smooth Lerp Evade)
      let targetDx = 0;
      let targetDy = 0;
      if (this.isMouseOver) {
        const mdx = b.x - this.mouseX;
        const mdy = b.y - this.mouseY;
        const mDist = Math.hypot(mdx, mdy);
        if (mDist < 170 && mDist > 0.5) {
          const norm = (170 - mDist) / 170;
          const force = norm * norm * 22; // Quadratic smooth falloff
          targetDx = (mdx / mDist) * force;
          targetDy = (mdy / mDist) * force;
        }
      }

      // Lerp mouse offset (silky smooth ease)
      b.currentOffsetX += (targetDx - b.currentOffsetX) * (0.07 * dt);
      b.currentOffsetY += (targetDy - b.currentOffsetY) * (0.07 * dt);

      // Lerp hover scale
      const targetScale = b.isHovered ? 1.13 : 1.0;
      b.currentScale += (targetScale - b.currentScale) * (0.12 * dt);

      // Natural harmonic wave oscillation (simulates air currents)
      const waveX = Math.sin(now * b.freqX + b.phaseX) * b.ampX;
      const waveY = Math.cos(now * b.freqY + b.phaseY) * b.ampY;

      // Final render coordinates
      const renderX = (b.x - b.radius + b.currentOffsetX + waveX);
      const renderY = (b.y - b.radius + b.currentOffsetY + waveY);

      // Hardware-accelerated 3D transform with subpixel precision
      b.element.style.transform = `translate3d(${renderX.toFixed(2)}px, ${renderY.toFixed(2)}px, 0) scale(${b.currentScale.toFixed(3)})`;
    });
  }

  // Smooth shuffle with soft bloom transition
  shuffle() {
    if (this.shuffling) return;
    this.shuffling = true;

    // Fade out current bubbles softly
    this.bubbles.forEach((b) => {
      b.element.style.transition = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
      b.element.style.opacity = '0';
      b.element.style.transform += ' scale(0.6)';
    });

    setTimeout(() => {
      this.photos.sort(() => Math.random() - 0.5);
      this.init();
      // Bloom in
      this.bubbles.forEach((b, idx) => {
        b.element.style.opacity = '0';
        b.element.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => {
          b.element.style.opacity = '1';
          setTimeout(() => {
            b.element.style.transition = '';
            this.shuffling = false;
          }, 500);
        }, idx * 40);
      });
    }, 260);
  }

  openLightbox(photo) {
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const modalTitle = document.getElementById('lightbox-title');
    const modalSub = document.getElementById('lightbox-sub');

    if (modal && modalImg) {
      modalImg.src = photo.src;
      if (modalTitle) modalTitle.textContent = photo.title || 'Romantic Memory';
      if (modalSub) modalSub.textContent = photo.note || '';
      modal.classList.add('active');
    }
  }
}
