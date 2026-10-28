// Todo va dentro de una función para no crear variables globales: el script de PayPhone
// define cientos de nombres globales cortos (io, a, b...) y un choque de nombres lo rompe.
(() => {
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

// Hero slideshow (only present on index.html) - crossfades the cover photos every few seconds.
// Each photo is downloaded just before it is shown, so the page does not load all of them at once.
const heroSlides = document.getElementById('heroSlides');
if (heroSlides && heroSlides.children.length > 1) {
  const slides = [...heroSlides.children];
  const portrait = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loading = new Map();
  const loadSlide = (slide) => {
    if (loading.has(slide)) return loading.get(slide);
    const img = slide.querySelector('img');
    const src = (portrait && img.dataset.srcMovil) || img.dataset.src;
    const p = new Promise(resolve => {
      if (!src) return resolve();
      img.onload = img.onerror = () => resolve();
      img.src = src;
    });
    loading.set(slide, p);
    return p;
  };
  let current = 0;
  let busy = false;
  const showNext = () => {
    if (busy || document.hidden) return;
    busy = true;
    const next = (current + 1) % slides.length;
    loadSlide(slides[next]).then(() => {
      slides.forEach(s => s.classList.remove('prev'));
      slides[current].classList.replace('active', 'prev');
      slides[next].classList.add('active');
      current = next;
      loadSlide(slides[(next + 1) % slides.length]);
      busy = false;
    });
  };
  loadSlide(slides[1]);
  setInterval(showNext, reduceMotion ? 9000 : 6000);
}

// Upcoming events row (horarios.html) - drops events whose date has passed and drives the arrow buttons.
const eventsReel = document.getElementById('eventsReel');
if (eventsReel) {
  const now = new Date();
  eventsReel.querySelectorAll('[data-fecha]').forEach(card => {
    if (new Date(card.dataset.fecha + 'T23:59:59') < now) card.remove();
  });
  const section = eventsReel.closest('section');
  if (!eventsReel.children.length) {
    section.hidden = true;
  } else {
    const buttons = section.querySelectorAll('.reel-btn');
    const updateButtons = () => {
      const max = eventsReel.scrollWidth - eventsReel.clientWidth - 2;
      buttons.forEach(b => { b.disabled = b.dataset.dir === '-1' ? eventsReel.scrollLeft <= 2 : eventsReel.scrollLeft >= max; });
    };
    buttons.forEach(b => b.addEventListener('click', () => {
      eventsReel.scrollBy({left: Number(b.dataset.dir) * eventsReel.clientWidth * 0.8});
    }));
    eventsReel.addEventListener('scroll', updateButtons, {passive: true});
    window.addEventListener('resize', updateButtons);
    updateButtons();
  }
}

// House-cell map (ubicacion.html) - one numbered pin per .cell-card with data-lat/data-lng, plus the church.
// Clicking a card flies the map to its pin; clicking a pin highlights its card.
const cellsMapEl = document.getElementById('cellsMap');
if (cellsMapEl && window.L) {
  const CHURCH = [-2.1495905, -79.5821205];
  const map = L.map(cellsMapEl, {scrollWheelZoom: false});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const pinIcon = (html, extra = '') => L.divIcon({
    className: '', html: `<div class="cell-pin ${extra}">${html}</div>`,
    iconSize: [36, 36], iconAnchor: [18, 40], popupAnchor: [0, -38]
  });
  L.marker(CHURCH, {icon: pinIcon('<i class="fa-solid fa-cross"></i>', 'church'), zIndexOffset: 1000})
    .addTo(map)
    .bindPopup('<strong>Templo Galilea</strong><br>Sede principal<br><a href="https://maps.app.goo.gl/BS41eaCGVGgSNyBaA" target="_blank" rel="noopener">Ver en Google Maps →</a>');

  const cards = [...document.querySelectorAll('.cell-card')];
  const points = [CHURCH];
  const entries = [];
  cards.forEach(card => {
    if (!card.dataset.lat) return;
    const pos = [Number(card.dataset.lat), Number(card.dataset.lng)];
    // two cells sharing the exact same point: nudge the later pin ~20 m east so both numbers are visible
    while (points.some(p => Math.abs(p[0] - pos[0]) < 0.00005 && Math.abs(p[1] - pos[1]) < 0.00005)) pos[1] += 0.00018;
    const num = card.dataset.num;
    const leader = card.querySelector('.cell-leader').textContent.trim();
    const route = card.querySelector('.cell-go').href;
    const marker = L.marker(pos, {icon: pinIcon(`<span>${num}</span>`)}).addTo(map)
      .bindPopup(`<strong>Célula #${num}</strong><br>${leader}<br>Viernes · 7:30 PM<br><a href="${route}" target="_blank" rel="noopener">Cómo llegar →</a>`);
    points.push(pos);
    entries.push({card, marker, pos});
  });

  const select = (entry) => {
    entries.forEach(e => {
      const on = e === entry;
      e.card.classList.toggle('active', on);
      e.marker.getElement()?.querySelector('.cell-pin').classList.toggle('active', on);
    });
  };
  entries.forEach(entry => {
    entry.card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // let "Cómo llegar" open normally
      select(entry);
      map.flyTo(entry.pos, 16, {duration: 0.8});
      entry.marker.openPopup();
      if (window.matchMedia('(max-width:900px)').matches) {
        cellsMapEl.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    });
    entry.marker.on('click', () => {
      select(entry);
      if (!window.matchMedia('(max-width:900px)').matches) {
        const list = entry.card.parentElement;
        list.scrollTo({top: entry.card.offsetTop - list.offsetTop - 4, behavior: 'smooth'});
      }
    });
  });
  map.fitBounds(points, {padding: [40, 40]});
}

// Event lists (eventos.html, index.html) - a grid with data-past moves cards whose data-fin has passed
// into that grid (marked "Realizado"); with data-past="" they are simply removed.
document.querySelectorAll('[data-past]').forEach(grid => {
  const now = new Date();
  const pastGrid = grid.dataset.past ? document.getElementById(grid.dataset.past) : null;
  grid.querySelectorAll('.event-card[data-fin]').forEach(card => {
    if (new Date(card.dataset.fin) >= now) return;
    if (!pastGrid) { card.remove(); return; }
    card.classList.add('is-past');
    card.querySelector('.event-status')?.remove();
    card.querySelector('.event-body > a')?.remove();
    const badge = document.createElement('div');
    badge.className = 'event-status';
    badge.innerHTML = '<i class="fa-solid fa-check"></i> Realizado';
    card.querySelector('.event-img').appendChild(badge);
    pastGrid.prepend(card);
  });
});

// Home page: show only the next N events (data-limit) after past ones were removed.
document.querySelectorAll('.events-grid[data-limit]').forEach(grid => {
  [...grid.querySelectorAll('.event-card')].slice(Number(grid.dataset.limit)).forEach(card => card.remove());
});

// Monthly sermon series (eventos.html) - sermons whose date has passed are marked "Realizada".
document.querySelectorAll('.series-card[data-fin]').forEach(card => {
  if (new Date(card.dataset.fin) >= new Date()) return;
  card.classList.add('is-past');
  card.querySelector('.series-date').innerHTML = '<span class="series-done"><i class="fa-solid fa-check"></i> Realizada</span>';
});

// "Próximo evento" with countdown (eventos.html) - shows the first upcoming card that has data-inicio.
const nextEvent = document.getElementById('nextEvent');
const upcomingGrid = document.getElementById('eventsUpcoming');
if (nextEvent && upcomingGrid) {
  const card = [...upcomingGrid.querySelectorAll('.event-card[data-inicio]')]
    .sort((a, b) => new Date(a.dataset.inicio) - new Date(b.dataset.inicio))[0];
  if (card) {
    const part = name => nextEvent.querySelector(`[data-ne="${name}"]`);
    part('title').textContent = card.querySelector('h3').textContent;
    part('meta').innerHTML = card.querySelector('.event-meta').innerHTML;
    const link = card.querySelector('.event-body > a');
    if (link) {
      part('link').href = link.href;
      part('link').target = link.target;
      part('link').rel = link.rel;
      part('link').innerHTML = link.innerHTML;
    } else {
      part('link').remove();
    }
    const start = new Date(card.dataset.inicio);
    const cd = part('countdown');
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const diff = start - new Date();
      if (diff <= 0) {
        cd.innerHTML = '<div class="countdown-live"><span class="live-dot"></span> ¡Está sucediendo ahora!</div>';
        return false;
      }
      const sec = Math.floor(diff / 1000);
      cd.querySelector('[data-cd="d"]').textContent = Math.floor(sec / 86400);
      cd.querySelector('[data-cd="h"]').textContent = pad(Math.floor(sec % 86400 / 3600));
      cd.querySelector('[data-cd="m"]').textContent = pad(Math.floor(sec % 3600 / 60));
      cd.querySelector('[data-cd="s"]').textContent = pad(sec % 60);
      return true;
    };
    if (tick()) {
      const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
    }
    nextEvent.hidden = false;
  }
}

