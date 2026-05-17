// ── AUTH CHECK ──
if (sessionStorage.getItem('ppiln_auth') !== 'true') {
  window.location.href = 'login.html';
}

// ── CLOCK ──
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}
updateClock();
setInterval(updateClock, 60000);

// ── GREETING ──
const hour = new Date().getHours();
const greet = hour < 11
  ? 'Selamat pagi, Ayang! ☀️ semangat terus ya~'
  : hour < 15
    ? 'Selamat siang, Ayang! 🌤️ Jangan lupa makan siang ya!'
    : hour < 18
      ? 'Selamat sore, Ayang! 🌇 Udah mau sore nih, semangat terus~'
      : 'Selamat malam, Ayang! 🌙 Jangan begadang teuing ya!';
document.getElementById('greetingText').textContent = greet;

// ── PAGE NAVIGATION ──
// Daftarkan setiap halaman di sini: 'page-id': ['Judul Topbar', 'Breadcrumb']
const pageTitles = {
  'home':     ['Dashboard', 'Tools NADIA'],
  'slo-nidi': ['SLO & NIDI Extractor', 'Tools'],
  // Tambah halaman baru di sini...
};

function showPage(id, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (navEl) navEl.classList.add('active');
  const [title, breadcrumb] = pageTitles[id] || [id, 'Tools NADIA'];
  document.getElementById('topbarTitle').textContent = title;
  document.getElementById('topbarBreadcrumb').textContent = breadcrumb;
}

// ── LOGOUT ──
function logout() {
  if (confirm('Yakin mau keluar?')) {
    sessionStorage.removeItem('ppiln_auth');
    window.location.href = 'login.html';
  }
}

// ── SIDEBAR MOBILE ──
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('visible');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('visible');
}

// Tutup sidebar saat nav diklik (mobile)
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});
