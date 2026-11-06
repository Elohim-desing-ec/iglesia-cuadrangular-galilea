// Todo va dentro de una función para no crear variables globales: el script de PayPhone
// define cientos de nombres globales cortos (io, a, b...) y un choque de nombres lo rompe.
(() => {
// Header scroll effect
const header = document.getElementById('siteHeader');
const toTop = document.getElementById('toTop');
// on phones the floating buttons (chat, back to top) slide away while scrolling down so they don't cover
// the content, and come back when scrolling up or after a short pause
let lastScrollY = window.scrollY;
let fabTimer = 0;
window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  if (toTop) toTop.classList.toggle('show', window.scrollY > 500);
  const down = window.scrollY > lastScrollY + 4;
  const up = window.scrollY < lastScrollY - 4;
  if (down && window.scrollY > 120) document.documentElement.classList.add('fab-away');
  if (up) document.documentElement.classList.remove('fab-away');
  if (down || up) lastScrollY = window.scrollY;
  clearTimeout(fabTimer);
  fabTimer = setTimeout(() => document.documentElement.classList.remove('fab-away'), 1200);
}, {passive: true});
if (toTop) {
  toTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
}

// Mobile menu
const burger = document.getElementById('burgerBtn');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  // phone menu: opens as a circle growing from the burger, locks the page behind it, closes with Esc
  const setMenu = (open) => {
    if (open) {
      const r = burger.getBoundingClientRect();
      navLinks.style.setProperty('--mx', r.left + r.width / 2 + 'px');
      navLinks.style.setProperty('--my', r.top + r.height / 2 + 'px');
    }
    burger.classList.toggle('open', open);
    navLinks.classList.toggle('open', open);
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a:not(.dropdown-toggle)').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navLinks.classList.contains('open')) setMenu(false); });
  // stagger index for the entrance animation, and the footer's social links at the bottom of the phone menu
  navLinks.querySelectorAll(':scope > li').forEach((li, i) => li.style.setProperty('--n', i));
  const social = document.querySelector('footer .contact-social');
  if (social) {
    const li = document.createElement('li');
    li.className = 'nav-social';
    li.style.setProperty('--n', navLinks.children.length);
    li.appendChild(social.cloneNode(true));
    navLinks.appendChild(li);
  }
}

