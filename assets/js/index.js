// ---------- Helpers ----------
const root = document.documentElement;
const HEADER_H =
  parseInt(getComputedStyle(root).getPropertyValue('--header-h')) || 80;

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function smoothScrollTo(targetEl, duration = 900) {
  if (!targetEl) return;
  const targetTop =
    targetEl.getBoundingClientRect().top + window.pageYOffset - HEADER_H;
  const startY = window.pageYOffset;
  const distance = targetTop - startY;
  const startT = performance.now();

  function step(now) {
    const p = Math.min(1, (now - startT) / duration);
    const eased = easeInOutQuad(p);
    window.scrollTo(0, startY + distance * eased);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---------- Parallax drift for hero ----------
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  let ticking = false;
  function update() {
    const y = Math.max(-60, Math.min(60, window.scrollY * 0.2));
    root.style.setProperty('--parallax', y + 'px');
    ticking = false;
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );
  update();
})();

// ---------- Fade-ins (About & Contact) ----------
const aboutWrap = document.querySelector('.about-wrap');
const contactSection = document.getElementById('contact');

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 },
);

if (aboutWrap) fadeObserver.observe(aboutWrap);
if (contactSection) fadeObserver.observe(contactSection);

// ---------- Smooth scroll bindings (logo, nav, CTAs) ----------
const linkMap = [
  ['logoHome', 'hero'],
  ['navHome', 'hero'],
  ['navAbout', 'about'],
  ['navContact', 'contact'],
  ['indexContact', 'contact'],
  ['aboutContact', 'contact'],
];

function setActiveById(id) {
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
  });
}

linkMap.forEach(([linkId, sectionId]) => {
  const link = document.getElementById(linkId);
  const target = document.getElementById(sectionId);
  if (!link || !target) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    // highlight immediately for responsiveness
    setActiveById(sectionId);
    smoothScrollTo(target, 900);
  });
});

// ---------- Scroll-based active nav (so it updates as you scroll) ----------
(function () {
  const sections = Array.from(document.querySelectorAll('section[id]')) // hero, about, contact
    .filter((s) => ['hero', 'about', 'contact'].includes(s.id));

  const navLinks = document.querySelectorAll('nav a');

  function setActive(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // choose the most visible section if multiple fire
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    },
    { threshold: 0.6 },
  );

  sections.forEach((section) => observer.observe(section));
})();

// ---------- Prevent scrolling above top (guard) ----------
window.addEventListener(
  'scroll',
  () => {
    if (window.scrollY < 0) window.scrollTo(0, 0);
  },
  { passive: true },
);

// ---------- AJAX Contact Form Submission ----------
(function () {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      statusEl.textContent = 'Please complete the required fields.';
      statusEl.className = 'status error';
      return;
    }

    const data = new FormData(form);
    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });
      if (resp.ok) {
        form.reset();
        statusEl.textContent = 'Thanks — your message has been sent.';
        statusEl.className = 'status success';
      } else {
        const json = await resp.json().catch(() => ({}));
        statusEl.textContent =
          json.error ||
          'Something went wrong. Please try again or email me directly.';
        statusEl.className = 'status error';
      }
    } catch (err) {
      statusEl.textContent =
        'Network error. Please try again later or email me directly.';
      statusEl.className = 'status error';
    }
  });
})();
