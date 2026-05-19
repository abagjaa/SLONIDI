// cursor-bridge.js
// Dijalankan di dalam iframe (pages/*.html)
// Tugasnya: kirim posisi mouse ke parent agar cursor parent tetap bergerak

(function () {
    if (window.self === window.top) return; // Hanya jalan di dalam iframe
  
    document.addEventListener('mousemove', function (e) {
      const iframe = window.frameElement;
      if (!iframe) return;
  
      const rect = iframe.getBoundingClientRect();
      window.parent.postMessage({
        type: 'iframe-mousemove',
        x: rect.left + e.clientX,
        y: rect.top + e.clientY
      }, '*');
    });
  
    document.addEventListener('mouseleave', function () {
      window.parent.postMessage({ type: 'iframe-mouseleave' }, '*');
    });
  })();