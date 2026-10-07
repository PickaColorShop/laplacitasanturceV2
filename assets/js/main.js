/* La Placita de Santurce — interacciones
   Sin dependencias. Respeta prefers-reduced-motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Menú móvil ---------- */
  var burger = $('.burger'), menu = $('#menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      burger.textContent = open ? 'Cerrar' : 'Menú';
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) burger.click();
    });
  }

  /* ---------- Estado abierto / cerrado (hora de Puerto Rico, UTC-4, sin horario de verano) ---------- */
  var H = window.PLACITA_HOURS || {
    market: { days: [1, 2, 3, 4, 5, 6], open: 6, close: 18 },          // Lun–Sáb 6AM–6PM
    night:  { days: [3, 4, 5, 6, 0], open: 18, close: 26 }             // Mié–Dom 6PM–2AM
  };
  function prNow() {
    var d = new Date();
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000 - 4 * 3600000);
  }
  function inRange(rule, day, hour) {
    if (rule.days.indexOf(day) > -1 && hour >= rule.open && hour < Math.min(rule.close, 24)) return true;
    // horas pasada la medianoche cuentan como parte del día anterior
    if (rule.close > 24) {
      var prev = (day + 6) % 7;
      if (rule.days.indexOf(prev) > -1 && hour < rule.close - 24) return true;
    }
    return false;
  }
  function updateLive() {
    var n = prNow(), day = n.getDay(), hour = n.getHours() + n.getMinutes() / 60;
    var label, cls;
    if (inRange(H.night, day, hour)) { label = '¡La noche está prendía!'; cls = 'is-night'; }
    else if (inRange(H.market, day, hour)) { label = 'Mercado abierto ahora'; cls = ''; }
    else { label = 'Cerrado · vuelve pronto'; cls = 'is-closed'; }
    $$('[data-live]').forEach(function (el) {
      el.classList.remove('is-night', 'is-closed');
      if (cls) el.classList.add(cls);
      var b = $('b', el); if (b) b.textContent = label;
    });
  }
  updateLive(); setInterval(updateLive, 60000);

  /* ---------- Header + barra de progreso ---------- */
  var nav = $('.nav'), bar = $('.progress');
  var parallax = $$('[data-speed]');
  var hs = $('.hscroll'), track = hs && $('.hscroll__track', hs);
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('is-scrolled', y > 30);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (!reduce) {
      parallax.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var mid = r.top + r.height / 2 - innerHeight / 2;
        var s = parseFloat(el.dataset.speed) || 0;
        var rot = el.dataset.rot || 0;
        el.style.transform = 'translate3d(0,' + (mid * s).toFixed(1) + 'px,0) rotate(' + rot + 'deg)';
      });
      if (hs && track) {
        var rect = hs.getBoundingClientRect();
        var total = hs.offsetHeight - innerHeight;
        var p = Math.min(Math.max(-rect.top / total, 0), 1);
        var max = track.scrollWidth - innerWidth;
        track.style.transform = 'translate3d(' + (-p * max) + 'px,0,0)';
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Texto partido por palabras ---------- */
  $$('.split-text').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
    }).join(' ');
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('.reveal, .split-text, .squiggle');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Contadores ---------- */
  $$('[data-count]').forEach(function (el) {
    var end = parseInt(el.dataset.count, 10), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    var start = parseInt(el.dataset.from || '0', 10);
    function run() {
      if (reduce) { el.textContent = pre + end + suf; return; }
      var t0 = null;
      (function step(t) {
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / 1600, 1), e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + Math.round(start + (end - start) * e) + suf;
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    }
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .5 });
      o.observe(el);
    } else run();
  });

  /* ---------- Directorio: filtros + búsqueda ---------- */
  $$('[data-finder]').forEach(function (finder) {
    var cards = $$('.card', finder);
    var chips = $$('[data-filter]', finder.closest('section') || document);
    var input = $('input[type="search"]', finder);
    var meta = $('.finder__meta', finder);
    var empty = $('.empty', finder);
    var current = 'todos';

    function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

    function apply(animate) {
      var q = norm(input ? input.value : '');
      var shown = 0;
      cards.forEach(function (c) {
        var okCat = current === 'todos' || c.dataset.cat === current;
        var okQ = !q || norm(c.textContent).indexOf(q) > -1;
        var show = okCat && okQ;
        c.hidden = !show;
        if (show) {
          shown++;
          if (animate && !reduce) { c.classList.remove('is-filtering'); void c.offsetWidth; c.classList.add('is-filtering'); }
        }
      });
      chips.forEach(function (ch) { ch.setAttribute('aria-pressed', ch.dataset.filter === current); });
      if (meta) meta.textContent = shown + (shown === 1 ? ' lugar encontrado' : ' lugares encontrados');
      if (empty) empty.classList.toggle('is-on', shown === 0);
    }

    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        current = (current === ch.dataset.filter && ch.dataset.filter !== 'todos') ? 'todos' : ch.dataset.filter;
        apply(true);
        if (ch.classList.contains('tile')) finder.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', current === 'todos' ? location.pathname : '#' + current);
      });
    });
    if (input) input.addEventListener('input', function () { apply(false); });

    var hash = location.hash.replace('#', '');
    if (hash && chips.some(function (c) { return c.dataset.filter === hash; })) current = hash;
    apply(false);
  });

  /* ---------- Formularios (placeholder hasta conectar HubSpot/Mailchimp) ---------- */
  $$('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (f.getAttribute('action') && f.getAttribute('action') !== '#') return; // si ya tiene endpoint real, enviar normal
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      f.classList.add('is-sent');
      var btn = $('button[type="submit"]', f);
      if (btn) { btn.disabled = true; btn.textContent = '¡Listo! ✓'; }
    });
  });


  /* ---------- Video del hero ---------- */
  $$('.hero-video video').forEach(function (v) {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    // pausa el video cuando el hero sale de pantalla (ahorra batería y CPU)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? v.play().catch(function(){}) : v.pause(); }).observe(v);
    }
  });

  /* ---------- Año footer ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
