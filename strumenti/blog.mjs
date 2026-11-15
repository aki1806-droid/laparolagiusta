// Il taccuino (blog) di La Parola Giusta: costruisce le pagine dai post in blog/_post/*.md
//
//   node strumenti/blog.mjs                 costruisce tutto
//   node strumenti/blog.mjs --senza-esempi  come sopra, ma ignora i post con "esempio: si"
//   node strumenti/blog.mjs --prossimo      prima di costruire, pubblica con la data di oggi il primo post
//                                           in coda (blog/_coda/NN-titolo-breve.md); se oggi c'e' gia' un post non fa nulla
//
// L'immagine di un post puo' anche solo esistere: se c'e' img/blog/<titolo-breve>.webp viene usata da sola.
//
// Un post e' un file  blog/_post/AAAA-MM-GG-titolo-breve.md  fatto cosi':
//
//   ---
//   titolo: Tre segnali in otto minuti
//   data: 2026-11-14
//   sommario: Una riga che invoglia a leggere (compare negli elenchi e su Google).
//   immagine: img/blog/nome.webp        (facoltativa)
//   ---
//   Testo del post. Righe vuote tra i paragrafi.
//   ## Titoletto     > citazione     - elenco     **grassetto**  *corsivo*  [link](https://...)
//
// Lo script scrive blog/index.html, una pagina per post, blog/feed.xml, aggiorna gli ultimi
// tre post in home (tra i commenti "blog:inizio" e "blog:fine") e le voci del blog in sitemap.xml.
// Non usa nessuna libreria: basta Node.
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const SENZA_ESEMPI = process.argv.includes('--senza-esempi');
const SITO = 'https://laparolagiusta.it/';
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const maiuscola = s => s.charAt(0).toUpperCase() + s.slice(1);

