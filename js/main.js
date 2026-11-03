/* ALPHAVISTA IMÓVEIS — interações
   Scroll suave (Lenis), cursor customizado, cards com tilt 3D,
   botões magnéticos e contadores animados. */
(function () {
  'use strict';
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll suave e inercial (Lenis) ---------- */
  var lenis = null;
  if (window.Lenis && !reduced && finePointer) { // só no desktop: no celular o scroll nativo é mais leve
    lenis = new window.Lenis({ duration: 1.25, smoothWheel: true, wheelMultiplier: 0.9 });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // Âncoras do menu com scroll cinematográfico
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var el = id.length > 1 ? document.querySelector(id) : document.body;
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.6 });
      else el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Cursor customizado ---------- */
  var cursor = document.querySelector('.cursor');
  if (cursor && finePointer) {
    var ring = cursor.firstElementChild;
    var x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var big = !!(e.target.closest && e.target.closest('a,button,input,[data-hover]'));
      var s = big ? 72 : 30;
      ring.style.width = s + 'px'; ring.style.height = s + 'px';
      ring.style.marginLeft = (-s / 2) + 'px'; ring.style.marginTop = (-s / 2) + 'px';
      ring.style.borderColor = big ? '#00FF88' : 'rgba(245,245,240,0.7)';
      ring.style.background = big ? 'rgba(0,255,136,0.18)' : 'transparent';
    });
  }

  /* ---------- Tilt 3D (cards de teses + celular) ---------- */
  if (finePointer) {
    document.querySelectorAll('[data-hover]').forEach(function (card) {
      var base = card.getAttribute('data-base') || '';
      var strength = base ? 22 : 12;
      var glare = card.lastElementChild;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = base + ' rotateX(' + ((0.5 - py) * strength) + 'deg) rotateY(' + ((px - 0.5) * strength) + 'deg) translateZ(20px)';
        if (glare && glare.getAttribute('aria-hidden') === 'true') {
          glare.style.background = 'radial-gradient(circle at ' + (px * 100) + '% ' + (py * 100) + '%, rgba(255,255,255,0.28), transparent 55%)';
        }
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = base;
        if (glare && glare.getAttribute('aria-hidden') === 'true') glare.style.background = 'transparent';
      });
    });

    /* ---------- Botões magnéticos ---------- */
    document.querySelectorAll('.btn-neon').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        var my = (e.clientY - (r.top + r.height / 2)) * 0.4;
        btn.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------- Contadores animados ---------- */
  var counters = document.querySelectorAll('[data-count]');
  var run = function (el) {
    if (el.__done) return; el.__done = true;
    var to = parseFloat(el.getAttribute('data-count'));
    var pad = parseInt(el.getAttribute('data-pad') || '0', 10);
    var start = performance.now(), dur = 2200;
    var step = function (now) {
      var p = Math.min(1, (now - start) / dur);
      var ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      var v = Math.round(to * ease);
      el.textContent = pad ? String(Math.max(1, v)).padStart(pad, '0') : v.toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-pad') ? '01' : '0'; io.observe(c); });
  }
})();
