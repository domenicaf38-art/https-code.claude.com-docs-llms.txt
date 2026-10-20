/* ==========================================================================
   Flomidec — interacciones (IIFE, sin módulos)
   ========================================================================== */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var B = window.__BRAND__ || {};
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // Conversaciones que "explotan" desde el teléfono
  function initBurst() {
    var box = document.getElementById('burst');
    if (!box || !box.animate || reduced) return;
    var items = [
      ['', '¿Tienen cupos esta semana?'], ['alt', 'Me encantó su contenido'], ['heart', '♡'],
      ['', 'Quiero reservar'], ['icon', 'chat'], ['alt', '¿Cuál es el precio?'], ['heart', '♡'],
      ['', '¿Hacen envíos a Quito?'], ['icon', 'cam'], ['alt', 'Lo quiero'], ['', 'Información, por favor'],
      ['heart', '♡'], ['icon', 'cart'], ['alt', '¿Dónde están ubicados?'], ['', 'Vi su anuncio en Instagram']
    ];
    var icons = {
      chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>',
      cam: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg>',
      cart: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2 11h11l2-8H6"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/></svg>'
    };
    var n = 0, live = 0;
    box.classList.add('live');
    function spawn() {
      if (document.hidden || live > 9) return;
      var it = items[n++ % items.length];
      var el = document.createElement('span');
      el.className = 'bub' + (it[0] ? ' ' + it[0] : '');
      if (it[0] === 'icon') el.innerHTML = icons[it[1]]; else el.textContent = it[1];
      box.appendChild(el);
      live++;
      var w = box.clientWidth, narrow = w < 480;
      var ang = Math.random() * Math.PI * 2;
      var dist = (narrow ? 150 : 200) + Math.random() * (narrow ? 60 : 90);
      var hx = Math.max(20, box.clientWidth / 2 - el.offsetWidth / 2 - 8), hy = box.clientHeight / 2 - 30;
      var x = Math.max(-hx, Math.min(hx, Math.cos(ang) * dist));
      var y = Math.max(-hy, Math.min(hy, Math.sin(ang) * dist * 1.05));
      var rot = (Math.random() - .5) * 24;
      var anim = el.animate([
        { transform: 'translate(-50%,-50%) translate(0,0) scale(.2) rotate(0deg)', opacity: 0 },
        { transform: 'translate(-50%,-50%) translate(' + x * .7 + 'px,' + y * .7 + 'px) scale(1.08) rotate(' + rot + 'deg)', opacity: 1, offset: .25 },
        { transform: 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px) scale(1) rotate(' + rot + 'deg)', opacity: 1, offset: .75 },
        { transform: 'translate(-50%,-50%) translate(' + x * 1.05 + 'px,' + (y * 1.05 - 30) + 'px) scale(.9) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 5200 + Math.random() * 1400, easing: 'cubic-bezier(.2,.8,.2,1)' });
      anim.onfinish = function () { el.remove(); live--; };
    }
    for (var i = 0; i < 6; i++) setTimeout(spawn, i * 140);
    setInterval(spawn, 750);
  }

  // Profundidad 3D: el teléfono y los objetos siguen al cursor
  function initTilt() {
    var hv = document.getElementById('heroVisual');
    if (!hv || !window.matchMedia('(pointer: fine)').matches) return;
    var phone = hv.querySelector('.phone'), objs = hv.querySelectorAll('[data-depth]');
    hv.addEventListener('pointermove', function (e) {
      var r = hv.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      phone.style.setProperty('--ry', (dx * 18).toFixed(2) + 'deg');
      phone.style.setProperty('--rx', (-dy * 12).toFixed(2) + 'deg');
      [].forEach.call(objs, function (o) {
        var d = +o.dataset.depth;
        o.style.transform = 'translate(' + (dx * d).toFixed(1) + 'px,' + (dy * d).toFixed(1) + 'px)';
      });
    });
    hv.addEventListener('pointerleave', function () {
      phone.style.removeProperty('--ry'); phone.style.removeProperty('--rx');
      [].forEach.call(objs, function (o) { o.style.transform = ''; });
    });
  }

  // Contadores vivos del reel y del sticker de mensajes
  function initLiveCounters() {
    var likes = document.getElementById('likes'), msgs = document.getElementById('msgCount'), com = document.getElementById('comments');
    var l = 2400, m = 38, c = 318;
    setInterval(function () {
      l += Math.floor(Math.random() * 9) + 1;
      if (likes) likes.textContent = (l / 1000).toFixed(1).replace('.', ',') + 'K';
      if (Math.random() > .5) { m++; if (msgs) msgs.textContent = '+' + m + ' hoy'; }
      if (Math.random() > .6) { c++; if (com) com.textContent = c; }
    }, 900);
  }

  // Video del hero: si existe assets/video/hero.mp4 se muestra encima de la animación
  function initHeroVideo() {
    var v = document.querySelector('.screen-video');
    if (!v || !v.dataset.src) return;
    v.addEventListener('playing', function () { v.classList.add('ready'); });
    v.addEventListener('error', function () { v.remove(); }, true);
    v.src = v.dataset.src;
    var p = v.play && v.play();
    if (p && p.catch) p.catch(function () {});
  }

  // Captura de una landing (si guardas el archivo en assets/img, reemplaza la portada)
  function initShots() {
    [].forEach.call(document.querySelectorAll('[data-shot]'), function (el) {
      var img = new Image();
      img.onload = function () { el.style.backgroundImage = 'url(' + el.dataset.shot + ')'; el.classList.add('has-shot'); };
      img.src = el.dataset.shot;
    });
  }

  function initNav() {
    var nav = document.getElementById('nav');
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 30); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

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
        el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .2 + 'px,' + (e.clientY - r.top - r.height / 2) * .3 + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  // Botones con data-plan → preseleccionan el servicio en el formulario
  function initPlanLinks() {
    var sel = document.getElementById('serviceSelect');
    if (!sel) return;
    [].forEach.call(document.querySelectorAll('[data-plan]'), function (a) {
      a.addEventListener('click', function () {
        var want = a.dataset.plan.toLowerCase();
        [].forEach.call(sel.options, function (o) { if (o.text.toLowerCase().indexOf(want) !== -1) sel.value = o.value; });
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
      if (!nombre) { hint.textContent = 'Escribe tu nombre para continuar.'; form.nombre.focus(); return; }
      var msg = 'Hola Flomidec 👋\n\n' +
        'Nombre: ' + nombre + '\n' +
        (d.get('negocio') ? 'Marca: ' + d.get('negocio') + '\n' : '') +
        'Servicio: ' + d.get('servicio') + '\n' +
        (d.get('mensaje') ? '\n' + d.get('mensaje') : '');
      var url = waLink(msg);
      hint.innerHTML = 'Si WhatsApp no se abrió, <a href="' + url + '" target="_blank" rel="noopener">toca aquí para enviarlo</a>.';
      window.open(url, '_blank', 'noopener');
    });
  }

  function initBrandData() {
    var wa = document.getElementById('waFloat');
    if (wa) wa.href = waLink();
    var map = { instagram: B.instagram, tiktok: B.tiktok, facebook: B.facebook };
    [].forEach.call(document.querySelectorAll('[data-social]'), function (a) {
      if (map[a.dataset.social]) a.href = map[a.dataset.social];
    });
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  }

  // Fotos del equipo: si existen assets/img/anabel.webp y domenica.webp, se muestran
  function initPortraits() {
    var files = ['anabel', 'domenica'];
    [].forEach.call(document.querySelectorAll('.p-photo'), function (el, k) {
      if (!files[k]) return;
      var src = 'assets/img/' + files[k] + '.webp', img = new Image();
      img.onload = function () { el.style.backgroundImage = 'url(' + src + ')'; el.classList.add('has-photo'); };
      img.src = src;
    });
  }

  function boot() {
    safe(initReveal, 'reveal');
    safe(initBurst, 'burst');
    safe(initTilt, 'tilt');
    safe(initLiveCounters, 'liveCounters');
    safe(initHeroVideo, 'heroVideo');
    safe(initShots, 'shots');
    safe(initNav, 'nav');
    safe(initMobileMenu, 'mobileMenu');
    safe(initMagnetic, 'magnetic');
    safe(initPlanLinks, 'planLinks');
    safe(initForm, 'form');
    safe(initBrandData, 'brandData');
    safe(initPortraits, 'portraits');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
