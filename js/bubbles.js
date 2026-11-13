/**
 * Dreamy Soft Photo Bubble Physics Engine
 * Delivers real soap bubble soft squash & stretch deformation,
 * fluffy elastic bouncy physics, harmonic fluid drift, and iridescent aesthetics.
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
    // Prevents cramped gridlock so bubbles have room to bounce & squish softly
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

      // Lively buoyant initial velocity (0.55 - 0.90 px/frame for joyful floating)
      const angle = Math.random() * Math.PI * 2;
      const initialSpeed = Math.random() * 0.35 + 0.55;

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
        // Real bubble soft squash & stretch elastic states
        squash: 0,        // Current deformation factor (<0 is compressed, >0 is stretched)
        squashVel: 0,     // Rate of deformation oscillation
        squashAngle: 0,   // Orientation of contact compression (radians)
        // Smoothed lerp offsets for mouse repulsion & hover scale
        currentOffsetX: 0,
        currentOffsetY: 0,
        currentScale: 1.0,
        isHovered: false
      };

      // Hover interaction with cute fluffy squish reaction
      bubbleElem.addEventListener('mouseenter', () => {
        bubble.isHovered = true;
        bubble.squashVel = -0.10; // Cute gentle squish when cursor touches bubble!
        bubbleElem.style.zIndex = '35';
      });
      bubbleElem.addEventListener('mouseleave', () => {
        bubble.isHovered = false;
        bubbleElem.style.zIndex = '10';
      });

      // Tap / Click Handler to open Lightbox with fluffy squish reaction
      bubbleElem.addEventListener('click', (e) => {
        e.stopPropagation();
        // Playful fluffy squish wobble impulse on tap
        bubble.squashVel = -0.18;
        bubble.squashAngle = Math.random() * Math.PI * 2;
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

    // 1. Soft Inter-Bubble Fluffy Squash & Elastic Bouncy Effect
    const len = this.bubbles.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const b1 = this.bubbles[i];
        const b2 = this.bubbles[j];

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        // Slightly wider touch cushion distance so soft glowing halos interact
        const minDist = b1.radius + b2.radius + 14;

        if (dist < minDist) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Relative approach velocity along contact normal
          const relVx = b1.vx - b2.vx;
          const relVy = b1.vy - b2.vy;
          const approachVel = relVx * nx + relVy * ny;

          // Fluffy elastic bouncy repulsion impulse (lively, buoyant, not plastic)
          const springPush = (overlap / minDist) * 0.12 * dt;
          const bounceImpulse = approachVel > 0 ? approachVel * 0.52 : 0;
          const totalPush = springPush + bounceImpulse;

          b1.vx -= nx * totalPush;
          b1.vy -= ny * totalPush;
          b2.vx += nx * totalPush;
          b2.vy += ny * totalPush;

          // Soft position relaxation cushion
          const relax = overlap * 0.065 * dt;
          b1.x -= nx * relax;
          b1.y -= ny * relax;
          b2.x += nx * relax;
          b2.y += ny * relax;

          // REAL FLUFFY BUBBLE SQUASH & STRETCH:
          // Deforms softly inward along contact line (like fluffy jelly bubble)
          const contactIntensity = Math.min(0.24, (overlap / minDist) * 0.32 + (approachVel > 0 ? approachVel * 0.22 : 0));
          const impulse = contactIntensity * 0.58 * dt;

          b1.squashVel -= impulse;
          b2.squashVel -= impulse;

          // Target angles along impact normal
          const angle1 = Math.atan2(dy, dx);
          const angle2 = Math.atan2(-dy, -dx);

          // Smoothly steer deformation angle
          let d1 = angle1 - b1.squashAngle;
          while (d1 < -Math.PI) d1 += Math.PI * 2;
          while (d1 > Math.PI) d1 -= Math.PI * 2;
          b1.squashAngle += d1 * (0.38 * dt);

          let d2 = angle2 - b2.squashAngle;
          while (d2 < -Math.PI) d2 += Math.PI * 2;
          while (d2 > Math.PI) d2 -= Math.PI * 2;
          b2.squashAngle += d2 * (0.38 * dt);
        }
      }
    }

    // 2. Bubble Integration, Soft Boundary Steering & Organic Floating Drift
    const now = timestamp || performance.now();

    this.bubbles.forEach((b) => {
      // Soft boundary steering + fluffy bounce against container borders
      const padLeft = b.radius + 16;
      const padRight = width - b.radius - 16;
      const padTop = b.radius + 16;
      const padBottom = height - b.radius - 50; // Clearance for bottom UI

      if (b.x < padLeft) {
        const overlap = padLeft - b.x;
        b.vx += overlap * 0.007 * dt;
        b.squashVel -= (overlap / padLeft) * 0.05 * dt;
        b.squashAngle = 0;
        if (b.x < b.radius + 4) {
          b.x = b.radius + 4;
          b.vx = Math.abs(b.vx) * 0.72;
        }
      } else if (b.x > padRight) {
        const overlap = b.x - padRight;
        b.vx -= overlap * 0.007 * dt;
        b.squashVel -= (overlap / (width - padRight)) * 0.05 * dt;
        b.squashAngle = Math.PI;
        if (b.x > width - b.radius - 4) {
          b.x = width - b.radius - 4;
          b.vx = -Math.abs(b.vx) * 0.72;
        }
      }

      if (b.y < padTop) {
        const overlap = padTop - b.y;
        b.vy += overlap * 0.007 * dt;
        b.squashVel -= (overlap / padTop) * 0.05 * dt;
        b.squashAngle = Math.PI * 0.5;
        if (b.y < b.radius + 4) {
          b.y = b.radius + 4;
          b.vy = Math.abs(b.vy) * 0.72;
        }
      } else if (b.y > padBottom) {
        const overlap = b.y - padBottom;
        b.vy -= overlap * 0.007 * dt;
        b.squashVel -= (overlap / (height - padBottom)) * 0.05 * dt;
        b.squashAngle = -Math.PI * 0.5;
        if (b.y > height - b.radius - 35) {
          b.y = height - b.radius - 35;
          b.vy = -Math.abs(b.vy) * 0.72;
        }
      }

      // Air resistance damping (keeps lively momentum while preventing runaway)
      b.vx *= Math.pow(0.995, dt);
      b.vy *= Math.pow(0.995, dt);

      // Lively buoyant floating speed (0.50 - 1.15 px/frame for active, dreamy float)
      const speed = Math.hypot(b.vx, b.vy);
      const minSpeed = 0.50;
      const maxSpeed = 1.15;

      if (speed < minSpeed) {
        const dir = Math.atan2(b.vy, b.vx) || (Math.random() * Math.PI * 2);
        b.vx += Math.cos(dir) * 0.028 * dt;
        b.vy += Math.sin(dir) * 0.028 * dt;
      } else if (speed > maxSpeed) {
        const factor = maxSpeed / speed;
        b.vx *= factor;
        b.vy *= factor;
      }

      // Position update
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Damped harmonic spring for fluffy jelly bubble wobble recovery
      const kSquash = 0.11;      // Spring stiffness (soft, elastic)
      const dampingSquash = 0.87; // Fluffy underdamped jelly decay (gives 3 lively wobbles)

      const springAcc = -kSquash * b.squash;
      b.squashVel = (b.squashVel + springAcc * dt) * Math.pow(dampingSquash, dt);
      b.squash += b.squashVel * dt;

      // Safe bounds on squash deformation (-0.24 to +0.18)
      b.squash = Math.max(-0.24, Math.min(0.18, b.squash));

      // Mouse Proximity Soft Glide (Smooth Lerp Evade)
      let targetDx = 0;
      let targetDy = 0;
      if (this.isMouseOver) {
        const mdx = b.x - this.mouseX;
        const mdy = b.y - this.mouseY;
        const mDist = Math.hypot(mdx, mdy);
        if (mDist < 180 && mDist > 0.5) {
          const norm = (180 - mDist) / 180;
          const force = norm * norm * 28; // Responsive smooth falloff
          targetDx = (mdx / mDist) * force;
          targetDy = (mdy / mDist) * force;
        }
      }

      // Lerp mouse offset (silky smooth ease)
      b.currentOffsetX += (targetDx - b.currentOffsetX) * (0.08 * dt);
      b.currentOffsetY += (targetDy - b.currentOffsetY) * (0.08 * dt);

      // Lerp hover scale
      const targetScale = b.isHovered ? 1.15 : 1.0;
      b.currentScale += (targetScale - b.currentScale) * (0.14 * dt);

      // Natural harmonic wave oscillation (simulates air currents)
      const waveX = Math.sin(now * b.freqX + b.phaseX) * b.ampX;
      const waveY = Math.cos(now * b.freqY + b.phaseY) * b.ampY;

      // Final render coordinates
      const renderX = (b.x - b.radius + b.currentOffsetX + waveX);
      const renderY = (b.y - b.radius + b.currentOffsetY + waveY);

      // Squash & stretch along squashAngle:
      // Parallel axis (along impact): compressed when b.squash < 0
      // Perpendicular axis: expands outward to preserve bubble volume!
      const sx = (1 + b.squash).toFixed(3);
      const sy = (1 - b.squash * 0.65).toFixed(3);
      const ang = b.squashAngle.toFixed(3);

      // Hardware-accelerated 3D transform with directional squash and stretch
      b.element.style.transform = `translate3d(${renderX.toFixed(2)}px, ${renderY.toFixed(2)}px, 0) scale(${b.currentScale.toFixed(3)}) rotate(${ang}rad) scale(${sx}, ${sy}) rotate(${-ang}rad)`;

      // Toggle soft glowing compression sheen when touching
      if (Math.abs(b.squash) > 0.04) {
        b.element.classList.add('bubble-bouncing');
      } else {
        b.element.classList.remove('bubble-bouncing');
      }
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
