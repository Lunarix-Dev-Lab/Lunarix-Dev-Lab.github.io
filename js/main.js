/* ============================
   LANGUAGE TOGGLE
============================ */
const html = document.documentElement;

function setLang(lang) {
  html.setAttribute('data-lang', lang);
  html.setAttribute('lang', lang);

  const elEs = document.getElementById('langEs');
  const elEn = document.getElementById('langEn');
  const mEs  = document.getElementById('mBtnEs');
  const mEn  = document.getElementById('mBtnEn');

  if (lang === 'es') {
    elEs.className = 'active'; elEn.className = '';
    mEs.classList.add('active'); mEn.classList.remove('active');
  } else {
    elEn.className = 'active'; elEs.className = '';
    mEn.classList.add('active'); mEs.classList.remove('active');
  }

  localStorage.setItem('lx-lang', lang);
}

document.getElementById('langToggle').addEventListener('click', () => {
  setLang(html.getAttribute('data-lang') === 'es' ? 'en' : 'es');
});

window.setLang = setLang;

const savedLang = localStorage.getItem('lx-lang');
if (savedLang && savedLang !== 'es') setLang(savedLang);


/* ============================
   TASK 1 — HERO GRID SPARKLES
   Pure-CSS animation with JS
   spawning cells at random positions.
   Uses opacity + transform only
   (GPU-composited, zero reflow/repaint).
============================ */
/* ============================
   GRID SPARKLES (Hero, About, Team)
============================ */
(function initGridSparkles() {
  const canvases = document.querySelectorAll('#hero-grid-canvas, .grid-canvas');
  if (!canvases.length) return;

  const CELL    = 64;   // coincide con background-size del CSS
  const COUNT   = 24;   // celdas simultáneas por sección
  const MIN_DUR = 4.5;
  const MAX_DUR = 9.0;

  function populateCanvas(canvas) {
    canvas.innerHTML = '';
    const cols = Math.ceil(window.innerWidth / CELL) + 1;
    const rows = Math.ceil(canvas.clientHeight / CELL) + 1;

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('div');
      el.className = 'grid-spark';

      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);

      el.style.cssText = [
        `left:${col * CELL}px`,
        `top:${row * CELL}px`,
        `--spark-duration:${(MIN_DUR + Math.random() * (MAX_DUR - MIN_DUR)).toFixed(2)}s`,
        `--spark-delay:-${(Math.random() * MAX_DUR).toFixed(2)}s`,
      ].join(';');

      canvas.appendChild(el);
    }
  }

  function initAll() {
    canvases.forEach(populateCanvas);
  }

  initAll();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initAll, 400);
  }, { passive: true });
})();

/* ============================
   NAVBAR SCROLL
============================ */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ============================
   MOBILE MENU
============================ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const menuClose  = document.getElementById('menuClose');

function openMenu()  { mobileMenu.classList.add('open');    document.body.style.overflow = 'hidden'; }
function closeMenu() { mobileMenu.classList.remove('open'); document.body.style.overflow = ''; }

hamburger.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', closeMenu));


/* ============================
   SCROLL ANIMATIONS
============================ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


/* ============================
   TASK 3 — TEAM CARD INTERACTION
   Desktop (hover device): mouseenter opens ONE card, closing all others.
                           mouseleave closes it immediately.
   Mobile (touch device):  tap toggles the card; tapping another closes the previous.
   Keyboard:               Enter / Space toggles, same single-active rule.
============================ */
(function initTeamCards() {
  const cards = document.querySelectorAll('.team-card');
  if (!cards.length) return;

  // True when the device has a fine pointer AND supports hover (i.e. desktop mouse)
  const isPointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Close every card except the one passed (pass null to close all)
  function closeOthers(except) {
    cards.forEach(c => {
      if (c !== except) {
        c.classList.remove('active');
        c.setAttribute('aria-expanded', 'false');
      }
    });
  }

  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');

    // ── Desktop hover ──────────────────────────────────────────
    card.addEventListener('mouseenter', () => {
      if (!isPointer()) return;
      closeOthers(card);          // collapse all sibling cards first
      card.classList.add('active');
      card.setAttribute('aria-expanded', 'true');
    });

    card.addEventListener('mouseleave', () => {
      if (!isPointer()) return;
      card.classList.remove('active');
      card.setAttribute('aria-expanded', 'false');
    });

    // ── Mobile tap / Keyboard ──────────────────────────────────
    function toggleCard() {
      // On pointer devices the hover already handles everything
      if (isPointer()) return;

      const isOpen = card.classList.contains('active');
      closeOthers(isOpen ? null : card); // close all if already open, else close others
      card.classList.toggle('active', !isOpen);
      card.setAttribute('aria-expanded', String(!isOpen));
    }

    card.addEventListener('click', toggleCard);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard();
      }
    });
  });
})();


