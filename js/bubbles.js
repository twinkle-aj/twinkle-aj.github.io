/**
 * Interactive Photo Bubble Physics Engine
 * Handles 60 FPS floating motion, non-overlapping collisions, parallax, and tap interactions.
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

    this.init();
  }

  init() {
    if (!this.container) return;

    // Fail-safe width and height resolution handling hidden tabs
    const rect = this.container.getBoundingClientRect();
    const parentW = this.container.parentElement ? this.container.parentElement.clientWidth : 0;

    const width = rect.width > 200 ? rect.width : (parentW > 200 ? parentW : (window.innerWidth ? Math.min(window.innerWidth - 40, 900) : 800));
    const height = rect.height > 200 ? rect.height : 500;

    // Track mouse & touch position relative to container
    window.addEventListener('mousemove', (e) => {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.isMouseOver = (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      );
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.container) return;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.container.getBoundingClientRect();
        this.mouseX = touch.clientX - rect.left;
        this.mouseY = touch.clientY - rect.top;
        this.isMouseOver = true;
      }
    }, { passive: true });

    // Clear any previous bubbles
    this.container.innerHTML = '';
    this.bubbles = [];

    // Spawn bubbles with responsive sizing and spacious count
    const isMobile = window.innerWidth < 768 || width < 768;
    // On mobile screens (< 768px), display 5 spacious floating photo bubbles for maximum breathing room
    const displayPhotos = isMobile ? this.photos.slice(0, 5) : this.photos;
    const baseSize = isMobile ? 72 : 105;

    displayPhotos.forEach((photo, i) => {
      const size = Math.floor(Math.random() * 12) + baseSize;
      const radius = size / 2;

      let x = Math.random() * (width - size) + radius;
      let y = Math.random() * (height - size - 50) + radius;

      // Ensure valid positive bounds
      x = Math.max(radius + 15, Math.min(width - radius - 15, x));
      y = Math.max(radius + 15, Math.min(height - radius - 60, y));

      // Ensure initial separation
      let attempts = 0;
      while (this.checkInitialOverlap(x, y, radius) && attempts < 120) {
        x = Math.random() * (width - size) + radius;
        y = Math.random() * (height - size - 50) + radius;
        x = Math.max(radius + 15, Math.min(width - radius - 15, x));
        y = Math.max(radius + 15, Math.min(height - radius - 60, y));
        attempts++;
      }

      const bubbleElem = document.createElement('div');
      bubbleElem.className = 'bubble-item interactive';
      bubbleElem.style.width = `${size}px`;
      bubbleElem.style.height = `${size}px`;

      const imgElem = document.createElement('img');
      imgElem.src = photo.src;
      imgElem.alt = photo.title || 'Romantic Memory';

      // Fallback styling if image fails to load
      imgElem.onerror = () => {
        imgElem.style.display = 'none';
        bubbleElem.style.background = 'linear-gradient(135deg, #ff758c 0%, #ff4b72 100%)';
        bubbleElem.style.display = 'flex';
        bubbleElem.style.alignItems = 'center';
        bubbleElem.style.justifyContent = 'center';
        bubbleElem.innerHTML = `<span style="font-size:2.4rem;">💖</span>`;
      };

      bubbleElem.appendChild(imgElem);
      this.container.appendChild(bubbleElem);

      const bubble = {
        element: bubbleElem,
        x: x,
        y: y,
        vx: (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 0.8 + 0.5),
        vy: (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 0.8 + 0.5),
        radius: radius,
        mass: radius,
        photo: photo
      };

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

    // Start 60 FPS animation loop
    this.startLoop();
  }

  checkInitialOverlap(x, y, radius) {
    for (let b of this.bubbles) {
      const dx = x - b.x;
      const dy = y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius + b.radius + 15) {
        return true;
      }
    }
    return false;
  }

  startLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);

    const update = () => {
      this.updatePhysics();
      this.animId = requestAnimationFrame(update);
    };

    update();
  }

  updatePhysics() {
    if (!this.container) return;

    const containerW = this.container.clientWidth;
    const containerH = this.container.clientHeight;

    const width = containerW > 200 ? containerW : 800;
    const height = containerH > 200 ? containerH : 500;

    // 1. Move bubbles & Container Wall Collision
    this.bubbles.forEach((b) => {
      // Maintain active float motion
      const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (speed < 0.8) {
        b.vx = (b.vx || 1) * 1.3;
        b.vy = (b.vy || 1) * 1.3;
      }

      b.x += b.vx;
      b.y += b.vy;

      // Wall bouncing with clearance for bottom music player
      if (b.x - b.radius < 10) {
        b.x = b.radius + 10;
        b.vx *= -1;
      } else if (b.x + b.radius > width - 10) {
        b.x = width - b.radius - 10;
        b.vx *= -1;
      }

      if (b.y - b.radius < 10) {
        b.y = b.radius + 10;
        b.vy *= -1;
      } else if (b.y + b.radius > height - 65) {
        b.y = height - b.radius - 65;
        b.vy *= -1;
      }

      // Magnetic Parallax on Mouse Over
      let targetDx = 0;
      let targetDy = 0;
      if (this.isMouseOver) {
        const dx = b.x - this.mouseX;
        const dy = b.y - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180;
          targetDx = (dx / dist) * force * 15;
          targetDy = (dy / dist) * force * 15;
        }
      }

      // Apply transform with 3D translation
      b.element.style.transform = `translate3d(${b.x - b.radius + targetDx}px, ${b.y - b.radius + targetDy}px, 0)`;
    });

    // 2. Inter-bubble Elastic Collision Resolution
    for (let i = 0; i < this.bubbles.length; i++) {
      for (let j = i + 1; j < this.bubbles.length; j++) {
        const b1 = this.bubbles[i];
        const b2 = this.bubbles[j];

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Separate bubbles
          b1.x -= nx * overlap * 0.5;
          b1.y -= ny * overlap * 0.5;
          b2.x += nx * overlap * 0.5;
          b2.y += ny * overlap * 0.5;

          // Elastic collision momentum swap
          const kx = b1.vx - b2.vx;
          const ky = b1.vy - b2.vy;
          const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);

          b1.vx -= p * b2.mass * nx;
          b1.vy -= p * b2.mass * ny;
          b2.vx += p * b1.mass * nx;
          b2.vy += p * b1.mass * ny;
        }
      }
    }
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
