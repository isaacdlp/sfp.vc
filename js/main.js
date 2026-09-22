/* ═══════════════════════════════════════════════════════════════════════════
   Spanish Founders Platform — Main JavaScript
   Slideshow · Navigation · Scroll Reveal · Mobile Menu · Contact Form
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ─── Hero Slideshow ─────────────────────────────────────────────────── */
  const slides   = qsa('.hero-slide');
  const dots     = qsa('.hero-dot');
  const INTERVAL = 7000;
  let   current  = 0;
  let   timer    = null;

  function showSlide(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1), INTERVAL);
  }

  if (slides.length > 0) {
    dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); startTimer(); }));
    startTimer();
  }

  /* ─── Hero Text Reveal on Load ───────────────────────────────────────── */
  function triggerHeroReveal() { document.body.classList.add('loaded'); }

  if (document.readyState === 'complete') {
    setTimeout(triggerHeroReveal, 80);
  } else {
    window.addEventListener('load', () => setTimeout(triggerHeroReveal, 80));
  }

  /* ─── Navigation — Scroll Effect ────────────────────────────────────── */
  const nav = qs('#nav');

  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 50); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── Mobile Menu ────────────────────────────────────────────────────── */
  const hamburger = qs('#hamburger');
  const navLinks  = qs('#navLinks');
  const navCta    = qs('.nav-cta');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      navLinks.classList.toggle('is-open', open);
      if (open) nav.classList.add('scrolled');
      else if (window.scrollY <= 50) nav.classList.remove('scrolled');
    });

    qsa('a', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      });
    });

    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      }
    });
  }

  /* ─── Scroll Reveal ──────────────────────────────────────────────────── */
  const revealEls = qsa('.reveal');

  if ('IntersectionObserver' in window && revealEls.length > 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ─── Stagger children in grid containers ────────────────────────────── */
  ['.pillars-grid', '.opportunity-grid', '.team-grid', '.stats-grid'].forEach(sel => {
    const container = qs(sel);
    if (!container) return;
    qsa('.reveal', container).forEach((child, i) => child.classList.add(`stagger-${(i % 4) + 1}`));
  });

  /* ─── Contact Form ───────────────────────────────────────────────────── */
  const contactForm = qs('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn    = qs('.contact-form-submit', contactForm);
      const status = qs('.contact-form-status', contactForm);

      btn.disabled       = true;
      btn.textContent    = 'Sending…';
      status.textContent = '';
      status.className   = 'contact-form-status';

      try {
        const res = await fetch(contactForm.action, {
          method:  'POST',
          headers: { 'Accept': 'application/json' },
          body:    new FormData(contactForm),
        });

        if (res.ok) {
          status.textContent = 'Message sent. We\'ll be in touch shortly.';
          status.classList.add('contact-form-status--ok');
          contactForm.reset();
          btn.textContent = 'Send Message';
        } else {
          throw new Error('server');
        }
      } catch {
        status.textContent = 'Something went wrong. Please try again or email us directly.';
        status.classList.add('contact-form-status--err');
        btn.textContent = 'Send Message';
      }

      btn.disabled = false;
    });
  }

  /* ─── Smooth Scroll for Anchor Links ─────────────────────────────────── */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = qs(id);
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '80', 10);
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });

  /* ─── Active nav link highlight on scroll ───────────────────────────── */
  const sections   = qsa('section[id]');
  const navAnchors = qsa('.nav-link[href^="#"]');

  function updateActiveLink() {
    let closest = null, minDist = Infinity;
    sections.forEach(sec => {
      const dist = Math.abs(sec.getBoundingClientRect().top - 100);
      if (dist < minDist) { minDist = dist; closest = sec.id; }
    });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${closest}`));
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

})();
