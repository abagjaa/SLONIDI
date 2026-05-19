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
    });
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

function doLoginTransition(callback) {
  // Buat overlay transisi
  const overlay = document.createElement('div');
  overlay.id = 'login-transition-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: linear-gradient(135deg, #60A5FA, #818CF8, #A78BFA);
    background-size: 200% 200%;
    opacity: 0; pointer-events: none;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 16px;
    transition: opacity 0.5s ease;
  `;

  // Isi overlay — logo + teks + dots
  overlay.innerHTML = `
    <div style="
      width:80px;height:80px;
      background:rgba(255,255,255,0.25);
      border-radius:26px;
      display:flex;align-items:center;justify-content:center;
      font-size:32px;font-weight:700;color:#fff;
      box-shadow:0 12px 40px rgba(0,0,0,0.2);
      animation: overlayLogoIn 0.7s cubic-bezier(.34,1.56,.64,1) 0.3s both, overlayLogoPulse 2s ease-in-out 1.2s infinite;
    ">N</div>
    <div style="
      color:rgba(255,255,255,0.95);font-size:18px;font-weight:700;
      font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:0.03em;
      animation: overlayTextIn 0.6s ease 0.6s both;
    ">Halo, Nadia! 🩵</div>
    <div style="
      color:rgba(255,255,255,0.7);font-size:13px;
      font-family:'Plus Jakarta Sans',sans-serif;
      animation: overlayTextIn 0.6s ease 0.8s both;
    ">Membuka dashboard untukmu...</div>
    <div style="
      display:flex;gap:8px;margin-top:8px;
      animation: overlayTextIn 0.6s ease 1.0s both;
    ">
      <span style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.8);animation:dotBounce 1.2s ease-in-out 1.2s infinite;"></span>
      <span style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.8);animation:dotBounce 1.2s ease-in-out 1.4s infinite;"></span>
      <span style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.8);animation:dotBounce 1.2s ease-in-out 1.6s infinite;"></span>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes overlayLogoIn {
      from { opacity:0; transform:scale(0.4) rotate(-15deg); }
      to   { opacity:1; transform:scale(1) rotate(0deg); }
    }
    @keyframes overlayLogoPulse {
      0%,100% { box-shadow:0 12px 40px rgba(0,0,0,0.2); transform:scale(1); }
      50%      { box-shadow:0 16px 50px rgba(255,255,255,0.3); transform:scale(1.06); }
    }
    @keyframes overlayTextIn {
      from { opacity:0; transform:translateY(14px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes dotBounce {
      0%,80%,100% { transform:translateY(0); opacity:0.5; }
      40%          { transform:translateY(-10px); opacity:1; }
    }
    @keyframes cardShake {
      0%,100% { transform:translateX(0); }
      20%      { transform:translateX(-8px) rotate(-1deg); }
      40%      { transform:translateX(8px) rotate(1deg); }
      60%      { transform:translateX(-5px); }
      80%      { transform:translateX(5px); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // Fade card keluar
  const card = document.querySelector('.card');
  card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.94) translateY(-12px)';

  // Fade overlay masuk
  requestAnimationFrame(() => {
    overlay.style.pointerEvents = 'all';
    overlay.style.opacity = '1';
  });

  // Pindah halaman setelah animasi cukup lama dinikmati
  setTimeout(callback, 2200);
}

// Jika sudah login, langsung ke dashboard
if (sessionStorage.getItem('ppiln_auth') === 'true') {
  window.location.href = 'index.html';
}