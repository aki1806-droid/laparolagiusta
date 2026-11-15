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
    '.articolo .gioco, .tappe, .libro-del-post, .cost, .quadrante, .rotte > li, .volto-cerchio, .volto-detto, .albero-scena, .silenzio-scena, .trilogia > *, .post-primo, .post-lista > *, .calendario, .dal-taccuino > *, .articolo-coda > *';
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

  /* ---- un sentiero di punti da toccare: lo usano la costellazione dei libri e la mappa dei territori ---- */
  function sentiero(voci, opz) {
    var n = voci.length, punti = opz.punti, seme = opz.seme || 7;
    function caso() { seme = (seme * 1664525 + 1013904223) >>> 0; return seme / 4294967296; }
    if (!punti) {
      punti = []; var su = caso() > 0.5;
      for (var i = 0; i < n; i++) {
        var x = 8 + (84 * i) / (n - 1) + (caso() - 0.5) * 5, y = (su ? 30 : 70) + (caso() - 0.5) * 30; su = !su;
        punti.push([Math.max(6, Math.min(94, x)), Math.max(16, Math.min(84, y))]);
      }
    }
    var cost = crea('div', 'cost' + (opz.classe ? ' ' + opz.classe : ''));
    var cielo = crea('div', 'cost-cielo', '<svg aria-hidden="true"><polyline class="cost-linea"/><polyline class="cost-fatta" pathLength="1"/></svg>');
    cielo.setAttribute('role', 'tablist'); cielo.setAttribute('aria-label', opz.aria);
    var idT = 'testo-' + (opz.classe || 'cost');
    var testo = crea('div', 'cost-testo'); testo.setAttribute('role', 'tabpanel'); testo.setAttribute('aria-live', 'polite'); testo.id = idT;
    var bottoni = voci.map(function (v, i) {
      var bt = crea('button', 'stella' + (punti[i][1] < 50 ? ' sotto' : ' sopra'), '<i>' + (opz.numeri ? opz.numeri[i] : '') + '</i><span>' + v.titolo + '</span>');
      bt.type = 'button'; bt.style.left = punti[i][0] + '%'; bt.style.top = punti[i][1] + '%'; bt.setAttribute('aria-controls', idT);
      cielo.appendChild(bt); return bt;
    });
    var fatta = cielo.querySelector('.cost-fatta'), svg = cielo.querySelector('svg'), tratto = cielo.querySelector('.cost-linea'), lung = [0], s = null;
    // la linea si disegna nelle misure vere del riquadro, e si ridisegna se cambia
    function disponi() {
      var W = cielo.clientWidth, H = cielo.clientHeight; if (!W || !H) return;
      var px = punti.map(function (p) { return [p[0] * W / 100, p[1] * H / 100]; });
      var pt = px.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); tratto.setAttribute('points', pt); fatta.setAttribute('points', pt);
      lung = [0]; for (var j = 1; j < n; j++) lung.push(lung[j - 1] + Math.hypot(px[j][0] - px[j - 1][0], px[j][1] - px[j - 1][1]));
      if (s && s.quale() >= 0) fatta.style.strokeDashoffset = (1 - lung[s.quale()] / lung[n - 1]).toFixed(4);
    }
    s = schede(bottoni, function (i) {
      testo.innerHTML = '<div class="cost-n">' + (opz.numeri ? opz.numeri[i] : i + 1) + ' <span>di ' + (opz.numeri ? opz.numeri[n - 1] : n) + '</span></div><h3>' + voci[i].titolo + '</h3>' + voci[i].testo;
      if (lung.length === n) fatta.style.strokeDashoffset = (1 - lung[i] / lung[n - 1]).toFixed(4);
      bottoni.forEach(function (x, k) { x.classList.toggle('passata', k < i); });
    });
    var frecce = crea('div', 'cost-frecce', '<button type="button" aria-label="Precedente">←</button><button type="button" aria-label="Successivo">→</button>');
    ascolta(frecce.children[0], 'click', function () { s.scegli(s.quale() - 1); });
    ascolta(frecce.children[1], 'click', function () { s.scegli(s.quale() + 1); });
    cost.appendChild(cielo); cost.appendChild(testo); cost.appendChild(frecce);
    ascolta(window, 'resize', disponi);
    return { el: cost, schede: s, disponi: disponi };
  }
  function vociDa(elementi) {
    return elementi.map(function (b) { var t = b.querySelector('h3'); return { titolo: t ? t.innerHTML : '', testo: tutti('p', b).map(function (p) { return '<p>' + p.innerHTML + '</p>'; }).join('') }; });
  }

  /* ---- schede ebook: i sei argomenti diventano una costellazione ---- */
  function costellazione() {
    var g = d.querySelector('.p-ebook .griglia'); if (!g || g.dataset.viva) return;
    var blocchi = tutti('.blocco', g); if (blocchi.length < 4 || blocchi.length > 8) return;
    var sez = g.closest('section'); if (!sez) return;
    // ogni libro ha la sua costellazione: la forma nasce dal titolo
    var seme = 0, titolo = (d.querySelector('h1') || {}).textContent || 'x';
    for (var k = 0; k < titolo.length; k++) seme = (seme * 31 + titolo.charCodeAt(k)) >>> 0;
    var c = sentiero(vociDa(blocchi), { seme: seme, aria: 'Gli argomenti del libro' });
    g.parentNode.insertBefore(c.el, g); g.hidden = true; g.dataset.viva = '1';
    var eraNotte = sez.classList.contains('notte');
    if (!eraNotte) { sez.classList.add('notte', 'cost-sez'); sez.classList.remove('tinta'); sez.insertBefore(crea('div', 'cielo', '<i></i><i></i>'), sez.firstChild); sez.firstChild.setAttribute('aria-hidden', 'true'); }
    c.disponi(); c.schede.scegli(0);
    giro(c.el, 5200, function () { c.schede.scegli(c.schede.quale() + 1); });
    pulizie.push(function () { c.el.remove(); g.hidden = false; delete g.dataset.viva; if (!eraNotte) { sez.classList.remove('notte', 'cost-sez'); var x = sez.querySelector(':scope > .cielo'); if (x) x.remove(); } });
  }

  /* ---- Il Volo delle Radici: ogni radice che scende fa salire un ramo ---- */
  function albero() {
    var a = d.querySelector('.albero'); if (!a || a.classList.contains('viva')) return;
    var voci = tutti('.radici-elenco > li', a); if (voci.length !== 6) return;
    var TERRA = 300, punte = [[62, 432], [150, 512], [246, 462], [356, 520], [452, 448], [540, 500]], cime = [[70, 196], [150, 96], [248, 44], [352, 40], [450, 92], [530, 190]];
    var seme = 20240317; function caso() { seme = (seme * 1664525 + 1013904223) >>> 0; return seme / 4294967296; }
    var svg = '<svg viewBox="0 0 600 560" aria-hidden="true"><line class="a-terra" x1="0" y1="' + TERRA + '" x2="600" y2="' + TERRA + '"/>' +
      '<path class="a-tronco" pathLength="1" d="M300 ' + TERRA + ' C297 276 303 250 300 214"/>';
    punte.forEach(function (p, i) {
      var dx = p[0] - 300, c = cime[i], ex = c[0] - 300;
      svg += '<g class="a-coppia" data-i="' + i + '">' +
        '<path class="a-radice" pathLength="1" d="M300 ' + TERRA + ' C' + (300 + dx * 0.18) + ' ' + (TERRA + 46) + ' ' + (p[0] - dx * 0.34) + ' ' + (p[1] - 74) + ' ' + p[0] + ' ' + p[1] + '"/>' +
        '<path class="a-radichetta" pathLength="1" d="M' + (300 + dx * 0.62) + ' ' + (TERRA + (p[1] - TERRA) * 0.58) + ' q' + (dx > 0 ? 16 : -16) + ' 26 ' + (dx > 0 ? 6 : -6) + ' 50"/>' +
        '<path class="a-ramo" pathLength="1" d="M300 ' + (232 - Math.abs(i - 2.5) * 4) + ' C' + (300 + ex * 0.12) + ' ' + (190 - (214 - c[1]) * 0.1) + ' ' + (c[0] - ex * 0.42) + ' ' + (c[1] + 78) + ' ' + c[0] + ' ' + c[1] + '"/>' +
        '<path class="a-rametto" pathLength="1" d="M' + (300 + ex * 0.66) + ' ' + (c[1] + (214 - c[1]) * 0.42) + ' q' + (ex > 0 ? 10 : -10) + ' -30 ' + (ex > 0 ? 34 : -34) + ' -40"/><g class="a-foglie">';
      for (var k = 0; k < 9; k++) {
        var fx = c[0] + (caso() - 0.5) * 92 - ex * 0.08, fy = c[1] + (caso() - 0.5) * 70 + 8;
        svg += '<ellipse cx="' + fx.toFixed(1) + '" cy="' + fy.toFixed(1) + '" rx="' + (5 + caso() * 5).toFixed(1) + '" ry="' + (2.6 + caso() * 2).toFixed(1) + '" transform="rotate(' + Math.round(caso() * 180) + ' ' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ')" style="transition-delay:' + (1.5 + k * 0.09).toFixed(2) + 's"/>';
      }
      svg += '</g></g>';
    });
    svg += '<g class="a-uccelli">';
    [[250, 150, 0], [330, 120, .5], [290, 90, 1], [380, 160, 1.4], [215, 110, 1.9]].forEach(function (u) { svg += '<path d="M' + u[0] + ' ' + u[1] + ' q8 -9 16 0 q8 -9 16 0" style="animation-delay:' + u[2] + 's"/>'; });
    svg += '</g></svg>';
    var scena = crea('div', 'albero-scena', svg);
    scena.setAttribute('role', 'tablist'); scena.setAttribute('aria-label', 'Le sei radici');
    var testo = crea('div', 'albero-testo'); testo.id = 'albero-testo'; testo.setAttribute('role', 'tabpanel'); testo.setAttribute('aria-live', 'polite');
    var conto = crea('div', 'albero-conto'), detto = a.querySelector('.albero-volo'), cresciute = 0, fatte = {};
    testo.innerHTML = '<p class="albero-invito">Tocca un seme sotto terra. Ogni radice che scende fa salire un ramo.</p>';
    var coppie = tutti('.a-coppia', scena);
    var bottoni = voci.map(function (li, i) {
      var bt = crea('button', 'seme', '<i></i><span>' + li.querySelector('h3').innerHTML + '</span>'); bt.type = 'button';
      bt.style.left = (punte[i][0] / 6) + '%'; bt.style.top = (punte[i][1] / 5.6) + '%'; bt.setAttribute('aria-controls', 'albero-testo');
      scena.appendChild(bt); return bt;
    });
    function conta() { conto.innerHTML = '<b>' + cresciute + '</b> ' + (cresciute === 1 ? 'radice' : 'radici') + ' su 6'; }
    var s = schede(bottoni, function (i) {
      if (!fatte[i]) { fatte[i] = 1; cresciute++; coppie[i].classList.add('cresciuta'); bottoni[i].classList.add('cresciuto'); scena.classList.add('nata'); }
      testo.innerHTML = '<h3>' + voci[i].querySelector('h3').innerHTML + '</h3>' + tutti('p', voci[i]).map(function (p) { return '<p>' + p.innerHTML + '</p>'; }).join('');
      conta();
      if (cresciute === 6 && !a.classList.contains('in-volo')) setTimeout(function () { a.classList.add('in-volo'); }, 1900);
    });
    conta();
    var lista = a.querySelector('.radici-elenco');
    a.insertBefore(scena, lista); a.insertBefore(conto, lista); a.insertBefore(testo, lista); lista.hidden = true; a.classList.add('viva');
    pulizie.push(function () { scena.remove(); conto.remove(); testo.remove(); lista.hidden = false; a.classList.remove('viva', 'in-volo'); });
  }

  /* ---- Mappe Silenziose: tieni premuto, il rumore si spegne e compare la mappa ---- */
  function silenzio() {
    var z = d.querySelector('.silenzio'); if (!z || z.classList.contains('viva')) return;
    var terr = tutti('.territori li', z); if (terr.length < 3) return;
    var AVVISI = ['3 nuove email', 'Riunione tra 10 minuti', 'Scadenza oggi', 'Chiamata persa', 'Urgente', 'Rispondi subito', '12 messaggi nel gruppo', 'Promemoria', 'Sei in ritardo', 'Aggiornamento disponibile',
      'Ti hanno menzionato', 'Entro stasera', 'Nuovo commento', 'Da approvare', 'Richiamami', 'Ultimo avviso', 'In attesa di risposta', 'Batteria al 9%'];
    var N = 37, seme = 37; function caso() { seme = (seme * 1664525 + 1013904223) >>> 0; return seme / 4294967296; }
    var rumore = crea('div', 'rumore'); rumore.setAttribute('aria-hidden', 'true');
    var avvisi = [];
    // sparsi su una griglia mossa, lasciando libero il centro per il tasto
    var celle = [];
    for (var cy = 0; cy < 6; cy++) for (var cx = 0; cx < 8; cx++) if (!((cx === 3 || cx === 4) && (cy === 2 || cy === 3))) celle.push([cx, cy]);
    celle.sort(function () { return caso() - 0.5; });
    for (var i = 0; i < N; i++) {
      var x = 7 + (celle[i][0] + 0.15 + caso() * 0.7) * 10.9, y = 6 + (celle[i][1] + 0.15 + caso() * 0.7) * 14.8;
      var e = crea('span', 'avviso-finto', AVVISI[i % AVVISI.length]);
      e.style.cssText = 'left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;--g:' + ((caso() - 0.5) * 16).toFixed(1) + 'deg;--t:' + (0.5 + caso() * 0.9).toFixed(2) + 's;--r:' + (caso() * 2).toFixed(2) + 's;font-size:' + (11 + caso() * 5).toFixed(1) + 'px';
      rumore.appendChild(e); avvisi.push(e);
    }
    var ordine = avvisi.map(function (_, k) { return k; }).sort(function () { return caso() - 0.5; });
    var tasto = crea('button', 'silenzio-tasto', '<span class="st-anello"></span><span class="st-testo"><b>Tieni premuto</b><i>per fare silenzio</i></span>'); tasto.type = 'button';
    tasto.setAttribute('aria-label', 'Tieni premuto per fare silenzio');
    var conto = crea('p', 'silenzio-conto'); conto.setAttribute('aria-live', 'polite');
    var scena = crea('div', 'silenzio-scena'); scena.appendChild(rumore); scena.appendChild(tasto);
    var detto = z.querySelector('.silenzio-detto'), casaDetto = detto ? detto.nextSibling : null;
    if (detto) scena.appendChild(detto);
    var salta = crea('button', 'silenzio-salta', 'Vai subito alla mappa'); salta.type = 'button';
    var p = 0, giu = false, fatto = false, raf = null, ultimo = 0, DURATA = 5200;
    function mostra() {
      var spenti = Math.round(p * N);
      ordine.forEach(function (k, j) { avvisi[k].classList.toggle('via', j < spenti); });
      tasto.style.setProperty('--p', p.toFixed(3));
      conto.innerHTML = fatto ? '' : '<b>' + (N - spenti) + '</b> notifiche';
    }
    function passo(t) {
      var dt = Math.min(60, t - ultimo); ultimo = t;
      p = Math.max(0, Math.min(1, p + (giu ? dt / DURATA : -dt / 1400)));
      mostra();
      if (p >= 1) { quiete(); return; }
      if (giu || p > 0) raf = requestAnimationFrame(passo); else raf = null;
    }
    function premi(e) { if (fatto) return; if (e && e.preventDefault && e.type !== 'keydown') e.preventDefault(); giu = true; z.classList.add('premuto'); if (!raf) { ultimo = performance.now(); raf = requestAnimationFrame(passo); } }
    function lascia() { giu = false; z.classList.remove('premuto'); }
    var mappa = null;
    function quiete() {
      if (fatto) return; fatto = true; giu = false; raf = null; p = 1; mostra();
      z.classList.remove('premuto'); z.classList.add('quiete');
      var voci = vociDa(terr);
      mappa = sentiero(voci, { classe: 'mappa', aria: 'I cinque territori', numeri: ['I', 'II', 'III', 'IV', 'V'].slice(0, voci.length), punti: [[9, 70], [29, 28], [50, 64], [71, 24], [91, 60]].slice(0, voci.length) });
      z.insertBefore(mappa.el, z.querySelector('.territori'));
      setTimeout(function () { mappa.disponi(); mappa.schede.scegli(0); z.classList.add('mappata'); }, fermo ? 0 : 1500);
    }
    ascolta(tasto, 'pointerdown', premi); ascolta(window, 'pointerup', lascia); ascolta(tasto, 'pointercancel', lascia); ascolta(tasto, 'pointerleave', lascia);
    ascolta(tasto, 'contextmenu', function (e) { e.preventDefault(); });
    ascolta(tasto, 'keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) premi(e); } });
    ascolta(tasto, 'keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') lascia(); });
    ascolta(salta, 'click', function () { p = 1; quiete(); });
    var lista = z.querySelector('.territori');
    z.insertBefore(scena, z.firstChild); z.insertBefore(conto, scena.nextSibling); z.insertBefore(salta, lista); lista.hidden = true; z.classList.add('viva'); mostra();
    pulizie.push(function () { if (raf) cancelAnimationFrame(raf); if (detto) z.insertBefore(detto, casaDetto); scena.remove(); conto.remove(); salta.remove(); if (mappa) mappa.el.remove(); lista.hidden = false; z.classList.remove('viva', 'quiete', 'mappata', 'premuto'); });
  }

  /* ---- su computer: un anello segue il puntatore, i pulsanti lo attirano, le schede si inclinano ---- */
  function puntatore() {
    if (fermo || !(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
    var anello = crea('div', 'anello'); anello.setAttribute('aria-hidden', 'true'); anello.style.transform = 'translate(-100px,-100px)'; d.body.appendChild(anello);
    var x = -100, y = -100, ax = -100, ay = -100, vivo = false, raf = null;
    function gira() {
      ax += (x - ax) * 0.2; ay += (y - ay) * 0.2;
      anello.style.transform = 'translate(' + ax.toFixed(1) + 'px,' + ay.toFixed(1) + 'px)';
      raf = (Math.abs(x - ax) > 0.3 || Math.abs(y - ay) > 0.3) ? requestAnimationFrame(gira) : null;
    }
    var SCHEDE = '.corso, .p-home .libro, .post-carta, .formato-card, .profilo, .post-primo, .gruppo, .valore, .vicino';
    var ultima = null;
    ascolta(d, 'pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!vivo) { vivo = true; ax = x; ay = y; anello.classList.add('vivo'); }
      if (!raf) raf = requestAnimationFrame(gira);
      var t = e.target.closest ? e.target : null; if (!t) return;
      anello.classList.toggle('su', !!t.closest('a, button, summary, input, label, .stella, [role="tab"]'));
      var b = t.closest('.btn');
      if (b) { var q = b.getBoundingClientRect(); b.style.setProperty('--mx', ((x - q.left - q.width / 2) * 0.16).toFixed(1) + 'px'); b.style.setProperty('--my', ((y - q.top - q.height / 2) * 0.3).toFixed(1) + 'px'); }
      var c = t.closest(SCHEDE);
      if (ultima && ultima !== c) { ultima.style.removeProperty('--ix'); ultima.style.removeProperty('--iy'); ultima.classList.remove('inclinata'); }
      if (c) { var r = c.getBoundingClientRect(); c.classList.add('inclinata'); c.style.setProperty('--iy', (((x - r.left) / r.width - 0.5) * 7).toFixed(2) + 'deg'); c.style.setProperty('--ix', ((0.5 - (y - r.top) / r.height) * 6).toFixed(2) + 'deg'); }
      ultima = c;
    }, { passive: true });
    ascolta(d.documentElement, 'pointerleave', function () { vivo = false; anello.classList.remove('vivo'); });
    pulizie.push(function () { if (raf) cancelAnimationFrame(raf); anello.remove(); });
  }

  /* ---- un tocco sul cielo d'apertura accende una stella ---- */
  function stelle() {
    var cielo = d.querySelector('.hero.notte, .testata-notte'); if (!cielo || fermo) return;
    var nate = [];
    ascolta(cielo, 'click', function (e) {
      if (e.target.closest('a, button, input, label, form, summary, img, .cop, .scheda')) return;
      var q = cielo.getBoundingClientRect(), st = crea('i', 'stella-nata');
      st.style.left = (e.clientX - q.left) + 'px'; st.style.top = (e.clientY - q.top) + 'px'; st.style.setProperty('--s', (0.6 + Math.random() * 1.1).toFixed(2));
      st.setAttribute('aria-hidden', 'true'); cielo.appendChild(st); nate.push(st);
      if (nate.length > 40) nate.shift().remove();
    });
    pulizie.push(function () { nate.forEach(function (x) { x.remove(); }); });
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

  /* ---- taccuino: l'esercizio dentro il post (scegli, carte, misura, domanda, respiro) ---- */
  function esercizi() {
    tutti('.gioco[data-gioco]').forEach(function (g, quale) {
      if (g.classList.contains('vivo')) return;
      var tipo = g.getAttribute('data-gioco'), lista = g.querySelector('ul, ol'), voci = lista ? tutti('li', lista) : [], aggiunti = [];
      function metti(el, prima) { g.insertBefore(el, prima || null); aggiunti.push(el); return el; }
      var esito = crea('div', 'gioco-esito'); esito.setAttribute('aria-live', 'polite');

      if (tipo === 'scegli') {
        var scelte = metti(crea('div', 'gioco-scelte'), lista);
        var bottoni = voci.map(function (li, i) {
          var b = crea('button', 'gioco-scelta', li.querySelector('strong').innerHTML); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
          ascolta(b, 'click', function () {
            bottoni.forEach(function (x, k) { x.classList.toggle('scelta', k === i); x.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
            esito.innerHTML = '<p>' + li.querySelector('span').innerHTML + '</p>'; g.classList.add('risposto');
          });
          scelte.appendChild(b); return b;
        });
        metti(esito, lista); lista.hidden = true;
      } else if (tipo === 'carte') {
        var mazzo = metti(crea('div', 'gioco-mazzo'), lista);
        voci.forEach(function (li) {
          var c = crea('button', 'carta', '<span class="carta-dentro"><span class="carta-fronte">' + li.querySelector('strong').innerHTML + '</span><span class="carta-retro">' + li.querySelector('span').innerHTML + '</span></span>');
          c.type = 'button'; c.setAttribute('aria-pressed', 'false');
          ascolta(c, 'click', function () { var s = c.classList.toggle('girata'); c.setAttribute('aria-pressed', s ? 'true' : 'false'); });
          mazzo.appendChild(c);
        });
        metti(crea('p', 'gioco-aiuto', 'Tocca una carta per girarla.'), lista); lista.hidden = true;
      } else if (tipo === 'misura') {
        var riga = metti(crea('div', 'gioco-misura'), lista), id = 'misura-' + quale;
        riga.innerHTML = '<label class="solo-sr" for="' + id + '">' + g.querySelector('.gioco-tit').textContent + '</label><span>' + g.getAttribute('data-da') + '</span><input type="range" id="' + id + '" min="0" max="10" step="1" value="5"><span>' + g.getAttribute('data-a') + '</span><output for="' + id + '">5</output>';
        var cursore = riga.querySelector('input'), numero = riga.querySelector('output');
        var aggiorna = function () {
          var v = +cursore.value; numero.textContent = v; cursore.style.setProperty('--v', (v * 10) + '%');
          var li = voci.filter(function (x) { return v >= +x.getAttribute('data-min') && v <= +x.getAttribute('data-max'); })[0];
          esito.innerHTML = li ? '<p>' + li.querySelector('span').innerHTML + '</p>' : '';
        };
        ascolta(cursore, 'input', function () { g.classList.add('risposto'); aggiorna(); });
        metti(esito, lista); lista.hidden = true; aggiorna(); esito.innerHTML = '<p class="gioco-aiuto">Sposta il cursore.</p>';
      } else if (tipo === 'domanda') {
        var chiave = 'lpg-taccuino:' + location.pathname.split('/').pop() + location.hash.replace(/^#p-blog--/, ':') + ':' + quale, idc = 'domanda-' + quale;
        var campo = crea('textarea', 'gioco-campo'); campo.id = idc; campo.rows = 4; campo.setAttribute('aria-label', g.querySelector('.gioco-tit').textContent); campo.placeholder = 'Scrivi qui…';
        var stato = crea('p', 'gioco-aiuto', 'Resta solo su questo dispositivo: non viene inviato a nessuno.');
        try { var salvato = localStorage.getItem(chiave); if (salvato) { campo.value = salvato; stato.textContent = 'Ritrovato quello che avevi scritto. Resta solo su questo dispositivo.'; } } catch (e) {}
        var attesa = null;
        ascolta(campo, 'input', function () {
          clearTimeout(attesa); attesa = setTimeout(function () { try { localStorage.setItem(chiave, campo.value); stato.textContent = campo.value ? 'Salvato su questo dispositivo. Non viene inviato a nessuno.' : 'Resta solo su questo dispositivo: non viene inviato a nessuno.'; } catch (e) { stato.textContent = 'Non riesco a salvarlo qui: copialo altrove se vuoi tenerlo.'; } }, 500);
        });
        var nota = g.querySelector('.gioco-nota'); metti(campo, nota ? nota.nextSibling : null); metti(stato, campo.nextSibling);
      } else if (tipo === 'respiro') {
        var durata = +g.getAttribute('data-secondi') || 60, fine = g.querySelector('.gioco-fine');
        var cerchio = crea('button', 'respiro-cerchio', '<span class="respiro-alone"></span><span class="respiro-testo"><b>Comincia</b><i>' + durata + ' secondi</i></span>'); cerchio.type = 'button';
        var b = cerchio.querySelector('b'), sec = cerchio.querySelector('i'), timer = null, t0 = 0;
        if (fine) fine.hidden = true;
        var ferma = function (completo) {
          clearInterval(timer); timer = null; g.classList.remove('respira');
          if (completo) { g.classList.add('risposto'); b.textContent = 'Fatto'; sec.textContent = 'ricomincia quando vuoi'; if (fine) fine.hidden = false; }
          else { b.textContent = 'Comincia'; sec.textContent = durata + ' secondi'; }
        };
        ascolta(cerchio, 'click', function () {
          if (timer) { ferma(false); return; }
          if (fine) fine.hidden = true; g.classList.remove('risposto'); g.classList.add('respira'); t0 = Date.now();
          var passo = function () {
            var trascorsi = (Date.now() - t0) / 1000, resto = Math.max(0, Math.ceil(durata - trascorsi));
            b.textContent = (trascorsi % 10) < 4 ? 'Inspira' : 'Espira'; sec.textContent = resto + (resto === 1 ? ' secondo' : ' secondi');
            if (trascorsi >= durata) ferma(true);
          };
          passo(); timer = setInterval(passo, 250);
        });
        metti(cerchio, fine);
        pulizie.push(function () { clearInterval(timer); if (fine) fine.hidden = false; });
      } else if (tipo === 'spegni' || tipo === 'cancella') {
        var fineS = g.querySelector('.gioco-fine'), modello = fineS ? fineS.innerHTML : '';
        if (fineS) fineS.hidden = true;
        var pulsS = metti(crea('div', 'gioco-' + (tipo === 'spegni' ? 'interruttori' : 'lista')), lista);
        var tastiS = voci.map(function (li) {
          var b = crea('button', tipo === 'spegni' ? 'interruttore' : 'da-togliere', '<span>' + li.querySelector('strong').innerHTML + '</span>' + (tipo === 'spegni' ? '<i></i>' : ''));
          b.type = 'button';
          if (tipo === 'spegni') { b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', 'true'); } else b.setAttribute('aria-pressed', 'false');
          ascolta(b, 'click', function () {
            var via = b.classList.toggle('via');
            if (tipo === 'spegni') b.setAttribute('aria-checked', via ? 'false' : 'true'); else b.setAttribute('aria-pressed', via ? 'true' : 'false');
            var n = tastiS.filter(function (x) { return x.classList.contains('via'); }).length, finito = tipo === 'spegni' ? n === tastiS.length : n > 0;
            g.classList.toggle('risposto', finito);
            if (fineS) { fineS.hidden = !finito; fineS.innerHTML = modello.replace('{n}', n === 1 ? 'una' : n); }
          });
          pulsS.appendChild(b); return b;
        });
        lista.hidden = true;
        pulizie.push(function () { if (fineS) { fineS.hidden = false; fineS.innerHTML = modello; } });
      } else if (tipo === 'passi') {
        var fineP = g.querySelector('.gioco-fine'); if (fineP) fineP.hidden = true;
        var scena = metti(crea('div', 'gioco-passo'), lista), iP = 0;
        var mostraP = function () {
          if (iP < voci.length) {
            scena.innerHTML = '<div class="passo-n">' + (iP + 1) + ' <span>di ' + voci.length + '</span></div><p class="passo-testo">' + voci[iP].querySelector('strong').innerHTML + '</p><button type="button" class="gioco-avanti">' + (iP < voci.length - 1 ? 'Fatto, avanti' : 'Fatto') + '</button>';
            if (fineP) fineP.hidden = true; g.classList.remove('risposto');
          } else { scena.innerHTML = '<button type="button" class="gioco-avanti secondario">Ricomincia</button>'; if (fineP) fineP.hidden = false; g.classList.add('risposto'); }
        };
        ascolta(scena, 'click', function (e) { if (!e.target.closest('button')) return; iP = iP < voci.length ? iP + 1 : 0; mostraP(); var b = scena.querySelector('button'); if (b) b.focus({ preventScroll: true }); });
        mostraP(); lista.hidden = true;
        pulizie.push(function () { if (fineP) fineP.hidden = false; });
      } else if (tipo === 'conta') {
        var N = +g.getAttribute('data-n') || 5, fineC = g.querySelector('.gioco-fine'), quanti = 0; if (fineC) fineC.hidden = true;
        var pallini = crea('div', 'conta-pallini', new Array(N + 1).join('<i></i>')), tocca = crea('button', 'conta-tasto', '<b>Tocca</b><span>0 di ' + N + '</span>'); tocca.type = 'button';
        ascolta(tocca, 'click', function () {
          if (quanti >= N) { quanti = 0; if (fineC) fineC.hidden = true; g.classList.remove('risposto'); } else quanti++;
          tutti('i', pallini).forEach(function (p, k) { p.classList.toggle('pieno', k < quanti); });
          tocca.querySelector('span').textContent = quanti + ' di ' + N; tocca.querySelector('b').textContent = quanti >= N ? 'Ricomincia' : 'Tocca';
          if (quanti >= N) { if (fineC) fineC.hidden = false; g.classList.add('risposto'); }
        });
        metti(pallini, fineC); metti(tocca, fineC);
        pulizie.push(function () { if (fineC) fineC.hidden = false; });
      } else if (tipo === 'tieni') {
        var durT = (+g.getAttribute('data-secondi') || 8) * 1000, fineT = g.querySelector('.gioco-fine'); if (fineT) fineT.hidden = true;
        var tastoT = crea('button', 'tieni-tasto', '<span class="st-anello"></span><span class="st-testo"><b>Tieni premuto</b><i>' + Math.round(durT / 1000) + ' secondi</i></span>'); tastoT.type = 'button';
        var pT = 0, giuT = false, rafT = null, ultT = 0, fattoT = false;
        var giraT = function (t) {
          var dt = Math.min(60, t - ultT); ultT = t;
          pT = Math.max(0, Math.min(1, pT + (giuT ? dt / durT : -dt / 900)));
          tastoT.style.setProperty('--p', pT.toFixed(3));
          if (pT >= 1) { fattoT = true; giuT = false; rafT = null; g.classList.add('risposto'); if (fineT) fineT.hidden = false; tastoT.querySelector('b').textContent = 'Fatto'; tastoT.querySelector('i').textContent = 'tocca per ricominciare'; return; }
          rafT = (giuT || pT > 0) ? requestAnimationFrame(giraT) : null;
        };
        var premiT = function (e) {
          if (fattoT) { fattoT = false; pT = 0; tastoT.style.setProperty('--p', 0); g.classList.remove('risposto'); if (fineT) fineT.hidden = true; tastoT.querySelector('b').textContent = 'Tieni premuto'; tastoT.querySelector('i').textContent = Math.round(durT / 1000) + ' secondi'; return; }
          if (e && e.type === 'pointerdown') e.preventDefault();
          giuT = true; g.classList.add('premuto'); if (!rafT) { ultT = performance.now(); rafT = requestAnimationFrame(giraT); }
        };
        var lasciaT = function () { giuT = false; g.classList.remove('premuto'); };
        ascolta(tastoT, 'pointerdown', premiT); ascolta(window, 'pointerup', lasciaT); ascolta(tastoT, 'pointerleave', lasciaT); ascolta(tastoT, 'pointercancel', lasciaT);
        ascolta(tastoT, 'contextmenu', function (e) { e.preventDefault(); });
        ascolta(tastoT, 'keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); premiT(e); } });
        ascolta(tastoT, 'keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') lasciaT(); });
        metti(tastoT, fineT);
        pulizie.push(function () { if (rafT) cancelAnimationFrame(rafT); if (fineT) fineT.hidden = false; g.classList.remove('premuto'); });
      } else if (tipo === 'rallenta') {
        var frase = g.querySelector('.gioco-frase'), idr = 'rallenta-' + quale;
        var pista = crea('div', 'rallenta-pista'); frase.parentNode.insertBefore(pista, frase); pista.appendChild(frase);
        var rigaR = metti(crea('div', 'gioco-misura rallenta-riga', '<label class="solo-sr" for="' + idr + '">Velocità</label><span>fermo</span><input type="range" id="' + idr + '" min="0" max="10" step="1" value="10"><span>di corsa</span>'), pista.nextSibling);
        var cursR = rigaR.querySelector('input');
        var aggR = function () {
          var v = +cursR.value; cursR.style.setProperty('--v', (v * 10) + '%');
          g.classList.toggle('ferma', v === 0); g.classList.toggle('risposto', v === 0);
          frase.style.setProperty('--dur', (v ? (11 - v) * 0.9 + 0.5 : 0).toFixed(2) + 's'); frase.style.setProperty('--sf', (fermo ? 0 : v * 0.8).toFixed(1) + 'px');
        };
        ascolta(cursR, 'input', aggR); g.classList.add('corre'); aggR();
        pulizie.push(function () { pista.parentNode.insertBefore(frase, pista); pista.remove(); g.classList.remove('corre', 'ferma'); frase.removeAttribute('style'); });
      }
      g.classList.add('vivo');
      pulizie.push(function () { aggiunti.forEach(function (x) { x.remove(); }); if (lista) lista.hidden = false; g.classList.remove('vivo', 'risposto', 'respira'); });
    });
  }

  /* ---- Mappe Silenziose: la mappa delle venticinque tappe ---- */
  function tappe() {
    var m = d.querySelector('.tappe'); if (!m || m.classList.contains('viva')) return;
    var elenco = m.querySelector('.tappe-elenco'), voci = tutti(':scope > li', elenco); if (voci.length < 6) return;
    var PER_RIGA = 5, righe = Math.ceil(voci.length / PER_RIGA), CHIAVE = 'lpg-tappe-mappe', viste = {};
    try { (JSON.parse(localStorage.getItem(CHIAVE) || '[]') || []).forEach(function (k) { viste[k] = 1; }); } catch (e) {}
    var mappa = crea('div', 'tappe-mappa', '<svg aria-hidden="true"><polyline class="tm-via"/><polyline class="tm-fatta" pathLength="1"/></svg>');
    mappa.style.setProperty('--righe', righe); mappa.setAttribute('role', 'tablist'); mappa.setAttribute('aria-label', 'Le venticinque tappe');
    var punti = voci.map(function (li, i) {
      var r = Math.floor(i / PER_RIGA), c = i % PER_RIGA; if (r % 2) c = PER_RIGA - 1 - c;
      return [10 + c * 20, (r + 0.62) * (100 / righe)];
    });
    for (var r = 0; r < righe; r++) {
      var nome = voci[r * PER_RIGA].getAttribute('data-territorio');
      if (nome) { var et = crea('div', 'tm-territorio', '<b>' + ['I', 'II', 'III', 'IV', 'V', 'VI'][r] + '</b> ' + nome); et.style.top = (r * (100 / righe)) + '%'; mappa.appendChild(et); }
    }
    var bottoni = voci.map(function (li, i) {
      var b = crea('button', 'tm-punto' + (viste[i] ? ' vista' : ''), '<span>' + (i + 1) + '</span>'); b.type = 'button';
      b.style.left = punti[i][0] + '%'; b.style.top = punti[i][1] + '%'; b.setAttribute('aria-label', 'Tappa ' + (i + 1) + ': ' + li.querySelector('h3').textContent); b.setAttribute('aria-controls', 'tappa-pannello');
      mappa.appendChild(b); return b;
    });
    var svg = mappa.querySelector('svg'), via = mappa.querySelector('.tm-via'), fatta = mappa.querySelector('.tm-fatta'), lung = [0], s = null, n = voci.length;
    function disponi() {
      var W = mappa.clientWidth, H = mappa.clientHeight; if (!W || !H) return;
      var px = punti.map(function (p) { return [p[0] * W / 100, p[1] * H / 100]; }), pt = px.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); via.setAttribute('points', pt); fatta.setAttribute('points', pt);
      lung = [0]; for (var j = 1; j < n; j++) lung.push(lung[j - 1] + Math.hypot(px[j][0] - px[j - 1][0], px[j][1] - px[j - 1][1]));
      if (s && s.quale() >= 0) fatta.style.strokeDashoffset = (1 - lung[s.quale()] / lung[n - 1]).toFixed(4);
    }
    var barra = crea('div', 'tappe-barra', '<button type="button" class="cal-freccia" aria-label="Tappa precedente">←</button><div class="tappe-dove" aria-live="polite"></div><button type="button" class="cal-freccia" aria-label="Tappa successiva">→</button>');
    var dove = barra.querySelector('.tappe-dove'), conto = crea('p', 'tappe-conto'), mosso = false;
    elenco.id = 'tappa-pannello'; elenco.setAttribute('role', 'tabpanel');
    s = schede(bottoni, function (i) {
      voci.forEach(function (li, k) { li.classList.toggle('attiva', k === i); });
      if (lung.length === n) fatta.style.strokeDashoffset = (1 - lung[i] / lung[n - 1]).toFixed(4);
      dove.innerHTML = '<b>Tappa ' + (i + 1) + '</b> di ' + n + (voci[i].getAttribute('data-territorio') ? ' · ' + voci[i].getAttribute('data-territorio') : '');
      if (mosso) {
        segna(i);
        var q = barra.getBoundingClientRect(); if (q.top > window.innerHeight * 0.6 || q.top < 70) barra.scrollIntoView({ block: 'start', behavior: fermo ? 'auto' : 'smooth' });
      }
      scrivi();
    });
    function scrivi() {
      var fatte = Object.keys(viste).length;
      conto.innerHTML = fatte ? '<b>' + fatte + '</b> ' + (fatte === 1 ? 'tappa percorsa' : 'tappe percorse') + ' su ' + n + ' · il conto resta su questo dispositivo' : 'Tocca un numero sulla mappa per cominciare.';
    }
    function segna(i) {
      viste[i] = 1; bottoni[i].classList.add('vista');
      try { localStorage.setItem(CHIAVE, JSON.stringify(Object.keys(viste).map(Number))); } catch (e) {}
    }
    ascolta(mappa, 'click', function (e) { mosso = true; var b = e.target.closest('.tm-punto'), k = bottoni.indexOf(b); if (k >= 0 && k === s.quale()) { segna(k); scrivi(); } }, true); ascolta(mappa, 'keydown', function () { mosso = true; }, true);
    ascolta(barra.children[0], 'click', function () { mosso = true; s.scegli(s.quale() - 1); });
    ascolta(barra.children[2], 'click', function () { mosso = true; s.scegli(s.quale() + 1); });
    m.insertBefore(mappa, elenco); m.insertBefore(conto, elenco); m.insertBefore(barra, elenco); m.classList.add('viva');
    disponi(); ascolta(window, 'resize', disponi);
    var primaNuova = 0; while (primaNuova < n - 1 && viste[primaNuova]) primaNuova++;
    s.scegli(Object.keys(viste).length ? primaNuova : 0);
    pulizie.push(function () { mappa.remove(); barra.remove(); conto.remove(); m.classList.remove('viva'); voci.forEach(function (li) { li.classList.remove('attiva'); }); elenco.removeAttribute('role'); });
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
    menu(); lettura(); titolo(); costellazione(); indice(); bussola(); volto(); albero(); silenzio(); esercizi(); tappe(); calendario(); comparse(); apertura(); conta(); barra(); puntatore(); stelle();
  }
  window.LPG = { avvia: avvia };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', avvia); else avvia();
})();
