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

// ── SLO & NIDI STAT CARDS — FUNGSIONAL ──
// Menyimpan data progres dari slo-nidi tool ke localStorage
// Format: { sloCount, nidiCount, lastUpdate }
const SLO_STAT_KEY = 'nadia_slo_nidi_stats';

function loadSloNidiStats() {
  try {
    const raw = localStorage.getItem(SLO_STAT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function animateNumber(el, targetNum) {
  const start = parseInt(el.textContent) || 0;
  if (start === targetNum) return;
  const diff = targetNum - start;
  const duration = 600;
  const startTime = performance.now();
  el.classList.add('updated');
  setTimeout(() => el.classList.remove('updated'), 450);
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.round(start + diff * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateStatCards() {
  const stats = loadSloNidiStats();
  const sloEl = document.getElementById('statSloCount');
  const nidiEl = document.getElementById('statNidiCount');
  const sloSub = document.getElementById('statSloSub');
  const nidiSub = document.getElementById('statNidiSub');
  if (!sloEl || !nidiEl) return;

  if (stats && (stats.sloCount > 0 || stats.nidiCount > 0)) {
    animateNumber(sloEl, stats.sloCount || 0);
    animateNumber(nidiEl, stats.nidiCount || 0);
    if (stats.lastUpdate) {
      const d = new Date(stats.lastUpdate);
      const label = d.toLocaleDateString('id-ID', { day:'numeric', month:'short' });
      if (sloSub) sloSub.textContent = `Terakhir: ${label}`;
      if (nidiSub) nidiSub.textContent = `Terakhir: ${label}`;
    } else {
      if (sloSub) sloSub.textContent = `${stats.sloCount} dokumen`;
      if (nidiSub) nidiSub.textContent = `${stats.nidiCount} dokumen`;
    }
  } else {
    if (sloEl) sloEl.textContent = '0';
    if (nidiEl) nidiEl.textContent = '0';
    if (sloSub) sloSub.textContent = 'Belum ada data';
    if (nidiSub) nidiSub.textContent = 'Belum ada data';
  }
}

// Listen for messages from iframe (slo-nidi tool)
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'slo_nidi_stats') {
    const stats = {
      sloCount: e.data.sloCount || 0,
      nidiCount: e.data.nidiCount || 0,
      lastUpdate: Date.now()
    };
    localStorage.setItem(SLO_STAT_KEY, JSON.stringify(stats));
    updateStatCards();
  }
});

// Also poll localStorage periodically for updates
updateStatCards();
setInterval(updateStatCards, 5000);

// ── FLOATING PARTICLES ──
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const emojis = ['💙','💜','⭐','✨','🌸','💫','🌟','💎'];
  const colors = ['rgba(147,197,253,0.5)','rgba(196,181,253,0.5)','rgba(251,191,36,0.4)'];

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    const useEmoji = Math.random() > 0.5;
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.fontSize = (10 + Math.random() * 14) + 'px';
    p.style.animationDuration = (8 + Math.random() * 16) + 's';
    p.style.animationDelay = (Math.random() * 12) + 's';

    if (useEmoji) {
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.background = 'none';
      p.style.borderRadius = '0';
    } else {
      p.style.width = (5 + Math.random() * 8) + 'px';
      p.style.height = p.style.width;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
    }
    container.appendChild(p);
  }
}
createParticles();

// ── WELCOME EMOJI rotate between cute emojis ──
const cuteBanners = ['✨','💙','🌸','⭐','💜','🎀','💫','🌟'];
let bannerIdx = 0;
const emojiEl = document.getElementById('welcomeEmoji');
if (emojiEl) {
  setInterval(() => {
    bannerIdx = (bannerIdx + 1) % cuteBanners.length;
    emojiEl.style.transform = 'translateY(-50%) scale(0)';
    setTimeout(() => {
      emojiEl.textContent = cuteBanners[bannerIdx];
      emojiEl.style.transform = 'translateY(-50%) scale(1.2)';
      setTimeout(() => { emojiEl.style.transform = ''; }, 150);
    }, 200);
  }, 2500);
  emojiEl.style.transition = 'transform 0.2s cubic-bezier(.34,1.56,.64,1)';
}

// ── PAGE NAVIGATION ──
const pageTitles = {
  'home':         ['Dashboard', 'Tools NADIA'],
  'slo-nidi':     ['SLO & NIDI Extractor', 'Tools'],
  'rename-pdf':   ['Rename PDF', 'Tools'],
  'cek-duplikat': ['Cek Duplikat SLO & NIDI', 'Tools'],
  'rekap':        ['Rekap & Laporan', 'Tools'],
  'rapikan':      ['Rapikan Excel', 'Tools'],
  'cari-data':    ['Cari Data', 'Tools'],
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
  const modal = document.getElementById('logoutModal');
  modal.style.display = 'flex';
}

function closeLogoutModal() {
  document.getElementById('logoutModal').style.display = 'none';
}

function confirmLogout() {
  sessionStorage.removeItem('ppiln_auth');
  sessionStorage.removeItem('ppiln_user');
  window.location.href = 'login.html';
}

// Tutup modal kalau klik background
document.getElementById('logoutModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeLogoutModal();
});

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

// ── CATATAN PINTAS ──
const NOTE_KEY = 'nadia_catatan';

function initNote() {
  const area = document.getElementById('noteArea');
  const lenEl = document.getElementById('noteLen');
  if (!area) return;
  const saved = localStorage.getItem(NOTE_KEY) || '';
  area.value = saved;
  if (lenEl) lenEl.textContent = saved.length + ' karakter';
}

function saveNote() {
  const area = document.getElementById('noteArea');
  const status = document.getElementById('noteStatus');
  const lenEl = document.getElementById('noteLen');
  if (!area) return;
  localStorage.setItem(NOTE_KEY, area.value);
  if (lenEl) lenEl.textContent = area.value.length + ' karakter';
  if (status) {
    status.textContent = '💾 Tersimpan';
    clearTimeout(status._t);
    status._t = setTimeout(() => { status.textContent = '💾 Tersimpan otomatis'; }, 1500);
  }
}

function copyNote() {
  const area = document.getElementById('noteArea');
  const btn = document.getElementById('btnCopyNote');
  if (!area || !area.value.trim()) { 
    if (btn) { btn.textContent = '⚠️ Catatan kosong!'; setTimeout(() => { btn.innerHTML = '📋 Copy'; }, 1500); }
    return; 
  }
  navigator.clipboard.writeText(area.value).then(() => {
    if (btn) {
      btn.innerHTML = '✅ Tersalin!';
      btn.style.background = '#F0FDF4';
      btn.style.borderColor = '#BBF7D0';
      btn.style.color = '#16A34A';
      setTimeout(() => {
        btn.innerHTML = '📋 Copy';
        btn.style.background = '#EFF6FF';
        btn.style.borderColor = '#BFDBFE';
        btn.style.color = '#2563EB';
      }, 2000);
    }
  });
}

function clearNote() {
  if (!confirm('Hapus catatan ini?')) return;
  const area = document.getElementById('noteArea');
  const lenEl = document.getElementById('noteLen');
  if (!area) return;
  area.value = '';
  localStorage.removeItem(NOTE_KEY);
  if (lenEl) lenEl.textContent = '0 karakter';
}

// Init catatan saat halaman load
document.addEventListener('DOMContentLoaded', initNote);