// Privacy consent (Ecuador's LOPDP). The site sets no tracking cookies of its own; YouTube and Google Maps embeds can,
// so each one waits behind a placeholder until the visitor allows external content. The choice is kept in
// localStorage ('galilea-consent' = 'all' | 'necessary') and can be changed from the footer "Cookies" button.
const CONSENT_KEY = 'galilea-consent';
// ingles.html is the English page (its <html lang> stays "es" because the menu is in Spanish)
const CONSENT_TEXT = /ingles\.html$/.test(location.pathname) ? {
  title: 'Your privacy matters',
  text: 'This site uses no tracking cookies of its own. YouTube videos and Google maps may use cookies, so they only load if you allow them.',
  more: 'Privacy Policy', all: 'Accept all', necessary: 'Only necessary',
  phText: p => `${p} may use cookies. It only loads if you allow it.`, loadOne: 'Load this one', loadAll: 'Always allow'
} : {
  title: 'Tu privacidad importa',
  text: 'Esta web no usa cookies propias de seguimiento. Los videos de YouTube y los mapas de Google sí pueden usarlas, por eso solo se cargan si los permites.',
  more: 'Política de privacidad', all: 'Aceptar todo', necessary: 'Solo necesarias',
  phText: p => `${p} puede usar cookies. Se carga solo si lo permites.`, loadOne: 'Cargar solo este', loadAll: 'Permitir siempre'
};
const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } };
const providerOf = url => url.includes('youtube') ? 'YouTube' : 'Google Maps';
const startIframe = (iframe) => {
  iframe.previousElementSibling?.classList.contains('ext-ph') && iframe.previousElementSibling.remove();
  iframe.style.removeProperty('display');
  if (!iframe.src) iframe.src = iframe.dataset.consentSrc;
};
const showPlaceholder = (iframe) => {
  if (iframe.previousElementSibling?.classList.contains('ext-ph')) return;
  const provider = providerOf(iframe.dataset.consentSrc);
  const ph = document.createElement('div');
  ph.className = 'ext-ph' + (getComputedStyle(iframe).position === 'absolute' ? ' ext-ph-fill' : '');
  ph.innerHTML = `<i class="${provider === 'YouTube' ? 'fa-brands fa-youtube' : 'fa-solid fa-map-location-dot'}"></i>
    <p>${CONSENT_TEXT.phText(provider)}</p>
    <div class="ext-ph-actions"><button type="button" class="ext-ph-one">${CONSENT_TEXT.loadOne}</button>
    <button type="button" class="ext-ph-all">${CONSENT_TEXT.loadAll}</button></div>`;
  ph.querySelector('.ext-ph-one').addEventListener('click', () => startIframe(iframe));
  ph.querySelector('.ext-ph-all').addEventListener('click', () => setConsent('all'));
  iframe.style.display = 'none';
  iframe.before(ph);
};
// load an external embed now if allowed, otherwise show its placeholder
const loadExternal = (iframe) => {
  if (!iframe.dataset.consentSrc || iframe.src) return;
  if (readConsent() === 'all') startIframe(iframe); else showPlaceholder(iframe);
};
const setConsent = (value) => {
  try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  const banner = document.querySelector('.cookie-banner');
  if (banner) { banner.classList.remove('show'); setTimeout(() => banner.remove(), 400); }
  if (value === 'all') {
    document.querySelectorAll('iframe[data-consent-src]').forEach(f => { if (!f.closest('[hidden]')) startIframe(f); });
  }
};
const showConsentBanner = () => {
  if (document.querySelector('.cookie-banner')) return;
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', CONSENT_TEXT.title);
  banner.innerHTML = `<div class="cookie-ico"><i class="fa-solid fa-shield-halved"></i></div>
    <div class="cookie-text"><strong>${CONSENT_TEXT.title}</strong>
    <p>${CONSENT_TEXT.text} <a href="privacidad.html">${CONSENT_TEXT.more}</a></p></div>
    <div class="cookie-actions"><button type="button" class="cookie-btn cookie-necessary">${CONSENT_TEXT.necessary}</button>
    <button type="button" class="cookie-btn cookie-all">${CONSENT_TEXT.all}</button></div>`;
  banner.querySelector('.cookie-all').addEventListener('click', () => setConsent('all'));
  banner.querySelector('.cookie-necessary').addEventListener('click', () => setConsent('necessary'));
  document.body.appendChild(banner);
  requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('show')));
};
document.querySelectorAll('iframe[data-consent-src]').forEach(f => { if (!f.closest('[hidden]')) loadExternal(f); });
if (!readConsent()) showConsentBanner();
document.querySelectorAll('[data-cookie-settings]').forEach(btn => btn.addEventListener('click', showConsentBanner));

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
// Clicking a card flies the map to its pin; clicking a pin highlights its card. With WebGL it is a 3D globe
// (MapLibre): satellite Earth from far away that fades into OpenStreetMap streets up close, flying from the planet
// down to Milagro when it scrolls into view. Without WebGL it falls back to the flat Leaflet map.
const supportsWebGL = () => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
};
// zoom at which the whole planet fits a box (globe diameter ~ 512 * 2^z / PI px)
const planetZoomFor = el => Math.log2(Math.min(el.clientWidth, el.clientHeight) * 0.82 * Math.PI / 512);
const SATELLITE_SOURCE = {
  type: 'raster', tileSize: 256, maxzoom: 15,
  tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/g/{z}/{y}/{x}.jpg'],
  attribution: '<a href="https://s2maps.eu" target="_blank" rel="noopener">Sentinel-2 cloudless</a> by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2021)'
};
// cell number badges: "Nº" label over a two-digit number (01, 02...)
document.querySelectorAll('.cell-num').forEach(badge => {
  const n = badge.textContent.trim();
  badge.setAttribute('aria-label', `Célula ${n}`);
  badge.innerHTML = `<small>Nº</small><b>${n.padStart(2, '0')}</b>`;
});
const cellsMapEl = document.getElementById('cellsMap');
if (cellsMapEl && (window.maplibregl || window.L)) {
  const CHURCH = [-2.1495905, -79.5821205];
  const CHURCH_POPUP = '<strong>Templo Galilea</strong><br>Sede principal<br><a href="https://maps.app.goo.gl/BS41eaCGVGgSNyBaA" target="_blank" rel="noopener">Ver en Google Maps →</a>';
  const isPhone = () => window.matchMedia('(max-width:900px)').matches;
  const cells = [];
  const points = [CHURCH];
  document.querySelectorAll('.cell-card').forEach(card => {
    if (!card.dataset.lat) return;
    const pos = [Number(card.dataset.lat), Number(card.dataset.lng)];
    // two cells sharing the exact same point: nudge the later pin ~20 m east so both numbers are visible
    while (points.some(p => Math.abs(p[0] - pos[0]) < 0.00005 && Math.abs(p[1] - pos[1]) < 0.00005)) pos[1] += 0.00018;
    const num = card.dataset.num;
    const leader = card.querySelector('.cell-leader').textContent.trim();
    const route = card.querySelector('.cell-go').href;
    points.push(pos);
    cells.push({card, pos, num, popup: `<strong>Célula #${num}</strong><br>${leader}<br>Viernes · 7:30 PM<br><a href="${route}" target="_blank" rel="noopener">Cómo llegar →</a>`});
  });

  // each map flavour returns: pin(pos, html, extraClass, popupHtml, onTop) -> {el, open()}, focus(pos), showAll()
  const leafletMap = () => {
    const map = L.map(cellsMapEl, {scrollWheelZoom: false});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const icon = (html, extra) => L.divIcon({
      className: '', html: `<div class="cell-pin ${extra}">${html}</div>`,
      iconSize: [40, 40], iconAnchor: [20, 49], popupAnchor: [0, -46]
    });
    map.fitBounds(points, {padding: [40, 40]});
    return {
      pin: (pos, html, extra, popup, onTop) => {
        const marker = L.marker(pos, {icon: icon(html, extra), zIndexOffset: onTop ? 1000 : 0}).addTo(map).bindPopup(popup);
        return {el: marker.getElement(), open: () => marker.openPopup()};
      },
      focus: pos => map.flyTo(pos, 16, {duration: 0.8}),
      showAll: () => map.fitBounds(points, {padding: [40, 40]})
    };
  };
  const globeMap = () => {
    cellsMapEl.classList.add('cells-globe');
    const bounds = points.reduce((b, p) => b.extend([p[1], p[0]]), new maplibregl.LngLatBounds());
    const map = new maplibregl.Map({
      container: cellsMapEl,
      style: {
        version: 8,
        projection: {type: 'globe'},
        sources: {
          sat: SATELLITE_SOURCE,
          osm: {
            type: 'raster', tileSize: 256, maxzoom: 19,
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
          }
        },
        layers: [
          {id: 'sat', type: 'raster', source: 'sat'},
          // streets fade in as you get close to the city
          {id: 'osm', type: 'raster', source: 'osm', minzoom: 10,
            paint: {'raster-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 13.5, 1]}}
        ],
        sky: {'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 8, 0]}
      },
      center: [CHURCH[1] + 40, CHURCH[0] + 8],
      zoom: planetZoomFor(cellsMapEl),
      minZoom: -1,
      maxZoom: 18,
      scrollZoom: false,
      attributionControl: {compact: true}
    });
    map.addControl(new maplibregl.NavigationControl({showCompass: true, visualizePitch: true}), 'top-right');
    const showAll = (duration = 2500) => map.fitBounds(bounds, {padding: 70, pitch: 40, bearing: -12, maxZoom: 14.5, duration, essential: true});
    map.on('load', () => {
      cellsMapEl.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
      setTimeout(() => showAll(5500), 400); // the trip from space down to Milagro
    });
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'globe-btn cells-all-btn';
    allBtn.innerHTML = '<i class="fa-solid fa-house-chimney"></i> <span>Ver todas las células</span>';
    allBtn.addEventListener('click', () => showAll());
    cellsMapEl.appendChild(allBtn);
    return {
      pin: (pos, html, extra, popupHtml, onTop) => {
        const el = document.createElement('div');
        el.className = 'cell-marker';
        el.innerHTML = `<div class="cell-pin ${extra}">${html}</div>`;
        if (onTop) el.style.zIndex = 2;
        const popup = new maplibregl.Popup({offset: 52, maxWidth: '240px'}).setHTML(popupHtml);
        const marker = new maplibregl.Marker({element: el, anchor: 'bottom', offset: [0, -9]})
          .setLngLat([pos[1], pos[0]]).setPopup(popup).addTo(map);
        return {el, open: () => { if (!popup.isOpen()) marker.togglePopup(); }};
      },
      focus: pos => map.flyTo({center: [pos[1], pos[0]], zoom: 16.5, pitch: 50, bearing: -15, duration: 2400, essential: true}),
      showAll
    };
  };

  const start = () => {
    const view = window.maplibregl && supportsWebGL() ? globeMap() : leafletMap();
    view.pin(CHURCH, '<i class="fa-solid fa-cross"></i>', 'church', CHURCH_POPUP, true);
    const entries = cells.map(c => ({...c, marker: view.pin(c.pos, `<span>${c.num.padStart(2, '0')}</span>`, '', c.popup, false)}));
    const select = (entry) => {
      entries.forEach(e => {
        const on = e === entry;
        e.card.classList.toggle('active', on);
        e.marker.el?.querySelector('.cell-pin').classList.toggle('active', on);
        if (e.marker.el?.classList.contains('cell-marker')) e.marker.el.style.zIndex = on ? 3 : '';
      });
    };
    entries.forEach(entry => {
      entry.card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // let "Cómo llegar" open normally
        select(entry);
        view.focus(entry.pos);
        entry.marker.open();
        if (isPhone()) cellsMapEl.scrollIntoView({behavior: 'smooth', block: 'center'});
      });
      entry.marker.el?.addEventListener('click', () => {
        select(entry);
        if (!isPhone()) {
          const list = entry.card.parentElement;
          list.scrollTo({top: entry.card.offsetTop - list.offsetTop - 4, behavior: 'smooth'});
        }
      });
    });
  };
  // the 3D version waits until the map is near the screen so the trip from space is seen
  const cellsObserver = new IntersectionObserver((list) => {
    if (!list[0].isIntersecting) return;
    cellsObserver.disconnect();
    start();
  }, {rootMargin: '100px'});
  cellsObserver.observe(cellsMapEl);
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
    loadExternal(iframe);
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
    error: contactForm.dataset.msgError || 'No pudimos enviar tu mensaje. Intenta de nuevo en un momento.',
    wait: contactForm.dataset.msgWait || 'Ya recibimos tu mensaje. Espera unos segundos antes de enviar otro.'
  };
  // spam guards: a hidden field only robots fill in, a minimum time on the page, and a pause between messages
  const loadedAt = Date.now();
  contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const data = new FormData(contactForm);
    const showStatus = (text, color) => { if (statusEl) { statusEl.textContent = text; statusEl.style.color = color; } };
    if (data.get('sitio_web') || Date.now() - loadedAt < 3000) {
      showStatus(msg.success, 'var(--accent-600)');
      contactForm.reset();
      return;
    }
    let lastSent = 0;
    try { lastSent = Number(sessionStorage.getItem('contacto-enviado')) || 0; } catch (err) {}
    if (Date.now() - lastSent < 30000) {
      showStatus(msg.wait, 'var(--text-muted)');
      return;
    }
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
      try { sessionStorage.setItem('contacto-enviado', Date.now()); } catch (err) {}
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
  }
}
// any [data-ad-open] button (posters, past-event photos) opens its image full screen
const adBox = document.getElementById('adLightbox');
if (adBox) {
  const boxImg = adBox.querySelector('img');
  const close = () => { adBox.hidden = true; document.body.style.overflow = ''; };
  document.querySelectorAll('[data-ad-open]').forEach(btn => btn.addEventListener('click', () => {
    const img = btn.querySelector('img');
    boxImg.src = img.src;
    boxImg.alt = img.alt;
    adBox.hidden = false;
    document.body.style.overflow = 'hidden';
  }));
  adBox.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !adBox.hidden) close(); });
}


