// The Midnight Brew - First-load branded loader
// Shows once per browser using localStorage, injects accessible overlay, and hides smoothly on ready
(function(){
  try {
    var STORAGE_KEY = 'tmb_loader_seen_v1';
    var hasSeen = false;
    try { hasSeen = localStorage.getItem(STORAGE_KEY) === '1'; } catch(e) { /* ignore storage errors */ }

    if (hasSeen) { return; }

    var docEl = document.documentElement;
    docEl.classList.add('tmb--no-scroll');

    var overlay = document.createElement('div');
    overlay.id = 'tmb-first-loader';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-label', 'Loading The Midnight Brew');

    // Inline HTML: coffee cup with steam + brand + typewriter tagline
    overlay.innerHTML = '\
      <div class="tmb-loader-wrap" aria-hidden="true">\
        <div class="tmb-cup">\
          <div class="tmb-steam"></div>\
          <div class="tmb-steam"></div>\
          <div class="tmb-steam"></div>\
          <svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">\
            <!-- Simple cup silhouette using brand colors -->\
            <defs>\
              <linearGradient id="tmbCup" x1="0" y1="0" x2="1" y2="1">\
                <stop offset="0%" stop-color="#8B4513"/>\
                <stop offset="100%" stop-color="#6B3410"/>\
              </linearGradient>\
            </defs>\
            <path d="M20 40 h50 a10 10 0 0 1 0 20 h-50 z" fill="url(#tmbCup)"/>\
            <rect x="20" y="40" width="50" height="38" rx="6" fill="url(#tmbCup)"/>\
            <path d="M70 45 c15 0 15 20 0 20" fill="none" stroke="#D2691E" stroke-width="6" stroke-linecap="round"/>\
          </svg>\
        </div>\
        <div class="tmb-brand">The Midnight Brew</div>\
        <div class="tmb-type">Brewing your midnight magic…</div>\
      </div>';

    // Insert at very start of body (or document) so it shows immediately
    var insert = function(){
      if (document.body) {
        document.body.prepend(overlay);
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch(e) { /* ignore */ }
      } else {
        // Retry shortly if body not yet available
        setTimeout(insert, 10);
      }
    };
    insert();

    var hidden = false;
    function hideOverlay(){
      if (hidden) return;
      hidden = true;
      overlay.classList.add('tmb-hide');
      docEl.classList.remove('tmb--no-scroll');
      // Remove node after transition for perf
      setTimeout(function(){ if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 450);
    }

    // Hide when main content is ready: prefer full load for smoothness, fallback after timeout
    window.addEventListener('load', hideOverlay, { once: true });
    // Safety: hide after 3.5s even if load lingers (e.g., slow third-party)
    setTimeout(hideOverlay, 3500);

    // If user prefers reduced motion, shorten lifecycle
    try {
      var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq && mq.matches) {
        setTimeout(hideOverlay, 800);
      }
    } catch(e) { /* ignore */ }
  } catch (err) {
    // Fail open: if anything goes wrong, don’t block the app
    try { document.documentElement.classList.remove('tmb--no-scroll'); } catch(e) {}
  }
})();


