// =========================================================
// Construmetálicas — JS Profesional con animaciones + slider
// =========================================================

// === Configuración WhatsApp ===
const WHATSAPP_NUMBER = '56900000000'; // 569XXXXXXXX (sin + ni espacios)

// Utilidades
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// WhatsApp
function buildWaUrl(source, service) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  const text = `Hola, vengo desde la web. Quiero cotizar${service ? ' el servicio de ' + service : ''}. Fuente: ${source}.`;
  return `${base}?text=${encodeURIComponent(text)}`;
}
function wireWhatsAppButtons() {
  qsa('[id^="btn-whatsapp"], .wa-service, #wa-fab').forEach(el => {
    const source = el.getAttribute('data-wa') || 'General';
    const service = el.getAttribute('data-service') || '';
    el.setAttribute('href', buildWaUrl(source, service));
  });
}

// Reveal global (scroll)
function wireReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in');

      const isImg = el.classList.contains('reveal-img');
      const keyframes = isImg
        ? [{ opacity: 0, transform: 'translateY(40px) scale(.96)' },
           { opacity: 1, transform: 'translateY(0) scale(1)' }]
        : [{ opacity: 0, transform: 'translateY(24px)' },
           { opacity: 1, transform: 'translateY(0)' }];
      el.animate(keyframes, { duration: 850, easing: 'cubic-bezier(.2,.65,.25,1)', fill: 'forwards' });

      io.unobserve(el);
    });
  }, { threshold: 0.18 });

  qsa('.reveal, .reveal-img').forEach(el => io.observe(el));
}

// Stats (Sobre nosotros)
function animateStats() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10) || 0;
      const start = performance.now();
      const duration = 1200;
      (function tick(t){
        const p = clamp((t - start) / duration, 0, 1);
        el.textContent = Math.floor(target * p);
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      io.unobserve(el);
    });
  }, { threshold: 0.55 });

  qsa('.stat').forEach(el => io.observe(el));
}

// Servicios (stagger)
function animateServiceCards() {
  const cards = qsa('#servicios .card');
  if (!cards.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      cards.forEach((card, i) => {
        card.animate([
          { opacity: 0, transform: 'translateY(36px) scale(.98)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 600, delay: i * 110, easing: 'cubic-bezier(.16,.84,.44,1)', fill: 'forwards' });
      });
      io.disconnect();
    });
  }, { threshold: 0.2 });
  io.observe(cards[0]);
}