// Weekly live-stream countdown (predicas.html). Counts down to the next service; during the service window
// it shows the YouTube live player instead. Times are Ecuador time (UTC-5, no daylight saving), so the
// countdown is correct for visitors in any time zone.
const LIVE_SCHEDULE = {day: 0, hour: 10, minute: 0, durationMin: 150, utcOffset: -5}; // Sunday 10:00 AM, 2.5 h
const LIVE_OFFSET = LIVE_SCHEDULE.utcOffset * 3600e3;
const LIVE_DURATION = LIVE_SCHEDULE.durationMin * 60e3;
// start of the current or next service, as a timestamp (shared by predicas.html and the home page)
const nextServiceStart = (now) => {
  const local = new Date(now + LIVE_OFFSET); // UTC fields of this date = Ecuador wall-clock time
  const ahead = (LIVE_SCHEDULE.day - local.getUTCDay() + 7) % 7;
  let start = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + ahead,
    LIVE_SCHEDULE.hour, LIVE_SCHEDULE.minute) - LIVE_OFFSET;
  if (now >= start + LIVE_DURATION) start += 7 * 864e5;
  return start;
};
const liveBox = document.getElementById('liveCountdown');
if (liveBox) {
  const embed = document.getElementById('liveEmbed');
  const toggle = document.getElementById('liveShow');
  const part = name => liveBox.querySelector(`[data-live="${name}"]`);
  const cd = part('countdown');
  const countdownHTML = cd.innerHTML;
  const offset = LIVE_OFFSET;
  const duration = LIVE_DURATION;
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const pad = n => String(n).padStart(2, '0');

  const nextStart = nextServiceStart;
  const showEmbed = () => {
    const iframe = embed.querySelector('iframe');
    if (!iframe.src) iframe.src = iframe.dataset.src;
    embed.hidden = false;
    toggle.parentElement.hidden = true;
  };
  toggle.addEventListener('click', showEmbed);

  let wasLive = null;
  let start = 0;
  const tick = () => {
    const now = Date.now();
    if (now >= start + duration || !start) start = nextStart(now);
    const live = now >= start;
    if (live !== wasLive) {
      wasLive = live;
      liveBox.classList.toggle('is-live', live);
      part('badge').textContent = live ? '¡Estamos en vivo!' : 'Próxima transmisión';
      if (live) {
        cd.innerHTML = '<div class="countdown-live"><span class="live-dot"></span> En vivo ahora</div>';
        showEmbed();
      } else {
        cd.innerHTML = countdownHTML;
        const d = new Date(start + offset);
        const h = d.getUTCHours();
        part('when').textContent = `${days[d.getUTCDay()]} ${d.getUTCDate()} de ${months[d.getUTCMonth()]} · ` +
          `${h % 12 || 12}:${pad(d.getUTCMinutes())} ${h < 12 ? 'AM' : 'PM'} (hora de Ecuador)`;
      }
    }
    if (live) return;
    const sec = Math.floor((start - now) / 1000);
    cd.querySelector('[data-cd="d"]').textContent = Math.floor(sec / 86400);
    cd.querySelector('[data-cd="h"]').textContent = pad(Math.floor(sec % 86400 / 3600));
    cd.querySelector('[data-cd="m"]').textContent = pad(Math.floor(sec % 3600 / 60));
    cd.querySelector('[data-cd="s"]').textContent = pad(sec % 60);
  };
  tick();
  setInterval(tick, 1000);
}

