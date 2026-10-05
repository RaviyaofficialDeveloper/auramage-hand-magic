/* Magic Audio Synthesizer via Web Audio API */
    class MagicAudioSynth {
      constructor() {
        this.ctx = null;
        this.enabled = true;
        this.lastSoundTime = 0;
      }

      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      // Mystic humming drone for shields
      playShieldHum(pitch = 220) {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        if (now - this.lastSoundTime < 0.12) return;
        this.lastSoundTime = now;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.3);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      }

      // Blast / Fireball eruption
      playFireBlast() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      }

      // High crystal zap chime for laser / runes
      playZap(freq = 880) {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.2);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }

      // Electric arc crackle
      playElectricCrackle() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500 + Math.random() * 400, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    }

    const sound = new MagicAudioSynth();

/* Particle & Spell Engine */
    const canvas = document.getElementById('magicCanvas');
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('webcamVideo');

    let width = window.innerWidth;
    let height = window.innerHeight;

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // App state
    const state = {
      activeMode: 'eldritch', // eldritch, fire, portal, lightning, lightpaint
      handsDetected: false,
      handsData: [],
      particles: [],
      runes: [],
      shockwaves: [],
      lightningBolts: [],
      shieldRotation: 0,
      portalAngle: 0,
      isMouseActive: false,
      mousePos: { x: width / 2, y: height / 2 },
      mouseIsDown: false,
      chargeLevel: 0,
      cameraActive: false
    };

    // Particle Object Pool
    class MagicParticle {
      constructor(x, y, color, vx, vy, size, life, shape = 'circle') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.maxLife = life;
        this.life = life;
        this.shape = shape;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 1;
        this.angle += this.spin;
        this.size *= 0.97;
      }

      draw(c) {
        const progress = this.life / this.maxLife;
        c.save();
        c.globalAlpha = Math.max(0, progress);
        c.translate(this.x, this.y);
        c.rotate(this.angle);

        c.fillStyle = this.color;
        c.shadowColor = this.color;
        c.shadowBlur = 15;

        if (this.shape === 'circle') {
          c.beginPath();
          c.arc(0, 0, Math.max(0.5, this.size), 0, Math.PI * 2);
          c.fill();
        } else if (this.shape === 'spark') {
          c.beginPath();
          c.moveTo(-this.size * 2, 0);
          c.lineTo(this.size * 2, 0);
          c.moveTo(0, -this.size * 2);
          c.lineTo(0, this.size * 2);
          c.lineWidth = this.size * 0.6;
          c.strokeStyle = this.color;
          c.stroke();
        } else if (this.shape === 'star') {
          const r = this.size * 1.5;
          c.beginPath();
          for (let i = 0; i < 5; i++) {
            c.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r, -Math.sin((18 + i * 72) * Math.PI / 180) * r);
            c.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (r / 2), -Math.sin((54 + i * 72) * Math.PI / 180) * (r / 2));
          }
          c.closePath();
          c.fill();
        }
        c.restore();
      }
    }

    function spawnSparks(x, y, count = 5, colorPalette = ['#f59e0b', '#fbbf24', '#ffffff', '#ea580c']) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 6;
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        const size = 2 + Math.random() * 4.5;
        const life = 25 + Math.floor(Math.random() * 30);
        state.particles.push(new MagicParticle(
          x, y, color,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          size, life,
          Math.random() > 0.4 ? 'spark' : 'circle'
        ));
      }
    }

    function addShockwave(x, y, color = '#f59e0b', maxR = 120) {
      state.shockwaves.push({
        x, y, color,
        radius: 5,
        maxRadius: maxR,
        alpha: 1
      });
    }

    /* Doctor Strange Style Eldritch Mandala Generator */
    function drawEldritchMandala(c, x, y, radius, rotation, intensity = 1) {
      c.save();
      c.translate(x, y);
      c.rotate(rotation);

      const gold = `rgba(245, 158, 11, ${0.85 * intensity})`;
      const brightGold = `rgba(254, 240, 138, ${0.95 * intensity})`;
      const orange = `rgba(234, 88, 12, ${0.75 * intensity})`;

      c.shadowColor = '#f59e0b';
      c.shadowBlur = 24 * intensity;

      // Outer flaming boundary
      c.strokeStyle = orange;
      c.lineWidth = 3.5;
      c.beginPath();
      c.arc(0, 0, radius, 0, Math.PI * 2);
      c.stroke();

      // Outer dashed spinning ring
      c.save();
      c.rotate(-rotation * 2.2);
      c.strokeStyle = gold;
      c.lineWidth = 2;
      c.setLineDash([8, 12]);
      c.beginPath();
      c.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      c.stroke();
      c.restore();

      // Interlocking Sacred Geometry Squares
      const sqSize = radius * 0.65;
      for (let i = 0; i < 3; i++) {
        c.save();
        c.rotate((i * Math.PI / 6) + rotation * 0.8);
        c.strokeStyle = brightGold;
        c.lineWidth = 2.2;
        c.strokeRect(-sqSize / 2, -sqSize / 2, sqSize, sqSize);
        c.restore();
      }

      // Concentric rings with Runes/Glyphs
      c.strokeStyle = gold;
      c.lineWidth = 1.8;
      c.setLineDash([]);
      c.beginPath();
      c.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
      c.stroke();

      // Mystic Glyphs around edge
      const glyphCount = 12;
      c.fillStyle = brightGold;
      c.font = `bold ${Math.max(10, radius * 0.12)}px 'Cinzel', serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const mysticChars = ['ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛃ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ'];
      for (let i = 0; i < glyphCount; i++) {
        const ga = (i * Math.PI * 2) / glyphCount;
        const gx = Math.cos(ga) * (radius * 0.76);
        const gy = Math.sin(ga) * (radius * 0.76);
        c.fillText(mysticChars[i % mysticChars.length], gx, gy);
      }

      // Central glowing core
      const coreGrad = c.createRadialGradient(0, 0, 0, 0, 0, radius * 0.35);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * intensity})`);
      coreGrad.addColorStop(0.4, `rgba(245, 158, 11, ${0.7 * intensity})`);
      coreGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      c.fillStyle = coreGrad;
      c.beginPath();
      c.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
      c.fill();

      c.restore();

      // Spawn ambient sparks along circumference
      if (Math.random() > 0.3) {
        const sparkAngle = Math.random() * Math.PI * 2;
        const sx = x + Math.cos(sparkAngle) * radius;
        const sy = y + Math.sin(sparkAngle) * radius;
        spawnSparks(sx, sy, 2, ['#f59e0b', '#fbbf24', '#ffffff', '#dc2626']);
      }
    }

    function drawCosmicPortal(c, x, y, radius, angle) {
      c.save();
      c.translate(x, y);

      // Swirling outer flame sparks
      const flameCount = 28;
      for (let i = 0; i < flameCount; i++) {
        const a = angle * 2.5 + (i * Math.PI * 2) / flameCount;
        const rOffset = Math.sin(angle * 4 + i) * 12;
        const r = radius + rOffset;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;

        c.fillStyle = i % 2 === 0 ? '#f97316' : '#facc15';
        c.shadowColor = '#ea580c';
        c.shadowBlur = 20;
        c.beginPath();
        c.arc(px, py, 3.5 + Math.sin(i) * 2, 0, Math.PI * 2);
        c.fill();
      }

      // Glowing circular fiery border
      c.beginPath();
      c.arc(0, 0, radius, 0, Math.PI * 2);
      c.strokeStyle = '#f59e0b';
      c.lineWidth = 8;
      c.shadowColor = '#ea580c';
      c.shadowBlur = 30;
      c.stroke();

      // Deep Space / Alternate Galaxy Inside Portal
      c.save();
      c.clip();

      const bgGrad = c.createRadialGradient(0, 0, 0, 0, 0, radius);
      bgGrad.addColorStop(0, '#312e81');
      bgGrad.addColorStop(0.6, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      c.fillStyle = bgGrad;
      c.fillRect(-radius, -radius, radius * 2, radius * 2);

      // Starfield inside
      for (let s = 0; s < 25; s++) {
        const sx = (Math.sin(s * 99 + angle * 0.5) * radius * 0.85);
        const sy = (Math.cos(s * 33 + angle * 0.5) * radius * 0.85);
        c.fillStyle = s % 3 === 0 ? '#38bdf8' : '#e0e7ff';
        c.beginPath();
        c.arc(sx, sy, (s % 3) + 1, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();

      c.restore();

      // Perimeter sparks
      const sa = Math.random() * Math.PI * 2;
      spawnSparks(x + Math.cos(sa) * radius, y + Math.sin(sa) * radius, 3, ['#fbbf24', '#f97316', '#ffffff']);
    }

    function drawFireballCharge(c, x, y, charge) {
      c.save();
      c.translate(x, y);

      const r = 25 + charge * 50;
      const grad = c.createRadialGradient(0, 0, 0, 0, 0, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#f59e0b');
      grad.addColorStop(0.7, '#ea580c');
      grad.addColorStop(1, 'rgba(185, 28, 28, 0)');

      c.shadowColor = '#f97316';
      c.shadowBlur = 35;
      c.fillStyle = grad;
      c.beginPath();
      c.arc(0, 0, r, 0, Math.PI * 2);
      c.fill();

      // Plasma Tendrils
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI / 4) + state.shieldRotation * 3;
        const dist = r * (0.8 + Math.random() * 0.5);
        c.strokeStyle = '#fef08a';
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(
          Math.cos(a + 0.5) * dist * 0.6,
          Math.sin(a + 0.5) * dist * 0.6,
          Math.cos(a) * dist,
          Math.sin(a) * dist
        );
        c.stroke();
      }
      c.restore();

      spawnSparks(x, y, Math.ceil(charge * 4), ['#ef4444', '#f97316', '#fbbf24', '#ffffff']);
    }

    function drawLightningBolts(c, startX, startY, targetX, targetY, color = '#38bdf8') {
      c.save();
      c.strokeStyle = color;
      c.shadowColor = color;
      c.shadowBlur = 18;
      c.lineWidth = 3;

      c.beginPath();
      c.moveTo(startX, startY);

      const dist = Math.hypot(targetX - startX, targetY - startY);
      const steps = Math.max(5, Math.floor(dist / 22));

      let currentX = startX;
      let currentY = startY;

      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        const idealX = startX + (targetX - startX) * progress;
        const idealY = startY + (targetY - startY) * progress;

        const jitter = (Math.random() - 0.5) * 35 * (1 - Math.abs(progress - 0.5));
        currentX = idealX + jitter;
        currentY = idealY + jitter;

        c.lineTo(currentX, currentY);
      }
      c.stroke();

      // Inner white hot core
      c.strokeStyle = '#ffffff';
      c.lineWidth = 1.2;
      c.stroke();

      c.restore();
    }

    function drawHandSkeleton(c, landmarks) {
      const connections = [
        // Palm / Wrist
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [5, 9], [9, 10], [10, 11], [11, 12], // Middle
        [9, 13], [13, 14], [14, 15], [15, 16], // Ring
        [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [0, 17] // Base
      ];

      c.save();
      c.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      c.lineWidth = 2.5;
      c.shadowColor = '#f59e0b';
      c.shadowBlur = 10;

      // Draw bones
      connections.forEach(([p1, p2]) => {
        const pt1 = landmarks[p1];
        const pt2 = landmarks[p2];
        c.beginPath();
        c.moveTo((1 - pt1.x) * width, pt1.y * height);
        c.lineTo((1 - pt2.x) * width, pt2.y * height);
        c.stroke();
      });

      // Draw Joint Chakras
      landmarks.forEach((pt, idx) => {
        const px = (1 - pt.x) * width;
        const py = pt.y * height;
        const isTip = [4, 8, 12, 16, 20].includes(idx);

        c.fillStyle = isTip ? '#ffffff' : '#fbbf24';
        c.shadowColor = isTip ? '#38bdf8' : '#ea580c';
        c.shadowBlur = isTip ? 16 : 8;

        c.beginPath();
        c.arc(px, py, isTip ? 5 : 3.5, 0, Math.PI * 2);
        c.fill();
      });
      c.restore();
    }

/* Gesture Classifier using Landmarks geometry */
    function classifyGesture(landmarks) {
      if (!landmarks || landmarks.length < 21) return 'UNKNOWN';

      // Landmark indices:
      // 0: Wrist
      // Tips: 4 (Thumb), 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
      // MCPs: 2, 5, 9, 13, 17
      // PIPs: 3, 6, 10, 14, 18

      // Check which fingers are extended
      const isIndexExtended = landmarks[8].y < landmarks[6].y;
      const isMiddleExtended = landmarks[12].y < landmarks[10].y;
      const isRingExtended = landmarks[16].y < landmarks[14].y;
      const isPinkyExtended = landmarks[20].y < landmarks[18].y;

      // Thumb to Index tip distance for Pinch
      const pinchDist = Math.hypot(
        landmarks[4].x - landmarks[8].x,
        landmarks[4].y - landmarks[8].y
      );

      // Distance from fingertips to wrist
      const wrist = landmarks[0];
      const allTipsDistAvg = ([8, 12, 16, 20].reduce((acc, idx) => {
        return acc + Math.hypot(landmarks[idx].x - wrist.x, landmarks[idx].y - wrist.y);
      }, 0)) / 4;

      // 1. PINCH Gesture (Light Painting / Telekinesis)
      if (pinchDist < 0.08) {
        return 'PINCH';
      }

      // 2. FIST Gesture (All extended are false)
      if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
        return 'FIST';
      }

      // 3. ROCK / HORNS Gesture (Index + Pinky extended, middle + ring closed)
      if (isIndexExtended && isPinkyExtended && !isMiddleExtended && !isRingExtended) {
        return 'ROCK';
      }

      // 4. PEACE / VICTORY Gesture (Index + Middle extended, others closed)
      if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
        return 'PEACE';
      }

      // 5. OPEN PALM (All 4 extended)
      if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
        return 'OPEN_PALM';
      }

      // Default Pointing
      if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
        return 'POINTING';
      }

      return 'PARTIAL';
    }

