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
    [['Home', './'], ['Corsi', inHome ? '#corsi' : './#corsi'], ['Libri', 'achillepagliaro.html'], ['Ebook', inHome ? '#ebook' : './#ebook'],
     ['Ebook gratuiti', 'cosa-dire.html'], ['Contatti', 'contatti.html']].forEach(function (v) {
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
    html += '<div class="menu-piede"><a href="https://corsi.laparolagiusta.it/login">Accedi ai corsi</a><a href="metodo-e-fonti.html">Metodo e fonti</a><a href="mailto:info@laparolagiusta.it">info@laparolagiusta.it</a></div>';
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
    '.fondo-griglia > *, .fondo-scritta, main > .wrap > h2, main > .wrap > .riquadro, .chiusura p, .chiusura .btn';
  function comparse() {
    if (d.body.classList.contains('p-autore')) return;   // la pagina autore ha le sue
    var els = tutti(DA_MOSTRARE).filter(function (e) { return !e.closest('.hero') && !e.closest('.menu') && !e.classList.contains('r'); });
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

  function avvia() {
    pulizie.forEach(function (f) { try { f(); } catch (e) {} }); pulizie = [];
    if (h.className.indexOf(' js') < 0 && !h.classList.contains('js')) h.classList.add('js');
    menu(); lettura(); titolo(); comparse(); apertura(); conta(); barra();
  }
  window.LPG = { avvia: avvia };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', avvia); else avvia();
})();