// "Antes y Después" — Slider (uno por uno)
function setupBeforeAfterSlider() {
  const section = qs('#galeria');
  if (!section) return;

  const container  = qs('.container', section);
  const oldGallery = qs('.gallery', container);
  const cta        = qs('.cta-center', container);

  // Proyectos (ajusta rutas si tus assets usan otros nombres)
  const projects = [
    { before: 'assets/gallery-1.png',  after: 'assets/gallery-6.png'  },
    { before: 'assets/gallery-2.png',  after: 'assets/gallery-7.png'  },
    { before: 'assets/gallery-3.png',  after: 'assets/gallery-8.png'  },
    { before: 'assets/gallery-4.png',  after: 'assets/gallery-9.png'  },
    { before: 'assets/gallery-5.png',  after: 'assets/gallery-10.png' }
  ];

  // Precarga rápida
  projects.forEach(p => ['before','after'].forEach(k => { const im = new Image(); im.src = p[k]; }));

  // Estructura
  const wrapper = document.createElement('div');
  wrapper.className = 'before-after-wrapper reveal';

  const header = document.createElement('div');
  header.className = 'before-after-header';
  header.innerHTML = `
    <div class="col-title">ANTES</div>
    <div class="col-title">DESPUÉS</div>
  `;

  const stage = document.createElement('div');
  stage.className = 'before-after-row';

  const beforeBlock = document.createElement('div');
  beforeBlock.className = 'before-block';
  const beforeImg = document.createElement('img');
  beforeImg.className = 'reveal-img';
  beforeBlock.appendChild(beforeImg);

  const afterBlock = document.createElement('div');
  afterBlock.className = 'after-block';
  const afterImg = document.createElement('img');
  afterImg.className = 'reveal-img';
  afterBlock.appendChild(afterImg);

  stage.appendChild(beforeBlock);
  stage.appendChild(afterBlock);

  // Controles laterales + índice
  const controls = document.createElement('div');
  controls.className = 'ba-controls';
  controls.innerHTML = `
    <button class="ba-arrow ba-prev" aria-label="Proyecto anterior" type="button">
      <span aria-hidden="true">←</span>
    </button>
    <span class="ba-index" aria-live="polite">1 / ${projects.length}</span>
    <button class="ba-arrow ba-next" aria-label="Proyecto siguiente" type="button">
      <span aria-hidden="true">→</span>
    </button>
  `;

  // Montaje
  wrapper.appendChild(header);
  wrapper.appendChild(stage);
  wrapper.appendChild(controls);

  if (oldGallery) oldGallery.replaceWith(wrapper);
  else container.appendChild(wrapper);

  // CTA abajo del slider
  if (cta) container.appendChild(cta);

  // Estado slider
  let index = 0;
  const idxSpan = qs('.ba-index', controls);
  const prevBtn = qs('.ba-prev', controls);
  const nextBtn = qs('.ba-next', controls);

  function setImages(i, dir = 0) {
    const p = projects[i];

    const outKF = dir < 0
      ? [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(36px)' }]
      : [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-36px)' }];

    const inKF = dir < 0
      ? [{ opacity: 0, transform: 'translateX(-36px)' }, { opacity: 1, transform: 'translateX(0)' }]
      : [{ opacity: 0, transform: 'translateX(36px)' }, { opacity: 1, transform: 'translateX(0)' }];

    if (beforeImg.src) {
      beforeImg.animate(outKF, { duration: 260, easing: 'ease', fill: 'forwards' });
      afterImg.animate(outKF,  { duration: 260, easing: 'ease', fill: 'forwards' });
    }

    setTimeout(() => {
      beforeImg.src = p.before;
      beforeImg.alt = `Proyecto ${i + 1} antes`;
      afterImg.src  = p.after;
      afterImg.alt  = `Proyecto ${i + 1} después`;

      beforeImg.animate(inKF, { duration: 520, easing: 'cubic-bezier(.2,.65,.25,1)', fill: 'forwards' });
      afterImg.animate(inKF,  { duration: 520, easing: 'cubic-bezier(.2,.65,.25,1)', fill: 'forwards' });

      idxSpan.textContent = `${i + 1} / ${projects.length}`;
      updateArrows();
    }, beforeImg.src ? 140 : 0);
  }

  function updateArrows() {
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === projects.length - 1;
    prevBtn.classList.toggle('is-disabled', prevBtn.disabled);
    nextBtn.classList.toggle('is-disabled', nextBtn.disabled);
  }

  function go(delta) {
    const newIdx = clamp(index + delta, 0, projects.length - 1);
    if (newIdx === index) return;
    index = newIdx;
    setImages(index, delta > 0 ? 1 : -1);
  }

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));

  // Teclado (← →)
  window.addEventListener('keydown', (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
    if (e.key === 'ArrowLeft')  go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  // Swipe táctil
  (function addSwipe(el) {
    let startX = 0, dx = 0, active = false;
    el.addEventListener('touchstart', (e) => { active = true; startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchmove',  (e) => { if (!active) return; dx = e.touches[0].clientX - startX; }, { passive: true });
    el.addEventListener('touchend',   ()  => {
      if (!active) return;
      if (dx > 50) go(-1);
      else if (dx < -50) go(1);
      active = false; dx = 0;
    }, { passive: true });
  })(stage);

  // Inicial
  setImages(index, 0);
}

// Año
function setYear() {
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear();
}

// Accesos rápidos
function keyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'w') {
      const fab = qs('#wa-fab');
      if (fab) fab.focus();
    }
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  wireWhatsAppButtons();
  setupBeforeAfterSlider();   // Slider + CTA al fondo
  wireReveals();
  animateStats();
  animateServiceCards();
  setYear();
  keyboardShortcuts();
});
