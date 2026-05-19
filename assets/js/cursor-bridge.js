// cursor-bridge.js — jalan di dalam iframe, kirim posisi + hover + leave ke parent

(function () {
  if (window.self === window.top) return;

  const HOVER_SELECTORS = 'a, button, [onclick], label, select, input, textarea, .nav-item, .tool-card, .drop-zone, [role="button"]';

  document.addEventListener('mousemove', function (e) {
    const iframe = window.frameElement;
    if (!iframe) return;
    const rect = iframe.getBoundingClientRect();
    window.parent.postMessage({
      type: 'iframe-mousemove',
      x: rect.left + e.clientX,
      y: rect.top + e.clientY,
      _bridge: true
    }, '*');
  });

  // Kirim leave hanya jika mouse benar-benar keluar dari window lewat iframe
  document.addEventListener('mouseleave', function (e) {
    // e.clientY < 0 = keluar atas, > innerHeight = keluar bawah, dst
    const exitedWindow =
      e.clientX <= 0 || e.clientX >= window.innerWidth ||
      e.clientY <= 0 || e.clientY >= window.innerHeight;
    if (exitedWindow) {
      window.parent.postMessage({ type: 'iframe-mouseleave', _bridge: true }, '*');
    }
  });

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(HOVER_SELECTORS)) {
      window.parent.postMessage({ type: 'iframe-hover-on', _bridge: true }, '*');
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(HOVER_SELECTORS)) {
      const stillHovering = e.relatedTarget && e.relatedTarget.closest(HOVER_SELECTORS);
      if (!stillHovering) {
        window.parent.postMessage({ type: 'iframe-hover-off', _bridge: true }, '*');
      }
    }
  });

})();