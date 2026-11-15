// Scrive le due pagine dedicate ai libri (Il Volo delle Radici, Mappe Silenziose).
// I testi vengono dalla pagina autore e dalle prime pagine che il sito gia' regala.
// uso: node strumenti/libri.mjs     (prende lo stile di base e il piede da una scheda ebook gia' nel sito)
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { gioco } from './esercizi.mjs';
import { TAPPE } from './tappe-mappe.mjs';
const REPO = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const riga = t => esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
const SITO = 'https://laparolagiusta.it/';
const base = readFileSync(`${REPO}/ilvoltononmente.html`, 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1].trim();
const piede = readFileSync(`${REPO}/ilvoltononmente.html`, 'utf8').match(/<footer class="fondo[\s\S]*?<\/footer>/)[0];
const CIELO = '\n  <div class="cielo" aria-hidden="true"><i></i><i></i></div>';
const AUTORE = { '@type': 'Person', '@id': SITO + '#autore', name: 'Achille Pagliaro', url: SITO + 'achillepagliaro.html' };

function pagina(l) {
  const url = SITO + l.file;
  const ld = { '@context': 'https://schema.org', '@type': 'Book', '@id': url + '#libro', name: l.titolo, author: AUTORE, inLanguage: 'it', url, image: SITO + l.copertina, description: l.descrizione, ...(l.sottotitolo && l.sottotitoloVero ? { alternativeHeadline: l.sottotitolo } : {}) };
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${l.titolo} — Achille Pagliaro</title>
<meta name="description" content="${l.descrizione}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#12294A">
<meta name="author" content="Achille Pagliaro">
<meta property="og:type" content="book">
<meta property="og:site_name" content="La Parola Giusta">
<meta property="og:locale" content="it_IT">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${l.titolo} — Achille Pagliaro">
<meta property="og:description" content="${l.descrizione}">
<meta property="og:image" content="${SITO}img/social/achillepagliaro-og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" href="fonts/cormorant-garamond-300-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/jost-300-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>
${base}
</style>
<link rel="stylesheet" href="css/sito.css">
<link rel="stylesheet" href="css/pagine.css">
</head>
<body class="p-libro">

<a class="salta" href="#principale">Vai al contenuto</a>

<nav class="nav">
  <div class="wrap nav-in">
    <a class="marchio" href="./"><img decoding="async" width="440" height="386" src="img/c5acd835.webp" alt=""><span>La Parola Giusta</span></a>
    <div class="nav-menu">
      <a class="ritorno" href="./">Home</a>
      <a href="achillepagliaro.html">I tre libri</a>
      <a href="#${l.giocoId}">${l.giocoNome}</a>
${(l.nav || []).map(n => `      <a href="${n[0]}">${n[1]}</a>\n`).join('')}      <a href="#estratto">Un assaggio</a>
      <a class="nav-btn" href="#acquista">Acquista</a>
    </div>
  </div>
</nav>

<header class="hero notte" id="top">${CIELO}
  <span class="cadente" aria-hidden="true"></span>
  <div class="wrap hero-grid">
    <div>
      <div class="etichetta">${l.etichetta}</div>
      <h1>${l.titolo}</h1>
      <div class="sottotitolo">${l.sottotitolo}</div>
      <p class="occhio">${l.occhio}</p>
      <div class="hero-azioni">
        <a class="btn btn-blu" href="${l.amazon}">Acquista su Amazon</a>
        <a class="btn btn-linea" href="prime-pagine.html">Leggi le prime pagine</a>
      </div>
      <div class="dati">
${l.dati.map(x => `        <span>${x}</span>`).join('\n')}
      </div>
    </div>
    <div class="cop"><img decoding="async" width="${l.cw}" height="${l.ch}" src="${l.copertina}" alt="Copertina di ${l.titolo}"></div>
  </div>
</header>

<div id="principale"></div><section class="notte" id="${l.giocoId}">${CIELO}
  <div class="wrap">
    <div class="etichetta">Prova tu</div>
    <h2>${l.giocoTitolo}</h2>
    <p class="intro">${l.giocoIntro}</p>
${l.gioco}
  </div>
</section>

${l.extra || ''}<section class="tinta">
  <div class="wrap stretto">
    <div class="etichetta">Cosa trovi</div>
    <h2>${l.trovaTitolo}</h2>
    <ul class="elenco">
${l.trova.map(x => `      <li>${x}</li>`).join('\n')}
    </ul>
    <div class="ideale-libro"><b>Ideale per chi</b>${l.ideale}</div>
  </div>
</section>

<section id="estratto">
  <div class="wrap stretto">
    <div class="etichetta">Un assaggio</div>
    <h2>${l.estrattoTitolo}</h2>
    <div class="estratto">
      <div class="fonte">${l.estrattoFonte}</div>
${l.estratto.map(x => `      <p>${x}</p>`).join('\n')}
    </div>
    <p style="margin-top:30px"><a class="btn btn-oro" href="prime-pagine.html">Ricevi gratis le prime pagine</a></p>
  </div>
</section>

<section class="tinta">
  <div class="wrap">
    <div class="etichetta">Tre libri, un solo viaggio</div>
    <h2>Gli altri due movimenti</h2>
    <div class="trilogia">
${l.altri.map(a => `      <a href="${a.href}"><img decoding="async" loading="lazy" width="${a.w}" height="${a.h}" src="${a.img}" alt=""><div><span>${a.mov}</span><strong>${a.titolo}</strong><em>${a.riga}</em></div></a>`).join('\n')}
    </div>
  </div>
</section>

<section class="chiusura notte" id="acquista">${CIELO}
  <div class="wrap">
    <p class="pull">${l.chiusa}</p>
    <p>${l.chiusaRiga}</p>
    <a class="btn btn-blu" href="${l.amazon}">Acquista su Amazon</a>
  </div>
</section>

${piede}

<!-- Statistiche GoatCounter: senza cookie, nessun dato personale raccolto. -->
<script data-goatcounter="https://laparolagiusta.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script src="js/sito.js" defer></script>
</body>
</html>
`;
}

const VOLO = { href: 'ilvolodelleradici.html', img: 'img/copertina-di-il-volo-delle-radici.webp', w: 700, h: 1244, mov: 'Primo movimento · dal basso verso l\'alto', titolo: 'Il Volo delle Radici', riga: 'Come si fa a volare senza tradire le proprie radici.' };
const MAPPE = { href: 'mappesilenziose.html', img: 'img/copertina-di-mappe-silenziose.webp', w: 700, h: 974, mov: 'Secondo movimento · nel quotidiano', titolo: 'Mappe Silenziose', riga: 'Venticinque tappe brevi per non perdersi nel presente.' };
const EREDITA = { href: 'achillepagliaro.html#eredita', img: 'img/copertina-di-eredita-invisibili.webp', w: 700, h: 994, mov: 'Terzo movimento · dai figli ai padri', titolo: 'Eredità Invisibili', riga: 'Credevo di crescerli. Mi stavano ricrescendo. Dal 20 novembre 2026.' };

const RADICI = [
  ['La casa', 'Genitori, fratelli, cugini e nonni sotto lo stesso tetto. La famiglia è il primo sistema di supporto, e resta unita davanti a ogni ostacolo.'],
  ['L\'alba', 'Genitori che si alzano all\'alba e rinunciano a qualcosa perché i figli possano studiare. L\'etica del lavoro passa dall\'esempio, prima che dalle parole.'],
  ['Il resto', 'Un padre trova del denaro in più nel resto e torna subito indietro a restituirlo. Essere onesti è agire con coerenza anche quando nessuno guarda.'],
  ['La porta', 'Durante le feste la casa resta aperta ai vicini meno fortunati, per dividere il poco che c\'è. La ricchezza si misura in quello che si riesce a dare.'],
  ['Il mare', 'Il nonno pescatore e le lunghe giornate in barca. Il mare, come la vita, è imprevedibile: chiede osservazione attenta, pazienza e rispetto.'],
  ['La terra', 'Il nonno contadino che pianta, cura e raccoglie. Il risultato arriva da lontano: dipende dalla cura costante e dall\'attenzione ai dettagli.'],
];
const TERRITORI = [
  ['Il Rumore', 'Il frastuono costante di notifiche, scadenze e aspettative altrui, che finisce per soffocare la nostra voce.'],
  ['Il Tempo dell\'anima', 'Non quello dell\'orologio che ci tiranneggia, ma quello che ci nutre. Quando tutto è urgente, niente è davvero importante.'],
  ['Le Scelte', 'Il confine sottile tra ciò che facciamo perché dobbiamo e ciò che facciamo perché siamo chiamati a farlo.'],
  ['L\'Ascolto profondo', 'Sentire non solo con le orecchie ma con tutto l\'essere: i segnali che arrivano dal corpo prima che dalla mente.'],
  ['La Rivoluzione silenziosa', 'Una trasformazione che non fa rumore: non combatte il mondo, lo cambia dall\'interno, una scelta consapevole alla volta.'],
];

// Mappe Silenziose: i venticinque capitoli come mappa da percorrere, ognuno con il suo esercizio
const SEZIONE_TAPPE = `<section id="tappe">
  <div class="wrap">
    <div class="etichetta">Il viaggio</div>
    <h2>Venticinque tappe, <em>una alla volta</em>.</h2>
    <p class="intro">«Come le venticinque ore di un giorno vissuto pienamente»: sono i venticinque capitoli del libro. Ognuno ha qui un gesto da provare subito. Tocca un numero sulla mappa.</p>
    <div class="tappe">
      <ol class="tappe-elenco">
${TAPPE.map((t, i) => `        <li>
          <div class="tappa-territorio">Tappa ${i + 1}</div>
          <h3>${riga(t.titolo)}</h3>
          <p class="tappa-riga">${riga(t.riga)}</p>
          ${gioco(t.gioco[0], t.gioco[1], t.gioco[2], riga, esc)}
        </li>`).join('\n')}
      </ol>
    </div>
  </div>
</section>

`;
if (TAPPE.length !== 25) throw new Error('le tappe devono essere 25, sono ' + TAPPE.length);

const libri = [{
  file: 'ilvolodelleradici.html', titolo: 'Il Volo delle Radici', etichetta: 'Libro · primo movimento', sottotitolo: 'Come si fa a volare senza tradire le proprie radici?', sottotitoloVero: false,
  descrizione: 'Il Volo delle Radici di Achille Pagliaro: appartenenza e libertà, famiglia e futuro, tra storie di nonni, genitori, campi e mare. Su Amazon in Kindle e cartaceo.',
  occhio: 'Parla di appartenenza e libertà, famiglia e futuro, memorie e scelte. Si muove tra storie di nonni, genitori, campi, mare, e la tensione fra restare e partire.',
  amazon: 'https://www.amazon.it/Volo-delle-Radici-trasformazione-spirituale-ebook/dp/B0CY9Y987M', dati: ['Cartaceo ed ebook', 'Su Amazon', 'Prime pagine gratis'],
  copertina: 'img/copertina-di-il-volo-delle-radici.webp', cw: 700, ch: 1244,
  giocoId: 'albero', giocoNome: 'L\'albero', giocoTitolo: 'Più scendono le radici, <em>più sale il volo</em>.',
  giocoIntro: 'Il libro parte da qui: una casa piena, un padre, due nonni. Sono sei insegnamenti, e ognuno regge un ramo.',
  gioco: `    <div class="albero">
      <ol class="radici-elenco">
${RADICI.map(r => `        <li><h3>${r[0]}</h3><p>${r[1]}</p></li>`).join('\n')}
      </ol>
      <blockquote class="albero-volo">«Le nostre radici non sono catene che ci tengono a terra, ma ali che ci permettono di spiccare il volo.»</blockquote>
    </div>`,
  trovaTitolo: 'Un libro per chi si sente diviso tra restare e partire',
  trova: ['Storie di famiglia che non sono favole, ma luoghi in cui riconoscersi', 'Il coraggio di guardare le tue radici senza idealizzarle né rinnegarle', 'Una libertà che non rompe i legami, ma li rinnova', 'Domande scomode e liberanti su chi sei e dove vuoi andare'],
  ideale: 'si sente diviso tra ciò che dovrebbe fare e ciò che desidera davvero, e cerca il coraggio di spiccare il volo senza tradire da dove viene.',
  estrattoTitolo: 'Il carretto della frutta', estrattoFonte: 'Dalla prefazione',
  estratto: ['Ricordo come fosse ieri le estati trascorse ad aiutare mio nonno con il suo «carretto della frutta» ambulante. Sotto il sole cocente, imparavo non solo l\'arte del commercio, ma lezioni di vita che avrebbero plasmato il mio futuro.',
    'L\'integrità nel pesare sempre con onestà, anche quando nessuno guardava. La gentilezza nel servire con un sorriso, anche dopo ore di lavoro estenuante. La pazienza nell\'ascoltare le storie dei clienti anziani, anche quando la fila si allungava.',
    'Queste lezioni sono diventate le radici profonde che mi hanno ancorato nei momenti di tempesta.'],
  altri: [MAPPE, EREDITA],
  chiusa: 'Sei pronto a far volare le tue radici?', chiusaRiga: 'Il Volo delle Radici è su Amazon, in Kindle e in cartaceo.',
}, {
  file: 'mappesilenziose.html', titolo: 'Mappe Silenziose', etichetta: 'Libro · secondo movimento', sottotitolo: 'Ritrovare il proprio tempo nel mondo che corre', sottotitoloVero: true,
  descrizione: 'Mappe Silenziose di Achille Pagliaro: venticinque tappe brevi per non perdersi nel presente, tra rumore, fretta e tempo dell\'anima. Su Amazon in cartaceo ed ebook.',
  occhio: 'Nasce da una domanda di mio figlio: «Papà, hai scritto di dove veniamo. Ma come facciamo a non perderci mentre andiamo?» La risposta è un manuale di navigazione per il presente.',
  amazon: 'https://www.amazon.it/Mappe-silenziose-Ritrovare-proprio-tempo/dp/8893606143', dati: ['25 tappe brevi', '15 minuti a capitolo', 'Cartaceo ed ebook'],
  copertina: 'img/copertina-di-mappe-silenziose.webp', cw: 700, ch: 974,
  nav: [['#tappe', 'Le 25 tappe']], extra: SEZIONE_TAPPE,
  giocoId: 'silenzio', giocoNome: 'Il silenzio', giocoTitolo: 'Trentasette notifiche. <em>Poi il silenzio.</em>',
  giocoIntro: 'Il libro comincia da una mattina così: trentasette notifiche prima ancora di alzarsi dal letto. Tieni premuto il cerchio e guarda che cosa resta.',
  gioco: `    <div class="silenzio">
      <blockquote class="silenzio-detto">«Le verità più profonde non si urlano, si sussurrano.»</blockquote>
      <div class="territori">
        <ol>
${TERRITORI.map(r => `          <li><h3>${r[0]}</h3><p>${r[1]}</p></li>`).join('\n')}
        </ol>
      </div>
    </div>`,
  trovaTitolo: 'Un libro per chi è stanco di correre',
  trova: ['Il territorio del rumore che ti allontana da te stesso', 'Il tempo dell\'anima, diverso dall\'orologio e dalle scadenze', 'Il silenzio come prima frontiera di una rivoluzione personale', 'Isole di presenza nella vita digitale e familiare', 'Storie di corsia, di famiglie, di nonni e di bambini'],
  ideale: 'è stanco di notifiche e urgenze, vuole imparare a dire «non ora» al mondo, o sente che il burnout è già cominciato.',
  estrattoTitolo: 'Il rumore e la bussola', estrattoFonte: 'Dalla prefazione',
  estratto: ['Non troverete qui ricette per correre più veloci: il mondo ne è già saturo. Non troverete tecniche per fare di più in meno tempo: quella è la malattia, non la cura. Non troverete nemmeno l\'invito a ritirarvi dal mondo, perché la saggezza non sta nella fuga ma nell\'abitare consapevolmente.',
    'Troverete invece il racconto di un viaggio diverso: quello di chi ha scelto di rallentare in un mondo che accelera, di sostare dove tutti corrono, di ascoltare dove tutti urlano.'],
  altri: [VOLO, EREDITA],
  chiusa: 'La mappa si disegna ad ogni passo.', chiusaRiga: 'Mappe Silenziose è su Amazon, in cartaceo ed ebook. Un capitolo si legge in quindici minuti.',
}];
for (const l of libri) { writeFileSync(`${REPO}/${l.file}`, pagina(l)); console.log('scritta', l.file); }
