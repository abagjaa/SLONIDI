// ── LOGIN ──
// Ganti password di sini
const PASSWORD = 'akusayangabagja';

function tryLogin() {
  const val = document.getElementById('passInput').value;
  if (val === PASSWORD) {
    sessionStorage.setItem('ppiln_auth', 'true');
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
