(function() {
  if (window.self !== window.top) return; // skip di dalam iframe

  const style = document.createElement('style');
  style.textContent = `
    .sig-widget {
      position: fixed;
      bottom: 1.1rem;
      right: 1.5rem;
      z-index: 9990;
      display: flex;
      align-items: flex-end;
      gap: 7px;
      pointer-events: auto;
      cursor: default;
      user-select: none;
    }
    .sig-pixel-wrap {
      flex-shrink: 0;
      line-height: 0;
    }
    .sig-pixel-char {
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      width: 34px;
      height: 42px;
      display: block;
      transition: transform 0.2s ease;
    }
    .sig-widget:hover .sig-pixel-wrap {
      animation: sigBounce 0.5s ease-in-out infinite;
    }
    @keyframes sigBounce {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-3px); }
    }
    .sig-wave-arm {
      transform-origin: 7px 4px;
      transition: transform 0.15s;
    }
    .sig-widget:hover .sig-wave-arm {
      animation: sigWave 0.55s ease-in-out infinite;
    }
    @keyframes sigWave {
      0%,100% { transform: rotate(0deg); }
      20%     { transform: rotate(-50deg); }
      50%     { transform: rotate(-65deg); }
      80%     { transform: rotate(-45deg); }
    }
    .sig-name {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: rgba(148,163,184,0.4);
      padding-bottom: 3px;
      transition: color 0.2s;
      white-space: nowrap;
    }
    .sig-widget:hover .sig-name {
      color: rgba(147,197,253,0.65);
    }
  `;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.className = 'sig-widget';
  el.innerHTML = `
    <div class="sig-pixel-wrap">
      <svg class="sig-pixel-char" viewBox="0 0 10 12" xmlns="http://www.w3.org/2000/svg">
        <!-- Head -->
        <rect x="3" y="0" width="4" height="3" fill="#60A5FA"/>
        <!-- Pupils -->
        <rect x="4" y="1" width="1" height="1" fill="#0c1622"/>
        <rect x="6" y="1" width="1" height="1" fill="#0c1622"/>
        <!-- Mouth -->
        <rect x="5" y="2" width="1" height="1" fill="#93C5FD" opacity="0.6"/>
        <!-- Body -->
        <rect x="3" y="3" width="4" height="3" fill="#3B82F6"/>
        <!-- Left arm static -->
        <rect x="2" y="4" width="1" height="2" fill="#3B82F6"/>
        <rect x="1" y="5" width="1" height="1" fill="#60A5FA"/>
        <!-- Right arm wave -->
        <g class="sig-wave-arm">
          <rect x="7" y="4" width="1" height="2" fill="#3B82F6"/>
          <rect x="8" y="3" width="1" height="2" fill="#60A5FA"/>
        </g>
        <!-- Legs -->
        <rect x="3" y="6" width="2" height="3" fill="#1D4ED8"/>
        <rect x="5" y="6" width="2" height="3" fill="#1D4ED8"/>
        <!-- Feet -->
        <rect x="2" y="9" width="3" height="1" fill="#1E3A8A"/>
        <rect x="5" y="9" width="3" height="1" fill="#1E3A8A"/>
        <!-- Shadow -->
        <ellipse cx="5" cy="11.5" rx="3" ry="0.5" fill="rgba(0,0,0,0.2)"/>
      </svg>
    </div>
    <span class="sig-name">Agus Bagja</span>
  `;
  document.body.appendChild(el);
})();