// ------------------------------------------------------------------ testo
function riga(t) {
  // corsivo, grassetto, link dentro una riga; il resto e' testo semplice
  let h = esc(t);
  h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, testo, url) => {
    const esterno = /^https?:/.test(url) && !url.startsWith(SITO);
    const href = /^(https?:|mailto:|#|\.\.\/)/.test(url) ? url : '../' + url;
    return `<a href="${href}"${esterno ? ' target="_blank" rel="noopener"' : ''}>${testo}</a>`;
  });
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return h;
}
function corpo(md) {
  const blocchi = md.replace(/\r/g, '').trim().split(/\n\s*\n/);
  return blocchi.map(b => {
    const righe = b.split('\n').map(r => r.trim()).filter(Boolean);
    if (!righe.length) return '';
    if (/^###\s+/.test(righe[0])) return `<h3>${riga(righe[0].replace(/^###\s+/, ''))}</h3>`;
    if (/^##\s+/.test(righe[0])) return `<h2>${riga(righe[0].replace(/^##\s+/, ''))}</h2>`;
    if (/^-{3,}$/.test(righe[0])) return '<hr>';
    if (righe.every(r => /^>\s?/.test(r))) return `<blockquote><p>${riga(righe.map(r => r.replace(/^>\s?/, '')).join(' '))}</p></blockquote>`;
    if (righe.every(r => /^[-•]\s+/.test(r))) return `<ul>\n${righe.map(r => `  <li>${riga(r.replace(/^[-•]\s+/, ''))}</li>`).join('\n')}\n</ul>`;
    if (righe.every(r => /^\d+[.)]\s+/.test(r))) return `<ol>\n${righe.map(r => `  <li>${riga(r.replace(/^\d+[.)]\s+/, ''))}</li>`).join('\n')}\n</ol>`;
    const img = righe.length === 1 && righe[0].match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) return figura(img[2], img[1]);
    return `<p>${riga(righe.join(' '))}</p>`;
  }).filter(Boolean).join('\n');
}
function misure(file) {
  // larghezza e altezza di un'immagine WebP, PNG o JPEG, lette dal file (per non far saltare la pagina)
  try {
    const b = readFileSync(join(REPO, file));
    if (b.toString('ascii', 1, 4) === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
    if (b.toString('ascii', 0, 4) === 'RIFF') {
      const t = b.toString('ascii', 12, 16);
      if (t === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
      if (t === 'VP8L') { const n = b.readUInt32LE(21); return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1]; }
      if (t === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) { const m = b[i + 1], l = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + l; }
    }
  } catch (e) { /* niente misure: l'immagine si vede lo stesso */ }
  return null;
}
function figura(file, alt, classe = '') {
  if (!existsSync(join(REPO, file))) throw new Error('immagine non trovata: ' + file);
  const m = misure(file);
  return `<figure${classe ? ` class="${classe}"` : ''}><img decoding="async" loading="lazy"${m ? ` width="${m[0]}" height="${m[1]}"` : ''} src="../${esc(file)}" alt="${esc(alt)}"></figure>`;
}

// ------------------------------------------------------------------ post
const DIR = join(REPO, 'blog', '_post');
mkdirSync(DIR, { recursive: true });
// --- la coda: i post gia' scritti che aspettano il loro giorno ---
const CODA = join(REPO, 'blog', '_coda');
const iProssimo = process.argv.indexOf('--prossimo');
if (iProssimo >= 0) {
  const arg = process.argv[iProssimo + 1];
  const oggi = /^\d{4}-\d{2}-\d{2}$/.test(arg || '') ? arg : new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
  const inCoda = existsSync(CODA) ? readdirSync(CODA).filter(f => f.endsWith('.md')).sort() : [];
  if (readdirSync(DIR).some(f => f.startsWith(oggi + '-'))) console.log(`PROSSIMO: per il ${oggi} c'è già un post, la coda resta com'è (${inCoda.length} in attesa)`);
  else if (!inCoda.length) console.log('PROSSIMO: CODA VUOTA, nessun post da pubblicare');
  else {
    const f = inCoda[0], slug = f.replace(/^\d+-/, '').replace(/\.md$/, '');
    let t = readFileSync(join(CODA, f), 'utf8');
    t = /^data:.*$/m.test(t) ? t.replace(/^data:.*$/m, 'data: ' + oggi) : t.replace(/^(titolo:.*)$/m, '$1\ndata: ' + oggi);
    writeFileSync(join(DIR, `${oggi}-${slug}.md`), t);
    unlinkSync(join(CODA, f));
    const prompt = (t.match(/^prompt:\s*(.*)$/m) || [])[1];
    console.log(`PROSSIMO: pubblicato "${slug}" con data ${oggi} · restano ${inCoda.length - 1} in coda`);
    console.log(`IMMAGINE: img/blog/${slug}.webp` + (prompt ? ` · prompt: ${prompt}` : ''));
  }
}

let post = readdirSync(DIR).filter(f => f.endsWith('.md')).map(f => {
  const m = f.match(/^(\d{4})-(\d{2})-(\d{2})-([a-z0-9-]+)\.md$/);
  if (!m) throw new Error(`nome non valido: ${f} (deve essere AAAA-MM-GG-titolo-breve.md, minuscole senza accenti)`);
  const testo = readFileSync(join(DIR, f), 'utf8');
  const t = testo.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!t) throw new Error(`${f}: manca l'intestazione tra le due righe ---`);
  const dati = {};
  for (const r of t[1].split('\n')) { const k = r.match(/^([a-z]+):\s*(.*)$/); if (k) dati[k[1]] = k[2].trim(); }
  if (!dati.titolo) throw new Error(`${f}: manca il titolo`);
  const data = dati.data || `${m[1]}-${m[2]}-${m[3]}`;
  const [a, me, g] = data.split('-').map(Number);
  const parole = t[2].split(/\s+/).filter(Boolean).length;
  const html = corpo(t[2]);
  const sommario = dati.sommario || t[2].replace(/[#>*_\[\]]/g, '').trim().split(/\n\s*\n/)[0].replace(/\s+/g, ' ').slice(0, 170);
  const immagine = dati.immagine || (existsSync(join(REPO, 'img', 'blog', m[4] + '.webp')) ? `img/blog/${m[4]}.webp` : '');
  return { file: f, slug: m[4], titolo: dati.titolo, data, a, me, g, sommario, immagine, esempio: /^(si|sì|true)$/i.test(dati.esempio || ''), html, minuti: Math.max(1, Math.round(parole / 200)),
    giorno: `${g} ${MESI[me - 1]} ${a}` };
});
if (SENZA_ESEMPI) post = post.filter(p => !p.esempio);
post.sort((x, y) => (x.data < y.data ? 1 : x.data > y.data ? -1 : x.slug < y.slug ? -1 : 1));   // dal piu' recente
const doppi = post.map(p => p.slug).filter((s, i, v) => v.indexOf(s) !== i);
if (doppi.length) throw new Error('due post con lo stesso indirizzo: ' + doppi.join(', '));

// --------------------------------------------------------------- modello
const BASE = `:root{--blu:#12294A;--blu-scuro:#0B1B33;--oro:#C39A4E;--oro-tenue:#E2D2B0;--panna:#F7F3EA;--panna-2:#EFE9DC;--bianco:#FFFCF6;--testo:#1C2B3F;--tenue:#69748A;--linea:#DED5C2;--serif:"Cormorant Garamond",Georgia,serif;--sans:"Jost",system-ui,sans-serif}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--panna);color:var(--testo);font-family:var(--sans);font-weight:300;font-size:17px;line-height:1.75;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
a{color:var(--blu)}
h1,h2,h3{font-family:var(--serif);font-weight:400;line-height:1.14;color:var(--blu);margin:0}
p{margin:0 0 1.15em}
.wrap{width:100%;max-width:1160px;margin:0 auto;padding:0 24px}
.stretto{max-width:730px}
.nav{position:sticky;top:0;z-index:60}
.nav-in{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:66px}
.marchio{display:flex;align-items:center;gap:11px;text-decoration:none}
.marchio img{height:38px;width:auto}
.marchio span{font-family:var(--serif);font-size:21px;white-space:nowrap}
.nav-menu{display:flex;align-items:center;gap:24px}
.nav-menu a{text-decoration:none;font-size:14px;letter-spacing:.04em;white-space:nowrap}
.etichetta{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--oro);margin-bottom:16px}
.btn{display:inline-block;font-size:15px;letter-spacing:.03em;padding:15px 30px;border-radius:999px;text-decoration:none;border:1px solid transparent;cursor:pointer}
.btn-blu{background:var(--blu);color:var(--panna)}
.btn-linea{border-color:var(--blu);color:var(--blu)}
a:focus-visible,button:focus-visible{outline:2px solid var(--blu);outline-offset:3px;border-radius:3px}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`;

const CIELO = '<div class="cielo" aria-hidden="true"><i></i><i></i></div>';
function pagina({ titolo, descrizione, percorso, corpoPagina, tipoOg = 'website', immagine, ld, indicizza = true }) {
  const url = SITO + 'blog/' + percorso;
  const og = SITO + (immagine || 'img/social/index-og.jpg');
  return `<!DOCTYPE html>
<html lang="it" data-radice="../">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titolo)}</title>
<meta name="description" content="${esc(descrizione)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${indicizza ? 'index, follow, max-image-preview:large' : 'noindex, follow'}">
<meta name="theme-color" content="#12294A">
<meta name="author" content="Achille Pagliaro">
<meta property="og:type" content="${tipoOg}">
<meta property="og:site_name" content="La Parola Giusta">
<meta property="og:locale" content="it_IT">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(titolo)}">
<meta property="og:description" content="${esc(descrizione)}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" type="application/rss+xml" title="Il taccuino — La Parola Giusta" href="${SITO}blog/feed.xml">
<link rel="icon" href="../favicon.ico" sizes="48x48">
<link rel="icon" href="../favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<link rel="manifest" href="../site.webmanifest">
<link rel="preload" href="../fonts/cormorant-garamond-300-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../fonts/jost-300-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>
${BASE}
</style>
<link rel="stylesheet" href="../css/sito.css">
<link rel="stylesheet" href="../css/pagine.css">
</head>
<body class="p-blog">
<a class="salta" href="#principale">Vai al contenuto</a>
<nav class="nav">
  <div class="wrap nav-in">
    <a class="marchio" href="../"><img decoding="async" width="440" height="386" src="../img/c5acd835.webp" alt=""><span>La parola giusta</span></a>
    <div class="nav-menu">
      <a class="ritorno" href="../">Home</a>
      <a href="../#corsi">Corsi</a>
      <a href="../#ebook">Ebook</a>
      <a href="./">Taccuino</a>
      <a class="nav-btn" href="../#newsletter-settimanale">Iscriviti</a>
    </div>
  </div>
</nav>
${corpoPagina}
<footer class="fondo notte">
  ${CIELO}
  <div class="wrap">
    <div class="fondo-scritta" aria-hidden="true">La parola giusta</div>
    <div class="fondo-griglia">
      <div>
        <a class="fondo-marchio" href="../"><img decoding="async" width="440" height="386" src="../img/c5acd835.webp" alt="" loading="lazy"><span>La parola giusta</span></a>
        <p class="fondo-motto">Corsi, libri ed ebook di Achille Pagliaro sulla comunicazione e su tutte le sue sfumature.</p>
      </div>
      <nav aria-label="Piè di pagina">
        <h2>Il sito</h2>
        <ul>
          <li><a href="../#corsi">Corsi</a></li>
          <li><a href="../#libri">Libri</a></li>
          <li><a href="../#ebook">Ebook</a></li>
          <li><a href="./">Il taccuino</a></li>
          <li><a href="../achillepagliaro.html">L'autore</a></li>
        </ul>
      </nav>
      <nav aria-label="Informazioni">
        <h2>Informazioni</h2>
        <ul>
          <li><a href="../metodo-e-fonti.html">Metodo e fonti</a></li>
          <li><a href="../contatti.html">Contatti</a></li>
          <li><a href="../termini.html">Termini</a></li>
          <li><a href="../privacy.html">Privacy</a></li>
          <li><a href="../cookie.html">Cookie</a></li>
        </ul>
      </nav>
      <div>
        <h2>Altrove</h2>
        <ul>
          <li><a href="https://www.facebook.com/laparolagiustaofficial" rel="me noopener" target="_blank">Facebook</a></li><li><a href="https://www.instagram.com/laparolagiustaofficial" rel="me noopener" target="_blank">Instagram</a></li><li><a href="https://www.youtube.com/@laparolagiustaofficial" rel="me noopener" target="_blank">YouTube</a></li><li><a href="https://www.tiktok.com/@laparolagiustaofficial" rel="me noopener" target="_blank">TikTok</a></li>
          <li><a href="mailto:info@laparolagiusta.it">info@laparolagiusta.it</a></li>
        </ul>
      </div>
    </div>
    <div class="fondo-basso">
      <div>© 2026 La parola giusta</div>
      <div class="piede-dati">Achille Pagliaro · Corsi ed ebook venduti tramite Skillplate</div>
    </div>
  </div>
</footer>
<!-- Statistiche GoatCounter: senza cookie, nessun dato personale raccolto. -->
<script data-goatcounter="https://laparolagiusta.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n` : ''}<script src="../js/sito.js" defer></script>
</body>
</html>
`;
}
const bollino = p => (p.esempio ? '<span class="post-esempio">Esempio</span>' : '');
const foto = (p, radice, classe) => {
  if (!p.immagine) return '';
  const m = misure(p.immagine);
  return `<span class="${classe}"><img decoding="async" loading="lazy"${m ? ` width="${m[0]}" height="${m[1]}"` : ''} src="${radice}${esc(p.immagine)}" alt=""></span>`;
};
const dataGrande = p => `<div class="post-data"><b>${p.g}</b><span>${MESI[p.me - 1]} ${p.a}</span></div>`;

// ---------------------------------------------------------------- uscita
const BLOG = join(REPO, 'blog');
const scritti = new Set(['index.html']);

// pagine dei post
post.forEach((p, i) => {
  const piuNuovo = post[i - 1], piuVecchio = post[i + 1];
  const corpoPagina = `<div class="testata-notte notte">
  ${CIELO}
  <span class="cadente" aria-hidden="true"></span>
  <div class="wrap stretto testata">
    <a class="torna-taccuino" href="./">← Il taccuino</a>
    <div class="etichetta"><time datetime="${p.data}">${p.giorno}</time> · ${p.minuti === 1 ? 'un minuto' : p.minuti + ' minuti'} di lettura</div>
    <h1>${riga(p.titolo)}</h1>
    <p class="occhio">${riga(p.sommario)}</p>
  </div>
</div>
<main id="principale">
  <article class="wrap stretto articolo">
${p.esempio ? '    <p class="avviso-esempio">Post di esempio, composto con un testo già presente sul sito per mostrare come appare il taccuino. Va tolto prima della pubblicazione.</p>\n' : ''}${p.immagine ? '    ' + figura(p.immagine, '', 'articolo-foto') + '\n' : ''}${p.html}
    <p class="articolo-firma">Achille Pagliaro</p>
  </article>
  <div class="wrap stretto articolo-coda">
    <nav class="vicini" aria-label="Altri post">
      ${piuVecchio ? `<a class="vicino" href="${piuVecchio.slug}.html"><span>← Il giorno prima</span><strong>${riga(piuVecchio.titolo)}</strong></a>` : '<span></span>'}
      ${piuNuovo ? `<a class="vicino dopo" href="${piuNuovo.slug}.html"><span>Il giorno dopo →</span><strong>${riga(piuNuovo.titolo)}</strong></a>` : '<span></span>'}
    </nav>
    <aside class="invito">
      <div>
        <div class="etichetta">Una email a settimana</div>
        <h2>Parole scelte con lentezza, una volta a settimana.</h2>
      </div>
      <a class="btn btn-blu" href="../#newsletter-settimanale">Iscriviti</a>
    </aside>
  </div>
</main>`;
  const ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.titolo, description: p.sommario, datePublished: p.data, inLanguage: 'it',
    mainEntityOfPage: `${SITO}blog/${p.slug}.html`, author: { '@type': 'Person', name: 'Achille Pagliaro', url: SITO + 'achillepagliaro.html' },
    publisher: { '@type': 'Organization', name: 'La Parola Giusta', url: SITO }, ...(p.immagine ? { image: SITO + p.immagine } : {}) };
  writeFileSync(join(BLOG, p.slug + '.html'), pagina({ titolo: `${p.titolo} — Il taccuino`, descrizione: p.sommario, percorso: p.slug + '.html', corpoPagina, tipoOg: 'article', immagine: p.immagine, ld, indicizza: !p.esempio }));
  scritti.add(p.slug + '.html');
});

// calendario: un mese per ogni mese che ha almeno un post, dal piu' recente
function calendario() {
  const mesi = [...new Set(post.map(p => p.data.slice(0, 7)))];
  return mesi.map(m => {
    const [a, me] = m.split('-').map(Number);
    const giorni = new Date(Date.UTC(a, me, 0)).getUTCDate();
    const primo = (new Date(Date.UTC(a, me - 1, 1)).getUTCDay() + 6) % 7;   // lunedi' = 0
    let celle = '<li class="vuoto" aria-hidden="true"></li>'.repeat(primo);
    for (let g = 1; g <= giorni; g++) {
      const p = post.find(x => x.a === a && x.me === me && x.g === g);
      celle += p ? `<li><a href="${p.slug}.html" title="${esc(p.titolo)}" aria-label="${g} ${MESI[me - 1]}: ${esc(p.titolo)}">${g}</a></li>` : `<li><span>${g}</span></li>`;
    }
    const quanti = post.filter(x => x.a === a && x.me === me).length;
    return `      <div class="mese">
        <h2 class="mese-nome">${maiuscola(MESI[me - 1])} ${a} <span>${quanti === 1 ? 'una pagina' : quanti + ' pagine'}</span></h2>
        <ol class="mese-settimana" aria-hidden="true"><li>L</li><li>M</li><li>M</li><li>G</li><li>V</li><li>S</li><li>D</li></ol>
        <ol class="mese-giorni">${celle}</ol>
      </div>`;
  }).join('\n');
}

// indice del taccuino
{
  const primo = post[0], altri = post.slice(1);
  const corpoPagina = `<div class="testata-notte notte">
  ${CIELO}
  <span class="cadente" aria-hidden="true"></span>
  <div class="wrap testata">
    <div class="etichetta">Il taccuino</div>
    <h1>Una pagina <em>al giorno</em>.</h1>
    <p class="occhio">Appunti brevi su come ci parliamo: una scena, una frase, un errore comune. Si leggono in un paio di minuti.</p>
  </div>
</div>
<main id="principale">
  <div class="wrap">
${primo ? `    <a class="post-primo${primo.immagine ? ' con-foto' : ''}" href="${primo.slug}.html">
      ${dataGrande(primo)}
      <div class="post-primo-testo">
        <div class="etichetta">L'ultima pagina ${bollino(primo)}</div>
        <h2>${riga(primo.titolo)}</h2>
        <p>${riga(primo.sommario)}</p>
        <span class="post-leggi">Leggi · ${primo.minuti} min →</span>
      </div>
      ${foto(primo, '../', 'post-foto')}
    </a>
    <div class="blog-due">
      <section class="calendario" aria-label="Calendario del taccuino">
${calendario()}
        <p class="calendario-nota">Ogni stella è una pagina: toccala per leggerla.</p>
      </section>
      <ol class="post-lista">
${altri.map(p => `        <li><a class="post-riga${p.immagine ? ' con-foto' : ''}" href="${p.slug}.html">
          ${dataGrande(p)}
          <div><h2>${riga(p.titolo)} ${bollino(p)}</h2><p>${riga(p.sommario)}</p><span class="post-leggi">Leggi · ${p.minuti} min →</span></div>
          ${foto(p, '../', 'post-foto')}
        </a></li>`).join('\n')}
      </ol>
    </div>` : '    <p class="blog-vuoto">La prima pagina arriva presto.</p>'}
  </div>
</main>`;
  const ld = { '@context': 'https://schema.org', '@type': 'Blog', name: 'Il taccuino — La Parola Giusta', url: SITO + 'blog/', inLanguage: 'it', author: { '@type': 'Person', name: 'Achille Pagliaro' } };
  writeFileSync(join(BLOG, 'index.html'), pagina({ titolo: 'Il taccuino — La Parola Giusta', descrizione: 'Una pagina al giorno di Achille Pagliaro sulla comunicazione: scene, frasi ed errori comuni, da leggere in un paio di minuti.', percorso: '', corpoPagina, ld }));
}

// feed RSS (senza gli esempi)
{
  const veri = post.filter(p => !p.esempio).slice(0, 30);
  const voci = veri.map(p => `  <item>
    <title>${esc(p.titolo)}</title>
    <link>${SITO}blog/${p.slug}.html</link>
    <guid>${SITO}blog/${p.slug}.html</guid>
    <pubDate>${new Date(Date.UTC(p.a, p.me - 1, p.g, 6)).toUTCString()}</pubDate>
    <description>${esc(p.sommario)}</description>
  </item>`).join('\n');
  writeFileSync(join(BLOG, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Il taccuino — La Parola Giusta</title>
  <link>${SITO}blog/</link>
  <description>Una pagina al giorno di Achille Pagliaro sulla comunicazione.</description>
  <language>it</language>
${voci}
</channel></rss>
`);
}

