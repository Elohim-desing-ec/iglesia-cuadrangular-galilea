// Ofrenda en línea con PayPhone (ofrendas.html + ofrenda-confirmada.html).
// Credenciales: en developer.payphone.app crea una aplicación tipo WEB con el dominio
// iglesiacuadrangulargalilea.org y la URL de respuesta https://iglesiacuadrangulargalilea.org/ofrenda-confirmada.html
// PayPhone solo acepta la cajita desde ese dominio (y http://localhost para pruebas).
const PAYPHONE = {
  token: 'diOebl89CSkdrF_LDCp40a-q_aIkl-7i7FvFM7S6iXcratDHE8v9B7HBJx4kCV5rEAGBRyMP53SHlnESakJlpqFRkDCXtF7VWzCkqCFvgJ37KEEGPwNlNIm3xF12TX6iUjY6rZy_cLMhiuEuC3aUzKeb6YBpLmRKqrpRTNYe251KFdwFdr0azN7fBtePtHjuFAHwuyWgX0t_o6sbwT4smNTr3tbfODpxyhsI2siMa7jfC6h0VJdvaoEVt3qT2a9dW15ZHj9K2zI5yZgIk8BXeWcWYyUYiC9vvtx2W43sOvtth2kl-uMt-zdqhaMHmSdxVyoMkw',    // TOKEN de la aplicación WEB
  storeId: '2bae50675ca0492f8e6a74a247b4f907'   // STOREID de la tienda
};
const PP_READY = Boolean(PAYPHONE.token && PAYPHONE.storeId);
const PP_CDN = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box';
const PP_CONFIRM = 'https://paymentbox.payphonetodoesposible.com/api/confirm';
const money = cents => '$' + (cents / 100).toFixed(2);

// ----- ofrendas.html: elegir tipo y monto, abrir la cajita -----
const ppGive = document.getElementById('ppGive');
if (ppGive) {
  const custom = document.getElementById('ppCustom');
  const customInput = document.getElementById('ppCustomInput');
  const goBtn = document.getElementById('ppGo');
  const goText = document.getElementById('ppGoText');
  const modal = document.getElementById('ppModal');
  const box = document.getElementById('pp-button');
  const boxLoading = box.innerHTML;

  const tipo = () => ppGive.querySelector('input[name="ppTipo"]:checked').value;
  // monto elegido en centavos (PayPhone trabaja en centavos enteros); 0 si no es válido
  const amount = () => {
    const pick = ppGive.querySelector('input[name="ppMonto"]:checked').value;
    const usd = pick === 'otro' ? parseFloat(customInput.value) : Number(pick);
    return usd >= 1 && usd <= 1000 ? Math.round(usd * 100) : 0;
  };
  const refresh = () => {
    custom.hidden = ppGive.querySelector('input[name="ppMonto"]:checked').value !== 'otro';
    const cents = amount();
    goText.textContent = cents ? `Dar ${money(cents)} · ${tipo()}` : 'Escribe un monto entre $1 y $1000';
    goBtn.disabled = !cents || !PP_READY;
  };
  ppGive.addEventListener('change', e => {
    refresh();
    if (e.target.value === 'otro') customInput.focus();
  });
  customInput.addEventListener('input', refresh);

  if (!PP_READY) {
    document.getElementById('ppNote').innerHTML =
      '<i class="fa-solid fa-hourglass-half"></i> La ofrenda en línea estará disponible muy pronto. Mientras tanto puedes usar transferencia.';
  }
  refresh();

  let assets = null;
  const loadAssets = () => assets || (assets = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = PP_CDN + '.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = PP_CDN + '.js';
    js.onload = resolve;
    js.onerror = () => { assets = null; reject(); };
    document.head.appendChild(js);
  }));

  const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
  modal.querySelectorAll('[data-pp-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });

  goBtn.addEventListener('click', async () => {
    const cents = amount();
    if (!cents || !PP_READY) return;
    document.getElementById('ppSumTipo').textContent = tipo();
    document.getElementById('ppSumMonto').textContent = money(cents);
    box.innerHTML = boxLoading;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    try {
      await loadAssets();
    } catch {
      box.innerHTML = '<p class="pp-error">No pudimos cargar PayPhone. Revisa tu conexión e intenta de nuevo.</p>';
      return;
    }
    box.innerHTML = '';
    // ofrendas y diezmos no llevan IVA: todo el monto va en amountWithoutTax
    new PPaymentButtonBox({
      token: PAYPHONE.token,
      storeId: PAYPHONE.storeId,
      clientTransactionId: 'OFR-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      amount: cents,
      amountWithoutTax: cents,
      amountWithTax: 0,
      tax: 0,
      service: 0,
      tip: 0,
      currency: 'USD',
      reference: `${tipo()} - Iglesia Cuadrangular Galilea`,
      lang: 'es',
      defaultMethod: 'card',
      timeZone: -5
    }).render('pp-button');
  });
}

