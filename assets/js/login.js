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
    opacity: 0; pointer-events: none;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 12px;
    transition: opacity 0.4s ease;
  `;

  // Isi overlay — logo + teks
  overlay.innerHTML = `
    <div style="
      width:72px;height:72px;
      background:rgba(255,255,255,0.25);
      border-radius:24px;
      display:flex;align-items:center;justify-content:center;
      font-size:28px;font-weight:700;color:#fff;
      box-shadow:0 8px 32px rgba(0,0,0,0.15);
      animation: overlayLogoIn 0.5s cubic-bezier(.34,1.56,.64,1) 0.2s both;
    ">N</div>
    <div style="
      color:rgba(255,255,255,0.9);font-size:15px;font-weight:600;
      font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:0.03em;
      animation: overlayTextIn 0.5s ease 0.35s both;
    ">Halo, Nadia! 🩵</div>
    <div style="
      color:rgba(255,255,255,0.6);font-size:12px;
      font-family:'Plus Jakarta Sans',sans-serif;
      animation: overlayTextIn 0.5s ease 0.45s both;
    ">Membuka dashboard...</div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes overlayLogoIn {
      from { opacity:0; transform:scale(0.5) rotate(-10deg); }
      to   { opacity:1; transform:scale(1) rotate(0deg); }
    }
    @keyframes overlayTextIn {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
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
  card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.96) translateY(-10px)';

  // Fade overlay masuk
  requestAnimationFrame(() => {
    overlay.style.pointerEvents = 'all';
    overlay.style.opacity = '1';
  });

  // Pindah halaman setelah animasi
  setTimeout(callback, 900);
}

// Jika sudah login, langsung ke dashboard
if (sessionStorage.getItem('ppiln_auth') === 'true') {
  window.location.href = 'index.html';
}