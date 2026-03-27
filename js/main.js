/* ============================================================
   ARTHUR ET MAX – main.js
   Animations, interactions, formulaire
   ============================================================ */

'use strict';

/* ─── NAVBAR : scroll effect + hamburger ─── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar || !hamburger || !navLinks) return;

  // Scroll → navbar gets background
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 48);
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const links    = navLinks.querySelectorAll('.nav-link[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = navLinks.querySelector(`[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ─── BACK TO TOP ─── */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─── SCROLL REVEAL (IntersectionObserver) ─── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Cascade delay based on sibling index in the same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.08}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });

  elements.forEach(el => observer.observe(el));
})();

/* ─── ANIMATED COUNTERS ─── */
(function initCounters() {
  const numbers = document.querySelectorAll('.stat-number[data-target]');
  if (!numbers.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    let start      = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed  = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  numbers.forEach(n => observer.observe(n));
})();

/* ─── LOGEMENTS FILTER ─── */
(function initFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.logement-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const type = card.dataset.type;
        const show = filter === 'all' || type === filter ||
          (filter === 't1' && (type === 't1a' || type === 't1b'));
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (show) {
          card.style.opacity   = '1';
          card.style.transform = '';
          card.style.display   = '';
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            if (btn.dataset.filter !== 'all' && card.dataset.type !== btn.dataset.filter) {
              card.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });
})();

/* ─── TÉMOIGNAGES SLIDER ─── */
(function initSlider() {
  const track    = document.getElementById('sliderTrack');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  const dotsEl   = document.getElementById('sliderDots');

  if (!track || !prevBtn || !nextBtn || !dotsEl) return;

  const cards    = track.querySelectorAll('.temoignage-card');
  let current    = 0;
  let autoTimer  = null;

  // Determine cards per view from CSS
  const getPerView = () => window.innerWidth <= 640 ? 1 : window.innerWidth <= 900 ? 2 : 3;

  // Create dots
  const buildDots = () => {
    dotsEl.innerHTML = '';
    const perView = getPerView();
    const count   = Math.ceil(cards.length / perView);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Témoignage ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    }
  };

  const getDots = () => dotsEl.querySelectorAll('.slider-dot');

  const goTo = (index) => {
    const perView   = getPerView();
    const maxIndex  = Math.ceil(cards.length / perView) - 1;
    current = Math.max(0, Math.min(index, maxIndex));

    // Calculate translate: card width + gap
    const cardWidth = cards[0].getBoundingClientRect().width + 24;
    track.style.transform = `translateX(-${current * cardWidth * perView}px)`;

    getDots().forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const goNext = () => {
    const perView  = getPerView();
    const maxIndex = Math.ceil(cards.length / perView) - 1;
    goTo(current < maxIndex ? current + 1 : 0);
  };

  const goPrev = () => {
    const perView  = getPerView();
    const maxIndex = Math.ceil(cards.length / perView) - 1;
    goTo(current > 0 ? current - 1 : maxIndex);
  };

  prevBtn.addEventListener('click', () => { goPrev(); resetAuto(); });
  nextBtn.addEventListener('click', () => { goNext(); resetAuto(); });

  // Auto-advance
  const startAuto = () => { autoTimer = setInterval(goNext, 5000); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); resetAuto(); }
  });

  // Init
  buildDots();
  startAuto();

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(0); }, 250);
  });
})();

/* ─── CONTACT FORM ─── */
(function initForm() {
  const form       = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  // Simple field validation
  const validate = (field) => {
    const val = field.value.trim();
    const isRequired = field.hasAttribute('required');
    if (isRequired && !val) return false;
    if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
    if (field.type === 'checkbox' && field.required && !field.checked) return false;
    return true;
  };

  const setError = (field, hasError) => {
    field.style.borderColor = hasError ? '#e53e3e' : '';
  };

  // Live validation on blur
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      if (field.value.trim() || field.type === 'checkbox') {
        setError(field, !validate(field));
      }
    });
    field.addEventListener('input', () => {
      if (field.style.borderColor) setError(field, !validate(field));
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all
    let isValid = true;
    form.querySelectorAll('input, select, textarea').forEach(field => {
      if (!validate(field)) {
        setError(field, true);
        isValid = false;
      }
    });

    if (!isValid) {
      form.querySelector('[style*="border-color"]')?.focus();
      return;
    }

    // Show loading state
    const btnText    = form.querySelector('.btn-text');
    const btnLoading = form.querySelector('.btn-loading');
    const submitBtn  = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    if (btnText)    btnText.hidden    = true;
    if (btnLoading) btnLoading.hidden = false;

    // Simulate send (replace with real backend call)
    await new Promise(r => setTimeout(r, 1500));

    // Success
    form.style.display = 'none';
    if (successMsg) successMsg.hidden = false;

    /*
      TODO: Remplacer la simulation par un vrai appel API :

      const data = new FormData(form);
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(data)),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Erreur envoi');
    */
  });
})();

/* ─── SMOOTH SCROLL pour ancres internes ─── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── PARALLAX léger sur le hero ─── */
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  const deco1  = document.querySelector('.deco-1');
  if (!heroBg || !deco1) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `translateY(${y * 0.3}px)`;
  }, { passive: true });
})();
