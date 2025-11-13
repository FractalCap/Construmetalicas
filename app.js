// =========================================================
// Construmetálicas — JS profesional (slider + menú móvil)
// =========================================================

const WHATSAPP_NUMBER = '56963507197'; // +56 9 6350 7197

// Utils
const qs  = (s, c=document)=>c.querySelector(s);
const qsa = (s, c=document)=>Array.from(c.querySelectorAll(s));
const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));

// WhatsApp links
function buildWaUrl(source, service) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  const text = `Hola, vengo desde la web. Quiero cotizar${service ? ' el servicio de ' + service : ''}. Fuente: ${source}.`;
  return `${base}?text=${encodeURIComponent(text)}`;
}
function wireWhatsAppButtons(){
  qsa('[id^="btn-whatsapp"], .wa-service, #wa-fab').forEach(el=>{
    el.href = buildWaUrl(el.getAttribute('data-wa') || 'General', el.getAttribute('data-service') || '');
  });
}

// Reveal on scroll
function wireReveals(){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target; el.classList.add('in');
      const isImg = el.classList.contains('reveal-img');
      el.animate(isImg
        ? [{opacity:0,transform:'translateY(36px) scale(.96)'},{opacity:1,transform:'translateY(0) scale(1)'}]
        : [{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:800,easing:'cubic-bezier(.2,.65,.25,1)',fill:'forwards'});
      io.unobserve(el);
    });
  },{threshold:.18});
  qsa('.reveal, .reveal-img').forEach(el=>io.observe(el));
}

// Stats counters
function animateStats(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target, target=parseInt(el.dataset.count||'0',10);
      const start=performance.now(), duration=1200;
      (function tick(t){
        const p = clamp((t-start)/duration,0,1);
        el.textContent = Math.floor(target*p);
        if(p<1) requestAnimationFrame(tick);
      })(start);
      io.unobserve(el);
    });
  },{threshold:.55});
  qsa('.stat').forEach(el=>io.observe(el));
}

// Servicios cards stagger
function animateServiceCards(){
  const cards=qsa('#servicios .card'); if(!cards.length) return;
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      cards.forEach((card,i)=>{
        card.animate(
          [{opacity:0,transform:'translateY(28px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],
          {duration:560,delay:i*110,easing:'cubic-bezier(.16,.84,.44,1)',fill:'forwards'}
        );
      });
      io.disconnect();
    });
  },{threshold:.2});
  io.observe(cards[0]);
}

