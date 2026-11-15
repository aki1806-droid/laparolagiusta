// ATTENZIONE: serve solo per rifare da capo le pagine del sito nuovo partendo da quelle del sito precedente
// (ramo salvataggio/sito-attuale-2026-11-15). Riscrive le 29 pagine, la home e la pagina autore: ogni ritocco fatto
// a mano dopo va perso. Dopo averlo lanciato servono sempre `node strumenti/libri.mjs` e `node strumenti/blog.mjs`.
// uso: node strumenti/trasforma.mjs <cartella del sito> 91aebb6
// Applica il nuovo stile a tutte le pagine partendo SEMPRE dagli originali (git, ramo main),
// cosi' si puo' rilanciare quante volte si vuole.
// uso: node trasforma.mjs <repo> <rif-git-originali> <dir-lavoro-autore>
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
const [,, REPO, RIF, DIR_AUTORE] = process.argv;
const orig = f => execFileSync('git', ['-C', REPO, 'show', `${RIF}:${f}`], { maxBuffer: 1 << 26 }).toString('utf8');
const dim = f => execFileSync('identify', ['-format', '%w %h', `${REPO}/${f}`]).toString().trim().split(' ').map(Number);

const FAMIGLIE = {
  'p-home': ['index'],
  'p-ebook': ['ilvoltononmente', 'artediascoltare', 'leparolechecurano', 'convinceresenzamanipolare', 'direnosenzaperderenessuno', 'parlareinpubblicosenzarecitare',
    'ilprimominuto', 'conversazionidifficili', 'ledomandegiuste', 'capirsiincasa', 'scrivereperfarsileggere', 'comunicarenellacrisi'],
  'p-corso': ['linguaggiononverbale', 'direascoltareconvincere'],
  'p-omaggio': ['cosa-dire', 'trenta-tecniche', 'prime-pagine', 'minicorso'],
  'p-grazie': ['grazie-ebook', 'grazie-prime-pagine', 'grazie-mini-corso'],
  'p-info': ['metodo-e-fonti', 'contatti', 'privacy', 'termini', 'cookie'],
  'p-info p-404': ['404'],
};
const VECCHIE = { ilprimominuto: 'il-primo-minuto', ledomandegiuste: 'le-domande-giuste', capirsiincasa: 'capirsi-in-casa', scrivereperfarsileggere: 'scrivere-per-farsi-leggere' };

const CIELO = '\n  <div class="cielo" aria-hidden="true"><i></i><i></i></div>';
const CADENTE = '\n  <span class="cadente" aria-hidden="true"></span>';
const SOCIAL = '<li><a href="https://www.facebook.com/laparolagiustaofficial" rel="me noopener" target="_blank">Facebook</a></li>' +
  '<li><a href="https://www.instagram.com/laparolagiustaofficial" rel="me noopener" target="_blank">Instagram</a></li>' +
  '<li><a href="https://www.youtube.com/@laparolagiustaofficial" rel="me noopener" target="_blank">YouTube</a></li>' +
  '<li><a href="https://www.tiktok.com/@laparolagiustaofficial" rel="me noopener" target="_blank">TikTok</a></li>';

function piede(conVisite, casa = './') {
  return `<footer class="fondo notte">${CIELO}
  <div class="wrap">
    <div class="fondo-scritta" aria-hidden="true">La parola giusta</div>
    <div class="fondo-griglia">
      <div>
        <a class="fondo-marchio" href="${casa}"><img decoding="async" width="440" height="386" src="img/c5acd835.webp" alt="" loading="lazy"><span>La parola giusta</span></a>
        <p class="fondo-motto">Corsi, libri ed ebook di Achille Pagliaro sulla comunicazione e su tutte le sue sfumature.</p>
      </div>
      <nav aria-label="Piè di pagina">
        <h2>Il sito</h2>
        <ul>
          <li><a href="${casa}#corsi">Corsi</a></li>
          <li><a href="${casa}#libri">Libri</a></li>
          <li><a href="${casa}#ebook">Ebook</a></li>
          <li><a href="blog/">Il taccuino</a></li>
          <li><a href="achillepagliaro.html">L'autore</a></li>
        </ul>
      </nav>
      <nav aria-label="Informazioni">
        <h2>Informazioni</h2>
        <ul>
          <li><a href="metodo-e-fonti.html">Metodo e fonti</a></li>
          <li><a href="contatti.html">Contatti</a></li>
          <li><a href="termini.html">Termini</a></li>
          <li><a href="privacy.html">Privacy</a></li>
          <li><a href="cookie.html">Cookie</a></li>
        </ul>
      </nav>
      <div>
        <h2>Altrove</h2>
        <ul>
          ${SOCIAL}
          <li><a href="mailto:info@laparolagiusta.it">info@laparolagiusta.it</a></li>
        </ul>
      </div>
    </div>
    <div class="fondo-basso">
      <div>© 2026 La parola giusta</div>
      <div class="piede-dati">Achille Pagliaro · Corsi ed ebook venduti tramite Skillplate</div>${conVisite ? '\n      <div class="piede-visite" id="visite" hidden><span class="visite-n"></span> visite</div>' : ''}
    </div>
  </div>
</footer>`;
}

