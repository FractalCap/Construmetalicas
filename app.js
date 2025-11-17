// =========================================================
// Construmetálicas — Funcionalidad JS general del sitio
// =========================================================

// Número de WhatsApp
const WHATSAPP_NUMBER = '56963507197';

// Utils
const qs = (s, c=document) => c.querySelector(s);
const qsa = (s, c=document) => Array.from(c.querySelectorAll(s));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Construir mensajes para WhatsApp
function buildWaUrl(source, service) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  const text =
    `Hola, vengo desde la web. Quiero cotizar${service ? ' el servicio de ' + service : ''}. Fuente: ${source}.`;
  return `${base}?text=${encodeURIComponent(text)}`;
}

// Aplicar enlaces de WhatsApp a todos los botones
function wireWhatsAppButtons() {
  qsa('[id^="btn-whatsapp"], .wa-service, #wa-fab').forEach(el => {
    el.href = buildWaUrl(
      el.getAttribute('data-wa') || 'General',
      el.getAttribute('data-service') || ''
    );
  });
}

// Reveal on scroll
function wireReveals() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  qsa('.reveal, .reveal-img').forEach(el => io.observe(el));
}

// Contadores de estadísticas
function animateStats() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const el = e.target;
      const target = parseInt(el.dataset.count || '0', 10);
      const start = performance.now();
      const duration = 1300;

      (function animate(t) {
        const progress = clamp((t - start) / duration, 0, 1);
        el.textContent = Math.floor(target * progress);
        if (progress < 1) requestAnimationFrame(animate);
      })(start);

      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  qsa('.stat').forEach(el => io.observe(el));
}

// Animación de tarjetas de servicios
function animateServiceCards() {
  const cards = qsa('#servicios .service-card');
  if (!cards.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      cards.forEach((card, i) => {
        card.animate(
          [
            { opacity: 0, transform: 'translateY(28px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          {
            duration: 600,
            delay: i * 120,
            easing: 'cubic-bezier(.16,.84,.44,1)',
            fill: 'forwards'
          }
        );
      });

      io.disconnect();
    });
  }, { threshold: 0.2 });

  io.observe(cards[0]);
}

// Menú móvil
function wireMobileMenu() {
  const toggle = qs('#nav-toggle');
  const drawer = qs('#mobile-drawer');
  const scrim = qs('#scrim');
  const close = qs('#drawer-close');

  if (!toggle || !drawer || !scrim) return;

  function openMenu() {
    drawer.classList.add('open');
    scrim.classList.add('show');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', true);
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer.classList.remove('open');
    scrim.classList.remove('show');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () =>
    drawer.classList.contains('open') ? closeMenu() : openMenu()
  );

  close.addEventListener('click', closeMenu);
  scrim.addEventListener('click', closeMenu);

  qsa('[data-close]', drawer).forEach(link =>
    link.addEventListener('click', closeMenu)
  );

  drawer.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

// Slider Antes / Después
function setupBeforeAfterSlider() {
  const section = qs('#galeria');
  if (!section) return;

  const container = qs('.container', section);
  const oldGallery = qs('.gallery', container);

  // 👉 SOLO 4 PROYECTOS
  const projects = [
    { before: 'proyecto1-antes.jpg', after: 'proyecto1-despues.jpg' },
    { before: 'proyecto2-antes.jpg', after: 'proyecto2-despues.jpg' },
    { before: 'proyecto3-antes.jpg', after: 'proyecto3-despues.jpg' },
    { before: 'proyecto4-antes.jpg', after: 'proyecto4-despues.jpg' }
  ];

  // Precarga ligera
  projects.forEach(p => {
    const a = new Image(); a.src = p.before;
    const b = new Image(); b.src = p.after;
  });

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

  const controls = document.createElement('div');
  controls.className = 'ba-controls';
  controls.innerHTML = `
    <button class="ba-arrow ba-prev" aria-label="Proyecto anterior"><span>←</span></button>
    <span class="ba-index">1 / ${projects.length}</span>
    <button class="ba-arrow ba-next" aria-label="Proyecto siguiente"><span>→</span></button>
  `;

  wrapper.appendChild(header);
  wrapper.appendChild(stage);
  wrapper.appendChild(controls);

  oldGallery.replaceWith(wrapper);

  let index = 0;

  const prevBtn = qs('.ba-prev', controls);
  const nextBtn = qs('.ba-next', controls);
  const idxSpan = qs('.ba-index', controls);

  function setImages(i) {
    const p = projects[i];

    beforeImg.src = p.before;
    afterImg.src = p.after;
    idxSpan.textContent = `${i + 1} / ${projects.length}`;

    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === projects.length - 1;

    prevBtn.classList.toggle('is-disabled', i === 0);
    nextBtn.classList.toggle('is-disabled', i === projects.length - 1);
  }

  function go(dir) {
    const newIndex = clamp(index + dir, 0, projects.length - 1);
    if (newIndex === index) return;
    index = newIndex;
    setImages(index);
  }

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));

  // Swipe móvil
  let startX = 0;
  stage.addEventListener('touchstart', e => startX = e.touches[0].clientX);
  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 60) go(-1);
    if (dx < -60) go(1);
  });

  setImages(index);
}

// Footer year
function setYear() {
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear();
}

// Keyboard shortcuts
function keyboardShortcuts() {
  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'w') {
      const fab = qs('#wa-fab');
      if (fab) fab.focus();
    }
  });
}

// Inicializar todo
document.addEventListener('DOMContentLoaded', () => {
  wireWhatsAppButtons();
  wireMobileMenu();
  setupBeforeAfterSlider();
  wireReveals();
  animateStats();
  animateServiceCards();
  setYear();
  keyboardShortcuts();
});