const spellNameEl = document.getElementById('spellName');
    const spellIconEl = document.getElementById('spellIcon');
    const spellStatusBadge = document.getElementById('spellStatusBadge');

    function updateSpellUI(icon, name, glowColor = 'rgba(245, 158, 11, 0.4)') {
      spellIconEl.textContent = icon;
      spellNameEl.textContent = name;
      spellStatusBadge.style.borderColor = glowColor;
    }

    // Animation Loop
    function animate() {
      // Clear with slight motion trail
      ctx.fillStyle = 'rgba(3, 7, 18, 0.28)';
      ctx.fillRect(0, 0, width, height);

      state.shieldRotation += 0.025;
      state.portalAngle += 0.035;

      // 1. Process Hand Gestures if available
      if (state.handsDetected && state.handsData.length > 0) {
        state.handsData.forEach((hand, handIndex) => {
          // Draw Cyber-Mystic Skeleton
          drawHandSkeleton(ctx, hand.landmarks);

          // Get Palm Center (approx between Wrist 0 and Middle MCP 9)
          const palmX = (1 - (hand.landmarks[0].x + hand.landmarks[9].x) / 2) * width;
          const palmY = ((hand.landmarks[0].y + hand.landmarks[9].y) / 2) * height;

          // Index Tip
          const indexX = (1 - hand.landmarks[8].x) * width;
          const indexY = hand.landmarks[8].y * height;

          const gesture = classifyGesture(hand.landmarks);

          // Execute Magic based on selected stance & recognized gesture
          handleMagicExecution(gesture, palmX, palmY, indexX, indexY, handIndex);
        });
      } else if (state.isMouseActive) {
        // Fallback Mouse Magic
        handleMouseMagic();
      }

      // 2. Render shockwaves
      for (let i = state.shockwaves.length - 1; i >= 0; i--) {
        const sw = state.shockwaves[i];
        sw.radius += 5;
        sw.alpha = 1 - (sw.radius / sw.maxRadius);

        if (sw.alpha <= 0) {
          state.shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 4 * sw.alpha;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render Magic Runes (Light Painting Trails)
      for (let i = state.runes.length - 1; i >= 0; i--) {
        const r = state.runes[i];
        r.life -= 1;
        if (r.life <= 0) {
          state.runes.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = r.life / r.maxLife;
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Update and render particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0 || p.size <= 0.4) {
          state.particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    }

    function handleMagicExecution(gesture, palmX, palmY, indexX, indexY, handIdx) {
      if (gesture === 'OPEN_PALM') {
        if (state.activeMode === 'portal') {
          updateSpellUI('🌀', 'COSMIC SLING PORTAL', '#38bdf8');
          drawCosmicPortal(ctx, palmX, palmY, 110, state.portalAngle);
          sound.playShieldHum(300);
        } else {
          updateSpellUI('🛡️', 'ELDRITCH MANDALA SHIELD', '#f59e0b');
          drawEldritchMandala(ctx, palmX, palmY, 125, state.shieldRotation + handIdx);
          sound.playShieldHum(220 + handIdx * 40);
        }
      } else if (gesture === 'FIST') {
        state.chargeLevel = Math.min(1, state.chargeLevel + 0.03);
        updateSpellUI('✊', `CHARGING PLASMA: ${Math.floor(state.chargeLevel * 100)}%`, '#ef4444');
        drawFireballCharge(ctx, palmX, palmY, state.chargeLevel);
        sound.playShieldHum(110 + state.chargeLevel * 150);
      } else if (gesture === 'PEACE') {
        updateSpellUI('✌️', 'ARCANE HOMING BOLTS', '#38bdf8');
        // Shoot lightning bolts from index and middle tips outward
        const targetX = indexX + (Math.random() - 0.5) * 400;
        const targetY = indexY - 250 - Math.random() * 200;
        drawLightningBolts(ctx, indexX, indexY, targetX, targetY, '#38bdf8');
        spawnSparks(indexX, indexY, 4, ['#38bdf8', '#ffffff', '#818cf8']);
        sound.playZap(900 + Math.random() * 300);
      } else if (gesture === 'PINCH') {
        updateSpellUI('✨', 'RUNE TELEKINESIS', '#a855f7');
        // Record rune trail at index tip
        state.runes.push({
          x: indexX,
          y: indexY,
          size: 6 + Math.random() * 4,
          color: state.activeMode === 'fire' ? '#f97316' : '#a855f7',
          maxLife: 60,
          life: 60
        });
        spawnSparks(indexX, indexY, 2, ['#c084fc', '#e879f9', '#ffffff']);
        sound.playZap(1200);
      } else if (gesture === 'ROCK') {
        updateSpellUI('⚡', 'CHAIN LIGHTNING STORM', '#eab308');
        for (let i = 0; i < 3; i++) {
          const rx = (Math.random()) * width;
          const ry = (Math.random()) * height;
          drawLightningBolts(ctx, indexX, indexY, rx, ry, '#facc15');
        }
        if (Math.random() > 0.6) {
          addShockwave(indexX, indexY, '#facc15', 180);
          sound.playElectricCrackle();
        }
      } else {
        // Released or default
        if (state.chargeLevel > 0.4) {
          // Release Charged Fireball
          addShockwave(palmX, palmY, '#ea580c', 260);
          spawnSparks(palmX, palmY, 40, ['#ef4444', '#f97316', '#fbbf24', '#ffffff']);
          sound.playFireBlast();
          state.chargeLevel = 0;
        } else {
          state.chargeLevel = 0;
        }
        updateSpellUI('🖐️', 'READY TO CAST', '#64748b');
      }
    }

    /* Fallback Mouse/Touch Interaction */
    function handleMouseMagic() {
      const mx = state.mousePos.x;
      const my = state.mousePos.y;

      if (state.mouseIsDown) {
        if (state.activeMode === 'eldritch') {
          updateSpellUI('🛡️', 'ELDRITCH SHIELD (MOUSE)', '#f59e0b');
          drawEldritchMandala(ctx, mx, my, 120, state.shieldRotation);
          sound.playShieldHum(240);
        } else if (state.activeMode === 'fire') {
          updateSpellUI('🔥', 'FIREBALL STREAM', '#ea580c');
          drawFireballCharge(ctx, mx, my, 0.8);
          sound.playFireBlast();
        } else if (state.activeMode === 'portal') {
          updateSpellUI('🌀', 'COSMIC PORTAL (MOUSE)', '#38bdf8');
          drawCosmicPortal(ctx, mx, my, 110, state.portalAngle);
          sound.playShieldHum(320);
        } else if (state.activeMode === 'lightning') {
          updateSpellUI('⚡', 'LIGHTNING ARCS', '#facc15');
          const tx = mx + (Math.random() - 0.5) * 350;
          const ty = my + (Math.random() - 0.5) * 350;
          drawLightningBolts(ctx, mx, my, tx, ty, '#facc15');
          sound.playElectricCrackle();
        } else {
          // Runes
          state.runes.push({
            x: mx,
            y: my,
            size: 6,
            color: '#38bdf8',
            maxLife: 50,
            life: 50
          });
          spawnSparks(mx, my, 3, ['#38bdf8', '#a855f7', '#ffffff']);
          sound.playZap(1000);
        }
      }
    }

const camAlertBanner = document.getElementById('camAlertBanner');
    const camStatusText = document.getElementById('camStatusText');
    const useMouseFallbackBtn = document.getElementById('useMouseFallbackBtn');

    // Enable fallback mouse mode
    function activateMouseMode(reasonMsg = "Interactive Mouse & Touch Mode is ready!") {
      state.isMouseActive = true;
      camAlertBanner.classList.remove('hidden');
      camStatusText.textContent = reasonMsg;
      useMouseFallbackBtn.textContent = "Click & Drag to Cast";
      useMouseFallbackBtn.classList.add('bg-emerald-500/20', 'border-emerald-400');
      setTimeout(() => {
        camAlertBanner.classList.add('opacity-0', 'transition-opacity', 'duration-1000');
        setTimeout(() => camAlertBanner.classList.add('hidden'), 1000);
      }, 4000);
    }

    useMouseFallbackBtn.addEventListener('click', () => {
      sound.init();
      activateMouseMode("Direct Casting mode engaged! Use mouse or finger.");
    });

    // Initialize MediaPipe Hands
    async function initMediaPipeVision() {
      try {
        if (typeof Hands === 'undefined') {
          throw new Error('MediaPipe Hands script unavailable via CDN');
        }

        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.55
        });

        hands.onResults((results) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            state.handsDetected = true;
            state.handsData = results.multiHandLandmarks.map((landmarks) => ({ landmarks }));
          } else {
            state.handsDetected = false;
            state.handsData = [];
          }
        });

        // Request user webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        video.srcObject = stream;
        await video.play();

        state.cameraActive = true;
        camStatusText.textContent = "Vision Model Online! Hold up your hands.";
        camAlertBanner.classList.add('border-emerald-500/50');
        setTimeout(() => {
          camAlertBanner.classList.add('opacity-0', 'transition-opacity', 'duration-700');
          setTimeout(() => camAlertBanner.classList.add('hidden'), 700);
        }, 2200);

        // Frame processor
        const processCameraFrame = async () => {
          if (video.readyState >= 2) {
            await hands.send({ image: video });
          }
          requestAnimationFrame(processCameraFrame);
        };
        requestAnimationFrame(processCameraFrame);

      } catch (err) {
        console.warn('Camera or MediaPipe initialization notice:', err);
        activateMouseMode("Camera unavailable. Mouse & Touch Magic Mode activated!");
      }
    }

