// Asistente Galilea - chat de preguntas frecuentes que funciona 100% en el navegador (gratis, sin IA externa).
// Entiende la pregunta por palabras clave (TEMAS) y responde con información de la iglesia, preguntas básicas
// de fe y la Biblia completa (La Biblia en Español Sencillo, dominio público, en js/biblia-bes.json).
// Cada pasaje incluye un enlace para leerlo en la Nueva Traducción Viviente (NTV) en BibleGateway,
// porque el texto de la NTV tiene derechos de autor y no se puede incluir completo en la web.
// Para cambiar respuestas, edita DATOS y TEMAS. Las respuestas son HTML de confianza;
// lo que escribe el visitante siempre se muestra como texto plano.
(() => {
  const DATOS = {
    whatsappVictor: '593959009768',
    whatsappDaniela: '593991060099',
    correo: 'iglesiacgalilea@gmail.com',
    mapa: 'https://maps.app.goo.gl/BS41eaCGVGgSNyBaA',
    youtube: 'https://youtube.com/@iglesiacuadrangulargalilea2571',
    // misma lista que eventos.html; los eventos pasados se ocultan solos
    eventos: [
      {titulo: 'Vigilia: Familias en la Brecha', cuando: 'Viernes 23 de octubre · 9:00 PM', lugar: 'Templo Galilea', fin: '2026-10-24T03:00:00-05:00'},
      {titulo: 'Concentración y Bautismo · Zona 5', cuando: 'Sábado 31 de octubre · 10:00 AM', lugar: 'Iglesia Cuadrangular Betel, Recinto Maravilla 2', fin: '2026-10-31T15:00:00-05:00'},
      {titulo: 'Culto Dominical y Santa Cena', cuando: 'Domingo 1 de noviembre · 10:00 AM', lugar: 'Templo Galilea', fin: '2026-11-01T13:00:00-05:00'},
      {titulo: 'Podcast Galilea', cuando: 'Diciembre 2026 (fecha por confirmar)', lugar: 'Transmisión en YouTube', fin: '2026-12-31T23:59:00-05:00'},
      {titulo: 'Viaje Misionero', cuando: 'Diciembre 2026 (fechas por confirmar)', lugar: 'Por anunciar', fin: '2026-12-31T23:59:00-05:00'},
      {titulo: 'Culto de Niños', cuando: 'Próximamente', lugar: 'Templo Galilea', fin: null},
    ],
    // versículos de ánimo (el texto se toma de la Biblia incluida)
    animo: ['Juan 3:16', 'Salmos 23:1', 'Filipenses 4:13', 'Isaías 41:10', 'Mateo 11:28', 'Proverbios 3:5-6', 'Romanos 8:28', 'Josué 1:9', 'Salmos 46:1', 'Lamentaciones 3:22-23', 'Salmos 34:18', 'Juan 14:27', '1 Pedro 5:7', 'Isaías 40:31'],
  };

  const wa = (num, texto) => `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
  const btn = (href, icono, texto, externo = true) =>
    `<a class="ag-link" href="${href}"${externo ? ' target="_blank" rel="noopener"' : ''}><i class="${icono}"></i> ${texto}</a>`;
  const botonesPastores = (texto) =>
    `<div class="ag-links">${btn(wa(DATOS.whatsappVictor, texto), 'fa-brands fa-whatsapp', 'Pastor Víctor')}${btn(wa(DATOS.whatsappDaniela, texto), 'fa-brands fa-whatsapp', 'Pastora Daniela')}</div>`;

  // próximo domingo 10:00 AM, hora de Ecuador (UTC-5)
  const proximoDomingo = () => {
    const off = -5 * 3600e3, now = Date.now(), l = new Date(now + off);
    let start = Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate() + (7 - l.getUTCDay()) % 7, 10) - off;
    if (now >= start + 150 * 60e3) start += 7 * 864e5;
    if (now >= start) return 'ahora mismo: ¡estamos en vivo!';
    const d = new Date(start + off);
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `el domingo ${d.getUTCDate()} de ${meses[d.getUTCMonth()]} a las 10:00 AM (hora de Ecuador)`;
  };
  const proximosEventos = () => DATOS.eventos.filter(e => !e.fin || new Date(e.fin) > new Date());

  // ===================== BIBLIA (La Biblia en Español Sencillo, dominio público) =====================
  // El texto completo está en js/biblia-bes.json y solo se descarga cuando alguien pide un versículo.
  const VERSION = 'Español Sencillo';
  const LIBROS = [ // [nombre, alias...] en orden canónico; alias en minúsculas y sin tildes
    ['Génesis', 'genesis', 'gen', 'gn'], ['Éxodo', 'exodo', 'exo'], ['Levítico', 'levitico', 'lev'], ['Números', 'numeros', 'num'],
    ['Deuteronomio', 'deuteronomio', 'deut', 'dt'], ['Josué', 'josue'], ['Jueces', 'jueces', 'jue'], ['Rut', 'rut'],
    ['1 Samuel', '1 samuel', '1 sam'], ['2 Samuel', '2 samuel', '2 sam'], ['1 Reyes', '1 reyes'], ['2 Reyes', '2 reyes'],
    ['1 Crónicas', '1 cronicas', '1 cron'], ['2 Crónicas', '2 cronicas', '2 cron'], ['Esdras', 'esdras', 'esd'], ['Nehemías', 'nehemias', 'neh'],
    ['Ester', 'ester'], ['Job', 'job'], ['Salmos', 'salmos', 'salmo', 'sal'], ['Proverbios', 'proverbios', 'proverbio', 'prov'],
    ['Eclesiastés', 'eclesiastes', 'ecl'], ['Cantares', 'cantares', 'cantar de los cantares', 'cantar'], ['Isaías', 'isaias', 'isa'], ['Jeremías', 'jeremias', 'jer'],
    ['Lamentaciones', 'lamentaciones', 'lam'], ['Ezequiel', 'ezequiel', 'eze'], ['Daniel', 'daniel', 'dan'], ['Oseas', 'oseas'],
    ['Joel', 'joel'], ['Amós', 'amos'], ['Abdías', 'abdias'], ['Jonás', 'jonas'], ['Miqueas', 'miqueas'], ['Nahúm', 'nahum'],
    ['Habacuc', 'habacuc'], ['Sofonías', 'sofonias'], ['Hageo', 'hageo'], ['Zacarías', 'zacarias'], ['Malaquías', 'malaquias'],
    ['Mateo', 'mateo', 'mt'], ['Marcos', 'marcos', 'mc'], ['Lucas', 'lucas', 'lc'], ['Juan', 'juan', 'jn'], ['Hechos', 'hechos', 'hch'],
    ['Romanos', 'romanos', 'rom'], ['1 Corintios', '1 corintios', '1 cor'], ['2 Corintios', '2 corintios', '2 cor'], ['Gálatas', 'galatas', 'gal'],
    ['Efesios', 'efesios', 'ef'], ['Filipenses', 'filipenses', 'fil'], ['Colosenses', 'colosenses', 'col'],
    ['1 Tesalonicenses', '1 tesalonicenses', '1 tes'], ['2 Tesalonicenses', '2 tesalonicenses', '2 tes'], ['1 Timoteo', '1 timoteo', '1 tim'], ['2 Timoteo', '2 timoteo', '2 tim'],
    ['Tito', 'tito'], ['Filemón', 'filemon'], ['Hebreos', 'hebreos', 'heb'], ['Santiago', 'santiago', 'stg'],
    ['1 Pedro', '1 pedro', '1 ped'], ['2 Pedro', '2 pedro', '2 ped'], ['1 Juan', '1 juan', '1 jn'], ['2 Juan', '2 juan'], ['3 Juan', '3 juan'],
    ['Judas', 'judas'], ['Apocalipsis', 'apocalipsis', 'apoc'],
  ];
  // nombres en inglés para abrir el mismo pasaje en la NTV en BibleGateway
  const INGLES = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes',
    'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
    'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];
  const enlaceNTV = (libro, cap, desde, hasta) => 'https://www.biblegateway.com/passage/?version=NTV&search=' +
    encodeURIComponent(`${INGLES[libro]} ${cap}${desde ? ':' + desde + (hasta > desde ? '-' + hasta : '') : ''}`);
  const ALIAS = new Map();
  LIBROS.forEach(([, ...alias], i) => alias.forEach(a => ALIAS.set(a, i)));

  let bibliaPromesa = null;
  const cargarBiblia = () => bibliaPromesa || (bibliaPromesa = fetch('js/biblia-bes.json')
    .then(r => { if (!r.ok) throw new Error('biblia'); return r.json(); })
    .then(d => d.libros)
    .catch(e => { bibliaPromesa = null; throw e; }));

  const sinTildes = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const escapar = t => t.replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const ref = (texto, etiqueta = texto) =>
    `<button type="button" class="ag-ref" data-ref="${texto}"><i class="fa-solid fa-book-bible"></i> ${etiqueta}</button>`;
  const refs = (...lista) => `<div class="ag-links">${lista.map(r => ref(r)).join('')}</div>`;

  // "Juan 3:16", "jn 3 16", "salmo 23", "1 corintios 13:4-7", "primera de juan 4:8"
  const buscarCita = (pregunta) => {
    const q = ' ' + sinTildes(pregunta)
      .replace(/[¿?¡!;]/g, ' ')
      .replace(/\b(primera|primer|1ra|1era|1a)\s+(de\s+)?/g, '1 ')
      .replace(/\b(segunda|segundo|2da|2a)\s+(de\s+)?/g, '2 ')
      .replace(/\b(tercera|tercer|3ra|3a)\s+(de\s+)?/g, '3 ')
      .replace(/\b([123])(?=[a-z])/g, '$1 ')
      .replace(/\s+/g, ' ') + ' ';
    const re = /\s(?:([123])\s)?([a-z]+(?:\sde\slos\s[a-z]+)?)\s?(\d{1,3})(?:\s?[:.,]\s?(\d{1,3})|\s(\d{1,3})(?=[\s-]))?(?:\s?-\s?(\d{1,3}))?(?=[\s.,])/g;
    let m;
    while ((m = re.exec(q))) {
      const [, num, nombre, cap, v1, v1b, v2] = m;
      let libro = num ? ALIAS.get(`${num} ${nombre}`) : ALIAS.get(nombre);
      if (libro === undefined) { re.lastIndex = m.index + 1; continue; }
      const desde = v1 || v1b;
      return {libro, cap: +cap, desde: desde ? +desde : null, hasta: v2 ? +v2 : null};
    }
    return null;
  };

  // compacto = sin botones de "capítulo completo" / "siguiente" (para listas de varios versículos)
  const citar = (biblia, c, maximo = 40, compacto = false) => {
    const nombre = LIBROS[c.libro][0];
    const caps = biblia[c.libro];
    if (c.cap < 1 || c.cap > caps.length) return `${nombre} tiene ${caps.length} capítulo${caps.length > 1 ? 's' : ''}. Prueba con un número entre 1 y ${caps.length}.`;
    const vers = caps[c.cap - 1];
    let desde = c.desde || 1, hasta = c.desde ? (c.hasta || c.desde) : vers.length;
    if (desde > vers.length) return `${nombre} ${c.cap} tiene ${vers.length} versículos.`;
    hasta = Math.min(Math.max(hasta, desde), vers.length);
    const corto = hasta - desde + 1 > maximo;
    const fin = corto ? desde + maximo - 1 : hasta;
    const texto = [];
    for (let v = desde; v <= fin; v++) texto.push((fin > desde ? `<sup>${v}</sup>` : '') + escapar(vers[v - 1]));
    const cita = `${nombre} ${c.cap}${c.desde ? ':' + desde + (fin > desde ? '-' + fin : '') : ''}`;
    const ntv = `<a class="ag-ntv" href="${enlaceNTV(c.libro, c.cap, c.desde ? desde : null, fin)}" target="_blank" rel="noopener">Leer en NTV <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    let extra = '';
    if (corto && !compacto) extra += ref(`${nombre} ${c.cap}:${fin + 1}-${hasta}`, 'Seguir leyendo');
    if (c.desde && fin === desde && !compacto) {
      extra += ref(`${nombre} ${c.cap}`, `Leer ${nombre} ${c.cap}`);
      if (desde < vers.length) extra += ref(`${nombre} ${c.cap}:${desde + 1}`, 'Siguiente versículo');
    }
    return `<blockquote class="ag-verse">${texto.join(' ')}<cite>${cita} · ${VERSION} ${ntv}</cite></blockquote>${extra ? `<div class="ag-links">${extra}</div>` : ''}`;
  };
  const leerCita = async (texto) => {
    const c = buscarCita(texto);
    if (!c) return '';
    return citar(await cargarBiblia(), c, 3);
  };

  // temas bíblicos frecuentes -> pasajes escogidos (si no hay tema, se busca la palabra en toda la Biblia)
  const TOPICOS = [
    [['amor', 'amar', 'caridad'], ['1 Corintios 13:4-7', '1 Juan 4:8', 'Juan 3:16', 'Romanos 8:38-39']],
    [['fe', 'creer', 'confianza', 'confiar'], ['Hebreos 11:1', 'Hebreos 11:6', 'Proverbios 3:5-6', 'Marcos 11:24']],
    [['paz', 'tranquilidad', 'calma'], ['Juan 14:27', 'Filipenses 4:6-7', 'Isaías 26:3', 'Juan 16:33']],
    [['perdon', 'perdonar', 'pecado', 'culpa'], ['1 Juan 1:9', 'Efesios 4:32', 'Salmos 103:12', 'Mateo 6:14-15']],
    [['miedo', 'temor', 'valentia', 'valor'], ['Isaías 41:10', 'Josué 1:9', '2 Timoteo 1:7', 'Salmos 27:1']],
    [['ansiedad', 'preocupacion', 'afan', 'estres', 'nervios'], ['Filipenses 4:6-7', '1 Pedro 5:7', 'Mateo 6:34', 'Mateo 11:28-29']],
    [['fortaleza', 'fuerza', 'fuerzas', 'cansancio', 'cansado'], ['Isaías 40:31', 'Filipenses 4:13', 'Salmos 46:1', '2 Corintios 12:9']],
    [['esperanza', 'futuro', 'planes'], ['Jeremías 29:11', 'Romanos 15:13', 'Lamentaciones 3:22-23', 'Romanos 8:28']],
    [['salvacion', 'salvo', 'vida eterna'], ['Juan 3:16', 'Romanos 10:9-10', 'Efesios 2:8-9', 'Juan 14:6']],
    [['familia', 'hijos', 'padres', 'hogar'], ['Josué 24:15', 'Efesios 6:1-4', 'Proverbios 22:6', 'Salmos 127:1']],
    [['sanidad', 'enfermedad', 'enfermo', 'salud', 'sanar'], ['Isaías 53:5', 'Santiago 5:14-15', 'Jeremías 30:17', 'Éxodo 15:26']],
    [['matrimonio', 'esposo', 'esposa', 'pareja'], ['Génesis 2:24', 'Efesios 5:25', 'Eclesiastés 4:9-12', 'Colosenses 3:18-19']],
    [['tristeza', 'triste', 'consuelo', 'dolor', 'duelo', 'llorar'], ['Mateo 5:4', 'Salmos 34:18', '2 Corintios 1:3-4', 'Apocalipsis 21:4']],
    [['oracion', 'orar'], ['Mateo 6:9-13', 'Jeremías 33:3', '1 Tesalonicenses 5:17', 'Filipenses 4:6']],
    [['gratitud', 'agradecimiento', 'gracias', 'agradecer'], ['1 Tesalonicenses 5:18', 'Salmos 100:4', 'Salmos 107:1', 'Colosenses 3:17']],
    [['espiritu santo'], ['Juan 14:26', 'Hechos 1:8', 'Hechos 2:4', 'Gálatas 5:22-23']],
    [['segunda venida', 'regreso', 'venida', 'rapto'], ['Juan 14:2-3', 'Hechos 1:11', '1 Tesalonicenses 4:16-17', 'Apocalipsis 22:20']],
    [['diezmo', 'ofrenda', 'dar', 'generosidad'], ['Malaquías 3:10', '2 Corintios 9:7', 'Lucas 6:38', 'Proverbios 3:9-10']],
    [['trabajo', 'empleo'], ['Colosenses 3:23', 'Proverbios 16:3', 'Salmos 90:17', 'Proverbios 14:23']],
    [['sabiduria', 'decision', 'decisiones', 'consejo'], ['Santiago 1:5', 'Proverbios 3:5-6', 'Salmos 32:8', 'Proverbios 2:6']],
    [['paciencia', 'esperar'], ['Isaías 40:31', 'Romanos 12:12', 'Santiago 1:2-4', 'Salmos 37:7']],
    [['humildad', 'orgullo'], ['Santiago 4:10', 'Filipenses 2:3', 'Proverbios 16:18', 'Miqueas 6:8']],
    [['soledad', 'solo', 'sola'], ['Deuteronomio 31:6', 'Salmos 68:6', 'Mateo 28:20', 'Hebreos 13:5']],
  ];
  const VACIAS = new Set('el la los las lo de del al que y o a en un una unos unas por para con sin mi mis me tu tus te se su sus sobre acerca hablen hable habla dice dicen biblia biblico biblicos versiculo versiculos cita citas texto textos busca buscar buscame encuentra muestrame dame quiero algo alguno algun es son esta como cual cuales donde'.split(' '));
  const intencionBuscar = (pregunta) => {
    const q = sinTildes(pregunta).replace(/[¿?¡!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();
    const m = q.match(/(?:versiculos?|citas?|textos?|pasajes?)\s+(?:biblicos?\s+)?(?:de la biblia\s+)?(?:sobre|de|del|acerca de|para|que hablen? de|con)\s+(.+)/)
      || q.match(/(?:que|q) dice la biblia\s+(?:sobre|de|del|acerca de|respecto a)\s+(.+)/)
      || q.match(/^busca(?:r|me)?\s+(?:en la biblia\s+)?(.+)$/)
      || q.match(/^(?:la )?biblia\s+(?:sobre|de)\s+(.+)$/);
    return m ? m[1].replace(/\s+en la biblia$/, '').trim() : null;
  };
  let indice = null; // texto normalizado de cada versículo, para buscar palabras
  const buscarBiblia = async (tema) => {
    const terminos = tema.split(' ').filter(t => t && !VACIAS.has(t));
    if (!terminos.length) return null;
    const frase = terminos.join(' ');
    const topico = TOPICOS.find(([claves]) => claves.some(k => frase === k || frase.includes(k) && k.includes(' ') || terminos.includes(k)));
    const biblia = await cargarBiblia();
    if (topico) {
      const citas = topico[1].map(r => citar(biblia, buscarCita(r), 6, true)).join('');
      return `Esto dice la Biblia sobre <strong>${escapar(frase)}</strong>:${citas}`;
    }
    if (!indice) {
      indice = [];
      biblia.forEach((caps, l) => caps.forEach((vers, c) => vers.forEach((t, v) => indice.push([' ' + sinTildes(t).replace(/[^a-z0-9ñ ]/g, ' ') + ' ', l, c + 1, v + 1]))));
    }
    const hallados = indice.filter(([t]) => terminos.every(w => t.includes(' ' + w)));
    if (!hallados.length) return `No encontré versículos con <strong>${escapar(frase)}</strong>. Prueba con otra palabra parecida.`;
    const muestra = hallados.slice(0, 5).map(([, l, c, v]) => citar(biblia, {libro: l, cap: c, desde: v, hasta: null}, 1, true)).join('');
    return `Encontré <strong>${hallados.length}</strong> versículo${hallados.length > 1 ? 's' : ''} con <strong>${escapar(frase)}</strong>${hallados.length > 5 ? '. Estos son los primeros 5' : ''}:${muestra}`;
  };
  const versiculo = async () => {
    const r = DATOS.animo[Math.floor(Math.random() * DATOS.animo.length)];
    return citar(await cargarBiblia(), buscarCita(r), 6);
  };

  // Cada tema: palabras clave (sin tildes, en minúsculas) y la respuesta.
  const TEMAS = [
    {id: 'crisis', prioridad: true,
      claves: ['suicid', 'matarme', 'quitarme la vida', 'no quiero vivir', 'hacerme dano', 'morirme', 'quiero morir', 'me quiero morir', 'cortarme', 'abuso', 'me pegan', 'violencia'],
      responder: () => `Lamento mucho que estés pasando por esto. <strong>No estás solo, tu vida es muy valiosa para Dios y para nosotros.</strong>
        <br><br>Si estás en peligro ahora mismo, llama al <strong>911</strong> (ECU 911).
        <br><br>Escríbele ya a nuestros pastores; queremos acompañarte y orar contigo:${botonesPastores('Hola, necesito hablar con alguien, por favor.')}
        <div class="ag-links">${btn('tel:911', 'fa-solid fa-phone', 'Llamar al 911')}</div>`},
    {id: 'saludo', debil: true, claves: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'que tal', 'bendiciones hermano'],
      responder: () => '¡Hola! Dios te bendiga. Soy el Asistente Galilea. Pregúntame por horarios, células, eventos, ofrendas o la transmisión en vivo; también preguntas de fe o cualquier pasaje de la Biblia (por ejemplo "Salmo 23").'},
    {id: 'gracias', debil: true, claves: ['gracias', 'amen', 'dios te bendiga', 'bendiciones', 'excelente', 'genial'],
      responder: () => '¡Amén! Dios te bendiga. Aquí estoy si necesitas algo más. 🙏'},
    {id: 'primera', claves: ['primera vez', 'visitar', 'nuevo', 'nueva', 'conocer la iglesia', 'como me visto', 'que me pongo', 'ropa', 'vestimenta', 'codigo de vestimenta', 'puedo ir'],
      responder: () => `¡Nos encantaría recibirte! Ven como te sientas cómodo: <strong>no hay código de vestimenta</strong>, lo importante es tu corazón. Te recomendamos empezar por el <strong>Culto Dominical, domingo 10:00 AM</strong>. Nuestro equipo te recibirá en la entrada.
        <div class="ag-links">${btn('horarios.html', 'fa-solid fa-clock', 'Ver horarios', false)}${btn(DATOS.mapa, 'fa-solid fa-location-dot', 'Cómo llegar')}</div>`},
    // ----- preguntas básicas de fe -----
    {id: 'salvacion', claves: ['ser salvo', 'salvacion', 'como me salvo', 'aceptar a cristo', 'aceptar a jesus', 'recibir a jesus', 'recibir a cristo', 'entregar mi vida', 'nacer de nuevo', 'ir al cielo', 'vida eterna', 'como ser cristiano'],
      responder: () => `La Biblia enseña que la salvación es un <strong>regalo de Dios</strong> por medio de Jesucristo, no algo que ganamos por obras:
        <ol class="ag-steps"><li><strong>Reconoce</strong> que todos hemos pecado y necesitamos a Dios.</li><li><strong>Cree</strong> que Jesús murió por tus pecados y resucitó.</li><li><strong>Confiesa</strong> a Jesús como tu Señor y Salvador.</li><li><strong>Camina</strong> con Él: ora, lee la Biblia y congrégate.</li></ol>
        Si quieres, puedes orar así con sinceridad: <em>"Señor Jesús, reconozco que soy pecador. Creo que moriste por mí y resucitaste. Te recibo como mi Señor y Salvador. Perdóname y guía mi vida. Amén."</em>
        ${refs('Romanos 3:23', 'Romanos 6:23', 'Romanos 10:9-10', 'Efesios 2:8-9', 'Juan 1:12')}
        Si hiciste esta oración, ¡queremos celebrar contigo y acompañarte!${botonesPastores('Hola, hoy recibí a Jesús en mi corazón y quisiera acompañamiento.')}`},
    {id: 'jesus', claves: ['quien es jesus', 'quien fue jesus', 'quien es jesucristo', 'quien es cristo', 'hijo de dios', 'jesus es dios', 'por que murio jesus', 'resurreccion de jesus', 'resucito'],
      responder: () => `<strong>Jesucristo</strong> es el Hijo de Dios, que se hizo hombre, vivió sin pecado, murió en la cruz por nuestros pecados y <strong>resucitó al tercer día</strong>. Él es el único camino al Padre y hoy vive y intercede por nosotros. Por eso proclamamos: Cristo salva, bautiza con el Espíritu Santo, sana y viene pronto.
        ${refs('Juan 1:1', 'Juan 1:14', 'Juan 14:6', '1 Corintios 15:3-4')}`},
    {id: 'dios', claves: ['quien es dios', 'existe dios', 'dios existe', 'trinidad', 'como es dios'],
      responder: () => `Creemos en <strong>un solo Dios</strong>, eterno, creador de todo, que se ha revelado como <strong>Padre, Hijo y Espíritu Santo</strong>. Dios es amor, es santo y quiere tener una relación personal contigo.
        ${refs('Génesis 1:1', 'Deuteronomio 6:4', 'Mateo 28:19', '1 Juan 4:8')}`},
    {id: 'espiritu', claves: ['espiritu santo', 'bautismo en el espiritu', 'bautizo en el espiritu', 'hablar en lenguas', 'don de lenguas', 'lenguas', 'dones del espiritu', 'dones espirituales'],
      responder: () => `El <strong>Espíritu Santo</strong> es Dios, la tercera persona de la Trinidad. Nos consuela, nos enseña y nos da poder para vivir y servir. Como iglesia cuadrangular creemos que Jesús <strong>bautiza con el Espíritu Santo</strong>, una experiencia de poder para todo creyente, como en el día de Pentecostés.
        ${refs('Juan 14:26', 'Hechos 1:8', 'Hechos 2:4', 'Gálatas 5:22-23')}`},
    {id: 'fe', claves: ['que es la fe', 'que es fe', 'tener fe', 'como tener fe', 'aumentar mi fe', 'crecer en la fe', 'tengo dudas', 'dudas de fe'],
      responder: () => `La <strong>fe</strong> es confiar en Dios y en Su Palabra aunque todavía no veamos el resultado. La fe crece al escuchar y leer la Palabra de Dios, orar y caminar en comunidad.
        ${refs('Hebreos 11:1', 'Hebreos 11:6', 'Romanos 10:17', 'Marcos 9:24')}`},
    {id: 'orar', claves: ['como orar', 'como se ora', 'ensename a orar', 'aprender a orar', 'como hablar con dios', 'padre nuestro', 'como hago una oracion', 'como hacer una oracion'],
      responder: () => `Orar es <strong>hablar con Dios</strong> con sinceridad, como con un Padre que te ama. No necesitas palabras perfectas. Una guía sencilla:
        <ol class="ag-steps"><li><strong>Alaba</strong> a Dios por quién es.</li><li><strong>Agradece</strong> lo que ha hecho.</li><li><strong>Pide perdón</strong> por tus faltas.</li><li><strong>Presenta</strong> tus necesidades y las de otros.</li></ol>
        Jesús nos enseñó el Padre Nuestro como modelo.${refs('Mateo 6:9-13', 'Filipenses 4:6-7', 'Jeremías 33:3')}`},
    {id: 'biblia', claves: ['que es la biblia', 'por donde empiezo a leer', 'por donde empezar a leer', 'como leer la biblia', 'leer la biblia', 'cuantos libros tiene', 'libros de la biblia', 'quien escribio la biblia'],
      responder: () => `La <strong>Biblia</strong> es la Palabra de Dios: 66 libros (39 del Antiguo Testamento y 27 del Nuevo), escritos por hombres inspirados por el Espíritu Santo. Si estás empezando, te recomendamos leer el <strong>Evangelio de Juan</strong>, un capítulo por día.
        <br><br>Puedo leerte cualquier pasaje: escribe por ejemplo <em>"Juan 1"</em>, <em>"Salmo 23"</em> o <em>"versículos sobre la paz"</em>.${refs('2 Timoteo 3:16-17', 'Salmos 119:105', 'Juan 1')}`},
    {id: 'pecado', claves: ['que es el pecado', 'que es pecado', 'dios me perdona', 'me perdonara', 'perdon de dios', 'perdonar mis pecados', 'arrepentirme', 'arrepentimiento', 'me siento culpable'],
      responder: () => `El <strong>pecado</strong> es todo lo que nos aparta de Dios y de Su voluntad. La buena noticia es que <strong>Dios perdona</strong> a quien se arrepiente de corazón y confía en Jesús: no hay pecado tan grande que Su gracia no pueda perdonar.
        ${refs('Romanos 3:23', '1 Juan 1:9', 'Isaías 1:18', 'Salmos 103:12')}`},
    {id: 'bautismo-agua', claves: ['que es el bautismo', 'por que bautizarse', 'para que bautizarse', 'significa el bautismo', 'significado del bautismo', 'bautismo en agua', 'es necesario bautizarse'],
      responder: () => {
        const ev = proximosEventos().find(e => /bautismo/i.test(e.titulo));
        return `El <strong>bautismo en agua</strong> es un paso de obediencia: muestra públicamente que crees en Jesús, que tu vida vieja quedó atrás y que empiezas una vida nueva con Él. Jesús mandó bautizar a los que creen.
        ${refs('Mateo 28:19', 'Romanos 6:4', 'Hechos 2:38')}` + (ev ? `El próximo es la <strong>${ev.titulo}</strong>: ${ev.cuando}.` : '') + botonesPastores('Hola, quisiera información para bautizarme.');
      }},
    {id: 'cena', claves: ['que es la santa cena', 'que significa la santa cena', 'significado de la santa cena', 'cena del senor', 'comunion', 'pan y el vino'],
      responder: () => `La <strong>Santa Cena</strong> es la mesa que Jesús nos mandó celebrar en memoria de Él: el pan representa Su cuerpo y la copa Su sangre, entregados por nosotros. La tomamos con fe y gratitud, examinando nuestro corazón.
        ${refs('1 Corintios 11:23-26', 'Lucas 22:19-20')}`},
    {id: 'diezmo-fe', claves: ['que es el diezmo', 'por que diezmar', 'debo diezmar', 'es obligatorio diezmar', 'por que dar el diezmo', 'para que el diezmo'],
      responder: () => `El <strong>diezmo</strong> es devolver a Dios el 10% de lo que recibimos, en gratitud y reconocimiento de que todo viene de Él. Junto con las ofrendas, es un acto voluntario de adoración: Dios ama al dador alegre.
        ${refs('Malaquías 3:10', '2 Corintios 9:7', 'Proverbios 3:9-10')}<div class="ag-links">${btn('ofrendas.html#formas', 'fa-solid fa-hand-holding-heart', 'Formas de dar', false)}</div>`},
    {id: 'venida', claves: ['segunda venida', 'cristo viene', 'jesus viene', 'viene pronto', 'fin del mundo', 'regreso de cristo', 'regreso de jesus', 'rapto', 'arrebatamiento'],
      responder: () => `Creemos que <strong>Cristo viene pronto</strong>: Jesús prometió volver por Su iglesia. Nadie sabe el día ni la hora, por eso vivimos preparados, con esperanza y compartiendo el evangelio.
        ${refs('Juan 14:2-3', 'Hechos 1:11', '1 Tesalonicenses 4:16-17', 'Mateo 24:36')}`},
    {id: 'sanidad', claves: ['sanidad divina', 'dios sana', 'dios puede sanar', 'dios me puede sanar', 'sanacion', 'milagros existen', 'existen los milagros'],
      responder: () => `Creemos que <strong>Cristo sana</strong> hoy: por eso oramos por los enfermos con fe. Orar por sanidad no reemplaza la atención médica; Dios también obra a través de los médicos.
        ${refs('Isaías 53:5', 'Santiago 5:14-15', 'Hebreos 13:8')}Si quieres que oremos por ti o por un ser querido:${botonesPastores('Hola, quisiera pedir oración por sanidad para: ')}`},
    {id: 'cielo', claves: ['que pasa cuando morimos', 'despues de la muerte', 'existe el cielo', 'como es el cielo', 'el cielo', 'infierno', 'resurreccion de los muertos'],
      responder: () => `La Biblia enseña que quienes creen en Jesús tienen <strong>vida eterna</strong> y estarán con Él para siempre. Jesús venció la muerte y prometió preparar un lugar para los suyos.
        ${refs('Juan 11:25-26', 'Juan 14:2-3', 'Apocalipsis 21:4')}`},
    {id: 'congregarse', claves: ['por que ir a la iglesia', 'para que ir a la iglesia', 'necesito ir a la iglesia', 'creer sin ir a la iglesia', 'es necesario congregarse', 'congregarme'],
      responder: () => `La fe se vive en <strong>familia</strong>. En la iglesia adoramos juntos, aprendemos la Palabra, nos animamos y servimos. Dios no nos diseñó para caminar solos.
        ${refs('Hebreos 10:24-25', 'Hechos 2:42', 'Eclesiastés 4:9-10')}<div class="ag-links">${btn('horarios.html', 'fa-solid fa-clock', 'Ver horarios', false)}</div>`},
    {id: 'proposito', claves: ['proposito', 'para que existo', 'sentido de la vida', 'que quiere dios de mi', 'voluntad de dios', 'mi llamado'],
      responder: () => `Dios te creó con <strong>propósito</strong>: conocerle, amarle y servir a otros con los dones que te dio. Él tiene planes de bien para tu vida.
        ${refs('Jeremías 29:11', 'Efesios 2:10', 'Romanos 12:2', 'Mateo 22:37-39')}`},
    {id: 'domingo', claves: ['domingo', 'dominical', 'ayuno', 'santa cena'],
      responder: () => `<strong>Culto Dominical:</strong> domingo 10:00 AM, para toda la familia.<br><strong>Ayuno:</strong> primer domingo de cada mes, 1:00 PM.<br><br>El próximo culto es ${proximoDomingo()}.`},
    {id: 'horarios', claves: ['horario', '~hora', '~culto', '~cultos', 'servicio', 'servicios', '~cuando', '~que dias', 'reunion', 'reuniones', 'misa', '~semana'],
      responder: () => `Estos son nuestros horarios:
        <ul class="ag-list">
          <li><strong>Domingo</strong> · 10:00 AM · Culto Dominical</li>
          <li><strong>1er domingo</strong> · 1:00 PM · Ayuno</li>
          <li><strong>Lunes</strong> · 7:30 PM · Culto de Oración</li>
          <li><strong>Martes</strong> · 7:30 PM · Damas y Caballeros (se alternan)</li>
          <li><strong>Último martes</strong> · 7:30 PM · Culto de Parejas</li>
          <li><strong>Miércoles</strong> · 7:30 PM · Estudio Bíblico</li>
          <li><strong>Viernes</strong> · 7:30 PM · Células Hogares</li>
          <li><strong>Sábado</strong> · 7:30 PM · Culto de Jóvenes</li>
        </ul>${btn('horarios.html', 'fa-solid fa-clock', 'Ver todos los horarios', false)}`},
    {id: 'ubicacion', claves: ['donde', 'ubicacion', 'ubicados', 'direccion', 'llegar', 'mapa', '~queda', '~templo', 'sede', '~milagro', 'como voy'],
      responder: () => `Nuestro templo está en <strong>Milagro, Guayas, Ecuador</strong>. Hay estacionamiento gratis para visitantes.
        <div class="ag-links">${btn(DATOS.mapa, 'fa-solid fa-map-location-dot', 'Abrir en Google Maps')}${btn('ubicacion.html', 'fa-solid fa-location-dot', 'Ver ubicación', false)}</div>`},
    {id: 'celulas', claves: ['celula', 'celulas', 'hogar', 'grupo pequeno', 'cerca de mi casa', 'cerca de mi', 'mi sector', 'mi barrio', '~viernes'],
      responder: () => `Las <strong>Células Hogares</strong> se reúnen los <strong>viernes a las 7:30 PM</strong> en casas de hermanos en distintos sectores de Milagro. Tenemos 8 células; en el mapa puedes ver la más cercana y abrir la ruta.
        <div class="ag-links">${btn('ubicacion.html#celulas', 'fa-solid fa-house-user', 'Ver mapa de células', false)}</div>`},
    {id: 'jovenes', claves: ['joven', 'jovenes', 'juventud', 'adolescente', 'adolescentes', '~sabado'],
      responder: () => `¡Te esperamos en el <strong>Culto de Jóvenes</strong>, cada <strong>sábado a las 7:30 PM</strong> en el templo! Adoración, Palabra y amistades verdaderas. Puedes venir solo o con tus amigos.
        <div class="ag-links">${btn('juventud.html', 'fa-solid fa-fire', 'Conoce Juventud', false)}</div>`},
    {id: 'ninos', claves: ['nino', 'ninos', 'nina', 'ninas', 'hijo', 'hijos', 'kids', 'infantil', 'escuela dominical'],
      responder: () => 'Estamos preparando el <strong>Culto de Niños</strong>, ¡muy pronto anunciaremos la fecha! Mientras tanto, tus hijos son bienvenidos en el Culto Dominical con toda la familia.'},
    {id: 'damas', claves: ['damas', 'mujeres', 'mujer', 'caballeros', 'hombres', 'varones', '~martes'],
      responder: () => `Los <strong>martes a las 7:30 PM</strong> se alternan cada semana el culto de <strong>Damas</strong> (líder: Marianela Bejarano) y el de <strong>Caballeros</strong> (líder: Mario Alvarado). El último martes del mes es el <strong>Culto de Parejas</strong>.
        <div class="ag-links">${btn('grupos.html', 'fa-solid fa-people-group', 'Ver grupos', false)}</div>`},
    {id: 'parejas', claves: ['pareja', 'parejas', 'matrimonio', 'matrimonios', 'esposo', 'esposa', 'esposos', 'novios', 'novio', 'novia'],
      responder: () => 'El <strong>Culto de Parejas</strong> es el <strong>último martes de cada mes a las 7:30 PM</strong>: un espacio especial para fortalecer los matrimonios. Si necesitas consejería, escríbele a nuestros pastores.' + botonesPastores('Hola, quisiera consejería para mi matrimonio.')},
    {id: 'oracion', claves: ['oracion', 'orar', 'oren', 'ora por', 'oracion por', 'peticion', 'enfermo', 'enferma', 'sanidad', 'necesito ayuda'],
      responder: () => `Será un honor orar por ti. Puedes enviarnos tu petición y nuestros pastores orarán contigo. También nos reunimos en el <strong>Culto de Oración, lunes 7:30 PM</strong>.
        ${botonesPastores('Hola, quisiera pedir oración por: ')}<div class="ag-links">${btn('contacto.html', 'fa-solid fa-envelope', 'Formulario de contacto', false)}</div>`},
    {id: 'envivo', claves: ['vivo', 'en vivo', 'transmision', 'transmiten', 'youtube', 'online', 'en linea', 'ver el culto', 'virtual', 'internet'],
      responder: () => `Transmitimos el culto en vivo cada <strong>domingo a las 10:00 AM</strong> por YouTube. El próximo es ${proximoDomingo()}
        <div class="ag-links">${btn('predicas.html#envivo', 'fa-solid fa-tower-broadcast', 'Ver en vivo', false)}${btn(DATOS.youtube, 'fa-brands fa-youtube', 'Canal de YouTube')}</div>`},
    {id: 'predicas', claves: ['predica', 'predicas', 'mensaje', 'mensajes', 'sermon', 'sermones', 'video', 'videos', 'danza'],
      responder: () => `Puedes ver nuestras prédicas y los videos del ministerio de danza en la sección de Prédicas o en nuestro canal de YouTube.
        <div class="ag-links">${btn('predicas.html', 'fa-solid fa-play', 'Ver prédicas', false)}${btn(DATOS.youtube, 'fa-brands fa-youtube', 'YouTube')}</div>`},
    {id: 'bautismo', claves: ['bautizo', 'bautismo', 'bautizar', 'bautizarme', 'bautizan'],
      responder: () => {
        const ev = proximosEventos().find(e => /bautismo/i.test(e.titulo));
        return (ev ? `El próximo es la <strong>${ev.titulo}</strong>: ${ev.cuando}, en ${ev.lugar}.<br><br>` : '') +
          'Si quieres bautizarte, conversa con nuestros pastores para prepararte:' + botonesPastores('Hola, quisiera información para bautizarme.');
      }},
    {id: 'eventos', claves: ['evento', 'eventos', 'actividad', 'actividades', 'vigilia', '~proximo', '~proxima', 'programa', 'agenda', 'podcast', 'misionero', 'campamento', 'festival'],
      responder: () => {
        const lista = proximosEventos();
        if (!lista.length) return `Pronto anunciaremos nuevos eventos. ${btn('eventos.html', 'fa-solid fa-calendar-days', 'Ver eventos', false)}`;
        return `Estos son nuestros próximos eventos:<ul class="ag-list">${lista.map(e => `<li><strong>${e.titulo}</strong><br>${e.cuando} · ${e.lugar}</li>`).join('')}</ul>${btn('eventos.html', 'fa-solid fa-calendar-days', 'Ver todos los eventos', false)}`;
      }},
    {id: 'ofrenda', claves: ['ofrenda', 'ofrendar', 'ofrendas', 'diezmo', 'diezmos', 'donar', 'donacion', '~cuenta', 'transferencia', 'transferir', 'deposito', 'depositar', 'banco', 'produbanco', 'sembrar'],
      responder: () => `¡Gracias por tu generosidad! Puedes dar por transferencia o depósito:
        <ul class="ag-list"><li><strong>Produbanco</strong> · Cuenta de ahorros</li><li><strong>N.º 20300055003</strong></li><li>Titular: Daniela Macias Valle</li><li>Cédula: 1204910622</li></ul>
        También puedes dar con el sobre de ofrenda o el código QR en cualquier servicio.
        <div class="ag-links">${btn('ofrendas.html#formas', 'fa-solid fa-hand-holding-heart', 'Ver formas de dar', false)}</div>`},
    {id: 'pastores', claves: ['pastor', 'pastora', 'pastores', 'quien dirige', 'lider', 'lideres', 'victor', 'daniela'],
      responder: () => `Nuestros pastores son <strong>Víctor H. Rivera</strong> y <strong>Daniela Macías Valle</strong>. Puedes escribirles directamente:${botonesPastores('Hola, vi la página web de Galilea y quisiera hablar con usted.')}`},
    {id: 'contacto', claves: ['contacto', 'contactar', 'telefono', 'whatsapp', '~numero', 'llamar', 'celular', 'correo', 'email', '~escribir', '~hablar con'],
      responder: () => `Puedes escribirnos por WhatsApp:${botonesPastores('Hola, vi la página web de Galilea y quisiera información.')}
        o al correo <a href="mailto:${DATOS.correo}">${DATOS.correo}</a>.<div class="ag-links">${btn('contacto.html', 'fa-solid fa-envelope', 'Ir a contacto', false)}</div>`},
    {id: 'creencias', claves: ['creen', 'creencia', 'creencias', 'doctrina', 'en que creen', 'cuadrangular', 'evangelio', 'religion', 'catolic', 'denominacion'],
      responder: () => `Somos parte de la <strong>Iglesia del Evangelio Cuadrangular del Ecuador</strong>. Proclamamos cuatro verdades fundamentales: Jesucristo <strong>Salva</strong>, <strong>Bautiza</strong> con el Espíritu Santo, <strong>Sana</strong> y <strong>Viene Pronto</strong>. Somos una familia de fe, no una religión.
        <div class="ag-links">${btn('nosotros.html', 'fa-solid fa-church', 'Conoce nuestra historia', false)}</div>`},
    {id: 'animo', claves: ['versiculo', 'biblia', 'palabra de dios', 'animo', 'me siento mal', 'estoy mal', 'consuelo', 'triste', 'tristeza', 'preocupado', 'preocupada', 'ansiedad', 'ansioso', 'miedo', '~solo', '~sola', 'deprimido', 'deprimida', '~dificil', '~problema'],
      responder: async () => `Aquí tienes una palabra para ti:${await versiculo()}Si quieres que oremos contigo, escríbele a nuestros pastores:${botonesPastores('Hola, quisiera que oren por mí.')}`},
    {id: 'ingles', claves: ['english', 'ingles', 'speak english', 'in english'],
      responder: () => `We have a page in English with everything you need! ${btn('ingles.html', 'fa-solid fa-language', 'English page', false)}`},
  ];

  const SUGERENCIAS = ['Horarios', '¿Dónde están?', 'Próximos eventos', 'Células', 'Ofrendas', 'En vivo', '¿Cómo ser salvo?', 'Versículos sobre la paz', 'Juan 3:16', 'Pedir oración', 'Un versículo'];
  const normalizar = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:]/g, ' ');

  const responder = async (pregunta) => {
    const q = ` ${normalizar(pregunta)} `;
    const crisis = TEMAS.find(t => t.prioridad && t.claves.some(c => q.includes(c)));
    if (crisis) return crisis.responder();
    try {
      const cita = await leerCita(pregunta);
      if (cita) return cita;
      const tema = intencionBuscar(pregunta);
      if (tema) { const r = await buscarBiblia(tema); if (r) return r; }
    } catch (e) {
      if (buscarCita(pregunta) || intencionBuscar(pregunta)) return 'No pude abrir la Biblia en este momento. Revisa tu conexión e inténtalo de nuevo.';
    }
    // '~palabra' = palabra general, vale medio punto; palabras cortas deben coincidir completas ("hora" no activa "ahora")
    const puntaje = tema => tema.claves.reduce((n, clave) => {
      const debil = clave.startsWith('~');
      const c = debil ? clave.slice(1) : clave;
      const hit = c.length <= 5 ? q.includes(` ${c} `) : q.includes(c);
      return n + (hit ? (debil ? 0.5 : 1) : 0);
    }, 0);
    // saludos y agradecimientos solo responden si no hay otra pregunta en el mensaje
    for (const grupo of [TEMAS.filter(t => !t.debil && !t.prioridad), TEMAS.filter(t => t.debil)]) {
      let mejor = null, puntos = 0;
      for (const tema of grupo) {
        const p = puntaje(tema);
        if (p > puntos) { mejor = tema; puntos = p; }
      }
      if (mejor) return mejor.responder();
    }
    return `Todavía no sé responder eso, pero nuestros pastores con gusto te ayudan:${botonesPastores('Hola, tengo una pregunta: ' + pregunta)}
      <span class="ag-hint">Puedo ayudarte con horarios, células, eventos, ofrendas, la transmisión en vivo, preguntas básicas de fe (por ejemplo "¿cómo ser salvo?") o la Biblia: escribe una cita como "Juan 3:16" o "versículos sobre la paz".</span>`;
  };

  // ----- interfaz -----
  const raiz = document.createElement('div');
  raiz.className = 'ag';
  raiz.innerHTML = `
    <button class="ag-launcher" type="button" aria-label="Abrir el Asistente Galilea" aria-expanded="false">
      <i class="fa-solid fa-comments ag-ico-open"></i><i class="fa-solid fa-xmark ag-ico-close"></i>
    </button>
    <div class="ag-bubble" hidden>¿Tienes preguntas? <strong>¡Escríbeme!</strong></div>
    <section class="ag-panel" role="dialog" aria-label="Asistente Galilea" hidden>
      <div class="ag-head">
        <img src="img/favicon-192.png" alt="">
        <div><strong>Asistente Galilea</strong><span><i class="ag-online"></i> Responde al instante</span></div>
        <button class="ag-close" type="button" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="ag-body" aria-live="polite"></div>
      <div class="ag-chips"></div>
      <form class="ag-form">
        <input type="text" maxlength="300" placeholder="Escribe tu pregunta..." aria-label="Tu pregunta" autocomplete="off">
        <button type="submit" aria-label="Enviar"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </section>`;
  document.body.appendChild(raiz);
  document.body.classList.add('has-ag');

  const launcher = raiz.querySelector('.ag-launcher');
  const panel = raiz.querySelector('.ag-panel');
  const body = raiz.querySelector('.ag-body');
  const chips = raiz.querySelector('.ag-chips');
  const form = raiz.querySelector('.ag-form');
  const input = form.querySelector('input');
  const bubble = raiz.querySelector('.ag-bubble');

  const agregar = (quien, contenido) => {
    const m = document.createElement('div');
    m.className = `ag-msg ag-${quien}`;
    if (quien === 'user') m.textContent = contenido; else m.innerHTML = contenido;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  };
  const preguntar = (texto) => {
    texto = texto.trim();
    if (!texto) return;
    agregar('user', texto);
    const escribiendo = agregar('bot', '<span class="ag-typing"><i></i><i></i><i></i></span>');
    const espera = new Promise(r => setTimeout(r, 450));
    Promise.all([responder(texto), espera]).then(([html]) => {
      escribiendo.innerHTML = html;
      // deja ver el inicio de la respuesta (las lecturas largas no saltan al final)
      body.scrollTop = Math.max(0, escribiendo.offsetTop - 12);
    });
  };
  SUGERENCIAS.forEach(s => {
    const c = document.createElement('button');
    c.type = 'button'; c.textContent = s;
    c.addEventListener('click', () => preguntar(s));
    chips.appendChild(c);
  });

  let iniciado = false;
  const abrir = (abierto) => {
    panel.hidden = !abierto;
    raiz.classList.toggle('open', abierto);
    launcher.setAttribute('aria-expanded', abierto);
    bubble.hidden = true;
    if (abierto && !iniciado) {
      iniciado = true;
      agregar('bot', '¡Hola! Dios te bendiga 🙌 Soy el <strong>Asistente Galilea</strong>. Te ayudo con información de la iglesia, preguntas básicas de fe y la <strong>Biblia</strong>: escribe una cita como <em>"Juan 3:16"</em> o <em>"versículos sobre la paz"</em>. ¿En qué te puedo ayudar?');
    }
    if (abierto && window.matchMedia('(min-width:561px)').matches) input.focus();
  };
  launcher.addEventListener('click', () => abrir(panel.hidden));
  body.addEventListener('click', e => { const r = e.target.closest('.ag-ref'); if (r) preguntar(r.dataset.ref); });
  raiz.querySelector('.ag-close').addEventListener('click', () => abrir(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) abrir(false); });
  form.addEventListener('submit', e => { e.preventDefault(); preguntar(input.value); input.value = ''; });

  // invitación discreta una sola vez por visita
  try {
    if (!sessionStorage.getItem('ag-visto')) {
      setTimeout(() => { if (panel.hidden) bubble.hidden = false; }, 6000);
      sessionStorage.setItem('ag-visto', '1');
    }
  } catch (e) { /* almacenamiento bloqueado: sin invitación */ }
  bubble.addEventListener('click', () => abrir(true));
})();
