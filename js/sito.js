/* La Parola Giusta — comportamenti comuni a tutte le pagine.
   Tutto e' facoltativo: senza questo script le pagine restano leggibili e complete.
   Nessun dato viene raccolto o inviato. */
(function () {
  'use strict';
  var d = document, h = d.documentElement;
  var fermo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pulizie = [];

  function tutti(sel, da) { return Array.prototype.slice.call((da || d).querySelectorAll(sel)); }
  function ascolta(el, tipo, fn, opz) { el.addEventListener(tipo, fn, opz); pulizie.push(function () { el.removeEventListener(tipo, fn, opz); }); }

  /* ---- menu a tutto schermo (telefono e tablet) ---- */
  function menu() {
    var nav = d.querySelector('.nav'), dentro = nav && nav.querySelector('.nav-in');
    if (!dentro || d.querySelector('.nav-apri')) return;
    var voci = [], visti = {};
    function aggiungi(testo, href) {
      var k = href.replace(/^index\.html/, './');
      if (visti[k] || visti[testo.toLowerCase()]) return;
      visti[k] = visti[testo.toLowerCase()] = 1; voci.push([testo, href]);
    }
    tutti('.nav-sezioni a, .nav-menu a:not(.nav-btn)', nav).forEach(function (a) { aggiungi(a.textContent.trim(), a.getAttribute('href')); });
    var inHome = d.body.classList.contains('p-home');
    var R = h.getAttribute('data-radice') || '', casa = R || './';
    [['Home', casa], ['Corsi', inHome ? '#corsi' : casa + '#corsi'], ['Libri', R + 'achillepagliaro.html'], ['Ebook', inHome ? '#ebook' : casa + '#ebook'],
     ['Taccuino', R + 'blog/'], ['Ebook gratuiti', R + 'cosa-dire.html'], ['Contatti', R + 'contatti.html']].forEach(function (v) {
      if (inHome && v[0] === 'Home') return;
      aggiungi(v[0], v[1]);
    });
    var bottone = d.createElement('button');
    bottone.type = 'button'; bottone.className = 'nav-apri';
    bottone.setAttribute('aria-expanded', 'false'); bottone.setAttribute('aria-controls', 'menu');
    bottone.setAttribute('aria-label', 'Apri il menu');
    bottone.innerHTML = '<i></i><i></i><i></i>';
    dentro.appendChild(bottone);

    var pannello = d.createElement('div');
    pannello.className = 'menu'; pannello.id = 'menu';
    pannello.setAttribute('aria-label', 'Menu'); pannello.setAttribute('role', 'dialog');
    var html = '<div class="cielo" aria-hidden="true"><i></i><i></i></div><ol>';
    voci.forEach(function (v, i) { html += '<li style="--i:' + i + '"><a href="' + v[1] + '">' + v[0] + '</a></li>'; });
    html += '</ol>';
    var cta = nav.querySelector('.nav-btn');
    if (cta) html += '<a class="btn btn-oro" href="' + cta.getAttribute('href') + '">' + cta.textContent.trim() + '</a>';
    html += '<div class="menu-piede"><a href="https://corsi.laparolagiusta.it/login">Accedi ai corsi</a><a href="' + R + 'metodo-e-fonti.html">Metodo e fonti</a><a href="mailto:info@laparolagiusta.it">info@laparolagiusta.it</a></div>';
    pannello.innerHTML = html;
    pannello.style.position = 'fixed';
    d.body.appendChild(pannello);

    function apri(si) {
      h.classList.toggle('menu-aperto', si);
      bottone.setAttribute('aria-expanded', si ? 'true' : 'false');
      bottone.setAttribute('aria-label', si ? 'Chiudi il menu' : 'Apri il menu');
      if (si) { var primo = pannello.querySelector('a'); if (primo) setTimeout(function () { primo.focus({ preventScroll: true }); }, 350); }
    }
    ascolta(bottone, 'click', function () { apri(!h.classList.contains('menu-aperto')); });
    ascolta(pannello, 'click', function (e) { if (e.target.closest('a')) apri(false); });
    ascolta(d, 'keydown', function (e) { if (e.key === 'Escape' && h.classList.contains('menu-aperto')) { apri(false); bottone.focus(); } });
    ascolta(window, 'resize', function () { if (window.innerWidth > 900 && h.classList.contains('menu-aperto')) apri(false); });
    pulizie.push(function () { h.classList.remove('menu-aperto'); bottone.remove(); pannello.remove(); });
  }

  /* ---- filo di lettura sotto il menu ---- */
  function lettura() {
    var nav = d.querySelector('.nav'); if (!nav) return;
    var inAttesa = false;
    function aggiorna() {
      inAttesa = false;
      var tot = h.scrollHeight - window.innerHeight;
      nav.style.setProperty('--letto', tot > 0 ? Math.min(1, window.scrollY / tot).toFixed(4) : 0);
    }
    ascolta(window, 'scroll', function () { if (!inAttesa) { inAttesa = true; requestAnimationFrame(aggiorna); } }, { passive: true });
    aggiorna();
  }

  /* ---- comparsa degli elementi allo scorrimento ---- */
  var DA_MOSTRARE = 'section h2, section .etichetta, section .intro, .scena > *, .etica > *, .elenco li, .griglia > *, .passi > *, .passi-chiari > *, .cap, .estratto, ' +
    '.profili > *, .formati > *, .collana, .gruppi > *, .frasi > *, .giorni > *, .scheda-acquisto, .acquisto > *, details, .pull, .citazione, .bio > *, .valori > *, ' +
    '.corsi > *, .griglia-3 > *, .scaffale, .omaggio-in > *, .bc > *, .consiglio > *, .secondo > *, .anteprima, .anteprima-video, .news > *, .modulo-nl, ' +
    '.fondo-griglia > *, .fondo-scritta, main > .wrap > h2, main > .wrap > .riquadro, .chiusura p, .chiusura .btn, ' +
    '.cost, .quadrante, .rotte > li, .volto-cerchio, .volto-detto, .post-primo, .post-lista > *, .calendario, .dal-taccuino > *, .articolo-coda > *';
  function comparse() {
    if (d.body.classList.contains('p-autore')) return;   // la pagina autore ha le sue
    var els = tutti(DA_MOSTRARE).filter(function (e) { return !e.closest('.hero') && !e.closest('.menu') && !e.closest('[hidden]') && !e.classList.contains('r'); });
    if (fermo || !('IntersectionObserver' in window)) return;
    var alto = window.innerHeight;
    els.forEach(function (e) {
      var fratelli = e.parentNode ? Array.prototype.indexOf.call(e.parentNode.children, e) : 0;
      e.style.setProperty('--d', (Math.min(fratelli, 5) * 0.08).toFixed(2) + 's');
      var q = e.getBoundingClientRect();
      e.classList.add('r');
      if (q.top < alto * 0.92 && q.bottom > 0) e.classList.add('visto');   // gia' a schermo: nessun lampo
    });
    var oss = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) { if (v.isIntersecting) { v.target.classList.add('visto'); oss.unobserve(v.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (e) { if (!e.classList.contains('visto')) oss.observe(e); });
    pulizie.push(function () { oss.disconnect(); });
    // rete di sicurezza: se qualcosa resta nascosto (stampa, strumenti di lettura), lo mostra
    ascolta(window, 'beforeprint', function () { els.forEach(function (e) { e.classList.add('visto'); }); });
  }

  /* ---- il titolo d'apertura entra parola per parola ---- */
  function titolo() {
    if (fermo || d.body.classList.contains('p-autore')) return;
    var t = d.querySelector('.hero h1'); if (!t || t.classList.contains('parole')) return;
    var i = 0;
    (function spezza(nodo) {
      Array.prototype.slice.call(nodo.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var pezzi = n.textContent.split(/(\s+)/), fr = d.createDocumentFragment();
          pezzi.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { fr.appendChild(d.createTextNode(' ')); return; }
            var s = d.createElement('span'); s.className = 'pw'; s.style.setProperty('--i', i++); s.textContent = p; fr.appendChild(s);
          });
          nodo.replaceChild(fr, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') spezza(n);
      });
    })(t);
    t.setAttribute('aria-label', t.textContent.replace(/\s+/g, ' ').trim());
    t.classList.add('parole');
  }

  /* ---- il libro in apertura segue il puntatore; la lanterna segue il cursore ---- */
  function apertura() {
    var hero = d.querySelector('.hero.notte, .testata-notte'); if (!hero || fermo) return;
    var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches; if (!fine) return;
    var libro = hero.querySelector('.cop'), luce = d.createElement('span');
    luce.className = 'lanterna'; luce.setAttribute('aria-hidden', 'true'); hero.appendChild(luce);
    var inAttesa = false, x = 0, y = 0;
    ascolta(hero, 'pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      if (inAttesa) return; inAttesa = true;
      requestAnimationFrame(function () {
        inAttesa = false;
        var q = hero.getBoundingClientRect();
        luce.style.setProperty('--lx', (x - q.left) + 'px'); luce.style.setProperty('--ly', (y - q.top) + 'px');
        if (libro && !d.body.classList.contains('p-corso')) {
          var px = (x - q.left) / q.width - 0.5, py = (y - q.top) / q.height - 0.5;
          libro.style.setProperty('--ry', (-24 + px * 26).toFixed(1) + 'deg');
          libro.style.setProperty('--rx', (4 - py * 12).toFixed(1) + 'deg');
        }
      });
    });
    ascolta(hero, 'pointerleave', function () { if (libro) { libro.style.removeProperty('--ry'); libro.style.removeProperty('--rx'); } });
    pulizie.push(function () { luce.remove(); });
  }

  /* ---- i numeri della fascia contano fino al loro valore ---- */
  function conta() {
    if (fermo) return;
    tutti('.fascia b').forEach(function (b) {
      var m = /^(\d+)$/.exec(b.textContent.trim()); if (!m) return;
      var fine = +m[1], t0 = null;
      b.textContent = '0';
      setTimeout(function () {
        requestAnimationFrame(function passo(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
          b.textContent = Math.round(fine * e);
          if (p < 1) requestAnimationFrame(passo);
        });
      }, 700);
    });
  }

  /* ---- barra d'acquisto su telefono, per schede ebook e corsi ---- */
  function barra() {
    var b = d.body; if (!(b.classList.contains('p-ebook') || b.classList.contains('p-corso'))) return;
    var hero = d.querySelector('.hero'); if (!hero) return;
    var prezzo = hero.querySelector('.prezzo'), azione = hero.querySelector('.hero-azioni a.btn'), t = hero.querySelector('h1');
    if (!prezzo || !azione || !t || !('IntersectionObserver' in window)) return;
    var el = d.createElement('div'); el.className = 'barra'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Acquisto');
    var costo = prezzo.cloneNode(true); tutti('s', costo).forEach(function (s) { s.remove(); });
    el.innerHTML = '<span class="barra-titolo"></span><span class="barra-prezzo"></span><a></a>';
    el.children[0].textContent = (t.getAttribute('aria-label') || t.textContent).trim();
    el.children[1].textContent = costo.textContent.trim();
    el.children[2].textContent = b.classList.contains('p-corso') ? 'Inizia' : 'Acquista';
    el.children[2].setAttribute('href', azione.getAttribute('href'));
    d.body.appendChild(el);
    var fuoriApertura = false, inAcquisto = false, inFondo = false;
    function aggiorna() { el.classList.toggle('su', fuoriApertura && !inAcquisto && !inFondo); }
    var o1 = new IntersectionObserver(function (v) { fuoriApertura = !v[0].isIntersecting; aggiorna(); });
    o1.observe(hero);
    var meta = d.querySelector('#formati, #acquista'), piede = d.querySelector('footer');
    var o2 = new IntersectionObserver(function (v) { v.forEach(function (x) { if (x.target === piede) inFondo = x.isIntersecting; else inAcquisto = x.isIntersecting; }); aggiorna(); });
    if (meta) o2.observe(meta); if (piede) o2.observe(piede);
    pulizie.push(function () { o1.disconnect(); o2.disconnect(); el.remove(); });
  }

  /* ================= sezioni interattive ================= */
  function crea(tag, classe, html) { var e = d.createElement(tag); if (classe) e.className = classe; if (html != null) e.innerHTML = html; return e; }
  // schede a scelta singola con frecce da tastiera; restituisce la funzione "scegli"
  function schede(bottoni, alCambio) {
    var attivo = -1;
    function scegli(i, fuoco) {
      i = (i + bottoni.length) % bottoni.length; if (i === attivo) return;
      attivo = i;
      bottoni.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; b.classList.toggle('attivo', k === i); });
      if (fuoco) bottoni[i].focus({ preventScroll: true });
      alCambio(i);
    }
    bottoni.forEach(function (b, k) {
      b.setAttribute('role', 'tab');
      ascolta(b, 'click', function () { scegli(k); });
      ascolta(b, 'keydown', function (e) {
        var t = e.key, n = null;
        if (t === 'ArrowRight' || t === 'ArrowDown') n = attivo + 1; else if (t === 'ArrowLeft' || t === 'ArrowUp') n = attivo - 1;
        else if (t === 'Home') n = 0; else if (t === 'End') n = bottoni.length - 1;
        if (n !== null) { e.preventDefault(); scegli(n, true); }
      });
    });
    return { scegli: scegli, quale: function () { return attivo; } };
  }
  // giro automatico finche' nessuno tocca, e solo mentre la sezione e' a schermo
  function giro(dove, ogni, passo) {
    if (fermo || !('IntersectionObserver' in window)) return function () {};
    var t = null, aSchermo = false, toccato = false;
    function parti() { if (!t && aSchermo && !toccato) t = setInterval(passo, ogni); }
    function ferma() { if (t) { clearInterval(t); t = null; } }
    var o = new IntersectionObserver(function (v) { aSchermo = v[0].isIntersecting; if (aSchermo) parti(); else ferma(); }, { threshold: 0.35 });
    o.observe(dove);
    function basta() { toccato = true; ferma(); }
    ['pointerdown', 'keydown', 'focusin'].forEach(function (ev) { ascolta(dove, ev, basta); });
    pulizie.push(function () { ferma(); o.disconnect(); });
    return basta;
  }

  /* ---- schede ebook: i sei argomenti diventano una costellazione ---- */
  function costellazione() {
    var g = d.querySelector('.p-ebook .griglia'); if (!g || g.dataset.viva) return;
    var blocchi = tutti('.blocco', g); if (blocchi.length < 4 || blocchi.length > 8) return;
    var sez = g.closest('section'); if (!sez) return;
    // ogni libro ha la sua costellazione: la forma nasce dal titolo
    var seme = 0, titolo = (d.querySelector('h1') || {}).textContent || 'x';
    for (var k = 0; k < titolo.length; k++) seme = (seme * 31 + titolo.charCodeAt(k)) >>> 0;
    function caso() { seme = (seme * 1664525 + 1013904223) >>> 0; return seme / 4294967296; }
    var n = blocchi.length, punti = [], su = caso() > 0.5;
    for (var i = 0; i < n; i++) {
      var x = 8 + (84 * i) / (n - 1) + (caso() - 0.5) * 5;
      var y = (su ? 30 : 70) + (caso() - 0.5) * 30; su = !su;
      punti.push([Math.max(6, Math.min(94, x)), Math.max(16, Math.min(84, y))]);
    }
    var cost = crea('div', 'cost');
    var cielo = crea('div', 'cost-cielo', '<svg aria-hidden="true"><polyline class="cost-linea"/><polyline class="cost-fatta" pathLength="1"/></svg>');
    cielo.setAttribute('role', 'tablist'); cielo.setAttribute('aria-label', 'Gli argomenti del libro');
    var testo = crea('div', 'cost-testo'); testo.setAttribute('role', 'tabpanel'); testo.setAttribute('aria-live', 'polite'); testo.id = 'cost-testo';
    var bottoni = blocchi.map(function (b, i) {
      var t = b.querySelector('h3'), bt = crea('button', 'stella' + (punti[i][1] < 50 ? ' sotto' : ' sopra'), '<i></i><span>' + (t ? t.innerHTML : i + 1) + '</span>');
      bt.type = 'button'; bt.style.left = punti[i][0] + '%'; bt.style.top = punti[i][1] + '%'; bt.setAttribute('aria-controls', 'cost-testo');
      cielo.appendChild(bt); return bt;
    });
    var fatta = cielo.querySelector('.cost-fatta');
    var lung = [0], svg = cielo.querySelector('svg'), tratto = cielo.querySelector('.cost-linea');
    // la linea si disegna nelle misure vere del riquadro, e si ridisegna se cambia
    function disponi() {
      var W = cielo.clientWidth, H = cielo.clientHeight; if (!W || !H) return;
      var px = punti.map(function (p) { return [p[0] * W / 100, p[1] * H / 100]; });
      var pt = px.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); tratto.setAttribute('points', pt); fatta.setAttribute('points', pt);
      lung = [0]; for (var j = 1; j < n; j++) lung.push(lung[j - 1] + Math.hypot(px[j][0] - px[j - 1][0], px[j][1] - px[j - 1][1]));
      if (s) fatta.style.strokeDashoffset = (1 - lung[s.quale()] / lung[n - 1]).toFixed(4);
    }
    var s = null;
    s = schede(bottoni, function (i) {
      var b = blocchi[i];
      testo.innerHTML = '<div class="cost-n">' + (i + 1) + ' <span>di ' + n + '</span></div><h3>' + (b.querySelector('h3') || b).innerHTML + '</h3>' + tutti('p', b).map(function (p) { return '<p>' + p.innerHTML + '</p>'; }).join('');
      if (lung.length === n) fatta.style.strokeDashoffset = (1 - lung[i] / lung[n - 1]).toFixed(4);
      bottoni.forEach(function (x, k) { x.classList.toggle('passata', k < i); });
    });
    var frecce = crea('div', 'cost-frecce', '<button type="button" aria-label="Argomento precedente">←</button><button type="button" aria-label="Argomento successivo">→</button>');
    ascolta(frecce.children[0], 'click', function () { s.scegli(s.quale() - 1); });
    ascolta(frecce.children[1], 'click', function () { s.scegli(s.quale() + 1); });
    cost.appendChild(cielo); cost.appendChild(testo); cost.appendChild(frecce);
    g.parentNode.insertBefore(cost, g); g.hidden = true; g.dataset.viva = '1';
    disponi(); ascolta(window, 'resize', disponi);
    var eraNotte = sez.classList.contains('notte');
    if (!eraNotte) { sez.classList.add('notte', 'cost-sez'); sez.classList.remove('tinta'); sez.insertBefore(crea('div', 'cielo', '<i></i><i></i>'), sez.firstChild); sez.firstChild.setAttribute('aria-hidden', 'true'); }
    s.scegli(0);
    giro(cost, 5200, function () { s.scegli(s.quale() + 1); });
    pulizie.push(function () { cost.remove(); g.hidden = false; delete g.dataset.viva; if (!eraNotte) { sez.classList.remove('notte', 'cost-sez'); var c = sez.querySelector(':scope > .cielo'); if (c) c.remove(); } });
  }

  /* ---- schede ebook: l'indice si accende mentre lo scorri ---- */
  function indice() {
    var ind = d.querySelector('.p-ebook .indice'); if (!ind) return;
    var capi = tutti('.cap', ind); if (!capi.length) return;
    ind.classList.add('filo-indice');
    var inAttesa = false;
    function aggiorna() {
      inAttesa = false;
      var q = ind.getBoundingClientRect(), soglia = window.innerHeight * 0.62;
      ind.style.setProperty('--filo', Math.max(0, Math.min(1, (soglia - q.top) / q.height)).toFixed(3));
      capi.forEach(function (c) { c.classList.toggle('passato', c.getBoundingClientRect().top < soglia); });
    }
    ascolta(window, 'scroll', function () { if (!inAttesa) { inAttesa = true; requestAnimationFrame(aggiorna); } }, { passive: true });
    aggiorna();
    pulizie.push(function () { ind.classList.remove('filo-indice'); capi.forEach(function (c) { c.classList.remove('passato'); }); });
  }

  /* ---- home: la bussola ("da dove cominci") ---- */
  function bussola() {
    var b = d.querySelector('.bussola'); if (!b || b.classList.contains('viva')) return;
    var voci = tutti('.rotte > li', b); if (voci.length < 3) return;
    var n = voci.length, tacche = '';
    for (var i = 0; i < 72; i++) tacche += '<line x1="100" y1="' + (i % 9 === 0 ? 9 : 13) + '" x2="100" y2="18" transform="rotate(' + i * 5 + ' 100 100)"/>';
    var quadrante = crea('div', 'quadrante', '<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="q-anello" cx="100" cy="100" r="96"/><circle class="q-anello2" cx="100" cy="100" r="74"/><g class="q-tacche">' + tacche + '</g>' +
      '<path class="q-rosa" d="M100 34 L107 93 L166 100 L107 107 L100 166 L93 107 L34 100 L93 93Z"/><g class="q-ago"><path d="M100 22 L108 100 L100 112 L92 100Z"/><path class="q-coda" d="M100 178 L106 100 L100 92 L94 100Z"/></g><circle class="q-perno" cx="100" cy="100" r="5"/></svg>');
    var ago = quadrante.querySelector('.q-ago'), giri = 0, prima = 0;
    var punti = voci.map(function (li, i) {
      var p = crea('button', 'q-punto', '<span>' + (i + 1) + '</span>'); p.type = 'button'; p.tabIndex = -1; p.setAttribute('aria-hidden', 'true');
      var a = (i / n) * 2 * Math.PI; p.style.left = (50 + 46 * Math.sin(a)) + '%'; p.style.top = (50 - 46 * Math.cos(a)) + '%';
      quadrante.appendChild(p); return p;
    });
    var bottoni = voci.map(function (li, i) {
      var bis = li.querySelector('.rotta-bisogno'), bt = crea('button', 'rotta-scelta', '<b>' + (i + 1) + '</b><span>' + bis.innerHTML + '</span>');
      bt.type = 'button'; li.insertBefore(bt, li.firstChild); bis.hidden = true; return bt;
    });
    b.querySelector('.rotte').setAttribute('role', 'tablist');
    var s = schede(bottoni, function (i) {
      voci.forEach(function (li, k) { li.classList.toggle('aperta', k === i); });
      punti.forEach(function (p, k) { p.classList.toggle('attivo', k === i); });
      // l'ago prende sempre la strada piu' corta
      var passo = ((i - prima) % n + n) % n; if (passo > n / 2) passo -= n;
      giri += passo; prima = i;
      ago.style.transform = 'rotate(' + (giri * 360 / n) + 'deg)';
    });
    punti.forEach(function (p, k) { ascolta(p, 'click', function () { s.scegli(k); }); });
    b.insertBefore(quadrante, b.firstChild); b.classList.add('viva');
    s.scegli(0);
    giro(b, 4200, function () { s.scegli(s.quale() + 1); });
    pulizie.push(function () { quadrante.remove(); b.classList.remove('viva'); bottoni.forEach(function (x) { x.remove(); }); voci.forEach(function (li) { li.classList.remove('aperta'); li.querySelector('.rotta-bisogno').hidden = false; }); });
  }

  /* ---- il volto: sette emozioni disegnate su un viso che cambia ---- */
  //            sopracciglia: interno, esterno, arco, vicinanza | occhi: sopra, sotto | bocca: xs, ys, xd, yd, labbro su, labbro giu | rughe: occhi, naso, guance, angolo
  var VOLTI = {
    neutro:    [88, 90, 83, 86, 7, 4.5, 80, 158, 120, 158, 157, 160, 0, 0, 0, 0],
    gioia:     [87, 89, 82, 86, 5.5, 2.4, 73, 151, 127, 151, 162, 177, 1, 0, 1, 0],
    tristezza: [79, 93, 87, 87, 5, 4.5, 82, 164, 118, 164, 154, 157, 0, 0, 0, 0],
    rabbia:    [97, 87, 91, 90, 5.2, 3.6, 84, 159, 116, 159, 157, 160.5, 0, .35, 0, 0],
    paura:     [78, 83, 77, 89, 10.5, 5, 74, 160, 126, 160, 157, 167, 0, 0, 0, 0],
    sorpresa:  [78, 81, 67, 85, 11, 5.5, 88, 163, 112, 163, 150, 183, 0, 0, 0, 0],
    disgusto:  [94, 89, 89, 88, 4.4, 3, 82, 161, 118, 161, 147, 163, 0, 1, .5, 0],
    disprezzo: [88, 90, 83, 86, 6, 4.2, 81, 159, 124, 151, 156.5, 159, 0, 0, 0, 1]
  };
  function volto() {
    var v = d.querySelector('.volto'); if (!v || v.classList.contains('viva')) return;
    var voci = tutti('.emozioni > li', v); if (!voci.length) return;
    var NS = 'http://www.w3.org/2000/svg';
    var scena = crea('div', 'volto-scena');
    scena.innerHTML = '<svg class="viso" viewBox="0 0 200 240" role="img" aria-label="Un volto disegnato che cambia espressione">' +
      '<path class="v-testa" d="M100 24c38 0 62 30 62 78 0 22-6 44-18 62-12 19-27 38-44 38s-32-19-44-38c-12-18-18-40-18-62 0-48 24-78 62-78Z"/>' +
      '<path class="v-naso" d="M100 104 L95.5 132 Q100 137 105.5 133"/>' +
      '<g class="v-rughe-naso"><path d="M92 104 L96 110"/><path d="M108 104 L104 110"/><path d="M90 111 L95 115"/><path d="M110 111 L105 115"/></g>' +
      '<g class="v-zampe"><path d="M51 101 L44 97"/><path d="M50 106 L42 106"/><path d="M51 111 L44 115"/><path d="M149 101 L156 97"/><path d="M150 106 L158 106"/><path d="M149 111 L156 115"/></g>' +
      '<g class="v-guance"><path d="M68 132 Q62 142 68 152"/><path d="M132 132 Q138 142 132 152"/></g>' +
      '<path class="v-angolo" d="M127 147 Q131 151 128 156"/>' +
      '<path class="v-ciglio" data-f="cs"/><path class="v-ciglio" data-f="cd"/>' +
      '<path class="v-occhio" data-f="os"/><path class="v-occhio" data-f="od"/><circle class="v-iride" data-f="is" r="4.2"/><circle class="v-iride" data-f="id" r="4.2"/>' +
      '<path class="v-bocca" data-f="b"/></svg>';
    var f = {}; tutti('[data-f]', scena).forEach(function (e) { f[e.getAttribute('data-f')] = e; });
    var rN = scena.querySelector('.v-rughe-naso'), rZ = scena.querySelector('.v-zampe'), rG = scena.querySelector('.v-guance'), rA = scena.querySelector('.v-angolo');
    function disegna(p) {
      var q = function (x) { return x.toFixed(2); };
      f.cs.setAttribute('d', 'M' + q(p[3]) + ' ' + q(p[0]) + ' Q' + q(72) + ' ' + q(p[2]) + ' 57 ' + q(p[1]));
      f.cd.setAttribute('d', 'M' + q(200 - p[3]) + ' ' + q(p[0]) + ' Q' + q(128) + ' ' + q(p[2]) + ' 143 ' + q(p[1]));
      [['os', 74], ['od', 126]].forEach(function (o) {
        var cx = o[1];
        f[o[0]].setAttribute('d', 'M' + (cx - 14) + ' 106 Q' + cx + ' ' + q(106 - p[4] * 1.9) + ' ' + (cx + 14) + ' 106 Q' + cx + ' ' + q(106 + p[5] * 1.9) + ' ' + (cx - 14) + ' 106Z');
      });
      var r = Math.min(4.2, (p[4] + p[5]) * 0.46);
      f.is.setAttribute('cx', 74); f.is.setAttribute('cy', q(106 + (p[5] - p[4]) * 0.28)); f.is.setAttribute('r', q(r));
      f.id.setAttribute('cx', 126); f.id.setAttribute('cy', q(106 + (p[5] - p[4]) * 0.28)); f.id.setAttribute('r', q(r));
      f.b.setAttribute('d', 'M' + q(p[6]) + ' ' + q(p[7]) + ' Q100 ' + q(p[10]) + ' ' + q(p[8]) + ' ' + q(p[9]) + ' Q100 ' + q(p[11]) + ' ' + q(p[6]) + ' ' + q(p[7]) + 'Z');
      rZ.style.opacity = p[12]; rN.style.opacity = p[13]; rG.style.opacity = p[14]; rA.style.opacity = p[15];
    }
    var ora = VOLTI.neutro.slice(), anim = null;
    function vaiA(nome) {
      var meta = VOLTI[nome] || VOLTI.neutro, da = ora.slice(), t0 = null;
      if (anim) cancelAnimationFrame(anim);
      if (fermo) { ora = meta.slice(); disegna(ora); return; }
      anim = requestAnimationFrame(function passo(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 620), e = 1 - Math.pow(1 - k, 3), molla = e + Math.sin(k * Math.PI) * 0.06 * (1 - k);
        ora = da.map(function (x, i) { return x + (meta[i] - x) * (i < 12 ? molla : e); });
        disegna(ora);
        if (k < 1) anim = requestAnimationFrame(passo); else anim = null;
      });
    }
    disegna(ora);
    var cerchio = crea('div', 'volto-cerchio'); cerchio.setAttribute('role', 'tablist'); cerchio.setAttribute('aria-label', 'Le sette emozioni');
    var n = voci.length;
    var bottoni = voci.map(function (li, i) {
      var bt = crea('button', 'emo', '<i></i><span>' + li.querySelector('h3').innerHTML + '</span>'); bt.type = 'button';
      var a = (i / n) * 2 * Math.PI; bt.style.left = (50 + 50 * Math.sin(a)) + '%'; bt.style.top = (50 - 50 * Math.cos(a)) + '%';
      bt.setAttribute('aria-controls', 'volto-detto'); cerchio.appendChild(bt); return bt;
    });
    cerchio.appendChild(scena);
    var detto = crea('div', 'volto-detto'); detto.id = 'volto-detto'; detto.setAttribute('role', 'tabpanel'); detto.setAttribute('aria-live', 'polite');
    var s = schede(bottoni, function (i) {
      var li = voci[i];
      detto.innerHTML = '<h3>' + li.querySelector('h3').innerHTML + '</h3>' + tutti('p', li).map(function (p) { return '<p>' + p.innerHTML + '</p>'; }).join('');
      vaiA(li.getAttribute('data-e'));
    });
    var lista = v.querySelector('.emozioni');
    v.insertBefore(cerchio, lista); v.insertBefore(detto, lista); lista.hidden = true; v.classList.add('viva');
    s.scegli(0);
    giro(v, 3600, function () { s.scegli(s.quale() + 1); });
    pulizie.push(function () { if (anim) cancelAnimationFrame(anim); cerchio.remove(); detto.remove(); lista.hidden = false; v.classList.remove('viva'); });
  }

  /* ---- taccuino: il calendario mostra un mese alla volta ---- */
  function calendario() {
    var c = d.querySelector('.calendario'); if (!c) return;
    var mesi = tutti('.mese', c); if (mesi.length < 2) { if (mesi[0]) mesi[0].classList.add('attivo'); return; }
    var i = 0;   // il primo e' il piu' recente
    var prima = crea('button', 'cal-freccia', '←'), dopo = crea('button', 'cal-freccia', '→');
    prima.type = dopo.type = 'button'; prima.setAttribute('aria-label', 'Mese precedente'); dopo.setAttribute('aria-label', 'Mese successivo');
    var barra = crea('div', 'cal-barra'); barra.appendChild(prima); barra.appendChild(dopo); c.insertBefore(barra, c.firstChild);
    function mostra() { mesi.forEach(function (m, k) { m.classList.toggle('attivo', k === i); m.hidden = k !== i; }); prima.disabled = i >= mesi.length - 1; dopo.disabled = i <= 0; }
    ascolta(prima, 'click', function () { if (i < mesi.length - 1) { i++; mostra(); } });
    ascolta(dopo, 'click', function () { if (i > 0) { i--; mostra(); } });
    c.classList.add('viva'); mostra();
    pulizie.push(function () { barra.remove(); c.classList.remove('viva'); mesi.forEach(function (m) { m.hidden = false; m.classList.remove('attivo'); }); });
  }

  function avvia() {
    pulizie.forEach(function (f) { try { f(); } catch (e) {} }); pulizie = [];
    if (h.className.indexOf(' js') < 0 && !h.classList.contains('js')) h.classList.add('js');
    menu(); lettura(); titolo(); costellazione(); indice(); bussola(); volto(); calendario(); comparse(); apertura(); conta(); barra();
  }
  window.LPG = { avvia: avvia };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', avvia); else avvia();
})();