const una = (h, re, con, cosa) => { if (!re.test(h)) throw new Error('non trovato: ' + cosa); return h.replace(re, con); };
const rapporto = [];

function comune(nome, h, classe) {
  // --- testa: via Google Fonts e i font ripetuti, dentro i due fogli comuni ---
  h = h.replace(/<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*/g, '');
  h = h.replace(/\/\* La Parola Giusta — font serviti[^*]*\*\/\s*/g, '').replace(/@font-face\s*\{[^}]*\}\s*/g, '');
  h = una(h, /<\/head>/, '<link rel="stylesheet" href="css/sito.css">\n<link rel="stylesheet" href="css/pagine.css">\n</head>', '</head> ' + nome);
  h = una(h, /<body(\s[^>]*)?>/, `<body class="${classe}">`, 'body ' + nome);
  // --- immagini senza misure dichiarate: le leggo dal file, cosi' la pagina non salta mentre carica ---
  h = h.replace(/<img\b(?![^>]*\bwidth=)([^>]*?)src="(img\/[^"]+)"([^>]*)>/g, (_, a, f, b) => { const [w, hh] = dim(f); return `<img decoding="async" width="${w}" height="${hh}"${a}src="${f}"${b}>`; });
  // --- aperture e sezioni scure: cielo notturno ---
  h = h.replace(/<header class="hero([^"]*)"([^>]*)>/, (_, c, r) => `<header class="hero${c} notte"${r}>${CIELO}${CADENTE}`);
  h = h.replace(/<section class="([^"]*\b(?:scura|box-corso)\b[^"]*)"([^>]*)>/g, (_, c, r) => `<section class="${c} notte"${r}>${CIELO}`);
  // --- la chiusura diventa una sezione notturna ---
  h = h.replace(/<section class="chiusura(?: tinta)?"([^>]*)>/g, (_, r) => `<section class="chiusura notte"${r}>${CIELO}`);
  // --- piede comune ---
  const visite = /id="visite"/.test(h);
  h = una(h, /<footer[\s>][\s\S]*?<\/footer>/, piede(visite), 'footer ' + nome);
  // --- script comune ---
  h = una(h, /<\/body>/, '<script src="js/sito.js" defer></script>\n</body>', '</body> ' + nome);
  return h;
}

function vecchia(nome, h) {
  // le cinque schede piu' vecchie: logo e immagini dentro la pagina, link assoluti, nessun "salta al contenuto"
  const slug = VECCHIE[nome];
  let n = 0;
  h = h.replace(/<img\b([^>]*?)src="data:image\/(png|jpeg);base64,([^"]+)"([^>]*)>/g, (tutto, a, tipo, dati, b) => {
    const att = (a + b);
    const alt = (att.match(/alt="([^"]*)"/) || [, ''])[1];
    if (tipo === 'png' && alt === '') return '<img decoding="async" width="440" height="386" src="img/c5acd835.webp" alt="">';
    if (!slug) throw new Error('immagine inattesa in ' + nome);
    let file;
    if (/^Copertina/.test(alt)) file = `img/copertina-di-${slug}.jpg`;
    else { n++; file = `img/natura-morta-${slug}-${n}.jpg`; }
    const buf = Buffer.from(dati, 'base64');
    if (!existsSync(`${REPO}/${file}`) || !readFileSync(`${REPO}/${file}`).equals(buf)) writeFileSync(`${REPO}/${file}`, buf);
    const [w, hh] = dim(file);
    return `<img decoding="async" width="${w}" height="${hh}" src="${file}" alt="${alt}"${/Natura/.test(alt) ? ' loading="lazy"' : ''}>`;
  });
  h = h.replace(/href="https:\/\/laparolagiusta\.it(?:\/)?(#[a-z-]+)?"/g, (_, anc) => `href="./${anc || ''}"`);
  h = h.replace(/href="https:\/\/laparolagiusta\.it\/([a-z-]+\.html)"/g, 'href="$1"');
  if (!/class="salta"/.test(h)) {
    h = una(h, /<body([^>]*)>\s*/, '<body$1>\n<a class="salta" href="#principale">Vai al contenuto</a>\n', 'body salta ' + nome);
    h = una(h, /<\/header>\s*/, '</header>\n\n<div id="principale"></div>', 'fine apertura ' + nome);
  }
  return h;
}

