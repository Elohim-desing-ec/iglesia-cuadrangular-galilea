# Iglesia Cuadrangular Galilea — sitio web

Sitio oficial de la Iglesia Cuadrangular Galilea (Milagro, Guayas, Ecuador): **https://iglesiacuadrangulargalilea.org**

Es una web estática (HTML, CSS y JavaScript, sin frameworks), publicada con **GitHub Pages** desde el repositorio
`Elohim-desing-ec/iglesia-cuadrangular-galilea` (rama `main`). Los formularios guardan en **Supabase**, y las
ofrendas en línea se cobran con **PayPhone**.

---

## Páginas

| Página | Archivo | Qué tiene |
|---|---|---|
| Inicio | `index.html` | Intro de bienvenida, portada con fotos, destacados, anuncios, sobre nosotros, muro de fotos, próximos eventos, testimonios, accesos rápidos |
| Nosotros | `nosotros.html` | Misión, historia, departamentos, pastores y líderes |
| English | `ingles.html` | Información para visitantes en inglés y formulario de contacto |
| Horarios | `horarios.html` | Servicios de la semana y próximos eventos |
| Eventos | `eventos.html` | Próximo evento con cuenta regresiva, anuncios (pósters), agenda, series de prédicas, eventos realizados |
| Ministerios | `ministerios.html` | Todos los ministerios |
| ↳ Jóvenes, Damas, Caballeros, Escuela Bíblica, Células, Alabanza, Misiones | `juventud.html`, `damas.html`, `caballeros.html`, `escuela-biblica.html`, `celulas.html`, `alabanza.html`, `misiones.html` | Página de cada ministerio (estilo editorial oscuro) |
| Grupos | `grupos.html` | Células hogares, damas, caballeros, parejas y escuela bíblica |
| Ubicación | `ubicacion.html` | Templo en el globo 3D, fotos del templo, mapa de las 8 células hogares, ayuda por WhatsApp |
| Prédicas | `predicas.html` | Cuenta regresiva y transmisión en vivo, cultos anteriores (se agregan solos), videos de danza |
| ↳ Testimonios | `testimonios.html` | Muro de testimonios con filtros y formulario para compartir |
| Contacto | `contacto.html` | Datos de contacto, redes, mapa, formulario, preguntas frecuentes |
| Ofrendas | `ofrendas.html` | Ofrenda en línea con PayPhone, cuentas bancarias, impacto |
| Ofrenda confirmada | `ofrenda-confirmada.html` | Página a la que vuelve PayPhone después del pago |
| Privacidad / Términos | `privacidad.html`, `terminos.html` | Páginas legales (LOPDP Ecuador) |
| Error 404 | `404.html` | Página no encontrada |

El menú (arriba) y el pie de página se repiten en todas las páginas: **si agregas una página o un enlace, cámbialo en
los 23 archivos `.html`**.

---

## Carpetas

```
├── *.html                 las páginas (tienen que quedarse en la raíz: son las direcciones de la web)
├── css/
│   ├── style.css          todos los estilos (organizados por bloques con títulos en mayúsculas)
│   └── fonts.css          tipografías Poppins e Inter, servidas desde fonts/
├── js/
│   ├── script.js          todo el comportamiento del sitio (menú, animaciones, formularios, galerías…)
│   ├── intro.js           la intro de bienvenida del inicio
│   ├── payphone.js        la caja de pago de PayPhone (ofrendas)
│   ├── asistente.js       el chat "Asistente Galilea" (respuestas y Biblia, sin IA externa)
│   ├── biblia-bes.json    la Biblia en Español Sencillo (dominio público) que usa el asistente
│   └── globo-puntos.js    el planeta de puntos de Misiones y Ubicación
├── data/predicas.json     lista de cultos del canal de YouTube (se actualiza sola, ver abajo)
├── fotos/                 fotos por sección (portada, carrusel, anuncios, ministerios…; "grande/" = versión ampliada)
├── img/                   logo, íconos de la pestaña, fotos de pastores y portadas
├── fonts/                 archivos de las tipografías
├── supabase/              el SQL de las tablas de la base de datos (referencia; no se publica)
├── .github/               lector del canal de YouTube y su tarea automática
├── _material/             logo original y fotos que la web no usa (no se publica)
├── sitemap.xml, robots.txt, CNAME, favicon.ico
```

---

## Diseño

- **Paleta "Midnight Blue":** casi negro `#02060E` de fondo y azul `#0356C5` para botones, resaltados e íconos. Para
  textos pequeños sobre el fondo oscuro se usan azules claros (`#7fb0ff`, `#b4bfd6`), porque el `#0356C5` casi no se lee
  en letra chica.
- **Cuadros con borde luminoso:** las tarjetas son oscuras al centro y la luz azul sale de los bordes. Al pasar el mouse o
  elegir una se encienden, y las vecinas se apagan un poco.
- **Vidrio acanalado:** los paneles grandes (formularios, video destacado, cuenta regresiva) tienen franjas verticales
  finas sobre luces azules que se mueven despacio.
- **Tipografías:** Poppins (títulos), Inter (texto) y Georgia cursiva para frases destacadas.
- **Animaciones:** títulos que entran palabra por palabra, bloques que aparecen al bajar, íconos "vivos", cursor
  personalizado en computadora. Quien tiene activado "reducir movimiento" en su equipo ve la web sin animaciones.
- **Menú del celular:** opciones grandes con número (01, 02…), líneas que se dibujan al abrir y submenús con una línea azul.