// Home "Destacados" (index.html): hide highlights whose date has passed, keep only the next featured event,
// tick off finished sermons in the series list, and show a compact countdown to Sunday's live service.
const highlights = document.getElementById('destacados');
if (highlights) {
  const now = new Date();
  highlights.querySelectorAll('[data-fin]').forEach(el => {
    if (new Date(el.dataset.fin) >= now) return;
    if (el.matches('.hl-card')) el.remove(); else el.classList.add('done');
  });
  highlights.querySelectorAll('.hl-event').forEach((card, i) => { if (i > 0) card.remove(); });
  const mini = highlights.querySelector('[data-live-mini]');
  if (mini) {
    const update = () => {
      const t = Date.now(), start = nextServiceStart(t);
      const card = mini.closest('.hl-card');
      if (t >= start) {
        card.classList.add('is-live');
        mini.innerHTML = '<span class="live-dot"></span> <strong>¡En vivo ahora!</strong>';
        return;
      }
      card.classList.remove('is-live');
      const min = Math.floor((start - t) / 60000);
      const d = Math.floor(min / 1440), h = Math.floor(min % 1440 / 60), m = min % 60;
      mini.innerHTML = `Faltan <strong>${d ? d + 'd ' : ''}${h}h ${String(m).padStart(2, '0')}m</strong>`;
    };
    update();
    setInterval(update, 30000);
  }
  if (!highlights.querySelector('.hl-card')) highlights.remove();
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

// Copy buttons (ofrendas.html bank details) - <button class="copy-btn" data-copy="text">
document.querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
  const original = btn.innerHTML;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado';
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = original; }, 2000);
    } catch (e) { /* clipboard blocked: the number stays visible to copy by hand */ }
  });
});

// Announcement posters (eventos.html) - remove posters whose data-fin has passed, feature the next one,
// and open a poster full screen when tapped.
const adGrid = document.getElementById('adGrid');
if (adGrid) {
  const now = new Date();
  adGrid.querySelectorAll('.ad-card[data-fin]').forEach(card => {
    if (new Date(card.dataset.fin) < now) card.remove();
  });
  const first = adGrid.querySelector('.ad-card');
  if (!first) {
    adGrid.closest('section').remove();
  } else {
    first.classList.add('is-featured');
    const box = document.getElementById('adLightbox');
    const boxImg = box.querySelector('img');
    const close = () => { box.hidden = true; document.body.style.overflow = ''; };
    adGrid.querySelectorAll('[data-ad-open]').forEach(btn => btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      boxImg.src = img.src;
      boxImg.alt = img.alt;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
    }));
    box.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) close(); });
  }
}

})();
