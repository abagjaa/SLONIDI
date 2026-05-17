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
    window.location.href = 'index.html';
  } else {
    const err = document.getElementById('errorMsg');
    err.style.display = 'block';
    document.getElementById('passInput').value = '';
    document.getElementById('passInput').focus();
  }
}

// Jika sudah login, langsung ke dashboard
if (sessionStorage.getItem('ppiln_auth') === 'true') {
  window.location.href = 'index.html';
}