En `css/style.css` los bloques más nuevos están al final y mandan sobre los anteriores: "PALETA MIDNIGHT BLUE",
"EL DISEÑO NUEVO EN TODAS LAS PÁGINAS", "MENÚ DEL CELULAR", "CONTACTO", "PRÉDICAS", "TESTIMONIOS".

---

## Base de datos (Supabase)

Proyecto **Web-Galilea** (`vmujhqeswldmsonoozps`, región us-west-2) en la organización **Elohim-desing-ec's Org**
(plan Pro). La web usa la clave **publicable**, que es pública. Las reglas de seguridad (RLS) hacen que los visitantes
solo puedan hacer lo indicado abajo.

| Tabla | La usa | Qué pueden hacer los visitantes |
|---|---|---|
| `mensajes_contacto` | Formularios de Contacto e Inglés | Solo enviar (nadie de afuera puede leer los mensajes) |
| `testimonios_web` | `testimonios.html` | Enviar y leer los testimonios con `aprobado` marcado |
| `testimonios` | — (antigua, con testimonios de ejemplo) | La web ya no la usa; se puede borrar |

- **Leer los mensajes de contacto:** Supabase → Web-Galilea → Table Editor → `mensajes_contacto`.
- **Testimonios:** se publican **al instante**. Para quitar uno: Table Editor → `testimonios_web` → borrar la fila,
  o desmarcar `aprobado` para ocultarlo sin borrarlo.
- El SQL de las tablas está en `supabase/` (`testimonios.sql` + `testimonios-auto.sql` es lo que está aplicado).

---

## Funciones automáticas

- **Cultos anteriores en Prédicas:** `.github/scripts/predicas.py` lee el feed del canal de YouTube y guarda la lista en
  `data/predicas.json`. La página muestra el último culto en grande y los anteriores en tarjetas, y limpia los títulos
  ("🔴 ¡ESTAMOS EN VIVO! - CULTO DOMINICAL - SANTA CENA" → "Santa Cena"). La tarea `.github/workflows/predicas.yml` lo
  haría sola cada hora (cada 15 minutos los domingos), pero **todavía no está activada** (ver Pendientes).
- **Transmisión en vivo:** la cuenta regresiva apunta al próximo domingo 10:00 AM (hora de Ecuador). Durante el culto
  muestra el reproductor en vivo. Se cambia en `LIVE_SCHEDULE` (`js/script.js`).
- **Eventos y anuncios:** cada tarjeta lleva `data-inicio` y `data-fin`. Cuando la fecha pasa, el evento pasa solo a
  "realizados" y el póster desaparece. Los eventos próximos se publican para Google como datos estructurados.
- **Privacidad:** YouTube y Google Maps solo se cargan si el visitante los permite (aviso de cookies, LOPDP).
- **Seguridad:** cada página (menos las de pago) tiene una política CSP en su `<meta>`. **Si agregas un servicio
  externo nuevo (script, fuente, iframe, conexión), hay que agregarlo a la CSP de todas las páginas o el navegador lo
  bloquea sin avisar.**

---

## Cambios frecuentes

| Quiero… | Dónde |
|---|---|
| Agregar un video de danza | `predicas.html`, sección Danza: copia una línea `<a class="video-card" …>` y cambia el enlace y el título |
| Agregar un evento | `eventos.html`: copia una `.event-card` y cambia fotos, textos, `data-inicio` y `data-fin` |
| Agregar un póster de anuncio | Imagen en `fotos/anuncios/` (nombre sin espacios) y una tarjeta en la sección Anuncios con su `data-fin` |
| Cambiar el horario del culto en vivo | `LIVE_SCHEDULE` en `js/script.js` |
| Cambiar teléfonos, correos o redes | Contacto, Inglés, pie de página (23 páginas) y los datos para Google en `index.html` |
| Agregar una célula al mapa | `ubicacion.html`: copia una `.cell-card` con su `data-lat` y `data-lng` |
| Cambiar respuestas del asistente | `DATOS` y `TEMAS` en `js/asistente.js` |
| Cambiar la cuenta de PayPhone | `js/payphone.js` (el token se pega desde el editor web de GitHub) |

Después de cambiar `css/style.css` o `js/script.js`, sube el número de versión (`style.css?v=…`, `script.js?v=…`) en
todas las páginas. Así los visitantes no se quedan con la versión vieja guardada en su navegador.

---

## Publicar

1. Probar en la computadora: en VS Code, **Go Live** (o `python3 -m http.server 8080`) y abrir `http://localhost:8080`.
   No abras los `.html` con doble clic: así no carga la lista de cultos.
2. Copiar **solo los archivos cambiados** a una copia del repositorio, hacer commit y push a `main`.
   Nunca subir `_material/` ni `supabase/`, ni carpetas de fotos originales sin comprimir (los pósters nuevos van
   comprimidos a `fotos/anuncios/`).
3. GitHub Pages publica en uno o dos minutos. Si alguien ve la versión vieja, que recargue la página.

---

## Pendientes

- **Activar la actualización automática de Prédicas:** la cuenta de GitHub necesita el permiso `workflow`
  (`gh auth refresh -h github.com -s workflow`). Después hay que subir `.github/workflows/predicas.yml`. Mientras
  tanto, `data/predicas.json` solo se actualiza a mano, ejecutando `.github/scripts/predicas.py`.
- **Boletín:** el formulario "Suscríbete a nuestro boletín" todavía es de muestra y no guarda los correos.
- **Tabla `testimonios` antigua:** se puede borrar en Supabase; la web usa `testimonios_web`.
- **Fotos sin uso:** las de `_material/imagenes-sin-uso/` siguen subidas en GitHub. Se pueden borrar del repositorio si
  ya no se necesitan.
