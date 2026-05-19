// cursor-bridge.js — jalan di dalam iframe, kirim posisi + status hover ke parent

(function () {
    if (window.self === window.top) return;
  
    const HOVER_SELECTORS = 'a, button, [onclick], label, select, input, textarea, .nav-item, .tool-card, .drop-zone, [role="button"]';
  
    function send(type, extra) {
      const iframe = window.frameElement;
      if (!iframe) return;
      const rect = iframe.getBoundingClientRect();
      window.parent.postMessage({ type, ...extra, _bridge: true }, '*');
    }
  
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
  
    document.addEventListener('mouseleave', function () {
      window.parent.postMessage({ type: 'iframe-mouseleave', _bridge: true }, '*');
    });
  
    // Kirim status hover ke parent
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(HOVER_SELECTORS)) {
        window.parent.postMessage({ type: 'iframe-hover-on', _bridge: true }, '*');
      }
    });
  
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(HOVER_SELECTORS)) {
        // Cek apakah mouse masih di dalam elemen hover lain
        const stillHovering = e.relatedTarget && e.relatedTarget.closest(HOVER_SELECTORS);
        if (!stillHovering) {
          window.parent.postMessage({ type: 'iframe-hover-off', _bridge: true }, '*');
        }
      }
    });
  
  })();