const EMOZIONI = [
  ['gioia', 'Gioia', 'Gli angoli della bocca salgono, le guance si sollevano e accanto agli occhi compaiono le pieghe. Se gli occhi restano fermi, è un sorriso di cortesia.'],
  ['tristezza', 'Tristezza', 'Gli angoli interni delle sopracciglia salgono, le palpebre si abbassano, gli angoli della bocca scendono.'],
  ['rabbia', 'Rabbia', 'Le sopracciglia si abbassano e si avvicinano, lo sguardo si fa fisso, le labbra si stringono.'],
  ['paura', 'Paura', 'Le sopracciglia salgono e si avvicinano, gli occhi si spalancano, le labbra si tendono all\'indietro.'],
  ['sorpresa', 'Sorpresa', 'Le sopracciglia salgono ad arco, gli occhi si aprono, la mandibola scende. È la più breve di tutte.'],
  ['disgusto', 'Disgusto', 'Il naso si arriccia, il labbro superiore si solleva, le sopracciglia scendono.'],
  ['disprezzo', 'Disprezzo', 'Un solo angolo della bocca si tende e sale. È l\'unica espressione asimmetrica delle sette.'],
];
function sezioneVolto(intro) {
  return `<section class="notte volto-sez" id="emozioni">${CIELO}
  <div class="wrap">
    <div class="etichetta">Prova tu</div>
    <h2>Sette emozioni, <em>un volto solo</em></h2>
    <p class="intro">${intro}</p>
    <div class="volto">
      <ol class="emozioni">
${EMOZIONI.map(e => `        <li data-e="${e[0]}"><h3>${e[1]}</h3><p>${e[2]}</p></li>`).join('\n')}
      </ol>
      <p class="volto-nota">Il disegno è uno schema: dal vivo questi segnali durano una frazione di secondo e vanno sempre letti insieme al contesto.</p>
    </div>
  </div>
</section>

`;
}

function info(h) {
  // le tabelle larghe scorrono dentro la loro cornice invece di allargare la pagina
  h = h.replace(/<table[\s\S]*?<\/table>/g, t => `<div class="tabella" tabindex="0" role="region" aria-label="Tabella, scorre in orizzontale">${t}</div>`);
  return una(h, /(<div class="wrap stretto testata">[\s\S]*?<\/div>)(\s*<main)/,
    `<div class="testata-notte notte">${CIELO}${CADENTE}\n$1\n</div>$2`, 'testata');
}

