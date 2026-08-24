(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); }
  }

  /* ---------- i18n toggle (EN default, ES via data attr pairs) ---------- */
  function initI18n() {
    var root = document.documentElement;
    var STORAGE_KEY = "domfiit-ny-doctors-lang";
    var lang = "en";
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "es") lang = saved;
    } catch (_) {}

    function applyPlaceholders(l) {
      $$("[data-placeholder-en]").forEach(function (el) {
        el.setAttribute("placeholder", l === "es" ? el.dataset.placeholderEs : el.dataset.placeholderEn);
      });
    }

    function applySelectOptions(l) {
      $$("select option[data-en]").forEach(function (opt) {
        opt.textContent = l === "es" ? opt.dataset.es : opt.dataset.en;
      });
    }

    function apply(l) {
      lang = l;
      root.setAttribute("lang", l);
      root.setAttribute("data-lang", l);
      $$(".i18n-en").forEach(function (el) {
        el.hidden = l !== "en";
        if ("disabled" in el) el.disabled = l !== "en";
      });
      $$(".i18n-es").forEach(function (el) {
        el.hidden = l !== "es";
        if ("disabled" in el) el.disabled = l !== "es";
      });
      applyPlaceholders(l);
      applySelectOptions(l);
      $$("[data-lang-toggle]").forEach(function (btn) {
        btn.textContent = l === "en" ? "ES" : "EN";
        btn.setAttribute("aria-label", l === "en" ? "Cambiar a español" : "Switch to English");
      });
      try { localStorage.setItem(STORAGE_KEY, l); } catch (_) {}
    }

    $$("[data-lang-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () { apply(lang === "en" ? "es" : "en"); });
    });

    apply(lang);
  }

  /* ---------- Nav scroll state + mobile menu ---------- */
  function initNav() {
    var nav = $("[data-nav]");
    var toggle = $("[data-menu-toggle]");
    var mobile = $("[data-nav-mobile]");
    if (nav) {
      var onScroll = function () {
        if (scrollY > 60) nav.classList.add("is-scrolled");
        else nav.classList.remove("is-scrolled");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        mobile.setAttribute("data-open", String(!open));
        mobile.setAttribute("aria-hidden", String(open));
        document.body.style.overflow = open ? "" : "hidden";
      });
      $$("a", mobile).forEach(function (a) {
        a.addEventListener("click", function () {
          toggle.setAttribute("aria-expanded", "false");
          mobile.setAttribute("data-open", "false");
          mobile.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ---------- Smooth anchor scroll (native) ---------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 84;
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------- Scroll progress bar ---------- */
  function initScrollProgress() {
    var bar = $("[data-scroll-progress]");
    if (!bar) return;
    var raf = null;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? scrollY / max : 0;
      bar.style.transform = "scaleX(" + pct + ")";
      raf = null;
    }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------- Tilt on cards ---------- */
  function initTilt() {
    if (!fineHover) return;
    $$(".has-tilt").forEach(function (card) {
      var MAX = 6;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Magnetic CTA ---------- */
  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.dataset.magneticStrength || "0.25");
      var inner = document.createElement("span");
      inner.className = "magnetic-inner";
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
      el.classList.add("has-magnetic");
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) - r.width / 2) * strength;
        ty = ((e.clientY - r.top) - r.height / 2) * strength;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        inner.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
        raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Marquee ---------- */
  function initMarquee() {
    $$("[data-marquee]").forEach(function (track) {
      var clone = track.cloneNode(true);
      clone.removeAttribute("data-marquee");
      clone.setAttribute("aria-hidden", "true");
      track.parentNode.appendChild(clone);
      var distance = track.scrollWidth;
      var speed = 46;
      var duration = distance / speed;
      if (window.gsap) {
        gsap.to([track, clone], {
          x: -distance, duration: duration, ease: "none", repeat: -1,
          modifiers: { x: gsap.utils.unitize(function (x) { return parseFloat(x) % distance; }) }
        });
      } else {
        var styleTag = document.createElement("style");
        styleTag.textContent = "@keyframes domfiitMarquee{to{transform:translateX(-" + distance + "px)}}";
        document.head.appendChild(styleTag);
        track.style.animation = "domfiitMarquee " + duration + "s linear infinite";
        clone.style.animation = "domfiitMarquee " + duration + "s linear infinite";
      }
    });
  }

  /* ---------- Count up ---------- */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.dataset.countTo);
      var decimals = (el.dataset.countTo.split(".")[1] || "").length;
      var obj = { v: 0 };
      function trigger() {
        if (window.gsap) {
          gsap.to(obj, {
            v: target, duration: 1.4, ease: "power2.out",
            onUpdate: function () { el.textContent = obj.v.toFixed(decimals); }
          });
        } else {
          el.textContent = target.toFixed(decimals);
        }
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { trigger(); io.unobserve(e.target); } });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    $$(".faq-item").forEach(function (item) {
      var btn = $(".faq-q", item);
      if (!btn) return;
      btn.addEventListener("click", function () {
        var isOpen = item.getAttribute("data-open") === "true";
        $$(".faq-item", item.parentNode).forEach(function (other) { other.setAttribute("data-open", "false"); });
        item.setAttribute("data-open", String(!isOpen));
      });
    });
  }

  /* ---------- Treatment link -> pre-fill select + scroll ---------- */
  function initTreatmentLinks() {
    var select = $("[data-treatment-select]");
    $$("[data-treatment]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (!select) return;
        var value = link.getAttribute("data-treatment");
        Array.prototype.forEach.call(select.options, function (opt) {
          if (opt.value === value) select.value = value;
        });
      });
    });
  }

  /* ---------- Contact form (simulated submit) ---------- */
  function initContactForm() {
    var card = $("[data-form-card]");
    var form = $("[data-contact-form]");
    if (!card || !form) return;
    var msg = $("[data-success-msg]");
    var lang = document.documentElement.getAttribute("data-lang") || "en";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;

      form.classList.add("is-sending");
      var submitBtn = form.querySelector("[type=submit]");
      if (submitBtn) submitBtn.disabled = true;

      setTimeout(function () {
        var currentLang = document.documentElement.getAttribute("data-lang") || "en";
        var firstName = (form.elements.name.value.trim().split(/\s+/)[0]) || "";
        if (msg) {
          msg.textContent = currentLang === "es"
            ? (firstName ? firstName + ", " : "") + "un coordinador de pacientes se pondrá en contacto contigo pronto. (Esta es una demo — el formulario no envía datos reales.)"
            : (firstName ? firstName + ", " : "") + "a patient coordinator will reach out shortly. (This is a demo — no data is actually sent.)";
        }
        form.classList.remove("is-sending");
        card.classList.add("is-sent");
      }, 700 + Math.random() * 500);
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    safe(initI18n, "initI18n");
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initScrollProgress, "initScrollProgress");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initMagnetic, "initMagnetic");
    safe(initCountUp, "initCountUp");
    safe(initFaq, "initFaq");
    safe(initTreatmentLinks, "initTreatmentLinks");
    safe(initContactForm, "initContactForm");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
    }
    safe(initMarquee, "initMarquee");

    var yearEl = $("[data-year]");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