// Audio Unlocker on First Click
    window.addEventListener('click', () => {
      sound.init();
    }, { once: true });

    // Mode Selector Buttons
    const modeButtons = document.querySelectorAll('.spell-mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.init();
        modeButtons.forEach(b => {
          b.classList.remove('bg-amber-500/20', 'border', 'border-amber-400/50', 'text-amber-200');
          b.classList.add('text-slate-300');
        });
        btn.classList.add('bg-amber-500/20', 'border', 'border-amber-400/50', 'text-amber-200');
        btn.classList.remove('text-slate-300');

        state.activeMode = btn.dataset.mode;
        addShockwave(width / 2, height / 2, '#f59e0b', 160);
        sound.playZap(700);
      });
    });

    // Sound Toggle
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const soundIconOn = document.getElementById('soundIconOn');
    const soundIconOff = document.getElementById('soundIconOff');

    audioToggleBtn.addEventListener('click', () => {
      sound.init();
      sound.enabled = !sound.enabled;
      soundIconOn.classList.toggle('hidden', !sound.enabled);
      soundIconOff.classList.toggle('hidden', sound.enabled);
    });

    // Grimoire Modal controls
    const guideToggleBtn = document.getElementById('guideToggleBtn');
    const closeGuideBtn = document.getElementById('closeGuideBtn');
    const gotItBtn = document.getElementById('gotItBtn');
    const guideModal = document.getElementById('guideModal');

    function toggleGuide(show) {
      sound.init();
      guideModal.classList.toggle('hidden', !show);
    }
    guideToggleBtn.addEventListener('click', () => toggleGuide(true));
    closeGuideBtn.addEventListener('click', () => toggleGuide(false));
    gotItBtn.addEventListener('click', () => toggleGuide(false));

    // Mouse & Touch Fallback Handlers
    window.addEventListener('pointerdown', (e) => {
      sound.init();
      state.isMouseActive = true;
      state.mouseIsDown = true;
      state.mousePos.x = e.clientX;
      state.mousePos.y = e.clientY;
      addShockwave(e.clientX, e.clientY, '#fbbf24', 90);
    });

    window.addEventListener('pointermove', (e) => {
      state.mousePos.x = e.clientX;
      state.mousePos.y = e.clientY;
      if (state.mouseIsDown && Math.random() > 0.4) {
        spawnSparks(e.clientX, e.clientY, 2, ['#f59e0b', '#38bdf8', '#ffffff']);
      }
    });

    window.addEventListener('pointerup', () => {
      state.mouseIsDown = false;
    });

    // Start App on Window Load
    window.onload = function () {
      initMediaPipeVision();
      animate();
    };
