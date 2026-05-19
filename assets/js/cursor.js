(function () {
    // Jangan jalankan di touch device
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  
    // ── INJECT CSS ──
    const style = document.createElement('style');
    style.textContent = `
      html, body, *, *::before, *::after { cursor: none !important; }
  
      #customCursor {
        position: fixed;
        width: 36px; height: 36px;
        border: 2.5px solid rgba(147,197,253,0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        left: -100px; top: -100px;
        transform: translate(-50%, -50%);
        transition: width .2s, height .2s, border-color .2s, background .2s;
        will-change: left, top;
      }
      #customCursor.cursor-hover {
        width: 52px; height: 52px;
        border-color: rgba(167,139,250,0.9);
        background: rgba(167,139,250,0.08);
      }
  
      #customCursorDot {
        position: fixed;
        width: 7px; height: 7px;
        background: #93C5FD;
        border-radius: 50%;
        pointer-events: none;
        z-index: 100000;
        left: -100px; top: -100px;
        transform: translate(-50%, -50%);
        transition: width .1s, height .1s, background .1s;
        will-change: left, top;
      }
      #customCursorDot.dot-hover {
        width: 10px; height: 10px;
        background: #A78BFA;
      }
  
      .cursor-trail {
        position: fixed;
        pointer-events: none;
        z-index: 99998;
        transform: translate(-50%, -50%);
        animation: cursorTrailFade 0.9s ease-out forwards;
        user-select: none;
      }
      @keyframes cursorTrailFade {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, calc(-50% - 28px)) scale(0.4); }
      }
  
      .cursor-burst {
        position: fixed;
        pointer-events: none;
        z-index: 99997;
        transform: translate(-50%, -50%);
        animation: cursorBurstFly 0.7s cubic-bezier(.2,.8,.4,1) forwards;
        user-select: none;
      }
      @keyframes cursorBurstFly {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); }
      }
    `;
    document.head.appendChild(style);
  
    // ── INJECT HTML ──
    const cursor    = document.createElement('div');
    cursor.id       = 'customCursor';
    const dot       = document.createElement('div');
    dot.id          = 'customCursorDot';
    document.body.appendChild(cursor);
    document.body.appendChild(dot);
  
    // ── MOUSE TRACKING ──
    let mouseX = -100, mouseY = -100;
    let curX   = -100, curY   = -100;
  
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });
  
    // Smooth ring follow
    (function animate() {
      curX += (mouseX - curX) * 0.12;
      curY += (mouseY - curY) * 0.12;
      cursor.style.left = curX + 'px';
      cursor.style.top  = curY + 'px';
      requestAnimationFrame(animate);
    })();
  
    // Hover scale — re-check setiap kali DOM mungkin berubah (untuk SPA)
    function bindHover() {
      document.querySelectorAll('a, button, .nav-item, .tool-card, [onclick], label, select, input, textarea').forEach(el => {
        if (el._cursorBound) return;
        el._cursorBound = true;
        el.addEventListener('mouseenter', () => { cursor.classList.add('cursor-hover'); dot.classList.add('dot-hover'); });
        el.addEventListener('mouseleave', () => { cursor.classList.remove('cursor-hover'); dot.classList.remove('dot-hover'); });
      });
    }
    bindHover();
    // Re-bind setiap 2 detik untuk halaman yang load konten dinamis
    setInterval(bindHover, 2000);
  
    // ── TRAILING EMOJI ──
    const trailEmojis = ['💙','💜','✨','⭐','🌸','💫','🌟','💎','🩵','🫧'];
    let trailIdx = 0, lastTrail = 0;
  
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastTrail < 80) return;
      lastTrail = now;
  
      const el = document.createElement('div');
      el.className   = 'cursor-trail';
      el.textContent = trailEmojis[trailIdx++ % trailEmojis.length];
      el.style.left     = (e.clientX + (Math.random() - .5) * 16) + 'px';
      el.style.top      = (e.clientY + (Math.random() - .5) * 16) + 'px';
      el.style.fontSize = (11 + Math.random() * 10) + 'px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    });
  
    // ── CLICK BURST ──
    const burstEmojis = ['💥','⭐','✨','💙','💜','🌟','💫','🎀','🩵'];
  
    document.addEventListener('click', (e) => {
      const count = 10 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        const el    = document.createElement('div');
        el.className   = 'cursor-burst';
        el.textContent = burstEmojis[Math.floor(Math.random() * burstEmojis.length)];
  
        const angle = (360 / count) * i + (Math.random() * 20 - 10);
        const dist  = 40 + Math.random() * 60;
        const rad   = angle * Math.PI / 180;
  
        el.style.left     = e.clientX + 'px';
        el.style.top      = e.clientY + 'px';
        el.style.fontSize = (12 + Math.random() * 14) + 'px';
        el.style.setProperty('--dx', Math.cos(rad) * dist + 'px');
        el.style.setProperty('--dy', Math.sin(rad) * dist + 'px');
  
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 700);
      }
    });
  
  })();