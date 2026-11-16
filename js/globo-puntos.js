// Planeta de puntos (misiones.html y ubicacion.html), sobre fondo negro como Jóvenes.
// Cada <canvas data-globe="hero|small" data-preset="misiones|ubicacion"> dibuja la Tierra con puntos (continentes de
// img/mapa-puntos.svg, datos de Natural Earth en celdas de 2.4°) que gira despacio.
//  - misiones: puntos blancos; arcos de luz salen de Milagro hacia las comunidades Sionas, Secoyas y Cofanes
//    (Sucumbíos) y hacia otras naciones, con un punto de luz que viaja por cada arco.
//  - ubicacion: puntos azules; la marca de Iglesia Galilea en Milagro late y un haz de luz sube desde ella.
// "hero": planeta gigante que asoma desde abajo de la portada y sigue un poco al mouse y al scroll.
// "small": globo completo (Misiones, "Cómo puedes ser parte"). Solo se anima mientras está en pantalla.
(() => {
  const canvases = [...document.querySelectorAll('canvas[data-globe]')];
  if (!canvases.length || !canvases[0].getContext) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RAD = Math.PI / 180;

  // continentes: 75 filas x 150 columnas (bits en hexadecimal, 38 caracteres por fila)
  const LAND = '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007fe7fffdc00000000000000000000000000010ff1ffffe000f00000003c00000000000000c013e7ffffc0000000010007000000000000000002001fffe00000002001ff80000000000001fe67f00fff80000000c09fffff87800001ff8ebfb99e0bff80001f8009bffffffffd38c1ffffffff8707f800007ff5ffbffffffffffc23ffffffff3e07c07800f7effffffffffffffc03fffffff08203800007cffffffffffffffffc05e8fffff01c00000007e9ffffffffffffe38000501ffff01f80000040c7fffffffffff80e0001000fffff3fc00000420ffffffffffff00c00000007ffffbff0000177fffffffffffffe0800000001ffffffd000004ffffffffffffffe0000000001ffffff3800007ffffffffffffff80000000001ffffffc000003f7e5ffffffffff00000000001fffffc000001f9be0fffffffffe70000000001fffff8000001e259ffffffffff840000000000fffff0000001e00bfffffffff1840000000000ffffe00000001e003ffffffff88c00000000003fffc0000000ff003ffffffff87000000000002fff80000001ffdf7ffffffffc4000000000001fe000000003ffffbefffffffc0000000000000fc040000007ffffbf1ffffff800000000000003c00000000fffffdfe1fffff400000000000001c02000000fffffdff0fe7fc000000000000001e60400000fffffefe07c3e80000000000000007c0000000fffffe780382f0400000000000000070000000ffffff600300f0400000000000000010000000ffffff800300b8000000000000000009fc00007ffffff0018000000000000000000001fe00003ffffff0008080100000000000000001ff8000107fffe0000141000000000000000003ffc000001fffc00000c7000000000000000003ffc000001fff800000cf000000000000000007fff000001fff00000067408000000000000007fffe00000ffe0000002000f000000000000003ffff80000ffe0000001c007080000000000003ffff00000fff00000000000800000000000001fffe000007ff00000000022000000000000001fffe00000fff100000001720000000000000007ffe00000ffe700000001fb0004000000000003ffc00000ffc600000003ff0000000000000003ffc000007fc60000001fff8000000000000003ff0000007fc60000003fffc000000000000003fe0000007f800000003fffe000000000000007fe0000003f000000001fffe000000000000007fc0000003e000000001fffe000000000000007f80000001c000000001e1fc000000000000007e000000000000000000007c01000000000000fe000000000000000000003000800000000000f800000000000000000000100000000000000070000000000000000000000002000000000000e000000000000000000000000c000000000000f0000000000000000000000000000000000000c0000000000000000000000000000000000000c00000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
  const dots = [];
  for (let r = 0; r < 75; r++) {
    const row = LAND.substr(r * 38, 38);
    for (let c = 0; c < 150; c++) {
      const nib = parseInt(row[c >> 2], 16);
      if (!((nib >> (3 - (c & 3))) & 1)) continue;
      const lat0 = 88.8 - 2.4 * r, lon0 = -178.8 + 2.4 * c;
      // 4 puntos por celda (cada 1.2°) para que los continentes se vean llenos
      for (const dy of [-0.6, 0.6]) for (const dx of [-0.6, 0.6]) {
        const la = (lat0 + dy) * RAD, lo = (lon0 + dx) * RAD;
        dots.push(Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la));
      }
    }
  }
  const DOTS = new Float32Array(dots);
  const vec = (lat, lon) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];

  const MILAGRO = vec(-2.13, -79.59);
  const PLACES = [
    {v: MILAGRO, label: 'Milagro', main: true},
    {v: vec(-0.1, -76.4), label: 'Sionas · Secoyas · Cofanes', main: true}
  ];
  const CHURCH = [{v: vec(-2.1496, -79.5821), label: 'Iglesia Galilea · Milagro', main: true, beam: true}];
  // color de los puntos y del brillo (r,g,b), lugares, arcos y hacia dónde mira la cámara en cada página
  const PRESETS = {
    misiones: {rgb: '255,255,255', places: PLACES, arcs: true, lon: -76, swing: 30},
    ubicacion: {rgb: '150,190,255', places: CHURCH, arcs: false, lon: -72, swing: 12}
  };
  // arcos: [destino, ¿principal?]; los demás son simbólicos ("a las naciones")
  const ARCS = [
    [PLACES[1].v, true],
    [vec(19.4, -99.1), false], [vec(4.7, -74.1), false], [vec(-12.0, -77.0), false],
    [vec(40.4, -3.7), false], [vec(9.0, 38.7), false], [vec(-23.5, -46.6), false], [vec(25.8, -80.2), false]
  ].map(([to, main], i) => {
    // puntos del arco: interpolación esférica, levantado sobre la superficie según la distancia
    const omega = Math.acos(Math.min(1, MILAGRO[0] * to[0] + MILAGRO[1] * to[1] + MILAGRO[2] * to[2]));
    const lift = 0.03 + omega * 0.07;
    const pts = [];
    for (let k = 0; k <= 48; k++) {
      const t = k / 48, s = Math.sin(omega) || 1;
      const a = Math.sin((1 - t) * omega) / s, b = Math.sin(t * omega) / s;
      const h = 1 + lift * Math.sin(Math.PI * t);
      pts.push([(a * MILAGRO[0] + b * to[0]) * h, (a * MILAGRO[1] + b * to[1]) * h, (a * MILAGRO[2] + b * to[2]) * h]);
    }
    return {pts, main, offset: i * 0.37};
  });

  const setups = canvases.map(canvas => {
    const kind = canvas.dataset.globe;
    const ctx = canvas.getContext('2d');
    const pre = PRESETS[canvas.dataset.preset] || PRESETS.misiones;
    const st = {canvas, ctx, kind, pre, w: 0, h: 0, dpr: 1, R: 0, cx: 0, cy: 0, on: false,
      mx: 0, my: 0, tmx: 0, tmy: 0, scroll: 0};
    const size = () => {
      const r = canvas.getBoundingClientRect();
      st.dpr = Math.min(window.devicePixelRatio || 1, kind === 'hero' ? 1.5 : 2);
      st.w = Math.max(1, Math.round(r.width * st.dpr));
      st.h = Math.max(1, Math.round(r.height * st.dpr));
      canvas.width = st.w; canvas.height = st.h;
      if (kind === 'hero') {
        // planeta gigante: su borde superior queda a ~62% de la portada
        st.R = Math.max(st.w * 0.62, 560 * st.dpr);
        st.cx = st.w / 2;
        st.cy = st.h * (st.w < 700 * st.dpr ? 0.75 : 0.62) + st.R;
      } else {
        st.R = Math.min(st.w, st.h) / 2 * 0.97;
        st.cx = st.w / 2; st.cy = st.h / 2;
      }
    };
    size();
    window.addEventListener('resize', () => { size(); if (!st.on || reduce) draw(st, performance.now()); });
    if (kind === 'hero' && !reduce) {
      const host = canvas.parentElement;
      host.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = host.getBoundingClientRect();
        st.tmx = (e.clientX - r.left) / r.width - 0.5;
        st.tmy = (e.clientY - r.top) / r.height - 0.5;
      });
      host.addEventListener('pointerleave', () => { st.tmx = 0; st.tmy = 0; });
      window.addEventListener('scroll', () => { st.scroll = Math.min(1, window.scrollY / Math.max(1, host.offsetHeight)); }, {passive: true});
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { st.on = en.isIntersecting; if (st.on && !reduce) loop(); }).observe(canvas);
    }
    canvas.closest('.mis-globe-wrap')?.classList.add('has-globe');
    return st;
  });

  // rotación: lleva un vector al sistema de la cámara (lon0, lat0) -> [profundidad, x, y]
  const rotate = (v, cl, sl, cp, sp) => {
    const x1 = v[0] * cl + v[1] * sl, y1 = -v[0] * sl + v[1] * cl, z1 = v[2];
    return [x1 * cp + z1 * sp, y1, -x1 * sp + z1 * cp];
  };

  function draw(st, now) {
    const {ctx, w, h, R, cx, cy, dpr, kind, pre} = st;
    const rgba = (a) => 'rgba(' + pre.rgb + ',' + a + ')';
    const t = now / 1000;
    st.mx += (st.tmx - st.mx) * 0.05; st.my += (st.tmy - st.my) * 0.05;
    let lon0, lat0;
    if (kind === 'hero') {
      // solo se ve la parte de arriba del planeta: la cámara mira desde el sur (lat -60) para que esa parte
      // sea Sudamérica; se mece alrededor de Ecuador para que Milagro y los arcos siempre se vean
      lon0 = pre.lon + pre.swing * Math.sin(t * 0.06) + st.mx * 20 + st.scroll * 24;
      lat0 = -60 - st.my * 6 + st.scroll * 10;
    } else {
      lon0 = -79.6 + t * 9; lat0 = 8;
    }
    const cl = Math.cos(lon0 * RAD), sl = Math.sin(lon0 * RAD), cp = Math.cos(lat0 * RAD), sp = Math.sin(lat0 * RAD);
    ctx.clearRect(0, 0, w, h);

    // atmósfera y borde de luz blanco
    const halo = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.14);
    halo.addColorStop(0, rgba(0.22));
    halo.addColorStop(0.35, rgba(0.07));
    halo.addColorStop(1, rgba(0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.14, 0, Math.PI * 2); ctx.fill();
    const body = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.55, R * 0.1, cx, cy, R);
    body.addColorStop(0, '#1b1b1b'); body.addColorStop(0.7, '#060606'); body.addColorStop(1, '#000');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.shadowColor = rgba(0.9); ctx.shadowBlur = 26 * dpr;
    ctx.strokeStyle = rgba(0.75); ctx.lineWidth = 1.6 * dpr;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // continentes: puntos más brillantes y grandes al frente, tenues hacia el borde
    const top = -1, bottom = h + 4;
    const buckets = [[], [], [], []];
    for (let i = 0; i < DOTS.length; i += 3) {
      const x = DOTS[i], y = DOTS[i + 1], z = DOTS[i + 2];
      const x1 = x * cl + y * sl, y1 = -x * sl + y * cl;
      const d = x1 * cp + z * sp;
      if (d <= 0.02) continue;
      const sy = cy - (-x1 * sp + z * cp) * R;
      if (sy < top || sy > bottom) continue;
      buckets[Math.min(3, (Math.sqrt(d) * 4) | 0)].push(cx + y1 * R, sy);
    }
    const base = (kind === 'hero' ? 1.9 : 1.25) * dpr;
    for (let b = 0; b < 4; b++) {
      const arr = buckets[b], s = base * (0.6 + b * 0.22);
      ctx.fillStyle = rgba(0.16 + b * 0.24);
      for (let i = 0; i < arr.length; i += 2) ctx.fillRect(arr[i] - s / 2, arr[i + 1] - s / 2, s, s);
    }

    // arcos con un punto de luz que viaja
    const proj = (p) => { const r = rotate(p, cl, sl, cp, sp); return [cx + r[1] * R, cy - r[2] * R, r[0], r[1] * r[1] + r[2] * r[2]]; };
    ctx.lineCap = 'round';
    for (const arc of (pre.arcs ? ARCS : [])) {
      const pp = arc.pts.map(proj);
      ctx.strokeStyle = arc.main ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = (arc.main ? 1.8 : 1) * dpr;
      ctx.beginPath();
      let pen = false;
      for (const q of pp) {
        const vis = q[2] > 0 || q[3] > 1; // delante del planeta o por fuera de su borde
        if (vis) { if (pen) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); pen = true; } } else pen = false;
      }
      ctx.stroke();
      const f = ((t * (arc.main ? 0.22 : 0.16) + arc.offset) % 1);
      const q = pp[Math.round(f * (pp.length - 1))];
      if (q[2] > 0 || q[3] > 1) {
        ctx.save();
        ctx.shadowColor = '#fff'; ctx.shadowBlur = 14 * dpr; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(q[0], q[1], (arc.main ? 3.2 : 2.2) * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    // lugares: punto con anillo que late y su nombre
    ctx.font = '600 ' + Math.round((kind === 'hero' ? 12 : 10) * dpr) + 'px Inter, sans-serif';
    for (const pl of pre.places) {
      const q = proj(pl.v);
      if (q[2] <= 0.05) continue;
      if (pl.beam) {
        // haz de luz que sube desde la marca, como un faro
        const beam = ctx.createLinearGradient(q[0], q[1], q[0], q[1] - 150 * dpr);
        beam.addColorStop(0, rgba(0.85)); beam.addColorStop(1, rgba(0));
        ctx.fillStyle = beam;
        ctx.fillRect(q[0] - 1.5 * dpr, q[1] - 150 * dpr, 3 * dpr, 150 * dpr);
      }
      const pulse = (t * 0.8 + (pl === pre.places[0] ? 0 : 0.5)) % 1;
      ctx.strokeStyle = rgba(0.8 * (1 - pulse));
      ctx.lineWidth = 1.4 * dpr;
      ctx.beginPath(); ctx.arc(q[0], q[1], (4 + pulse * 16) * dpr, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(q[0], q[1], 3.4 * dpr, 0, Math.PI * 2); ctx.fill();
      if (kind === 'hero' || pl === PLACES[0]) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.fillText(kind === 'hero' ? pl.label : 'Ecuador', q[0] + 10 * dpr, q[1] - 8 * dpr);
      }
    }
  }

  let running = false;
  function loop() {
    if (running) return;
    running = true;
    const frame = (now) => {
      const active = setups.filter(s => s.on);
      if (!active.length) { running = false; return; }
      active.forEach(s => draw(s, now));
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  // sin movimiento (o sin IntersectionObserver): un solo cuadro quieto
  setups.forEach(s => draw(s, 0));
  if (!reduce && !('IntersectionObserver' in window)) { setups.forEach(s => { s.on = true; }); loop(); }
})();
