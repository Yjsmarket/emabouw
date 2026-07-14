/* ==========================================================================
   Emabouw - interactie (puur client-side, geen backend)
   ========================================================================== */

/* --- Config: pas dit aan met het echte e-mailadres ---------------------- */
var CONFIG = {
  EMAIL: 'info@emabouw.nl'        // [E-MAILADRES]
};

(function () {
  'use strict';

  var header = document.querySelector('.header');
  var isSolidPage = header && header.classList.contains('solid');
  function onScroll() {
    if (isSolidPage) return;
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  if (header && !isSolidPage) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }

  /* Mobiel menu */
  var menu = document.getElementById('mobileMenu');
  var openBtn = document.getElementById('menuOpen');
  var closeBtn = document.getElementById('menuClose');
  function closeMenu() { if (menu) menu.classList.remove('open'); document.body.style.overflow = ''; }
  if (openBtn) openBtn.addEventListener('click', function () { menu.classList.add('open'); document.body.style.overflow = 'hidden'; });
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* Reveal bij scrollen */
  var revEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revEls.forEach(function (el) { ro.observe(el); });
  } else { revEls.forEach(function (el) { el.classList.add('in'); }); }

  /* Werkwijze: stappen laten oplichten */
  var steps = document.querySelectorAll('.step');
  if ('IntersectionObserver' in window && steps.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lit'); } });
    }, { threshold: 0.4 });
    steps.forEach(function (s) { so.observe(s); });
  } else { steps.forEach(function (s) { s.classList.add('lit'); }); }

  /* Swipe-track pijlen */
  document.querySelectorAll('[data-track]').forEach(function (block) {
    var track = block.querySelector('.track');
    var prev = block.querySelector('[data-prev]');
    var next = block.querySelector('[data-next]');
    if (!track) return;
    function step() { var c = track.querySelector('*'); return c ? c.getBoundingClientRect().width + 16 : 320; }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  });

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = item.classList.contains('open');
      if (open) { item.classList.remove('open'); a.style.maxHeight = 0; }
      else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* Optie-keuzes (widget) */
  document.querySelectorAll('.opt input').forEach(function (input) {
    input.addEventListener('change', function () {
      var opt = input.closest('.opt');
      if (!opt) return;
      if (input.type === 'radio') {
        opt.parentNode.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('sel'); });
      }
      opt.classList.toggle('sel', input.checked);
    });
  });

  /* Offerte-widget: stappen */
  var W = document.getElementById('offerte');
  if (W) {
    var panels = W.querySelectorAll('.wpanel');
    var stepEls = W.querySelectorAll('.wstep');
    var wline = W.querySelector('.wline');
    var toStep2 = W.querySelector('[data-next-step]');
    var back = W.querySelector('[data-prev-step]');

    function showStep(n) {
      panels.forEach(function (p) { p.classList.toggle('active', p.dataset.panel == n); });
      stepEls.forEach(function (s) {
        var sn = s.dataset.step;
        s.classList.toggle('active', sn == n);
        s.classList.toggle('done', sn < n);
      });
      if (wline) wline.classList.toggle('filled', n >= 2);
    }
    function validateStep1() {
      var ok = true;
      W.querySelectorAll('[data-panel="1"] [required]').forEach(function (f) {
        var wf = f.closest('.wfield');
        if (!f.value.trim()) { if (wf) wf.classList.add('err'); ok = false; }
        else if (wf) wf.classList.remove('err');
      });
      return ok;
    }
    if (toStep2) toStep2.addEventListener('click', function () { if (validateStep1()) showStep(2); });
    if (back) back.addEventListener('click', function () { showStep(1); });
    W.querySelectorAll('[required]').forEach(function (f) {
      f.addEventListener('input', function () { var wf = f.closest('.wfield'); if (wf) wf.classList.remove('err'); });
    });

    var submit = W.querySelector('[data-submit]');
    if (submit) submit.addEventListener('click', function () {
      var ok = true;
      W.querySelectorAll('[data-panel="2"] [required]').forEach(function (f) {
        var wf = f.closest('.wfield');
        if (!f.value.trim()) { if (wf) wf.classList.add('err'); ok = false; }
        else if (wf) wf.classList.remove('err');
      });
      if (!validateStep1()) { showStep(1); return; }
      if (!ok) return;

      function val(name) { var el = W.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ''; }
      var opts = [];
      W.querySelectorAll('[data-panel="2"] .opt.sel input').forEach(function (i) { opts.push(i.dataset.label || i.value); });

      var lines = [
        'Nieuwe offerte-aanvraag - Emabouw', '',
        'Type project: ' + val('project'),
        'Type pand: ' + val('pand'),
        'Gewenste start: ' + val('start'), '',
        'Naam: ' + val('naam'),
        'Plaats: ' + val('plaats'),
        'Contact: ' + val('contactinfo')
      ];
      if (opts.length) lines.push('Wensen: ' + opts.join(', '));
      if (val('opmerkingen')) { lines.push(''); lines.push('Omschrijving: ' + val('opmerkingen')); }

      var subject = 'Offerte-aanvraag - ' + (val('project') || 'Emabouw');
      window.location.href = 'mailto:' + CONFIG.EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }

  /* Dienstkaarten vullen de widget vooraf in */
  var projectSelect = document.querySelector('#offerte [name="project"]');
  if (projectSelect) {
    document.querySelectorAll('#diensten .dienst-card').forEach(function (card) {
      var h = card.querySelector('h3');
      if (!h) return;
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      function pick() {
        var name = h.textContent.trim();
        Array.prototype.forEach.call(projectSelect.options, function (o) {
          if (o.text.trim() === name) projectSelect.value = o.value;
        });
        var wf = projectSelect.closest('.wfield'); if (wf) wf.classList.remove('err');
        var top = document.getElementById('top'); if (top) top.scrollIntoView({ behavior: 'smooth' });
      }
      card.addEventListener('click', pick);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  }

  /* Mail links (met optioneel onderwerp) */
  document.querySelectorAll('[data-mail]').forEach(function (a) {
    var subj = a.getAttribute('data-subject');
    a.href = 'mailto:' + CONFIG.EMAIL + (subj ? '?subject=' + encodeURIComponent(subj) : '');
  });
})();