/* ============================
   SMOOTH SCROLL FOR ANCHOR LINKS
============================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'smooth'
      });
    }
  });
});


/* ============================
   COOKIE CONSENT (Google Consent Mode v2)
   Analytics stays denied until the user
   explicitly accepts — opt-in model, in
   line with Argentina's Ley 25.326.
============================ */
(function initCookieConsent() {
  const banner = document.getElementById('cookieBanner');
  const KEY = 'lx-cookie-consent';

  function applyConsent(granted) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': granted ? 'granted' : 'denied'
      });
    }
  }

  function show() {
    if (banner) requestAnimationFrame(() => banner.classList.add('show'));
  }
  function hide() {
    if (banner) banner.classList.remove('show');
  }

  function setConsent(value) {
    localStorage.setItem(KEY, value);
    applyConsent(value === 'granted');
    hide();
  }

  // First visit (no stored choice) → reveal the banner shortly after load
  if (banner && !localStorage.getItem(KEY)) {
    setTimeout(show, 700);
  }

  const acceptBtn = document.getElementById('cookieAccept');
  const rejectBtn = document.getElementById('cookieReject');
  if (acceptBtn) acceptBtn.addEventListener('click', () => setConsent('granted'));
  if (rejectBtn) rejectBtn.addEventListener('click', () => setConsent('denied'));

  // Footer "Cookies" link re-opens the banner so the choice can be changed
  document.querySelectorAll('.cookie-settings-link').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); show(); });
  });
})();


/* ============================
   INTERACTIVE SPOTLIGHT (productos page)
   A soft reflector that smoothly trails the cursor across the constellation.
   Performance by design: a single rAF loop writes only `transform` (compositor-
   only — no layout, no paint), and the loop sleeps as soon as the glow settles,
   so an idle mouse costs nothing. Touch / no-pointer devices keep the calm
   ambient CSS drift instead.
============================ */
(function initSpotlight() {
  const glow = document.querySelector('.spotlight');
  if (!glow) return;

  // Only fine-pointer (mouse) devices get cursor tracking; touch keeps CSS drift
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const section = glow.parentElement;   // #products
  let targetX = 0, targetY = 0;         // cursor position, relative to the section
  let curX = 0, curY = 0;               // eased position currently rendered
  let raf = null;
  let tracking = false;

  function tick() {
    curX += (targetX - curX) * 0.12;    // ease toward the cursor
    curY += (targetY - curY) * 0.12;
    glow.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
    if (Math.abs(targetX - curX) > 0.4 || Math.abs(targetY - curY) > 0.4) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;                       // settled — stop until the cursor moves again
    }
  }

  window.addEventListener('pointermove', e => {
    const rect = section.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    if (!tracking) {                    // first move: take over from the CSS drift
      tracking = true;
      curX = targetX;
      curY = targetY;
      glow.classList.add('is-tracking');
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
})();

/* ============================
   SMART EMAIL LINK (PC -> Web / Mobile -> App)
============================ */
(function initSmartEmailLink() {
  const emailLink = document.getElementById('emailLink');
  if (!emailLink) return;

  emailLink.addEventListener('click', (e) => {
    // Detectamos si es móvil mediante pantalla táctil / ancho de pantalla / UserAgent
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;

    if (isMobile) {
      // En móviles, cancelamos el enlace a Gmail Web y usamos mailto: para abrir la App
      e.preventDefault();
      window.location.href = 'mailto:info@lunarix.com.ar';
    }
    // En PC, no hace nada el script y sigue el comportamiento por defecto (abre Gmail Web en nueva pestaña)
  });
})();