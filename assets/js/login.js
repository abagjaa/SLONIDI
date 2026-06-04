// ── USERS & AKSES ──────────────────────────────────────────────
const USERS = {
  'akusayangabagja': {
    name: 'Nadia Ramdiana',
    role: 'admin',
    access: ['home', 'slo-nidi', 'rename-pdf', 'cek-duplikat', 'rekap', 'rapikan', 'cari-data'], // semua tools
  },
  'mustika123': {
    name: 'Mustika',
    role: 'terbatas',
    access: ['home', 'rename-pdf'], // hanya rename pdf
  },
};

function tryLogin() {
  const pass = document.getElementById('passInput').value.trim();
  const user = USERS[pass];

  if (user) {
    sessionStorage.setItem('ppiln_auth', 'true');
    sessionStorage.setItem('ppiln_user', JSON.stringify(user));
    sessionStorage.setItem('ppiln_just_logged_in', 'true');

    // Animasi exit sebelum pindah halaman
    doLoginTransition(() => {
      window.location.href = 'index.html';
    }, user.name.split(' ')[0]);
  } else {
    const err = document.getElementById('errorMsg');
    err.style.display = 'block';
    // Shake animation pada card
    const card = document.querySelector('.card');
    card.style.animation = 'cardShake 0.4s ease';
    card.addEventListener('animationend', () => { card.style.animation = 'cardSlideUp 0.6s cubic-bezier(.34,1.56,.64,1) both'; }, { once: true });
    document.getElementById('passInput').value = '';
    document.getElementById('passInput').focus();
  }
}

function doLoginTransition(callback, firstName) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:#060c1a;
    opacity:0;pointer-events:none;
    display:flex;align-items:center;justify-content:center;
    flex-direction:column;gap:20px;
    transition:opacity 0.45s ease;
  `;

  overlay.innerHTML = `
    <div style="position:relative;width:88px;height:88px;display:flex;align-items:center;justify-content:center;">
      <svg style="position:absolute;inset:0;width:100%;height:100%;animation:spinRing 1.4s linear infinite;" viewBox="0 0 88 88" fill="none">
        <circle cx="44" cy="44" r="40" stroke="rgba(147,197,253,0.1)" stroke-width="2"/>
        <circle cx="44" cy="44" r="40" stroke="url(#g)" stroke-width="2" stroke-linecap="round" stroke-dasharray="60 192"/>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="88" y2="88" gradientUnits="userSpaceOnUse">
            <stop stop-color="#60A5FA"/>
            <stop offset="1" stop-color="#A78BFA"/>
          </linearGradient>
        </defs>
      </svg>
      <div style="
        width:60px;height:60px;border-radius:18px;
        background:linear-gradient(135deg,#3B82F6,#818CF8);
        display:flex;align-items:center;justify-content:center;
        font-size:24px;font-weight:800;color:#fff;
        font-family:'Plus Jakarta Sans',sans-serif;
        box-shadow:0 8px 32px rgba(59,130,246,0.4);
        animation:logoIn 0.6s cubic-bezier(.34,1.56,.64,1) 0.2s both;
      ">N</div>
    </div>
    <div style="text-align:center;animation:fadeUp 0.5s ease 0.5s both;">
      <div style="font-size:17px;font-weight:700;color:#f8fafc;font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:-0.01em;margin-bottom:4px;">
        Halo, ${firstName}! 🩵
      </div>
      <div style="font-size:12px;color:#475569;font-family:'Plus Jakarta Sans',sans-serif;">
        Membuka dashboard...
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes spinRing { to { transform: rotate(360deg); } }
    @keyframes logoIn {
      from { opacity:0; transform:scale(0.5); }
      to   { opacity:1; transform:scale(1); }
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes cardShake {
      0%,100% { transform:translateX(0); }
      20% { transform:translateX(-8px) rotate(-0.8deg); }
      40% { transform:translateX(8px) rotate(0.8deg); }
      60% { transform:translateX(-5px); }
      80% { transform:translateX(5px); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const card = document.querySelector('.card');
  card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.95) translateY(-8px)';

  requestAnimationFrame(() => {
    overlay.style.pointerEvents = 'all';
    overlay.style.opacity = '1';
  });

  setTimeout(callback, 1800);
}

// Jika sudah login, langsung ke dashboard
if (sessionStorage.getItem('ppiln_auth') === 'true') {
  window.location.href = 'index.html';
}