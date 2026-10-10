// Header scroll effect
const header = document.getElementById('siteHeader');
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  if (toTop) toTop.classList.toggle('show', window.scrollY > 500);
});
if (toTop) {
  toTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
}

// Mobile menu
const burger = document.getElementById('burgerBtn');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a:not(.dropdown-toggle)').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  }));
}

// Dropdown (Eventos) - on mobile the first tap opens the submenu instead of navigating
document.querySelectorAll('.has-dropdown').forEach(item => {
  const toggle = item.querySelector('.dropdown-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', (e) => {
    if (!window.matchMedia('(max-width:960px)').matches) return;
    e.preventDefault();
    const isOpen = item.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
  // close the desktop dropdown after jumping to a section on the same page
  item.querySelectorAll('.dropdown a').forEach(a => a.addEventListener('click', () => a.blur()));
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, {threshold:0.15});
revealEls.forEach(el => io.observe(el));

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  if (!q) return;
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Testimonial slider (only present on index.html)
const track = document.getElementById('testiTrack');
const dotsWrap = document.getElementById('testiDots');
if (track && dotsWrap) {
  const slides = track.children.length;
  let current = 0;
  for (let i = 0; i < slides; i++) {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  }
  function goToSlide(i) {
    current = i;
    track.style.transform = `translateX(-${i * 100}%)`;
    [...dotsWrap.children].forEach((d, idx) => d.classList.toggle('active', idx === i));
  }
  setInterval(() => { goToSlide((current + 1) % slides); }, 6000);
}

// Photo carousel (only present on index.html) - duplicate the photos so the loop is seamless
const photoTrack = document.getElementById('photoTrack');
if (photoTrack && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  [...photoTrack.children].forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelector('img').alt = '';
    photoTrack.appendChild(clone);
  });
}

// Contact form (contacto.html and ingles.html) - sends to Supabase.
// Status messages can be overridden per page with data-msg-* attributes on the form.
const SUPABASE_URL = 'https://vmujhqeswldmsonoozps.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mXiB9Ox4HWVjFVJZO55gPA_m1pzgpEo';

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const statusEl = document.getElementById('contactFormStatus');
  const submitBtn = document.getElementById('contactSubmitBtn');
  const msg = {
    sending: contactForm.dataset.msgSending || 'Enviando...',
    success: contactForm.dataset.msgSuccess || '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.',
    error: contactForm.dataset.msgError || 'No pudimos enviar tu mensaje. Intenta de nuevo en un momento.'
  };
  contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const data = new FormData(contactForm);
    const payload = {
      nombre: data.get('nombre') || '',
      correo: data.get('correo') || '',
      telefono: data.get('telefono') || '',
      motivo: data.get('motivo') || '',
      mensaje: data.get('mensaje') || ''
    };
    if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.7'; }
    if (statusEl) { statusEl.textContent = msg.sending; statusEl.style.color = 'var(--text-muted)'; }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mensajes_contacto`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('request failed');
      if (statusEl) { statusEl.textContent = msg.success; statusEl.style.color = 'var(--accent-600)'; }
      contactForm.reset();
    } catch (err) {
      if (statusEl) { statusEl.textContent = msg.error; statusEl.style.color = '#c0392b'; }
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = '1'; }
    }
  });
}

// Newsletter form (present on every page) - demo submit
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', function(e){
    e.preventDefault();
    alert('¡Gracias por suscribirte a nuestro boletín!');
    this.reset();
  });
}