// Text animations: headings enter word by word (blur + rise), eyebrows "decode"
// from random characters, and the home-page stats count up. Everything starts when the element scrolls
// into view and is skipped entirely when the visitor prefers reduced motion.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  // wrap every word of el (including words inside <em>/<span>) in .tw > .tw-i, keeping spaces as text
  let wordIndex = 0;
  const splitWords = (node) => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) { splitWords(child); return; }
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        // custom tags so existing rules like `.section-title span` do not style every word
        const outer = document.createElement('tw-w');
        outer.className = 'tw';
        const inner = document.createElement('tw-l');
        inner.className = 'tw-i';
        inner.style.setProperty('--i', wordIndex++);
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      child.replaceWith(frag);
    });
  };

  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/';
  const scramble = (el) => {
    const textNode = [...el.childNodes].reverse().find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (!textNode) return;
    const final = textNode.textContent;
    const start = performance.now();
    const duration = 900;
    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const settled = Math.floor(progress * final.length);
      textNode.textContent = [...final].map((ch, i) =>
        i < settled || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');
      if (progress < 1) requestAnimationFrame(frame); else textNode.textContent = final;
    };
    requestAnimationFrame(frame);
  };

  const countUp = (el) => {
    const match = el.textContent.trim().match(/^(\D*)([\d,]+)(\D*)$/);
    if (!match) return;
    const target = Number(match[2].replace(/,/g, ''));
    const start = performance.now();
    const duration = 1600;
    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = match[1] + Math.round(target * eased).toLocaleString('en-US') + match[3];
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      textObserver.unobserve(el);
      if (el.classList.contains('tw-host')) el.classList.add('tw-go');
      else if (el.classList.contains('eyebrow')) { el.classList.add('tw-go'); scramble(el); }
      else countUp(el);
    });
  }, {threshold: 0.3});

  document.querySelectorAll('.hero h1, .page-banner h1, .section-title, .cta-strip h2').forEach(el => {
    wordIndex = 0;
    splitWords(el);
    el.classList.add('tw-host');
    textObserver.observe(el);
  });
  document.querySelectorAll('.eyebrow').forEach(el => {
    el.setAttribute('aria-label', el.textContent.trim());
    el.classList.add('tw-eyebrow');
    textObserver.observe(el);
  });
  document.querySelectorAll('.hero-stats h3').forEach(el => textObserver.observe(el));
}


