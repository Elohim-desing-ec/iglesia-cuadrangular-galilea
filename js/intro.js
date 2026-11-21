// Intro de la página de inicio: pantalla formal con marco, logo, "Bienvenido a casa" y versículo; se queda
// unos segundos y entra sola (o antes, con "Ingresar" / Enter / Esc); al entrar se abre como un telón desde el centro.
// Se muestra una vez por visita (sesión del navegador) y nunca a quien pidió menos movimiento. Va en el <head> para decidirlo antes de que se pinte la página; la animación está en
// css/style.css (.intro). Toda la lógica vive aquí: si este archivo no carga, simplemente no hay intro.
(() => {
  const root = document.documentElement;
  let show = false;
  try {
    show = !sessionStorage.getItem('galilea-intro') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (show) sessionStorage.setItem('galilea-intro', '1');
  } catch (e) { /* sin sessionStorage (modo privado estricto): no hay intro */ }
  if (show) root.classList.add('intro-on');

  document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('intro');
    if (!intro) return;
    if (!root.classList.contains('intro-on')) { intro.remove(); return; }

    // mientras la intro está abierta, el resto de la página no se puede tocar ni recorrer con el teclado
    const page = [...document.body.children].filter(el => el !== intro);
    page.forEach(el => { el.inert = true; });

    const enterBtn = intro.querySelector('[data-intro-enter]');
    let entered = false;
    const enter = () => {
      if (entered) return;
      entered = true;
      page.forEach(el => { el.inert = false; });
      root.classList.add('intro-leaving');
      // js/script.js espera este aviso para animar el título de la portada
      document.dispatchEvent(new Event('galilea:intro-open'));
      setTimeout(() => { root.classList.remove('intro-on', 'intro-leaving'); intro.remove(); }, 1650);
    };
    enterBtn.addEventListener('click', enter);
    // no se queda esperando: entra sola cuando termina la animación (la línea bajo el botón marca el tiempo)
    setTimeout(enter, 5000);
    // con el teclado: Enter o Esc también entran (el botón no se enfoca solo para que no aparezca ya resaltado)
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'Enter') enter(); });
  });
})();
