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
(function initHeroGrid() {
  const canvas = document.getElementById('hero-grid-canvas');
  if (!canvas) return;

  const CELL  = 64;   // must match CSS background-size
  const COUNT = 28;   // simultaneous sparkle cells
  const MIN_DUR = 4.5;
  const MAX_DUR = 9.0;

  function spawnCell() {
    const el = document.createElement('div');
    el.className = 'grid-spark';

    // Snap to nearest grid line
    const cols  = Math.ceil(window.innerWidth  / CELL) + 1;
    const rows  = Math.ceil(window.innerHeight / CELL) + 1;
    const col   = Math.floor(Math.random() * cols);
    const row   = Math.floor(Math.random() * rows);

    el.style.cssText = [
      `left:${col * CELL}px`,
      `top:${row * CELL}px`,
      `--spark-duration:${(MIN_DUR + Math.random() * (MAX_DUR - MIN_DUR)).toFixed(2)}s`,
      `--spark-delay:-${(Math.random() * MAX_DUR).toFixed(2)}s`,
    ].join(';');

    canvas.appendChild(el);
  }

  for (let i = 0; i < COUNT; i++) spawnCell();

  // Lazily refresh positions on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      canvas.innerHTML = '';
      for (let i = 0; i < COUNT; i++) spawnCell();
    }, 400);
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