// ===== Menú móvil (hamburguesa) =====
function wireMobileMenu(){
  const toggle = qs('#nav-toggle');
  const drawer = qs('#mobile-drawer');
  const scrim  = qs('#scrim');
  const close  = qs('#drawer-close');
  const focusable = () => qsa('a,button,[tabindex]:not([tabindex="-1"])', drawer);

  if(!toggle || !drawer || !scrim) return;

  function open(){
    drawer.classList.add('open');
    scrim.classList.add('show');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded','true');
    document.body.style.overscrollBehavior = 'contain';
    document.body.style.position = 'fixed';
    document.body.style.inset = '0';
    drawer.focus();
  }
  function closeMenu(){
    drawer.classList.remove('open');
    scrim.classList.remove('show');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
    document.body.style.overscrollBehavior = '';
    document.body.style.position = '';
    document.body.style.inset = '';
    toggle.focus();
  }

  toggle.addEventListener('click', ()=> drawer.classList.contains('open') ? closeMenu() : open());
  close?.addEventListener('click', closeMenu);
  scrim.addEventListener('click', closeMenu);
  qsa('[data-close]', drawer).forEach(a => a.addEventListener('click', closeMenu));

  // ESC y trap de foco simple
  drawer.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') { closeMenu(); return; }
    if(e.key === 'Tab'){
      const f = focusable();
      if(!f.length) return;
      const first = f[0], last = f[f.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  // Swipe para cerrar
  let startX=0, dx=0, active=false;
  drawer.addEventListener('touchstart', e=>{ active=true; startX=e.touches[0].clientX; }, {passive:true});
  drawer.addEventListener('touchmove',  e=>{ if(!active) return; dx=e.touches[0].clientX-startX; }, {passive:true});
  drawer.addEventListener('touchend',   ()=>{ if(!active) return; if(dx>60) closeMenu(); active=false; dx=0; }, {passive:true});
}

// ===== Antes/Después slider (uno por uno) =====
function setupBeforeAfterSlider(){
  const section = qs('#galeria'); if(!section) return;
  const container = qs('.container',section);
  const oldGallery = qs('.gallery',container);
  const cta = qs('.cta-center',container);

  const projects = [
    {before:'assets/gallery-1.png', after:'assets/gallery-6.png'},
    {before:'assets/gallery-2.png', after:'assets/gallery-7.png'},
    {before:'assets/gallery-3.png', after:'assets/gallery-8.png'},
    {before:'assets/gallery-4.png', after:'assets/gallery-9.png'},
    {before:'assets/gallery-5.png', after:'assets/gallery-10.png'}
  ];
  projects.forEach(p=>['before','after'].forEach(k=>{const im=new Image();im.src=p[k];}));

  const wrapper=document.createElement('div'); wrapper.className='before-after-wrapper reveal';
  const header=document.createElement('div'); header.className='before-after-header';
  header.innerHTML=`<div class="col-title">ANTES</div><div class="col-title">DESPUÉS</div>`;

  const stage=document.createElement('div'); stage.className='before-after-row';
  const beforeBlock=document.createElement('div'); beforeBlock.className='before-block';
  const beforeImg=document.createElement('img'); beforeImg.className='reveal-img'; beforeBlock.appendChild(beforeImg);
  const afterBlock=document.createElement('div'); afterBlock.className='after-block';
  const afterImg=document.createElement('img'); afterImg.className='reveal-img'; afterBlock.appendChild(afterImg);
  stage.appendChild(beforeBlock); stage.appendChild(afterBlock);

  const controls=document.createElement('div'); controls.className='ba-controls';
  controls.innerHTML=`
    <button class="ba-arrow ba-prev" aria-label="Proyecto anterior" type="button"><span aria-hidden="true">←</span></button>
    <span class="ba-index" aria-live="polite">1 / ${projects.length}</span>
    <button class="ba-arrow ba-next" aria-label="Proyecto siguiente" type="button"><span aria-hidden="true">→</span></button>
  `;

  wrapper.appendChild(header); wrapper.appendChild(stage); wrapper.appendChild(controls);
  if(oldGallery) oldGallery.replaceWith(wrapper); else container.appendChild(wrapper);
  if(cta) container.appendChild(cta);

  let index=0;
  const prevBtn=qs('.ba-prev',controls), nextBtn=qs('.ba-next',controls), idxSpan=qs('.ba-index',controls);

  function setImages(i, dir=0){
    const p=projects[i];
    const outKF = dir<0 ? [{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(28px)'}]
                        : [{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-28px)'}];
    const inKF  = dir<0 ? [{opacity:0,transform:'translateX(-28px)'},{opacity:1,transform:'translateX(0)'}]
                        : [{opacity:0,transform:'translateX(28px)'},{opacity:1,transform:'translateX(0)'}];

    if(beforeImg.src){
      beforeImg.animate(outKF,{duration:240,easing:'ease',fill:'forwards'});
      afterImg.animate(outKF,{duration:240,easing:'ease',fill:'forwards'});
    }
    setTimeout(()=>{
      beforeImg.src=p.before; beforeImg.alt=`Proyecto ${i+1} antes`;
      afterImg.src=p.after;   afterImg.alt =`Proyecto ${i+1} después`;
      beforeImg.animate(inKF,{duration:480,easing:'cubic-bezier(.2,.65,.25,1)',fill:'forwards'});
      afterImg.animate(inKF,{duration:480,easing:'cubic-bezier(.2,.65,.25,1)',fill:'forwards'});
      idxSpan.textContent = `${i+1} / ${projects.length}`;
      prevBtn.classList.toggle('is-disabled', i===0); prevBtn.disabled = i===0;
      nextBtn.classList.toggle('is-disabled', i===projects.length-1); nextBtn.disabled = i===projects.length-1;
    }, beforeImg.src ? 120 : 0);
  }
  function go(d){ const n=clamp(index+d,0,projects.length-1); if(n===index) return; index=n; setImages(index, d>0?1:-1); }
  prevBtn.addEventListener('click',()=>go(-1));
  nextBtn.addEventListener('click',()=>go(1));
  window.addEventListener('keydown',e=>{
    const tag=(document.activeElement && document.activeElement.tagName)||'';
    if(['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
    if(e.key==='ArrowLeft') go(-1);
    if(e.key==='ArrowRight') go(1);
  });
  (function addSwipe(el){
    let startX=0, dx=0, active=false;
    el.addEventListener('touchstart',e=>{active=true;startX=e.touches[0].clientX;},{passive:true});
    el.addEventListener('touchmove',e=>{if(!active)return;dx=e.touches[0].clientX-startX;},{passive:true});
    el.addEventListener('touchend',()=>{if(!active)return; if(dx>50) go(-1); else if(dx<-50) go(1); active=false; dx=0;},{passive:true});
  })(stage);
  setImages(index,0);
}

// Footer year
function setYear(){ const y=qs('#year'); if(y) y.textContent=new Date().getFullYear(); }

// Shortcuts
function keyboardShortcuts(){
  window.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()==='w'){
      const fab=qs('#wa-fab'); if(fab) fab.focus();
    }
  });
}

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  wireWhatsAppButtons();
  wireMobileMenu();
  setupBeforeAfterSlider();
  wireReveals();
  animateStats();
  animateServiceCards();
  setYear();
  keyboardShortcuts();
});
