// ── AUTH CHECK ──
if (sessionStorage.getItem('ppiln_auth') !== 'true') {
  window.location.href = 'login.html';
}

// ── CURRENT USER ──
const currentUser = JSON.parse(sessionStorage.getItem('ppiln_user') || '{}');
const userAccess  = currentUser.access || [];
const isAdmin     = currentUser.role === 'admin';

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
const firstName = (currentUser.name || 'Kamu').split(' ')[0];
const greet = hour < 11
  ? `Selamat pagi, ${firstName}! ☀️ semangat terus ya~`
  : hour < 15
    ? `Selamat siang, ${firstName}! 🌤️ Jangan lupa makan siang ya!`
    : hour < 18
      ? `Selamat sore, ${firstName}! 🌇 Udah mau sore nih, semangat terus~`
      : `Selamat malam, ${firstName}! 🌙 Jangan begadang teuing ya!`;
document.getElementById('greetingText').textContent = greet;

// ── TAMPILKAN NAMA & ROLE USER ──
const nameEl = document.querySelector('.user-name');
const roleEl = document.querySelector('.user-role');
if (nameEl) nameEl.textContent = currentUser.name || 'User';
if (roleEl) roleEl.textContent = currentUser.role === 'admin' ? 'Wilayah Jawa Barat' : 'Akses Terbatas';

// ── SEMBUNYIKAN MENU & TOOL CARD YANG TIDAK PUNYA AKSES ──
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  const page = item.getAttribute('data-page');
  if (!userAccess.includes(page)) {
    item.style.display = 'none';
  }
});
document.querySelectorAll('.tool-card[data-page]').forEach(card => {
  const page = card.getAttribute('data-page');
  if (!userAccess.includes(page)) {
    card.style.display = 'none';
  }
});

// Update jumlah tools yang bisa diakses di stat card
const accessibleTools = userAccess.filter(p => p !== 'home').length;
const statNumEl = document.querySelector('.stat-num[data-tools-count]');
if (statNumEl) statNumEl.textContent = accessibleTools;

// ── PAGE NAVIGATION ──
const pageTitles = {
  'home':         ['Dashboard', 'Tools NADIA'],
  'slo-nidi':     ['SLO & NIDI Extractor', 'Tools'],
  'rename-pdf':   ['Rename PDF', 'Tools'],
  'cek-duplikat': ['Cek Duplikat SLO & NIDI', 'Tools'],
};

function showPage(id, navEl) {
  // Blokir akses ke halaman yang tidak diizinkan
  if (!userAccess.includes(id)) {
    alert('⛔ Kamu tidak punya akses ke halaman ini.');
    return;
  }
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
    sessionStorage.removeItem('ppiln_user');
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

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});
