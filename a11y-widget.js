/* 904 Digital Media — STANDARD accessibility widget (vanilla port).
   Mirrors src/components/A11yWidget.tsx one-for-one: frozen icon, TEXT /
   VISUAL / ORIENTATION sections, the same ten controls and labels, stepped
   0-3 Bigger text + Line height, Reset all, a11y-prefs-v2 + sanitize.
   Colors and corner are the only per-client variables. */
(function () {
  'use strict';
  if (window.__cvA11y) return;
  window.__cvA11y = true;

  var STORAGE_KEY = 'a11y-prefs-v2';
  var TEXT_SIZE_PCT = [100, 110, 125, 150];
  var ALIGN_ORDER = ['default', 'left', 'center', 'right'];
  var POSITION = 'right';

  var DEFAULTS = {
    textSize: 0, lineHeight: 0, textAlign: 'default', readableFont: false,
    contrast: false, grayscale: false, hideImages: false,
    pauseAnimations: false, highlightLinks: false, readingMask: false
  };

  var CLASS_MAP = {
    readableFont: 'a11y-readable', contrast: 'a11y-contrast',
    grayscale: 'a11y-grayscale', hideImages: 'a11y-hide-images',
    pauseAnimations: 'a11y-reduce-motion', highlightLinks: 'a11y-highlight-links'
  };

  /* Clamp anything read out of localStorage to a legal Prefs object. Belt and
     braces alongside the versioned key: a hand-edited or partially-written
     entry degrades to defaults rather than emitting an invalid font-size. */
  function sanitize(raw) {
    var r = raw && typeof raw === 'object' ? raw : {};
    function level(v) { return (v === 1 || v === 2 || v === 3) ? v : 0; }
    function bool(v) { return v === true; }
    function align(v) { return (v === 'left' || v === 'center' || v === 'right') ? v : 'default'; }
    return {
      textSize: level(r.textSize), lineHeight: level(r.lineHeight),
      textAlign: align(r.textAlign), readableFont: bool(r.readableFont),
      contrast: bool(r.contrast), grayscale: bool(r.grayscale),
      hideImages: bool(r.hideImages), pauseAnimations: bool(r.pauseAnimations),
      highlightLinks: bool(r.highlightLinks), readingMask: bool(r.readingMask)
    };
  }

  var html = document.documentElement;
  /* Captured BEFORE anything is applied. This template sets html{font-size:62.5%}
     so a raw "110%" would be a 1.76x jump; scaling from the real computed base
     keeps the steps at exactly 100/110/125/150. */
  var BASE_PX = parseFloat(window.getComputedStyle(html).fontSize) || 10;

  /* Escape hatch. Preferences persist, so a visitor who leaves Hide images or
     Reading mask on sees what looks like a broken page on every later visit and
     may not connect it to the widget. ?a11y=reset (or #a11y-reset) wipes them
     from a plain link — no need to find the launcher first. */
  var FORCE_RESET = /[?&]a11y=reset\b/.test(location.search) || location.hash === '#a11y-reset';

  var prefs = DEFAULTS;
  if (FORCE_RESET) {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  } else {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) prefs = sanitize(JSON.parse(stored));
    } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------- icons -- */
  var ICO = 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  function s(inner, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 22) + '" height="' + (size || 22) + '" fill="none" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }
  /* FROZEN — canonical 904 accessibility mark. Never substitute. */
  function markIcon(size) {
    return s('<circle cx="12" cy="3.6" r="1.7" fill="currentColor"/>' +
      '<path d="M4.5 8h15M12 8v6m0 0l-3 6.2M12 14l3 6.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', size);
  }
  var ICONS = {
    biggerText: s('<path d="M4 6h13M10.5 6v13" ' + ICO + '/>'),
    lineHeight: s('<path d="M6 3v18M6 3l-2.5 3M6 3l2.5 3M6 21l-2.5-3M6 21l2.5-3M12 6h9M12 12h9M12 18h9" ' + ICO + '/>'),
    textAlign: s('<path d="M4 6h16M4 11h10M4 16h16M4 21h10" ' + ICO + '/>'),
    readableFont: s('<text x="12" y="17" text-anchor="middle" font-size="14" fill="currentColor" font-family="serif">Aa</text>'),
    contrast: s('<circle cx="12" cy="12" r="8.5" ' + ICO + '/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor"/>'),
    grayscale: s('<path d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5S7.3 20.5 12 20.5c1.4 0 2.2-.9 2.2-1.9 0-.9-.6-1.4-.6-2.1 0-.6.5-1.1 1.2-1.1h1.5c2.4 0 4.2-1.8 4.2-4.3 0-4-3.6-7.6-8.5-7.6Z" ' + ICO + '/>' +
      '<circle cx="7.6" cy="11.4" r="1.1" fill="currentColor"/><circle cx="10.4" cy="7.6" r="1.1" fill="currentColor"/><circle cx="14.6" cy="7.9" r="1.1" fill="currentColor"/>'),
    hideImages: s('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5" ' + ICO + '/><path d="M4 17l5-5 3.5 3.5M3 3l18 18" ' + ICO + '/>'),
    pauseAnimations: s('<rect x="6.5" y="5" width="4" height="14" rx="1.2" ' + ICO + '/><rect x="13.5" y="5" width="4" height="14" rx="1.2" ' + ICO + '/>'),
    highlightLinks: s('<path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.4 6.4" ' + ICO + '/><path d="M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.4-1.4" ' + ICO + '/>'),
    readingMask: s('<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" ' + ICO + '/><path d="M4 12h16" ' + ICO + ' stroke-dasharray="2.5 2.5"/>'),
    reset: s('<path d="M4 9a8 8 0 1 1-.6 5" ' + ICO + '/><path d="M3.2 4v5h5" ' + ICO + '/>', 18),
    close: s('<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>', 18)
  };

  /* -------------------------------------------------------------- tiles -- */
  var TILES = [
    { section: 'Text', key: 'textSize', label: 'Bigger text', icon: 'biggerText', kind: 'level' },
    { section: 'Text', key: 'lineHeight', label: 'Line height', icon: 'lineHeight', kind: 'level' },
    { section: 'Text', key: 'textAlign', label: 'Text align', icon: 'textAlign', kind: 'align' },
    { section: 'Text', key: 'readableFont', label: 'Readable font', icon: 'readableFont', kind: 'toggle' },
    { section: 'Visual', key: 'contrast', label: 'High contrast', icon: 'contrast', kind: 'toggle' },
    { section: 'Visual', key: 'grayscale', label: 'Grayscale', icon: 'grayscale', kind: 'toggle' },
    { section: 'Visual', key: 'hideImages', label: 'Hide images', icon: 'hideImages', kind: 'toggle' },
    { section: 'Visual', key: 'pauseAnimations', label: 'Pause animations', icon: 'pauseAnimations', kind: 'toggle' },
    { section: 'Orientation', key: 'highlightLinks', label: 'Highlight links', icon: 'highlightLinks', kind: 'toggle' },
    { section: 'Orientation', key: 'readingMask', label: 'Reading mask', icon: 'readingMask', kind: 'toggle' }
  ];

  function tileHTML(t) {
    var dashes = t.kind === 'level'
      ? '<span class="cva11y-dashes" aria-hidden="true"><span class="cva11y-dash"></span><span class="cva11y-dash"></span><span class="cva11y-dash"></span></span>'
      : '';
    return '<button type="button" class="cva11y-tile" data-key="' + t.key + '" data-kind="' + t.kind + '" aria-pressed="false">' +
      '<span class="cva11y-tile-top"><span class="cva11y-ico">' + ICONS[t.icon] + '</span>' + dashes + '</span>' +
      '<span><span class="cva11y-label">' + t.label + '</span><span class="cva11y-detail" hidden></span></span>' +
      '</button>';
  }

  function sectionHTML(name, last) {
    var rows = TILES.filter(function (t) { return t.section === name; }).map(tileHTML).join('');
    return '<span class="cva11y-seclabel">' + name + '</span>' +
      '<div class="cva11y-grid' + (last ? ' is-last' : '') + '">' + rows + '</div>';
  }

  /* ------------------------------------------------------------- build -- */
  if (POSITION === 'left') html.classList.add('a11y-pos-left');

  var fab = document.createElement('button');
  fab.type = 'button';
  fab.id = 'a11y-fab';
  fab.setAttribute('aria-label', 'Accessibility options');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'a11y-panel');
  fab.innerHTML = markIcon(26);

  var panel = document.createElement('div');
  panel.id = 'a11y-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Accessibility');
  panel.hidden = true;
  panel.innerHTML =
    '<div class="cva11y-head">' +
      '<div class="cva11y-head-l">' + markIcon(24) + '<span class="cva11y-title" role="heading" aria-level="2">Accessibility</span></div>' +
      '<button type="button" class="cva11y-close" aria-label="Close accessibility options">' + ICONS.close + '</button>' +
    '</div>' +
    '<div class="cva11y-body">' +
      sectionHTML('Text') + sectionHTML('Visual') + sectionHTML('Orientation', true) +
      '<button type="button" class="cva11y-reset">' + ICONS.reset + 'Reset all</button>' +
    '</div>';

  function mount() {
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    apply();
    render();
    fitFab();
    bindTuck();
  }

  /* -------------------------------------------------------------- state -- */
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ }
  }

  var mask = null, veil = null, maskY = 0;

  function apply() {
    html.style.fontSize = prefs.textSize === 0 ? '' : (BASE_PX * TEXT_SIZE_PCT[prefs.textSize] / 100).toFixed(3) + 'px';

    for (var k in CLASS_MAP) {
      if (Object.prototype.hasOwnProperty.call(CLASS_MAP, k)) {
        html.classList.toggle(CLASS_MAP[k], !!prefs[k]);
      }
    }
    [1, 2, 3].forEach(function (n) { html.classList.toggle('a11y-lh-' + n, prefs.lineHeight === n); });
    ['left', 'center', 'right'].forEach(function (a) { html.classList.toggle('a11y-align-' + a, prefs.textAlign === a); });

    /* Grayscale veil (see the CSS note — a filtered wrapper would unstick the
       template's fixed header / modal / cookie bar). */
    if (prefs.grayscale && !veil) {
      veil = document.createElement('div');
      veil.id = 'a11y-veil';
      veil.setAttribute('aria-hidden', 'true');
      document.body.appendChild(veil);
    } else if (!prefs.grayscale && veil) {
      veil.parentNode.removeChild(veil); veil = null;
    }

    /* Reading mask */
    var coarse = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (prefs.readingMask && coarse) { prefs.readingMask = false; }

    if (prefs.readingMask && !mask) {
      mask = document.createElement('div');
      mask.id = 'a11y-mask';
      mask.setAttribute('aria-hidden', 'true');
      mask.innerHTML = '<div class="cva11y-mask-t"></div><div class="cva11y-mask-b"></div>';
      document.body.appendChild(mask);
      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('touchmove', onTouch, { passive: true });
      maskY = maskY || Math.round(window.innerHeight / 2);
      drawMask();
    } else if (!prefs.readingMask && mask) {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      mask.parentNode.removeChild(mask); mask = null;
    }

    /* Pause animations also stops the ambient background video. */
    Array.prototype.forEach.call(document.querySelectorAll('video'), function (v) {
      if (v.closest && v.closest('[data-cv-video-overlay]')) return;
      if (prefs.pauseAnimations) { try { v.pause(); } catch (e) {} }
      else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });

    persist();
    fitFab();
  }

  function drawMask() {
    if (!mask) return;
    mask.firstChild.style.height = Math.max(maskY - 60, 0) + 'px';
    mask.lastChild.style.top = (maskY + 60) + 'px';
    mask.lastChild.style.bottom = '0';
  }
  function onMove(e) { maskY = e.clientY; drawMask(); }
  function onTouch(e) { if (e.touches && e.touches[0]) { maskY = e.touches[0].clientY; drawMask(); } }

  function render() {
    Array.prototype.forEach.call(panel.querySelectorAll('.cva11y-tile'), function (btn) {
      var key = btn.getAttribute('data-key'), kind = btn.getAttribute('data-kind'), val = prefs[key];
      var active = kind === 'align' ? val !== 'default' : (kind === 'level' ? val > 0 : !!val);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (kind === 'level') {
        Array.prototype.forEach.call(btn.querySelectorAll('.cva11y-dash'), function (d, i) {
          d.classList.toggle('is-on', val >= i + 1);
        });
      }
      var detail = btn.querySelector('.cva11y-detail');
      if (kind === 'align' && val !== 'default') { detail.textContent = val; detail.hidden = false; }
      else { detail.textContent = ''; detail.hidden = true; }
    });
  }

  /* Keep the launcher clear of the template's fixed cookie-consent bar. */
  /* ------------------------------------------------------------- tuck -- */
  /* On a phone the copy runs full width, so a fixed control in the left
     margin covers text at almost any scroll position - no vertical offset
     fixes that. Instead the launcher steps back while the page is moving and
     returns when it stops. Locomotive transforms a container rather than
     scrolling the window on desktop, so wheel and touchmove are listened to
     as well as scroll. */
  var tuckTimer = null;
  function untuck() { html.classList.remove('a11y-fab-tucked'); }
  function tuck() {
    if (!panel.hidden) return;                    /* never while it is open */
    if (document.activeElement === fab) return;   /* never while it has focus */
    html.classList.add('a11y-fab-tucked');
    if (tuckTimer) clearTimeout(tuckTimer);
    tuckTimer = setTimeout(untuck, 900);
  }
  function bindTuck() {
    ['scroll', 'wheel', 'touchmove'].forEach(function (ev) {
      window.addEventListener(ev, tuck, { passive: true, capture: true });
    });
    fab.addEventListener('focus', untuck);
    fab.addEventListener('pointerenter', untuck);
  }

  function fitFab() {
    /* BASE sits the launcher clear of the bottom-left captions this template
       parks at the foot of most sections - section labels, the wordmark, the
       "where we work" line. At 20px it was landing on them at several scroll
       positions. The cookie bar, when it is up, can push it higher still, so
       take whichever clearance is larger rather than letting the bar win. */
    var BASE = 96;
    /* On a short screen - landscape phone - do not spend a quarter of the
       viewport lifting the launcher. Clamp the base only; the cookie bar
       still gets its clearance whatever the screen height. */
    var base = Math.min(BASE, Math.max(20, Math.round(window.innerHeight * 0.22)));
    var cookie = 0;
    var bar = document.querySelector('.cookie-consent');
    if (bar) {
      var r = bar.getBoundingClientRect();
      var visible = r.height > 0 && r.width > 0 && window.getComputedStyle(bar).visibility !== 'hidden';
      var fabR = fab.getBoundingClientRect();
      if (visible && r.bottom > window.innerHeight - 140 &&
          r.right > fabR.left - 12 && r.left < fabR.right + 12) {
        cookie = Math.round(window.innerHeight - r.top) + 16;
      }
    }
    html.style.setProperty('--a11y-fab-bottom', Math.max(base, cookie) + 'px');
  }

  /* ------------------------------------------------------------ events -- */
  function setOpen(v) {
    if (v) { untuck(); }
    panel.hidden = !v;
    fab.setAttribute('aria-expanded', v ? 'true' : 'false');
    if (v) { render(); panel.querySelector('.cva11y-body').scrollTop = 0; panel.querySelector('.cva11y-close').focus({ preventScroll: true }); }
  }

  fab.addEventListener('click', function () { setOpen(panel.hidden); });

  panel.addEventListener('click', function (e) {
    var close = e.target.closest('.cva11y-close');
    if (close) { setOpen(false); fab.focus(); return; }
    if (e.target.closest('.cva11y-reset')) {
      prefs = sanitize(null);
      apply(); render();
      return;
    }
    var tile = e.target.closest('.cva11y-tile');
    if (!tile) return;
    var key = tile.getAttribute('data-key'), kind = tile.getAttribute('data-kind');
    if (kind === 'level') prefs[key] = (prefs[key] + 1) % 4;
    else if (kind === 'align') prefs[key] = ALIGN_ORDER[(ALIGN_ORDER.indexOf(prefs[key]) + 1) % ALIGN_ORDER.length];
    else prefs[key] = !prefs[key];
    apply(); render();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) { setOpen(false); fab.focus(); }
  });

  window.addEventListener('resize', fitFab, { passive: true });
  document.addEventListener('click', function () { setTimeout(fitFab, 60); }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