// ----- ofrenda-confirmada.html: confirmar la transacción y mostrar el comprobante -----
// PayPhone revierte el pago si no se confirma en 5 minutos, por eso se confirma apenas carga la página.
const ppResult = document.getElementById('ppResult');
if (ppResult) {
  const q = new URLSearchParams(location.search);
  const id = Number(q.get('id'));
  const clientTxId = q.get('clientTransactionId') || '';
  const part = name => ppResult.querySelector(`[data-pp="${name}"]`);
  const icons = {ok: 'fa-solid fa-circle-check', fail: 'fa-solid fa-circle-xmark'};

  const show = (state, title, text, rows) => {
    ppResult.dataset.state = state;
    ppResult.querySelector('.pp-result-icon i').className = icons[state] || icons.fail;
    part('title').textContent = title;
    part('text').textContent = text;
    if (rows) {
      const dl = part('receipt');
      dl.innerHTML = '';
      rows.filter(([, v]) => v).forEach(([k, v]) => {
        const dt = document.createElement('dt'); dt.textContent = k;
        const dd = document.createElement('dd'); dd.textContent = v;
        dl.append(dt, dd);
      });
      dl.hidden = false;
    }
    if (state === 'ok') part('again').innerHTML = '<i class="fa-solid fa-heart"></i> Dar otra ofrenda';
  };

  const render = r => {
    if (r.statusCode === 3) {
      show('ok', '¡Gracias por tu ofrenda!', 'Tu aporte fue recibido. Que Dios multiplique tu siembra. — 2 Corintios 9:10', [
        ['Monto', money(r.amount)],
        ['Concepto', (r.reference || '').split(' - ')[0]],
        ['Autorización', r.authorizationCode],
        ['Transacción', String(r.transactionId || id)],
        ['Tarjeta', r.cardBrand && r.lastDigits ? `${r.cardBrand} •••• ${r.lastDigits}` : ''],
        ['Fecha', r.date ? new Date(r.date).toLocaleString('es-EC') : '']
      ]);
    } else {
      show('fail', 'El pago no se completó', r.message || 'La transacción fue cancelada o rechazada. No se realizó ningún cobro. Puedes intentarlo de nuevo.');
    }
  };

  const cacheKey = 'pp-' + id;
  let cached = null;
  try { cached = JSON.parse(sessionStorage.getItem(cacheKey)); } catch {}

  if (!id) {
    show('fail', 'No encontramos un pago', 'Esta página se abre automáticamente después de ofrendar en línea.');
  } else if (cached) {
    render(cached);
  } else if (!PP_READY) {
    show('fail', 'Pago no configurado', 'La ofrenda en línea aún no está activada.');
  } else {
    fetch(PP_CONFIRM, {
      method: 'POST',
      headers: {'Authorization': `Bearer ${PAYPHONE.token}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({id, clientTxId})
    })
      .then(res => res.json())
      .then(r => {
        if (r.statusCode === 3) { try { sessionStorage.setItem(cacheKey, JSON.stringify(r)); } catch {} }
        render(r);
      })
      .catch(() => show('fail', 'No pudimos confirmar tu pago',
        'Si se realizó un cobro, escríbenos por WhatsApp con el número de transacción: ' + id));
  }
}