// Scroll reveal: every content block below the hero that isn't already a .reveal fades/rises in as it scrolls
// into view (siblings staggered). Carousels, maps and sliders are left alone because they move on their own.
// The classes are removed once the entrance ends so the elements' own hover transforms keep working.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const BLOCKS = 'p, h2, h3, h4, img, figure, iframe, form, ul, ol, table, blockquote, .btn, .faq-item, ' +
    '[class*="card"], [class*="-item"], .countdown, .sermon-links, .cells-legend, .give-steps, .give-receipt';
  const SKIP = '.reveal, .hero, .page-banner, .testi-track, .photo-marquee, .reel-row, .video-row, .hero-slides, ' +
    '.cells-map, .leaflet-container, .ag, .pp-modal, .ad-lightbox, .tw-host, .eyebrow';
  const candidates = [...document.querySelectorAll('section, footer')]
    .flatMap(area => [...area.querySelectorAll(BLOCKS)])
    .filter(el => !el.closest(SKIP));
  // keep only the outermost block, so a card animates as one piece instead of each line inside it
  const blocks = candidates.filter(el => !candidates.some(other => other !== el && other.contains(el)));
  const srObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      srObserver.unobserve(el);
      el.classList.add('sr-in');
      const delay = parseInt(el.style.getPropertyValue('--sr-d')) || 0;
      setTimeout(() => { el.classList.remove('sr', 'sr-in'); el.style.removeProperty('--sr-d'); }, delay + 950);
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
  const seen = new Map();
  // existing .reveal blocks get the same sibling stagger; the delay is dropped after the entrance so hovers stay instant
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const n = seen.get(el.parentElement) || 0;
    seen.set(el.parentElement, n + 1);
    if (!n) return;
    el.style.setProperty('--sr-d', Math.min(n, 6) * 90 + 'ms');
    el.addEventListener('transitionend', () => el.style.removeProperty('--sr-d'), {once: true});
  });
  blocks.forEach(el => {
    const n = seen.get(el.parentElement) || 0;
    seen.set(el.parentElement, n + 1);
    el.style.setProperty('--sr-d', Math.min(n, 6) * 90 + 'ms');
    el.classList.add('sr');
    srObserver.observe(el);
  });
}