function home(h) {
  // nastro di parole sotto l'apertura
  const parole = ['ascoltare', 'dire', 'convincere', 'capire', 'chiedere', 'tacere', 'guardare', 'rispondere', 'spiegare', 'dire di no'];
  const giro = parole.map(p => `<span>${p}</span>`).join('');
  h = una(h, /<\/header>\s*/, `</header>\n\n<div class="nastro" aria-hidden="true"><div class="nastro-fascia"><div class="nastro-in">${giro}${giro}</div></div></div>\n\n`, 'fine apertura home');
  h = una(h, /<b>Accesso a vita<\/b>, pagamento unico/, '<b>Accesso a vita</b> pagamento unico', 'fascia');
  // scaffale degli ebook: copertine grandi prese dalle rispettive schede
  h = una(h, /<div class="ebook-griglia">([\s\S]*?)\n    <\/div>\n  <\/div>\n<\/section>/, (_, dentro) => {
    const voci = [...dentro.matchAll(/<article class="ebook">([\s\S]*?)<\/article>/g)].map(m => m[1]);
    if (voci.length !== 12) throw new Error('ebook trovati: ' + voci.length);
    const out = voci.map(v => {
      const num = v.match(/<div class="ebook-n">([^<]+)<\/div>/)[1];
      const tit = v.match(/<h3>([\s\S]*?)<\/h3>/)[1];
      const par = v.match(/<p>([\s\S]*?)<\/p>/)[1];
      const [, href, testo] = v.match(/<a class="link-negozio" href="([^"]+)">([^<]+)<\/a>/);
      const pag = readFileSync(`${REPO}/${href}`, 'utf8');
      const cop = pag.match(/<div class="cop"><img[^>]*?width="(\d+)" height="(\d+)"[^>]*?src="([^"]+)"/);
      if (!cop) throw new Error('copertina non trovata in ' + href);
      return `      <article class="ebook">
        <div class="ebook-n" aria-hidden="true">${num}</div>
        <a class="ebook-cop-g" href="${href}" tabindex="-1" aria-hidden="true"><img decoding="async" loading="lazy" width="${cop[1]}" height="${cop[2]}" src="${cop[3]}" alt=""></a>
        <div class="ebook-testo">
          <h3>${tit}</h3>
          <p>${par}</p>
          <a class="link-negozio" href="${href}">${testo}</a>
        </div>
      </article>`;
    }).join('\n');
    return `<div class="scaffale">\n${out}\n    </div>\n    <p class="scaffale-nota" aria-hidden="true">Scorri per vederli tutti →</p>\n  </div>\n</section>`;
  }, 'griglia ebook');
  // bussola: otto bisogni, otto punti di partenza; titoli e descrizioni sono quelli gia' scritti in questa pagina
  const descr = t => { const m = h.match(new RegExp('<h3>' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</h3>\\s*<p>([\\s\\S]*?)</p>')); if (!m) throw new Error('descrizione non trovata: ' + t); return m[1].trim(); };
  const ROTTE = [
    ['Non capisco cosa pensa davvero chi ho davanti', 'Corso online', 'Capire i segni del linguaggio non verbale', 'linguaggiononverbale.html', null, 'Guarda il corso'],
    ['Ho ragione, ma non riesco a farla passare', 'Corso online', 'Dire, ascoltare, convincere', 'direascoltareconvincere.html', null, 'Guarda il corso'],
    ['Sul momento non so mai cosa dire', 'Ebook gratuito', 'Cosa dire quando non sai cosa dire', 'cosa-dire.html', 'Venti situazioni in cui le parole non vengono, e la frase da cui ripartire. Arriva per email, gratis.', 'Ricevilo gratis'],
    ['Non riesco a dire di no', 'Ebook', 'Dire no senza perdere nessuno', 'direnosenzaperderenessuno.html', null, 'Vai al libro'],
    ['C\'è una conversazione che continuo a rimandare', 'Ebook', 'Conversazioni difficili', 'conversazionidifficili.html', null, 'Vai al libro'],
    ['Devo parlare davanti a tutti', 'Ebook', 'Parlare in pubblico senza recitare', 'parlareinpubblicosenzarecitare.html', null, 'Vai al libro'],
    ['In casa non ci capiamo più', 'Ebook', 'Capirsi in casa', 'capirsiincasa.html', null, 'Vai al libro'],
    ['Sto accanto a qualcuno che sta male', 'Ebook', 'Le parole che curano', 'leparolechecurano.html', null, 'Vai al libro'],
  ];
  const rotte = ROTTE.map(([bis, tipo, tit, href, d, vai]) => `        <li>
          <span class="rotta-bisogno">«${bis}»</span>
          <a class="rotta-meta" href="${href}"><span class="rotta-tipo">${tipo}</span><strong class="rotta-titolo">${tit}</strong><span class="rotta-desc">${d || descr(tit)}</span><span class="rotta-vai">${vai} →</span></a>
        </li>`).join('\n');
  h = una(h, /(<!-- CORSI -->\s*)?<section id="corsi">/, m => `<!-- BUSSOLA -->
<section class="notte bussola-sez" id="bussola">${CIELO}
  <div class="wrap">
    <div class="etichetta">Da dove cominci</div>
    <h2>Scegli la frase che <em>ti somiglia</em>.</h2>
    <p class="intro">Ognuna porta a un punto di partenza diverso: un corso, un libro, a volte un ebook gratuito.</p>
    <div class="bussola">
      <ul class="rotte">
${rotte}
      </ul>
    </div>
  </div>
</section>

${m}`, 'sezione corsi');
  // voce di menu e segnaposto per gli ultimi post del taccuino (li scrive strumenti/blog.mjs)
  h = una(h, /(<a href="#ebook">Ebook<\/a>\s*)(<\/div>)/, '$1  <a href="blog/">Taccuino</a>\n    $2', 'menu home');
  h = una(h, /(<!-- NEWSLETTER -->\s*)?<section class="tinta" id="newsletter">/, m => `<!-- blog:inizio -->\n<!-- blog:fine -->\n\n${m}`, 'segnaposto taccuino');
  // Eredita' Invisibili: la copertina vera al posto del segnaposto
  h = una(h, /<div class="libro-img copertina"><div class="attesa"><span>In arrivo<\/span><\/div><\/div>\s*<div class="formato">In uscita<\/div>/,
    '<div class="libro-img copertina"><img decoding="async" width="700" height="994" src="img/copertina-di-eredita-invisibili.webp" alt="Copertina di Eredità Invisibili" loading="lazy"></div>\n        <div class="formato">Dal 20 novembre 2026</div>', 'eredita in home');
  h = h.replace('<article class="libro in-arrivo">', '<article class="libro">');
  // dal 15 novembre c'e' la scheda Amazon del terzo libro
  h = una(h, /(<a class="link-negozio" href="https:\/\/sendfox\.com\/form\/1gqrw6\/m8wkz2">Ricevi 9 estratti<\/a>)/, '$1\n          <a class="link-negozio" href="https://www.amazon.it/dp/8893606437">Acquista su Amazon</a>', 'amazon eredita in home');
  // le due pagine dedicate ai libri
  h = una(h, /(<a class="link-negozio" href="https:\/\/www\.amazon\.it\/Volo-delle-Radici[^"]*">)/, '<a class="link-negozio" href="ilvolodelleradici.html">Entra nel libro</a>\n          $1', 'link volo in home');
  h = una(h, /(<a class="link-negozio" href="https:\/\/www\.amazon\.it\/Mappe-silenziose[^"]*">)/, '<a class="link-negozio" href="mappesilenziose.html">Entra nel libro</a>\n          $1', 'link mappe in home');
  return h;
}

function autore() {
  // la pagina autore tiene i suoi componenti; menu, pulsanti, comparse e piede vengono aggiornati dal foglio comune
  let h = execFileSync('git', ['-C', REPO, 'show', '13ac565:achillepagliaro.html'], { maxBuffer: 1 << 26 }).toString('utf8');
  h = h.replace(/\/\* La Parola Giusta — font serviti[^*]*\*\/\s*/g, '').replace(/@font-face\s*\{[^}]*\}\s*/g, '');
  h = una(h, /<\/head>/, '<link rel="stylesheet" href="css/sito.css">\n</head>', '</head> autore');
  h = una(h, /<body>/, '<body class="p-autore">', 'body autore');
  h = una(h, /(<a class="btn btn-blu" href="https:\/\/www\.amazon\.it\/Volo-delle-Radici[^"]*">Acquista su Amazon<\/a>)/, '$1\n          <a class="btn btn-linea" href="ilvolodelleradici.html">Entra nel libro</a>', 'link volo in autore');
  h = una(h, /(<a class="btn btn-blu" href="https:\/\/www\.amazon\.it\/Mappe-silenziose[^"]*">Acquista su Amazon<\/a>)/, '$1\n          <a class="btn btn-linea" href="mappesilenziose.html">Entra nel libro</a>', 'link mappe in autore');
  // Eredita' Invisibili su Amazon: scheda del libro, scelta finale, riga in apertura, domanda sull'uscita, dati strutturati
  const AMAZON_EREDITA = 'https://www.amazon.it/dp/8893606437';
  h = una(h, /<a class="btn btn-blu" href="(https:\/\/sendfox\.com\/form\/1gqrw6\/m8wkz2)">Ricevi 9 estratti in anteprima<\/a>/,
    `<a class="btn btn-blu" href="${AMAZON_EREDITA}"><span class="prima">Ordinalo su Amazon</span><span class="dopo">Acquista su Amazon</span></a>\n          <a class="btn btn-linea" href="$1">Ricevi 9 estratti gratis</a>`, 'amazon eredita nella scheda');
  h = una(h, /(<a class="btn btn-linea-chiara" href="https:\/\/sendfox\.com\/form\/1gqrw6\/m8wkz2">Ricevi 9 estratti<\/a>)/,
    `<a class="btn btn-luce" href="${AMAZON_EREDITA}"><span class="prima">Ordinalo su Amazon</span><span class="dopo">Acquista su Amazon</span></a>\n        <a class="scelta-anche" href="https://sendfox.com/form/1gqrw6/m8wkz2">oppure ricevi 9 estratti gratis</a>`, 'amazon eredita nella scelta');
  h = una(h, /(<p class="hero-scheda sale" style="--i:8">Edizioni Il Saggio · 20 €)(<\/p>)/, `$1 · <a href="${AMAZON_EREDITA}">su Amazon</a>$2`, 'amazon eredita in apertura');
  h = una(h, /Esce il 20 novembre per Edizioni Il Saggio, a 20 euro\. Nel frattempo/, `Esce il 20 novembre per Edizioni Il Saggio, a 20 euro, e si può già <a href="${AMAZON_EREDITA}">ordinare su Amazon</a>. Nel frattempo`, 'amazon eredita nelle domande, prima');
  h = una(h, /È uscito il 20 novembre per Edizioni Il Saggio, a 20 euro\. Se vuoi/, `È uscito il 20 novembre per Edizioni Il Saggio, a 20 euro: lo trovi <a href="${AMAZON_EREDITA}">su Amazon</a>. Se vuoi`, 'amazon eredita nelle domande, dopo');
  h = una(h, /("datePublished":"2026-11-20","inLanguage":"it","bookFormat":"https:\/\/schema\.org\/Paperback",)/, `$1"isbn":"9788893606431","numberOfPages":240,"sameAs":"${AMAZON_EREDITA}",`, 'dati strutturati eredita');
  h = una(h, /<footer[\s>][\s\S]*?<\/footer>/, piede(false, 'index.html'), 'footer autore');
  h = una(h, /<\/body>/, '<script src="js/sito.js" defer></script>\n</body>', '</body> autore');
  return h;
}

// 1) schede vecchie prima di tutto: la home legge da li' le copertine
const pagine = {};
for (const [classe, nomi] of Object.entries(FAMIGLIE)) for (const nome of nomi) {
  let h = orig(nome + '.html');
  const prima = h.length;
  if (classe === 'p-ebook' && /data:image|href="https:\/\/laparolagiusta\.it"/.test(h)) h = vecchia(nome, h);
  if (classe.startsWith('p-info')) h = info(h);
  h = comune(nome, h, classe);
  if (nome === 'linguaggiononverbale') h = una(h, /(<section>\s*<div class="wrap stretto">\s*<h2>Com'è fatto<\/h2>)/,
    sezioneVolto('Scegli un\'emozione e guarda dove cambia il viso. Sono i segnali che il corso insegna a riconoscere dal vivo, lezione per lezione.') + '$1', 'volto nel corso');
  if (nome === 'ilvoltononmente') h = una(h, /(<div class="estratto">[\s\S]*?<\/section>\s*)/,
    '$1' + sezioneVolto('Scegli un\'emozione e guarda dove cambia il viso. Il capitolo 4 le attraversa una per una, con i segnali da cercare.'), 'volto nel libro');
  pagine[nome] = h;
  if (nome !== 'index') writeFileSync(`${REPO}/${nome}.html`, h);
  rapporto.push([nome, classe, prima, h.length]);
}
pagine.index = home(pagine.index);
writeFileSync(`${REPO}/index.html`, pagine.index);
rapporto.find(r => r[0] === 'index')[3] = pagine.index.length;
const a = autore();
writeFileSync(`${REPO}/achillepagliaro.html`, a);
rapporto.push(['achillepagliaro', 'p-autore', 0, a.length]);
for (const r of rapporto) console.log(r[0].padEnd(32), r[1].padEnd(14), String(Math.round(r[2] / 1024)).padStart(5) + ' KB ->', String(Math.round(r[3] / 1024)).padStart(4) + ' KB');
