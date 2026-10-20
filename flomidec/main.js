/* ==========================================================================
   Flomidec — interacciones (IIFE, sin módulos)
   ========================================================================== */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var B = window.__BRAND__ || {};

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn('[flomidec] ' + name + ' falló:', e); }
  }

  function waLink(text) {
    return 'https://wa.me/' + (B.whatsapp || '') + '?text=' + encodeURIComponent(text || B.whatsappMessage || '');
  }

  // Revelado al hacer scroll + red de seguridad de 6s
  function initReveal() {
    var els = [].slice.call(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 70) + 'ms';
      io.observe(el);
    });
    setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 6000);
  }

  // Contadores animados
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', t0 = null;
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1400, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          el.textContent = v + suf;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.05 });
    [].forEach.call(els, function (el) { io.observe(el); });
  }

  // Nav: estado al hacer scroll + indicador deslizante
  function initNav() {
    var nav = document.getElementById('nav');
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 30); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    var links = document.querySelector('.nav-links'), ind = links && links.querySelector('.nav-indicator');
    if (!ind) return;
    [].forEach.call(links.querySelectorAll('a'), function (a) {
      a.addEventListener('pointerenter', function () {
        ind.style.width = a.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + a.offsetLeft + 'px)';
        ind.style.opacity = '1';
      });
    });
    links.addEventListener('pointerleave', function () { ind.style.opacity = '0'; });
  }

  // Menú móvil
  function initMobileMenu() {
    var btn = document.querySelector('.burger'), menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    function toggle(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    btn.addEventListener('click', function () { toggle(!menu.classList.contains('open')); });
    [].forEach.call(menu.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { toggle(false); }); });
  }

  // Botones magnéticos (solo con puntero fino)
  function initMagnetic() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    [].forEach.call(document.querySelectorAll('.magnetic'), function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.2, y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  // Anatomía de la landing: lista ↔ maqueta
  function initAnatomy() {
    var items = document.querySelectorAll('.anatomy-list li'), parts = document.querySelectorAll('.browser .part');
    if (!items.length) return;
    var idx = 0, timer;
    function set(i) {
      idx = i;
      [].forEach.call(items, function (li, k) { li.classList.toggle('active', k === i); li.setAttribute('aria-selected', k === i); });
      [].forEach.call(parts, function (p, k) { p.classList.toggle('on', k === i); });
    }
    function auto() { clearInterval(timer); timer = setInterval(function () { set((idx + 1) % items.length); }, 3800); }
    [].forEach.call(items, function (li, k) {
      li.addEventListener('click', function () { set(k); auto(); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(k); auto(); } });
    });
    set(0); auto();
  }

  // Testimonios rotativos
  function initQuotes() {
    var qs = document.querySelectorAll('#quotes .quote'), dots = document.querySelectorAll('.quote-dots button');
    if (!qs.length) return;
    var i = 0, timer;
    function show(n) {
      i = n;
      [].forEach.call(qs, function (q, k) { q.classList.toggle('active', k === n); });
      [].forEach.call(dots, function (d, k) { d.classList.toggle('active', k === n); });
    }
    function auto() { clearInterval(timer); timer = setInterval(function () { show((i + 1) % qs.length); }, 6000); }
    [].forEach.call(dots, function (d, k) { d.addEventListener('click', function () { show(k); auto(); }); });
    auto();
  }

  // Botones de plan → preseleccionan el servicio en el formulario
  function initPlanLinks() {
    var sel = document.getElementById('serviceSelect');
    if (!sel) return;
    [].forEach.call(document.querySelectorAll('[data-plan]'), function (a) {
      a.addEventListener('click', function () {
        var want = a.dataset.plan.toLowerCase();
        [].forEach.call(sel.options, function (o) {
          if (o.text.toLowerCase().indexOf(want) !== -1) sel.value = o.value;
        });
      });
    });
  }

  // Formulario → WhatsApp
  function initForm() {
    var form = document.getElementById('contactForm'), hint = document.getElementById('formHint');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form), nombre = (d.get('nombre') || '').trim();
      if (!nombre) { hint.textContent = 'Por favor, escribe tu nombre.'; form.nombre.focus(); return; }
      var msg = 'Hola Flomidec 👋\n\n' +
        'Nombre: ' + nombre + '\n' +
        (d.get('negocio') ? 'Marca: ' + d.get('negocio') + '\n' : '') +
        'Servicio: ' + d.get('servicio') + '\n' +
        (d.get('mensaje') ? '\n' + d.get('mensaje') : '');
      hint.textContent = 'Abriendo WhatsApp…';
      window.open(waLink(msg), '_blank', 'noopener');
    });
  }

  // Datos de marca desde manifest.js
  function initBrandData() {
    var wa = document.getElementById('waFloat');
    if (wa) wa.href = waLink();
    var map = { instagram: B.instagram, tiktok: B.tiktok, facebook: B.facebook };
    [].forEach.call(document.querySelectorAll('[data-social]'), function (a) {
      var k = a.dataset.social;
      if (k === 'email' && B.email) { a.href = 'mailto:' + B.email; a.textContent = B.email; }
      else if (map[k]) a.href = map[k];
    });
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  }

  // Fotos del equipo: si existen assets/img/anabel.webp y domenica.webp, se muestran
  function initPortraits() {
    var files = ['anabel', 'domenica'];
    [].forEach.call(document.querySelectorAll('.portrait'), function (el, k) {
      if (!files[k]) return;
      var src = 'assets/img/' + files[k] + '.webp', img = new Image();
      img.onload = function () { el.style.backgroundImage = 'url(' + src + ')'; el.classList.add('has-photo'); };
      img.src = src;
    });
  }

  function boot() {
    safe(initReveal, 'reveal');
    safe(initCounters, 'counters');
    safe(initNav, 'nav');
    safe(initMobileMenu, 'mobileMenu');
    safe(initMagnetic, 'magnetic');
    safe(initAnatomy, 'anatomy');
    safe(initQuotes, 'quotes');
    safe(initPlanLinks, 'planLinks');
    safe(initForm, 'form');
    safe(initBrandData, 'brandData');
    safe(initPortraits, 'portraits');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
