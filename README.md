# La Parola Giusta

Sito statico di Achille Pagliaro, pubblicato con GitHub Pages
su https://aki1806-droid.github.io/laparolagiusta/

- `index.html` — home: La Parola Giusta (corsi, libri, ebook)
- `achillepagliaro.html` — i libri: Il Volo delle Radici, Mappe Silenziose, Eredità Invisibili
  - *Eredità Invisibili* su Amazon: `https://www.amazon.it/dp/8893606437` (ISBN 9788893606431). Sulla pagina autore il pulsante dice «Ordinalo su Amazon» fino al 19 novembre 2026 e «Acquista su Amazon» dal 20.
- `laparolagiusta.html` — reindirizzamento alla home, per il vecchio indirizzo
- `biglietto/` — biglietto da visita digitale, separato dal sito: non collegato dalle pagine, fuori dalla sitemap, con noindex

## Stile e script comuni

- `css/sito.css` — font, menu, cieli notturni, pulsanti, piede: lo caricano tutte le pagine
- `css/pagine.css` — componenti di home, ebook, corsi, omaggi, taccuino (la pagina autore ha i suoi)
- `js/sito.js` — menu su telefono, comparse, sezioni interattive (bussola, costellazione, volto, calendario)

## Le pagine dei libri

`ilvolodelleradici.html` e `mappesilenziose.html` le scrive `node strumenti/libri.mjs` (testi e dati sono dentro lo script). Le venticinque tappe di *Mappe Silenziose*, una per capitolo, ognuna con il suo esercizio, stanno in `strumenti/tappe-mappe.mjs`: per cambiarne una si modifica lì e si rilancia lo script.

## Il taccuino (blog)

Ogni post è un file di testo in `blog/_post/`, chiamato `AAAA-MM-GG-titolo-breve.md`:

```
---
titolo: Tre segnali in otto minuti
data: 2026-11-14
sommario: Una riga che invoglia a leggere.
immagine: img/blog/nome.webp
---
Testo del post, con una riga vuota tra i paragrafi.
```

`immagine` è facoltativa. Nel testo: `## titoletto`, `> citazione`, `- elenco`, `**grassetto**`, `*corsivo*`, `[link](https://…)`.

Per pubblicare un post nuovo: aggiungere il file, poi

```
node strumenti/blog.mjs
```

### Il post di ogni giorno

I post già scritti aspettano in `blog/_coda/`, numerati (`01-titolo-breve.md`, `02-…`), con la stessa intestazione dei post ma senza data e con in più una riga `prompt:` che descrive l'immagine. Ogni giorno:

1. `node strumenti/blog.mjs --prossimo` sposta il primo della coda tra i post con la data di oggi (ora italiana) e stampa il nome dell'immagine e il suo prompt. Se oggi c'è già un post non fa nulla; se la coda è vuota lo dice.
2. Si genera l'immagine con Higgsfield (modello `gpt_image_2_6`, formato 3:2) dal prompt, la si salva come `img/blog/<titolo-breve>.webp` (larghezza massima 1400 px).
3. `node strumenti/blog.mjs` ricostruisce il taccuino: l'immagine viene presa da sola se il file esiste.
4. Si controlla la pagina, si fa il commit e si pubblica.

### L'esercizio dentro il post

Ogni post ha un esercizio interattivo, scritto nel testo come blocco:

```
:::scegli Che cosa ne fai?
- Una risposta possibile | Che cosa succede se scegli questa
- Un'altra risposta | …
:::
```

I tipi sono undici, descritti in testa a `strumenti/esercizi.mjs`: `scegli` (risposte tra cui scegliere), `carte` (carte da girare: `- davanti | dietro`), `misura` (cursore da 0 a 10: `:::misura Domanda | da | a` e righe `- 0-3 | testo`), `domanda` (campo dove scrivere, resta sul dispositivo di chi legge), `respiro` (un cerchio che conta i secondi: `:::respiro 60 | Invito`, e sotto la frase finale), `tieni` (tenere premuto per rivelare una frase), `conta` (un tocco alla volta), `rallenta` (una frase che corre finché non la si ferma), `spegni` (interruttori), `cancella` (voci da togliere), `passi` (un passo alla volta). Nell'intestazione, `libro: eredita | volo | mappe` (o il nome di una scheda ebook) aggiunge in fondo la scheda del libro; `oggetto:` è l'oggetto dell'email.

### L'email della settimana

Ai 40 iscritti della lista SendFox «La Parola Giusta» (id 671866) va una sola email a settimana, il giovedì alle 8:00, mittente Achille Pagliaro <info@laparolagiusta.it>: è la serie «Una pagina alla settimana» (la n. 1 è del 5/11/2026, la n. 2 del 12/11). Le altre liste dell'account sono del lavoro sindacale e non vanno mai usate.

1. Si sceglie il post migliore degli ultimi sette giorni.
2. `node strumenti/blog.mjs --settimanale <titolo-breve> <numero>` scrive `blog/_email/settimana.html` (il post per intero, l'esercizio come invito a farlo sul sito, i link agli altri post della settimana) e `settimana.json` (titolo interno, oggetto, anteprima, lista, mittente).
3. In SendFox: si crea la campagna con quei dati e la si programma per il giovedì alle 8:00. Le immagini dell'email sono quelle del sito: il post deve essere già online.

Stile delle immagini: natura morta fotografica in luce calda da finestra, blu notte, panna e oro, nessuna persona, nessuna scritta.

Lo script riscrive `blog/index.html`, le pagine dei post, `blog/feed.xml`, gli ultimi tre post in home e le voci del blog in `sitemap.xml`. Le pagine dentro `blog/` non vanno modificate a mano: si rigenerano. I post con `esempio: si` servono solo per l'anteprima; `node strumenti/blog.mjs --senza-esempi` li lascia fuori.

## Salvataggio del sito precedente

Il sito com'era online il 15 novembre 2026, prima del sito nuovo, è nel ramo
`salvataggio/sito-attuale-2026-11-15` (commit `91aebb6`). Quel ramo non va mai modificato né cancellato.
Per tornare a quella versione dopo la pubblicazione del sito nuovo si riporta `main` al contenuto di quel ramo
con un nuovo commit (senza riscrivere la storia): il sito torna com'era in un paio di minuti.