// 3D globe (ubicacion.html): satellite Earth that spins slowly until touched, a pulsing pin on the church,
// and a button that flies from space down to Milagro and back. Built only when it scrolls into view;
// without WebGL/MapLibre it falls back to the Google Maps embed in data-fallback.
const globeEl = document.getElementById('churchGlobe');
if (globeEl) {
  const church = [Number(globeEl.dataset.lng), Number(globeEl.dataset.lat)];
  const card = globeEl.closest('.globe-card');
  const focusBtn = document.getElementById('globeFocus');
  const hasWebGL = supportsWebGL();
  const fallback = () => {
    card.classList.add('globe-fallback');
    card.innerHTML = `<iframe title="Mapa Iglesia Cuadrangular Galilea - Sede Principal" src="${globeEl.dataset.fallback}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  };
  const planetZoom = () => planetZoomFor(globeEl);

  const build = () => {
    if (!window.maplibregl || !hasWebGL) { fallback(); return; }
    const map = new maplibregl.Map({
      container: globeEl,
      style: {
        version: 8,
        projection: {type: 'globe'},
        sources: {
          sat: SATELLITE_SOURCE
        },
        layers: [{id: 'sat', type: 'raster', source: 'sat'}],
        sky: {'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 8, 0]}
      },
      center: [church[0] + 40, church[1] + 8],
      zoom: planetZoom(),
      minZoom: -1,
      maxZoom: 16,
      scrollZoom: false,
      attributionControl: {compact: true}
    });
    map.addControl(new maplibregl.NavigationControl({showCompass: true, visualizePitch: true}), 'top-right');

    const pin = document.createElement('div');
    pin.className = 'globe-pin';
    pin.innerHTML = '<span class="globe-pin-dot"><i class="fa-solid fa-cross"></i></span><span class="globe-pin-label">Iglesia Galilea<small>Milagro, Ecuador</small></span>';
    new maplibregl.Marker({element: pin, anchor: 'bottom'}).setLngLat(church).addTo(map);

    // slow spin while nobody is touching the globe
    let spinning = true;
    let focused = false;
    const spin = () => {
      if (!spinning || map.isMoving() || map.getZoom() > 3) return;
      const c = map.getCenter();
      map.easeTo({center: [c.lng - 6, c.lat], duration: 1000, easing: t => t});
    };
    map.on('moveend', spin);
    map.on('load', () => {
      card.classList.add('globe-ready');
      // credits start folded behind the (i) button so they don't sit under the fly button
      globeEl.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
      spin();
    });
    const stopSpin = () => { spinning = false; card.classList.add('globe-touched'); };
    ['mousedown', 'touchstart', 'wheel'].forEach(ev => globeEl.addEventListener(ev, stopSpin, {passive: true}));

    const label = focusBtn.querySelector('span');
    const icon = focusBtn.querySelector('i');
    focusBtn.addEventListener('click', () => {
      stopSpin();
      focused = !focused;
      if (focused) {
        map.flyTo({center: church, zoom: 13.5, pitch: 50, bearing: -25, duration: 5200, curve: 1.6, essential: true});
        label.textContent = 'Ver el planeta';
        icon.className = 'fa-solid fa-earth-americas';
      } else {
        map.flyTo({center: [church[0] + 40, church[1] + 8], zoom: planetZoom(), pitch: 0, bearing: 0, duration: 4200, essential: true});
        label.textContent = 'Acercar a la iglesia';
        icon.className = 'fa-solid fa-location-crosshairs';
        spinning = true;
      }
    });
  };

  const globeObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    globeObserver.disconnect();
    build();
  }, {rootMargin: '200px'});
  globeObserver.observe(globeEl);
}


// Living icons: every icon pops in when it scrolls into view and, when its card/button is hovered or tapped,
// plays a motion that matches what it shows (heart beats, clock spins, pin drops, plane flies...).
// Icons that already move on their own (FAQ plus, dropdown chevron, scroll cue, loaders) are left alone.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const ICON_MOTION = {
    heart: 'beat', 'heart-crack': 'beat', 'heart-circle-check': 'beat', 'hand-holding-heart': 'lift', 'hands-praying': 'lift',
    'hands-holding-child': 'lift', clock: 'spin', 'earth-americas': 'spin', compass: 'spin', sun: 'spin', star: 'spin',
    'location-dot': 'drop', 'map-location-dot': 'drop', 'location-crosshairs': 'pop', 'diamond-turn-right': 'nudge',
    'arrow-right': 'nudge', 'chevron-right': 'nudge', 'arrow-up-right-from-square': 'fly', 'paper-plane': 'fly', dove: 'fly',
    play: 'pulse', 'tower-broadcast': 'pulse', 'microphone-lines': 'pulse', youtube: 'pulse', fire: 'flicker',
    whatsapp: 'ring', phone: 'ring', bell: 'ring', envelope: 'ring', 'envelope-open-text': 'ring', comment: 'ring', tiktok: 'ring',
    music: 'ring', cross: 'glow', church: 'glow', crown: 'glow', 'book-bible': 'glow', bullseye: 'glow', seedling: 'grow',
    'calendar-day': 'flip', 'calendar-days': 'flip', 'calendar-week': 'flip', 'calendar-check': 'flip', 'credit-card': 'flip',
    'building-columns': 'flip', language: 'flip', 'masks-theater': 'flip', water: 'wave', gift: 'ring', utensils: 'ring'
  };
  const SKIP_ICON = '.faq-q i, .dropdown-toggle i, .scroll-cue i, .fa-spin, .fa-circle-notch, .globe-hint i, .hl-cta i, ' +
    '.service-card-link i, .hero-slides i, .leaflet-container i, .maplibregl-map i, .verse-track i, .tw-host i';
  const icons = [...document.querySelectorAll('section i[class*="fa-"], footer i[class*="fa-"]')]
    .filter(icon => !icon.matches(SKIP_ICON));
  const play = (icon) => {
    icon.classList.remove('ico-play');
    void icon.offsetWidth; // restart the animation if it is already playing
    icon.classList.add('ico-play');
  };
  const iconObserver = new IntersectionObserver((list) => {
    list.forEach(entry => {
      if (!entry.isIntersecting) return;
      iconObserver.unobserve(entry.target);
      entry.target.classList.add('ico-in');
    });
  }, {threshold: 0.6});
  icons.forEach(icon => {
    const name = [...icon.classList].find(c => c.startsWith('fa-') && ICON_MOTION[c.slice(3)]);
    icon.classList.add('ico');
    icon.dataset.motion = name ? ICON_MOTION[name.slice(3)] : 'hop';
    icon.addEventListener('animationend', () => icon.classList.remove('ico-play', 'ico-in'));
    const trigger = icon.closest('a, button, [class*="card"], [class*="-item"], .give-method, .value-item, li') || icon.parentElement;
    trigger.addEventListener('pointerenter', () => play(icon));
    trigger.addEventListener('touchstart', () => play(icon), {passive: true});
    iconObserver.observe(icon);
  });
}


// Legal pages: highlight the table-of-contents entry of the section being read
const legalToc = document.querySelector('.legal-toc');
if (legalToc && 'IntersectionObserver' in window) {
  const links = new Map([...legalToc.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a]));
  const tocObserver = new IntersectionObserver((list) => {
    list.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.classList.remove('active'));
      const a = links.get(entry.target.id);
      if (!a) return;
      a.classList.add('active');
      // on phones the index is a horizontal row: slide it (not the page) so the active entry stays visible
      const row = a.closest('ol');
      if (row.scrollWidth > row.clientWidth) row.scrollTo({left: a.offsetLeft - row.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth'});
    });
  }, {rootMargin: '-35% 0px -60% 0px'});
  document.querySelectorAll('.legal-sec').forEach(sec => tocObserver.observe(sec));
}

})();
