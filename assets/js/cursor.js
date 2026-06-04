(function () {
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  if (window.self !== window.top) return;

  const style = document.createElement('style');
  style.textContent = `
    html, body, *, *::before, *::after { cursor: none !important; }

    #nCursor {
      position: fixed;
      width: 32px; height: 32px;
      border: 2px solid rgba(147,197,253,0.75);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      left: -100px; top: -100px;
      transform: translate(-50%, -50%);
      transition: width .18s, height .18s, border-color .18s, background .18s, opacity .3s;
      will-change: left, top;
    }
    #nCursor.c-hover {
      width: 46px; height: 46px;
      border-color: rgba(232,121,249,0.8);
      background: rgba(232,121,249,0.06);
    }
    #nCursor.c-hidden, #nDot.c-hidden { opacity: 0 !important; }
    #nCursor.c-afk {
      animation: nAfk 1.4s ease-in-out infinite;
      border-color: rgba(232,121,249,0.65);
    }
    @keyframes nAfk {
      0%,100% { transform:translate(-50%,-50%) scale(1); opacity:1; }
      50%      { transform:translate(-50%,-50%) scale(1.5); opacity:0.28; }
    }

    #nDot {
      position: fixed; width: 5px; height: 5px;
      background: #93C5FD; border-radius: 50%;
      pointer-events: none; z-index: 100000;
      left: -100px; top: -100px;
      transform: translate(-50%, -50%);
      transition: width .12s, height .12s, background .15s, opacity .3s;
      will-change: left, top;
    }
    #nDot.d-hover { width: 7px; height: 7px; background: #E879F9; }

    @keyframes nPixelFade {
      0%   { opacity: 0.9; transform: translate(-50%,-50%) scale(1); }
      100% { opacity: 0;   transform: translate(-50%, calc(-50% - 22px)) scale(0.1); }
    }
    @keyframes nStarBurst {
      0%   { opacity:1; transform:translate(-50%,-50%) scale(1.1); }
      100% { opacity:0; transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0); }
    }
  `;
  document.head.appendChild(style);

  const cursor = document.createElement('div'); cursor.id = 'nCursor';
  const dot    = document.createElement('div'); dot.id    = 'nDot';
  document.body.appendChild(cursor);
  document.body.appendChild(dot);

  const COLORS = ['#93C5FD','#A78BFA','#C4B5FD','#60A5FA','#F9A8D4','#818CF8','#7DD3FC','#E879F9','#FCA5D4'];
  const STARS  = ['✦','✧','·','∗','⊹','✦','✧','✦'];
  let lastTrail = 0, mx = -100, my = -100, cx = -100, cy = -100;
  let afkTmr = null, isAfk = false;

  const setHover   = on => { cursor.classList.toggle('c-hover', on); dot.classList.toggle('d-hover', on); };
  const setAfk     = on => { isAfk = on; cursor.classList.toggle('c-afk', on); };
  const setVisible = on => { cursor.classList.toggle('c-hidden', !on); dot.classList.toggle('c-hidden', !on); };
  const hide = () => { setVisible(false); setAfk(false); clearTimeout(afkTmr); };
  const resetAfk = () => {
    if (isAfk) setAfk(false);
    clearTimeout(afkTmr);
    afkTmr = setTimeout(() => setAfk(true), 3000);
  };

  function updatePos(x, y) { mx = x; my = y; dot.style.left = x + 'px'; dot.style.top = y + 'px'; }

  function spawnPixelTrail(x, y) {
    const now = Date.now();
    if (now - lastTrail < 30) return;
    lastTrail = now;
    const el = document.createElement('div');
    const sz  = 3 + Math.random() * 5;
    const col = COLORS[Math.floor(Math.random() * COLORS.length)];
    const dur = 0.4 + Math.random() * 0.4;
    el.style.cssText = `
      position:fixed; pointer-events:none; z-index:99998; border-radius:50%;
      width:${sz}px; height:${sz}px; background:${col};
      left:${x + (Math.random() - .5) * 10}px;
      top:${y + (Math.random() - .5) * 10}px;
      animation: nPixelFade ${dur}s ease-out forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 60);
  }

  document.addEventListener('mousemove', e => {
    setVisible(true); resetAfk();
    updatePos(e.clientX, e.clientY);
    spawnPixelTrail(e.clientX, e.clientY);
  });
  document.addEventListener('mouseleave', () => hide());
  document.addEventListener('mouseenter', () => { setVisible(true); resetAfk(); });
  window.addEventListener('blur', () => hide());
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });

  window.addEventListener('message', e => {
    if (!e.data || !e.data._bridge) return;
    const t = e.data.type;
    if (t === 'iframe-mousemove') {
      setVisible(true); resetAfk();
      updatePos(e.data.x, e.data.y);
      spawnPixelTrail(e.data.x, e.data.y);
    } else if (t === 'iframe-mouseleave') { hide(); }
    else if (t === 'iframe-hover-on')    { setHover(true); }
    else if (t === 'iframe-hover-off')   { setHover(false); }
  });

  // Smooth ring follow
  (function frame() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(frame);
  })();

  function bindHover() {
    document.querySelectorAll('a,button,.nav-item,.tool-card,[onclick],label,select,input,textarea').forEach(el => {
      if (el._cb) return; el._cb = true;
      el.addEventListener('mouseenter', () => setHover(true));
      el.addEventListener('mouseleave', () => setHover(false));
    });
  }
  bindHover();
  setInterval(bindHover, 2000);

  // Click burst — elegant star symbols
  document.addEventListener('click', e => {
    const n = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) {
      const el  = document.createElement('div');
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      const ang = (360 / n) * i + (Math.random() * 20 - 10);
      const dist = 32 + Math.random() * 52;
      const rad  = ang * Math.PI / 180;
      const sz   = 9 + Math.random() * 11;
      el.textContent = STARS[Math.floor(Math.random() * STARS.length)];
      el.style.cssText = `
        position:fixed; pointer-events:none; z-index:99997;
        color:${col}; font-size:${sz}px; font-weight:700;
        left:${e.clientX}px; top:${e.clientY}px;
        --dx:${Math.cos(rad) * dist}px; --dy:${Math.sin(rad) * dist}px;
        animation: nStarBurst 0.55s cubic-bezier(.2,.8,.4,1) forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 600);
    }
  });

  resetAfk();
})();