// pagine di post tolti: via
for (const f of readdirSync(BLOG)) if (f.endsWith('.html') && !scritti.has(f)) unlinkSync(join(BLOG, f));

// home: gli ultimi tre
{
  const f = join(REPO, 'index.html');
  let h = readFileSync(f, 'utf8');
  const re = /<!-- blog:inizio -->[\s\S]*?<!-- blog:fine -->/;
  if (!re.test(h)) throw new Error('in index.html mancano i commenti blog:inizio / blog:fine');
  const ultimi = post.slice(0, 3);
  const sezione = ultimi.length ? `<!-- blog:inizio -->
<section class="notte taccuino-sez" id="taccuino">
  ${CIELO}
  <div class="wrap">
    <div class="etichetta">Dal taccuino</div>
    <h2>Una pagina <em>al giorno</em>.</h2>
    <p class="intro">Appunti brevi su come ci parliamo. Si leggono in un paio di minuti.</p>
    <div class="dal-taccuino">
${ultimi.map(p => `      <a class="post-carta" href="blog/${p.slug}.html">
        ${foto(p, '', 'post-foto')}
        ${dataGrande(p)}
        <h3>${riga(p.titolo)}</h3>
        <p>${riga(p.sommario)}</p>
        <span class="post-leggi">Leggi · ${p.minuti} min →</span>
      </a>`).join('\n')}
    </div>
    <p class="taccuino-tutti"><a class="btn btn-linea" href="blog/">Apri il taccuino</a></p>
  </div>
</section>
<!-- blog:fine -->` : '<!-- blog:inizio -->\n<!-- blog:fine -->';
  h = h.replace(re, () => sezione);
  writeFileSync(f, h);
}

// sitemap: le voci del blog si riscrivono ogni volta (gli esempi restano fuori)
{
  const f = join(REPO, 'sitemap.xml');
  if (existsSync(f)) {
    let x = readFileSync(f, 'utf8').replace(/\s*<url>\s*<loc>https:\/\/laparolagiusta\.it\/blog\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
    const veri = post.filter(p => !p.esempio);
    if (veri.length) {
      const voci = [`  <url>\n    <loc>${SITO}blog/</loc>\n    <lastmod>${veri[0].data}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`,
        ...veri.map(p => `  <url>\n    <loc>${SITO}blog/${p.slug}.html</loc>\n    <lastmod>${p.data}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.5</priority>\n  </url>`)].join('\n');
      x = x.replace(/\s*<\/urlset>/, '\n' + voci + '\n</urlset>');
    }
    writeFileSync(f, x.endsWith('\n') ? x : x + '\n');
  }
}
console.log(`taccuino: ${post.length} post (${post.filter(p => p.esempio).length} di esempio)` + (post[0] ? ` · ultimo: ${post[0].giorno} — ${post[0].titolo}` : ''));
